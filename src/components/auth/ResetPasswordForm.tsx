'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useState, useEffect } from 'react';
import { toast } from "sonner";
import { useRouter } from 'next/navigation';

import { supabase } from '@/lib/supabase';
import { signOut } from 'next-auth/react'; // Import the signOut function from next-auth
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ResetPasswordSchema } from '@/lib/schemas';

export function ResetPasswordForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [hasCheckedToken, setHasCheckedToken] = useState(false);

  /**
   * This effect runs when the component mounts. The Supabase client library
   * automatically parses the URL hash for a password recovery token.
   * If found, it establishes a temporary session and fires the 'PASSWORD_RECOVERY' event.
   */
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsTokenValid(true);
      }
      setHasCheckedToken(true);
    });

    // It's important to unsubscribe from the listener when the component unmounts.
    return () => subscription.unsubscribe();
  }, []);

  const form = useForm<z.infer<typeof ResetPasswordSchema>>({
    resolver: zodResolver(ResetPasswordSchema),
    defaultValues: { password: '' },
  });

  /**
   * Handles the form submission to update the user's password.
   */
  async function onSubmit(values: z.infer<typeof ResetPasswordSchema>) {
    if (!isTokenValid) {
        toast.error("Invalid or expired link", { 
          description: "Please request a new password reset link." 
        });
        return;
    }

    setIsLoading(true);
    
    // Step 1: Update the user's password in the Supabase database.
    // This function uses the temporary session established by the recovery token.
    const { error: updateError } = await supabase.auth.updateUser({
      password: values.password,
    });

    if (updateError) {
      toast.error("Failed to reset password", { description: updateError.message });
      setIsLoading(false);
    } else {
      toast.success("Password Updated Successfully!", {
        description: "You will now be redirected to the sign-in page.",
      });

      // --- THE FIX: Invalidate all sessions to ensure a clean state ---

      // Step 2: Sign the user out of their temporary Supabase session.
      await supabase.auth.signOut();

      // Step 3: Sign the user out of their `next-auth` session.
      await signOut({ redirect: false });
      
      // Step 4: Manually redirect to the sign-in page for a fresh login.
      router.push('/sign-in');
    }
  }

  // Display a loading message while the Supabase client checks the token.
  if (!hasCheckedToken) {
    return <div className="text-center text-sm text-muted-foreground">Verifying link...</div>;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField 
          name="password" 
          control={form.control} 
          render={({ field }) => (
            <FormItem>
              <FormLabel>New Password</FormLabel>
              <FormControl>
                <Input 
                  type="password" 
                  placeholder="********" 
                  {...field} 
                  disabled={!isTokenValid} // Disable input if the token is invalid
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} 
        />
        <Button 
          type="submit" 
          className="w-full" 
          disabled={isLoading || !isTokenValid}
        >
          {isLoading ? "Updating Password..." : "Update Password"}
        </Button>
        
        {/* Display an error message if the token was checked and found to be invalid */}
        {!isTokenValid && hasCheckedToken && (
            <p className="text-center text-sm text-destructive">
                This password reset link is invalid or has expired. Please request a new one.
            </p>
        )}
      </form>
    </Form>
  );
}