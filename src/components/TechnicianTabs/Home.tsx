"use client";
import React, { useState, useEffect } from "react";
import { PlusCircle, Loader2, Wrench, Clock, CheckCircle, AlertCircle, Info as InfoIcon } from "lucide-react";
import { useRepairOrders } from "@/context/RepairOrderContext";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabaseClient";

interface HomeProps {
  activeOrderCount: number;
  canGetNewOrder: boolean;
  pendingOrdersCount: number;
  getNextRepairOrder: () => Promise<void>;
  isLoading: boolean;
}

export default function Home({
  activeOrderCount,
  canGetNewOrder,
  pendingOrdersCount,
  getNextRepairOrder,
  isLoading
}: HomeProps) {
  const { currentUser } = useAuth();
  const { technicianOrders, pendingOrders } = useRepairOrders();
  const [outsideSkillLevelCount, setOutsideSkillLevelCount] = useState<number>(0);
  const [techSkillLevel, setTechSkillLevel] = useState<number>(1);

  // Check if technician has any active orders that are not on hold
  const hasActiveNonHoldOrders = currentUser && technicianOrders(currentUser.id).some(
    (order) => order.status === "in_progress" && order.assignedTo === currentUser.id
  );

  // Get technician's skill level and calculate orders outside skill level
  useEffect(() => {
    const fetchTechnicianSkillLevel = async () => {
      if (!currentUser) return;

      try {
        const { data, error } = await supabase
          .from("users")
          .select("skill_level")
          .eq("auth_id", currentUser.id)
          .single();

        if (error) {
          console.error("Error fetching technician skill level:", error);
          return;
        }

        const skillLevel = data?.skill_level || 1;
        setTechSkillLevel(skillLevel);

        // Count orders with difficulty level higher than technician's skill level
        const ordersOutsideSkill = pendingOrders.filter(
          (order) => order.difficulty_level > skillLevel
        ).length;

        setOutsideSkillLevelCount(ordersOutsideSkill);
      } catch (err) {
        console.error("Error calculating orders outside skill level:", err);
      }
    };

    fetchTechnicianSkillLevel();
  }, [currentUser, pendingOrders]);

  // Button should be disabled if:
  // 1. Can't get new order based on existing logic OR
  // 2. There are no pending orders OR
  // 3. Loading is in progress OR
  // 4. Technician has at least one active order not on hold
  const isButtonDisabled =
    !canGetNewOrder ||
    isLoading ||
    pendingOrdersCount === 0 ||
    hasActiveNonHoldOrders;

  // Determine the reason for button being disabled
  const getDisabledReason = () => {
    if (pendingOrdersCount === 0) {
      return "No pending orders available in the queue";
    } else if (!canGetNewOrder && activeOrderCount >= 5) {
      return "You've reached the maximum number of concurrent orders (5)";
    } else if (hasActiveNonHoldOrders) {
      return "You must complete or place your active order on hold before getting a new one";
    }
    return "Click to get the next available repair order";
  };

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      {/* Header with greeting and summary */}
      <div className="bg-gradient-to-r from-indigo-700 to-blue-600 rounded-xl shadow-lg p-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          {/* Left Side: Title + Skill */}
          <div>
            <h1 className="text-3xl font-bold text-white">Technician Dashboard</h1>
            <p className="text-blue-100 mt-2">
              Hello, {currentUser?.name || "Technician"} | Your Skill Level: Level {techSkillLevel}{" "}
              {techSkillLevel === 1 ? " (Beginner)" : techSkillLevel === 2 ? " (Intermediate)" : " (Advanced)"}
            </p>
          </div>

          {/* Right Side: Orders + "Get Next Repair Order" Button */}
          <div className="mt-4 md:mt-0 flex items-center space-x-4">
            <button
              onClick={getNextRepairOrder}
              disabled={isButtonDisabled}
              className={`flex items-center justify-center px-4 py-2 rounded-md text-white font-medium transition-all ${
                isButtonDisabled
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700 shadow-md hover:shadow-lg transform hover:-translate-y-1"
              }`}
              title={getDisabledReason()}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Assigning Order...
                </>
              ) : (
                <>
                  <PlusCircle className="h-5 w-5 mr-2" />
                  Get Next Repair Order
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Active Orders Card */}
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-indigo-500 hover:shadow-lg transition-shadow">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold text-gray-700">Active Orders</h2>
            <div className="p-2 bg-indigo-100 rounded-full">
              <Wrench className="h-5 w-5 text-indigo-600" />
            </div>
          </div>
          <div className="flex items-center">
            <div className="text-4xl font-bold text-indigo-600">{activeOrderCount}</div>
            <div className="ml-4 text-gray-600">
              {activeOrderCount === 1 ? "order in progress" : "orders in progress"}
            </div>
          </div>
        </div>

        {/* Pending Orders Card */}
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-amber-500 hover:shadow-lg transition-shadow">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold text-gray-700">Queue Status</h2>
            <div className="p-2 bg-amber-100 rounded-full">
              <Clock className="h-5 w-5 text-amber-600" />
            </div>
          </div>
          <div className="flex items-center mb-2">
            <div className="text-4xl font-bold text-amber-500">{pendingOrdersCount}</div>
            <div className="ml-4 text-gray-600">
              {pendingOrdersCount === 1 ? "order waiting" : "orders waiting"} in queue
            </div>
          </div>
          <div className="mt-2 flex items-center text-sm text-gray-500">
            <div className="bg-gray-200 text-gray-600 px-2 py-1 rounded font-medium mr-2">{outsideSkillLevelCount}</div>
            <span>outside your skill level</span>
          </div>
        </div>

        {/* Quick Stats Card */}
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-emerald-500 hover:shadow-lg transition-shadow">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold text-gray-700">Performance</h2>
            <div className="p-2 bg-emerald-100 rounded-full">
              <CheckCircle className="h-5 w-5 text-emerald-600" />
            </div>
          </div>
          <div className="flex items-center justify-center">
            <div className="text-center">
              <p className="text-gray-500 text-sm">Completed Today</p>
              <p className="text-4xl font-bold text-emerald-600">5</p>
            </div>
          </div>
        </div>
      </div>

      {/* 
        The old "Actions" card has been REMOVED.
        If you had any warnings or messages to display, 
        you can conditionally render them below or in a new location.
      */}

      {/* Quick Guide Card */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100 shadow-sm">
        <div className="flex items-center mb-4">
          <InfoIcon className="h-5 w-5 text-blue-700 mr-2" />
          <h3 className="text-lg font-semibold text-blue-800">Quick Guide</h3>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-start">
              <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 font-bold text-xs mr-3 mt-0.5">
                1
              </div>
              <p className="text-blue-800">You can only have one active repair order at a time</p>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 font-bold text-xs mr-3 mt-0.5">
                2
              </div>
              <p className="text-blue-800">
                Click "Get Next Repair Order" to get a new assignment from the queue
              </p>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 font-bold text-xs mr-3 mt-0.5">
                3
              </div>
              <p className="text-blue-800">
                Navigate to "Active Orders" to see all your current assignments
              </p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-start">
              <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 font-bold text-xs mr-3 mt-0.5">
                4
              </div>
              <p className="text-blue-800">Mark orders as complete when you've finished the repair</p>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 font-bold text-xs mr-3 mt-0.5">
                5
              </div>
              <p className="text-blue-800">
                Place the order on hold before getting a new one if you need to pause
              </p>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 font-bold text-xs mr-3 mt-0.5">
                6
              </div>
              <p className="text-blue-800">
                View your completed orders history in the "Completed Orders" tab
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
