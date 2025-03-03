import React, { useState } from 'react';
import { useAuth } from '../../server/AuthContext';
import { supabase } from '../../server/supabaseClient';

const LoginForm: React.FC = () => {
  const { login, signup } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  // ✅ Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const success = await login(email, password);
    if (!success) {
      setError("Invalid email or password");
      return;
    }

    console.log("Login successful. Fetching user role...");

    // ✅ Fetch the user role after login
    const { data: userData, error: fetchError } = await supabase
      .from('users')
      .select('role')
      .eq('email', email)
      .single();

    if (fetchError || !userData?.role) {
      console.error("Error fetching user role:", fetchError?.message);
      setError("Could not retrieve user role.");
      return;
    }

    console.log("Fetched role:", userData.role);

  };

  // ✅ Handle Registration
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const success = await signup(email, password, "New User", "technician"); // Default role: technician
    if (!success) {
      setError("Failed to register. Email might already be in use.");
      return;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-2 text-gray-900">Login or Register</h2>
        <p className="text-gray-500 text-sm mb-6">Enter your email and password below.</p>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <form className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
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
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>

          <div className="flex space-x-2">
            <button
              type="submit"
              onClick={handleLogin}
              className="w-1/2 py-2 px-4 bg-black text-white font-medium rounded-md shadow-sm hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
            >
              Login
            </button>

            <button
              type="submit"
              onClick={handleRegister}
              className="w-1/2 py-2 px-4 bg-gray-600 text-white font-medium rounded-md shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-600"
            >
              Register
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;
