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
  const { technicianOrders } = useRepairOrders();
  const [activePage, setActivePage] = useState<"Home" | "ActiveOrders" | "CompletedOrders" | "Help">("Home");

  if (!currentUser) return <p>Loading...</p>;

  const myOrders = technicianOrders(currentUser.id);
  const activeOrders = myOrders.filter(order => order.status === "in_progress");

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
        <header className="h-20 bg-indigo-600 text-white shadow"></header>

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
