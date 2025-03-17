import React, { useMemo } from 'react';
import { Users, Clock, AlertCircle } from 'lucide-react';

interface Technician {
  id: string;
  auth_id: string;
  name: string;
  email: string;
  role: string;
}

interface RepairOrder {
  id: string;
  status: string;
  technician_id: string;
  createdAt: string;
  // Add other repair order properties as needed
}

interface TechnicianWorkloadProps {
  technicians: Technician[];
  repairOrders: RepairOrder[];
  limit?: number;
}

const TechnicianWorkload: React.FC<TechnicianWorkloadProps> = ({ 
  technicians, 
  repairOrders,
  limit = 5
}) => {
  // Calculate workload for each technician
  const technicianWorkloads = useMemo(() => {
    // Create a map to store the count of active orders per technician
    const workloadMap = new Map<string, number>();
    
    // Initialize all technicians with 0 active orders
    technicians.forEach(tech => {
      workloadMap.set(tech.id, 0);
    });
    
    // Count active orders (pending or in_progress) for each technician
    repairOrders.forEach(order => {
      if (
        order.technician_id && 
        (order.status === 'pending' || order.status === 'in_progress')
      ) {
        const currentCount = workloadMap.get(order.technician_id) || 0;
        workloadMap.set(order.technician_id, currentCount + 1);
      }
    });
    
    // Convert to array and add technician info
    const workloads = Array.from(workloadMap.entries()).map(([techId, count]) => {
      const tech = technicians.find(t => t.id === techId);
      return {
        id: techId,
        name: tech?.name || 'Unknown Technician',
        email: tech?.email || '',
        activeOrders: count
      };
    });
    
    // Sort by active orders (ascending)
    return workloads.sort((a, b) => a.activeOrders - b.activeOrders);
  }, [technicians, repairOrders]);
  
  // Limit the number of technicians to display
  const displayedTechnicians = technicianWorkloads.slice(0, limit);
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold flex items-center">
          <Users className="h-5 w-5 mr-2 text-indigo-600" />
          Technicians with Least Workload
        </h2>
        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
          Top {limit}
        </span>
      </div>
      
      {displayedTechnicians.length > 0 ? (
        <div className="divide-y divide-gray-100">
          {displayedTechnicians.map((tech) => (
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
          Showing technicians with the lowest active workload. These technicians are available to take on new repair orders.
        </p>
      </div>
    </div>
  );
};

export default TechnicianWorkload;