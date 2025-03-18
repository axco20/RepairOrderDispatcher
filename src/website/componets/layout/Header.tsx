import React, { FC } from 'react';
import { Wrench } from 'lucide-react';
import NavLinks from '../common/NavLinks';
import { PageTab } from '../../types';

interface HeaderProps {
  activeTab: PageTab;
  handleNavigation: (tab: PageTab) => void;
  onLogin: () => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (isOpen: boolean) => void;
  onSignup?: () => void; // Add this new prop
}

const Header: FC<HeaderProps> = ({
  activeTab,
  handleNavigation,
  onLogin,
  mobileMenuOpen,
  setMobileMenuOpen,
  onSignup // Destructure the new prop
}) => {
  
  // Function to handle signup and redirect
  const handleSignup = () => {
    // You can redirect to your signup page
    window.location.href = "http://192.168.137.1:3000/signuppage";
    
    // Or if you're using React Router:
    // history.push("/signup");
    
    // Or call the provided onSignup function if it exists
    if (onSignup) {
      onSignup();
    }
  };
  
  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-2 flex justify-between items-center">
        <div className="flex items-center">
          <Wrench className="h-6 w-6 mr-2" />
          <span className="text-xl font-bold">AutoSynctify</span>
        </div>
        
        <NavLinks activeTab={activeTab} handleNavigation={handleNavigation} />
        
        {/* Authentication Buttons */}
        <div className="hidden md:flex space-x-4">
          <button 
            className="px-4 py-2 text-gray-700 hover:text-gray-900"
            onClick={onLogin}
          >
            Log in
          </button>
          
          <button 
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            onClick={handleSignup} // Use the new handler here
          >
            Sign up
          </button>
        </div>
        
        {/* Mobile menu button */}
        <button 
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <span>✕</span> // Close icon
          ) : (
            <span>☰</span> // Menu icon
          )}
        </button>
      </div>
    </header>
  );
};

export default Header;