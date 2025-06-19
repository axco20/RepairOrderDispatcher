"use client"; // Ensure this runs only on the client

import React from "react";
import { Wrench } from "lucide-react";

const About = () => {
  // Key features
  const reasons = [
    {
      title: "Efficiency at Its Core",
      description:
        "We streamline auto repair operations by eliminating bottlenecks, reducing delays, and enhancing productivity.",
    },
    {
      title: "Data-Driven Decisions",
      description:
        "Our platform provides insightful analytics to help businesses make smarter, data-backed decisions.",
    },
    {
      title: "Seamless Integration",
      description:
        "AutoSyncify works effortlessly with existing tools, ensuring a smooth transition and minimal learning curve.",
    },
    {
      title: "Customer-Centric Approach",
      description:
        "We listen to our clients and continuously evolve to meet their changing needs.",
    },
  ];

  // Leadership values
  const leadershipPrinciples = [
    {
      title: "Innovation",
      description:
        "We challenge the status quo and strive to introduce groundbreaking solutions.",
    },
    {
      title: "Integrity",
      description:
        "Transparency and trust form the foundation of our leadership culture.",
    },
    {
      title: "Collaboration",
      description:
        "Success is built on teamwork, and we thrive by working together.",
    },
    {
      title: "Growth Mindset",
      description:
        "Continuous learning and adaptation drive our mission to improve the industry.",
    },
  ];

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
        </div>
      </header>

      {/* Main Content */}
      <section className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 pt-32 pb-20">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900">
            About <span className="text-blue-600">AutoSyncify</span>
          </h1>
          <p className="text-lg text-gray-600 mt-4 max-w-2xl mx-auto">
            Empowering auto repair businesses with intelligent workflow solutions that enhance productivity and efficiency.
          </p>
        </div>

        {/* Mission & Vision */}
        <div className="grid md:grid-cols-2 gap-12 mb-16">
          <div className="bg-white p-8 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-blue-600 mb-3">Our Mission</h2>
            <p className="text-gray-700">
              Our mission is to revolutionize auto repair management by providing
              seamless, intuitive, and highly efficient workflow automation
              solutions that drive business success.
            </p>
          </div>
          <div className="bg-white p-8 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-blue-600 mb-3">Our Vision</h2>
            <p className="text-gray-700">
              To be the leading technology partner for auto repair shops,
              redefining how they operate through smart, automated solutions that
              boost efficiency, customer satisfaction, and profitability.
            </p>
          </div>
        </div>

        {/* Why Choose Us */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-10">
            Why Choose AutoSyncify?
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {reasons.map((reason, index) => (
              <div key={index} className="bg-white shadow-md p-6 rounded-lg border-l-4 border-blue-600 hover:shadow-lg transition-shadow">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {reason.title}
                </h3>
                <p className="text-gray-600">{reason.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Leadership Principles */}
        <div>
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-10">
            Our Leadership Principles
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {leadershipPrinciples.map((principle, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {principle.title}
                </h3>
                <p className="text-gray-600">{principle.description}</p>
              </div>
            ))}
          </div>
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

export default About;
