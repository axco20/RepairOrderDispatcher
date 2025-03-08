// Page navigation types
export type PageTab = 'home' | 'features' | 'pricing' | 'about' | 'contact';

// Feature interface
export interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

// Landing page props
export interface LandingPageProps {
  onLogin: () => void;
}

// Pricing plan interface
export interface PricingPlan {
  name: string;
  price: string;
  description: string;
  features: string[];
  popular?: boolean;
}

// Testimonial interface
export interface Testimonial {
  quote: string;
  author: string;
  role: string;
}

// Footer links interface
export interface FooterLinks {
  product: string[];
  company: string[];
  resources: string[];
  legal: string[];
}