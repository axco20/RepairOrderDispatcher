import React from 'react';
import { Wrench, ArrowRight } from 'lucide-react';

const LandingPage = () => {
  const handleLogin = () => {
    window.location.href = "http://localhost:3000/loginpage";
  };

  const handleSignup = () => {
    window.location.href = "http://localhost:3000/signuppage";
  };

  const handleContact = () => {
    // Smooth scroll to contact section
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Header */}
      <header className="fixed w-full bg-white/80 backdrop-blur-md shadow-sm z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <Wrench className="h-6 w-6 mr-2 text-blue-600" />
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              AutoSynctify
            </span>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={handleContact}
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Contact
            </button>
            <button
              onClick={handleLogin}
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Login
            </button>
            <button
              onClick={handleSignup}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
            >
              Sign up
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <h1 className="text-5xl font-bold leading-tight">
                Streamline Your
                <span className="block text-blue-600">Repair Operations</span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                Efficiently manage repair orders, track technician workload, and boost productivity with our modern dispatch system.
              </p>
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleSignup}
                  className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl flex items-center group"
                >
                  Get Started
                  <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={handleContact}
                  className="px-8 py-4 text-gray-700 hover:text-gray-900 transition-colors"
                >
                  Learn More
                </button>
              </div>
            </div>
            <div className="hidden lg:block">
              <img
                src="/images/screenshotofdash.png"
                alt="Dashboard Preview"
                className="rounded-lg shadow-2xl transform hover:scale-105 transition-transform duration-300"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-white">
        <div className="container mx-auto max-w-3xl px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Get in Touch</h2>
          <form className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                  placeholder="your@email.com"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message
              </label>
              <textarea
                rows={4}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                placeholder="How can we help you?"
              />
            </div>
            <button
              type="submit"
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
            >
              Send Message
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 py-8">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <div className="flex items-center justify-center mb-4">
            <Wrench className="h-5 w-5 mr-2 text-blue-600" />
            <span className="font-semibold">AutoSynctify</span>
          </div>
          <p className="text-sm">
            © {new Date().getFullYear()} AutoSynctify. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
