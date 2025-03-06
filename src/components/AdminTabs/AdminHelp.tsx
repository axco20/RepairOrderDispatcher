import React, { useState, ReactNode, isValidElement } from 'react';
import { HelpCircle, ChevronDown, Mail, Phone, Search } from 'lucide-react';

// Define interfaces for our help section structure
interface HelpSection {
  id: string;
  title: string;
  content: React.ReactElement;
}

// Type for React elements with children
interface ReactElementWithChildren extends React.ReactElement {
  props: {
    children?: ReactNode | ReactNode[];
  };
}

// Type guard to check if an element is a valid React element with children
function isReactElementWithChildren(value: unknown): value is ReactElementWithChildren {
  return isValidElement(value) && 
         value.props !== null && 
         typeof value.props === 'object' && 
         'children' in value.props;
}

// Helper function to safely convert and search in content
function contentIncludesQuery(content: ReactNode, query: string): boolean {
  if (typeof content === 'string') {
    return content.toLowerCase().includes(query.toLowerCase());
  }
  
  if (isReactElementWithChildren(content)) {
    const children = content.props.children;
    
    if (Array.isArray(children)) {
      return children.some(child => contentIncludesQuery(child, query));
    }
    
    return contentIncludesQuery(children, query);
  }
  
  if (Array.isArray(content)) {
    return content.some(item => contentIncludesQuery(item, query));
  }
  
  // Try to convert other values to string if possible
  if (content !== null && content !== undefined) {
    try {
      const stringValue = String(content);
      return stringValue.toLowerCase().includes(query.toLowerCase());
    } catch {
      return false;
    }
  }
  
  return false;
}

const AdminHelp: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string | null>('getting-started');
  const [searchQuery, setSearchQuery] = useState('');

  const toggleSection = (sectionId: string) => {
    setActiveSection(activeSection === sectionId ? null : sectionId);
  };

  const helpSections: HelpSection[] = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      content: (
        <div className="space-y-4">
          <p>Welcome to the Repair Order Management System. This guide will help you understand how to use the system effectively.</p>
          
          <h4 className="text-lg font-medium text-gray-800">System Overview</h4>
          <p>The Repair Order Management System helps you manage repair orders, technicians, and workflows for automotive repair operations. Key features include:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Dashboard with real-time performance metrics</li>
            <li>Repair order creation and tracking</li>
            <li>Technician management and assignment</li>
            <li>Queue management for efficient workflow</li>
            <li>Performance reporting and analytics</li>
          </ul>
          
          <h4 className="text-lg font-medium text-gray-800">Admin Responsibilities</h4>
          <p>As an administrator, you can:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Create and manage repair orders</li>
            <li>Add and manage technician accounts</li>
            <li>Assign orders to technicians</li>
            <li>Monitor performance metrics</li>
            <li>Configure system settings</li>
          </ul>
        </div>
      )
    },
    {
      id: 'dashboard',
      title: 'Dashboard',
      content: (
        <div className="space-y-4">
          <p>The dashboard provides an overview of your repair operation&apos;s performance and key metrics.</p>
          
          <h4 className="text-lg font-medium text-gray-800">Dashboard Features</h4>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Stats Cards:</strong> View total orders, orders in progress, and completed orders</li>
            <li><strong>Active Technicians:</strong> See how many technicians are currently active</li>
            <li><strong>Workload per Technician:</strong> Monitor average orders per technician</li>
            <li><strong>Order Volume Chart:</strong> Visualize order volume over time</li>
          </ul>
          
          <h4 className="text-lg font-medium text-gray-800">Time Range Filtering</h4>
          <p>Use the time range buttons (Today, Week, Month, Year) to adjust the data time period displayed on the dashboard.</p>
        </div>
      )
    },
    {
      id: 'repair-orders',
      title: 'Repair Orders',
      content: (
        <div className="space-y-4">
          <p>The Repair Orders section allows you to manage all repair tickets in the system.</p>
          
          <h4 className="text-lg font-medium text-gray-800">Managing Orders</h4>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Creating Orders:</strong> Click &quot;New Order&quot; to create a repair ticket</li>
            <li><strong>Editing Orders:</strong> Click on any order to view details and make changes</li>
            <li><strong>Filtering:</strong> Use filter options to sort by status, technician, date, etc.</li>
            <li><strong>Assigning:</strong> Assign orders to technicians directly from the order details page</li>
          </ul>
          
          <h4 className="text-lg font-medium text-gray-800">Order Statuses</h4>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Pending:</strong> New orders awaiting assignment</li>
            <li><strong>In Progress:</strong> Orders currently being worked on</li>
            <li><strong>Completed:</strong> Orders where repair work is finished</li>
          </ul>
        </div>
      )
    },
    {
      id: 'technicians',
      title: 'Technicians',
      content: (
        <div className="space-y-4">
          <p>The Technicians section allows you to manage your repair technician team.</p>
          
          <h4 className="text-lg font-medium text-gray-800">Managing Technicians</h4>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Adding Technicians:</strong> Click &quot;Add Technician&quot; to create a new account</li>
            <li><strong>Editing Profiles:</strong> Click on any technician to edit their details</li>
            <li><strong>Viewing Workload:</strong> See current assignments for each technician</li>
            <li><strong>Performance:</strong> View individual technician performance metrics</li>
          </ul>
          
          <h4 className="text-lg font-medium text-gray-800">Technician Accounts</h4>
          <p>Each technician has their own login to access their assigned orders. They can:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>View their assigned repair orders</li>
            <li>Update order status as they progress</li>
            <li>Add notes and details to orders</li>
            <li>Mark orders as complete when finished</li>
          </ul>
        </div>
      )
    },
    {
      id: 'queue',
      title: 'Queue Management',
      content: (
        <div className="space-y-4">
          <p>The Queue Management section helps you organize and prioritize repair orders efficiently.</p>
          
          <h4 className="text-lg font-medium text-gray-800">Queue Features</h4>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Viewing Queue:</strong> See all orders in the current queue</li>
            <li><strong>Prioritizing:</strong> Drag and drop to reorder priority</li>
            <li><strong>Filtering:</strong> Filter by order type, status, or priority</li>
            <li><strong>Auto-Assignment:</strong> Enable auto-assignment to distribute orders</li>
          </ul>
          
          <h4 className="text-lg font-medium text-gray-800">Assignment Rules</h4>
          <p>The system follows these rules when auto-assigning orders:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Technicians can have a maximum of 3 active orders at once</li>
            <li>Orders are assigned based on priority and technician availability</li>
            <li>Specialized repairs are assigned to qualified technicians only</li>
            <li>Workload is balanced across all available technicians</li>
          </ul>
        </div>
      )
    },
    {
      id: 'performance',
      title: 'Performance Reports',
      content: (
        <div className="space-y-4">
          <p>The Performance section provides analytics and reporting on technician and overall repair shop performance.</p>
          
          <h4 className="text-lg font-medium text-gray-800">Performance Metrics</h4>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Completion Rate:</strong> Percentage of orders completed</li>
            <li><strong>Average Time:</strong> Average time to complete repairs</li>
            <li><strong>Technician Metrics:</strong> Individual performance of each technician</li>
            <li><strong>Historical Data:</strong> Performance trends over time</li>
          </ul>
          
          <h4 className="text-lg font-medium text-gray-800">Using Reports</h4>
          <p>To get the most from performance reports:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Use the time filters to view data for different periods</li>
            <li>Compare technician performance to identify training needs</li>
            <li>Monitor completion times to identify efficiency opportunities</li>
            <li>Track overall shop performance month-to-month</li>
          </ul>
        </div>
      )
    },
    {
      id: 'troubleshooting',
      title: 'Troubleshooting',
      content: (
        <div className="space-y-4">
          <p>Common issues and their solutions:</p>
          
          <h4 className="text-lg font-medium text-gray-800">Login Issues</h4>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Unable to Log In:</strong> Verify your username and password. Click &quot;Forgot Password&quot; if needed.</li>
            <li><strong>Account Locked:</strong> Contact system administrator to unlock your account.</li>
          </ul>
          
          <h4 className="text-lg font-medium text-gray-800">Order Management</h4>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Can&apos;t Create Order:</strong> Verify you have the correct permissions.</li>
            <li><strong>Order Not Showing:</strong> Check your filter settings as they may be filtering out the order.</li>
            <li><strong>Assignment Failed:</strong> Ensure the technician hasn&apos;t reached their maximum workload.</li>
          </ul>
          
          <h4 className="text-lg font-medium text-gray-800">Data Not Updating</h4>
          <ul className="list-disc pl-6 space-y-1">
            <li>Try refreshing the page</li>
            <li>Clear your browser cache</li>
            <li>Logout and log back in</li>
            <li>If problems persist, contact technical support</li>
          </ul>
        </div>
      )
    }
  ];

  // Filter sections based on search query with improved type safety
  const filteredSections = searchQuery 
    ? helpSections.filter(section => {
        // Check if title matches search
        if (section.title.toLowerCase().includes(searchQuery.toLowerCase())) {
          return true;
        }
        
        // Check if content matches search (using our helper function)
        return contentIncludesQuery(section.content, searchQuery);
      })
    : helpSections;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center mb-6">
        <HelpCircle className="h-8 w-8 text-indigo-600 mr-3" />
        <h1 className="text-2xl font-bold text-gray-800">Help & Support Center</h1>
      </div>

      {/* Search */}
      <div className="mb-8 relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          placeholder="Search help topics..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Help Content */}
      <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
        {filteredSections.map((section) => (
          <div key={section.id} className="border-b border-gray-200 last:border-0">
            <button
              className="w-full px-6 py-4 text-left flex justify-between items-center focus:outline-none"
              onClick={() => toggleSection(section.id)}
            >
              <span className="text-lg font-medium text-gray-900">{section.title}</span>
              <ChevronDown
                className={`h-5 w-5 text-gray-500 transition-transform ${
                  activeSection === section.id ? 'transform rotate-180' : ''
                }`}
              />
            </button>
            {activeSection === section.id && (
              <div className="px-6 pb-6 text-gray-700">
                {section.content}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Contact Support */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Need Additional Help?</h2>
        <p className="text-gray-600 mb-6">
          Our support team is available Monday through Friday, 8:00 AM - 6:00 PM Eastern Time.
          Contact us through one of the methods below:
        </p>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="flex items-start">
            <Mail className="h-5 w-5 text-indigo-600 mt-1 mr-3" />
            <div>
              <h3 className="text-sm font-semibold text-gray-800">Email Support</h3>
              <p className="text-gray-600">support@repairordersystem.com</p>
              <p className="text-xs text-gray-500 mt-1">Response within 24 hours</p>
            </div>
          </div>
          <div className="flex items-start">
            <Phone className="h-5 w-5 text-indigo-600 mt-1 mr-3" />
            <div>
              <h3 className="text-sm font-semibold text-gray-800">Phone Support</h3>
              <p className="text-gray-600">1-800-555-HELP (4357)</p>
              <p className="text-xs text-gray-500 mt-1">Available during business hours</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminHelp;