"use client"; // Needed for hooks in Next.js

import React, { useState, useEffect } from "react";
import { useRepairOrders } from "@/context/RepairOrderContext";
import { BarChart, Activity, Award, ArrowUp, ArrowDown } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import ActiveRepairOrdersTable from "./ActiveRepairOrderTable";
import TechnicianWorkload from "./TechnicianWorkload";

interface Technician {
  id: string;
  auth_id: string;
  name: string;
  email: string;
  role: string;
}

const AdminHome: React.FC = () => {
  // Destructure repairOrders and refreshOrders from your context
  const { repairOrders, refreshOrders } = useRepairOrders();
  const [timeRange, setTimeRange] = useState<"day" | "week" | "month" | "year">(
    "day"
  );
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [trendData, setTrendData] = useState({
    ordersChange: 0,
  });
  const [activeOrdersCount, setActiveOrdersCount] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
  });

  // Refresh orders when AdminHome mounts
  useEffect(() => {
    if (repairOrders.length === 0) {
      refreshOrders();
    }
  }, []);
  

  // Fetch technicians from Supabase
  useEffect(() => {
    const fetchTechnicians = async () => {
      if (technicians.length > 0) return; // Don't fetch if already loaded
  
      try {
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError || !userData?.user?.id) return;
  
        const { data: adminData, error: adminError } = await supabase
          .from("users")
          .select("dealership_id")
          .eq("auth_id", userData.user.id)
          .single();
        if (adminError || !adminData?.dealership_id) return;
  
        const { data, error } = await supabase
          .from("users")
          .select("*")
          .eq("role", "technician")
          .eq("dealership_id", adminData.dealership_id);
  
        if (!error && data) {
          setTechnicians(data);
        }
      } catch (err) {
        console.error("Error fetching technicians:", err);
      }
    };
  
    fetchTechnicians();
  }, [technicians.length]); // Only run if technicians are empty
  

  // Process data for metrics
  useEffect(() => {
    // Helper: Calculate date range based on selected time period
    const getDateRange = () => {
      const now = new Date();
      const endDate = now;
      const startDate = new Date();
      const previousStartDate = new Date();

      switch (timeRange) {
        case "day":
          startDate.setHours(0, 0, 0, 0);
          previousStartDate.setDate(previousStartDate.getDate() - 1);
          previousStartDate.setHours(0, 0, 0, 0);
          break;
        case "week":
          startDate.setDate(startDate.getDate() - 6);
          startDate.setHours(0, 0, 0, 0);
          previousStartDate.setDate(previousStartDate.getDate() - 7);
          previousStartDate.setHours(0, 0, 0, 0);
          break;
        case "month":
          startDate.setDate(1);
          startDate.setHours(0, 0, 0, 0);
          previousStartDate.setMonth(previousStartDate.getMonth() - 1);
          previousStartDate.setDate(1);
          previousStartDate.setHours(0, 0, 0, 0);
          break;
        case "year":
          startDate.setMonth(0, 1);
          startDate.setHours(0, 0, 0, 0);
          previousStartDate.setFullYear(previousStartDate.getFullYear() - 1);
          previousStartDate.setMonth(0, 1);
          previousStartDate.setHours(0, 0, 0, 0);
          break;
      }

      return { startDate, endDate, previousStartDate };
    };

    const { startDate, endDate, previousStartDate } = getDateRange();

    // Filter orders by date range
    const filteredOrders = repairOrders.filter((order) => {
      const createdDate = new Date(order.createdAt);
      const completedDate = order.completedAt
        ? new Date(order.completedAt)
        : null;

      return (
        // Orders created today
        (createdDate >= startDate && createdDate <= endDate) ||
        // Orders completed today (even if created earlier)
        (completedDate &&
          completedDate >= startDate &&
          completedDate <= endDate) ||
        // Orders still pending or in progress from previous days
        ((order.status === "pending" || order.status === "in_progress") &&
          createdDate < startDate)
      );
    });

    // Previous period orders for comparison
    const previousPeriodOrders = repairOrders.filter((order) => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= previousStartDate && orderDate < startDate;
    });

    // Calculate trend percentages
    if (previousPeriodOrders.length > 0) {
      const orderChangePercent =
        ((filteredOrders.length - previousPeriodOrders.length) /
          previousPeriodOrders.length) *
        100;
      setTrendData({
        ordersChange: parseFloat(orderChangePercent.toFixed(1)),
      });
    } else if (filteredOrders.length > 0) {
      setTrendData({ ordersChange: 100 });
    } else {
      setTrendData({ ordersChange: 0 });
    }

    // Update active order counts based on filtered orders
    setActiveOrdersCount({
      total: filteredOrders.length,
      pending: filteredOrders.filter((order) => order.status === "pending")
        .length,
      inProgress: filteredOrders.filter(
        (order) => order.status === "in_progress"
      ).length,
      completed: filteredOrders.filter((order) => order.status === "completed")
        .length,
    });
  }, [timeRange, repairOrders]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Dispatching Overview
          </h1>
          <p className="text-gray-500">
            Monitor your repair operations at a glance
          </p>
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
              <p className="text-sm font-medium text-gray-500 mb-1">
                Total Orders
              </p>
              <p className="text-3xl font-semibold text-gray-900">
                {activeOrdersCount.total}
              </p>

              {trendData.ordersChange !== 0 && (
                <div
                  className={`flex items-center mt-2 text-sm ${
                    trendData.ordersChange > 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {trendData.ordersChange > 0 ? (
                    <ArrowUp className="h-3 w-3 mr-1" />
                  ) : (
                    <ArrowDown className="h-3 w-3 mr-1" />
                  )}
                  <span>
                    {Math.abs(trendData.ordersChange)}% from previous{" "}
                    {timeRange}
                  </span>
                </div>
              )}
            </div>
            <div className="p-3 rounded-full bg-blue-100 text-blue-800">
              <BarChart className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 h-1 w-full bg-gray-200 rounded-full overflow-hidden">
            <div
              className="bg-blue-600 h-1 rounded-full"
              style={{ width: "100%" }}
            ></div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 transition-all hover:shadow-lg">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">
                In Progress
              </p>
              <p className="text-3xl font-semibold text-gray-900">
                {activeOrdersCount.inProgress}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                {activeOrdersCount.pending} pending assignments
              </p>
            </div>
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-800">
              <Activity className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 h-1 w-full bg-gray-200 rounded-full overflow-hidden">
            <div
              className="bg-yellow-500 h-1 rounded-full"
              style={{
                width: `${
                  (activeOrdersCount.inProgress /
                    Math.max(activeOrdersCount.total, 1)) *
                  100
                }%`,
              }}
            ></div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 transition-all hover:shadow-lg">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">
                Completed
              </p>
              <p className="text-3xl font-semibold text-gray-900">
                {activeOrdersCount.completed}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                {Math.round(
                  (activeOrdersCount.completed /
                    Math.max(activeOrdersCount.total, 1)) *
                    100
                )}
                % completion rate
              </p>
            </div>
            <div className="p-3 rounded-full bg-green-100 text-green-800">
              <Award className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 h-1 w-full bg-gray-200 rounded-full overflow-hidden">
            <div
              className="bg-green-600 h-1 rounded-full"
              style={{
                width: `${
                  (activeOrdersCount.completed /
                    Math.max(activeOrdersCount.total, 1)) *
                  100
                }%`,
              }}
            ></div>
          </div>
        </div>
      </div>

      {/* Two column layout for Orders Table and Technician Workload */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Active Repair Orders Table */}
        <div className="lg:col-span-2">
          <ActiveRepairOrdersTable
            repairOrders={repairOrders.filter(
              (order) =>
                order.status === "pending" || order.status === "in_progress"
            )}
          />
        </div>

        {/* Right column - Technician Workload */}
        <div className="lg:col-span-1">
          <TechnicianWorkload
            technicians={technicians}
            repairOrders={repairOrders}
          />
        </div>
      </div>
    </div>
  );
};

export default AdminHome;
