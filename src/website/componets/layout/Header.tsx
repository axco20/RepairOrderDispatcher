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
}

const Header: FC<HeaderProps> = ({ 
  activeTab, 
  handleNavigation, 
  onLogin, 
  mobileMenuOpen, 
  setMobileMenuOpen 
}) => {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-10">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Wrench className="h-8 w-8 text-blue-600" />
          <span className="text-xl font-bold text-gray-900">AutoSynctify</span>
        </div>

        <NavLinks activeTab={activeTab} handleNavigation={handleNavigation} />
        
        {/* Authentication Buttons */}
        <div className="hidden md:flex items-center space-x-4">
          <button 
            onClick={onLogin}
            className="text-gray-600 hover:text-gray-900 px-3 py-2"
          >
            Log in
          </button>
          <button 
            onClick={onLogin}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Sign up
          </button>
        </div>
        
        {/* Mobile menu button */}
        <button 
          className="md:hidden flex items-center" 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <svg 
            className="h-6 w-6 text-gray-500" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            {mobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </nav>
    </header>
  );
};

export default Header;