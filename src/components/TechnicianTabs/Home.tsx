"use client";
import React, { useEffect, useState } from "react";
import { PlusCircle, Loader2 } from "lucide-react";
import { useRepairOrders } from "@/context/RepairOrderContext";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabaseClient"; // or wherever you import it

import type { RepairOrder } from "@/types/repairOrder";

export default function HomeContainer() {
  const { currentUser } = useAuth();
  const {
    pendingOrders,
    getNextRepairOrder: fetchNextOrder,
    technicianActiveOrderCount,
    canRequestNewOrder,
  } = useRepairOrders();

  const [isLoading, setIsLoading] = useState(false);

  // NEW: Store the tech’s skill level
  const [techSkillLevel, setTechSkillLevel] = useState<number>(1);

  useEffect(() => {
    if (!currentUser) return;
    // Fetch skill level from Supabase or wherever you store it
    const loadSkillLevel = async () => {
      try {
        const { data, error } = await supabase
          .from("users")
          .select("skill_level")
          .eq("auth_id", currentUser.id)
          .single();

        if (!error && data) {
          setTechSkillLevel(data.skill_level || 1);
        }
      } catch (err) {
        console.error("Error fetching skill level:", err);
      }
    };
    loadSkillLevel();
  }, [currentUser]);

  if (!currentUser) {
    return <div>Loading user information...</div>;
  }

  const activeOrderCount = technicianActiveOrderCount(currentUser.id);
  const pendingOrdersCount = pendingOrders.length;
  const canGetNewOrder = canRequestNewOrder(currentUser.id);

  const handleGetNextOrder = async () => {
    try {
      setIsLoading(true);
      await fetchNextOrder(currentUser.id);
    } catch (error) {
      console.error("Error getting next order:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter pending orders by skill
  const skillEligiblePendingOrders = pendingOrders.filter(
    (order) => order.difficulty_level <= techSkillLevel
  );
  const skillEligibleCount = skillEligiblePendingOrders.length;

  return (
    <Home
      activeOrderCount={activeOrderCount}
      canGetNewOrder={canGetNewOrder}
      pendingOrdersCount={pendingOrdersCount}
      getNextRepairOrder={handleGetNextOrder}
      isLoading={isLoading}
      techSkillLevel={techSkillLevel}
      skillEligibleCount={skillEligibleCount}
    />
  );
}

// Presentational component
function Home({
  activeOrderCount,
  canGetNewOrder,
  pendingOrdersCount,
  getNextRepairOrder,
  isLoading,
  techSkillLevel,
  skillEligibleCount,
}: {
  activeOrderCount: number;
  canGetNewOrder: boolean;
  pendingOrdersCount: number;
  getNextRepairOrder: () => Promise<void>;
  isLoading: boolean;
  techSkillLevel: number;
  skillEligibleCount: number;
}) {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-800">Technician Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Active Orders Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Active Orders</h2>
          <div className="flex items-center">
            <div className="text-4xl font-bold text-indigo-600">{activeOrderCount}</div>
            <div className="ml-4 text-gray-600">
              {activeOrderCount === 1 ? "order in progress" : "orders in progress"}
            </div>
          </div>
        </div>

        {/* Pending Orders Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Queue Status</h2>
          <div className="flex items-center">
            {/* Show how many pending orders match this tech’s skill level */}
            <div className="text-4xl font-bold text-amber-500">
              {skillEligibleCount}
            </div>
            <div className="ml-4 text-gray-600">
              {skillEligibleCount === 1 ? "order" : "orders"} eligible
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            ({pendingOrdersCount} orders outside skill level)
          </p>
        </div>
      </div>

      {/* Actions Card */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Actions</h2>
        <div className="space-y-4">
          <button
            onClick={getNextRepairOrder}
            disabled={skillEligibleCount === 0} // or still disable if total pending is 0
            className={`flex items-center justify-center w-full md:w-auto px-6 py-3 rounded-md text-white font-medium ${
              canGetNewOrder && !isLoading && skillEligibleCount > 0
                ? "bg-indigo-600 hover:bg-indigo-700"
                : "bg-gray-400 cursor-not-allowed"
            }`}
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

          {!canGetNewOrder && activeOrderCount >= 5 && (
            <p className="text-amber-600 text-sm mt-2">
              You've reached the maximum number of concurrent orders (5)
            </p>
          )}

          {!canGetNewOrder && skillEligibleCount === 0 && (
            <p className="text-amber-600 text-sm mt-2">
              No orders match your skill level (or none are pending).
            </p>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">Quick Guide</h3>
        <ul className="list-disc pl-5 space-y-1 text-blue-800">
          <li>Click "Get Next Repair Order" to get a new assignment from the queue</li>
          <li>Navigate to "Active Orders" to see all your current assignments</li>
          <li>Mark orders as complete when you've finished the repair</li>
          <li>View your completed orders history in the "Completed Orders" tab</li>
        </ul>
      </div>
    </div>
  );
}
