import React, { FC, useState } from 'react';
import { 
  ArrowRight, 
  Wrench, 
  BarChart3, 
  Users, 
  Clock, 
  Shield, 
  Activity,
  Phone,
  Mail,
  MessageSquare,
  FileText,
  ChevronDown,

} from 'lucide-react';

// Define page types
type PageTab = 'home' | 'features' | 'pricing' | 'about' | 'contact';

// Feature interface
interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface LandingPageProps {
    onLogin: () => void;
  }

// Pricing plan interface
interface PricingPlan {
  name: string;
  price: string;
  description: string;
  features: string[];
  popular?: boolean;
}

const LandingPage: FC<LandingPageProps> = ({ onLogin }) => {
    // State for current active tab
  const [activeTab, setActiveTab] = useState<PageTab>('home');
  
  // State for mobile menu
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Features data
  const features: Feature[] = [
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
  const pricingPlans: PricingPlan[] = [
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
  
  // Navigation links component
  const NavLinks: FC<{ mobile?: boolean }> = ({ mobile }) => (
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
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* ...existing code */}
          <div className="flex items-center space-x-2">
            <Wrench className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">AutoDispatch</span>
          </div>

          <NavLinks />
          
          {/* Authentication Buttons - UPDATED to use the onLogin prop */}
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
        </nav>
        
        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200 py-4 px-4 sm:px-6 lg:px-8">
            <NavLinks mobile />
            <div className="mt-6 flex flex-col space-y-3">
              <button className="text-gray-600 hover:text-gray-900 px-3 py-2 border border-gray-300 rounded-lg text-center">
                Log in
              </button>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-center">
                Sign up
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content Based on Active Tab */}
      <main>
        {activeTab === 'home' && (
          <>
            {/* Hero Section */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div>
                  <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight mb-6">
                    Streamline Your Auto Repair Workflow
                  </h1>
                  <p className="text-xl text-gray-600 mb-8">
                    A comprehensive work order management platform designed for modern automotive service centers.
                    Efficiently manage repairs, track progress, and boost productivity.
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center">
                      Get Started <ArrowRight className="ml-2 h-5 w-5" />
                    </button>
                    <button className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors">
                      View Demo
                    </button>
                  </div>
                </div>
                <div className="relative">
                  <img
                    src="/api/placeholder/600/400"
                    alt="Automotive Workshop"
                    className="rounded-lg shadow-2xl w-full h-auto"
                  />
                </div>
              </div>
            </section>

            {/* Features Highlight */}
            <section className="bg-white py-20">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
                  Everything you need to manage your auto repair business
                </h2>
                <p className="text-center text-gray-600 mb-12 max-w-3xl mx-auto">
                  Our platform is designed specifically for automotive repair shops to streamline operations and increase efficiency.
                </p>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {features.map((feature, index) => (
                    <div key={index} className="bg-gray-50 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                      <div className="mb-4">{feature.icon}</div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                      <p className="text-gray-600">{feature.description}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-12 text-center">
                  <button 
                    onClick={() => handleNavigation('features')}
                    className="text-blue-600 font-medium hover:text-blue-800 flex items-center mx-auto"
                  >
                    See all features <ChevronDown className="ml-1 h-5 w-5" />
                  </button>
                </div>
              </div>
            </section>

            {/* Testimonials */}
            <section className="bg-gray-50 py-20">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
                  Trusted by repair shops nationwide
                </h2>
                <div className="grid md:grid-cols-3 gap-8">
                  {[
                    {
                      quote: "AutoDispatch has transformed how we manage our repairs. Our efficiency has increased by 35% since implementation.",
                      author: "John Smith",
                      role: "Owner, Smith's Auto Repair"
                    },
                    {
                      quote: "The technician assignment feature alone has saved us countless hours of management time. Highly recommended.",
                      author: "Sarah Johnson",
                      role: "Service Manager, Johnson Motors"
                    },
                    {
                      quote: "Customer satisfaction is up since we can provide accurate, real-time updates on repair status. Game changer!",
                      author: "Michael Brown",
                      role: "Director, Brown's Auto Group"
                    }
                  ].map((testimonial, index) => (
                    <div key={index} className="bg-white p-6 rounded-lg shadow-sm">
                      <div className="flex items-center text-yellow-400 mb-4">
                        {[...Array(5)].map((_, i) => (
                          <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <p className="text-gray-600 mb-4 italic">&quot;{testimonial.quote}&quot;</p>
                      <div>
                        <p className="font-semibold text-gray-900">{testimonial.author}</p>
                        <p className="text-gray-500 text-sm">{testimonial.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* CTA Section */}
            <section className="bg-blue-600 py-20">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h2 className="text-3xl font-bold text-white mb-6">
                  Ready to transform your auto repair business?
                </h2>
                <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                  Join thousands of auto repair shops that trust our platform for their daily operations.
                </p>
                <button className="bg-white text-blue-600 px-8 py-3 rounded-lg hover:bg-blue-50 transition-colors text-lg font-semibold">
                  Start Free Trial
                </button>
              </div>
            </section>
          </>
        )}

        {activeTab === 'features' && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <h1 className="text-4xl font-bold text-center text-gray-900 mb-6">
              Powerful Features for Auto Repair Management
            </h1>
            <p className="text-xl text-gray-600 mb-12 text-center max-w-3xl mx-auto">
              Explore the complete set of tools designed to optimize every aspect of your auto repair business.
            </p>
            
            {/* Detailed features list */}
            <div className="space-y-20">
              {[
                {
                  title: "Comprehensive Dashboard",
                  description: "Get real-time insights into your repair operation with customizable metrics and reports.",
                  image: "/api/placeholder/600/400",
                  features: [
                    "Real-time overview of all active repair orders",
                    "Technician productivity tracking",
                    "Revenue and performance analytics",
                    "Customizable KPI display"
                  ]
                },
                {
                  title: "Intelligent Work Order System",
                  description: "Create, manage, and track repair orders with precision and efficiency.",
                  image: "/api/placeholder/600/400",
                  features: [
                    "Intuitive repair order creation",
                    "Priority-based queue management",
                    "Automated status updates",
                    "Comprehensive service history tracking",
                    "Parts inventory integration"
                  ]
                },
                {
                  title: "Team Management",
                  description: "Assign tasks, monitor performance, and optimize your technician workflow.",
                  image: "/api/placeholder/600/400",
                  features: [
                    "Smart work assignment based on technician availability and expertise",
                    "Individual performance dashboards",
                    "Capacity planning tools",
                    "Shift and time tracking",
                    "Mobile app for technicians"
                  ]
                }
              ].map((section, index) => (
                <div key={index} className={`grid md:grid-cols-2 gap-12 items-center ${index % 2 === 1 ? 'md:grid-flow-col-dense' : ''}`}>
                  <div className={index % 2 === 1 ? 'md:col-start-2' : ''}>
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">{section.title}</h2>
                    <p className="text-gray-600 mb-6">{section.description}</p>
                    <ul className="space-y-3">
                      {section.features.map((feature, i) => (
                        <li key={i} className="flex items-start">
                          <svg className="h-6 w-6 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className={index % 2 === 1 ? 'md:col-start-1' : ''}>
                    <img
                      src={section.image}
                      alt={section.title}
                      className="rounded-lg shadow-xl w-full h-auto"
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {activeTab === 'pricing' && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <h1 className="text-4xl font-bold text-center text-gray-900 mb-6">
              Simple, Transparent Pricing
            </h1>
            <p className="text-xl text-gray-600 mb-12 text-center max-w-3xl mx-auto">
              Choose the plan that fits your repair shop&apos;s needs. All plans include our core features with no hidden fees.
            </p>
            
            {/* Pricing toggle */}
            <div className="flex justify-center mb-12">
              <div className="bg-gray-100 p-1 rounded-full">
                <button className="bg-blue-600 text-white px-6 py-2 rounded-full">
                  Monthly
                </button>
                <button className="text-gray-700 px-6 py-2">
                  Annual (Save 20%)
                </button>
              </div>
            </div>
            
            {/* Pricing cards */}
            <div className="grid md:grid-cols-3 gap-8">
              {pricingPlans.map((plan, index) => (
                <div 
                  key={index} 
                  className={`bg-white rounded-lg shadow-lg ${plan.popular ? 'border-2 border-blue-600 relative' : ''}`}
                >
                  {plan.popular && (
                    <div className="absolute top-0 inset-x-0 transform -translate-y-1/2">
                      <div className="bg-blue-600 text-white text-sm font-semibold py-1 px-3 rounded-full inline-block">
                        Most Popular
                      </div>
                    </div>
                  )}
                  <div className="p-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                    <p className="text-gray-600 mb-6">{plan.description}</p>
                    <div className="mb-6">
                      <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                      <span className="text-gray-600">/month</span>
                    </div>
                    <ul className="space-y-3 mb-8">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start">
                          <svg className="h-5 w-5 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-gray-600">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <button 
                      className={`w-full py-3 rounded-lg font-medium ${
                        plan.popular 
                          ? 'bg-blue-600 text-white hover:bg-blue-700' 
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      } transition-colors`}
                    >
                      {plan.popular ? 'Start Free Trial' : 'Choose Plan'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            {/* FAQ Section */}
            <div className="mt-20">
              <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
                Frequently Asked Questions
              </h2>
              <div className="grid md:grid-cols-2 gap-8">
                {[
                  {
                    question: "How long is the free trial?",
                    answer: "Our free trial lasts for 14 days. No credit card is required to start your trial, and you'll have full access to all features of your selected plan."
                  },
                  {
                    question: "Can I change plans later?",
                    answer: "Yes, you can upgrade or downgrade your plan at any time. When upgrading, you'll be prorated for the remainder of your billing cycle. When downgrading, changes will take effect at the next billing cycle."
                  },
                  {
                    question: "Is there a setup fee?",
                    answer: "No, there are no setup fees for any of our plans. You only pay the advertised monthly or annual subscription price."
                  },
                  {
                    question: "Do you offer multi-location discounts?",
                    answer: "Yes, for businesses with multiple locations, we offer volume discounts. Please contact our sales team for a custom quote tailored to your specific needs."
                  },
                  {
                    question: "Can I integrate with my existing systems?",
                    answer: "Our Enterprise plan includes API access and custom integrations with popular automotive management software. Our support team can help determine the best integration path for your specific systems."
                  },
                  {
                    question: "How does the billing work?",
                    answer: "We offer both monthly and annual billing options. Annual plans receive a 20% discount compared to monthly billing. All major credit cards are accepted."
                  }
                ].map((faq, index) => (
                  <div key={index} className="border-b border-gray-200 pb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{faq.question}</h3>
                    <p className="text-gray-600">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {activeTab === 'about' && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <h1 className="text-4xl font-bold text-center text-gray-900 mb-6">
              About AutoDispatch
            </h1>
            <p className="text-xl text-gray-600 mb-12 text-center max-w-3xl mx-auto">
              We&apos;re on a mission to revolutionize workflow management for auto repair businesses.
            </p>
            
            {/* Company story */}
            <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
                <p className="text-gray-600 mb-4">
                  Founded in 2017 by a team of automotive industry veterans and software engineers, AutoDispatch was born from a simple observation: auto repair shops were using outdated systems that weren&apos;t designed for their specific needs.
                </p>
                <p className="text-gray-600 mb-4">
                  After spending months speaking with shop owners, service managers, and technicians, we built a solution that addresses the real challenges faced by modern repair businesses.
                </p>
                <p className="text-gray-600">
                  Today, AutoDispatch is trusted by thousands of repair shops across North America, from single-location businesses to multi-site service centers. Our platform processes over 1 million repair orders every month.
                </p>
              </div>
              <div>
                <img
                  src="/api/placeholder/600/400"
                  alt="AutoDispatch Team"
                  className="rounded-lg shadow-xl w-full h-auto"
                />
              </div>
            </div>
            
            {/* Core values */}
            <div className="mb-20">
              <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Our Values</h2>
              <div className="grid md:grid-cols-3 gap-8">
                {[
                  {
                    icon: <Shield className="h-12 w-12 text-blue-600" />,
                    title: "Customer Success",
                    description: "We succeed only when our customers succeed. Every feature we build is designed to solve real problems and deliver measurable value."
                  },
                  {
                    icon: <Activity className="h-12 w-12 text-blue-600" />,
                    title: "Continuous Improvement",
                    description: "We're never satisfied with the status quo. We constantly gather feedback and iterate on our platform to make it better every day."
                  },
                  {
                    icon: <Users className="h-12 w-12 text-blue-600" />,
                    title: "Industry Expertise",
                    description: "Our team combines deep automotive industry knowledge with software expertise to create solutions that truly work for repair businesses."
                  }
                ].map((value, index) => (
                  <div key={index} className="bg-gray-50 p-8 rounded-lg text-center">
                    <div className="flex justify-center mb-4">
                      {value.icon}
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{value.title}</h3>
                    <p className="text-gray-600">{value.description}</p>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Team section */}
            <div>
              <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Our Leadership Team</h2>
              <div className="grid md:grid-cols-4 sm:grid-cols-2 gap-8">
                {[
                  {
                    name: "Alexandra Chen",
                    role: "Chief Executive Officer",
                    image: "/api/placeholder/300/300",
                  },
                  {
                    name: "Marcus Johnson",
                    role: "Chief Technology Officer",
                    image: "/api/placeholder/300/300",
                  },
                  {
                    name: "Sophia Rodriguez",
                    role: "Chief Product Officer",
                    image: "/api/placeholder/300/300",
                  },
                  {
                    name: "David Kim",
                    role: "VP of Customer Success",
                    image: "/api/placeholder/300/300",
                  }
                ].map((person, index) => (
                  <div key={index} className="text-center">
                    <img
                      src={person.image}
                      alt={person.name}
                      className="rounded-full w-40 h-40 object-cover mx-auto mb-4"
                    />
                    <h3 className="text-lg font-semibold text-gray-900">{person.name}</h3>
                    <p className="text-gray-600">{person.role}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {activeTab === 'contact' && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <h1 className="text-4xl font-bold text-center text-gray-900 mb-6">
              Contact Us
            </h1>
            <p className="text-xl text-gray-600 mb-12 text-center max-w-3xl mx-auto">
              Have questions about AutoDispatch? Our team is here to help.
            </p>
            
            <div className="grid md:grid-cols-2 gap-12">
              {/* Contact form */}
              <div className="bg-white p-8 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Send us a message</h2>
                <form className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      placeholder="your@email.com"
                    />
                  </div>
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                      Subject
                    </label>
                    <select
                      id="subject"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select a topic</option>
                      <option value="sales">Sales Inquiry</option>
                      <option value="support">Technical Support</option>
                      <option value="billing">Billing Question</option>
                      <option value="partnership">Partnership Opportunity</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                      Message
                    </label>
                    <textarea
                      id="message"
                      rows={5}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      placeholder="How can we help you?"
                    ></textarea>
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Send Message
                  </button>
                </form>
              </div>
              
              {/* Contact information */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Get in touch</h2>
                <div className="space-y-8">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 bg-blue-100 p-3 rounded-full">
                      <Mail className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">Email Us</h3>
                      <p className="mt-1 text-gray-600">Our friendly team is here to help.</p>
                      <a href="mailto:hello@autodispatch.com" className="mt-2 inline-block text-blue-600 hover:text-blue-800">
                        hello@autodispatch.com
                      </a>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex-shrink-0 bg-blue-100 p-3 rounded-full">
                      <Phone className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">Call Us</h3>
                      <p className="mt-1 text-gray-600">Mon-Fri from 8am to 6pm EST.</p>
                      <a href="tel:+1-555-123-4567" className="mt-2 inline-block text-blue-600 hover:text-blue-800">
                        +1 (555) 123-4567
                      </a>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex-shrink-0 bg-blue-100 p-3 rounded-full">
                      <MessageSquare className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">Live Chat</h3>
                      <p className="mt-1 text-gray-600">Our friendly team is here to help.</p>
                      <button className="mt-2 inline-flex items-center text-blue-600 hover:text-blue-800">
                        Start chat now
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex-shrink-0 bg-blue-100 p-3 rounded-full">
                      <FileText className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">Support Center</h3>
                      <p className="mt-1 text-gray-600">Find answers in our documentation.</p>
                      <button className="mt-2 inline-flex items-center text-blue-600 hover:text-blue-800">
                        Visit Support Center
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Office locations */}
                <div className="mt-12">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Our Offices</h2>
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-medium text-gray-900">San Francisco</h3>
                      <p className="text-gray-600 mt-1">
                        123 Market Street<br />
                        Suite 400<br />
                        San Francisco, CA 94105
                      </p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-medium text-gray-900">Toronto</h3>
                      <p className="text-gray-600 mt-1">
                        456 Queen Street West<br />
                        Suite 200<br />
                        Toronto, ON M5V 2B3
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Enhanced Footer with multiple sections */}
      <footer className="bg-gray-900 text-gray-400 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Main footer content */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div>
              <h3 className="text-white text-lg font-semibold mb-4">Product</h3>
              <ul className="space-y-3">
                {footerLinks.product.map((link, index) => (
                  <li key={index}>
                    <a href="#" className="hover:text-white transition-colors">{link}</a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-white text-lg font-semibold mb-4">Company</h3>
              <ul className="space-y-3">
                {footerLinks.company.map((link, index) => (
                  <li key={index}>
                    <a href="#" className="hover:text-white transition-colors">{link}</a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-white text-lg font-semibold mb-4">Resources</h3>
              <ul className="space-y-3">
                {footerLinks.resources.map((link, index) => (
                  <li key={index}>
                    <a href="#" className="hover:text-white transition-colors">{link}</a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-white text-lg font-semibold mb-4">Legal</h3>
              <ul className="space-y-3">
                {footerLinks.legal.map((link, index) => (
                  <li key={index}>
                    <a href="#" className="hover:text-white transition-colors">{link}</a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          {/* Newsletter */}
          <div className="border-t border-gray-800 pt-8 mb-8">
            <div className="max-w-md mx-auto">
              <h3 className="text-white text-lg font-semibold mb-4 text-center">Subscribe to our newsletter</h3>
              <p className="text-gray-400 mb-4 text-center">Get the latest updates and news delivered to your inbox.</p>
              <form className="flex">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-grow px-4 py-2 bg-gray-800 text-white rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-r-lg hover:bg-blue-700 transition-colors"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>
          
          {/* Social media and copyright */}
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center mb-4 md:mb-0">
              <Wrench className="h-8 w-8 text-white mr-2" />
              <span className="text-xl font-bold text-white">AutoDispatch</span>
            </div>
            <div className="flex items-center space-x-6 mb-4 md:mb-0">
              <a href="#" className="text-gray-400 hover:text-white">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>
            </div>
            <div className="text-sm">
              © {new Date().getFullYear()} AutoDispatch. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;