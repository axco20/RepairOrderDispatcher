import React, { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "react-toastify";

interface TeamMember {
  id: string;
  auth_id: string;
  email: string;
  name: string;
  role: "admin" | "technician";
  created_at?: string;
}

const TeamMembers: React.FC = () => {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModal2Open, setIsModal2Open] = useState(false);
  const [email, setEmail] = useState("");

  useEffect(() => {
    const fetchMembers = async () => {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching team members:", error);
        return;
      }

      if (data) {
        setMembers(data);
      }
    };

    fetchMembers();
  }, []);

  const filteredMembers = members.filter(
    (m) =>
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
      const inviteUrl = `${window.location.origin}/signuppage?email=${encodeURIComponent(email)}&dealership_id=${adminData.dealership_id}&role=${role}`;      console.log("Generated invite URL:", inviteUrl);
      
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

  const handleSendEmail2 = async () => {
    if (!email) {
      toast.error("❌ Please enter an email address.");
      return;
    }

    try {
      const response = await fetch("/api/send-email2", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();
      if (response.ok) {
        toast.success("✅ Email sent successfully!");
      } else {
        toast.error("❌ Error sending email: " + result.error);
      }
    } catch (error) {
      toast.error("❌ Network error: " + error);
    }

    setIsModalOpen(false);
    setIsModal2Open(false);
    setEmail("");
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

      {/* Modal for Adding Admin */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center ">
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
        <div className="fixed inset-0 flex items-center justify-center ">
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
    </div>
  );
};

export default TeamMembers;
