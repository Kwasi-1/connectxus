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
import { useNavigate } from "react-router-dom";
import { signInWithGoogle } from "@/lib/firebase";
import { googleSignIn } from "@/api/auth.api";

const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

interface SignInFormProps {
  onToggleMode: () => void;
}

export const SignInForm: React.FC<SignInFormProps> = ({ onToggleMode }) => {
  const { signIn, isLoading, setAuthUser } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

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
      navigate("/feed");
    } catch (error: any) {
      if (error?.response?.status === 403) {
        const errorData = error.response?.data?.data;
        if (errorData?.error_code === "EMAIL_NOT_VERIFIED") {
          toast.info("Please verify your email to continue");
          navigate(`/verify-email?email=${encodeURIComponent(errorData.email)}`);
          return;
        }
      }

      toast.error(error instanceof Error ? error.message : "Failed to sign in");
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      const idToken = await signInWithGoogle();

      const response = await googleSignIn(idToken);

      if (response.needs_onboarding) {
        toast.info("Please complete your profile to continue");
        sessionStorage.setItem("google_onboarding_data", JSON.stringify({
          email: response.email,
          full_name: response.full_name,
          avatar: response.avatar,
          id_token: response.id_token,
          new_user: response.new_user,
        }));
        navigate("/auth/google-onboarding");
      } else {
        if ('user' in response) {
          setAuthUser(response.user, false);
          navigate("/feed");
        } else {
          toast.error("Invalid response from server");
        }
      }
    } catch (error: any) {
      if (error.message === "Sign-in cancelled") {
        toast.info("Sign-in was cancelled");
      } else {
        toast.error(error.message || "Failed to sign in with Google");
      }
    } finally {
      setIsGoogleLoading(false);
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
                  <button
                    type="button"
                    onClick={() => navigate("/auth/forgot-password")}
                    className="text-sm text-foreground hover:underline font-medium"
                  >
                    Forgot password?
                  </button>
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
        onClick={handleGoogleSignIn}
        disabled={isGoogleLoading || isLoading}
      >
        <Icon icon="devicon:google" className="w-5 h-5 mr-2" />
        {isGoogleLoading ? "Signing in with Google..." : "Continue with Google"}
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
