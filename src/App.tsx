import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { PublicRoute } from "@/components/auth/PublicRoute";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { LandingPage } from "@/LandingPage";
import Feed from "./pages/client/feed/Feed";
import PostView from "./pages/client/feed/PostView";
import PostInteractions from "./pages/client/feed/PostInteractions";
import Explore from "./pages/client/explore/Explore";
import { People } from "./pages/client/people/People";
import HighlightStories from "./pages/client/stories/HighlightStories";
import Notifications from "./pages/client/notifications/Notifications";
import Messages from "./pages/client/messages/Messages";
import Hub from "./pages/client/groups_and_communities/hub/Hub";
import Communities from "./pages/client/groups_and_communities/communities/Communities";
import CommunityDetail from "./pages/client/groups_and_communities/communities/CommunityDetail";
import GroupsNew from "./pages/client/groups_and_communities/groups/GroupsNew";
import GroupDetail from "./pages/client/groups_and_communities/groups/GroupDetail";
import Tutoring from "./pages/client/tutoring/Tutoring";
import MonetizationDetails from "./pages/client/tutoring/MonetizationDetails";
import { TutorDetails } from "./pages/client/tutoring/TutorDetails";
import HelpRequests from "./pages/client/help/HelpRequests";
import HelpRequestDetails from "./pages/client/help/HelpRequestDetails";
import PostHelpRequest from "./pages/client/help/PostHelpRequest";
import EditHelpRequest from "./pages/client/help/EditHelpRequest";
import Account from "./pages/client/account/Account";
import UserProfile from "./pages/client/profile/UserProfile";
import Compose from "./pages/client/feed/Compose";
import BecomeTutor from "./pages/client/applications/BecomeTutor";
import Search from "./pages/client/explore/Search";
import About from "./pages/public/About";
import Terms from "./pages/public/Terms";
import Privacy from "./pages/public/Privacy";
import Cookies from "./pages/public/Cookies";
import Contact from "./pages/public/Contact";
import Download from "./pages/public/Download";
import NotFound from "./pages/NotFound";
import { AuthPage } from "./pages/auth/AuthPage";
import { VerifyEmailPage } from "./pages/auth/VerifyEmailPage";
import { GoogleOnboardingPage } from "./pages/auth/GoogleOnboardingPage";
import { ForgotPasswordPage } from "./pages/auth/ForgotPasswordPage";
import { ResetPasswordPage } from "./pages/auth/ResetPasswordPage";
import { AdminAuthProvider } from "@/contexts/AdminAuthContext";
import { AdminSpaceProvider } from "@/contexts/AdminSpaceContext";
import { ProtectedAdminRoute } from "@/components/admin/ProtectedAdminRoute";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminDashboard } from "@/pages/admin/AdminDashboard";
import { UserManagement } from "@/pages/admin/UserManagement";
import { ContentManagement } from "@/pages/admin/ContentManagement";
import { AdminManagement } from "./pages/admin/AdminManagement";
import { Reports } from "./pages/admin/Reports";
import { AdminTutoring } from "./pages/admin/AdminTutoring";
import { CommunitiesGroups } from "./pages/admin/CommunitiesGroups";
import { SystemSettings } from "./pages/admin/SystemSettings";
import { Notifications as AdminNotifications } from "./pages/admin/Notifications";
import SpaceActivities from "./pages/admin/SpaceActivities";
import { Analytics } from "./pages/admin/Analytics";
import { TutoringBusinessOverview } from "./pages/admin/tutoring-business/TutoringBusinessOverview";
import { TutoringBusinessTransactions } from "./pages/admin/tutoring-business/TutoringBusinessTransactions";
import { TutoringBusinessPayouts } from "./pages/admin/tutoring-business/TutoringBusinessPayouts";
import { TutoringBusinessPayoutSchedule } from "./pages/admin/tutoring-business/TutoringBusinessPayoutSchedule";
import { TutoringBusinessDisputes } from "./pages/admin/tutoring-business/TutoringBusinessDisputes";
import { TutoringBusinessAnalytics } from "./pages/admin/tutoring-business/TutoringBusinessAnalytics";
import { HeroUIProvider } from "@heroui/react";
import { LandingPage as LandingPageV2 } from "@/LandingPageV2";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <HeroUIProvider>
      <TooltipProvider>
        <AdminAuthProvider>
          <AuthProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                {/* Public Routes */}
                <Route
                  path="/"
                  element={
                    <PublicRoute>
                      <LandingPageV2 />
                    </PublicRoute>
                  }
                />
                {/* <Route
                  path="/landing"
                  element={
                    <PublicRoute>
                      <LandingPageV2 />
                    </PublicRoute>
                  }
                /> */}
                <Route path="/about" element={<About />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/cookies" element={<Cookies />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/download" element={<Download />} />
                <Route
                  path="auth/signup"
                  element={<AuthPage initialMode="signUp" />}
                />
                <Route
                  path="auth/signin"
                  element={<AuthPage initialMode="signIn" />}
                />
                <Route path="/verify-email" element={<VerifyEmailPage />} />
                <Route
                  path="/auth/google-onboarding"
                  element={<GoogleOnboardingPage />}
                />
                <Route
                  path="/auth/forgot-password"
                  element={<ForgotPasswordPage />}
                />
                <Route
                  path="/auth/reset-password"
                  element={<ResetPasswordPage />}
                />

                {/* Protected Routes */}
                <Route
                  path="/feed"
                  element={
                    <ProtectedRoute>
                      <Feed />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/compose"
                  element={
                    <ProtectedRoute>
                      <Compose />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/campus-highlights"
                  element={
                    <ProtectedRoute>
                      <HighlightStories />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/post/:postId"
                  element={
                    <ProtectedRoute>
                      <PostView />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/post/:postId/interactions"
                  element={
                    <ProtectedRoute>
                      <PostInteractions />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile/:username"
                  element={
                    <ProtectedRoute>
                      <UserProfile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/search"
                  element={
                    <ProtectedRoute>
                      <Search />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/explore"
                  element={
                    <ProtectedRoute>
                      <Explore />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/people"
                  element={
                    <ProtectedRoute>
                      <People />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/notifications"
                  element={
                    <ProtectedRoute>
                      <Notifications />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/messages"
                  element={
                    <ProtectedRoute>
                      <Messages />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/messages/:conversationId"
                  element={
                    <ProtectedRoute>
                      <Messages />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/hub"
                  element={
                    <ProtectedRoute>
                      <Hub />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/communities"
                  element={
                    <ProtectedRoute>
                      <Communities />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/communities/:id"
                  element={
                    <ProtectedRoute>
                      <CommunityDetail />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/groups"
                  element={
                    <ProtectedRoute>
                      <GroupsNew />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/groups/:id"
                  element={
                    <ProtectedRoute>
                      <GroupDetail />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/tutoring"
                  element={
                    <ProtectedRoute>
                      <Tutoring />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/tutoring/become-tutor"
                  element={
                    <ProtectedRoute>
                      <BecomeTutor />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/tutoring/monetization/:serviceId"
                  element={
                    <ProtectedRoute>
                      <MonetizationDetails />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/tutoring/:tutorId"
                  element={
                    <ProtectedRoute>
                      <TutorDetails />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/help"
                  element={
                    <ProtectedRoute>
                      <HelpRequests />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/help/new"
                  element={
                    <ProtectedRoute>
                      <PostHelpRequest />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/help/edit/:id"
                  element={
                    <ProtectedRoute>
                      <EditHelpRequest />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/help/:id"
                  element={
                    <ProtectedRoute>
                      <HelpRequestDetails />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/account"
                  element={
                    <ProtectedRoute>
                      <Account />
                    </ProtectedRoute>
                  }
                />

                {/* Admin Routes */}
                <Route
                  path="/admin/*"
                  element={
                    <AdminSpaceProvider>
                      <ProtectedAdminRoute>
                        <AdminLayout>
                          <Routes>
                            <Route index element={<AdminDashboard />} />
                            <Route
                              path="users"
                              element={
                                <ProtectedAdminRoute requiredPermission="user_management">
                                  <UserManagement />
                                </ProtectedAdminRoute>
                              }
                            />
                            <Route
                              path="content"
                              element={
                                <ProtectedAdminRoute requiredPermission="content_management">
                                  <ContentManagement />
                                </ProtectedAdminRoute>
                              }
                            />
                            <Route
                              path="communities"
                              element={
                                <ProtectedAdminRoute requiredPermission="community_management">
                                  <CommunitiesGroups />
                                </ProtectedAdminRoute>
                              }
                            />
                            <Route
                              path="tutoring"
                              element={
                                <ProtectedAdminRoute requiredPermission="tutoring_management">
                                  <AdminTutoring />
                                </ProtectedAdminRoute>
                              }
                            />
                            <Route
                              path="tutoring-business"
                              element={
                                <ProtectedAdminRoute requiredPermission="tutoring_management">
                                  <TutoringBusinessOverview />
                                </ProtectedAdminRoute>
                              }
                            />
                            <Route
                              path="tutoring-business/transactions"
                              element={
                                <ProtectedAdminRoute requiredPermission="tutoring_management">
                                  <TutoringBusinessTransactions />
                                </ProtectedAdminRoute>
                              }
                            />
                            <Route
                              path="tutoring-business/payouts"
                              element={
                                <ProtectedAdminRoute requiredPermission="tutoring_management">
                                  <TutoringBusinessPayouts />
                                </ProtectedAdminRoute>
                              }
                            />
                            <Route
                              path="tutoring-business/payout-schedule"
                              element={
                                <ProtectedAdminRoute requiredPermission="tutoring_management">
                                  <TutoringBusinessPayoutSchedule />
                                </ProtectedAdminRoute>
                              }
                            />
                            <Route
                              path="tutoring-business/disputes"
                              element={
                                <ProtectedAdminRoute requiredPermission="tutoring_management">
                                  <TutoringBusinessDisputes />
                                </ProtectedAdminRoute>
                              }
                            />
                            <Route
                              path="tutoring-business/analytics"
                              element={
                                <ProtectedAdminRoute requiredPermission="tutoring_management">
                                  <TutoringBusinessAnalytics />
                                </ProtectedAdminRoute>
                              }
                            />
                            <Route
                              path="activities"
                              element={<SpaceActivities />}
                            />
                            <Route path="analytics" element={<Analytics />} />
                            <Route
                              path="reports"
                              element={
                                <ProtectedAdminRoute requiredPermission="reports">
                                  <Reports />
                                </ProtectedAdminRoute>
                              }
                            />
                            <Route
                              path="notifications"
                              element={
                                <ProtectedAdminRoute requiredPermission="notifications">
                                  <AdminNotifications />
                                </ProtectedAdminRoute>
                              }
                            />
                            <Route
                              path="admins"
                              element={
                                <ProtectedAdminRoute requiredPermission="admin_management">
                                  <AdminManagement />
                                </ProtectedAdminRoute>
                              }
                            />
                            <Route
                              path="settings"
                              element={
                                <ProtectedAdminRoute requiredPermission="system_settings">
                                  <SystemSettings />
                                </ProtectedAdminRoute>
                              }
                            />
                          </Routes>
                        </AdminLayout>
                      </ProtectedAdminRoute>
                    </AdminSpaceProvider>
                  }
                />

                {/* Catch-all route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </AuthProvider>
        </AdminAuthProvider>
      </TooltipProvider>
    </HeroUIProvider>
  </QueryClientProvider>
);

export default App;
