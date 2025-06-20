"use client";
import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "react-toastify";

const SignUp: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [passcode, setPasscode] = useState("");
  const [isValid, setIsValid] = useState(false);
  const [message, setMessage] = useState("Verifying your invitation...");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setMessage("⚠️ No invitation token found. Please use the link from your email.");
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch("/api/verify-invite", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to verify invitation.");
        }

        setEmail(data.email);
        setIsValid(true);
        setMessage(""); // Clear verification message

      } catch (error) {
        const e = error as Error;
        setMessage(`❌ Error: ${e.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    verifyToken();
  }, [token]);

  const handleSignUp = async () => {
    if (!isValid) return;

    setMessage("");
    setIsLoading(true);

    if (!name || !passcode) {
      setMessage("⚠️ Full name and password are required.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/register-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, name, password: passcode }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Registration failed.");
      }
      
      toast.success("✅ Signup successful! Please log in.");
      router.push('/');

    } catch (error) {
      const e = error as Error;
      setMessage(`❌ Error: ${e.message}`);
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>{message}</p>
      </div>
    );
  }

  if (!isValid) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-red-100">
        <p className="text-red-700 font-bold">{message}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-blue-600">Complete Your Registration</h1>
        <p className="text-gray-500 text-center mt-2">
          Create a password to finish setting up your account.
        </p>

        <div className="mt-8 space-y-6">
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
                required
              />
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700">Email Address</label>
              <input
                type="email"
                value={email}
                className="w-full px-4 py-2 mt-1 border rounded-md bg-gray-100"
                disabled
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
                required
              />
            </div>
          </div>

          <button
            onClick={handleSignUp}
            disabled={isLoading || !isValid}
            className="w-full py-3 px-4 rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400"
          >
            {isLoading ? "Processing..." : "Complete Registration"}
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