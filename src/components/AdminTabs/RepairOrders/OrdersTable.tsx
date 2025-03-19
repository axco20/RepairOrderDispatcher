"use client";

import React, { useState } from "react";
import {
  Trash2,
  BarChart2,
  AlertTriangle,
  Play,
  Info,
} from "lucide-react";

interface RepairOrder {
  id: string;
  description?: string;
  orderDescription?: string;
  status: "pending" | "in_progress" | "completed" | "on_hold";
  priority?: number;
  priorityType?: string;
  difficulty_level?: number;
  createdAt?: string;
  completedAt?: string;
  assignedTo?: string;
  on_hold_description?: string; // Field for hold reason from database
  onHoldDescription?: string;   // Alternative field name (some systems might use this naming)
}

interface OrdersTableProps {
  loading: boolean;
  error: string | null;
  activeTab: string;
  orders: RepairOrder[];
  getTechnicianName: (authId?: string) => string;
  formatDate: (dateString?: string) => string;
  handleAssignOrder: (id: string, difficulty_level?: number) => void;
  handleDeleteOrder: (id: string) => void;
  handlePutOnHold: (id: string) => void;
  handleResumeOrder: (id: string) => void;
  getDifficultyBadgeColor: (level: number) => string;
}

const OrdersTable: React.FC<OrdersTableProps> = ({
  loading,
  error,
  activeTab,
  orders,
  getTechnicianName,
  formatDate,
  handleAssignOrder,
  handleDeleteOrder,
  handlePutOnHold,
  handleResumeOrder,
  getDifficultyBadgeColor,
}) => {
  // State for the hold reason tooltip/modal
  const [showReasonId, setShowReasonId] = useState<string | null>(null);

  // Helper function to get the hold reason regardless of how it's stored in the database
  const getHoldReason = (order: RepairOrder): string => {
    // Check for both possible field names and return the one that exists
    return order.on_hold_description || order.onHoldDescription || "No reason provided";
  };

  return (
    <div className="rounded-lg shadow-sm bg-white overflow-hidden">
      {loading ? (
        <div className="text-center py-6">Loading repair orders...</div>
      ) : error ? (
        <div className="text-center py-6 text-red-600">{error}</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-gray-500">No {activeTab.replace("_", " ")} orders found.</p>
        </div>
      ) : (
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Order ID
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Difficulty
              </th>
              {activeTab === "on_hold" && (
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hold Reason
                </th>
              )}
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Submitted
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Assigned To
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.map((order) => (
              <tr key={order.id}>
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                  {order.description || (order.id ? `#${order.id.substring(0, 6)}` : "N/A")}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span
                    className={`flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full ${
                      order.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : order.status === "in_progress"
                        ? "bg-blue-100 text-blue-800"
                        : order.status === "on_hold"
                        ? "bg-orange-100 text-orange-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {order.status.replace("_", " ")}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span
                    className={`flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full ${
                      getDifficultyBadgeColor(order.difficulty_level || 1)
                    }`}
                  >
                    <BarChart2 className="w-3 h-3" /> 
                    Level {order.difficulty_level || 1}
                  </span>
                </td>
                {activeTab === "on_hold" && (
                  <td className="px-4 py-3 text-sm text-gray-600">
                    <div className="relative">
                      {getHoldReason(order) !== "No reason provided" ? (
                        <>
                          <div className="flex items-center">
                            <span className="truncate max-w-xs block">
                              {getHoldReason(order).length > 30 
                                ? `${getHoldReason(order).substring(0, 30)}...` 
                                : getHoldReason(order)}
                            </span>
                            <button 
                              onClick={() => setShowReasonId(showReasonId === order.id ? null : order.id)}
                              className="ml-2 p-1 text-blue-500 hover:text-blue-700"
                            >
                              <Info size={16} />
                            </button>
                          </div>
                          
                          {/* Tooltip/Popup for full reason */}
                          {showReasonId === order.id && (
                            <div className="absolute z-10 bg-white border border-gray-200 rounded-md shadow-lg p-3 mt-1 w-72">
                              <div className="text-sm font-medium mb-1">Hold Reason:</div>
                              <div className="text-sm">{getHoldReason(order)}</div>
                            </div>
                          )}
                        </>
                      ) : (
                        <span className="text-gray-400 italic">No reason provided</span>
                      )}
                    </div>
                  </td>
                )}
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                  {formatDate(order.createdAt)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                  {order.assignedTo ? getTechnicianName(order.assignedTo) : "Unassigned"}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-2">
                    {/* Conditional buttons based on order status */}
                    {order.status === "pending" && (
                      <>
                        <button
                          onClick={() => handleAssignOrder(order.id, order.difficulty_level)}
                          className="px-3 py-1.5 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors duration-200 flex items-center gap-1"
                          aria-label="Assign order"
                        >
                          Assign
                        </button>
                        <button
                          onClick={() => handlePutOnHold(order.id)}
                          className="px-3 py-1.5 bg-orange-500 text-white rounded text-sm hover:bg-orange-600 transition-colors duration-200 flex items-center gap-1"
                          aria-label="Put order on hold"
                        >
                          <AlertTriangle className="w-4 h-4" /> Hold
                        </button>
                      </>
                    )}
                    
                    {order.status === "in_progress" && (
                      <>
                        <button
                          onClick={() => handlePutOnHold(order.id)}
                          className="px-3 py-1.5 bg-orange-500 text-white rounded text-sm hover:bg-orange-600 transition-colors duration-200 flex items-center gap-1"
                          aria-label="Put order on hold"
                        >
                          <AlertTriangle className="w-4 h-4" /> Hold
                        </button>
                      </>
                    )}
                    
                    {order.status === "on_hold" && (
                      <button
                        onClick={() => handleResumeOrder(order.id)}
                        className="px-3 py-1.5 bg-green-500 text-white rounded text-sm hover:bg-green-600 transition-colors duration-200 flex items-center gap-1"
                        aria-label="Resume order"
                      >
                        <Play className="w-4 h-4" /> Resume
                      </button>
                    )}
                    
                    {/* Delete button always available */}
                    <button
                      onClick={() => handleDeleteOrder(order.id)}
                      className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors duration-200"
                      aria-label="Delete order"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default OrdersTable;