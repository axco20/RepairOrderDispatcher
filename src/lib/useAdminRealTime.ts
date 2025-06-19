"use client";

import { useEffect } from 'react';

interface UseAdminRealTimeProps {
  eventType: 'repairOrdersUpdated' | 'usersUpdated' | 'dealershipsUpdated' | 'teamMembersUpdated';
  onUpdate: () => void;
  showNotification?: boolean;
}

export const useAdminRealTime = ({ 
  eventType, 
  onUpdate, 
  showNotification = true 
}: UseAdminRealTimeProps) => {
  useEffect(() => {
    const handleUpdate = (event: CustomEvent) => {
      // Call the update function
      onUpdate();
      
      // Show notification if enabled
      if (showNotification) {
        // You can add toast notification here if needed
        // toast.info('Data updated in real-time');
      }
    };

    // Add event listener
    window.addEventListener(eventType, handleUpdate as EventListener);

    // Cleanup
    return () => {
      window.removeEventListener(eventType, handleUpdate as EventListener);
    };
  }, [eventType, onUpdate, showNotification]);
}; 