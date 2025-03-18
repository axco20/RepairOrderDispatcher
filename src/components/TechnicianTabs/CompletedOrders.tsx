"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRepairOrders } from "@/context/RepairOrderContext";
import { Clock, CheckCircle } from "lucide-react";

export default function CompletedOrders() {
  const { currentUser } = useAuth();
  const { technicianOrders, refreshOrders } = useRepairOrders();
  const [timeFilter, setTimeFilter] = useState("all");
  const [filteredOrders, setFilteredOrders] = useState([]);
  
  // For tracking actual hours spent on each repair
  const [actualHours, setActualHours] = useState({});
  const [totalActualHours, setTotalActualHours] = useState(0);
  
  useEffect(() => {
    if (!currentUser) return;
    
    console.log("📋 Fetching all technician orders...");
    const allOrders = technicianOrders(currentUser.id);
    console.log("✅ Technician orders:", allOrders);
    
    // Initialize actual hours if not already set
    const newActualHours = {...actualHours};
    allOrders.forEach(order => {
      if (!newActualHours[order.id]) {
        newActualHours[order.id] = 5; // Default to 5 hours
      }
    });
    setActualHours(newActualHours);
    
    filterOrdersByTime(allOrders, newActualHours);
  }, [currentUser, timeFilter, technicianOrders]);
  
  const filterOrdersByTime = (allOrders, hoursObj) => {
    if (!allOrders) return [];
    
    const completedOrders = allOrders.filter((order) => order.status === "completed");
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    
    let filtered;
    switch (timeFilter) {
      case "daily":
        filtered = completedOrders.filter(order => 
          order.completedAt && new Date(order.completedAt) >= today);
        break;
      case "weekly":
        filtered = completedOrders.filter(order => 
          order.completedAt && new Date(order.completedAt) >= startOfWeek);
        break;
      case "monthly":
        filtered = completedOrders.filter(order => 
          order.completedAt && new Date(order.completedAt) >= startOfMonth);
        break;
      case "yearly":
        filtered = completedOrders.filter(order => 
          order.completedAt && new Date(order.completedAt) >= startOfYear);
        break;
      default:
        filtered = completedOrders;
    }
    
    // Sort by completion date (newest first)
    filtered = filtered.sort((a, b) => {
      const dateA = a.completedAt ? new Date(a.completedAt).getTime() : 0;
      const dateB = b.completedAt ? new Date(b.completedAt).getTime() : 0;
      return dateB - dateA;
    });
    
    setFilteredOrders(filtered);
    
    // Calculate total actual hours
    let totalActual = 0;
    filtered.forEach(order => {
      const actualHrs = hoursObj[order.id] || 0;
      totalActual += parseFloat(actualHrs);
    });
    
    setTotalActualHours(totalActual);
  };

  const handleActualHoursChange = (orderId, hours) => {
    const newActualHours = {
      ...actualHours,
      [orderId]: hours
    };
    setActualHours(newActualHours);
    
    // Recalculate total
    let total = 0;
    filteredOrders.forEach(order => {
      total += parseFloat(order.id === orderId ? hours : (newActualHours[order.id] || 0));
    });
    
    setTotalActualHours(total);
  };

  const calculateTimeToComplete = (assignedAt, completedAt) => {
    if (!assignedAt || !completedAt) return "N/A";

    const startDate = new Date(assignedAt);
    const endDate = new Date(completedAt);
    const diffMs = endDate.getTime() - startDate.getTime();

    const minutes = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days}d ${hours % 24}h ${minutes % 60}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else {
      return `${minutes}m`;
    }
  };
  
  if (!currentUser) return <p>Loading...</p>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Completed Orders</h2>
        
        <div className="flex space-x-2">
          <button 
            onClick={() => setTimeFilter("daily")}
            className={`px-3 py-1 rounded-md text-sm ${timeFilter === "daily" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"}`}
          >
            Today
          </button>
          <button 
            onClick={() => setTimeFilter("weekly")}
            className={`px-3 py-1 rounded-md text-sm ${timeFilter === "weekly" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"}`}
          >
            This Week
          </button>
          <button 
            onClick={() => setTimeFilter("monthly")}
            className={`px-3 py-1 rounded-md text-sm ${timeFilter === "monthly" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"}`}
          >
            This Month
          </button>
          <button 
            onClick={() => setTimeFilter("yearly")}
            className={`px-3 py-1 rounded-md text-sm ${timeFilter === "yearly" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"}`}
          >
            This Year
          </button>
          <button 
            onClick={() => setTimeFilter("all")}
            className={`px-3 py-1 rounded-md text-sm ${timeFilter === "all" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"}`}
          >
            All Time
          </button>
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-500">No completed repair orders</p>
          <p className="text-sm text-gray-400 mt-2">Orders you complete will appear here</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Repair Order #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assigned At
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Completed At
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actual Hours
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time to Complete
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {order.id.substring(0, 8)}...
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{order.description}</div>
                      {order.orderDescription && (
                        <div className="text-xs text-gray-500 mt-1">{order.orderDescription}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {order.assignedAt ? new Date(order.assignedAt).toLocaleString() : "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {order.completedAt ? new Date(order.completedAt).toLocaleString() : "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        className="border rounded px-2 py-1 w-20 text-sm"
                        value={actualHours[order.id] || ""}
                        onChange={(e) => handleActualHoursChange(order.id, e.target.value)}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock size={16} className="mr-1" />
                        {calculateTimeToComplete(order.assignedAt, order.completedAt)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50 border-t-2 border-gray-200">
                <tr>
                  <td colSpan="4" className="px-6 py-4 text-right font-medium">
                    Total Hours:
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-lg font-bold text-blue-600">
                      {totalActualHours.toFixed(1)}
                    </div>
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {filteredOrders.length > 0 && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <CheckCircle className="h-5 w-5 text-green-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">
                Great job! You have completed {filteredOrders.length} repair order
                {filteredOrders.length !== 1 ? "s" : ""} for a total of {totalActualHours.toFixed(1)} hours.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}