"use client";

import React, { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

const AddAdmin: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [passcode, setPasscode] = useState("");
  const [message, setMessage] = useState("");

  const handleAddAdmin = async () => {
    setMessage(""); // Clear previous messages

    if (!name || !email || !passcode) {
      setMessage("⚠️ All fields are required.");
      return;
    }

    try {
      // ✅ Step 1: Sign up user in Supabase authentication
      const { data, error } = await supabase.auth.signUp({
        email,
        password: passcode, // ⚠️ Use a secure password system later
      });

      if (error || !data.user) {
        throw new Error(error?.message || "Failed to create user.");
      }

      const userId = data.user.id;

      // ✅ Step 2: Add user to the "users" table in Supabase DB
      const { error: dbError } = await supabase
        .from("users")
        .insert([{ auth_id: userId, email, name, role: "admin" }]);

      if (dbError) {
        throw new Error(dbError.message);
      }

      setMessage("✅ Admin added successfully!");
      setName("");
      setEmail("");
      setPasscode("");
    } catch (err) {
      setMessage(`❌ Error:`);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-indigo-600">Welcome!</h1>
        <p className="text-gray-500 text-center mt-2">
          Enter your details below to register as an admin.
        </p>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700">Full Name</label>
          <input
            type="text"
            placeholder="John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700">Email Address</label>
          <input
            type="email"
            placeholder="admin@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700">Passcode</label>
          <input
            type="password"
            placeholder="Enter a secure passcode"
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            className="w-full px-4 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <button
          onClick={handleAddAdmin}
          className="mt-6 w-full py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 transition duration-200"
        >
          Register as Admin
        </button>

        {message && <p className="mt-4 text-center text-red-500">{message}</p>}
      </div>
    </div>
  );
};

export default AddAdmin;
