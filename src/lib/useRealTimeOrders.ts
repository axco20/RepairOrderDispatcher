"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRepairOrders } from "@/context/RepairOrderContext";

export const useRealTimeUpdates = () => {
  const { refreshOrders } = useRepairOrders(); // Refresh function from context
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Set up real-time subscriptions for admin dashboard
    const setupRealTimeSubscriptions = () => {
      // Subscribe to repair_orders table changes
      const repairOrdersChannel = supabase
        .channel('repair_orders_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'repair_orders'
          },
          (payload) => {
            // Dispatch custom event for components to listen to
            window.dispatchEvent(new CustomEvent('repairOrdersUpdated', {
              detail: { type: 'repair_orders', payload }
            }));
          }
        )
        .on('presence', { event: 'sync' }, () => {
          // Handle presence sync
        })
        .on('presence', { event: 'join' }, ({ key, newPresences }) => {
          // Handle presence join
        })
        .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
          // Handle presence leave
        });

      // Subscribe to users table changes
      const usersChannel = supabase
        .channel('users_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'users'
          },
          (payload) => {
            // Dispatch custom event for components to listen to
            window.dispatchEvent(new CustomEvent('usersUpdated', {
              detail: { type: 'users', payload }
            }));
          }
        );

      // Subscribe to dealerships table changes
      const dealershipsChannel = supabase
        .channel('dealerships_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'dealerships'
          },
          (payload) => {
            // Dispatch custom event for components to listen to
            window.dispatchEvent(new CustomEvent('dealershipsUpdated', {
              detail: { type: 'dealerships', payload }
            }));
          }
        );

      // Subscribe to connection status
      const statusChannel = supabase
        .channel('status')
        .on('system', { event: 'disconnect' }, () => {
          setIsConnected(false);
          setError('Connection lost');
        })
        .on('system', { event: 'reconnect' }, () => {
          setIsConnected(true);
          setError(null);
        });

      // Subscribe to all channels
      repairOrdersChannel.subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setIsConnected(true);
          setError(null);
        } else if (status === 'CHANNEL_ERROR') {
          setIsConnected(false);
          setError('Failed to connect to real-time updates');
        }
      });

      usersChannel.subscribe();
      dealershipsChannel.subscribe();
      statusChannel.subscribe();

      // Cleanup function
      return () => {
        repairOrdersChannel.unsubscribe();
        usersChannel.unsubscribe();
        dealershipsChannel.unsubscribe();
        statusChannel.unsubscribe();
      };
    };

    const cleanup = setupRealTimeSubscriptions();

    return cleanup;
  }, [refreshOrders]);

  return { isConnected, error };
};
