"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRepairOrders } from "@/context/RepairOrderContext";
import { Clock, Activity, CheckCircle, AlertTriangle } from "lucide-react";
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
  const { 
    repairOrders, 
    refreshOrders 
  } = useRepairOrders();
  
  const [timeRange, setTimeRange] = useState<"day" | "week" | "month" | "year">("week");
  const [techPerformance, setTechPerformance] = useState<TechnicianPerformance[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataRefreshed, setDataRefreshed] = useState(false);

  // Force refresh the data ONCE on component mount (not on every render)
  useEffect(() => {
    if (!dataRefreshed) {
      refreshOrders();
      setDataRefreshed(true);
    }
  }, [refreshOrders, dataRefreshed]);

  // Fetch technicians from Supabase
  useEffect(() => {
    const fetchTechnicians = async () => {
      try {
        setIsLoading(true);
        
        // Fetch technicians from users table
        const { data, error } = await supabase
          .from('users')
          .select('id, auth_id, name, email, role')
          .eq('role', 'technician');
        
        if (error) {
          console.error('Error fetching technicians:', error);
          setError("Failed to fetch technicians");
        } else if (data && data.length > 0) {
          console.log(`Successfully fetched ${data.length} technicians`);
          setTechnicians(data);
        } else {
          console.warn('No technicians found in users table');
          
          // If we can't get technicians from the users table, try to extract them from repair orders
          const techIds = new Set<string>();
          
          repairOrders.forEach(order => {
            if (order.assignedTo) {
              techIds.add(order.assignedTo);
            }
          });
          
          if (techIds.size > 0) {
            const extractedTechs = Array.from(techIds).map(id => ({
              id,
              auth_id: id,
              name: `Technician ${id.substring(0, 4)}`, // Use abbreviated ID as name
              email: `tech_${id.substring(0, 4)}@example.com`,
              role: 'technician'
            }));
            
            console.log(`Extracted ${extractedTechs.length} technicians from repair orders`);
            setTechnicians(extractedTechs);
          } else {
            setError("No technicians found. Please add technician users first.");
          }
        }
      } catch (err) {
        console.error('Error in fetchTechnicians:', err);
        setError("An unexpected error occurred while fetching technicians");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTechnicians();
  }, [repairOrders]); // Only re-run when repairOrders changes

  // Helper to get a technician's name by id
  const getTechnicianName = useCallback((technicianId?: string) => {
    if (!technicianId) return 'Unknown';
    const tech = technicians.find(t => 
      t.id === technicianId || 
      t.auth_id === technicianId
    );
    return tech ? tech.name : `Tech ${technicianId.substring(0, 6)}`;
  }, [technicians]);
  
  // Process data for metrics
  useEffect(() => {
    // Make sure we have repairOrders data
    if (!repairOrders || !Array.isArray(repairOrders) || repairOrders.length === 0) {
      console.log('No repair orders available yet');
      return;
    }

    if (!technicians || technicians.length === 0) {
      console.log('No technicians available yet');
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
        // Get completed orders in the date range
        const completedOrders = repairOrders.filter(order => {
          if (order.status !== 'completed') return false;
          if (!order.assignedTo) return false; // Skip orders with no assignedTo
          
          // If completedAt is available, use it to filter by date
          if (order.completedAt) {
            const completedDate = new Date(order.completedAt);
            return completedDate >= startDate && completedDate <= endDate;
          }
          
          // For orders without completedAt but with updatedAt, use that
          if (order.updatedAt) {
            const updatedDate = new Date(order.updatedAt);
            return updatedDate >= startDate && updatedDate <= endDate;
          }
          
          return false;
        });
        
        console.log(`Found ${completedOrders.length} completed orders with assignedTo in date range`);
        
        // Group by technician
        const techStats: Record<string, TechnicianPerformance> = {};
        
        // Initialize stats for all technicians to ensure we show everyone
        technicians.forEach(tech => {
          techStats[tech.id] = {
            technicianId: tech.id,
            technicianName: tech.name,
            completedCount: 0,
            totalTimeMs: 0,
            averageTimeMs: 0,
            averageMinutes: 0
          };
        });
        
        completedOrders.forEach(order => {
          const technicianId = order.assignedTo;
          
          if (!technicianId) return;
          
          // Create entry if technician doesn't exist yet
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
          
          // Calculate time to complete if we have both timestamps
          if (order.assignedAt && (order.completedAt || order.updatedAt)) {
            const startTime = new Date(order.assignedAt).getTime();
            const endTime = order.completedAt 
              ? new Date(order.completedAt).getTime() 
              : new Date(order.updatedAt as string).getTime();
            
            const timeToComplete = endTime - startTime;
            
            if (timeToComplete > 0) {
              techStats[technicianId].completedCount += 1;
              techStats[technicianId].totalTimeMs += timeToComplete;
            } else {
              // Just count it without timing data if times are invalid
              techStats[technicianId].completedCount += 1;
            }
          } else {
            // Just count it without timing data
            techStats[technicianId].completedCount += 1;
          }
        });
        
        // Calculate averages
        Object.values(techStats).forEach((stat) => {
          if (stat.completedCount > 0 && stat.totalTimeMs > 0) {
            stat.averageTimeMs = Math.round(stat.totalTimeMs / stat.completedCount);
            // Convert to minutes for display
            stat.averageMinutes = Math.round(stat.averageTimeMs / (1000 * 60));
          }
        });
        
        // Convert to array and sort by completed count (highest first)
        return Object.values(techStats)
          .sort((a, b) => b.completedCount - a.completedCount);
      };
      
      const performanceData = calculateTechPerformance();
      console.log('Performance data calculated:', performanceData);
      setTechPerformance(performanceData);
      
    } catch (error) {
      console.error('Error processing performance data:', error);
      setError("Failed to process performance data");
      setTechPerformance([]);
    }
  }, [timeRange, repairOrders, technicians, getTechnicianName]);

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

  if (isLoading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-8 w-64 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 w-32 bg-gray-200 rounded"></div>
        </div>
        <p className="mt-4 text-gray-500">Loading performance data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <div className="flex flex-col items-center text-red-500">
          <AlertTriangle className="h-12 w-12 mb-4" />
          <h2 className="text-xl font-bold mb-2">Error Loading Data</h2>
          <p>{error}</p>
        </div>
      </div>
    );
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Total Technicians</p>
              <p className="text-3xl font-semibold text-gray-900">{technicians.length}</p>
            </div>
            <div className="p-3 rounded-full bg-blue-100 text-blue-800">
              <Users className="h-6 w-6" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Completed Orders</p>
              <p className="text-3xl font-semibold text-gray-900">
                {techPerformance.reduce((total, tech) => total + tech.completedCount, 0)}
              </p>
            </div>
            <div className="p-3 rounded-full bg-green-100 text-green-800">
              <CheckCircle className="h-6 w-6" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Avg. Completion Time</p>
              <p className="text-3xl font-semibold text-gray-900">
                {techPerformance.some(tech => tech.completedCount > 0 && tech.averageMinutes > 0) 
                  ? Math.round(
                      techPerformance.reduce((sum, tech) => sum + (tech.averageMinutes * tech.completedCount), 0) / 
                      Math.max(techPerformance.reduce((total, tech) => total + (tech.averageMinutes > 0 ? tech.completedCount : 0), 0), 1)
                    )
                  : 0}m
              </p>
            </div>
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-800">
              <Clock className="h-6 w-6" />
            </div>
          </div>
        </div>
      </div>
      
      {/* Performance Overview */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold mb-4">Technician Performance Overview</h2>
        
        {techPerformance.length === 0 || techPerformance.every(tech => tech.completedCount === 0) ? (
          <p className="text-gray-500 text-center py-8">No completed orders available for the selected time period</p>
        ) : (
          <div>
            {/* Chart area with fixed height */}
            <div className="flex items-end border-l border-b border-gray-300 h-64 pt-8 mb-4">
              {techPerformance
                .filter(tech => tech.completedCount > 0) // Only show techs with completed orders
                .slice(0, 10) // Limit to top 10 to prevent overcrowding
                .map((tech, index) => {
                  // Calculate bar height - proportional to the chart height
                  const barHeight = maxCompletedCount > 0 
                    ? Math.max((tech.completedCount / maxCompletedCount) * 180, 5) 
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
                          height: `${barHeight}px`,
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
              {techPerformance
                .filter(tech => tech.completedCount > 0)
                .slice(0, 10)
                .map((tech, index) => (
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

// Users icon component
const Users = (props) => {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
};

export default Performance;