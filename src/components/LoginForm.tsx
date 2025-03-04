import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

const LoginForm: React.FC = () => {
  const { login, signup } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState(''); // Add name field
  const [isRegistering, setIsRegistering] = useState(false); // Toggle between login/register
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (isRegistering) {
      // Handle registration
      if (!name.trim()) {
        setError("Please enter your name");
        return;
      }

      try {
        const success = await signup(email, password, name, "technician");
        if (success) {
          setMessage("Registration successful! Please check your email for confirmation.");
          // Optionally auto-login if no email confirmation is required
          // await login(email, password);
        } else {
          setError("Registration failed. Please try again.");
        }
      } catch (err) {
        console.error("Registration error:", err);
        setError("An unexpected error occurred during registration.");
      }
    } else {
      // Handle login
      try {
        const success = await login(email, password);
        if (!success) {
          setError("Invalid email or password");
        }
      } catch (err) {
        console.error("Login error:", err);
        setError("An unexpected error occurred during login.");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-2 text-gray-900">
          {isRegistering ? 'Create Account' : 'Login'}
        </h2>
        <p className="text-gray-500 text-sm mb-6">
          {isRegistering 
            ? 'Fill in your details to create a new account.' 
            : 'Enter your email and password below.'}
        </p>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        {message && <p className="text-green-500 text-sm mb-4">{message}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegistering && (
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
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

          <button
            type="submit"
            className="w-full py-2 px-4 bg-black text-white font-medium rounded-md shadow-sm hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
          >
            {isRegistering ? 'Register' : 'Login'}
          </button>
          
          <div className="text-center">
            <button 
              type="button" 
              onClick={() => {
                setIsRegistering(!isRegistering);
                setError(null);
                setMessage(null);
              }}
              className="text-indigo-600 text-sm font-medium hover:text-indigo-500"
            >
              {isRegistering ? 'Already have an account? Login' : 'Need an account? Register'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;