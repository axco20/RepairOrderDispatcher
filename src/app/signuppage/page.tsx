"use client";
import React, { useState, useEffect, Suspense } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useSearchParams } from "next/navigation";
import { toast } from "react-toastify";

const SignUp: React.FC = () => {
  const searchParams = useSearchParams();

  const emailFromUrl = searchParams.get("email") || "";
  const dealershipIdFromUrl = searchParams.get("dealership_id") || "";
  const inviteRole = searchParams.get("role");

  const [name, setName] = useState("");
  const [email, setEmail] = useState(emailFromUrl);
  const [passcode, setPasscode] = useState("");
  const [dealershipName, setDealershipName] = useState("");
  const [dealershipLocation, setDealershipLocation] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setEmail(emailFromUrl);
  }, [emailFromUrl]);

  const handleSignUp = async () => {
    setMessage("");
    setIsLoading(true);

    if (!name || !email || !passcode) {
      setMessage("⚠️ Name, email, and password are required.");
      setIsLoading(false);
      return;
    }

    if (!dealershipIdFromUrl && (!dealershipName || !dealershipLocation)) {
      setMessage("⚠️ Dealership details are required for new registrations.");
      setIsLoading(false);
      return;
    }

    try {
      let finalDealershipId = dealershipIdFromUrl;

      // If a user is NOT invited (no dealershipId in URL), they are a new admin creating a dealership.
      if (!dealershipIdFromUrl) {
        const { data: dealershipData, error: dealershipError } = await supabase
          .from("dealerships")
          .insert([{ name: dealershipName, location: dealershipLocation }])
          .select()
          .single();

        if (dealershipError) throw dealershipError;
        if (!dealershipData) throw new Error("Could not create dealership.");
        
        finalDealershipId = dealershipData.id;
      }

      // Create the user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password: passcode,
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("Sign up failed, please try again.");
      
      const userId = authData.user.id;

      // Add the user to the public "users" table
      const { error: userError } = await supabase.from("users").insert([
        {
          auth_id: userId,
          email,
          name,
          role: inviteRole || 'admin', // default to admin if not invited
          dealership_id: finalDealershipId,
        },
      ]);

      if (userError) throw userError;

      toast.success("✅ Registration successful! You can now log in.");

      setName("");
      setEmail("");
      setPasscode("");
      setDealershipName("");
      setDealershipLocation("");

    } catch (error) {
      const e = error as Error;
      console.error("Sign up error:", e);
      setMessage(`❌ Error: ${e.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-blue-600">Get Started</h1>
        <p className="text-gray-500 text-center mt-2">
          {dealershipIdFromUrl
            ? "Complete your registration to join this dealership."
            : "Register your dealership and create your admin account."}
        </p>

        <div className="mt-8 space-y-6">
          {!dealershipIdFromUrl && (
            <div className="border-b pb-4">
              <h2 className="text-lg font-medium text-gray-800">Dealership Information</h2>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700">Dealership Name</label>
                <input
                  type="text"
                  placeholder="ABC Motors"
                  value={dealershipName}
                  onChange={(e) => setDealershipName(e.target.value)}
                  className="w-full px-4 py-2 mt-1 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700">Location</label>
                <input
                  type="text"
                  placeholder="City, State"
                  value={dealershipLocation}
                  onChange={(e) => setDealershipLocation(e.target.value)}
                  className="w-full px-4 py-2 mt-1 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          )}

          <div>
            <h2 className="text-lg font-medium text-gray-800">User Information</h2>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <input
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 mt-1 border rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700">Email Address</label>
              <input
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 mt-1 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                disabled={!!emailFromUrl}
              />
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                placeholder="Create a secure password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                className="w-full px-4 py-2 mt-1 border rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <button
            onClick={handleSignUp}
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            {isLoading ? "Processing..." : "Register"}
          </button>

          {message && <div className="text-center mt-4 text-red-500">{message}</div>}
        </div>
      </div>
    </div>
  );
};

const SignUpPage = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <SignUp />
  </Suspense>
);

export default SignUpPage;