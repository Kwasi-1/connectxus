import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { PublicRoute } from "@/components/auth/PublicRoute";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { LandingPage } from "@/LandingPage";
import Feed from "./pages/feed/Feed";
import PostView from "./pages/feed/PostView";
import Explore from "./pages/explore/Explore";
import Notifications from "./pages/notifications/Notifications";
import Messages from "./pages/messages/Messages";
import Hub from "./pages/groups_and_communities/hub/Hub";
import Communities from "./pages/groups_and_communities/communities/Communities";
import CommunityDetail from "./pages/groups_and_communities/communities/CommunityDetail";
import GroupsNew from "./pages/groups_and_communities/groups/GroupsNew";
import GroupDetail from "./pages/groups_and_communities/groups/GroupDetail";
import Tutoring from "./pages/tutoring/Tutoring";
import Mentors from "./pages/mentors/Mentors";
import Account from "./pages/account/Account";
import UserProfile from "./pages/profile/UserProfile";
import Compose from "./pages/feed/Compose";
import BecomeTutor from "./pages/applications/BecomeTutor";
import BecomeMentor from "./pages/applications/BecomeMentor";
import Search from "./pages/explore/Search";
import About from "./pages/public/About";
import Terms from "./pages/public/Terms";
import Privacy from "./pages/public/Privacy";
import Cookies from "./pages/public/Cookies";
import Contact from "./pages/public/Contact";
import Download from "./pages/public/Download";
import NotFound from "./pages/NotFound";
import { AuthPage } from "./pages/auth/AuthPage";
import { AdminAuthProvider } from "@/contexts/AdminAuthContext";
import { ProtectedAdminRoute } from "@/components/admin/ProtectedAdminRoute";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminDashboard } from "@/pages/admin/AdminDashboard";
import { UserManagement } from "@/pages/admin/UserManagement";
import { ContentManagement } from "@/pages/admin/ContentManagement";
import { AdminManagement } from "./pages/admin/AdminManagement";
import { Reports } from "./pages/admin/Reports";
import { Analytics } from "./pages/admin/Analytics";
import { TutoringMentorship } from "./pages/admin/TutoringMentorship";
import { CommunitiesGroups } from "./pages/admin/CommunitiesGroups";
import { SystemSettings } from "./pages/admin/SystemSettings";
import {Notifications as AdminNotifications } from "./pages/admin/Notifications";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
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
                  <LandingPage />
                </PublicRoute>
              }
            />
            <Route path="/about" element={<About />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/cookies" element={<Cookies />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/download" element={<Download />} />
            <Route path='auth/signup' element={<AuthPage initialMode='signUp' />} />
            <Route path='auth/signin' element={<AuthPage initialMode='signIn' />} />

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
              path="/post/:postId"
              element={
                <ProtectedRoute>
                  <PostView />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile/:userId"
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
              path="/mentors"
              element={
                <ProtectedRoute>
                  <Mentors />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mentors/become-mentor"
              element={
                <ProtectedRoute>
                  <BecomeMentor />
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
            <Route path="/admin/*" element={
              <ProtectedAdminRoute>
                <AdminLayout>
                  <Routes>
                    <Route index element={<AdminDashboard />} />
                    <Route path="users" element={<ProtectedAdminRoute requiredPermission="user_management"><UserManagement /></ProtectedAdminRoute>} />
                    <Route path="content" element={<ProtectedAdminRoute requiredPermission="content_management"><ContentManagement /></ProtectedAdminRoute>} />
                    <Route path="communities" element={<ProtectedAdminRoute requiredPermission="community_management"><CommunitiesGroups /></ProtectedAdminRoute>} />
                    <Route path="tutoring" element={<ProtectedAdminRoute requiredPermission="tutoring_management"><TutoringMentorship /></ProtectedAdminRoute>} />
                    <Route path="analytics" element={<ProtectedAdminRoute requiredPermission="analytics"><Analytics /></ProtectedAdminRoute>} />
                    <Route path="reports" element={<ProtectedAdminRoute requiredPermission="reports"><Reports /></ProtectedAdminRoute>} />
                    <Route path="notifications" element={<ProtectedAdminRoute requiredPermission="notifications"><AdminNotifications /></ProtectedAdminRoute>} />
                    <Route path="admins" element={<ProtectedAdminRoute requiredPermission="admin_management"><AdminManagement /></ProtectedAdminRoute>} />
                    <Route path="settings" element={<ProtectedAdminRoute requiredPermission="system_settings"><SystemSettings /></ProtectedAdminRoute>} />
                  </Routes>
                </AdminLayout>
              </ProtectedAdminRoute>
            } />

            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
      </AdminAuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
