// src/components/ui/PricingCard.tsx
import React, { FC } from 'react';
import { PricingPlan } from '../../types';

interface PricingCardProps {
  plan: PricingPlan;
  billingPeriod: 'monthly' | 'annual';
}

export const PricingCard: FC<PricingCardProps> = ({ plan, billingPeriod }) => {
  // Calculate price based on billing period
  const displayPrice = billingPeriod === 'annual' 
    ? `$${Math.round(parseInt(plan.price.replace('$', '')) * 0.8 * 12)}`
    : plan.price;
  
  return (
    <div 
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
          <span className="text-4xl font-bold text-gray-900">{displayPrice}</span>
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
  );
};