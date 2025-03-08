"use client";

// components/Orders.tsx
import React, { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { useRepairOrders } from "@/context/RepairOrderContext";
import { toast } from "react-toastify";

const Orders: React.FC = () => {
  const {
    repairOrders,
    loading,
    error,
    refreshOrders,
    createRepairOrder,
    updateRepairOrder,
    deleteRepairOrder
  } = useRepairOrders();

  const [searchQuery, setSearchQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    description: "",
    orderDescription: "", 
    priority: 1,
    priorityType: "WAIT" as "WAIT" | "VALET" | "LOANER",
    status: "pending" as "pending" | "in_progress" | "completed"
  });

  useEffect(() => {
    refreshOrders();
  }, []);

  // Filtered orders based on search query
  const filteredOrders = repairOrders.filter(
    (order) =>
      order.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.orderDescription?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group orders by status
  const pendingOrders = filteredOrders.filter((o) => o.status === "pending");
  const inProgressOrders = filteredOrders.filter((o) => o.status === "in_progress");
  const completedOrders = filteredOrders.filter((o) => o.status === "completed");

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "priority" ? parseInt(value) : value,
    }));
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Make sure required fields are present
      if (!formData.description) {
        toast.error("❌ Description is required.");
        return;
      }

      const result = await createRepairOrder(formData);

      if (result) {
        toast.success("✅ Repair order created successfully!");
        setShowForm(false);
        setFormData({
          description: "",
          orderDescription: "",
          priority: 1,
          priorityType: "WAIT",
          status: "pending"
        });
      } else {
        toast.error("❌ Failed to create repair order.");
      }
    } catch (error) {
      toast.error("❌ Error creating repair order: " + error);
    }
  };

  const handleStatusChange = async (id: string, newStatus: "pending" | "in_progress" | "completed") => {
    try {
      let updates: Partial<any> = { status: newStatus };
      
      // Add timestamps for completed orders
      if (newStatus === "completed") {
        updates.completedAt = new Date().toISOString();
      }
      
      const result = await updateRepairOrder(id, updates);
      
      if (result) {
        toast.success(`✅ Order status updated to ${newStatus}!`);
      } else {
        toast.error("❌ Failed to update order status.");
      }
    } catch (error) {
      toast.error("❌ Error updating order status: " + error);
    }
  };

  const handleDeleteOrder = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this repair order?")) {
      try {
        const success = await deleteRepairOrder(id);
        if (success) {
          toast.success("✅ Repair order deleted successfully!");
        } else {
          toast.error("❌ Failed to delete repair order.");
        }
      } catch (error) {
        toast.error("❌ Error deleting repair order: " + error);
      }
    }
  };

  // Priority label display
  const getPriorityLabel = (priority: number, type?: string) => {
    let label = "";
    switch (priority) {
      case 1:
        label = "Low";
        break;
      case 2:
        label = "Medium";
        break;
      case 3:
        label = "High";
        break;
      default:
        label = `Level ${priority}`;
    }
    
    return type ? `${label} (${type})` : label;
  };

  // Get status color class
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Format date helper
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString();
  };

  // Render a single order card
  const renderOrderCard = (order: any) => (
    <div
      key={order.id}
      className="bg-white p-4 rounded-lg shadow mb-4 border-l-4 border-indigo-500"
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium text-gray-900">
            {order.description}
          </h3>
          {order.orderDescription && (
            <p className="text-sm mt-1 text-gray-500">
              {order.orderDescription}
            </p>
          )}
        </div>
        <div className="flex flex-col items-end">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
              order.status
            )}`}
          >
            {order.status.replace("_", " ")}
          </span>
          <span className="text-xs text-gray-500 mt-1">
            Created: {formatDate(order.createdAt)}
          </span>
          {order.completedAt && (
            <span className="text-xs text-gray-500">
              Completed: {formatDate(order.completedAt)}
            </span>
          )}
        </div>
      </div>
      
      <div className="mt-3 pt-3 border-t border-gray-200 flex justify-between items-center">
        <div>
          <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
            {getPriorityLabel(order.priority, order.priorityType)}
          </span>
        </div>
        <div className="flex space-x-2">
          <select
            value={order.status}
            onChange={(e) =>
              handleStatusChange(
                order.id,
                e.target.value as "pending" | "in_progress" | "completed"
              )
            }
            className="text-sm border border-gray-300 rounded p-1"
          >
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
          <button
            onClick={() => handleDeleteOrder(order.id)}
            className="text-red-600 hover:text-red-900 text-sm"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Repair Orders</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-indigo-600 text-white font-medium rounded hover:bg-indigo-700"
          >
            {showForm ? "Cancel" : "New Order"}
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 
                       rounded-md leading-5 bg-white placeholder-gray-500 
                       focus:outline-none focus:ring-indigo-500 
                       focus:border-indigo-500 sm:text-sm"
            placeholder="Search repair orders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Create Order Form */}
        {showForm && (
          <div className="bg-white p-6 rounded-lg shadow mb-8">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">
              Create New Repair Order
            </h2>
            <form onSubmit={handleCreateOrder}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <input
                    type="text"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    placeholder="Brief issue description"
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      name="priority"
                      value={formData.priority}
                      onChange={handleInputChange}
                      className="p-2 border border-gray-300 rounded"
                    >
                      <option value="1">Low</option>
                      <option value="2">Medium</option>
                      <option value="3">High</option>
                    </select>

                    <select
                      name="priorityType"
                      value={formData.priorityType}
                      onChange={handleInputChange}
                      className="p-2 border border-gray-300 rounded"
                    >
                      <option value="WAIT">Wait</option>
                      <option value="VALET">Valet</option>
                      <option value="LOANER">Loaner</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Order Details
                </label>
                <textarea
                  name="orderDescription"
                  value={formData.orderDescription}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full p-2 border border-gray-300 rounded"
                ></textarea>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white font-medium rounded hover:bg-indigo-700"
                >
                  Create Order
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="text-center py-8">Loading repair orders...</div>
        ) : error ? (
          <div className="text-center py-8 text-red-600">{error}</div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500">
              No repair orders found. Create your first order to get started.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {/* Pending Orders Section */}
            <div>
              <h2 className="text-lg font-semibold text-gray-700 mb-3">
                Pending Orders ({pendingOrders.length})
              </h2>
              {pendingOrders.length === 0 ? (
                <p className="text-sm text-gray-500 italic mb-4">No pending orders</p>
              ) : (
                pendingOrders.map(renderOrderCard)
              )}
            </div>

            {/* In Progress Orders Section */}
            <div>
              <h2 className="text-lg font-semibold text-gray-700 mb-3">
                In Progress ({inProgressOrders.length})
              </h2>
              {inProgressOrders.length === 0 ? (
                <p className="text-sm text-gray-500 italic mb-4">No orders in progress</p>
              ) : (
                inProgressOrders.map(renderOrderCard)
              )}
            </div>

            {/* Completed Orders Section */}
            <div>
              <h2 className="text-lg font-semibold text-gray-700 mb-3">
                Completed ({completedOrders.length})
              </h2>
              {completedOrders.length === 0 ? (
                <p className="text-sm text-gray-500 italic">No completed orders</p>
              ) : (
                completedOrders.map(renderOrderCard)
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;