// src/components/AdminTabs/AdminHome.tsx
import React, { useState, useEffect } from "react";
import { useRepairOrders } from "@/context/RepairOrderContext";
import { BarChart, Activity, Clock, Award } from "lucide-react";
import { supabase } from '@/lib/supabaseClient';

interface Technician {
  id: string;
  auth_id: string;
  name: string;
  email: string;
  role: string;
}

const AdminHome: React.FC = () => {
  const { repairOrders, assignments } = useRepairOrders();
  const [timeRange, setTimeRange] = useState<"day" | "week" | "month" | "year">("week");
  const [orderVolume, setOrderVolume] = useState<any[]>([]);
  const [techPerformance, setTechPerformance] = useState<any[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  
  // Fetch technicians from Supabase
  useEffect(() => {
    const fetchTechnicians = async () => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'technician');

      if (error) {
        console.error('Error fetching technicians:', error);
      } else if (data) {
        setTechnicians(data);
      }
    };
    fetchTechnicians();
  }, []);

  // Helper to get a technician's name by auth_id
  const getTechnicianName = (auth_id?: string) => {
    if (!auth_id) return 'Unknown';
    const tech = technicians.find((t) => t.auth_id === auth_id);
    return tech ? tech.name : 'Unknown';
  };
  
  // Process data for metrics
  useEffect(() => {
    // Get date range based on selected time period
    const getDateRange = () => {
      const now = new Date();
      const endDate = now;
      let startDate = new Date();
      
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
    
    // Filter orders by date range
    const filteredOrders = repairOrders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= startDate && orderDate <= endDate;
    });
    
    // Order volume over time
    const calculateOrderVolume = () => {
      // Group data based on time period
      const volumeData: Record<string, number> = {};
      
      filteredOrders.forEach(order => {
        const date = new Date(order.createdAt);
        let key = '';
        
        if (timeRange === 'day') {
          // Group by hour
          key = `${date.getHours()}:00`;
        } else if (timeRange === 'week') {
          // Group by day
          key = date.toLocaleDateString('en-US', { weekday: 'short' });
        } else if (timeRange === 'month') {
          // Group by day of month
          key = `${date.getDate()}`;
        } else if (timeRange === 'year') {
          // Group by month
          key = date.toLocaleDateString('en-US', { month: 'short' });
        }
        
        volumeData[key] = (volumeData[key] || 0) + 1;
      });
      
      // Convert to array for rendering
      const result = Object.entries(volumeData).map(([label, count]) => ({
        label,
        count
      }));
      
      // Sort appropriately
      if (timeRange === 'week') {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        result.sort((a, b) => days.indexOf(a.label) - days.indexOf(b.label));
      } else if (timeRange === 'year') {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        result.sort((a, b) => months.indexOf(a.label) - months.indexOf(b.label));
      } else {
        // For day and month, sort numerically
        result.sort((a, b) => {
          if (timeRange === 'day') {
            return parseInt(a.label) - parseInt(b.label);
          }
          return parseInt(a.label) - parseInt(b.label);
        });
      }
      
      return result;
    };
    
    // Calculate technician performance
    const calculateTechPerformance = () => {
      // Get completed assignments in the date range
      const relevantAssignments = assignments.filter(assignment => {
        if (!assignment.completedAt) return false;
        const completedDate = new Date(assignment.completedAt);
        return completedDate >= startDate && completedDate <= endDate;
      });
      
      // Group by technician
      const techStats: Record<string, any> = {};
      
      relevantAssignments.forEach(assignment => {
        const { technicianId, assignedAt, completedAt } = assignment;
        
        if (!techStats[technicianId]) {
          techStats[technicianId] = {
            technicianId,
            completedCount: 0,
            totalTimeMs: 0,
            averageTimeMs: 0,
            technicianName: getTechnicianName(technicianId)
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
      Object.values(techStats).forEach((stat: any) => {
        if (stat.completedCount > 0) {
          stat.averageTimeMs = Math.round(stat.totalTimeMs / stat.completedCount);
          // Convert to minutes for display
          stat.averageMinutes = Math.round(stat.averageTimeMs / (1000 * 60));
        }
      });
      
      // Convert to array and sort by completed count
      return Object.values(techStats).sort((a: any, b: any) => b.completedCount - a.completedCount);
    };
    
    setOrderVolume(calculateOrderVolume());
    setTechPerformance(calculateTechPerformance());
    
  }, [timeRange, repairOrders, assignments, technicians]);
  
  // Calculate max values for scaling
  const maxOrderVolume = Math.max(...orderVolume.map(d => d.count), 1);
  
  // Get total counts
  const totalOrders = repairOrders.length;
  const pendingOrders = repairOrders.filter(order => order.status === 'pending').length;
  const inProgressOrders = repairOrders.filter(order => order.status === 'in_progress').length;
  const completedOrders = repairOrders.filter(order => order.status === 'completed').length;
  
  // Get average completion time overall
  const calculateAvgCompletionTime = () => {
    const completedAssignments = assignments.filter(a => a.status === 'completed' && a.completedAt && a.assignedAt);
    
    if (completedAssignments.length === 0) return "N/A";
    
    const totalTime = completedAssignments.reduce((sum, assignment) => {
      const startTime = new Date(assignment.assignedAt).getTime();
      const endTime = new Date(assignment.completedAt!).getTime();
      return sum + (endTime - startTime);
    }, 0);
    
    const avgTimeMs = totalTime / completedAssignments.length;
    const avgMinutes = Math.round(avgTimeMs / (1000 * 60));
    
    if (avgMinutes >= 60) {
      const hours = Math.floor(avgMinutes / 60);
      const mins = avgMinutes % 60;
      return `${hours}h ${mins}m`;
    }
    
    return `${avgMinutes}m`;
  };
  
  const avgCompletionTime = calculateAvgCompletionTime();
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Performance Dashboard</h1>
      
      {/* Time Range Selector */}
      <div className="mb-6">
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-800">
              <BarChart className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Orders</p>
              <p className="text-2xl font-semibold text-gray-900">{totalOrders}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-800">
              <Activity className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">In Progress</p>
              <p className="text-2xl font-semibold text-gray-900">{inProgressOrders}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-800">
              <Award className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Completed</p>
              <p className="text-2xl font-semibold text-gray-900">{completedOrders}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-800">
              <Clock className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Avg. Completion</p>
              <p className="text-2xl font-semibold text-gray-900">{avgCompletionTime}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Order Volume Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Order Volume</h2>
          
          {orderVolume.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No data available for the selected time period</p>
          ) : (
            <div className="space-y-2">
              {orderVolume.map((item, index) => (
                <div key={index} className="flex items-center">
                  <div className="w-16 text-sm text-gray-600">{item.label}</div>
                  <div className="flex-grow">
                    <div 
                      className="bg-blue-600 h-6 rounded-r-sm flex items-center justify-end pr-2 text-white text-xs"
                      style={{ width: `${(item.count / maxOrderVolume) * 100}%`, minWidth: item.count > 0 ? '24px' : '0' }}
                    >
                      {item.count}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Technician Performance Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Technician Performance</h2>
          
          {techPerformance.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No data available for the selected time period</p>
          ) : (
            <div className="space-y-4">
              {techPerformance.map((tech: any, index: number) => (
                <div key={index} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{tech.technicianName}</span>
                    <span className="text-gray-500">{tech.completedCount} orders</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex-grow">
                      <div 
                        className="bg-green-600 h-4 rounded-sm"
                        style={{ width: `${(tech.completedCount / Math.max(...techPerformance.map((t: any) => t.completedCount), 1)) * 100}%`, minWidth: '4px' }}
                      ></div>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>{tech.averageMinutes || 0} min avg</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Details Table */}
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
                techPerformance.map((tech: any, index: number) => {
                  // Count current in-progress orders
                  const currentWorkload = repairOrders.filter(
                    order => order.assignedTo === tech.technicianId && order.status === 'in_progress'
                  ).length;
                  
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

export default AdminHome;