import React, { useMemo, useState, useEffect } from 'react';
import { Users, Clock, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';

interface Technician {
  id: string;
  auth_id: string;
  name: string;
  email: string;
  role: string;
}

export interface RepairOrder {
  // Standard fields
  id: string;
  description: string;
  orderDescription: string;
  order_description?: string;
  createdAt: string;
  created_at?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'on_hold';
  priority: number;
  priorityType?: 'WAIT' | 'VALET' | 'LOANER';
  priority_type?: 'WAIT' | 'VALET' | 'LOANER';
  position?: number; 
  
  // Assignment fields - include both versions
  assignedTo?: string;
  assigned_to?: string;
  
  assignedAt?: string;
  assigned_at?: string;
  
  completedAt?: string;
  completed_at?: string;
  
  // Other possible fields related to technicians
  technicianId?: string;
  technician_id?: string;
}

interface TechnicianWorkloadProps {
  technicians: Technician[];
  repairOrders: RepairOrder[];
}

const TechnicianWorkload: React.FC<TechnicianWorkloadProps> = ({ 
  technicians, 
  repairOrders
}) => {
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [debug, setDebug] = useState<any>(null);
  
  // Calculate workload for each technician
  const technicianWorkloads = useMemo(() => {
    if (!technicians || technicians.length === 0 || !repairOrders || repairOrders.length === 0) {
      return [];
    }

    // Create a map for quick technician lookup by both id and auth_id
    const techMap = new Map<string, Technician>();
    technicians.forEach(tech => {
      techMap.set(tech.id, tech);
      if (tech.auth_id) techMap.set(tech.auth_id, tech);
    });

    // Track workload by technician ID
    const workloadMap = new Map<string, {
      tech: Technician,
      count: number,
      orders: string[]
    }>();
    
    // Initialize all technicians with 0 active orders
    technicians.forEach(tech => {
      workloadMap.set(tech.id, {
        tech,
        count: 0,
        orders: []
      });
    });
    
    // Count active orders for each technician
    repairOrders.forEach(order => {
      // Collect all possible technician ID fields
      const possibleIds = [
        order.technicianId,
        order.technician_id,
        order.assignedTo,
        order.assigned_to
      ].filter(Boolean) as string[];
      
      // If order is pending or in_progress, find matching technician
      if ((order.status === 'pending' || order.status === 'in_progress') && possibleIds.length > 0) {
        // Try to find a technician match
        for (const possibleId of possibleIds) {
          if (techMap.has(possibleId)) {
            const tech = techMap.get(possibleId);
            if (tech) {
              const workloadData = workloadMap.get(tech.id);
              if (workloadData) {
                workloadMap.set(tech.id, {
                  tech,
                  count: workloadData.count + 1,
                  orders: [...workloadData.orders, order.id]
                });
              }
              break; // Stop once we've found a match
            }
          }
        }
      }
    });
    
    // Convert to array for display
    const workloads = Array.from(workloadMap.values())
      .map(({ tech, count, orders }) => ({
        id: tech.id,
        name: tech.name,
        email: tech.email,
        activeOrders: count,
        orderIds: orders
      }));
    
    // Sort by workload count
    return workloads.sort((a, b) => {
      if (sortOrder === 'asc') {
        return a.activeOrders - b.activeOrders;
      } else {
        return b.activeOrders - a.activeOrders;
      }
    });
  }, [technicians, repairOrders, sortOrder]);
  
  // Debug useEffect - useful for troubleshooting
  useEffect(() => {
    if (technicians && repairOrders) {
      // Count how many orders are assigned to each possible ID field
      const assignedToCount = repairOrders.filter(o => o.assignedTo).length;
      const assigned_to_count = repairOrders.filter(o => o.assigned_to).length;
      const technicianIdCount = repairOrders.filter(o => o.technicianId).length;
      const technician_id_count = repairOrders.filter(o => o.technician_id).length;
      
      // Count orders by status
      const pendingCount = repairOrders.filter(o => o.status === 'pending').length;
      const inProgressCount = repairOrders.filter(o => o.status === 'in_progress').length;
      const completedCount = repairOrders.filter(o => o.status === 'completed').length;
      const onHoldCount = repairOrders.filter(o => o.status === 'on_hold').length;
      
      setDebug({
        technicianCount: technicians.length,
        orderCount: repairOrders.length,
        assignedToCount,
        assigned_to_count,
        technicianIdCount,
        technician_id_count,
        pendingCount,
        inProgressCount,
        completedCount,
        onHoldCount
      });
    }
  }, [technicians, repairOrders]);
  
  const toggleSortOrder = () => {
    setSortOrder(current => current === 'asc' ? 'desc' : 'asc');
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold flex items-center">
          <Users className="h-5 w-5 mr-2 text-indigo-600" />
          Technician Workload
        </h2>
        <div className="flex items-center">
          <button 
            onClick={toggleSortOrder}
            className="text-xs text-gray-700 bg-gray-100 px-3 py-1 rounded-full flex items-center"
          >
            {sortOrder === 'asc' ? 'Least busy first' : 'Most busy first'}
            {sortOrder === 'asc' ? 
              <ChevronUp className="h-4 w-4 ml-1" /> : 
              <ChevronDown className="h-4 w-4 ml-1" />
            }
          </button>
        </div>
      </div>
      
      {technicianWorkloads.length > 0 ? (
        <div className="divide-y divide-gray-100">
          {technicianWorkloads.map((tech) => (
            <div key={tech.id} className="py-3 flex items-center justify-between">
              <div className="flex items-center">
                <div className="rounded-full w-8 h-8 bg-indigo-100 text-indigo-700 flex items-center justify-center mr-3">
                  {tech.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-gray-800">{tech.name}</p>
                  <p className="text-xs text-gray-500">{tech.email}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 text-gray-400 mr-1" />
                <span className={`font-semibold ${
                  tech.activeOrders === 0 
                    ? 'text-red-600' 
                    : tech.activeOrders < 2 
                      ? 'text-orange-500'
                      : 'text-green-600'
                }`}>
                  {tech.activeOrders} order{tech.activeOrders !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <AlertCircle className="h-8 w-8 text-gray-400 mb-2" />
          <p className="text-gray-500">No technician data available</p>
        </div>
      )}
      
      <div className="mt-4 pt-4 border-t border-gray-100">
        <p className="text-xs text-gray-500">
          Showing active workload for all {technicianWorkloads.length} technicians. Only counting orders with 'pending' or 'in_progress' status.
        </p>
      </div>
    </div>
  );
};

export default TechnicianWorkload;