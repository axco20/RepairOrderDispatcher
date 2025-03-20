import React, { useState, useEffect } from "react";
import { Search, Edit, BarChart2, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "react-toastify";

interface TeamMember {
  id: string;
  auth_id: string;
  email: string;
  name: string;
  role: "admin" | "technician";
  created_at?: string;
  skill_level?: number;
}

const TeamMembers: React.FC = () => {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModal2Open, setIsModal2Open] = useState(false);
  const [isSkillModalOpen, setIsSkillModalOpen] = useState(false);
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [selectedTechnician, setSelectedTechnician] = useState<TeamMember | null>(null);
  const [memberToRemove, setMemberToRemove] = useState<TeamMember | null>(null);
  const [skillLevel, setSkillLevel] = useState<number>(1);
  const [isRemoving, setIsRemoving] = useState(false);

  useEffect(() => {
    fetchMembers();
  }, []);

  // Modify the fetchMembers function
const fetchMembers = async () => {
  try {
    // 1. Get the current user
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user?.id) {
      console.error("Error fetching current user:", userError);
      return;
    }

    // 2. Get the current user's dealership_id
    const { data: currentUserData, error: currentUserError } = await supabase
      .from("users")
      .select("dealership_id")
      .eq("auth_id", userData.user.id)
      .single();

    if (currentUserError || !currentUserData?.dealership_id) {
      console.error("Error fetching user dealership ID:", currentUserError);
      return;
    }

    const dealershipId = currentUserData.dealership_id;
    console.log("Current user's dealership ID:", dealershipId);

    // 3. Get all users with the same dealership_id
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("dealership_id", dealershipId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching team members:", error);
      return;
    }

    if (data) {
      console.log("Fetched members:", data);
      setMembers(data);
    }
  } catch (err) {
    console.error("Error in fetchMembers:", err);
  }
};

  const filteredMembers = members.filter(
    (m) =>
      m.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const admins = filteredMembers.filter((m) => m.role === "admin");
  const technicians = filteredMembers.filter((m) => m.role === "technician");

  // Open modal
  const handleAddAdmin = () => {
    setIsModalOpen(true);
  };
  const handleAddTechnician = () => {
    setIsModal2Open(true);
  };

  const handleSendEmail = async (role: "admin" | "technician") => {
    console.log("Starting invite process with role:", role, "and email:", email);
    
    if (!email) {
      toast.error("❌ Please enter an email address.");
      console.log("Error: Email is empty");
      return;
    }
    
    try {
      // ✅ Fetch the current user's dealership ID
      const { data: userData, error: userError } = await supabase.auth.getUser();
      console.log("User data from auth:", userData);
      console.log("User error:", userError);
      
      if (userError || !userData?.user?.id) {
        console.log("Failed authentication check, user ID:", userData?.user?.id);
        throw new Error("❌ Failed to retrieve authenticated user.");
      }
      
      // ✅ Use the correct user ID for lookup
      console.log("Looking up user with auth_id:", userData.user.id);
      const { data: adminData, error: adminError } = await supabase
        .from("users")
        .select("dealership_id")
        .eq("auth_id", userData.user.id)
        .single();
      
      console.log("Admin data:", adminData);
      console.log("Admin error:", adminError);
      console.log("Dealership ID:", adminData?.dealership_id);
      
      if (adminError || !adminData?.dealership_id) {
        console.log("Failed admin lookup check, dealership ID:", adminData?.dealership_id);
        throw new Error("❌ Failed to retrieve dealership ID.");
      }
      
      // ✅ Generate invite link with dealership ID and role
      const inviteUrl = `${window.location.origin}/signuppage?email=${encodeURIComponent(email)}&dealership_id=${adminData.dealership_id}&role=${role}`;
      console.log("Generated invite URL:", inviteUrl);
      
      // ✅ Send email with the invite link
      console.log("Sending email with payload:", { email, inviteUrl });
      await fetch("/api/send-invite-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, inviteUrl }),
      });
      
      toast.success("✅ Invitation sent successfully!");
      setIsModalOpen(false);
      setIsModal2Open(false);
      setEmail("");
    } catch (error) {
      console.error("Error sending invitation:", error);
      toast.error("❌ Error sending invitation.");
    }
  };

  // Function to open skill level modal
  const handleEditSkillLevel = (technician: TeamMember) => {
    setSelectedTechnician(technician);
    setSkillLevel(technician.skill_level || 1);
    setIsSkillModalOpen(true);
  };

  // Function to update skill level
  const handleUpdateSkillLevel = async () => {
    if (!selectedTechnician) return;

    try {
      const { error } = await supabase
        .from("users")
        .update({ skill_level: skillLevel })
        .eq("id", selectedTechnician.id);

      if (error) {
        console.error("Error updating skill level:", error);
        toast.error("❌ Failed to update skill level");
        return;
      }

      // Update local state
      setMembers(
        members.map((member) =>
          member.id === selectedTechnician.id
            ? { ...member, skill_level: skillLevel }
            : member
        )
      );

      toast.success("✅ Technician skill level updated!");
      setIsSkillModalOpen(false);
    } catch (error) {
      console.error("Error updating skill level:", error);
      toast.error("❌ An error occurred while updating skill level");
    }
  };

  // Function to open remove member confirmation modal
  const handleRemoveMember = (member: TeamMember) => {
    setMemberToRemove(member);
    setIsRemoveModalOpen(true);
  };

  // Function to execute the removal of a team member
  const confirmRemoveMember = async () => {
    if (!memberToRemove) return;
    
    setIsRemoving(true);
    
    try {
      // 1. Remove the user from the database
      const { error } = await supabase
        .from("users")
        .delete()
        .eq("id", memberToRemove.id);

      if (error) {
        console.error("Error removing team member:", error);
        toast.error("❌ Failed to remove team member");
        return;
      }

      // 2. Update local state by filtering out the removed member
      setMembers(members.filter(member => member.id !== memberToRemove.id));
      
      toast.success(`✅ ${memberToRemove.name || memberToRemove.email} has been removed from your team`);
      setIsRemoveModalOpen(false);
      setMemberToRemove(null);
    } catch (error) {
      console.error("Error removing team member:", error);
      toast.error("❌ An error occurred while removing the team member");
    } finally {
      setIsRemoving(false);
    }
  };

  // Helper function to get skill level badge color
  const getSkillLevelColor = (level?: number) => {
    switch (level) {
      case 1:
        return "bg-green-100 text-green-800";
      case 2:
        return "bg-yellow-100 text-yellow-800";
      case 3:
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Helper function to get skill level label
  const getSkillLevelLabel = (level?: number) => {
    switch (level) {
      case 1:
        return "Basic";
      case 2:
        return "Intermediate";
      case 3:
        return "Advanced";
      default:
        return "Basic";
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
                    {admin.name ? admin.name.charAt(0).toUpperCase() : "A"}
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">
                      {admin.name || "(No Name)"}
                    </p>
                    <p className="text-sm text-gray-500">{admin.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  {/* Remove Button */}
                  <button
                    onClick={() => handleRemoveMember(admin)}
                    className="p-1 text-gray-500 hover:text-red-600 rounded-full hover:bg-gray-100"
                    aria-label="Remove admin"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  
                  {/* Role Badge */}
                  <span
                    className="px-2 py-1 text-xs font-semibold text-orange-800 
                              bg-orange-100 rounded-full"
                  >
                    Admin
                  </span>
                </div>
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
            onClick={handleAddTechnician}
            className="px-3 py-1 bg-indigo-600 text-white text-sm font-medium 
                       rounded-md hover:bg-indigo-700 focus:outline-none 
                       focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Add Technician
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
                    {tech.name ? tech.name.charAt(0).toUpperCase() : "T"}
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">
                      {tech.name || "(No Name)"}
                    </p>
                    <p className="text-sm text-gray-500">{tech.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  {/* Skill Level Badge */}
                  <div className={`flex items-center px-2 py-1 text-xs font-medium rounded-full ${getSkillLevelColor(tech.skill_level)}`}>
                    <BarChart2 className="w-3 h-3 mr-1" />
                    Level {tech.skill_level || 1} ({getSkillLevelLabel(tech.skill_level)})
                  </div>
                  
                  {/* Edit Button */}
                  <button
                    onClick={() => handleEditSkillLevel(tech)}
                    className="p-1 text-gray-500 hover:text-indigo-600 rounded-full hover:bg-gray-100"
                    aria-label="Edit skill level"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  
                  {/* Remove Button */}
                  <button
                    onClick={() => handleRemoveMember(tech)}
                    className="p-1 text-gray-500 hover:text-red-600 rounded-full hover:bg-gray-100"
                    aria-label="Remove technician"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  
                  {/* Role Badge */}
                  <span className="px-2 py-1 text-xs font-semibold text-blue-800 bg-blue-100 rounded-full">
                    Technician
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 italic">No technicians found</p>
        )}
      </div>

      {/* Skill Level Information */}
      <div className="mt-8 p-4 bg-blue-50 border-l-4 border-blue-400 rounded-md">
        <h3 className="text-md font-semibold text-blue-900 flex items-center">
          <BarChart2 className="w-5 h-5 mr-2" />
          Technician Skill Levels
        </h3>
        <p className="mt-1 text-sm text-blue-800">
          Technicians can only work on repair orders that match or are below their skill level:
        </p>
        <ul className="mt-2 ml-6 list-disc text-sm text-blue-800">
          <li>Level 1 (Basic): Can only work on Level 1 repair orders</li>
          <li>Level 2 (Intermediate): Can work on Level 1 and 2 repair orders</li>
          <li>Level 3 (Advanced): Can work on all repair orders (Levels 1, 2, and 3)</li>
        </ul>
      </div>

      {/* Modal for Adding Admin */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur bg-opacity-50 z-50">
          <div className="bg-[#1F2937] p-6 rounded-lg shadow-lg border border-gray-700 max-w-sm w-full">
            <h2 className="text-lg font-bold text-white mb-4 text-center">
              Enter Admin Email
            </h2>
            <input
              type="email"
              placeholder="example@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border border-gray-600 bg-[#374151] text-white rounded-md mb-4 
        focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            {/* Centered Buttons with Even Spacing */}
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 w-28 rounded-md text-gray-300 bg-gray-700 hover:bg-gray-600 
          focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSendEmail("admin")}
                className="px-4 py-2 w-28 rounded-md text-white bg-indigo-600 hover:bg-indigo-700 
          focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                Send Email
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for Adding Technician */}
      {isModal2Open && (
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur bg-opacity-50 z-50">
          <div className="bg-[#1F2937] p-6 rounded-lg shadow-lg border border-gray-700 max-w-sm w-full">
            <h2 className="text-lg font-bold text-white mb-4 text-center">
              Enter Technician Email
            </h2>
            <input
              type="email"
              placeholder="example@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border border-gray-600 bg-[#374151] text-white rounded-md mb-4 
        focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            {/* Centered Buttons with Even Spacing */}
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => setIsModal2Open(false)}
                className="px-4 py-2 w-28 rounded-md text-gray-300 bg-gray-700 hover:bg-gray-600 
          focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSendEmail("technician")}
                className="px-4 py-2 w-28 rounded-md text-white bg-indigo-600 hover:bg-indigo-700 
          focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                Send Email
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for Editing Skill Level */}
      {isSkillModalOpen && selectedTechnician && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-[#1F2937] p-6 rounded-lg shadow-lg border border-gray-700 max-w-sm w-full">
            <h2 className="text-lg font-bold text-white mb-4 text-center">
              Edit Technician Skill Level
            </h2>
            <div className="mb-4">
              <p className="text-white text-sm mb-2">
                Technician: <span className="font-medium">{selectedTechnician.name}</span>
              </p>
              <label className="block text-white text-sm mb-2">
                Skill Level:
              </label>
              <select
                value={skillLevel}
                onChange={(e) => setSkillLevel(parseInt(e.target.value))}
                className="w-full p-2 border border-gray-600 bg-[#374151] text-white rounded-md
                focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value={1}>Level 1 - Basic</option>
                <option value={2}>Level 2 - Intermediate</option>
                <option value={3}>Level 3 - Advanced</option>
              </select>
            </div>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => setIsSkillModalOpen(false)}
                className="px-4 py-2 w-28 rounded-md text-gray-300 bg-gray-700 hover:bg-gray-600 
                focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateSkillLevel}
                className="px-4 py-2 w-28 rounded-md text-white bg-indigo-600 hover:bg-indigo-700 
                focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for Remove Member Confirmation */}
      {isRemoveModalOpen && memberToRemove && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-[#1F2937] p-6 rounded-lg shadow-lg border border-gray-700 max-w-sm w-full">
            <h2 className="text-lg font-bold text-white mb-4 text-center">
              Remove Team Member
            </h2>
            <div className="mb-6">
              <div className="bg-red-900 bg-opacity-20 p-4 rounded-md border border-red-800 mb-4">
                <p className="text-white text-sm mb-1">
                  Are you sure you want to remove:
                </p>
                <p className="text-white font-medium mb-0">
                  {memberToRemove.name || memberToRemove.email} <span className="text-sm font-normal">({memberToRemove.role})</span>
                </p>
              </div>
              <p className="text-gray-300 text-sm">
                This action cannot be undone. The user will lose all access to your team&apos;s system.
              </p>
            </div>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => setIsRemoveModalOpen(false)}
                className="px-4 py-2 w-28 rounded-md text-gray-300 bg-gray-700 hover:bg-gray-600 
                focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={confirmRemoveMember}
                disabled={isRemoving}
                className="px-4 py-2 w-28 rounded-md text-white bg-red-600 hover:bg-red-700 
                focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isRemoving ? "Removing..." : "Remove"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamMembers;