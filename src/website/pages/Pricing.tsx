import React, { useState } from 'react';
import { FaCheck } from 'react-icons/fa';
import * as RadixSwitch from '@radix-ui/react-switch';
import * as RadixAccordion from '@radix-ui/react-accordion';
import { ChevronDown } from 'lucide-react';

interface PricingPlan {
  name: string;
  description: string;
  price: string;
  features: string[];
  popular?: boolean;
}

interface PricingProps {
  pricingPlans: PricingPlan[];
}

const Switch: React.FC<{ checked: boolean; onCheckedChange: () => void }> = ({ checked, onCheckedChange }) => (
  <RadixSwitch.Root
    className={`relative w-16 h-8 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center px-1 ${checked ? 'bg-blue-600' : 'bg-gray-300'}`}
    checked={checked}
    onCheckedChange={onCheckedChange}
  >
    <RadixSwitch.Thumb className={`block w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${checked ? 'translate-x-8' : 'translate-x-0'}`} />
  </RadixSwitch.Root>
);

const Accordion: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <RadixAccordion.Root type="single" collapsible className="w-full max-w-3xl mx-auto">
    {children}
  </RadixAccordion.Root>
);

const AccordionItem: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <RadixAccordion.Item className="border-b border-gray-200 py-2" value={title}>
    <RadixAccordion.Trigger className="w-full flex justify-between items-center text-left text-lg font-semibold py-4 px-4 cursor-pointer hover:text-blue-600 transition-colors">
      {title}
      <ChevronDown className="h-5 w-5 transition-transform ui-open:rotate-180" />
    </RadixAccordion.Trigger>
    <RadixAccordion.Content className="text-gray-600 py-4 px-4 text-left">
      {children}
    </RadixAccordion.Content>
  </RadixAccordion.Item>
);

const Pricing: React.FC<PricingProps> = ({ pricingPlans }) => {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');

  const faqs = [
    { question: "How long is the free trial?", answer: "Our free trial lasts for 14 days. No credit card is required." },
    { question: "Can I change plans later?", answer: "Yes, you can upgrade or downgrade your plan at any time." },
    { question: "Is there a setup fee?", answer: "No, there are no setup fees for any of our plans." },
    { question: "Do you offer multi-location discounts?", answer: "Yes, we offer volume discounts for businesses with multiple locations. Contact our sales team for custom pricing." },
  ];

  return (
    <section className="max-w-7xl mx-auto px-6 py-24 space-y-20">
      <div className="space-y-8 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900">Simple, Transparent Pricing</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">Choose the perfect plan for your repair shop.</p>

        {/* Billing Toggle */}
        <div className="flex justify-center items-center space-x-4 mt-12">
          <span className={`text-lg ${billingPeriod === 'monthly' ? 'text-blue-600 font-medium' : 'text-gray-700'}`}>Monthly</span>
          <Switch 
            checked={billingPeriod === 'annual'}
            onCheckedChange={() => setBillingPeriod(billingPeriod === 'monthly' ? 'annual' : 'monthly')}
          />
          <span className={`text-lg ${billingPeriod === 'annual' ? 'text-blue-600 font-medium' : 'text-gray-700'}`}>Annual (Save 20%)</span>
        </div>
      </div>

      {/* Pricing Cards */}
<div className="grid place-items-center sm:grid-cols-1 gap-8 max-w-6xl mx-auto">
        {pricingPlans.map((plan, index) => (
          <div 
            key={index} 
            className={`relative bg-white shadow-xl rounded-2xl p-8 border-2 transition-all duration-300 hover:-translate-y-2 ${
              plan.popular ? 'border-blue-600 ring-4 ring-blue-100' : 'border-gray-200'
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white text-sm font-semibold px-4 py-1 rounded-full shadow-md">
                Most Popular
              </div>
            )}
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{plan.name}</h3>
            <p className="text-gray-600 h-12">{plan.description}</p>
            
            <div className="my-6 text-center">
              <div className="text-4xl md:text-5xl font-bold text-gray-900">
                {billingPeriod === 'annual' 
                  ? `$${Math.round(parseInt(plan.price.replace('$', '')) * 0.8 * 12)}`
                  : plan.price}
              </div>
              <div className="text-gray-600 mt-1">per {billingPeriod === 'annual' ? 'year' : 'month'}</div>
            </div>
            
            <ul className="mt-8 space-y-4">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-start text-gray-700">
                  <FaCheck className="text-blue-600 mt-1 mr-3 flex-shrink-0" /> 
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            
            <button className={`w-full mt-8 py-3 rounded-lg font-medium text-lg transition-all duration-300 ${
              plan.popular 
                ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl' 
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200 hover:text-gray-900'
            }`}>
              {plan.popular ? 'Start Free Trial' : 'Choose Plan'}
            </button>
          </div>
        ))}
      </div>

      {/* FAQ Section */}
      <div className="pt-8 pb-16">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12 text-center">Frequently Asked Questions</h2>
        <Accordion>
          {faqs.map((faq, index) => (
            <AccordionItem key={index} title={faq.question}>
              <p>{faq.answer}</p>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default Pricing;