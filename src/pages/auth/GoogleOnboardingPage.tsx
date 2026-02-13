import React, { useState, useEffect } from "react";
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
import { RoleSelector } from "@/features/auth/RoleSelector";
import { StudentFields } from "@/features/auth/StudentFields";
import { StaffFields } from "@/features/auth/StaffFields";
import { InterestsSelector } from "@/features/auth/InterestsSelector";
import { toast } from "sonner";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { completeGoogleOnboarding } from "@/api/auth.api";
import { useAuth } from "@/contexts/AuthContext";
import { useUsernameAvailability } from "@/hooks/useUsernameAvailability";

const googleOnboardingSchema = z.object({
  role: z.enum(["student", "not-student"]),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be at most 30 characters"),
  space_id: z.string().min(1, "Please select a space"),
  department_id: z.string().min(1, "Please select a department"),
  department_id_2: z.string().optional(),
  department_id_3: z.string().optional(),
  phoneNumber: z.string().min(10).max(10),
  level: z.string().optional(),
  interests: z.array(z.string()).min(1, "Please select at least one interest"),
  is_student: z.boolean(),
});

type GoogleOnboardingFormData = z.infer<typeof googleOnboardingSchema>;

interface GoogleOnboardingData {
  email: string;
  full_name: string;
  avatar: string;
  id_token: string;
  new_user: boolean;
}

export const GoogleOnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const { setAuthUser } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [googleData, setGoogleData] = useState<GoogleOnboardingData | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<GoogleOnboardingFormData>({
    resolver: zodResolver(googleOnboardingSchema),
    defaultValues: {
      role: "student",
      username: "",
      space_id: "",
      department_id: "",
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

  useEffect(() => {
    form.setValue("is_student", watchedRole === "student");
  }, [watchedRole, form]);

  useEffect(() => {
    const storedData = sessionStorage.getItem("google_onboarding_data");
    if (!storedData) {
      toast.error("No Google sign-in data found. Please sign in again.");
      navigate("/auth/signin");
      return;
    }

    try {
      const data = JSON.parse(storedData) as GoogleOnboardingData;
      setGoogleData(data);
    } catch (error) {
      toast.error("Invalid Google sign-in data. Please sign in again.");
      navigate("/auth/signin");
    }
  }, [navigate]);

  const totalSteps = 4;

  // Define which fields need validation for each step
  const getStepFields = (step: number): (keyof GoogleOnboardingFormData)[] => {
    switch (step) {
      case 1:
        return ["role"];
      case 2:
        return ["username", "phoneNumber"];
      case 3:
        return ["space_id", "department_id"];
      case 4:
        return ["interests"];
      default:
        return [];
    }
  };

  const nextStep = async () => {
    // Validate current step fields before proceeding
    const fieldsToValidate = getStepFields(currentStep);
    const isValid = await form.trigger(fieldsToValidate);

    if (!isValid) {
      toast.error("Please fill in all required fields correctly");
      return;
    }

    // Additional validation for step 2 (username availability)
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

  const onSubmit = async (data: GoogleOnboardingFormData) => {
    if (!googleData) {
      toast.error("Missing Google sign-in data. Please sign in again.");
      navigate("/auth/signin");
      return;
    }

    setIsLoading(true);
    try {
      const response = await completeGoogleOnboarding({
        id_token: googleData.id_token,
        space_id: data.space_id,
        department_id: data.department_id,
        username: data.username,
        phone_number: data.phoneNumber,
        is_student: data.is_student,
        level: data.level ? parseInt(data.level, 10) : undefined,
        interests: data.interests,
      });

      sessionStorage.removeItem("google_onboarding_data");

      setAuthUser(response.user, response.is_new_user);

      navigate("/feed");
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          error.message ||
          "Failed to complete onboarding",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getStepContent = () => {
    if (!googleData) return null;

    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="flex gap-2 items-center justify-center">
                <h2 className="text-2xl font-semibold">
                  Welcome, {googleData.full_name}!
                </h2>
                {googleData.avatar && (
                  <img
                    src={googleData.avatar}
                    alt={"logo"}
                    className="w-10 h-10 rounded-lg mx-auto hidden"
                  />
                )}
              </div>
              <p className="text-muted-foreground">
                Let's complete your profile
              </p>
            </div>

            <div className="p-4 bg-muted/50 rounded-lg text-center space-y-2 hidden">
              {googleData.avatar && (
                <img
                  src={googleData.avatar}
                  alt={googleData.full_name}
                  className="w-16 h-16 rounded-lg mx-auto"
                />
              )}
              <p className="text-sm text-muted-foreground">
                Signing in with:{" "}
                <span className="font-medium text-foreground">
                  {googleData.email}
                </span>
              </p>
            </div>

            <div className="text-center space-y-2 pt-4">
              <h3 className="text-xl font-semibold">Who are you?</h3>
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

            <div className="space-y-2">
              <FormLabel>Email</FormLabel>
              <Input
                type="email"
                value={googleData.email}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                Email verified via Google
              </p>
            </div>

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

      default:
        return null;
    }
  };

  if (!googleData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
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
                  {isLoading ? "Completing Setup..." : "Complete Setup"}
                </Button>
              )}
            </div>
          </form>
        </Form>

        <div className="text-center text-sm">
          <button
            onClick={() => {
              sessionStorage.removeItem("google_onboarding_data");
              navigate("/auth/signin");
            }}
            className="text-muted-foreground hover:text-foreground hover:underline"
          >
            Cancel and return to sign in
          </button>
        </div>
      </div>
    </div>
  );
};
