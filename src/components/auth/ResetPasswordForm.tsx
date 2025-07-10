// components/auth/ResetPasswordForm.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useState, useEffect } from 'react';
import { toast } from "sonner";
import { useRouter } from 'next/navigation';

import { supabase } from '@/lib/supabase';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ResetPasswordSchema } from '@/lib/schemas';

export function ResetPasswordForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [hasCheckedToken, setHasCheckedToken] = useState(false);

  // When the component mounts, Supabase client automatically detects the password
  // recovery token from the URL hash and establishes a session.
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // This event fires when the user arrives from the email link.
      if (event === 'PASSWORD_RECOVERY') {
        setIsTokenValid(true);
      }
      setHasCheckedToken(true);
    });

    // Clean up the subscription when the component unmounts.
    return () => subscription.unsubscribe();
  }, []);

  const form = useForm<z.infer<typeof ResetPasswordSchema>>({
    resolver: zodResolver(ResetPasswordSchema),
    defaultValues: { password: '' },
  });

  async function onSubmit(values: z.infer<typeof ResetPasswordSchema>) {
    if (!isTokenValid) {
        toast.error("Invalid or expired link", { description: "Please request a new password reset link." });
        return;
    }

    setIsLoading(true);
    // This client-side function from Supabase uses the session established by the token
    // to securely update the user's password.
    const { error } = await supabase.auth.updateUser({
      password: values.password,
    });

    if (error) {
      toast.error("Failed to reset password", { description: error.message });
    } else {
      toast.success("Password Updated!", {
        description: "Your password has been successfully reset. Please sign in with your new password.",
      });
      // Redirect to the sign-in page after a short delay to allow the user to read the toast.
      setTimeout(() => router.push('/sign-in'), 2000);
    }
    setIsLoading(false);
  }

  // Show a loading state until the token has been processed.
  if (!hasCheckedToken) {
    return <div className="text-center">Verifying reset link...</div>;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField name="password" control={form.control} render={({ field }) => (
          <FormItem>
            <FormLabel>New Password</FormLabel>
            <FormControl><Input type="password" placeholder="********" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <Button type="submit" className="w-full" disabled={isLoading || !isTokenValid}>
            {isLoading ? "Updating Password..." : "Update Password"}
        </Button>
        {!isTokenValid && hasCheckedToken && (
            <p className="text-center text-sm text-destructive">
                This password reset link is invalid or has expired.
            </p>
        )}
      </form>
    </Form>
  );
}