"use client";

import { useContext, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { RealTimeOrdersContext } from "@/context/RealTimeOrdersProvider";

// This is the new hook that returns the context including activeTechnicians
export const useRealTimeOrders = (refreshOrders: () => Promise<void>) => {
  return useContext(RealTimeOrdersContext);
};

// This is your original hook functionality, renamed to not conflict
export const useRealTimeOrdersSubscription = (refreshOrders: () => void) => {
  useEffect(() => {
    const subscription = supabase
      .channel('repair_orders')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'repair_orders' },
        (payload) => {
          console.log("🔄 Real-time update received:", payload);
          refreshOrders(); 
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [refreshOrders]);
};