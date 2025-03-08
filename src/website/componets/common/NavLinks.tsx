import React, { FC } from 'react';
import { PageTab } from '../../types';

interface NavLinksProps {
  activeTab: PageTab;
  handleNavigation: (tab: PageTab) => void;
  mobile?: boolean;
}

const NavLinks: FC<NavLinksProps> = ({ activeTab, handleNavigation, mobile }) => (
  <div className={mobile ? "flex flex-col space-y-4" : "hidden md:flex space-x-8"}>
    <button 
      onClick={() => handleNavigation('home')}
      className={`px-3 py-2 ${activeTab === 'home' ? 'text-blue-600 font-medium' : 'text-gray-600 hover:text-gray-900'}`}
    >
      Home
    </button>
    <button 
      onClick={() => handleNavigation('features')}
      className={`px-3 py-2 ${activeTab === 'features' ? 'text-blue-600 font-medium' : 'text-gray-600 hover:text-gray-900'}`}
    >
      Features
    </button>
    <button 
      onClick={() => handleNavigation('pricing')}
      className={`px-3 py-2 ${activeTab === 'pricing' ? 'text-blue-600 font-medium' : 'text-gray-600 hover:text-gray-900'}`}
    >
      Pricing
    </button>
    <button 
      onClick={() => handleNavigation('about')}
      className={`px-3 py-2 ${activeTab === 'about' ? 'text-blue-600 font-medium' : 'text-gray-600 hover:text-gray-900'}`}
    >
      About
    </button>
    <button 
      onClick={() => handleNavigation('contact')}
      className={`px-3 py-2 ${activeTab === 'contact' ? 'text-blue-600 font-medium' : 'text-gray-600 hover:text-gray-900'}`}
    >
      Contact
    </button>
  </div>
);

export default NavLinks;