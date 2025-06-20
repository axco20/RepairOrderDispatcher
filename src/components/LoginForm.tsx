"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-toastify";

const LoginForm: React.FC = () => {
  const { login, signup, currentUser } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState(""); // For registration
  const [role, setRole] = useState("technician");
  const [isSignup, setIsSignup] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  // 1. After currentUser changes (post-login), redirect based on role
  useEffect(() => {
    if (currentUser) {
      if (currentUser.role === "admin") {
        router.push("/admindashboard");
      } else {
        router.push("/techniciandashboard");
      }
    }
  }, [currentUser, router]);

  // 2. Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (isSignup) {
      // Registration logic
      if (!name.trim()) {
        setError("Name is required");
        return;
      }

      try {
        const success = await signup(email, password, name, role);
        if (success) {
          setMessage("Account created successfully! Please check your email to verify your account.");
          setIsSignup(false); // Switch to login form
        } else {
          setError("Failed to create account. Please try again.");
        }
      } catch (err) {
        setError("An error occurred during registration.");
      }
    } else {
      // Login logic
      try {
        const success = await login(email, password);
        if (success) {
          toast.success("Login successful!");
          // No direct redirect here; the useEffect will handle it
        } else {
          setError("Invalid email or password.");
        }
      } catch (err) {
        setError("An error occurred during login.");
      }
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const success = await signup(email, password, name, "technician");
      if (success) {
        toast.success("Account created successfully! Please check your email to verify your account.");
        setShowLogin(true);
      } else {
        setError("Failed to create account. Please try again.");
      }
    } catch (err) {
      setError("An error occurred during registration.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const success = await login(email, password);
      if (success) {
        toast.success("Login successful!");
        // Redirect will be handled by the auth context
      } else {
        setError("Invalid email or password.");
      }
    } catch (err) {
      setError("An error occurred during login.");
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Render the form
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-2 text-gray-900">
          {isSignup ? "Create Account" : "Login"}
        </h2>
        <p className="text-gray-500 text-sm mb-6">
          {isSignup
            ? "Fill in your details to create a new account."
            : "Enter your email and password below."}
        </p>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        {message && <p className="text-green-500 text-sm mb-4">{message}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignup && (
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@example.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 px-4 bg-black text-white font-medium rounded-md shadow-sm hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
          >
            {isSignup ? "Register" : "Login"}
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setIsSignup(!isSignup);
                setError(null);
                setMessage(null);
              }}
              className="text-indigo-600 text-sm font-medium hover:text-indigo-500"
            >
              {isSignup ? "Already have an account? Login" : "Need an account? Register"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;
