import React, { FC, useState } from 'react';
import { BarChart3, Users, Clock, Shield, Activity } from 'lucide-react';

import { PageTab } from './types';
import Header from './componets/layout/Header';
import MobileMenu from './componets/layout/MobileMenu';
import Footer from './componets/layout/Footer';
import Home from './pages/Home';
import Features from './pages/Features';
import Pricing from './pages/Pricing';
import About from './pages/About';
import Contact from './pages/Contact';

// Landing page props
interface LandingPageProps {
  onLogin: () => void;
}

const LandingPage: FC<LandingPageProps> = ({ onLogin }) => {
  // State for current active tab
  const [activeTab, setActiveTab] = useState<PageTab>('home');
  
  // State for mobile menu
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Features data
  const features = [
    {
      icon: <BarChart3 className="h-8 w-8 text-blue-600" />,
      title: "Admin Dashboard",
      description: "Get a comprehensive overview of repair operations, workload distribution, and performance metrics."
    },
    {
      icon: <Clock className="h-8 w-8 text-blue-600" />,
      title: "Work Order Management",
      description: "Create, assign, and track repair orders with our intuitive queue-based system."
    },
    {
      icon: <Users className="h-8 w-8 text-blue-600" />,
      title: "Technician Assignments",
      description: "Efficiently distribute work orders and monitor technician productivity."
    },
    {
      icon: <Activity className="h-8 w-8 text-blue-600" />,
      title: "Performance Analytics",
      description: "Track key metrics and optimize your service center's efficiency."
    },
    {
      icon: <Shield className="h-8 w-8 text-blue-600" />,
      title: "Role-Based Access",
      description: "Secure role management ensures proper access control and data protection."
    },
    {
      icon: <Clock className="h-8 w-8 text-blue-600" />,
      title: "Live Status Updates",
      description: "Real-time tracking of repair jobs for maximum transparency."
    }
  ];
  
  // Pricing plans
  const pricingPlans = [
    {
      name: "Starter",
      price: "$49",
      description: "Perfect for small repair shops just getting started",
      features: [
        "Up to 5 technician accounts",
        "Basic work order management",
        "Customer database",
        "Email notifications",
        "8/5 email support"
      ]
    },
    {
      name: "Professional",
      price: "$99",
      description: "Ideal for growing auto repair businesses",
      features: [
        "Up to 15 technician accounts",
        "Advanced work order management",
        "Customer database with history",
        "Email & SMS notifications",
        "Priority queue management",
        "Basic analytics dashboard",
        "24/7 email & chat support"
      ],
      popular: true
    },
    {
      name: "Enterprise",
      price: "$249",
      description: "For large service centers with multiple locations",
      features: [
        "Unlimited technician accounts",
        "Multi-location management",
        "Complete workflow automation",
        "Advanced analytics & reporting",
        "Customer loyalty system",
        "API access for custom integrations",
        "Dedicated account manager",
        "24/7 priority support"
      ]
    }
  ];
  
  // Footer links
  const footerLinks = {
    product: ["Features", "Integrations", "Pricing", "FAQ", "Updates"],
    company: ["About Us", "Team", "Careers", "Press", "News"],
    resources: ["Blog", "Documentation", "Community", "Contact Sales", "Help Center"],
    legal: ["Privacy Policy", "Terms of Service", "Cookie Policy", "GDPR Compliance", "Security"]
  };
  
  // Handle navigation
  const handleNavigation = (tab: PageTab) => {
    setActiveTab(tab);
    window.scrollTo(0, 0);
    setMobileMenuOpen(false);
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Header */}
      <Header 
        activeTab={activeTab} 
        handleNavigation={handleNavigation}
        onLogin={onLogin}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />
      
      {/* Mobile Menu */}
      <MobileMenu
        activeTab={activeTab}
        handleNavigation={handleNavigation}
        mobileMenuOpen={mobileMenuOpen}
        onLogin={onLogin}
      />

      {/* Main Content Based on Active Tab */}
      <main>
        {activeTab === 'home' && <Home features={features} handleNavigation={handleNavigation} />}
        {activeTab === 'features' && <Features />}
        {activeTab === 'pricing' && <Pricing pricingPlans={pricingPlans} />}
        {activeTab === 'about' && <About />}
        {activeTab === 'contact' && <Contact />}
      </main>

      {/* Footer */}
      <Footer footerLinks={footerLinks} />
    </div>
  );
};

export default LandingPage;