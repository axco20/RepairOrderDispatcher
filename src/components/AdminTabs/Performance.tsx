"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRepairOrders } from "@/context/RepairOrderContext";
import { Clock } from "lucide-react";
import { supabase } from '@/lib/supabaseClient';

// Hydration fix hook
function useHydration() {
  const [isHydrated, setIsHydrated] = useState(false);
  
  useEffect(() => {
    setIsHydrated(true);
  }, []);
  
  return isHydrated;
}

interface Technician {
  id: string;
  auth_id: string;
  name: string;
  email: string;
  role: string;
}

// Create a proper interface for technician performance data
interface TechnicianPerformance {
  technicianId: string;
  technicianName: string;
  completedCount: number;
  totalTimeMs: number;
  averageTimeMs: number;
  averageMinutes: number;
}

const Performance: React.FC = () => {
  const isHydrated = useHydration();
  const { repairOrders = [], assignments = [] } = useRepairOrders();
  const [timeRange, setTimeRange] = useState<"day" | "week" | "month" | "year">("week");
  const [techPerformance, setTechPerformance] = useState<TechnicianPerformance[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  
  // Fetch technicians from Supabase
  useEffect(() => {
    const fetchTechnicians = async () => {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('role', 'technician');

        if (error) {
          console.error('Error fetching technicians:', error);
        } else if (data) {
          setTechnicians(data);
        }
      } catch (err) {
        console.error('Error in fetchTechnicians:', err);
      }
    };
    
    fetchTechnicians();
  }, []);

  // Helper to get a technician's name by auth_id - using useCallback to memoize
  const getTechnicianName = useCallback((technicianId?: string) => {
    if (!technicianId) return 'Unknown';
    const tech = technicians.find(t => t.id === technicianId || t.auth_id === technicianId);
    return tech ? tech.name : 'Unknown';
  }, [technicians]);
  
  // Process data for metrics
  useEffect(() => {
    // Guard against missing data
    if (!assignments || !Array.isArray(assignments)) {
      console.log('No assignments data available');
      return;
    }
    
    try {
      // Get date range based on selected time period
      const getDateRange = () => {
        const now = new Date();
        const endDate = now;
        const startDate = new Date();
        
        switch(timeRange) {
          case "day":
            startDate.setHours(0, 0, 0, 0);
            break;
          case "week":
            startDate.setDate(startDate.getDate() - 7);
            break;
          case "month":
            startDate.setMonth(startDate.getMonth() - 1);
            break;
          case "year":
            startDate.setFullYear(startDate.getFullYear() - 1);
            break;
        }
        
        return { startDate, endDate };
      };
      
      const { startDate, endDate } = getDateRange();
      
      // Calculate technician performance
      const calculateTechPerformance = () => {
        // Get completed assignments in the date range
        const relevantAssignments = assignments.filter(assignment => {
          if (!assignment.completedAt) return false;
          const completedDate = new Date(assignment.completedAt);
          return completedDate >= startDate && completedDate <= endDate;
        });
        
        // Group by technician
        const techStats: Record<string, TechnicianPerformance> = {};
        
        relevantAssignments.forEach(assignment => {
          const { technicianId, assignedAt, completedAt } = assignment;
          
          if (!technicianId) return;
          
          if (!techStats[technicianId]) {
            techStats[technicianId] = {
              technicianId,
              technicianName: getTechnicianName(technicianId),
              completedCount: 0,
              totalTimeMs: 0,
              averageTimeMs: 0,
              averageMinutes: 0
            };
          }
          
          // Calculate time to complete
          if (assignedAt && completedAt) {
            const startTime = new Date(assignedAt).getTime();
            const endTime = new Date(completedAt).getTime();
            const timeToComplete = endTime - startTime;
            
            techStats[technicianId].completedCount += 1;
            techStats[technicianId].totalTimeMs += timeToComplete;
          }
        });
        
        // Calculate averages
        Object.values(techStats).forEach((stat) => {
          if (stat.completedCount > 0) {
            stat.averageTimeMs = Math.round(stat.totalTimeMs / stat.completedCount);
            // Convert to minutes for display
            stat.averageMinutes = Math.round(stat.averageTimeMs / (1000 * 60));
          }
        });
        
        // Convert to array and sort by completed count
        return Object.values(techStats).sort((a, b) => b.completedCount - a.completedCount);
      };
      
      const performanceData = calculateTechPerformance();
      setTechPerformance(performanceData);
      
    } catch (error) {
      console.error('Error processing performance data:', error);
      setTechPerformance([]);
    }
  }, [timeRange, assignments, getTechnicianName]);

  // Function to get current workload for a technician
  const getCurrentWorkload = useCallback((technicianId: string) => {
    if (!repairOrders || !Array.isArray(repairOrders)) return 0;
    
    return repairOrders.filter(
      order => order.assignedTo === technicianId && order.status === 'in_progress'
    ).length;
  }, [repairOrders]);

  // Calculate max values for scaling
  const maxCompletedCount = Math.max(...(techPerformance || []).map(tech => tech.completedCount || 0), 1);

  // Return a simple loading state if the component is not yet hydrated
  if (!isHydrated) {
    return <div className="p-6">Loading performance data...</div>;
  }

  return (
    <div className="space-y-8 p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Technician Performance</h1>
          <p className="text-gray-500">Performance metrics for your technical team</p>
        </div>
        
        {/* Time Range Selector */}
        <div className="inline-flex rounded-md shadow-sm" role="group">
          <button
            type="button"
            onClick={() => setTimeRange("day")}
            className={`px-4 py-2 text-sm font-medium rounded-l-lg ${
              timeRange === "day" 
                ? "text-white bg-indigo-600" 
                : "text-gray-900 bg-white hover:bg-gray-100"
            }`}
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => setTimeRange("week")}
            className={`px-4 py-2 text-sm font-medium ${
              timeRange === "week" 
                ? "text-white bg-indigo-600" 
                : "text-gray-900 bg-white hover:bg-gray-100"
            }`}
          >
            Week
          </button>
          <button
            type="button"
            onClick={() => setTimeRange("month")}
            className={`px-4 py-2 text-sm font-medium ${
              timeRange === "month" 
                ? "text-white bg-indigo-600" 
                : "text-gray-900 bg-white hover:bg-gray-100"
            }`}
          >
            Month
          </button>
          <button
            type="button"
            onClick={() => setTimeRange("year")}
            className={`px-4 py-2 text-sm font-medium rounded-r-lg ${
              timeRange === "year" 
                ? "text-white bg-indigo-600" 
                : "text-gray-900 bg-white hover:bg-gray-100"
            }`}
          >
            Year
          </button>
        </div>
      </div>
      
      {/* Performance Overview */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold mb-4">Technician Performance Overview</h2>
        
        {techPerformance.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No data available for the selected time period</p>
        ) : (
          <div>
            {/* Chart area with fixed height */}
            <div className="flex items-end border-l border-b border-gray-300 h-64 pt-8 mb-4">
              {techPerformance.map((tech, index) => {
                // Calculate bar height - make sure it's proportional to the chart height
                const barHeight = maxCompletedCount > 0 
                  ? Math.max((tech.completedCount / maxCompletedCount) * 100, 0) 
                  : 0;
                  
                return (
                  <div key={index} className="flex flex-col items-center mx-2 flex-1">
                    {/* Bar count label */}
                    {tech.completedCount > 0 && (
                      <div className="text-xs font-medium text-gray-700 mb-1">
                        {tech.completedCount}
                      </div>
                    )}
                    
                    {/* The actual bar */}
                    <div
                      className="w-full bg-green-600 rounded-t-sm"
                      style={{
                        height: `${barHeight}%`,
                        minHeight: tech.completedCount > 0 ? '4px' : '0'
                      }}
                    ></div>
                    
                    {/* Show avg time below bar */}
                    <div className="flex items-center mt-2 text-xs text-gray-600">
                      <Clock className="h-3 w-3 mr-1" />
                      <span>{tech.averageMinutes || 0}m</span>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* X-axis labels */}
            <div className="flex mb-6">
              {techPerformance.map((tech, index) => (
                <div key={index} className="flex-1 text-xs text-gray-500 text-center truncate px-1">
                  {tech.technicianName}
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="text-center">
          <p className="text-sm text-gray-500">
            Performance data for the {timeRange === 'day' ? 'current day' : 
             timeRange === 'week' ? 'past week' : 
             timeRange === 'month' ? 'past month' : 'past year'}
          </p>
        </div>
      </div>
      
      {/* Detailed Performance */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">Detailed Performance</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Technician
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Orders Completed
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avg. Time to Complete
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current Workload
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {techPerformance.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                    No data available for the selected time period
                  </td>
                </tr>
              ) : (
                techPerformance.map((tech, index) => {
                  const currentWorkload = getCurrentWorkload(tech.technicianId);
                  
                  return (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{tech.technicianName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{tech.completedCount}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{tech.averageMinutes || 0} minutes</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{currentWorkload} orders</div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Performance;