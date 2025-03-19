"use client"; // ✅ Ensure this runs on the client-side
//authcontext.tsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

// Define User type
interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthContextType {
  currentUser: User | null;
  signup: (email: string, password: string, name: string, role: string) => Promise<boolean>;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  signup: async () => false,
  login: async () => false,
  logout: () => {},
  isAdmin: false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // Function to update user's last activity timestamp
  const updateLastActivity = async () => {
    if (currentUser) {
      try {
        const { error } = await supabase
          .from("users")
          .update({ last_activity: new Date().toISOString() })
          .eq("auth_id", currentUser.id);
        
        if (error) {
          console.error("Error updating last activity:", error);
        }
      } catch (err) {
        console.error("Failed to update activity status:", err);
      }
    }
  };

  // Set up tracking for user activity
  useEffect(() => {
    if (currentUser) {
      // Update immediately on login
      updateLastActivity();
      
      // Set interval for regular updates (every 3 minutes)
      const interval = setInterval(updateLastActivity, 3 * 60 * 1000);
      
      // Also update on user interaction
      const handleUserActivity = () => {
        updateLastActivity();
      };
      
      // Add event listeners for user activity
      window.addEventListener("click", handleUserActivity);
      window.addEventListener("keypress", handleUserActivity);
      window.addEventListener("scroll", handleUserActivity);
      
      // Clean up
      return () => {
        clearInterval(interval);
        window.removeEventListener("click", handleUserActivity);
        window.removeEventListener("keypress", handleUserActivity);
        window.removeEventListener("scroll", handleUserActivity);
      };
    }
  }, [currentUser]);

  // ✅ Check for an active session on page load
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user && user.email) {
        // ✅ Fetch user details from "users" table
        const { data: userData, error } = await supabase
          .from("users")
          .select("*")
          .eq("auth_id", user.id)
          .single();

        if (!error && userData) {
          setCurrentUser({
            id: userData.auth_id,
            email: userData.email,
            name: userData.name,
            role: userData.role,
          });
          setIsAdmin(userData.role === "admin");
          
          // Update activity timestamp on login
          updateLastActivity();
        }
      }
    };
    fetchUser();
  }, []);

  // ✅ Signup function
  const signup = async (email: string, password: string, name: string, role: string): Promise<boolean> => {
    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
      console.error("Signup error:", error.message);
      return false;
    }

    if (!data.user?.id) {
      console.error("Error: No user ID returned from Supabase");
      return false;
    }

    // ✅ Insert user details into "users" table
    const { error: insertError } = await supabase
      .from("users")
      .insert([{ auth_id: data.user.id, email, name, role }]);

    if (insertError) {
      console.error("Database insert error:", insertError.message);
      return false;
    }

    return true;
  };

  // ✅ Login function
  const login = async (email: string, password: string): Promise<boolean> => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      console.error("Login error:", error.message);
      return false;
    }

    if (!data.user?.id) {
      console.error("Error: No user ID returned from Supabase");
      return false;
    }

    // ✅ Fetch user details from "users" table
    const { data: userData, error: fetchError } = await supabase
      .from("users")
      .select("*")
      .eq("auth_id", data.user.id)
      .single();

    if (fetchError || !userData) {
      console.error("User fetch error:", fetchError?.message);
      return false;
    }

    console.log("Fetched role:", userData.role);

    setCurrentUser({
      id: userData.auth_id,
      email: userData.email,
      name: userData.name,
      role: userData.role,
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
    <AuthContext.Provider value={{ currentUser, signup, login, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};