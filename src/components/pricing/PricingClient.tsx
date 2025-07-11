'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Check, Mail } from "lucide-react";
import { pricingTiers } from '@/lib/constants';

type Currency = 'ZAR' | 'USD';

/**
 * A helper function to format a number into a currency string.
 * e.g., 299 with currency 'ZAR' becomes "R 299"
 * @param price The price as a number.
 * @param currency The currency code ('ZAR' or 'USD').
 * @returns A formatted currency string.
 */
const formatPrice = (price: number, currency: Currency) => {
  const currencyDisplay = currency === 'ZAR' ? 'R' : '$';
  return `${currencyDisplay} ${price}`;
};

export default function PricingClient({ detectedCurrency }: { detectedCurrency: Currency }) {
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(detectedCurrency);

  return (
    <div className="container mx-auto py-12 sm:py-16">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 mb-4">
          Flexible pricing for teams of all sizes.
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          Choose a plan that scales with your needs.
        </p>
        <Tabs 
          defaultValue={selectedCurrency} 
          onValueChange={(value: string) => setSelectedCurrency(value as Currency)}
          className="w-[180px] mx-auto mb-12"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="ZAR">ZAR (R)</TabsTrigger>
            <TabsTrigger value="USD">USD ($)</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto items-start">
        {pricingTiers.map((tier) => (
          <Card key={tier.name} className={`flex flex-col h-full relative ${tier.isMostPopular ? 'border-primary ring-2 ring-primary' : ''}`}>
            {tier.isMostPopular && (
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                Most Popular
              </Badge>
            )}
            <CardHeader>
              <CardTitle className="text-2xl">{tier.name}</CardTitle>
              
              {/* Conditionally render price or "Custom Quote" text */}
              {tier.price[selectedCurrency] !== null ? (
                <div className="text-4xl font-bold">
                  {formatPrice(tier.price[selectedCurrency]!, selectedCurrency)}
                  <span className="text-lg font-normal text-muted-foreground">/mo</span>
                </div>
              ) : (
                <div className="text-3xl font-bold h-[48px] flex items-center">
                  Custom Quote
                </div>
              )}
              <CardDescription>{tier.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <ul className="space-y-3">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                    <span className="text-sm text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full" variant={tier.isMostPopular ? 'default' : 'outline'}>
                {tier.cta}
                {tier.name.includes('Enterprise') && <Mail className="ml-2 h-4 w-4" />}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}