"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { SignInSchema } from '@/lib/schemas';
import Link from 'next/link';

export function SignInForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof SignInSchema>>({
    resolver: zodResolver(SignInSchema),
    defaultValues: { email: '', password: '' },
  });

  async function onSubmit(values: z.infer<typeof SignInSchema>) {
    setIsLoading(true);
    try {
      const result = await signIn('credentials', {
        redirect: false,
        email: values.email,
        password: values.password,
      });

      if (result?.error) {
        toast.error("Login Failed", {
          description: "Invalid credentials. Please try again.",
        });
         setIsLoading(false);
      } else {
        toast.success("Success!", {
          description: "You have been successfully signed in.",
        });
       // FIX: Use a hard navigation to the dashboard.
      window.location.href = '/dashboard';
        router.refresh(); // Important to update server session state
      }
    } catch (error) {
       console.error("Sign in error", error)
       toast.error("An unexpected error occurred during sign-in.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField control={form.control} name="email" render={({ field }) => (
              <FormItem><FormLabel>Email</FormLabel><FormControl><Input placeholder="admin@example.com" {...field} /></FormControl><FormMessage /></FormItem>
            )}
          />
          <FormField control={form.control} name="password" render={({ field }) => (
              <FormItem><FormLabel>Password</FormLabel><FormControl><Input type="password" placeholder="password123" {...field} /></FormControl><FormMessage /></FormItem>
            )}
          />
           <div className="flex items-center justify-end">
            <Link href="/forgot-password"
              className="text-sm font-medium text-primary hover:underline underline-offset-4"
            >
              Forgot Password?
            </Link>
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing In..." : "Sign In"}
          </Button>
        </form>
      </Form>
      <div className="mt-4 text-center text-sm">
        Don't have an account?{" "}
        <Link href="/sign-up" className="underline">
          Sign up
        </Link>
      </div>
    </>
  );
}