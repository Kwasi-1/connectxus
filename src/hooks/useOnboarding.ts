import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getCurrentUser } from "@/api/users.api";

const ONBOARDING_STORAGE_KEY = "campus_connect_onboarding_completed";

interface OnboardingState {
  showOnboarding: boolean;
  isCompleting: boolean;
  isLoading: boolean;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
}

/**
 * Hook to manage onboarding state using existing backend data
 * No backend changes required - uses user profile data to determine status
 * 
 * Onboarding is shown only if:
 * 1. User is not following anyone (following_count === 0)
 * 2. User hasn't explicitly completed onboarding (stored in localStorage)
 * 
 * This ensures cross-platform consistency because following_count 
 * is synced across devices via the backend.
 */
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
        
        // Get locally stored completion state
        const completedUsers = JSON.parse(
          localStorage.getItem(ONBOARDING_STORAGE_KEY) || "{}"
        );
        const hasCompletedLocally = completedUsers[user.id] === true;
        
        // Fetch full user profile to get following count
        const userProfile = await getCurrentUser();
        const followingCount = userProfile.following_count || 0;
        
        // Show onboarding only if:
        // 1. User hasn't completed it locally AND
        // 2. User is not following anyone (indicates first-time user)
        // 
        // Note: Once user follows someone, onboarding won't show again
        // even on new devices because following_count syncs via backend
        const shouldShow = !hasCompletedLocally && followingCount === 0;
        
        setShowOnboarding(shouldShow);
      } catch (error) {
        console.error("Error checking onboarding status:", error);
        setShowOnboarding(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkOnboardingStatus();
  }, [user]);

  const completeOnboarding = useCallback(() => {
    if (!user || isCompleting) return;
    
    setIsCompleting(true);
    
    try {
      // Mark onboarding as complete for this user
      const completedUsers = JSON.parse(
        localStorage.getItem(ONBOARDING_STORAGE_KEY) || "{}"
      );
      completedUsers[user.id] = true;
      localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(completedUsers));
      
      setShowOnboarding(false);
    } catch (error) {
      console.error("Error completing onboarding:", error);
    } finally {
      setIsCompleting(false);
    }
  }, [user, isCompleting]);

  const resetOnboarding = useCallback(() => {
    if (!user) return;
    
    // Remove local completion flag (useful for testing)
    const completedUsers = JSON.parse(
      localStorage.getItem(ONBOARDING_STORAGE_KEY) || "{}"
    );
    delete completedUsers[user.id];
    localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(completedUsers));
    
    setShowOnboarding(true);
  }, [user]);

  return {
    showOnboarding,
    isCompleting,
    isLoading,
    completeOnboarding,
    resetOnboarding,
  };
}
