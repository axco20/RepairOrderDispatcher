// src/components/ui/FeatureCard.tsx
import React, { FC } from 'react';
import { Feature } from '../../types';

interface FeatureCardProps {
  feature: Feature;
}

export const FeatureCard: FC<FeatureCardProps> = ({ feature }) => {
  return (
    <div className="bg-gray-50 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <div className="mb-4">{feature.icon}</div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
      <p className="text-gray-600">{feature.description}</p>
    </div>
  );
};