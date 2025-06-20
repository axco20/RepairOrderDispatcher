"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useRepairOrders } from "@/context/RepairOrderContext";
import TechSidebar, { TechPage } from "@/components/TechSideBar";
import Home from "@/components/TechnicianTabs/Home";
import ActiveOrders from "@/components/TechnicianTabs/ActiveOrders";
import CompletedOrders from "@/components/TechnicianTabs/CompletedOrders";
import OnHoldOrders from "@/components/TechnicianTabs/OnHoldOrders";
import Help from "@/components/TechnicianTabs/Help";
import { toast } from "react-toastify";
import { useRealTimeUpdates } from "@/lib/useRealTimeOrders";
import { useAdminRealTime } from "@/lib/useAdminRealTime";
import { supabase } from "@/lib/supabaseClient";
import RealTimeStatus from '@/components/RealTimeStatus';

// Removed the TechnicianWorkload import

const TechnicianDashboard: React.FC = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  // Get real-time connection status
  const { isConnected, error } = useRealTimeUpdates();
  
  // Listen for repair order updates to refresh technician data
  useAdminRealTime({
    eventType: 'repairOrdersUpdated',
    onUpdate: () => {
      // Refresh orders when any repair order changes
      refreshOrders();
    },
    showNotification: false // Don't show notifications for technicians
  });
  
  const { 
    technicianOrders, 
    getNextRepairOrder, 
    technicianActiveOrderCount,
    canRequestNewOrder,
    pendingOrders,
    refreshOrders
  } = useRepairOrders();

  const [activePage, setActivePage] = useState<TechPage>('Dashboard');
  const [isAssigningOrder, setIsAssigningOrder] = useState(false);
  const [techSkillLevel, setTechSkillLevel] = useState<number>(1);
  const [availableOrdersCount, setAvailableOrdersCount] = useState<number>(0);

  // Fetch technician skill level and count available orders
  useEffect(() => {
    const fetchTechDetails = async () => {
      if (!user) return;
  
      try {
        // Get technician details (dealership_id)
        const { data: techData, error: techError } = await supabase
          .from("users")
          .select("dealership_id, skill_level")
          .eq("auth_id", user.id)
          .single();
  
        if (techError || !techData?.dealership_id) {
          console.error("Error fetching technician dealership:", techError);
          return;
        }
  
        const { dealership_id, skill_level } = techData;
        setTechSkillLevel(skill_level || 1);
  
        // Count pending orders that match technician's skill level & dealership
        const { data: matchingOrders, error: countError } = await supabase
          .from("repair_orders")
          .select("id")
          .eq("status", "pending")
          .eq("dealership_id", dealership_id) // ✅ Only count orders from same dealership
          .lte("difficulty_level", skill_level);
  
        if (countError) {
          console.error("Error counting available orders:", countError);
          return;
        }
  
        setAvailableOrdersCount(matchingOrders?.length || 0);
      } catch (err) {
        console.error("Error in fetchTechDetails:", err);
      }
    };
  
    fetchTechDetails();
  }, [user, pendingOrders]);
  

  // FIX: Only run once on mount instead of on every render
  useEffect(() => {
    // One-time refresh when component mounts
    refreshOrders();
    // IMPORTANT: Remove refreshOrders from the dependency array
  }, []);

  if (loading) {
    return <div>Loading...</div>; // Or a spinner component
  }

  if (!user) {
    router.push("/loginpage"); // Redirect if not logged in
    return null;
  }

  const myOrders = technicianOrders(user.id);
  const activeOrders = myOrders.filter(order => order.status === "in_progress");
  const onHoldOrders = myOrders.filter(order => order.status === "on_hold"); 
  const activeOrderCount = technicianActiveOrderCount(user.id);
  const canGetNewOrder = canRequestNewOrder(user.id);

  // Create a wrapper function that passes the current user ID to getNextRepairOrder
  const handleGetNextRepairOrder = async () => {
    if (isAssigningOrder) return;
    
    try {
      setIsAssigningOrder(true);
      console.log("Getting next repair order for technician:", user.id);
      
      const result = await getNextRepairOrder(user.id);
      
      if (result) {
        toast.success("New repair order assigned!");
        console.log("Successfully assigned new repair order");
        
        // Force a refresh of data
        await refreshOrders();
        
        // Auto-navigate to active orders after getting a new one
        setActivePage("Active");
      } else {
        if (pendingOrders.length === 0) {
          toast.info("No pending orders available in the queue");
        } else if (activeOrderCount >= 5) {
          toast.info("You already have the maximum number of active orders");
        } else if (availableOrdersCount === 0) {
          toast.info(`No orders matching your skill level (Level ${techSkillLevel}) are currently available`);
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


  // Define a logout handler that also redirects to the landing page
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <TechSidebar
        userName={user?.name || 'Technician'}
        activePage={activePage}
        onNavigate={setActivePage}
        onLogout={handleLogout}
        activeOrdersCount={activeOrders.length}
        onHoldOrdersCount={onHoldOrders.length} 
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-6 py-3 flex justify-between items-center">
          <h1 className="text-xl font-semibold text-gray-900">
            {activePage === 'Dashboard' && 'Technician Dashboard'}
            {activePage === 'Active' && 'Active Repair Orders'}
            {activePage === 'On Hold' && 'On-Hold Repair Orders'}
            {activePage === 'Completed' && 'Completed Repair Orders'}
            {activePage === 'Help' && 'Help & Support'}
          </h1>
          <RealTimeStatus isConnected={isConnected} error={error} />
        </header>
        
        <main className="flex-1 overflow-y-auto p-6 bg-gray-100">
          {/* Removed TechnicianWorkload component */}
          
          {/* Render different main content depending on activePage */}
          {activePage === "Dashboard" && (
            <Home 
              activeOrderCount={activeOrderCount}
              canGetNewOrder={canGetNewOrder}
              pendingOrdersCount={availableOrdersCount}
              getNextRepairOrder={handleGetNextRepairOrder}
              isLoading={isAssigningOrder}
            />
          )}
          {activePage === "Active" && <ActiveOrders />}
          {activePage === "On Hold" && <OnHoldOrders />}
          {activePage === "Completed" && <CompletedOrders />}
          {activePage === "Help" && <Help />}
        </main>
      </div>
    </div>
  );
};

export default TechnicianDashboard;