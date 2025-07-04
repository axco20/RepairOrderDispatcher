"use client";
//activeOrders.tsx
import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRepairOrders } from "@/context/RepairOrderContext";
import { CheckCircle, Clock, AlertTriangle, Info } from "lucide-react";
import { toast } from "react-toastify";
import { supabase } from "@/lib/supabaseClient";

export default function ActiveOrders() {
  const { currentUser } = useAuth();
  const { technicianOrders, refreshOrders } =
    useRepairOrders();
  const [refreshing, setRefreshing] = useState(false);
  const [showReasonId, setShowReasonId] = useState<string | null>(null);

  // Helper function to get the hold reason
  const getHoldReason = (order: any): string => {
    // Check multiple possible fields for the hold reason
    return order.on_hold_description 
      || order.onHoldDescription 
      || order.hold_reason 
      || 'No specific reason provided';
  };

  // FIX: Only run once on mount and do manual refresh after state changes
  useEffect(() => {
    const loadOrders = async () => {
      setRefreshing(true);
      await refreshOrders();
      setRefreshing(false);
    };

    loadOrders();

    // Auto-refresh every 30 seconds
    const interval = setInterval(loadOrders, 30000);

    return () => clearInterval(interval);
    // IMPORTANT: Remove refreshOrders from the dependency array
  }, []);

  if (!currentUser) return <p>Loading...</p>;

  const activeOrders = technicianOrders(currentUser.id).filter(
    (order) =>
      order.status === "on_hold" && order.assignedTo === currentUser.id
  );

  const handleReassign = async (orderId: string) => {
    try {
      // Update order status to 'in_progress' in Supabase
      const { error } = await supabase
        .from("repair_orders")
        .update({ status: "in_progress" })
        .eq("id", orderId);

      if (error) {
        throw error;
      }

      toast.success("Repair order reclaimed!");
      await refreshOrders();
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error("An error occurred while updating the order status.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">On Hold Orders</h2>
        {refreshing && (
          <span className="text-sm text-gray-500 animate-pulse">
            Refreshing...
          </span>
        )}
      </div>

      {activeOrders.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-500">No Orders On Hold</p>
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
                    On Hold Reason
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assigned At
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time Elapsed
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {activeOrders.map((order) => {
                  // Calculate time elapsed since assignment
                  const assignedDate = order.assignedAt
                    ? new Date(order.assignedAt)
                    : new Date();
                  const now = new Date();
                  const elapsedMs = now.getTime() - assignedDate.getTime();
                  const elapsedMinutes = Math.floor(elapsedMs / (1000 * 60));
                  const elapsedHours = Math.floor(elapsedMinutes / 60);

                  let timeElapsed = "";
                  if (elapsedHours > 0) {
                    timeElapsed = `${elapsedHours}h ${elapsedMinutes % 60}m`;
                  } else {
                    timeElapsed = `${elapsedMinutes}m`;
                  }

                  // Show warning if over 2 hours
                  const showWarning = elapsedHours >= 2;

                  // Get hold reason
                  const holdReason = getHoldReason(order);

                  return (
                    <tr key={order.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {/* Shortened ID for better display */}
                          {order.id.substring(0, 8)}...
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {order.description}
                        </div>
                        {order.orderDescription && (
                          <div className="text-xs text-gray-500 mt-1">
                            {order.orderDescription}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 relative">
                        <div className="flex items-center">
                          <span className="text-sm text-gray-500 truncate max-w-[200px]">
                            {holdReason.length > 30 
                              ? `${holdReason.substring(0, 30)}...` 
                              : holdReason}
                          </span>
                          {holdReason.length > 30 && (
                            <button 
                              onClick={() => setShowReasonId(showReasonId === order.id ? null : order.id)}
                              className="ml-2 text-blue-500 hover:text-blue-700"
                            >
                              <Info size={16} />
                            </button>
                          )}
                        </div>
                        
                        {/* Full reason popup */}
                        {showReasonId === order.id && (
                          <div className="absolute z-10 bg-white border border-gray-200 rounded-md shadow-lg p-3 mt-1 w-72">
                            <div className="text-sm font-medium mb-1">Hold Reason:</div>
                            <div className="text-sm">{holdReason}</div>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {order.assignedAt
                            ? new Date(order.assignedAt).toLocaleString()
                            : "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div
                          className={`text-sm flex items-center ${
                            showWarning ? "text-amber-600" : "text-gray-500"
                          }`}
                        >
                          {showWarning ? (
                            <AlertTriangle size={16} className="mr-1" />
                          ) : (
                            <Clock size={16} className="mr-1" />
                          )}
                          {timeElapsed}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center">
                        <div className="flex items-center justify-center gap-x-6">
                          {/* Reclaim Button */}
                          <button
                            onClick={() => handleReassign(order.id)}
                            className="flex items-center px-4 py-2 rounded-lg font-medium bg-blue-600 text-white hover:bg-blue-700 transition-all duration-300"
                          >
                            <CheckCircle size={18} className="mr-2" />
                            Reclaim Order
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}