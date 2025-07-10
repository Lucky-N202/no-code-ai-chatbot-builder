'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useState } from 'react';
import { toast } from "sonner";
import Link from 'next/link';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ForgotPasswordSchema } from '@/lib/schemas';
import { requestPasswordReset } from '@/app/actions/authActions';

export function ForgotPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof ForgotPasswordSchema>>({
    resolver: zodResolver(ForgotPasswordSchema),
    defaultValues: { email: '' },
  });

  async function onSubmit(values: z.infer<typeof ForgotPasswordSchema>) {
    setIsLoading(true);
    // This calls our server action.
    await requestPasswordReset(values);

    // We always show a generic success message to prevent attackers from checking
    // which email addresses are registered in our system.
    toast.success("Check your email", {
      description: "If an account with that email exists, we have sent a link to reset your password.",
    });
    
    form.reset();
    setIsLoading(false);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField name="email" control={form.control} render={({ field }) => (
          <FormItem>
            <FormLabel>Email</FormLabel>
            <FormControl><Input placeholder="name@example.com" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Sending Link..." : "Send Reset Link"}
        </Button>
        <div className="text-center">
            <Button variant="link" asChild className="text-sm font-medium">
                <Link href="/sign-in">Back to Sign In</Link>
            </Button>
        </div>
      </form>
    </Form>
  );
}