/**
 * Defines the structure for a single pricing tier.
 * Using a TypeScript type ensures all tiers have a consistent shape.
 */
export type PricingTier = {
  name: string;
  price: {
    ZAR: number | null;
    USD: number | null;
  };
  description: string;
  features: string[];
  cta: string;
  isMostPopular: boolean;
};

/**
 * An array containing all pricing tiers for the application.
 * To add or change a tier, you only need to modify this array.
 */
export const pricingTiers: PricingTier[] = [
  {
    name: 'Free',
    price: { ZAR: 0, USD: 0 },
    description: 'For beginners and hobby users to try the basics.',
    features: [
        '1 Chatbot', 
        '50 Messages/Month', 
        'Basic Flow Builder', 
        'Community Support'
    ],
    cta: 'Get Started for Free',
    isMostPopular: false,
  },
  {
    name: 'Pro',
    price: { ZAR: 299, USD: 29 },
    description: 'For small businesses and professionals who need more power.',
    features: [
        '10 Chatbots', 
        '10,000 Messages/Month', 
        'Advanced Logic Nodes', 
        'Remove Branding', 
        'Email Support'
    ],
    cta: 'Upgrade to Pro',
    isMostPopular: false,
  },
  {
    name: 'Business',
    price: { ZAR: 899, USD: 99 },
    description: 'For agencies and teams managing multiple clients or projects.',
    features: [
        'Unlimited Chatbots', 
        '50,000 Messages/Month', 
        'Team Collaboration', 
        'API Access', 
        'Priority Support'
    ],
    cta: 'Choose Business',
    isMostPopular: true, // This flag will be used to highlight the card
  },
  {
    name: 'Enterprise 🚀',
    price: { ZAR: null, USD: null }, // null signifies a custom quote
    description: 'For large organizations requiring full customization and support.',
    features: [
        'White-Labeling & Custom Domain', 
        'Unlimited Scale', 
        'Dedicated Account Manager', 
        'Custom Integrations', 
        'Service Level Agreement (SLA)'
    ],
    cta: 'Contact Sales',
    isMostPopular: false,
  },
];