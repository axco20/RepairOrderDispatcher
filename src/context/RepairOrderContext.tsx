import React, { createContext, useContext, useState, useEffect } from 'react'; //repairordercontext.tsx
import { RepairOrder, RepairOrderAssignment} from '../types';
import { useAuth } from '../../server/AuthContext';

interface RepairOrderContextType {
  repairOrders: RepairOrder[];
  assignments: RepairOrderAssignment[];
  addRepairOrder: (order: Omit<RepairOrder, 'id' | 'createdAt' | 'status'>) => void;
  getNextRepairOrder: () => void;
  completeRepairOrder: (orderId: string) => void;
  reassignRepairOrder: (orderId: string, technicianId: string) => void;
  returnToQueue: (orderId: string) => void;
  updatePriority: (orderId: string, newPriority: number) => void;
  pendingOrders: RepairOrder[];
  inProgressOrders: RepairOrder[];
  completedOrders: RepairOrder[];
  technicianOrders: (technicianId: string) => RepairOrder[];
  technicianActiveOrderCount: (technicianId: string) => number;
  canRequestNewOrder: (technicianId: string) => boolean;
  
}

const RepairOrderContext = createContext<RepairOrderContextType>({
  
  repairOrders: [],
  assignments: [],
  addRepairOrder: () => {},
  getNextRepairOrder: () => {},
  completeRepairOrder: () => {},
  reassignRepairOrder: () => {},
  returnToQueue: () => {},
  updatePriority: () => {},
  pendingOrders: [],
  inProgressOrders: [],
  completedOrders: [],
  technicianOrders: () => [],
  technicianActiveOrderCount: () => 0,
  canRequestNewOrder: () => false,
});

export const useRepairOrders = () => useContext(RepairOrderContext);

export const RepairOrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [repairOrders, setRepairOrders] = useState<RepairOrder[]>([]);
  const [assignments, setAssignments] = useState<RepairOrderAssignment[]>([]);
  const { currentUser } = useAuth();

  // Load data from localStorage on component mount
  useEffect(() => {
    const storedOrders = localStorage.getItem('repairOrders');
    const storedAssignments = localStorage.getItem('assignments');
    
    if (storedOrders) {
      setRepairOrders(JSON.parse(storedOrders));
    }
    
    if (storedAssignments) {
      setAssignments(JSON.parse(storedAssignments));
    }
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('repairOrders', JSON.stringify(repairOrders));
  }, [repairOrders]);

  useEffect(() => {
    localStorage.setItem('assignments', JSON.stringify(assignments));
  }, [assignments]);

  // Filter orders by status
  const pendingOrders = repairOrders
  .filter(order => order.status === 'pending')
  .sort((a, b) => {
    // Sort by priority first (lower number = higher priority)
    if (a.priority !== b.priority) {
      return a.priority - b.priority;
    }
    // Then sort by creation date (older first)
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });
  
  const inProgressOrders = repairOrders.filter(order => order.status === 'in_progress');
  const completedOrders = repairOrders.filter(order => order.status === 'completed');

  // Get orders assigned to a specific technician
  const technicianOrders = (technicianId: string) => {
    return repairOrders.filter(order => order.assignedTo === technicianId);
  };

  // Count active orders for a technician
  const technicianActiveOrderCount = (technicianId: string) => {
    return repairOrders.filter(
      order => order.assignedTo === technicianId && order.status === 'in_progress'
    ).length;
  };

  // Check if a technician can request a new order
  const canRequestNewOrder = (technicianId: string) => {
    const activeOrders = technicianActiveOrderCount(technicianId);
    
    if (activeOrders >= 3) {
      return false;
    }
    
    // Check if the technician has any orders assigned less than 5 minutes ago
    const recentAssignment = assignments.find(
      assignment => 
        assignment.technicianId === technicianId && 
        assignment.status === 'in_progress' &&
        new Date().getTime() - new Date(assignment.assignedAt).getTime() < 5 * 60 * 1000
    );
    
    return !recentAssignment || activeOrders === 0;
  };

  // Add a new repair order
  const addRepairOrder = (order: Omit<RepairOrder, 'id' | 'createdAt' | 'status'>) => {
    const newOrder: RepairOrder = {
      ...order,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      status: 'pending',
      // Use the provided priority or default to 2
      priority: order.priority || 2,
    };
    
    setRepairOrders(prev => [...prev, newOrder]);
  };

  // Get the next repair order in the queue
  const getNextRepairOrder = () => {
    if (!currentUser || pendingOrders.length === 0) return;
    
    // Check if the technician can request a new order
    if (!canRequestNewOrder(currentUser.id)) return;
    
    const nextOrder = pendingOrders[0];
    
    // Update the repair order
    setRepairOrders(prev => 
      prev.map(order => 
        order.id === nextOrder.id 
          ? { 
              ...order, 
              status: 'in_progress', 
              assignedTo: currentUser.id,
              assignedAt: new Date().toISOString()
            } 
          : order
      )
    );
    
    // Create a new assignment
    const newAssignment: RepairOrderAssignment = {
      repairOrderId: nextOrder.id,
      technicianId: currentUser.id,
      assignedAt: new Date().toISOString(),
      status: 'in_progress'
    };
    
    setAssignments(prev => [...prev, newAssignment]);
  };

  // Mark a repair order as completed
  const completeRepairOrder = (orderId: string) => {
    const completedAt = new Date().toISOString();
    
    // Update the repair order
    setRepairOrders(prev => 
      prev.map(order => 
        order.id === orderId 
          ? { ...order, status: 'completed', completedAt } 
          : order
      )
    );
    
    // Update the assignment
    setAssignments(prev => 
      prev.map(assignment => 
        assignment.repairOrderId === orderId 
          ? { ...assignment, status: 'completed', completedAt } 
          : assignment
      )
    );
  };

  // Reassign a repair order to a different technician
  const reassignRepairOrder = (orderId: string, technicianId: string) => {
    const assignedAt = new Date().toISOString();
    
    // Update the repair order
    setRepairOrders(prev => 
      prev.map(order => 
        order.id === orderId 
          ? { ...order, assignedTo: technicianId, assignedAt } 
          : order
      )
    );
    
    // Create a new assignment
    const newAssignment: RepairOrderAssignment = {
      repairOrderId: orderId,
      technicianId,
      assignedAt,
      status: 'in_progress'
    };
    
    setAssignments(prev => [...prev, newAssignment]);
  };

  // Return a repair order to the queue
  const returnToQueue = (orderId: string) => {
    setRepairOrders(prev => 
      prev.map(order => 
        order.id === orderId 
          ? { 
              ...order, 
              status: 'pending', 
              assignedTo: undefined, 
              assignedAt: undefined 
            } 
          : order
      )
    );
  };

  // Update the priority of a repair order
  const updatePriority = (orderId: string, newPriority: number) => {
    setRepairOrders(prev => 
      prev.map(order => 
        order.id === orderId 
          ? { ...order, priority: newPriority } 
          : order
      )
    );
  };

  return (
    <RepairOrderContext.Provider 
      value={{ 
        repairOrders, 
        assignments,
        addRepairOrder, 
        getNextRepairOrder, 
        completeRepairOrder, 
        reassignRepairOrder, 
        returnToQueue, 
        updatePriority,
        pendingOrders,
        inProgressOrders,
        completedOrders,
        technicianOrders,
        technicianActiveOrderCount,
        canRequestNewOrder
      }}
    >
      {children}
    </RepairOrderContext.Provider>
  );
};