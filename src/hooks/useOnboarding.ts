import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";

const ONBOARDING_COMPLETE_KEY = "onboarding_complete";

interface OnboardingState {
  showOnboarding: boolean;
  isCompleting: boolean;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
}

export function useOnboarding(): OnboardingState {
  const { user } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  useEffect(() => {
    if (user) {
      // Check if onboarding is complete for this user
      const completedUsers = JSON.parse(
        localStorage.getItem(ONBOARDING_COMPLETE_KEY) || "{}"
      );
      const isComplete = completedUsers[user.id] === true;
      setShowOnboarding(!isComplete);
    }
  }, [user]);

  const completeOnboarding = useCallback(() => {
    if (!user) return;
    
    setIsCompleting(true);
    
    // Mark onboarding as complete for this user
    const completedUsers = JSON.parse(
      localStorage.getItem(ONBOARDING_COMPLETE_KEY) || "{}"
    );
    completedUsers[user.id] = true;
    localStorage.setItem(ONBOARDING_COMPLETE_KEY, JSON.stringify(completedUsers));
    
    setShowOnboarding(false);
    setIsCompleting(false);
  }, [user]);

  const resetOnboarding = useCallback(() => {
    if (!user) return;
    
    // Remove onboarding complete flag for this user (useful for testing)
    const completedUsers = JSON.parse(
      localStorage.getItem(ONBOARDING_COMPLETE_KEY) || "{}"
    );
    delete completedUsers[user.id];
    localStorage.setItem(ONBOARDING_COMPLETE_KEY, JSON.stringify(completedUsers));
    
    setShowOnboarding(true);
  }, [user]);

  return {
    showOnboarding,
    isCompleting,
    completeOnboarding,
    resetOnboarding,
  };
}
