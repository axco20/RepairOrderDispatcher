"use client";
import { useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRepairOrders } from "@/context/RepairOrderContext";

export function useRealTimeUpdates() {
  const { refreshOrders } = useRepairOrders(); // Refresh function from context

  useEffect(() => {
    console.log("📡 Subscribing to real-time updates...");

    // Create a Supabase channel
    const channel = supabase.channel("realtime_updates");

    // Subscribe to `dealerships`
    channel.on(
      "postgres_changes",
      { event: "*", schema: "public", table: "dealerships" },
      (payload) => {
        console.log("🏢 Dealerships Table Updated:", payload);
      }
    );

    // Subscribe to `repair_orders`
    channel.on(
      "postgres_changes",
      { event: "*", schema: "public", table: "repair_orders" },
      (payload) => {
        console.log("🛠️ Repair Orders Updated:", payload);
        refreshOrders(); // Refresh repair orders
      }
    );

    // Subscribe to `users`
    channel.on(
      "postgres_changes",
      { event: "*", schema: "public", table: "users" },
      (payload) => {
        console.log("👤 Users Table Updated:", payload);
      }
    );

    // Subscribe to the channel
    channel.subscribe();

    return () => {
      console.log("❌ Unsubscribing from real-time updates...");
      supabase.removeChannel(channel);
    };
  }, []);
}
