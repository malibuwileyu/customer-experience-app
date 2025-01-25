import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/common/button';
import { Input } from '../../components/common/input';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '../../components/common/form';
import { AuthError } from '@supabase/supabase-js';

const registrationSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email format'),
  fullName: z.string().min(1, 'Full name is required'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  confirmPassword: z.string().min(1, 'Confirm password is required'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type RegistrationFormData = z.infer<typeof registrationSchema>;

export function RegistrationPage() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const form = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      email: '',
      fullName: '',
      password: '',
      confirmPassword: '',
    },
    mode: 'onChange',
  });

  const onSubmit = async (data: RegistrationFormData) => {
    try {
      setError(null);
      const { data: result, error } = await signUp({
        email: data.email,
        password: data.password,
        metadata: {
          full_name: data.fullName,
          role: 'customer'
        }
      });
      
      if (error) {
        if (error.message.includes('already registered')) {
          setError('User already registered');
        } else {
          setError(error.message);
        }
        return;
      }
      
      if (!result?.user) {
        setError('Failed to create account');
        return;
      }
      
      navigate('/dashboard');
    } catch (err) {
      if (err instanceof AuthError) {
        if (err.message.includes('already registered')) {
          setError('User already registered');
        } else {
          setError(err.message);
        }
      } else {
        setError('Failed to create account');
      }
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight">Sign up</h2>
          <p className="mt-2 text-sm text-gray-600">
            Create your account to get started
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" role="form">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      aria-invalid={!!form.formState.errors.email}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage>
                    {form.formState.errors.email?.message}
                  </FormMessage>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="Enter your full name"
                      aria-invalid={!!form.formState.errors.fullName}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage>
                    {form.formState.errors.fullName?.message}
                  </FormMessage>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Enter your password"
                      aria-invalid={!!form.formState.errors.password}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage>
                    {form.formState.errors.password?.message}
                  </FormMessage>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Confirm your password"
                      aria-invalid={!!form.formState.errors.confirmPassword}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage>
                    {form.formState.errors.confirmPassword?.message}
                  </FormMessage>
                </FormItem>
              )}
            />

            {error && (
              <div className="text-sm font-medium text-destructive" role="alert">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="mt-6 w-full"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? 'Signing up...' : 'Sign up'}
            </Button>

            <div className="mt-4 text-center text-sm">
              <span className="text-gray-600">Already have an account? </span>
              <Link to="/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
} 