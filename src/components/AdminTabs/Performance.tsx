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
  const { repairOrders, refreshOrders } = useRepairOrders();
  
  const [timeRange, setTimeRange] = useState<"day" | "week" | "month" | "year">("day");
  const [techPerformance, setTechPerformance] = useState<TechnicianPerformance[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Combine orders and technicians fetching into one effect
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setIsLoading(true);
  
        // Refresh orders
        await refreshOrders();
  
        // Fetch technicians
        const { data, error } = await supabase
          .from("users")
          .select("id, auth_id, name, email, role")
          .eq("role", "technician");
  
        if (error) {
          console.error("Error fetching technicians:", error);
          setError("Failed to fetch technicians");
        } else if (data) {
          setTechnicians(data);
        }
      } catch (err) {
        console.error("Error in fetchAllData:", err);
        setError("An unexpected error occurred while fetching data");
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchAllData();
  }, []); // run only once on mount

  const getTechnicianName = useCallback((technicianId?: string) => {
    if (!technicianId) return 'Unknown';
    const tech = technicians.find(t => 
      t.id === technicianId || 
      t.auth_id === technicianId
    );
    return tech ? tech.name : `Tech ${technicianId.substring(0, 6)}`;
  }, [technicians]);
  
  // Process performance metrics when repairOrders or technicians change
  useEffect(() => {
    if (!repairOrders || repairOrders.length === 0) {
      console.log('No repair orders available yet');
      return;
    }
    if (!technicians || technicians.length === 0) {
      console.log('No technicians available yet');
      return;
    }
    
    try {
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
      
      const calculateTechPerformance = () => {
        const completedOrders = repairOrders.filter(order => {
          if (order.status !== 'completed') return false;
          if (!order.assignedTo) return false;
          
          if (order.completedAt) {
            const completedDate = new Date(order.completedAt);
            return completedDate >= startDate && completedDate <= endDate;
          }
          if (order.updatedAt) {
            const updatedDate = new Date(order.updatedAt);
            return updatedDate >= startDate && updatedDate <= endDate;
          }
          return false;
        });
        
        console.log(`Found ${completedOrders.length} completed orders in date range`);
        
        const techStats: Record<string, TechnicianPerformance> = {};
        
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
              techStats[technicianId].completedCount += 1;
            }
          } else {
            techStats[technicianId].completedCount += 1;
          }
        });
        
        Object.values(techStats).forEach((stat) => {
          if (stat.completedCount > 0 && stat.totalTimeMs > 0) {
            stat.averageTimeMs = Math.round(stat.totalTimeMs / stat.completedCount);
            stat.averageMinutes = Math.round(stat.averageTimeMs / (1000 * 60));
          }
        });
        
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

  const getCurrentWorkload = useCallback((technicianId: string) => {
    if (!repairOrders || !Array.isArray(repairOrders)) return 0;
    return repairOrders.filter(
      order => order.assignedTo === technicianId && order.status === 'in_progress'
    ).length;
  }, [repairOrders]);

  // Helper function to get the appropriate time period text
  const getAvgOrdersColumnText = () => {
    switch(timeRange) {
      case "day":
        return "Avg. Orders per Day";
      case "week":
        return "Avg. Orders per Week";
      case "month":
        return "Avg. Orders per Month";
      case "year":
        return "Avg. Orders per Year";
      default:
        return "Avg. Orders";
    }
  };

  const maxCompletedCount = Math.max(...(techPerformance || []).map(tech => tech.completedCount || 0), 1);

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
      {/* Header and time range selector */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Technician Performance</h1>
          <p className="text-gray-500">Performance metrics for your technical team</p>
        </div>
        <div className="inline-flex rounded-md shadow-sm" role="group">
          <button type="button" onClick={() => setTimeRange("day")}
            className={`px-4 py-2 text-sm font-medium rounded-l-lg ${timeRange === "day" ? "text-white bg-indigo-600" : "text-gray-900 bg-white hover:bg-gray-100"}`}>
            Today
          </button>
          <button type="button" onClick={() => setTimeRange("week")}
            className={`px-4 py-2 text-sm font-medium ${timeRange === "week" ? "text-white bg-indigo-600" : "text-gray-900 bg-white hover:bg-gray-100"}`}>
            Week
          </button>
          <button type="button" onClick={() => setTimeRange("month")}
            className={`px-4 py-2 text-sm font-medium ${timeRange === "month" ? "text-white bg-indigo-600" : "text-gray-900 bg-white hover:bg-gray-100"}`}>
            Month
          </button>
          <button type="button" onClick={() => setTimeRange("year")}
            className={`px-4 py-2 text-sm font-medium rounded-r-lg ${timeRange === "year" ? "text-white bg-indigo-600" : "text-gray-900 bg-white hover:bg-gray-100"}`}>
            Year
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
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
      </div>
      
      {/* Performance Overview - ADJUSTED HEIGHT HISTOGRAM SECTION */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold mb-4">Technician Performance Overview</h2>
        {techPerformance.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No technician data available for the selected time period</p>
        ) : (
          <div>
            {/* Modified histogram with improved spacing, alignment, and adjusted height */}
            <div className="flex flex-col border-l border-b border-gray-300 h-64 pt-2 mb-4 relative overflow-x-auto pb-10">
              <div className="absolute bottom-10 left-0 w-full flex items-end" style={{ minWidth: `${techPerformance.length * 80}px` }}>
                {techPerformance.map((tech, index) => {
                  const barHeight = maxCompletedCount > 0 
                    ? Math.max((tech.completedCount / maxCompletedCount) * 140, tech.completedCount > 0 ? 20 : 5) 
                    : 0;
                  return (
                    <div key={index} className="flex flex-col items-center mx-3" style={{ width: '70px', minWidth: '70px' }}>
                      <div className="text-xs font-medium text-gray-700 mb-2">
                        {tech.completedCount}
                      </div>
                      <div
                        className={`w-full rounded-t-sm ${tech.completedCount > 0 ? 'bg-green-600' : 'bg-gray-200'}`}
                        style={{ height: `${barHeight}px`, minHeight: '4px' }}
                      ></div>
                      <div className="mt-2 text-xs text-gray-700 truncate w-full text-center" title={tech.technicianName}>
                        {tech.technicianName.length > 10 
                          ? `${tech.technicianName.substring(0, 8)}...` 
                          : tech.technicianName}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
        <div className="text-center">
          <p className="text-sm text-gray-500">
            Performance data for the {timeRange === 'day' ? 'current day' : timeRange === 'week' ? 'past week' : timeRange === 'month' ? 'past month' : 'past year'}
          </p>
        </div>
      </div>
      
      {/* Detailed Performance - WITH DYNAMIC COLUMN HEADER */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">Detailed Performance</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Technician</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Orders Completed</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{getAvgOrdersColumnText()}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Workload</th>
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
                  
                  // Calculate average orders per day based on time range
                  const daysInPeriod = timeRange === 'day' ? 1 
                    : timeRange === 'week' ? 7 
                    : timeRange === 'month' ? 30 
                    : 365;
                  
                  const avgOrdersPerDay = tech.completedCount > 0 
                    ? (tech.completedCount / daysInPeriod).toFixed(1)
                    : '0';
                  
                  return (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{tech.technicianName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{tech.completedCount}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{avgOrdersPerDay}</div>
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