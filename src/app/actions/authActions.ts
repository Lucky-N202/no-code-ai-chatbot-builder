'use server';

import { createClient } from '@supabase/supabase-js';
import * as z from 'zod';
import { ForgotPasswordSchema, SignUpSchema } from '@/lib/schemas';
import bcrypt from 'bcryptjs';

export async function signUpUser(values: z.infer<typeof SignUpSchema>) {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const validatedFields = SignUpSchema.safeParse(values);
  if (!validatedFields.success) {
    return { error: 'Invalid fields provided.' };
  }

  const { name, email, password } = validatedFields.data;

  // Create the user in Supabase's built-in `auth.users` table.
  // This will automatically fire the trigger that creates a basic profile.
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: email,
    password: password,
    email_confirm: true,
  });

  if (authError || !authData.user) {
    console.error('Supabase auth error:', authError);
    return { error: authError?.message || 'Failed to create authentication entry.' };
  }

  // THE FIX: Instead of inserting a new profile, we now UPDATE the
  // profile that was automatically created by the database trigger.
  // We use this step to add the user's full name.
  const { error: updateError } = await supabaseAdmin
    .from('profiles')
    .update({ name: name }) // Only update the fields we have, like 'name'
    .eq('id', authData.user.id); // Specify which profile to update

  if (updateError) {
    // If updating the profile fails, we should still delete the auth user
    // to prevent orphaned accounts.
    console.error('Supabase profile update error:', updateError);
    await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
    return { error: 'Failed to update user profile.' };
  }

  return { success: true };
}

export async function requestPasswordReset(values: z.infer<typeof ForgotPasswordSchema>) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const validatedFields = ForgotPasswordSchema.safeParse(values);
  if (!validatedFields.success) {
    return { error: 'Invalid email provided.' };
  }

  const { email } = validatedFields.data;

  // This Supabase function generates a token and sends the email.
  // The `redirectTo` URL is where the user will be sent after clicking the link.
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXTAUTH_URL}/reset-password`,
  });

  if (error) {
    console.error("Password reset error:", error);
    // Return a generic message to avoid leaking info about which emails are registered.
    return { error: 'An unexpected error occurred. Please try again.' };
  }

  // Always return success to prevent user enumeration attacks.
  return { success: true };
}