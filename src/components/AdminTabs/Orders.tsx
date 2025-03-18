// components/Orders.tsx
import React, { useState, useEffect } from "react";
import { Search, Clock, Tag, Check, Plus, Trash2, Settings, CheckCircle, AlertTriangle } from "lucide-react";
import { useRepairOrders } from "@/context/RepairOrderContext";
import { toast } from "react-toastify";

interface RepairOrder {
  id: string;
  description?: string;
  orderDescription?: string;
  status: "pending" | "in_progress" | "completed";
  priority?: number;
  priorityType?: string;
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
    deleteRepairOrder
  } = useRepairOrders();

  const [searchQuery, setSearchQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState("pending");
  const [formData, setFormData] = useState({
    description: "",
    orderDescription: "",
    priority: 1, // Keeping this for backend compatibility
    priorityType: "WAIT" as "WAIT" | "VALET" | "LOANER",
    status: "pending" as "pending" | "in_progress" | "completed",
    assignedTo: ""
  });
  
  // For the assignment modal
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState("");
  const [assignmentInput, setAssignmentInput] = useState("");

  useEffect(() => {
    refreshOrders();
  }, []);

  // Filtered orders based on search query
  const filteredOrders = repairOrders.filter(
    (order) =>
      order.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.orderDescription?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group orders by status and sort completed orders by completion date (most recent first)
  const pendingOrders = filteredOrders.filter((o) => o.status === "pending");
  const inProgressOrders = filteredOrders.filter((o) => o.status === "in_progress");
  const completedOrders = filteredOrders
    .filter((o) => o.status === "completed")
    .sort((a: RepairOrder, b: RepairOrder) => {
      // Sort by completedAt date if available, otherwise use createdAt
      const dateA = a.completedAt ? new Date(a.completedAt) : new Date(a.createdAt || 0);
      const dateB = b.completedAt ? new Date(b.completedAt) : new Date(b.createdAt || 0);
      return dateB.getTime() - dateA.getTime(); // Most recent first
    })
    // Limit to most recent 50 completed orders to prevent UI overload
    .slice(0, 50);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "priority" ? parseInt(value) : value,
    }));
  };

  // Map priorityType to priority number to maintain functionality
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
    
    setFormData(prev => ({
      ...prev,
      priorityType,
      priority // Update both priority and priorityType
    }));
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Make sure required fields are present
      if (!formData.description) {
        toast.error("❌ Repair Order Number is required.");
        return;
      }

      // Ensure priority is set based on priorityType
      const dataToSubmit = {
        ...formData,
        priority: getPriorityFromType(formData.priorityType)
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
          status: "pending",
          assignedTo: ""
        });
        
        // Switch to the pending tab if we just added a pending order
        if (formData.status === "pending") {
          setActiveTab("pending");
        }
      } else {
        toast.error("❌ Failed to create repair order.");
      }
    } catch (error) {
      toast.error("❌ Error creating repair order: " + error);
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
  
  // Handle opening the assign modal
  const handleAssignOrder = (id: string) => {
    setCurrentOrderId(id);
    setAssignmentInput("");
    setIsAssignModalOpen(true);
  };
  
  // Handle submitting the assignment
  const handleAssignSubmit = async () => {
    if (!assignmentInput.trim()) {
      toast.error("❌ Please enter a name to assign this order to.");
      return;
    }
    
    try {
      const updates = { assignedTo: assignmentInput.trim() };
      const result = await updateRepairOrder(currentOrderId, updates);
      
      if (result) {
        toast.success(`✅ Order assigned to ${assignmentInput.trim()}!`);
        setIsAssignModalOpen(false);
      } else {
        toast.error("❌ Failed to assign order.");
      }
    } catch (error) {
      toast.error("❌ Error assigning order: " + error);
    }
  };

  // Format date helper
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return `${date.toLocaleDateString('en-US', { month: 'short', day: '2-digit' })}, ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}`;
  };

  // Calculate wait time
  const getWaitTime = (createdAt?: string) => {
    if (!createdAt) return null;
    
    const created = new Date(createdAt);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - created.getTime()) / 60000);
    
    // Format based on wait time duration
    let display = '';
    let color = '';
    let showAlert = false;
    
    if (diffMinutes < 15) {
      display = `${diffMinutes}m`;
      color = 'text-orange-500';
      showAlert = false;
    } else if (diffMinutes < 30) {
      display = `${diffMinutes}m`;
      color = 'text-red-500';
      showAlert = true;
    } else {
      display = `${diffMinutes}m`;
      color = 'text-red-600 font-bold';
      showAlert = true;
    }
    
    return { display, color, showAlert };
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <span className="flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3" />
            Pending
          </span>
        );
      case "in_progress":
        return (
          <span className="flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
            <Settings className="w-3 h-3" />
            In Progress
          </span>
        );
      case "completed":
        return (
          <span className="flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
            <Check className="w-3 h-3" />
            Completed
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
            {status.replace("_", " ")}
          </span>
        );
    }
  };

  // Tab configuration
  const tabs = [
    { 
      id: "pending", 
      label: "Pending", 
      count: pendingOrders.length, 
      icon: <Clock className="w-5 h-5" />,
      color: "yellow"
    },
    { 
      id: "in_progress", 
      label: "In Progress", 
      count: inProgressOrders.length, 
      icon: <Settings className="w-5 h-5" />,
      color: "blue" 
    },
    { 
      id: "completed", 
      label: "Completed", 
      count: completedOrders.length, 
      icon: <CheckCircle className="w-5 h-5" />,
      color: "green" 
    }
  ];

  // Get orders for the active tab
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

  // Get row background color based on status
  const getRowBgColor = (status: string) => {
    // All rows now have white background
    return "bg-white";
  };

  // Get priority type label for display
  const getPriorityTypeLabel = (priorityType: string) => {
    switch (priorityType) {
      case "WAIT":
        return "Wait";
      case "VALET":
        return "Valet";
      case "LOANER":
        return "Loaner";
      default:
        return priorityType;
    }
  };

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Settings className="w-5 h-5 text-indigo-600" />
            Repair Orders
          </h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-3 py-1.5 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 shadow-sm flex items-center gap-1 transition-colors duration-200 text-sm"
          >
            {showForm ? "Cancel" : (<><Plus className="w-4 h-4" /> New Order</>)}
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 
                       rounded-md leading-5 bg-white placeholder-gray-500 
                       focus:outline-none focus:ring-2 focus:ring-indigo-500 
                       focus:border-indigo-500 sm:text-sm shadow-sm"
            placeholder="Search repair orders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Create Order Form */}
        {showForm && (
          <div className="bg-white p-4 rounded-lg shadow-sm mb-6 border border-gray-200">
            <h2 className="text-base font-semibold text-gray-700 mb-3 flex items-center gap-1">
              <Plus className="w-4 h-4 text-indigo-600" />
              Create New Repair Order
            </h2>
            <form onSubmit={handleCreateOrder}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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
                <span className={`mr-2 ${activeTab === tab.id ? `text-${tab.color}-500` : "text-gray-400"}`}>
                  {tab.icon}
                </span>
                {tab.label}
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                  activeTab === tab.id 
                    ? `bg-${tab.color}-100 text-${tab.color}-600` 
                    : "bg-gray-100 text-gray-600"
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Table Content */}
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
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submitted
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Wait Time
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assigned To
                  </th>
                  <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {getActiveOrders().map((order) => {
                  const waitTime = getWaitTime(order.createdAt);
                  return (
                    <tr key={order.id} className={getRowBgColor(order.status)}>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                        {order.description || (order.id ? `#${order.id.substring(0, 6)}` : 'N/A')}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {getStatusBadge(order.status)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {waitTime && (
                          <div className={`flex items-center gap-1 ${waitTime.color}`}>
                            {waitTime.showAlert ? (
                              <AlertTriangle className="w-4 h-4" />
                            ) : (
                              <Clock className="w-4 h-4" />
                            )}
                            {waitTime.display}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                        {order.assignedTo ? (
                          <span className="text-gray-700 text-sm">
                            {order.assignedTo}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-sm">Unassigned</span>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleAssignOrder(order.id)}
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
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
      
      {/* Assignment Modal */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
              <Tag className="w-5 h-5 text-blue-500" />
              Assign Repair Order
            </h3>
            
            <div className="mb-4">
              <label htmlFor="assignTo" className="block text-sm font-medium text-gray-700 mb-1">
                Assign to
              </label>
              <input
                type="text"
                id="assignTo"
                value={assignmentInput}
                onChange={(e) => setAssignmentInput(e.target.value)}
                placeholder="Enter technician or employee name"
                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
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