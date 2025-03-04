import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient'; // Adjust path if needed

interface TeamMember {
  id: string;
  auth_id: string;
  email: string;
  name: string;
  role: 'admin' | 'technician';
  created_at?: string;
}

const TeamMembers: React.FC = () => {
  // State for DB members + search
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchMembers = async () => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching team members:', error);
        return;
      }

      if (data) {
        setMembers(data);
      }
    };

    fetchMembers();
  }, []);

  const filteredMembers = members.filter((m) =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const admins = filteredMembers.filter((m) => m.role === 'admin');
  const technicians = filteredMembers.filter((m) => m.role === 'technician');

  // Function for the "Add Admin" button
  const handleAddAdmin = async () => {
    try {
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
  
      const result = await response.json();
      if (response.ok) {
        console.log("✅ Email Sent Successfully:", result);
      } else {
        console.error("❌ Error Sending Email:", result.error);
      }
    } catch (error) {
      console.error("❌ Network error:", error);
    }
  };
  
  

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Team Members</h1>

      {/* Search Bar */}
      <div className="relative mb-6">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 
                     rounded-md leading-5 bg-white placeholder-gray-500 
                     focus:outline-none focus:ring-indigo-500 
                     focus:border-indigo-500 sm:text-sm"
          placeholder="Search team members..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Admins Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-700 border-b pb-2">
            Admins
          </h2>
          {/* Add Admin Button */}
          <button
            onClick={handleAddAdmin}
            className="px-3 py-1 bg-indigo-600 text-white text-sm font-medium 
                       rounded-md hover:bg-indigo-700 focus:outline-none 
                       focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Add Admin
          </button>
        </div>
        {admins.length > 0 ? (
          <div className="space-y-4">
            {admins.map((admin) => (
              <div
                key={admin.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center">
                  <div
                    className="w-10 h-10 rounded-full bg-indigo-100 
                               flex items-center justify-center text-indigo-800 font-bold"
                  >
                    {admin.name ? admin.name.charAt(0).toUpperCase() : 'A'}
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">
                      {admin.name || '(No Name)'}
                    </p>
                    <p className="text-sm text-gray-500">{admin.email}</p>
                  </div>
                </div>
                <span
                  className="px-2 py-1 text-xs font-semibold text-orange-800 
                             bg-orange-100 rounded-full"
                >
                  Admin
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 italic">No admins found</p>
        )}
      </div>

      {/* Technicians Section */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-700 border-b pb-2">
            Technicians
          </h2>
        </div>
        {technicians.length > 0 ? (
          <div className="space-y-4">
            {technicians.map((tech) => (
              <div
                key={tech.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center">
                  <div
                    className="w-10 h-10 rounded-full bg-blue-100 
                               flex items-center justify-center text-blue-800 font-bold"
                  >
                    {tech.name ? tech.name.charAt(0).toUpperCase() : 'T'}
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">
                      {tech.name || '(No Name)'}
                    </p>
                    <p className="text-sm text-gray-500">{tech.email}</p>
                  </div>
                </div>
                <span
                  className="px-2 py-1 text-xs font-semibold text-blue-800 
                             bg-blue-100 rounded-full"
                >
                  Technician
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 italic">No technicians found</p>
        )}
      </div>
    </div>
  );
};

export default TeamMembers;
