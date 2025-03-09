import React, { FC } from "react";
import { Mail, ArrowRight } from "lucide-react";

const Contact: FC = () => {
  return (
    <section className="max-w-5xl mx-auto px-6 sm:px-10 lg:px-16 py-20">
      {/* Page Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900">
          Get in Touch with <span className="text-blue-600">AutoSynctify</span>
        </h1>
        <p className="text-lg text-gray-600 mt-4 max-w-2xl mx-auto">
          Have questions? Need support? We’d love to hear from you. Reach out and we’ll get back to you as soon as possible.
        </p>
      </div>

      {/* Contact Section */}
      <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-200 text-center">
        <div className="flex justify-center mb-6">
          <div className="bg-blue-100 p-4 rounded-full">
            <Mail className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Email Us</h2>
        <p className="text-gray-600 mb-4">
          Our team is here to help! Send us an email, and we&apos;ll respond promptly.
        </p>
        <a
          href="mailto:help@AutoSynctify.com"
          className="inline-flex items-center text-lg font-medium text-blue-600 hover:text-blue-800 transition-colors"
        >
          help@AutoSynctify.com
          <ArrowRight className="ml-2 h-5 w-5" />
        </a>
      </div>

      {/* Additional Information */}
      <div className="mt-16 text-center">
        <h3 className="text-xl font-semibold text-gray-900">
          Looking for More Information?
        </h3>
        <p className="text-gray-600 mt-2">
          Check out our support documentation and FAQs.
        </p>
        <button className="mt-4 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-all">
          Visit Help Center
        </button>
      </div>
    </section>
  );
};

export default Contact;
