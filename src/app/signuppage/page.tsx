"use client";
import React, { useState, useEffect, Suspense } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useSearchParams } from "next/navigation"; // ✅ Import to read URL params

const SignUp: React.FC = () => {
  const searchParams = useSearchParams(); // ✅ Get URL params

  // ✅ Read values from the URL (if they exist)
  const emailFromUrl = searchParams.get("email") || "";
  const dealershipIdFromUrl = searchParams.get("dealership_id") || null;

  const [name, setName] = useState("");
  const [email, setEmail] = useState(emailFromUrl); // Prefill email if in URL
  const [passcode, setPasscode] = useState("");
  const [dealershipName, setDealershipName] = useState("");
  const [dealershipLocation, setDealershipLocation] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Ensure email field updates when the URL changes
    setEmail(emailFromUrl);
  }, [emailFromUrl]);

  const handleSignUp = async () => {
    setMessage(""); // Clear previous messages
    setIsLoading(true);

    // ✅ Validation
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
      // Step 1: Get the currently signed-in user from the session
      const { data: { user }, error: sessionError } = await supabase.auth.getUser();

      if (sessionError || !user) {
        throw new Error("No authenticated user found. Please use the invite link.");
      }
      
      // Step 2: Update the user's password
      const { error: passwordError } = await supabase.auth.updateUser({ password: passcode });
      
      if (passwordError) {
        throw new Error(`Failed to update password: ${passwordError.message}`);
      }

      // Step 3: Update the user's name in the "users" table
      const { error: userError } = await supabase
        .from("users")
        .update({ name: name })
        .eq("auth_id", user.id);

      if (userError) {
        throw new Error(`Failed to update user record: ${userError.message}`);
      }

      setMessage("✅ Registration successful! You can now log in.");
      setName("");
      setEmail("");
      setPasscode("");
      setDealershipName("");
      setDealershipLocation("");
    } catch (error) {
      setMessage(`❌ Error: ` + error);
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
                disabled={!!emailFromUrl} // Disable if email is from URL
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