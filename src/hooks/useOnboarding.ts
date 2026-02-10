import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { completeOnboarding as apiCompleteOnboarding, getOnboardingStatus } from "@/api/users.api";

interface OnboardingState {
  showOnboarding: boolean;
  isCompleting: boolean;
  isLoading: boolean;
  completeOnboarding: () => Promise<void>;
  resetOnboarding: () => void;
}

export function useOnboarding(): OnboardingState {
  const { user } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!user) {
        setShowOnboarding(false);
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        const status = await getOnboardingStatus();
        
        // Show onboarding if:
        // 1. User hasn't completed onboarding AND
        // 2. User is not following anyone
        const shouldShow = !status.onboarding_completed && status.following_count === 0;
        setShowOnboarding(shouldShow);
      } catch (error) {
        console.error("Error checking onboarding status:", error);
        // On error, default to not showing onboarding
        setShowOnboarding(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkOnboardingStatus();
  }, [user]);

  const completeOnboarding = useCallback(async () => {
    if (!user || isCompleting) return;
    
    setIsCompleting(true);
    
    try {
      // Call backend to mark onboarding as complete
      await apiCompleteOnboarding();
      setShowOnboarding(false);
    } catch (error) {
      console.error("Error completing onboarding:", error);
    } finally {
      setIsCompleting(false);
    }
  }, [user, isCompleting]);

  const resetOnboarding = useCallback(() => {
    // This is mainly for testing purposes
    // In production, you'd need a backend endpoint to reset this
    setShowOnboarding(true);
  }, []);

  return {
    showOnboarding,
    isCompleting,
    isLoading,
    completeOnboarding,
    resetOnboarding,
  };
}
