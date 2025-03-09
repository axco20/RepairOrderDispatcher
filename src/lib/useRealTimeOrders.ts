import { useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";  

export const useRealTimeOrders = (refreshOrders: () => void) => {
  useEffect(() => {
    const subscription = supabase
      .channel('repair_orders')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'repair_orders' },
        (payload) => {
          console.log("🔄 Real-time update received:", payload);
          refreshOrders(); // Fetch latest data
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription); // Cleanup on unmount
    };
  }, [refreshOrders]);
};
