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
        <main className="flex-1 overflow-y-auto p-6 bg-gray-100">
          {/* Dashboard content without header */}
          {activePage === "Home" && (
            <Home 
              activeOrderCount={activeOrderCount}
              canGetNewOrder={canGetNewOrder}
              pendingOrdersCount={pendingOrders.length}
              getNextRepairOrder={getNextRepairOrder}
            />
          )}
          {activePage === "ActiveOrders" && <ActiveOrders />}
          {activePage === "CompletedOrders" && <CompletedOrders />}
          {activePage === "Help" && <Help />}
        </main>
      </div>
    </div>
  );
}