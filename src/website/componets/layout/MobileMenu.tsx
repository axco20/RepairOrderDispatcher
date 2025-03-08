import React, { FC } from 'react';
import NavLinks from '../common/NavLinks';
import { PageTab } from '../../types';

interface MobileMenuProps {
  activeTab: PageTab;
  handleNavigation: (tab: PageTab) => void;
  mobileMenuOpen: boolean;
  onLogin: () => void;
}

const MobileMenu: FC<MobileMenuProps> = ({ 
  activeTab, 
  handleNavigation, 
  mobileMenuOpen,
  onLogin
}) => {
  if (!mobileMenuOpen) return null;
  
  return (
    <div className="md:hidden bg-white border-t border-gray-200 py-4 px-4 sm:px-6 lg:px-8">
      <NavLinks activeTab={activeTab} handleNavigation={handleNavigation} mobile />
      <div className="mt-6 flex flex-col space-y-3">
        <button 
          onClick={onLogin}
          className="text-gray-600 hover:text-gray-900 px-3 py-2 border border-gray-300 rounded-lg text-center"
        >
          Log in
        </button>
        <button 
          onClick={onLogin}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-center"
        >
          Sign up
        </button>
      </div>
    </div>
  );
};

export default MobileMenu;