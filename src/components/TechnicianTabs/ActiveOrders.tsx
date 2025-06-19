"use client";
//activeOrders.tsx
import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRepairOrders } from "@/context/RepairOrderContext";
import { CheckCircle, Clock, AlertTriangle, Pause } from "lucide-react";
import { toast } from "react-toastify";
import { supabase } from "@/lib/supabaseClient";

export default function ActiveOrders() {
  const { currentUser } = useAuth();
  const { technicianOrders, completeRepairOrder, refreshOrders } =
    useRepairOrders();
  const [isUpdatingOrder, setIsUpdatingOrder] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [confirmingOrderId, setConfirmingOrderId] = useState<string | null>(
    null
  ); // State for completion confirmation modal

  // New state for hold functionality
  const [holdOrderId, setHoldOrderId] = useState<string | null>(null); // State for hold modal
  const [holdReason, setHoldReason] = useState<string>(""); // State for hold reason

  // Initial data load and set up refresh interval - with no dependencies
  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      if (!isMounted) return;
      setRefreshing(true);

      try {
        await refreshOrders();
      } catch (err) {
        // Error refreshing orders
      } finally {
        if (isMounted) {
          setRefreshing(false);
        }
      }
    };

    // Initial load
    loadData();

    // Set up interval for periodic refresh
    const interval = setInterval(() => {
      if (isMounted) {
        loadData();
      }
    }, 30000);

    // Cleanup function
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []); // Empty dependency array - only run once on mount

  if (!currentUser) return <p>Loading...</p>;

  const activeOrders = technicianOrders(currentUser.id).filter(
    (order) =>
      order.status === "in_progress" && order.assignedTo === currentUser.id
  );

  // Handle confirming completion
  const handleConfirmComplete = (orderId: string) => {
    setConfirmingOrderId(orderId);
  };

  // Proceed with completion
  const confirmCompletion = async () => {
    if (confirmingOrderId) {
      setIsUpdatingOrder(confirmingOrderId);

      try {
        const success = await completeRepairOrder(confirmingOrderId);

        if (success) {
          toast.success("Repair order marked as complete!");
          // Manually refresh orders instead of relying on context
          setRefreshing(true);
          await refreshOrders();
          setRefreshing(false);
        } else {
          toast.error("Failed to complete repair order");
        }
      } catch (err) {
        toast.error("Error completing order");
      } finally {
        setConfirmingOrderId(null);
        setIsUpdatingOrder(null);
      }
    }
  };

  // Show the hold reason modal
  const handleShowHoldModal = (orderId: string) => {
    setHoldOrderId(orderId);
    setHoldReason(""); // Reset reason when opening the modal
  };

  // Handle placing an order on hold with reason
  const confirmHold = async () => {
    if (!holdOrderId) return;

    if (!holdReason.trim()) {
      toast.error("Please provide a reason for placing this order on hold");
      return;
    }

    try {
      setIsUpdatingOrder(holdOrderId);

      const { error } = await supabase
        .from("repair_orders")
        .update({
          status: "on_hold",
          on_hold_description: holdReason.trim(),
        })
        .eq("id", holdOrderId);

      if (error) throw error;

      toast.success("Repair order marked as on hold!");

      // Manually refresh orders
      setRefreshing(true);
      await refreshOrders();
      setRefreshing(false);

      // Clear the modal state
      setHoldOrderId(null);
      setHoldReason("");
    } catch (error) {
      toast.error("Error updating order status");
    } finally {
      setIsUpdatingOrder(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">My Active Orders</h2>
        {refreshing && (
          <span className="text-sm text-gray-500 animate-pulse">
            Refreshing...
          </span>
        )}
      </div>

      {activeOrders.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-500">No active repair orders</p>
          <p className="text-sm text-gray-400 mt-2">
            Click &quot;Get Next Repair Order&quot; to receive a new order from
            the queue
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Repair Order #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Assigned At
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Time Elapsed
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {activeOrders.map((order) => {
                  const assignedDate = order.assignedAt
                    ? new Date(order.assignedAt)
                    : new Date();
                  const now = new Date();
                  const elapsedMs = now.getTime() - assignedDate.getTime();
                  const elapsedMinutes = Math.floor(elapsedMs / (1000 * 60));
                  const elapsedHours = Math.floor(elapsedMinutes / 60);

                  const timeElapsed =
                    elapsedHours > 0
                      ? `${elapsedHours}h ${elapsedMinutes % 60}m`
                      : `${elapsedMinutes}m`;

                  const showWarning = elapsedHours >= 2;

                  return (
                    <tr key={order.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {order.description}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div
                          className={`text-sm ${
                            order.orderDescription
                              ? "text-gray-900"
                              : "text-gray-400 italic"
                          }`}
                        >
                          {order.orderDescription
                            ? order.orderDescription
                            : "No Description"}
                        </div>
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
                          <button
                            onClick={() => handleConfirmComplete(order.id)}
                            className="flex items-center px-4 py-2 rounded-lg font-medium bg-green-600 text-white hover:bg-green-700 transition-all duration-300"
                            disabled={isUpdatingOrder === order.id}
                          >
                            <CheckCircle size={18} className="mr-2" />
                            Mark Complete
                          </button>

                          <button
                            onClick={() => handleShowHoldModal(order.id)}
                            className="flex items-center px-4 py-2 rounded-lg font-medium bg-orange-600 text-white hover:bg-orange-700 transition-all duration-300"
                            disabled={isUpdatingOrder === order.id}
                          >
                            <Pause size={18} className="mr-2" />
                            Place On Hold
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

      {/* Completion Confirmation Modal */}
      {confirmingOrderId && (
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur bg-black/30 bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-lg font-semibold text-gray-800">
              Confirm Completion
            </h3>
            <p className="text-gray-600 mt-2">
              Are you sure you want to complete this order?
            </p>
            <div className="flex justify-end space-x-4 mt-4">
              <button
                onClick={confirmCompletion}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Confirm
              </button>
              <button
                onClick={() => setConfirmingOrderId(null)}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hold Reason Modal */}
      {holdOrderId && (
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur bg-black/30 bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-lg font-semibold text-gray-800">
              Place Order On Hold
            </h3>
            <p className="text-gray-600 mt-2 mb-3">
              Please provide a reason for placing this order on hold:
            </p>

            <textarea
              value={holdReason}
              onChange={(e) => setHoldReason(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              placeholder="Enter reason here..."
              rows={4}
            />

            <div className="flex justify-end space-x-4 mt-4">
              <button
                onClick={() => setHoldOrderId(null)}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={confirmHold}
                className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
                disabled={!holdReason.trim()}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
