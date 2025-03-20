import React, { useMemo, useState, useEffect } from "react";
import { Users, ChevronDown, ChevronUp, Info } from "lucide-react";

interface Technician {
  id: string;
  auth_id: string;
  name: string;
  email: string;
  role: string;
  last_activity?: string;
}

export interface RepairOrder {
  id: string;
  description: string;
  status: "pending" | "in_progress" | "completed" | "on_hold";
  priority: number;
  assignedTo?: string;
  assigned_to?: string;
  technicianId?: string;
  technician_id?: string;
}

interface TechnicianWorkloadProps {
  technicians: Technician[];
  repairOrders: RepairOrder[];
}

const TechnicianWorkload: React.FC<TechnicianWorkloadProps> = ({
  technicians,
  repairOrders,
}) => {
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [tooltipTech, setTooltipTech] = useState<string | null>(null);
  const [timers, setTimers] = useState<{ [key: string]: number }>({});
  const [flashingTechs, setFlashingTechs] = useState<{
    [key: string]: boolean;
  }>({});

  const technicianWorkloads = useMemo(() => {
    if (!technicians || !repairOrders) return [];

    const fiveHoursAgo = new Date(
      Date.now() - 5 * 60 * 60 * 1000
    ).toISOString();
    const activeTechnicians = technicians.filter(
      (tech) => tech.last_activity && tech.last_activity > fiveHoursAgo
    );

    const techMap = new Map<string, Technician>();
    activeTechnicians.forEach((tech) => {
      techMap.set(tech.id, tech);
      if (tech.auth_id) techMap.set(tech.auth_id, tech);
    });

    const workloadMap = new Map<
      string,
      {
        tech: Technician;
        count: number;
        onHoldCount: number;
        onHoldOrders: string[];
        orders: string[];
      }
    >();

    activeTechnicians.forEach((tech) => {
      workloadMap.set(tech.id, {
        tech,
        count: 0,
        onHoldCount: 0,
        onHoldOrders: [],
        orders: [],
      });
    });

    repairOrders.forEach((order) => {
      const possibleIds = [
        order.technicianId,
        order.technician_id,
        order.assignedTo,
        order.assigned_to,
      ].filter(Boolean) as string[];

      for (const possibleId of possibleIds) {
        if (techMap.has(possibleId)) {
          const tech = techMap.get(possibleId);
          if (tech) {
            const workloadData = workloadMap.get(tech.id);
            if (workloadData) {
              if (
                order.status === "pending" ||
                order.status === "in_progress"
              ) {
                workloadData.count += 1;
                workloadData.orders.push(order.description);
              } else if (order.status === "on_hold") {
                workloadData.onHoldCount += 1;
                workloadData.onHoldOrders.push(order.description);
              }
            }
            break;
          }
        }
      }
    });

    return Array.from(workloadMap.values()).map(
      ({ tech, count, onHoldCount, onHoldOrders, orders }) => ({
        id: tech.id,
        name: tech.name,
        email: tech.email,
        currentOrder: orders.length > 0 ? orders[0] : null,
        activeOrderCount: count,
        onHoldOrders: onHoldCount,
        onHoldOrderDescriptions: onHoldOrders,
      })
    );
  }, [technicians, repairOrders, sortOrder]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimers((prevTimers) => {
        const updatedTimers = { ...prevTimers };

        // Loop through all technicians and ensure they are being tracked
        technicianWorkloads.forEach((tech) => {
          if (!(tech.id in updatedTimers)) {
            updatedTimers[tech.id] = 0; // Initialize missing timers
          }

          // If they have no active orders, increment the timer
          if (tech.activeOrderCount === 0) {
            updatedTimers[tech.id] += 1;

            // If timer hits threshold (1 minute for testing), enable flashing
            if (updatedTimers[tech.id] >= 1) {
              setFlashingTechs((prev) => ({ ...prev, [tech.id]: true }));
            }
          } else {
            updatedTimers[tech.id] = 0; // Reset timer if they get an order
            setFlashingTechs((prev) => ({ ...prev, [tech.id]: false })); // Stop flashing
          }
        });

        return updatedTimers;
      });
    }, 60000); // Runs every minute

    return () => clearInterval(interval);
  }, [technicianWorkloads]);

  useEffect(() => {
    technicianWorkloads.forEach((tech) => {
      if (tech.activeOrderCount > 0) {
        setFlashingTechs((prev) => ({ ...prev, [tech.id]: false })); // Stop flashing only for this tech
        setTimers((prev) => ({ ...prev, [tech.id]: 0 })); // Reset timer for this tech
      } else if (!(tech.id in timers)) {
        setTimers((prev) => ({ ...prev, [tech.id]: 0 })); // Start timer if it doesn't exist
      }
    });
  }, [technicianWorkloads]);

  const toggleSortOrder = () =>
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));

  // Helper function to capitalize first letter of each sentence
  const capitalizeFirstLetter = (text: string): string => {
    if (!text) return '';
    
    // Split by sentence-ending punctuation followed by a space
    return text.split(/([.!?]\s+)/).map((part, index) => {
      // If this is a punctuation part, return it as is
      if (/^[.!?]\s+$/.test(part)) return part;
      
      // Otherwise capitalize the first letter if it's a lowercase 'i' by itself
      return part.replace(/(\s|^)i(\s|$)/g, (match, p1, p2) => `${p1}I${p2}`);
    }).join('');
  };

  // CSS for blinking effect - imported from ActiveRepairOrdersTable
  const blinkingStyle = `
    @keyframes blink {
      0% { background-color: rgba(239, 68, 68, 0.2); }
      50% { background-color: rgba(239, 68, 68, 0.5); }
      100% { background-color: rgba(239, 68, 68, 0.2); }
    }
    .urgent-row {
      animation: blink 1.5s infinite;
    }
  `;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 relative">
      <style>{blinkingStyle}</style>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold flex items-center">
          <Users className="h-5 w-5 mr-2 text-indigo-600" />
          Technician Workload
        </h2>
        <button
          onClick={toggleSortOrder}
          className="text-xs text-gray-700 bg-gray-100 px-3 py-1 rounded-full flex items-center"
        >
          {sortOrder === "asc" ? "Least busy first" : "Most busy first"}
          {sortOrder === "asc" ? (
            <ChevronUp className="h-4 w-4 ml-1" />
          ) : (
            <ChevronDown className="h-4 w-4 ml-1" />
          )}
        </button>
      </div>

      {technicianWorkloads.length > 0 ? (
        <div className="space-y-1">
          {technicianWorkloads.map((tech) => (
            <div
              key={tech.id}
              className={`flex items-center justify-between bg-gray-50 rounded-md p-2 relative ${
                flashingTechs[tech.id] ? "urgent-row" : ""
              }`}
            >
              {/* Left Side: Avatar & Name */}
              <div className="flex items-center w-1/3">
                <div className="rounded-full w-8 h-8 bg-indigo-100 text-indigo-700 flex items-center justify-center mr-2 text-xs font-bold uppercase">
                  {tech.name.charAt(0)}
                </div>
                <p className="font-medium text-gray-800 text-sm leading-tight">
                  {tech.name}
                </p>
              </div>

              {/* Right Side: Orders Section (Centered) */}
              <div className="flex flex-col items-center justify-center text-center w-2/3">
                {tech.currentOrder ? (
                  <span className="px-2 py-1 rounded-full bg-green-100 text-black text-xs font-semibold">
                    Active Order: {tech.currentOrder}
                  </span>
                ) : (
                  <span className="px-2 py-1 rounded-full bg-red-100 text-red-600 text-xs">
                    No orders
                  </span>
                )}

                {/* On Hold Orders Section */}
                {tech.onHoldOrders > 0 && (
                  <div className="flex items-center mt-1">
                    <p className="px-2 py-1 text-xs text-gray-800 leading-tight">
                      {tech.onHoldOrders}{" "}
                      {tech.onHoldOrders === 1 ? "Order" : "Orders"} On Hold
                    </p>
                    <button
                      onClick={() =>
                        setTooltipTech(tooltipTech === tech.id ? null : tech.id)
                      }
                      className="ml-1 text-gray-500 hover:text-gray-700"
                    >
                      <Info className="h-3 w-3" />
                    </button>
                  </div>
                )}

                {/* Tooltip for on hold orders */}
                {tooltipTech === tech.id &&
                  tech.onHoldOrderDescriptions &&
                  tech.onHoldOrderDescriptions.length > 0 && (
                    <div className="absolute z-10 mt-2 w-60 right-0 transform translate-y-full bg-white rounded-md shadow-lg p-3 text-left border border-gray-200">
                      <p className="font-bold text-xs mb-1 text-gray-700">
                        On Hold Orders:
                      </p>
                      <ul className="text-xs space-y-1 text-gray-600 max-h-36 overflow-auto">
                        {tech.onHoldOrderDescriptions
                          .filter((desc) => desc.trim() !== "") // Remove empty descriptions
                          .slice(0, 5) // Limit to first 5 for better UI
                          .map((description, idx) => (
                            <li key={idx} className="truncate">
                              • {capitalizeFirstLetter(description)}
                            </li>
                          ))}
                      </ul>
                      {tech.onHoldOrderDescriptions.length > 5 && (
                        <p className="text-xs text-gray-500 mt-1">
                          + {tech.onHoldOrderDescriptions.length - 5} more...
                        </p>
                      )}
                    </div>
                  )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500">
          No technician data available
        </p>
      )}
    </div>
  );
};

export default TechnicianWorkload;