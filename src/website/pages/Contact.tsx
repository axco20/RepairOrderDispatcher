import React, { FC } from 'react';
import { Mail, FileText, ArrowRight } from 'lucide-react';

const Contact: FC = () => {
  return (
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
                  help@AutoSynctify.com
                </a>
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
          
          
        </div>
      </div>
    </section>
  );
};

export default Contact;