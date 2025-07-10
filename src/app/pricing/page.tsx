import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";
import Header from "@/components/shared/Header";

const tiers = [
  {
    name: 'Free',
    price: '$0',
    description: 'Get started and build your first chatbot.',
    features: ['1 Chatbot', '50 Messages/Month', 'Basic Flow Builder', 'Community Support'],
    cta: 'Get Started for Free'
  },
  {
    name: 'Pro',
    price: '$29',
    description: 'For power users who need more.',
    features: ['Unlimited Chatbots', '10,000 Messages/Month', 'Advanced Logic & AI', 'Remove Branding', 'Priority Support'],
    cta: 'Go Pro'
  }
];

export default function PricingPage() {
  return (
    <>
      <Header />
      <div className="container mx-auto py-12">
        <h1 className="text-4xl font-bold text-center mb-4">Pricing Plans</h1>
        <p className="text-xl text-muted-foreground text-center mb-12">Choose the plan that's right for you.</p>
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {tiers.map((tier) => (
            <Card key={tier.name} className="flex flex-col">
              <CardHeader>
                <CardTitle className="text-2xl">{tier.name}</CardTitle>
                <div className="text-4xl font-bold">{tier.price}<span className="text-lg font-normal text-muted-foreground">/mo</span></div>
                <CardDescription>{tier.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <ul className="space-y-2">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-center">
                      <Check className="h-5 w-5 text-green-500 mr-2" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full">{tier.cta}</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}