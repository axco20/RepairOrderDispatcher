// src/components/TechSidebar.tsx
import React from 'react';
import { Home, CheckCircle, HelpCircle, LogOut } from 'lucide-react';

/** The page names your technician can navigate to. */
export type PageType = 'Home' | 'ActiveOrders' | 'CompletedOrders' | 'Help';

interface TechSidebarProps {
  userName: string;
  /** The currently active page (must be one of the union above). */
  activePage: PageType;
  /** A state-setter style function for changing pages. */
  onNavigate: React.Dispatch<React.SetStateAction<PageType>>;
  /** Logs out the user. */
  onLogout: () => void;
  /** Number displayed next to "My Active Orders". */
  activeOrdersCount: number;
}

const TechSidebar: React.FC<TechSidebarProps> = ({
  userName,
  activePage,
  onNavigate,
  onLogout,
  activeOrdersCount,
}) => {
  return (
    <div className="w-64 bg-gray-800 text-white flex flex-col h-screen">
      {/* Sidebar Header */}
      <div className="p-4 border-b border-gray-700 bg-indigo-600">
        <h2 className="text-xl font-bold">Repair Order</h2>
        <p className="text-sm text-gray-300">Management System</p>
      </div>

      {/* User Profile Section */}
      <div className="p-4 border-b border-gray-700 flex items-center">
        <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center">
          <span className="font-bold">{userName ? userName[0] : 'T'}</span>
        </div>
        <div className="ml-3">
          <p className="font-medium">{userName}</p>
          <p className="text-xs text-gray-400">Technician</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto">
        <ul className="p-2">
          <li className="mb-1">
            <button
              className={`flex items-center w-full p-3 rounded-md ${
                activePage === 'Home' ? 'bg-indigo-700' : 'hover:bg-gray-700'
              }`}
              onClick={() => onNavigate('Home')}
            >
              <Home size={18} />
              <span className="ml-3">Home</span>
            </button>
          </li>
          <li className="mb-1">
            <button
              className={`flex items-center w-full p-3 rounded-md ${
                activePage === 'ActiveOrders' ? 'bg-indigo-700' : 'hover:bg-gray-700'
              }`}
              onClick={() => onNavigate('ActiveOrders')}
            >
              <span className="ml-3">My Active Orders</span>
              {activeOrdersCount > 0 && (
                <span className="ml-auto bg-indigo-500 text-white text-xs px-2 py-1 rounded-full">
                  {activeOrdersCount}
                </span>
              )}
            </button>
          </li>
          <li className="mb-1">
            <button
              className={`flex items-center w-full p-3 rounded-md ${
                activePage === 'CompletedOrders' ? 'bg-indigo-700' : 'hover:bg-gray-700'
              }`}
              onClick={() => onNavigate('CompletedOrders')}
            >
              <CheckCircle size={18} />
              <span className="ml-3">Completed Orders</span>
            </button>
          </li>
        </ul>

        <div className="p-3">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Help</p>
        </div>

        <ul className="p-2">
          <li className="mb-1">
            <button
              className={`flex items-center w-full p-3 rounded-md ${
                activePage === 'Help' ? 'bg-indigo-700' : 'hover:bg-gray-700'
              }`}
              onClick={() => onNavigate('Help')}
            >
              <HelpCircle size={18} />
              <span className="ml-3">Help & Support</span>
            </button>
          </li>
        </ul>
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
