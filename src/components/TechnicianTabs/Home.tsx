"use client";
import React from "react";
import { PlusCircle, Loader2 } from "lucide-react";
import { useRepairOrders } from "@/context/RepairOrderContext";
import { useAuth } from "@/context/AuthContext";

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
  const { technicianOrders } = useRepairOrders();
  
  // Check if technician has any active orders that are not on hold
  const hasActiveNonHoldOrders = currentUser && technicianOrders(currentUser.id).some(
    order => order.status === "in_progress" && order.assignedTo === currentUser.id
  );
  
  // Button should be disabled if:
  // 1. Can't get new order based on existing logic OR
  // 2. There are no pending orders OR
  // 3. Loading is in progress OR
  // 4. Technician has at least one active order not on hold
  const isButtonDisabled = !canGetNewOrder || isLoading || pendingOrdersCount === 0 || hasActiveNonHoldOrders;

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
            <div className="text-4xl font-bold text-amber-500">{pendingOrdersCount}</div>
            <div className="ml-4 text-gray-600">
              {pendingOrdersCount === 1 ? "order waiting" : "orders waiting"} in queue
            </div>
          </div>
        </div>
      </div>
      
      {/* Action Card */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Actions</h2>
        
        <div className="space-y-4">
          <button
            onClick={getNextRepairOrder}
            disabled={isButtonDisabled}
            className={`flex items-center justify-center w-full md:w-auto px-6 py-3 rounded-md text-white font-medium ${
              isButtonDisabled
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700"
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
          
          {!canGetNewOrder && activeOrderCount >= 5 && (
            <p className="text-amber-600 text-sm mt-2">
              You've reached the maximum number of concurrent orders (5)
            </p>
          )}
          
          {pendingOrdersCount === 0 && (
            <p className="text-amber-600 text-sm mt-2">
              No pending orders available in the queue
            </p>
          )}
          
          {hasActiveNonHoldOrders && pendingOrdersCount > 0 && (
            <p className="text-amber-600 text-sm mt-2">
              You must complete or place your active order on hold before getting a new one
            </p>
          )}
        </div>
      </div>
      
      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">Quick Guide</h3>
        <ul className="list-disc pl-5 space-y-1 text-blue-800">
          <li>You can only have one active repair order at a time</li>
          <li>Click "Get Next Repair Order" to get a new assignment from the queue</li>
          <li>Navigate to "Active Orders" to see all your current assignments</li>
          <li>Mark orders as complete when you've finished the repair</li>
          <li>If you need to pause your work, place the order on hold before getting a new one</li>
          <li>View your completed orders history in the "Completed Orders" tab</li>
        </ul>
      </div>
    </div>
  );
}