"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import { BarChart2 } from "lucide-react"; 
import { supabase } from "@/lib/supabaseClient";

export default function TechnicianDashboard() {
  const { currentUser, logout } = useAuth();
  const router = useRouter();
  
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
  const [techSkillLevel, setTechSkillLevel] = useState<number>(1);
  const [availableOrdersCount, setAvailableOrdersCount] = useState<number>(0);

  // Fetch technician skill level and count available orders
  useEffect(() => {
    const fetchTechDetails = async () => {
      if (!currentUser) return;
      
      try {
        // 1) Fetch skill_level AND dealership_id from the "users" table
        const { data, error } = await supabase
          .from("users")
          .select("skill_level, dealership_id")
          .eq("auth_id", currentUser.id)
          .single();
        
        if (error) {
          console.error("Error fetching technician skill/dealership:", error);
          return;
        }
        
        const skillLevel = data?.skill_level || 1;
        setTechSkillLevel(skillLevel);
  
        const userDealershipId = data?.dealership_id;
        if (!userDealershipId) {
          console.error("No dealership_id found for current technician.");
          return;
        }
        
        // 2) Filter repair_orders by:
        //    - pending status
        //    - difficulty_level <= skillLevel
        //    - matching dealership_id
        const { data: matchingOrders, error: countError } = await supabase
          .from("repair_orders")
          .select("id")
          .eq("status", "pending")
          .lte("difficulty_level", skillLevel)
          .eq("dealership_id", userDealershipId);
  
        if (countError) {
          console.error("Error counting available orders:", countError);
          return;
        }
        
        // 3) Update availableOrdersCount
        setAvailableOrdersCount(matchingOrders?.length || 0);
      } catch (err) {
        console.error("Error in fetchTechDetails:", err);
      }
    };
  
    fetchTechDetails();
  }, [currentUser, pendingOrders]);
  

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

  // Helper function to get skill level label
  const getSkillLevelLabel = (level: number) => {
    switch (level) {
      case 1: return "Basic";
      case 2: return "Intermediate";
      case 3: return "Advanced";
      default: return "Basic";
    }
  };

  // Define a logout handler that also redirects to the landing page
  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <TechSidebar
        userName={currentUser.name}
        activePage={activePage}
        onNavigate={setActivePage}
        onLogout={handleLogout}
        activeOrdersCount={activeOrders.length}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Add Skill Level Indicator at the top */}
        <div className="bg-blue-50 px-6 py-2 border-b border-blue-100 flex items-center justify-between">
          <div className="flex items-center">
            <BarChart2 className="h-5 w-5 mr-2 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">
              Your Skill Level: Level {techSkillLevel} ({getSkillLevelLabel(techSkillLevel)})
            </span>
          </div>
          <div className="text-sm text-blue-800">
            {availableOrdersCount} order{availableOrdersCount !== 1 ? 's' : ''} available at your skill level
          </div>
        </div>
        
        <main className="flex-1 overflow-y-auto p-6 bg-gray-100">
          {/* Render different main content depending on activePage */}
          {activePage === "Home" && (
            <Home 
              activeOrderCount={activeOrderCount}
              canGetNewOrder={canGetNewOrder}
              pendingOrdersCount={availableOrdersCount}
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
