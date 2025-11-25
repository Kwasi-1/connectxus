import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { SignInFormData } from "@/types/auth";
import { toast } from "sonner";
import { Mail, Lock } from "lucide-react";
import { Icon } from "@iconify/react/dist/iconify.js";
import { ChevronLeft, ChevronRight, Eye, EyeOff } from "lucide-react";

const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

interface SignInFormProps {
  onToggleMode: () => void;
}

export const SignInForm: React.FC<SignInFormProps> = ({ onToggleMode }) => {
  const { signIn, isLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: SignInFormData) => {
    try {
      await signIn(data);
      toast.success("Signed in successfully!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to sign in");
    }
  };

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground font-medium">
                  Email
                </FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="Enter your email address"
                    className="h-12 rounded-lg border-input bg-background"
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
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between mb-2">
                  <FormLabel>Password</FormLabel>
                  <a
                    href="/forget-password"
                    className="text-sm text-foreground hover:underline font-medium"
                    onClick={(e) => {
                      e.preventDefault();
                      toast.info("Password reset functionality coming soon!");
                    }}
                  >
                    Forget password?
                  </a>
                </div>
                <FormControl>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password here"
                      className="pl-10"
                      {...field}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full h-11 bg-foreground text-background hover:bg-foreground/90 rounded-lg text-base font-medium"
            disabled={isLoading}
          >
            {isLoading ? "Signing In..." : "Sign in"}
          </Button>
        </form>
      </Form>

      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border"></div>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">OR</span>
        </div>
      </div>

      {/* Google Sign In */}
      <Button
        type="button"
        variant="outline"
        className="w-full h-11 rounded-lg border-input hover:bg-accent/50 transition-colors"
        onClick={() => toast.info("Google sign-in coming soon!")}
      >
        <Icon icon="devicon:google" className="w-5 h-5 mr-2" />
        Continue with Google
      </Button>

      <div className="text-center text-sm">
        <span className="text-muted-foreground">Don't have an account? </span>
        <button
          onClick={onToggleMode}
          className="text-foreground hover:underline font-semibold"
        >
          Create account
        </button>
      </div>

      <div className=" hidden text-center text-xs text-muted-foreground space-y-1 p-4 bg-muted/50 rounded-lg">
        <p className="font-medium">Demo credentials:</p>
        <p>Email: student@university.edu</p>
        <p>Password: password123</p>
      </div>
    </div>
  );
};
