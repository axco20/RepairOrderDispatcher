import React, { FC, useState } from 'react';
import { PricingPlan } from '../types';

interface PricingProps {
  pricingPlans: PricingPlan[];
}

const Pricing: FC<PricingProps> = ({ pricingPlans }) => {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');
  
  // FAQ data
  const faqs = [
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
  ];

  return (
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
          <button 
            className={`px-6 py-2 rounded-full ${
              billingPeriod === 'monthly' ? 'bg-blue-600 text-white' : 'text-gray-700'
            }`}
            onClick={() => setBillingPeriod('monthly')}
          >
            Monthly
          </button>
          <button 
            className={`px-6 py-2 rounded-full ${
              billingPeriod === 'annual' ? 'bg-blue-600 text-white' : 'text-gray-700'
            }`}
            onClick={() => setBillingPeriod('annual')}
          >
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
                <span className="text-4xl font-bold text-gray-900">
                  {billingPeriod === 'annual' 
                    ? `$${Math.round(parseInt(plan.price.replace('$', '')) * 0.8 * 12)}`
                    : plan.price}
                </span>
                <span className="text-gray-600">/{billingPeriod === 'annual' ? 'year' : 'month'}</span>
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
          {faqs.map((faq, index) => (
            <div key={index} className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{faq.question}</h3>
              <p className="text-gray-600">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;