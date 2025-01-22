import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
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
import type { ControllerRenderProps } from 'react-hook-form';

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginPage() {
  const { signInWithPassword, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const returnUrl = (location.state as { from?: string })?.from || '/app/dashboard';
  const [error, setError] = useState<string | null>(null);
  
  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
    mode: 'onChange',
  });

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/app/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const onSubmit = async (data: LoginFormData) => {
    try {
      setError(null);
      const { data: authData, error: signInError } = await signInWithPassword(data);
      
      if (signInError) {
        setError(signInError.message);
        return;
      }

      if (!authData.user) {
        setError('Invalid credentials');
        return;
      }

      navigate(returnUrl, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight">Sign in</h2>
          <p className="mt-2 text-sm text-gray-600">
            Enter your credentials to access your account
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" role="form">
            {error && (
              <div role="alert" className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
                {error}
              </div>
            )}
            <FormField
              control={form.control}
              name="email"
              render={({ field }: { field: ControllerRenderProps<LoginFormData, 'email'> }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }: { field: ControllerRenderProps<LoginFormData, 'password'> }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Enter your password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="mt-6 w-full"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? 'Signing in...' : 'Sign in'}
            </Button>

            <div className="mt-4 text-center text-sm">
              <span className="text-gray-600">Don't have an account? </span>
              <Link to="/register" className="text-primary hover:underline">
                Sign up
              </Link>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
} 