
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { SignUpFormData } from '@/types/auth';
import { RoleSelector } from './RoleSelector';
import { StudentFields } from './StudentFields';
import { StaffFields } from './StaffFields';
import { toast } from 'sonner';

const signUpSchema = z.object({
  role: z.enum(['student', 'ta', 'lecturer']),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  university: z.string().optional(),
  department: z.string().optional(),
  level: z.string().optional(),
  wantsToBeTutor: z.boolean().optional(),
  wantsToBeMapMentor: z.boolean().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
}).refine((data) => {
  if (data.role === 'student') {
    return data.level && data.department;
  }
  if (['ta', 'lecturer'].includes(data.role)) {
    return data.department;
  }
  return true;
}, {
  message: "Required field",
  path: ["department"],
});

interface SignUpFormProps {
  onToggleMode: () => void;
}

export const SignUpForm: React.FC<SignUpFormProps> = ({ onToggleMode }) => {
  const { signUp, isLoading } = useAuth();
  
  const form = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      role: 'student',
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      university: 'University of Technology',
      department: '',
      level: '',
      wantsToBeTutor: false,
      wantsToBeMapMentor: false,
    },
  });

  const watchedRole = form.watch('role');

  const onSubmit = async (data: SignUpFormData) => {
    try {
      await signUp(data);
      toast.success('Account created successfully!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create account');
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">Create Account</h1>
        <p className="text-muted-foreground">Join your university community</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <RoleSelector control={form.control} name="role" />

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your full name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {watchedRole === 'student' && (
            <>
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="Enter your email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <StudentFields control={form.control} />
            </>
          )}

          {['ta', 'lecturer'].includes(watchedRole) && (
            <StaffFields control={form.control} />
          )}

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="Create a password" {...field} />
                </FormControl>
                <FormMessage />
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
                  <Input type="password" placeholder="Confirm your password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </Button>
        </form>
      </Form>

      <div className="text-center text-sm">
        <span className="text-muted-foreground">Already have an account? </span>
        <button
          onClick={onToggleMode}
          className="text-primary hover:underline font-medium"
        >
          Sign in
        </button>
      </div>
    </div>
  );
};
