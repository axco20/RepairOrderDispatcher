import React, { FC } from 'react';
import Image from 'next/image';

const Features: FC = () => {
  // Detailed features data
  const detailedFeatures = [
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
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <h1 className="text-4xl font-bold text-center text-gray-900 mb-6">
        Powerful Features for Auto Repair Management
      </h1>
      <p className="text-xl text-gray-600 mb-12 text-center max-w-3xl mx-auto">
        Explore the complete set of tools designed to optimize every aspect of your auto repair business.
      </p>
      
      {/* Detailed features list */}
      <div className="space-y-20">
        {detailedFeatures.map((section, index) => (
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
            <div className={`relative h-[400px] ${index % 2 === 1 ? 'md:col-start-1' : ''}`}>
              <Image
                src={section.image}
                alt={section.title}
                fill
                sizes="(max-width: 768px) 100vw, 600px"
                className="rounded-lg shadow-xl object-cover"
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Features;