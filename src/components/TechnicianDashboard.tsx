"use client";
//technicandashboard.tsx
import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRepairOrders } from "@/context/RepairOrderContext";
import TechSidebar from "@/components/TechSideBar";
import Home from "@/components/TechnicianTabs/Home";
import ActiveOrders from "@/components/TechnicianTabs/ActiveOrders";
import CompletedOrders from "@/components/TechnicianTabs/CompletedOrders";
import OnHoldOrders from "@/components/TechnicianTabs/OnHoldOrders";
import Help from "@/components/TechnicianTabs/Help";
import { toast } from "react-toastify";
import { useRealTimeOrders } from "@/lib/useRealTimeOrders";

export default function TechnicianDashboard() {
  const { currentUser, logout } = useAuth();
  
  const { 
    technicianOrders, 
    getNextRepairOrder, 
    technicianActiveOrderCount,
    canRequestNewOrder,
    pendingOrders,
    refreshOrders
  } = useRepairOrders();

  useRealTimeOrders(refreshOrders); 

  
  const [activePage, setActivePage] = useState<"Home" | "ActiveOrders"| "OnHoldOrders" | "CompletedOrders" | "Help">("Home");
  const [isAssigningOrder, setIsAssigningOrder] = useState(false);

  // FIX: Only run once on mount instead of on every render
  useEffect(() => {
    // One-time refresh when component mounts
    refreshOrders();
    // IMPORTANT: Remove refreshOrders from the dependency array
  }, []);

  if (!currentUser) return <p>Loading...</p>;

  const myOrders = technicianOrders(currentUser.id);
  const activeOrders = myOrders.filter(order => order.status === "in_progress");
  const activeOrderCount = technicianActiveOrderCount(currentUser.id);
  const canGetNewOrder = canRequestNewOrder(currentUser.id);

  // Create a wrapper function that passes the current user ID to getNextRepairOrder
  const handleGetNextRepairOrder = async () => {
    if (isAssigningOrder) return;
    
    try {
      setIsAssigningOrder(true);
      console.log("Getting next repair order for technician:", currentUser.id);
      
      const result = await getNextRepairOrder(currentUser.id);
      
      if (result) {
        toast.success("New repair order assigned!");
        console.log("Successfully assigned new repair order");
        
        // Force a refresh of data
        await refreshOrders();
        
        // Auto-navigate to active orders after getting a new one
        setActivePage("ActiveOrders");
      } else {
        if (pendingOrders.length === 0) {
          toast.info("No pending orders available in the queue");
        } else if (activeOrderCount >= 5) {
          toast.info("You already have the maximum number of active orders");
        } else {
          toast.error("Failed to assign new repair order");
        }
        console.log("Failed to assign new repair order");
      }
    } catch (error) {
      console.error("Error getting next order:", error);
      toast.error("An error occurred while getting the next order");
    } finally {
      setIsAssigningOrder(false);
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <TechSidebar
        userName={currentUser.name}
        activePage={activePage}
        onNavigate={setActivePage}
        onLogout={logout}
        activeOrdersCount={activeOrders.length}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-6 bg-gray-100">
          {/* Dashboard content without header */}
          {activePage === "Home" && (
            <Home 
              activeOrderCount={activeOrderCount}
              canGetNewOrder={canGetNewOrder}
              pendingOrdersCount={pendingOrders.length}
              getNextRepairOrder={handleGetNextRepairOrder}
              isLoading={isAssigningOrder}
            />
          )}
          {activePage === "ActiveOrders" && <ActiveOrders />}
          {activePage === "OnHoldOrders" && <OnHoldOrders />}
          {activePage === "CompletedOrders" && <CompletedOrders />}
          {activePage === "Help" && <Help />}
        </main>
      </div>
    </div>
  );
}