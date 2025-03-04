// src/components/AdminSidebar.tsx
import React from 'react';
import { 
  Home, 
  Users, 
  List, 
  FileText, 
  BarChart2, 
  Clock, 
  AlertTriangle, 
  Settings, 
  HelpCircle, 
  LogOut 
} from 'lucide-react';

/** Union of all possible admin pages. */
export type AdminPage =
  | 'Dashboard'
  | 'Technicians'
  | 'Queue'
  | 'Orders'
  | 'Performance'
  | 'Turnaround'
  | 'Alerts'
  | 'Settings'
  | 'Help';

interface AdminSidebarProps {
  /** Display name of the logged-in user, e.g. "John Doe" */
  userName: string;
  /** Which page is currently active? Must match our union type. */
  activePage: AdminPage;
  /** Called when the user chooses a new page. */
  onNavigate: React.Dispatch<React.SetStateAction<AdminPage>>;
  /** Logs the user out. */
  onLogout: () => void;
}

/** Renders the Admin sidebar with navigation links. */
const AdminSidebar: React.FC<AdminSidebarProps> = ({
  userName,
  activePage,
  onNavigate,
  onLogout,
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
          <span className="font-bold">{userName ? userName[0] : 'A'}</span>
        </div>
        <div className="ml-3">
          <p className="font-medium">{userName || 'Admin User'}</p>
          <p className="text-xs text-gray-400">Administrator</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto">
        <ul className="p-2">
          <li className="mb-1">
            <button
              className={`flex items-center w-full p-3 rounded-md ${
                activePage === 'Dashboard' ? 'bg-indigo-700' : 'hover:bg-gray-700'
              }`}
              onClick={() => onNavigate('Dashboard')}
            >
              <Home size={18} />
              <span className="ml-3">Dashboard</span>
            </button>
          </li>
          <li className="mb-1">
            <button
              className={`flex items-center w-full p-3 rounded-md ${
                activePage === 'Technicians' ? 'bg-indigo-700' : 'hover:bg-gray-700'
              }`}
              onClick={() => onNavigate('Technicians')}
            >
              <Users size={18} />
              <span className="ml-3">Technicians</span>
            </button>
          </li>
          <li className="mb-1">
            <button
              className={`flex items-center w-full p-3 rounded-md ${
                activePage === 'Queue' ? 'bg-indigo-700' : 'hover:bg-gray-700'
              }`}
              onClick={() => onNavigate('Queue')}
            >
              <List size={18} />
              <span className="ml-3">Queue Management</span>
            </button>
          </li>
          <li className="mb-1">
            <button
              className={`flex items-center w-full p-3 rounded-md ${
                activePage === 'Orders' ? 'bg-indigo-700' : 'hover:bg-gray-700'
              }`}
              onClick={() => onNavigate('Orders')}
            >
              <FileText size={18} />
              <span className="ml-3">All Repair Orders</span>
            </button>
          </li>
        </ul>

        <div className="p-3">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Reports</p>
        </div>

        <ul className="p-2">
          <li className="mb-1">
            <button
              className={`flex items-center w-full p-3 rounded-md ${
                activePage === 'Performance' ? 'bg-indigo-700' : 'hover:bg-gray-700'
              }`}
              onClick={() => onNavigate('Performance')}
            >
              <BarChart2 size={18} />
              <span className="ml-3">Performance</span>
            </button>
          </li>
          <li className="mb-1">
            <button
              className={`flex items-center w-full p-3 rounded-md ${
                activePage === 'Turnaround' ? 'bg-indigo-700' : 'hover:bg-gray-700'
              }`}
              onClick={() => onNavigate('Turnaround')}
            >
              <Clock size={18} />
              <span className="ml-3">Turnaround Time</span>
            </button>
          </li>
        </ul>

        <div className="p-3">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">System</p>
        </div>

        <ul className="p-2">
          <li className="mb-1">
            <button
              className={`flex items-center w-full p-3 rounded-md ${
                activePage === 'Alerts' ? 'bg-indigo-700' : 'hover:bg-gray-700'
              }`}
              onClick={() => onNavigate('Alerts')}
            >
              <AlertTriangle size={18} />
              <span className="ml-3">Alerts</span>
              {/* Example: could pass down a alertsCount prop if needed */}
              <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">3</span>
            </button>
          </li>
          <li className="mb-1">
            <button
              className={`flex items-center w-full p-3 rounded-md ${
                activePage === 'Settings' ? 'bg-indigo-700' : 'hover:bg-gray-700'
              }`}
              onClick={() => onNavigate('Settings')}
            >
              <Settings size={18} />
              <span className="ml-3">Settings</span>
            </button>
          </li>
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

export default AdminSidebar;
