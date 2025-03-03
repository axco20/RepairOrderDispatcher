import React, { useState, useEffect } from 'react';
import { Search, X, Mail } from 'lucide-react';
import { supabase } from '../../../server/supabaseClient'; // Adjust path if needed

interface TeamMember {
  id: string;        // Our custom table's primary key
  auth_id: string;   // The UUID from auth.users
  email: string;
  name: string;
  role: 'admin' | 'technician'; // Or "Admin"/"Technician" if you prefer
  created_at?: string;
}

const TeamMembers: React.FC = () => {
  // State for DB members + search
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // State for modals/invites
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showTechnicianModal, setShowTechnicianModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');

  /**
   * 1. Fetch existing users from your "users" table
   *    (If "users" references "auth_id" to match auth.users).
   */
  useEffect(() => {
    const fetchMembers = async () => {
      const { data, error } = await supabase
        .from('users')
        .select('*') // or select('id, auth_id, email, name, role')
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

  /**
   * 2. Basic search
   */
  const filteredMembers = members.filter((m) =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Separate roles
  const admins = filteredMembers.filter((m) => m.role === 'admin');
  const technicians = filteredMembers.filter((m) => m.role === 'technician');

  /**
   * 3. Invite a user + add them to your "users" table
   *    using Supabase Auth v2.x "auth.admin.inviteUserByEmail"
   */
  const handleInvite = async (role: 'admin' | 'technician') => {
    try {
      const response = await fetch('../../../server/inviteUser', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail, role }),
      });
  
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to invite user');
  
      console.log('✅ Invitation sent:', result);
  
      // Refresh members list
      const { data: refreshedMembers } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });
  
      if (refreshedMembers) setMembers(refreshedMembers);
  
      setInviteEmail('');
      if (role === 'admin') setShowAdminModal(false);
      if (role === 'technician') setShowTechnicianModal(false);
    } catch (err) {
      console.error('❌ Error inviting user:', err);
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
          <button
            onClick={() => setShowAdminModal(true)}
            className="px-3 py-1 bg-indigo-600 text-white text-sm font-medium 
                       rounded-md hover:bg-indigo-700 focus:outline-none 
                       focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Invite Admin
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
          <button
            onClick={() => setShowTechnicianModal(true)}
            className="px-3 py-1 bg-blue-600 text-white text-sm font-medium 
                       rounded-md hover:bg-blue-700 focus:outline-none 
                       focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Invite Technician
          </button>
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

      {/* Admin Invite Modal */}
      {showAdminModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 
                     flex items-center justify-center z-50"
        >
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Invite Admin</h3>
              <button 
                onClick={() => setShowAdminModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mb-4">
              <label
                htmlFor="admin-email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  id="admin-email"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 
                             rounded-md leading-5 bg-white placeholder-gray-500 
                             focus:outline-none focus:ring-indigo-500 
                             focus:border-indigo-500 sm:text-sm"
                  placeholder="admin@example.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowAdminModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md 
                           text-sm font-medium text-gray-700 bg-white 
                           hover:bg-gray-50 focus:outline-none 
                           focus:ring-2 focus:ring-offset-2 
                           focus:ring-indigo-500"
              >
                Cancel
              </button>
              <button
                onClick={() => handleInvite('admin')}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm
                           text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700
                           focus:outline-none focus:ring-2 focus:ring-offset-2
                           focus:ring-indigo-500"
              >
                Send Invitation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Technician Invite Modal */}
      {showTechnicianModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 
                     flex items-center justify-center z-50"
        >
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Invite Technician
              </h3>
              <button 
                onClick={() => setShowTechnicianModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mb-4">
              <label
                htmlFor="technician-email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  id="technician-email"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300
                             rounded-md leading-5 bg-white placeholder-gray-500 
                             focus:outline-none focus:ring-blue-500 
                             focus:border-blue-500 sm:text-sm"
                  placeholder="technician@example.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowTechnicianModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md 
                           text-sm font-medium text-gray-700 bg-white 
                           hover:bg-gray-50 focus:outline-none 
                           focus:ring-2 focus:ring-offset-2 
                           focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                onClick={() => handleInvite('technician')}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm
                           text-sm font-medium text-white bg-blue-600 hover:bg-blue-700
                           focus:outline-none focus:ring-2 focus:ring-offset-2
                           focus:ring-blue-500"
              >
                Send Invitation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamMembers;
