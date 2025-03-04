"use client";

import React from "react";
import { useAuth } from "@/context/AuthContext";
import { useRepairOrders } from "@/context/RepairOrderContext";
import { CheckCircle, Clock } from "lucide-react";

export default function ActiveOrders() {
  const { currentUser } = useAuth();
  const { technicianOrders, completeRepairOrder } = useRepairOrders();

  if (!currentUser) return <p>Loading...</p>;

  const activeOrders = technicianOrders(currentUser.id).filter(
    (order) => order.status === "in_progress"
  );

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">My Active Orders</h2>

      {activeOrders.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-500">No active repair orders</p>
          <p className="text-sm text-gray-400 mt-2">
            Click "Get Next Repair Order" to receive a new order from the queue
          </p>
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
                    Time Elapsed
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {activeOrders.map((order) => {
                  // Calculate time elapsed since assignment
                  const assignedDate = order.assignedAt ? new Date(order.assignedAt) : new Date();
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

                  return (
                    <tr key={order.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {order.id}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {order.description}
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
                        <div className="text-sm text-gray-500 flex items-center">
                          <Clock size={16} className="mr-1" />
                          {timeElapsed}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => completeRepairOrder(order.id)}
                          className="flex items-center text-green-600 hover:text-green-900"
                        >
                          <CheckCircle size={16} className="mr-1" />
                          Mark Complete
                        </button>
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