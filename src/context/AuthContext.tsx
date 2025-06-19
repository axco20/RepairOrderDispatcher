"use client"; // ✅ Ensure this runs on the client-side
//authcontext.tsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

// Updated User type to include dealership_id
interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  dealership_id?: string;  // Added dealership_id
}

interface AuthContextType {
  currentUser: User | null;
  signup: (email: string, password: string, name: string, role: string) => Promise<boolean>;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAdmin: boolean;
  isLoading: boolean; // Add loading state
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  signup: async () => false,
  login: async () => false,
  logout: () => {},
  isAdmin: false,
  isLoading: true,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Function to update user's last activity timestamp
  const updateLastActivity = async () => {
    if (currentUser) {
      try {
        const { error } = await supabase
          .from("users")
          .update({ last_activity: new Date().toISOString() })
          .eq("auth_id", currentUser.id);
        
        if (error) {
          // Error updating last activity
        }
      } catch (err) {
        // Failed to update activity status
      }
    }
  };

  // Set up tracking for user activity - REDUCED FREQUENCY FOR PERFORMANCE
  useEffect(() => {
    if (currentUser) {
      // Update immediately on login
      updateLastActivity();
      
      // Set interval for regular updates (every 5 minutes instead of 3)
      const interval = setInterval(updateLastActivity, 5 * 60 * 1000);
      
      // Clean up interval on unmount
      return () => {
        clearInterval(interval);
      };
    }
  }, [currentUser]);

  // ✅ Check for an active session on page load - DISABLED FOR SECURITY
  useEffect(() => {
    // Always start with no user logged in for security
    setCurrentUser(null);
    setIsAdmin(false);
    setIsLoading(false);
    
    // Clear any existing session
    supabase.auth.signOut();
  }, []);

  // ✅ Signup function
  const signup = async (email: string, password: string, name: string, role: string): Promise<boolean> => {
    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
      return false;
    }

    if (!data.user?.id) {
      return false;
    }

    // ✅ Insert user details into "users" table
    const { error: insertError } = await supabase
      .from("users")
      .insert([{ auth_id: data.user.id, email, name, role }]);

    if (insertError) {
      return false;
    }

    return true;
  };

  // ✅ Login function
  const login = async (email: string, password: string): Promise<boolean> => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      return false;
    }

    if (!data.user?.id) {
      return false;
    }

    // ✅ Fetch user details from "users" table
    const { data: userData, error: fetchError } = await supabase
      .from("users")
      .select("*")
      .eq("auth_id", data.user.id)
      .single();

    if (fetchError || !userData) {
      return false;
    }

    setCurrentUser({
      id: userData.auth_id,
      email: userData.email,
      name: userData.name,
      role: userData.role,
      dealership_id: userData.dealership_id, // Make sure to include dealership_id
    });
    
    setIsAdmin(userData.role === "admin");

    // Update activity timestamp on login
    await updateLastActivity();

    return true; // ✅ Return true on success
  };

  // ✅ Logout function
  const logout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ currentUser, signup, login, logout, isAdmin, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};