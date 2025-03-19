"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  Clock,
  Tag,
  Check,
  Plus,
  Trash2,
  Settings,
  CheckCircle,
  BarChart2,
} from "lucide-react";
import { useRepairOrders } from "@/context/RepairOrderContext";
import { toast } from "react-toastify";
import { supabase } from "@/lib/supabaseClient";
import Select from "react-select";

// Define types for technicians and react-select options
interface Technician {
  id: string;
  auth_id: string;
  name: string;
  email: string;
  role: string;
  skill_level: number; // Added skill level
  
}

interface TechnicianOption {
  value: string;
  label: string;
  skill_level: number; // Added skill level
}

interface RepairOrder {
  id: string;
  description?: string;
  orderDescription?: string;
  status: "pending" | "in_progress" | "completed";
  priority?: number;
  priorityType?: string;
  difficulty_level?: number; // Added difficulty level
  createdAt?: string;
  completedAt?: string;
  assignedTo?: string;
}

const Orders: React.FC = () => {
  const {
    repairOrders,
    loading,
    error,
    refreshOrders,
    createRepairOrder,
    updateRepairOrder,
    deleteRepairOrder,
  } = useRepairOrders();

  // Local states
  const [searchQuery, setSearchQuery] = useState("");
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState("pending");
  const [formData, setFormData] = useState({
    description: "",
    orderDescription: "",
    priority: 1, // Keeping for backend compatibility
    priorityType: "WAIT" as "WAIT" | "VALET" | "LOANER",
    difficulty_level: 1, // Default difficulty level
    status: "pending" as "pending" | "in_progress" | "completed",
    assignedTo: "",
    
  });
  // Assignment modal state – note that we replace the plain input with a react-select state
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState("");
  const [selectedTechnicianOption, setSelectedTechnicianOption] =
    useState<TechnicianOption | null>(null);

  // Fetch technicians on mount
  useEffect(() => {
    const fetchTechnicians = async () => {
      try {
        // 1. Get the currently authenticated user
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError || !userData?.user?.id) {
          console.error("No current user found:", userError);
          return;
        }
  
        // 2. Fetch the dealership_id for this admin
        const { data: adminData, error: adminError } = await supabase
          .from("users")
          .select("dealership_id")
          .eq("auth_id", userData.user.id)
          .single();
  
        if (adminError || !adminData?.dealership_id) {
          console.error("Error retrieving dealership_id:", adminError);
          return;
        }
  
        // 3. Fetch technicians who share that dealership_id
        const { data, error } = await supabase
          .from("users")
          .select("*")
          .eq("role", "technician")
          .eq("dealership_id", adminData.dealership_id);
  
        if (error) {
          console.error("Error fetching technicians:", error);
          return;
        }
  
        // Now you only have technicians from the same dealership
        setTechnicians(data || []);
      } catch (err) {
        console.error("Error fetching technicians:", err);
      }
    };
  
    fetchTechnicians();
  }, []);
  

  // Refresh orders on mount
  useEffect(() => {
    refreshOrders();
  }, []);

  // Helper to compute the active order count for a given technician (e.g. orders "in_progress")
  const technicianActiveOrderCount = (techAuthId: string) => {
    return repairOrders.filter(
      (order) => order.assignedTo === techAuthId && order.status === "in_progress"
    ).length;
  };

  // Compute technician options using the technicians state and active order counts
  useEffect(() => {
    const fetchTechnicians = async () => {
      // Get current user
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) {
        console.error("Error retrieving user:", userError);
        return;
      }
      const currentUser = userData?.user;
  
      // Fetch only technicians for the current user's dealership
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("role", "technician")
        .eq("dealership_id", currentUser?.id);
  
      if (error) {
        console.error("Error fetching technicians:", error);
      } else if (data) {
        setTechnicians(data);
      }
    };
  
    fetchTechnicians();
  }, []);
  
  // Now create a technicianOptions variable from the `technicians` array
  const technicianOptions = useMemo(() => {
    return technicians.map((tech) => ({
      value: tech.auth_id,
      label: `${tech.name} (Level ${tech.skill_level})`,
      skill_level: tech.skill_level,
    }));
  }, [technicians]);
  

  // Helper to get technician name for display in the table
  const getTechnicianName = (authId?: string) => {
    if (!authId) return "Unassigned";
    const found = technicians.find((tech) => tech.auth_id === authId);
    return found ? found.name : "Unknown Technician";
  };

  // Handle changes in the create order form inputs
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "priority" || name === "difficulty_level" ? parseInt(value) : value,
    }));
  };

  // Map priorityType to a numeric priority value
  const getPriorityFromType = (type: string): number => {
    switch (type) {
      case "WAIT":
        return 1;
      case "VALET":
        return 2;
      case "LOANER":
        return 3;
      default:
        return 1;
    }
  };

  const handlePriorityTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const priorityType = e.target.value as "WAIT" | "VALET" | "LOANER";
    const priority = getPriorityFromType(priorityType);
    setFormData((prev) => ({
      ...prev,
      priorityType,
      priority,
    }));
  };

  // Create order handler
  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description) {
      toast.error("❌ Repair Order Number is required.");
      return;
    }
    const dataToSubmit = {
      ...formData,
      priority: getPriorityFromType(formData.priorityType),
    };

    const result = await createRepairOrder(dataToSubmit);
    if (result) {
      toast.success("✅ Repair order created successfully!");
      setShowForm(false);
      setFormData({
        description: "",
        orderDescription: "",
        priority: 1,
        priorityType: "WAIT",
        difficulty_level: 1,
        status: "pending",
        assignedTo: "",
      });
      if (formData.status === "pending") {
        setActiveTab("pending");
      }
    } else {
      toast.error("❌ Failed to create repair order.");
    }
  };

  // Delete order handler
  const handleDeleteOrder = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this repair order?")) {
      const success = await deleteRepairOrder(id);
      if (success) {
        toast.success("✅ Repair order deleted successfully!");
      } else {
        toast.error("❌ Failed to delete repair order.");
      }
    }
  };

  // Open the assign modal and clear any previous selection
  const handleAssignOrder = (id: string, difficulty_level: number = 1) => {
    setCurrentOrderId(id);
    setSelectedTechnicianOption(null);
    setIsAssignModalOpen(true);
  };

  // Handle assignment submission using the selected technician from react-select
  const handleAssignSubmit = async () => {
    if (!selectedTechnicianOption) {
      toast.error("❌ Please select a technician to assign this order to.");
      return;
    }

    // Find the current order to check difficulty level
    const currentOrder = repairOrders.find(order => order.id === currentOrderId);
    if (!currentOrder) {
      toast.error("❌ Order not found.");
      return;
    }

    // Check if technician's skill level is sufficient for the order's difficulty
    if ((selectedTechnicianOption.skill_level || 1) < (currentOrder.difficulty_level || 1)) {
      toast.error(`❌ This technician (Level ${selectedTechnicianOption.skill_level}) doesn't have the required skill level (Level ${currentOrder.difficulty_level}) for this order.`);
      return;
    }

    try {
      const updates = { assignedTo: selectedTechnicianOption.value, status: "in_progress" };
      const result = await updateRepairOrder(currentOrderId, updates);
      if (result) {
        toast.success(`✅ Order assigned to ${selectedTechnicianOption.label}!`);
        setIsAssignModalOpen(false);
        setSelectedTechnicianOption(null);
      } else {
        toast.error("❌ Failed to assign order.");
      }
    } catch (error) {
      toast.error("❌ Error assigning order: " + error);
    }
  };

  // Date formatting helper
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return `${date.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
    })}, ${date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })}`;
  };

  // Filter orders based on search query
  const filteredOrders = repairOrders.filter(
    (order) =>
      order.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.orderDescription?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group orders by status and (for completed) sort by most recent
  const pendingOrders = filteredOrders.filter((o) => o.status === "pending");
  const inProgressOrders = filteredOrders.filter((o) => o.status === "in_progress");
  const completedOrders = filteredOrders
    .filter((o) => o.status === "completed")
    .sort((a: RepairOrder, b: RepairOrder) => {
      const dateA = a.completedAt ? new Date(a.completedAt) : new Date(a.createdAt || 0);
      const dateB = b.completedAt ? new Date(b.completedAt) : new Date(b.createdAt || 0);
      return dateB.getTime() - dateA.getTime();
    })
    .slice(0, 50);

  // Tab configuration
  const tabs = [
    {
      id: "pending",
      label: "Pending",
      count: pendingOrders.length,
      icon: <Clock className="w-5 h-5" />,
      color: "yellow",
    },
    {
      id: "in_progress",
      label: "In Progress",
      count: inProgressOrders.length,
      icon: <Settings className="w-5 h-5" />,
      color: "blue",
    },
    {
      id: "completed",
      label: "Completed",
      count: completedOrders.length,
      icon: <CheckCircle className="w-5 h-5" />,
      color: "green",
    },
  ];

  const getActiveOrders = () => {
    switch (activeTab) {
      case "pending":
        return pendingOrders;
      case "in_progress":
        return inProgressOrders;
      case "completed":
        return completedOrders;
      default:
        return pendingOrders;
    }
  };

  // Custom styles for react-select
  const customSelectStyles = {
    control: (base: any) => ({
      ...base,
      backgroundColor: "#374151",
      borderColor: "#4B5563",
      color: "white",
      boxShadow: "none",
      "&:hover": {
        borderColor: "#6366F1",
      },
    }),
    menu: (base: any) => ({
      ...base,
      backgroundColor: "#1F2937",
      color: "white",
      borderRadius: "0.375rem",
      boxShadow:
        "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
    }),
    option: (base: any, state: { isSelected: any; isFocused: any }) => ({
      ...base,
      backgroundColor: state.isSelected ? "#4F46E5" : state.isFocused ? "#374151" : "#1F2937",
      ":active": {
        backgroundColor: "#4F46E5",
      },
      color: "white",
    }),
    singleValue: (base: any) => ({
      ...base,
      color: "white",
    }),
    input: (base: any) => ({
      ...base,
      color: "white",
    }),
    placeholder: (base: any) => ({
      ...base,
      color: "#9CA3AF",
    }),
  };

  // Helper to get badge color for difficulty level
  const getDifficultyBadgeColor = (level: number) => {
    switch(level) {
      case 1: return "bg-green-100 text-green-800";
      case 2: return "bg-yellow-100 text-yellow-800";
      case 3: return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Settings className="w-5 h-5 text-indigo-600" />
            Repair Orders
          </h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-3 py-1.5 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 shadow-sm flex items-center gap-1 transition-colors duration-200 text-sm"
          >
            {showForm ? "Cancel" : <><Plus className="w-4 h-4" /> New Order</>}
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm shadow-sm"
            placeholder="Search repair orders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Create Order Form */}
        {showForm && (
          <div className="bg-white p-4 rounded-lg shadow-sm mb-6 border border-gray-200">
            <h2 className="text-base font-semibold text-gray-700 mb-3 flex items-center gap-1">
              <Plus className="w-4 h-4 text-indigo-600" /> Create New Repair Order
            </h2>
            <form onSubmit={handleCreateOrder}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Repair Order Number *
                  </label>
                  <input
                    type="text"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter repair order number"
                    className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <select
                    name="priorityType"
                    value={formData.priorityType}
                    onChange={handlePriorityTypeChange}
                    className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  >
                    <option value="WAIT">Wait</option>
                    <option value="VALET">Valet</option>
                    <option value="LOANER">Loaner</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Difficulty Level
                  </label>
                  <select
                    name="difficulty_level"
                    value={formData.difficulty_level}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  >
                    <option value={1}>Level 1 (Basic)</option>
                    <option value={2}>Level 2 (Intermediate)</option>
                    <option value={3}>Level 3 (Advanced)</option>
                  </select>
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
                  rows={2}
                  className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  placeholder="Additional details about the repair order..."
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 shadow-sm flex items-center gap-1 transition-colors duration-200 text-sm"
                >
                  <Check className="w-4 h-4" /> Create Order
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="flex border-b">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-2 px-6 text-sm font-medium border-b-2 focus:outline-none ${
                  activeTab === tab.id
                    ? `border-${tab.color}-500 text-${tab.color}-600 -mb-px`
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <span
                  className={`mr-2 ${
                    activeTab === tab.id ? `text-${tab.color}-500` : "text-gray-400"
                  }`}
                >
                  {tab.icon}
                </span>
                {tab.label}
                <span
                  className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                    activeTab === tab.id
                      ? `bg-${tab.color}-100 text-${tab.color}-600`
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Orders Table */}
        <div className="rounded-lg shadow-sm bg-white overflow-hidden">
          {loading ? (
            <div className="text-center py-6">Loading repair orders...</div>
          ) : error ? (
            <div className="text-center py-6 text-red-600">{error}</div>
          ) : getActiveOrders().length === 0 ? (
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
                {getActiveOrders().map((order) => (
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
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                      {order.assignedTo ? getTechnicianName(order.assignedTo) : "Unassigned"}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleAssignOrder(order.id, order.difficulty_level)}
                          className="px-3 py-1.5 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors duration-200 flex items-center gap-1"
                          aria-label="Assign order"
                        >
                          Assign
                        </button>
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
      </div>

      {/* Assignment Modal using React Select */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 backdrop-blur bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-500 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-white-900 mb-4 flex items-center gap-2">
              <Tag className="w-5 h-5 text-blue-500" />
              Assign Repair Order
            </h3>
            <div className="mb-4">
              <label htmlFor="assignTo" className="block text-sm font-medium text-gray-700 mb-1">
                Assign to
              </label>
              <Select
                id="assignTo"
                options={technicianOptions}
                value={selectedTechnicianOption}
                onChange={setSelectedTechnicianOption}
                placeholder="Search for a technician..."
                isClearable
                isSearchable
                styles={customSelectStyles}
              />
              <p className="mt-2 text-xs text-gray-200">
                Note: Technicians can only be assigned to repair orders with a difficulty level 
                equal to or below their skill level.
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsAssignModalOpen(false)}
                className="px-3 py-1.5 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50 shadow-sm text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignSubmit}
                className="px-3 py-1.5 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 shadow-sm text-sm"
              >
                Assign
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;