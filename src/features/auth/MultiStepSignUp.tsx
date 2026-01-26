import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { SignUpFormData } from "@/types/auth";
import { RoleSelector } from "./RoleSelector";
import { StudentFields } from "./StudentFields";
import { StaffFields } from "./StaffFields";
import { InterestsSelector } from "./InterestsSelector";
import { toast } from "sonner";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { UniversitySelector } from "./UniversitySelector";
import { useUsernameAvailability } from "@/hooks/useUsernameAvailability";

const signUpSchema = z
  .object({
    role: z.enum(["student", "not-student"]),
    username: z
      .string()
      .min(3, "Username must be at least 3 characters")
      .max(30, "Username must be at most 30 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
    space_id: z.string().min(1, "Please select a space"),
    department_id: z.string().optional(),
    department_id_2: z.string().optional(),
    department_id_3: z.string().optional(),
    phoneNumber: z.string().min(10).max(10),
    level: z.string().optional(),
    interests: z
      .array(z.string())
      .min(1, "Please select at least one interest"),
    is_student: z.boolean(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

interface MultiStepSignUpProps {
  onToggleMode: () => void;
}

export const MultiStepSignUp: React.FC<MultiStepSignUpProps> = ({
  onToggleMode,
}) => {
  const { signUp, isLoading } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);

  const [showPassword, setShowPassword] = useState(false);

  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      role: "student",
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      space_id: "",
      department_id: "",
      department_id_2: "",
      department_id_3: "",
      level: "",
      interests: [],
      phoneNumber: "",
      is_student: true,
    },
  });

  const watchedRole = form.watch("role");
  const watchedUsername = form.watch("username");

  const {
    status: usernameStatus,
    message: usernameMessage,
    isChecking: isCheckingUsername,
    isAvailable: isUsernameAvailable,
  } = useUsernameAvailability(watchedUsername);

  React.useEffect(() => {
    form.setValue("is_student", watchedRole === "student");
  }, [watchedRole, form]);

  let totalSteps = 5;

  const nextStep = async () => {
    if (currentStep === 2) {
      const username = form.getValues("username");

      if (!username || username.length < 3) {
        toast.error("Please enter a valid username (at least 3 characters)");
        return;
      }

      if (isCheckingUsername) {
        toast.info("Please wait while we check username availability...");
        return;
      }

      if (isUsernameAvailable === false) {
        toast.error("Username is already taken. Please choose another one.");
        return;
      }

      if (isUsernameAvailable === null && username.length >= 3) {
        toast.error(
          "Could not verify username availability. Please try again.",
        );
        return;
      }
    }

    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = async (data: SignUpFormData) => {
    try {
      await signUp(data);
      toast.success("Account created successfully! Please verify your email.");
      navigate(`/verify-email?email=${encodeURIComponent(data.email)}`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create account",
      );
    }
  };

  const getStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-semibold">Who are you?</h2>

              <p className="text-muted-foreground">
                Select your role to get started
              </p>
            </div>

            <RoleSelector control={form.control} name="role" />
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-semibold">Tell us about yourself</h2>
              <p className="text-muted-foreground">
                We'll need some basic information
              </p>
            </div>

            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input placeholder="Enter your username" {...field} />
                      {field.value && field.value.length >= 3 && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          {isCheckingUsername && (
                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                          )}
                          {usernameStatus === "available" && (
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                          )}
                          {usernameStatus === "taken" && (
                            <XCircle className="h-4 w-4 text-destructive" />
                          )}
                        </div>
                      )}
                    </div>
                  </FormControl>
                  {field.value &&
                    field.value.length >= 3 &&
                    usernameMessage && (
                      <FormDescription
                        className={
                          usernameStatus === "available"
                            ? "text-green-600"
                            : usernameStatus === "taken"
                              ? "text-destructive"
                              : "text-muted-foreground"
                        }
                      >
                        {usernameMessage}
                      </FormDescription>
                    )}
                  <FormMessage />
                </FormItem>
              )}
            />

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
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Enter your number"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-semibold">Academic Details</h2>
              <p className="text-muted-foreground">
                Help us understand your academic background
              </p>
            </div>

            {watchedRole === "student" ? (
              <StudentFields control={form.control} />
            ) : (
              <StaffFields control={form.control} />
            )}
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-semibold">Your Interests</h2>
              <p className="text-muted-foreground">
                Help us personalize your experience
              </p>
            </div>

            <InterestsSelector control={form.control} name="interests" />
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-semibold">Secure your account</h2>
              <p className="text-muted-foreground">Choose a strong password</p>
            </div>

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a password"
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

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm your password"
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showConfirmPassword ? (
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
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>
            Step {currentStep} of {totalSteps}
          </span>
          <span>{Math.round((currentStep / totalSteps) * 100)}%</span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300 ease-in-out"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {getStepContent()}

          <div className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="flex items-center space-x-2"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Previous</span>
            </Button>

            {currentStep < totalSteps ? (
              <Button
                type="button"
                onClick={nextStep}
                className="flex items-center space-x-2"
              >
                <span>Next</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Creating Account..." : "Create Account"}
              </Button>
            )}
          </div>
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
