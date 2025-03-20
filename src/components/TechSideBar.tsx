"use client";

import React from "react";
import { Home, CheckCircle, HelpCircle, LogOut, PauseCircle, Wrench } from "lucide-react";

export type PageType = "Home" | "ActiveOrders" | "OnHoldOrders" | "CompletedOrders" | "Help";

interface TechSidebarProps {
  userName: string;
  activePage: PageType;
  onNavigate: (page: PageType) => void;
  onLogout: () => void;
  activeOrdersCount: number;
  onHoldOrdersCount: number; // NEW PROP for On Hold Orders
}

const TechSidebar: React.FC<TechSidebarProps> = ({
  userName,
  activePage,
  onNavigate,
  onLogout,
  activeOrdersCount,
  onHoldOrdersCount,
}) => {
  return (
    <div className="w-64 bg-gray-800 text-white flex flex-col h-screen">
      {/* Sidebar Header */}
      <div className="p-4 border-b border-gray-700 bg-grey-400">
        <h2 className="text-xl font-bold">Repair Order</h2>
        <p className="text-sm text-gray-300">Management System</p>
      </div>

      {/* User Profile Section */}
      <div className="p-4 border-b border-gray-700 flex items-center">
        <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center">
          <span className="font-bold">{userName ? userName[0] : "T"}</span>
        </div>
        <div className="ml-3">
          <p className="font-medium">{userName}</p>
          <p className="text-xs text-gray-400">Technician</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto p-2">
        {[
          { name: "Home", icon: Home },
          { name: "ActiveOrders", icon: Wrench, count: activeOrdersCount },
          { name: "OnHoldOrders", icon: PauseCircle, count: onHoldOrdersCount }, // OnHoldOrders Counter
          { name: "CompletedOrders", icon: CheckCircle },
          { name: "Help", icon: HelpCircle },
        ].map(({ name, icon: Icon, count }) => (
          <button
            key={name}
            className={`flex items-center w-full p-3 rounded-md ${
              activePage === name ? "bg-indigo-700" : "hover:bg-gray-700"
            }`}
            onClick={() => onNavigate(name as PageType)}
          >
            <Icon size={18} />
            <span className="ml-3">{name}</span>
            {count !== undefined && count > 0 && (
              <span className="ml-auto bg-indigo-500 text-white text-xs px-2 py-1 rounded-full">
                {count}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* Logout Button */}
      <div className="p-3 border-t border-gray-700">
        <button
          onClick={onLogout}
          className="flex items-center w-full p-3 rounded-md hover:bg-gray-700 text-gray-300"
        >
          <LogOut size={18} />
          <span className="ml-3">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default TechSidebar;
