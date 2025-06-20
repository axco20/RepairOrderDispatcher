"use client"; // ✅ Ensure this runs on the client-side
//authcontext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "../lib/supabaseClient";
import { User as SupabaseUser } from '@supabase/supabase-js';
import { toast } from 'react-toastify';
import ProfileSetupModal from '@/components/ProfileSetupModal';

// Define a more detailed User type for your app
interface AppUser {
  id: string; // from the users table
  auth_id: string;
  email: string;
  name: string;
  role: 'admin' | 'technician';
  dealership_id: string;
  // add other fields from your users table here
}

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  updateName: (newName: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isProfileModalOpen, setProfileModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async (supabaseUser: SupabaseUser) => {
      const { data: userProfile, error } = await supabase
        .from('users')
        .select('*')
        .eq('auth_id', supabaseUser.id)
        .single();

      if (error) {
        console.error("Error fetching user profile:", error);
        setUser(null);
      } else if (userProfile) {
        setUser(userProfile);
        // If the user's name is just their email, they need to set it up.
        if (userProfile.name === userProfile.email) {
          setProfileModalOpen(true);
        }
      }
    };

    // Check for user on initial load
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await fetchUserProfile(session.user);
      }
      setLoading(false);
    };

    checkUser();

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        await fetchUserProfile(session.user);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const updateName = async (newName: string) => {
    if (!user || !newName.trim()) {
      toast.error('Name cannot be empty.');
      return;
    }
    setIsUpdating(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .update({ name: newName.trim() })
        .eq('auth_id', user.auth_id)
        .select()
        .single();

      if (error) throw error;

      setUser(data); // Update user in context with new details
      setProfileModalOpen(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error("Error updating name:", error);
      toast.error('Failed to update your name. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, updateName }}>
      {children}
      <ProfileSetupModal
        isOpen={isProfileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        onUpdate={updateName}
        isLoading={isUpdating}
      />
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};