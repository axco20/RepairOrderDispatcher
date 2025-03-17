"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient"; // Adjust import if needed
import { useRepairOrders } from "@/context/RepairOrderContext"; 

const RealTimeOrdersContext = createContext({});

export const RealTimeOrdersProvider = ({ children }: { children: React.ReactNode }) => {
  const { refreshOrders } = useRepairOrders();
  const [isListening, setIsListening] = useState(false);

  // Auto-refresh orders every 5 seconds
  useEffect(() => {
    const loadOrders = async () => {
      console.log("🔄 Auto-refreshing orders...");
      await refreshOrders();
    };

    loadOrders(); // Initial fetch

    const interval = setInterval(() => {
      loadOrders();
    }, 100000); // Refresh every 5 seconds

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

  return (
    <RealTimeOrdersContext.Provider value={{}}>
      {children}
    </RealTimeOrdersContext.Provider>
  );
};

// Custom Hook for easy access
export const useRealTimeOrders = () => useContext(RealTimeOrdersContext);
