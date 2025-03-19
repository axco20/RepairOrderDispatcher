"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient"; // Adjust import if needed
import { useRepairOrders } from "@/context/RepairOrderContext"; 

// Create context with active technicians included
interface RealTimeOrdersContextType {
  activeTechnicians: any[];
}

export const RealTimeOrdersContext = createContext<RealTimeOrdersContextType>({ activeTechnicians: [] });

export const RealTimeOrdersProvider = ({ children }: { children: React.ReactNode }) => {
  const { refreshOrders } = useRepairOrders();
  const [isListening, setIsListening] = useState(false);
  const [activeTechnicians, setActiveTechnicians] = useState<any[]>([]);

  // Function to fetch active technicians
  const fetchActiveTechnicians = async () => {
    const fiveHoursAgo = new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString();
    
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("role", "technician")
        .gt("last_activity", fiveHoursAgo);
      
      if (error) {
        console.error("Error fetching active technicians:", error);
        return;
      }
      
      setActiveTechnicians(data || []);
      console.log(`✅ Fetched ${data?.length || 0} active technicians`);
    } catch (err) {
      console.error("Failed to fetch active technicians:", err);
    }
  };

  // Auto-refresh orders every 5 seconds
  useEffect(() => {
    const loadOrders = async () => {
      console.log("🔄 Auto-refreshing orders...");
      await refreshOrders();
    };

    loadOrders(); // Initial fetch

    const interval = setInterval(() => {
      loadOrders();
    }, 5000); // Refresh every 5 seconds

    return () => clearInterval(interval);
  }, [refreshOrders]); // Dependency to prevent multiple subscriptions

  // Subscribe to real-time changes
  useEffect(() => {
    if (isListening) return;
    setIsListening(true);

    console.log("✅ Subscribing to real-time updates...");

    const channel = supabase
      .channel("repair_orders_channel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "repair_orders" },
        (payload) => {
          console.log("🔄 Change detected:", payload);
          refreshOrders();
        }
      )
      .subscribe();

    return () => {
      console.log("🛑 Unsubscribing from real-time updates...");
      supabase.removeChannel(channel);
    };
  }, []);
  
  // Track active technicians
  useEffect(() => {
    // Fetch active technicians immediately
    fetchActiveTechnicians();
    
    // Set up an interval to refresh regularly
    const interval = setInterval(fetchActiveTechnicians, 2 * 60 * 1000); // Every 2 minutes
    
    // Set up real-time subscription for user activity
    const userChannel = supabase
      .channel("users_activity_channel")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "users", filter: "last_activity=is.not.null" },
        (payload) => {
          console.log("👤 User activity updated:", payload.new.name);
          // Refresh active technicians list
          fetchActiveTechnicians();
        }
      )
      .subscribe();
    
    // Clean up
    return () => {
      clearInterval(interval);
      supabase.removeChannel(userChannel);
    };
  }, []);

  return (
    <RealTimeOrdersContext.Provider value={{ activeTechnicians }}>
      {children}
    </RealTimeOrdersContext.Provider>
  );
};

// Custom Hook for easy access
export const useRealTimeOrders = () => useContext(RealTimeOrdersContext);