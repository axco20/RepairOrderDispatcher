import React, { useState, useEffect } from "react";
import { useRepairOrders } from "@/context/RepairOrderContext";
import { BarChart, Activity, Award, ArrowUp, ArrowDown, Calendar, Users, Settings } from "lucide-react";
import { supabase } from '@/lib/supabaseClient';
import ActiveRepairOrdersTable from './ActiveRepairOrderTable';
import TechnicianWorkload from './TechnicianWorkload';  // Import the new component


interface Technician {
  id: string;
  auth_id: string;
  name: string;
  email: string;
  role: string;
}

// Define interface for order volume data
interface OrderVolumeItem {
  label: string;
  count: number;
}

const AdminHome: React.FC = () => {
  const { repairOrders } = useRepairOrders();
  const [timeRange, setTimeRange] = useState<"day" | "week" | "month" | "year">("week");
  const [orderVolume, setOrderVolume] = useState<OrderVolumeItem[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [trendData, setTrendData] = useState({ 
    ordersChange: 0
  });
  const [activeOrdersCount, setActiveOrdersCount] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0
  });
  
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
  
  // Process data for metrics
  useEffect(() => {
    // Get date range based on selected time period
    const getDateRange = () => {
      const now = new Date();
      const endDate = now;
      const startDate = new Date();
      const previousStartDate = new Date();
      
      switch(timeRange) {
        case "day":
          // Reset to start of current day
          startDate.setHours(0, 0, 0, 0);
          // Previous period is previous day
          previousStartDate.setDate(previousStartDate.getDate() - 1);
          previousStartDate.setHours(0, 0, 0, 0);
          break;
        case "week":
          // Start of week (go back 6 days from today)
          startDate.setDate(startDate.getDate() - 6);
          startDate.setHours(0, 0, 0, 0);
          // Previous period is previous week
          previousStartDate.setDate(previousStartDate.getDate() - 7);
          previousStartDate.setHours(0, 0, 0, 0);
          break;
        case "month":
          // Start of month
          startDate.setDate(1);
          startDate.setHours(0, 0, 0, 0);
          // Previous period is previous month
          previousStartDate.setMonth(previousStartDate.getMonth() - 1);
          previousStartDate.setDate(1);
          previousStartDate.setHours(0, 0, 0, 0);
          break;
        case "year":
          // Start of year
          startDate.setMonth(0, 1);
          startDate.setHours(0, 0, 0, 0);
          // Previous period is previous year
          previousStartDate.setFullYear(previousStartDate.getFullYear() - 1);
          previousStartDate.setMonth(0, 1);
          previousStartDate.setHours(0, 0, 0, 0);
          break;
      }
      
      return { startDate, endDate, previousStartDate };
    };
    
    const { startDate, endDate, previousStartDate } = getDateRange();
    
    // Filter orders by date range - strictly within the selected time range
    const filteredOrders = repairOrders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= startDate && orderDate <= endDate;
    });
    
    // Previous period orders for comparison
    const previousPeriodOrders = repairOrders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= previousStartDate && orderDate < startDate;
    });
    
    // Calculate trend percentages
    if (previousPeriodOrders.length > 0) {
      const orderChangePercent = ((filteredOrders.length - previousPeriodOrders.length) / previousPeriodOrders.length) * 100;
      
      setTrendData({
        ordersChange: parseFloat(orderChangePercent.toFixed(1))
      });
    } else if (filteredOrders.length > 0) {
      // If there were no orders in the previous period but there are now
      setTrendData({
        ordersChange: 100
      });
    } else {
      // No orders in either period
      setTrendData({
        ordersChange: 0
      });
    }
    
    // Update active order counts based on filtered orders
    setActiveOrdersCount({
      total: filteredOrders.length,
      pending: filteredOrders.filter(order => order.status === 'pending').length,
      inProgress: filteredOrders.filter(order => order.status === 'in_progress').length,
      completed: filteredOrders.filter(order => order.status === 'completed').length
    });
    
    // Order volume over time
    const calculateOrderVolume = () => {
      // Group data based on time period
      const volumeData: Record<string, number> = {};
      
      // Create all bins first (for empty values)
      if (timeRange === 'day') {
        // 24 hours
        for (let i = 0; i < 24; i++) {
          volumeData[`${i}:00`] = 0;
        }
      } else if (timeRange === 'week') {
        // 7 days
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        days.forEach(day => {
          volumeData[day] = 0;
        });
      } else if (timeRange === 'month') {
        // Days in month
        const daysInMonth = new Date(endDate.getFullYear(), endDate.getMonth() + 1, 0).getDate();
        for (let i = 1; i <= daysInMonth; i++) {
          volumeData[`${i}`] = 0;
        }
      } else if (timeRange === 'year') {
        // 12 months
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        months.forEach(month => {
          volumeData[month] = 0;
        });
      }
      
      // Fill with actual data - only use orders that fall within the selected time range
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
        
        if (volumeData[key] !== undefined) {
          volumeData[key] += 1;
        }
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
      } else if (timeRange === 'day') {
        // For day, sort by hour
        result.sort((a, b) => {
          return parseInt(a.label) - parseInt(b.label);
        });
      } else {
        // For month, sort by day number
        result.sort((a, b) => {
          return parseInt(a.label) - parseInt(b.label);
        });
      }
      
      return result;
    };
    
    setOrderVolume(calculateOrderVolume());
    
  }, [timeRange, repairOrders]);
  
  // Calculate max values for scaling
  const maxOrderVolume = Math.max(...orderVolume.map(d => d.count), 1);
  
  // Calculate technician metrics based on current workload
  const activeTechnicians = technicians.length;
  const avgOrdersPerTechnician = technicians.length ? 
    Math.round(activeOrdersCount.inProgress / technicians.length * 10) / 10 : 0;
  
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dispatching Overview</h1>
          <p className="text-gray-500">Monitor your repair operations at a glance</p>
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
      
      {/* Stats Cards Row 1 - 3 cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6 transition-all hover:shadow-lg">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Total Orders</p>
              <p className="text-3xl font-semibold text-gray-900">{activeOrdersCount.total}</p>
              
              {trendData.ordersChange !== 0 && (
                <div className={`flex items-center mt-2 text-sm ${trendData.ordersChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {trendData.ordersChange > 0 ? <ArrowUp className="h-3 w-3 mr-1" /> : <ArrowDown className="h-3 w-3 mr-1" />}
                  <span>{Math.abs(trendData.ordersChange)}% from previous {timeRange}</span>
                </div>
              )}
            </div>
            <div className="p-3 rounded-full bg-blue-100 text-blue-800">
              <BarChart className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 h-1 w-full bg-gray-200 rounded-full overflow-hidden">
            <div className="bg-blue-600 h-1 rounded-full" style={{ width: '100%' }}></div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 transition-all hover:shadow-lg">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">In Progress</p>
              <p className="text-3xl font-semibold text-gray-900">{activeOrdersCount.inProgress}</p>
              <p className="text-sm text-gray-500 mt-2">{activeOrdersCount.pending} pending assignments</p>
            </div>
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-800">
              <Activity className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 h-1 w-full bg-gray-200 rounded-full overflow-hidden">
            <div className="bg-yellow-500 h-1 rounded-full" style={{ 
              width: `${(activeOrdersCount.inProgress / Math.max(activeOrdersCount.total, 1)) * 100}%` 
            }}></div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 transition-all hover:shadow-lg">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Completed</p>
              <p className="text-3xl font-semibold text-gray-900">{activeOrdersCount.completed}</p>
              <p className="text-sm text-gray-500 mt-2">
                {Math.round((activeOrdersCount.completed / Math.max(activeOrdersCount.total, 1)) * 100)}% completion rate
              </p>
            </div>
            <div className="p-3 rounded-full bg-green-100 text-green-800">
              <Award className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 h-1 w-full bg-gray-200 rounded-full overflow-hidden">
            <div className="bg-green-600 h-1 rounded-full" style={{ 
              width: `${(activeOrdersCount.completed / Math.max(activeOrdersCount.total, 1)) * 100}%` 
            }}></div>
          </div>
        </div>
      </div>
      
      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6 transition-all hover:shadow-lg">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Active Technicians</p>
              <p className="text-3xl font-semibold text-gray-900">{activeTechnicians}</p>
              <p className="text-sm text-gray-500 mt-2">Total workforce</p>
            </div>
            <div className="p-3 rounded-full bg-indigo-100 text-indigo-800">
              <Users className="h-6 w-6" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 transition-all hover:shadow-lg">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Workload per Technician</p>
              <p className="text-3xl font-semibold text-gray-900">{avgOrdersPerTechnician}</p>
              <p className="text-sm text-gray-500 mt-2">Average active orders</p>
            </div>
            <div className="p-3 rounded-full bg-teal-100 text-teal-800">
              <Settings className="h-6 w-6" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 transition-all hover:shadow-lg">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Time Period</p>
              <p className="text-3xl font-semibold text-gray-900">
                {timeRange === 'day' ? 'Today' : 
                 timeRange === 'week' ? 'This Week' : 
                 timeRange === 'month' ? 'This Month' : 'This Year'}
              </p>
              <p className="text-sm text-gray-500 mt-2">Current view</p>
            </div>
            <div className="p-3 rounded-full bg-pink-100 text-pink-800">
              <Calendar className="h-6 w-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Two column layout for Orders Table and Technician Workload */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Active Repair Orders Table */}
        <div className="lg:col-span-2">
          <ActiveRepairOrdersTable repairOrders={repairOrders} />
        </div>
        
        {/* Right column - Technician Workload */}
        <div className="lg:col-span-1">
          <TechnicianWorkload 
            technicians={technicians}
            repairOrders={repairOrders}
            limit={6}
          />
        </div>
      </div>
      
      {/* Correctly Oriented Bar Chart */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-bold mb-4 flex items-center">
          <BarChart className="h-5 w-5 mr-2 text-indigo-600" />
          Order Volume by {timeRange === 'day' ? 'Hour' : 
                         timeRange === 'week' ? 'Day' : 
                         timeRange === 'month' ? 'Day' : 'Month'}
        </h2>
        
        <div>
          <div className="flex items-end border-l border-b border-gray-300 h-64 pt-8">
            {orderVolume.map((item, index) => (
              <div key={index} className="flex-1 flex flex-col items-center pb-1">
                {/* Bar value */}
                <div className="text-xs font-medium text-gray-700 mb-1">{item.count}</div>
                
                {/* The bar */}
                <div 
                  className="w-8 bg-indigo-600 rounded-t-sm" 
                  style={{ 
                    height: item.count > 0 ? `${(item.count / maxOrderVolume) * 180}px` : '0',
                    minHeight: item.count > 0 ? '4px' : '0'
                  }}
                />
              </div>
            ))}
          </div>
          
          {/* X-axis labels */}
          <div className="flex mt-1">
            {orderVolume.map((item, index) => (
              <div key={index} className="flex-1 text-xs text-gray-600 text-center truncate px-1">
                {item.label}
              </div>
            ))}
          </div>
        </div>
        
        <p className="text-sm text-gray-500 text-center mt-6">
          {timeRange === 'day' ? 'Hourly breakdown of repair orders for today' : 
           timeRange === 'week' ? 'Daily breakdown of repair orders for the past week' : 
           timeRange === 'month' ? 'Daily breakdown of repair orders for the past month' : 
           'Monthly breakdown of repair orders for the past year'}
        </p>
      </div>
    </div>
  );
};

export default AdminHome;