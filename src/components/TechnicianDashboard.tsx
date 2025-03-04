"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRepairOrders } from "@/context/RepairOrderContext";
import TechSidebar from "@/components/TechSideBar";
import Home from "@/components/TechnicianTabs/Home";
import ActiveOrders from "@/components/TechnicianTabs/ActiveOrders";
import CompletedOrders from "@/components/TechnicianTabs/CompletedOrders";
import Help from "@/components/TechnicianTabs/Help";

export default function TechnicianDashboard() {
  const { currentUser, logout } = useAuth();
  const { 
    technicianOrders, 
    getNextRepairOrder, 
    technicianActiveOrderCount,
    canRequestNewOrder,
    pendingOrders 
  } = useRepairOrders();
  
  const [activePage, setActivePage] = useState<"Home" | "ActiveOrders" | "CompletedOrders" | "Help">("Home");

  if (!currentUser) return <p>Loading...</p>;

  const myOrders = technicianOrders(currentUser.id);
  const activeOrders = myOrders.filter(order => order.status === "in_progress");
  const activeOrderCount = technicianActiveOrderCount(currentUser.id);
  const canGetNewOrder = canRequestNewOrder(currentUser.id);

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <TechSidebar
        userName={currentUser.name}
        activePage={activePage}
        onNavigate={setActivePage}
        onLogout={logout}
        activeOrdersCount={activeOrders.length}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 bg-indigo-600 text-white shadow">
          <div className="flex justify-between items-center p-4">
            <div className="flex items-center">
              <h1 className="text-xl font-bold">Technician Dashboard</h1>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm">
                Active Orders: <strong>{activeOrderCount}/3</strong>
              </span>
              <button
                onClick={getNextRepairOrder}
                disabled={!canGetNewOrder || pendingOrders.length === 0}
                className="bg-indigo-700 hover:bg-indigo-800 text-white px-4 py-2 rounded text-sm disabled:bg-gray-500"
              >
                Get Next Repair Order
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 bg-gray-100">
          {activePage === "Home" && <Home />}
          {activePage === "ActiveOrders" && <ActiveOrders />}
          {activePage === "CompletedOrders" && <CompletedOrders />}
          {activePage === "Help" && <Help />}
        </main>
      </div>
    </div>
  );
}