import React, { FC } from 'react';

interface CTASectionProps {
  title: string;
  subtitle: string;
  buttonText: string;
  onClick?: () => void;
}

const CTASection: FC<CTASectionProps> = ({ title, subtitle, buttonText, onClick }) => {
  return (
    <section className="bg-blue-600 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-bold text-white mb-6">
          {title}
        </h2>
        <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
          {subtitle}
        </p>
        <button 
          onClick={onClick}
          className="bg-white text-blue-600 px-8 py-3 rounded-lg hover:bg-blue-50 transition-colors text-lg font-semibold"
        >
          {buttonText}
        </button>
      </div>
    </section>
  );
};

export default CTASection;