import React, { FC } from 'react';
import Image from 'next/image';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { Feature } from '../types';

interface HomeProps {
  features: Feature[];
  handleNavigation: (tab: 'features') => void;
}

const Home: FC<HomeProps> = ({ features, handleNavigation }) => {
  {/* 
  // Testimonials data
  const testimonials: Testimonial[] = [
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
  ];*/}

  return (
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
          <div className="relative h-full w-full">
            <Image
              src="/images/screenshotofdash.png"
              alt="Dashboard Screenshot"
              fill
              sizes="(max-width: 768px) 100vw, 300px"
              
              priority // This is important for the hero image (LCP)
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

      {/* Testimonials 
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Trusted by repair shops nationwide
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
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
      */}

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
  );
};

export default Home;