// components/Sidebar.tsx
import { Home, Users, FileText, BarChart2, Settings, HelpCircle, AlertTriangle, Clock, List, LogOut } from 'lucide-react';

interface SidebarProps {
  activePage: string;
  onNavigate: (page: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activePage, onNavigate }) => {
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
          <span className="font-bold">AU</span>
        </div>
        <div className="ml-3">
          <p className="font-medium">Admin User</p>
          <p className="text-xs text-gray-400">Administrator</p>
        </div>
      </div>
      
      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto">
        <ul className="p-2">
          <li className="mb-1">
            <button 
              className={`flex items-center w-full p-3 rounded-md ${activePage === 'Dashboard' ? 'bg-indigo-700' : 'hover:bg-gray-700'}`}
              onClick={() => onNavigate('Dashboard')}
            >
              <Home size={18} />
              <span className="ml-3">Dashboard</span>
            </button>
          </li>
          <li className="mb-1">
            <button 
              className={`flex items-center w-full p-3 rounded-md ${activePage === 'Technicians' ? 'bg-indigo-700' : 'hover:bg-gray-700'}`}
              onClick={() => onNavigate('Technicians')}
            >
              <Users size={18} />
              <span className="ml-3">Technicians</span>
            </button>
          </li>
          <li className="mb-1">
            <button 
              className={`flex items-center w-full p-3 rounded-md ${activePage === 'Queue' ? 'bg-indigo-700' : 'hover:bg-gray-700'}`}
              onClick={() => onNavigate('Queue')}
            >
              <List size={18} />
              <span className="ml-3">Queue Management</span>
            </button>
          </li>
          <li className="mb-1">
            <button 
              className={`flex items-center w-full p-3 rounded-md ${activePage === 'Orders' ? 'bg-indigo-700' : 'hover:bg-gray-700'}`}
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
              className={`flex items-center w-full p-3 rounded-md ${activePage === 'Performance' ? 'bg-indigo-700' : 'hover:bg-gray-700'}`}
              onClick={() => onNavigate('Performance')}
            >
              <BarChart2 size={18} />
              <span className="ml-3">Performance</span>
            </button>
          </li>
          <li className="mb-1">
            <button 
              className={`flex items-center w-full p-3 rounded-md ${activePage === 'Turnaround' ? 'bg-indigo-700' : 'hover:bg-gray-700'}`}
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
              className={`flex items-center w-full p-3 rounded-md ${activePage === 'Alerts' ? 'bg-indigo-700' : 'hover:bg-gray-700'}`}
              onClick={() => onNavigate('Alerts')}
            >
              <AlertTriangle size={18} />
              <span className="ml-3">Alerts</span>
              <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">3</span>
            </button>
          </li>
          <li className="mb-1">
            <button 
              className={`flex items-center w-full p-3 rounded-md ${activePage === 'Settings' ? 'bg-indigo-700' : 'hover:bg-gray-700'}`}
              onClick={() => onNavigate('Settings')}
            >
              <Settings size={18} />
              <span className="ml-3">Settings</span>
            </button>
          </li>
          <li className="mb-1">
            <button 
              className={`flex items-center w-full p-3 rounded-md ${activePage === 'Help' ? 'bg-indigo-700' : 'hover:bg-gray-700'}`}
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
        <button className="flex items-center w-full p-3 rounded-md hover:bg-gray-700 text-gray-300">
          <LogOut size={18} />
          <span className="ml-3">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;