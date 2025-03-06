"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRepairOrders } from "@/context/RepairOrderContext";
import { Clock, BarChart4 } from "lucide-react";
import { XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from "recharts";

interface HomeProps {
  activeOrderCount?: number;
  canGetNewOrder?: boolean;
  pendingOrdersCount?: number;
  getNextRepairOrder?: () => void;
}

export default function Home({
  activeOrderCount: propActiveOrderCount,
  canGetNewOrder: propCanGetNewOrder,
  pendingOrdersCount,
  getNextRepairOrder
}: HomeProps) {
  const { currentUser } = useAuth();
  const { 
    technicianActiveOrderCount,
    canRequestNewOrder,
    pendingOrders,
    technicianOrders,
    assignments
  } = useRepairOrders();

  const [dateRange, setDateRange] = useState<"week" | "month" | "year">("week");
  const [chartData, setChartData] = useState<Array<{date: string; orders: number}>>([]);

  // Generate data for the chart based on selected date range
  useEffect(() => {
    // If no user, don't try to generate chart data
    if (!currentUser) return;
    
    const generateChartData = () => {
      // Get all assignments for this technician
      const myAssignments = assignments.filter(
        assignment => assignment.technicianId === currentUser.id
      );

      const data: Array<{date: string; orders: number}> = [];
      const now = new Date();
      let startDate: Date;
      let groupBy: (date: Date) => string;

      switch (dateRange) {
        case "week":
          // Last 7 days
          startDate = new Date();
          startDate.setDate(startDate.getDate() - 6);
          groupBy = (date) => `${date.getMonth() + 1}/${date.getDate()}`;
          break;
        case "month":
          // Last 30 days
          startDate = new Date();
          startDate.setDate(startDate.getDate() - 29);
          groupBy = (date) => `${date.getMonth() + 1}/${date.getDate()}`;
          break;
        case "year":
          // Last 12 months
          startDate = new Date();
          startDate.setMonth(startDate.getMonth() - 11);
          groupBy = (date) => {
            const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            return `${months[date.getMonth()]} ${date.getFullYear().toString().slice(2)}`;
          };
          break;
        default:
          startDate = new Date();
          startDate.setDate(startDate.getDate() - 6);
          groupBy = (date) => `${date.getMonth() + 1}/${date.getDate()}`;
      }

      // Initialize data array with dates
      const currentDate = new Date(startDate);
      while (currentDate <= now) {
        data.push({
          date: groupBy(currentDate),
          orders: 0,
        });
        
        if (dateRange === "year") {
          // Move to next month
          currentDate.setMonth(currentDate.getMonth() + 1);
        } else {
          // Move to next day
          currentDate.setDate(currentDate.getDate() + 1);
        }
      }

      // Count orders per date
      myAssignments.forEach(assignment => {
        const assignedDate = new Date(assignment.assignedAt);
        if (assignedDate >= startDate && assignedDate <= now) {
          const dateKey = groupBy(assignedDate);
          const dataPoint = data.find(item => item.date === dateKey);
          if (dataPoint) {
            dataPoint.orders += 1;
          }
        }
      });

      return data;
    };

    setChartData(generateChartData());
  }, [dateRange, assignments, currentUser]);

  // If no user, show loading
  if (!currentUser) return <p>Loading...</p>;

  // Use props if provided, otherwise get from context
  const activeOrderCount = propActiveOrderCount !== undefined ? propActiveOrderCount : technicianActiveOrderCount(currentUser.id);
  const canGetNewOrder = propCanGetNewOrder !== undefined ? propCanGetNewOrder : canRequestNewOrder(currentUser.id);
  const myOrders = technicianOrders(currentUser.id);
  const activeOrders = myOrders.filter(order => order.status === "in_progress");
  const completedOrders = myOrders.filter(order => order.status === "completed");

  return (
    <div className="space-y-6">
      {/* Updated header with button */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Dashboard Overview</h2>
        <div className="flex items-center space-x-4">
          <span className="text-sm px-3 py-1 bg-white rounded-md shadow text-gray-700">
            Active Orders: <strong className="text-indigo-600">{activeOrderCount}/3</strong>
          </span>
          <button
            onClick={getNextRepairOrder}
            disabled={!canGetNewOrder || (pendingOrdersCount !== undefined && pendingOrdersCount === 0)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded shadow text-sm disabled:bg-gray-400 disabled:cursor-not-allowed transition"
          >
            Get Next Repair Order
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-700 mb-2 font-semibold text-lg text-center">Pending Orders</h3>
          <p className="text-4xl font-bold text-indigo-600 text-center">{pendingOrders.length}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-700 mb-2 font-semibold text-lg text-center">In Progress</h3>
          <p className="text-4xl font-bold text-yellow-500 text-center">{activeOrders.length}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-700 mb-2 font-semibold text-lg text-center">Completed</h3>
          <p className="text-4xl font-bold text-green-600 text-center">{completedOrders.length}</p>
        </div>
      </div>

      {/* Warning Messages */}
      {!canGetNewOrder && activeOrderCount >= 3 && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <Clock className="h-5 w-5 text-amber-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-amber-700">
                You have reached the maximum number of active orders (3). Complete at least one order before requesting a new one.
              </p>
            </div>
          </div>
        </div>
      )}

      {!canGetNewOrder && activeOrderCount < 3 && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <Clock className="h-5 w-5 text-amber-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-amber-700">
                You need to wait 5 minutes after your last assignment before requesting a new order.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Performance Chart */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold flex items-center">
            <BarChart4 className="mr-2 h-5 w-5" />
            Your Performance History
          </h3>
          <div className="flex space-x-2">
            <button 
              onClick={() => setDateRange("week")}
              className={`px-3 py-1 text-sm rounded-md ${dateRange === "week" ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-700"}`}
            >
              Week
            </button>
            <button 
              onClick={() => setDateRange("month")}
              className={`px-3 py-1 text-sm rounded-md ${dateRange === "month" ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-700"}`}
            >
              Month
            </button>
            <button 
              onClick={() => setDateRange("year")}
              className={`px-3 py-1 text-sm rounded-md ${dateRange === "year" ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-700"}`}
            >
              Year
            </button>
          </div>
        </div>
        
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="orders" name="Orders Processed" fill="#4f46e5" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <p className="text-sm text-gray-500 mt-4 text-center">
          This chart shows the number of repair orders you&apos;ve processed over time.
        </p>
      </div>

      {/* Quick Tips */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-xl font-semibold mb-4">How to use the dispatch system</h3>
        <ul className="space-y-2 text-gray-700">
          <li className="flex items-start">
            <span className="h-6 w-6 rounded-full bg-indigo-100 text-indigo-800 flex items-center justify-center mr-2 flex-shrink-0">1</span>
            <span>Click <strong>&quot;Get Next Repair Order&quot;</strong> in the header to receive a repair order from the queue.</span>
          </li>
          <li className="flex items-start">
            <span className="h-6 w-6 rounded-full bg-indigo-100 text-indigo-800 flex items-center justify-center mr-2 flex-shrink-0">2</span>
            <span>View your active orders in the <strong>&quot;Active Orders&quot;</strong> tab.</span>
          </li>
          <li className="flex items-start">
            <span className="h-6 w-6 rounded-full bg-indigo-100 text-indigo-800 flex items-center justify-center mr-2 flex-shrink-0">3</span>
            <span>Mark orders as complete when your work is done.</span>
          </li>
          <li className="flex items-start">
            <span className="h-6 w-6 rounded-full bg-indigo-100 text-indigo-800 flex items-center justify-center mr-2 flex-shrink-0">4</span>
            <span>You can have up to <strong>3 active orders</strong> at one time.</span>
          </li>
        </ul>
      </div>
    </div>
  );
}