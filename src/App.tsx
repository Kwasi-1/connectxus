
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Landing from "./pages/Landing";
import { AuthPage } from "@/pages/auth/AuthPage";
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
import NotFound from "./pages/NotFound";
import Search from "./pages/explore/Search";
import About from "./pages/public/About";
import Terms from "./pages/public/Terms";
import Privacy from "./pages/public/Privacy";
import Contact from "./pages/public/Contact";
import Download from "./pages/public/Download";
import Help from "./pages/public/Help";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes - not protected */}
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/about" element={<About />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/download" element={<Download />} />
            <Route path="/help" element={<Help />} />
            
            {/* Protected routes - require authentication */}
            <Route path="/feed" element={
              <ProtectedRoute>
                <Feed />
              </ProtectedRoute>
            } />
            <Route path="/compose" element={
              <ProtectedRoute>
                <Compose />
              </ProtectedRoute>
            } />
            <Route path="/post/:postId" element={
              <ProtectedRoute>
                <PostView />
              </ProtectedRoute>
            } />
            <Route path="/profile/:userId" element={
              <ProtectedRoute>
                <UserProfile />
              </ProtectedRoute>
            } />
            <Route path="/search" element={
              <ProtectedRoute>
                <Search />
              </ProtectedRoute>
            } />
            <Route path="/explore" element={
              <ProtectedRoute>
                <Explore />
              </ProtectedRoute>
            } />
            <Route path="/notifications" element={
              <ProtectedRoute>
                <Notifications />
              </ProtectedRoute>
            } />
            <Route path="/messages" element={
              <ProtectedRoute>
                <Messages />
              </ProtectedRoute>
            } />
            <Route path="/hub" element={
              <ProtectedRoute>
                <Hub />
              </ProtectedRoute>
            } />
            <Route path="/communities" element={
              <ProtectedRoute>
                <Communities />
              </ProtectedRoute>
            } />
            <Route path="/communities/:id" element={
              <ProtectedRoute>
                <CommunityDetail />
              </ProtectedRoute>
            } />
            <Route path="/groups" element={
              <ProtectedRoute>
                <GroupsNew />
              </ProtectedRoute>
            } />
            <Route path="/groups/:id" element={
              <ProtectedRoute>
                <GroupDetail />
              </ProtectedRoute>
            } />
            <Route path="/tutoring" element={
              <ProtectedRoute>
                <Tutoring />
              </ProtectedRoute>
            } />
            <Route path="/tutoring/become-tutor" element={
              <ProtectedRoute>
                <BecomeTutor />
              </ProtectedRoute>
            } />
            <Route path="/mentors" element={
              <ProtectedRoute>
                <Mentors />
              </ProtectedRoute>
            } />
            <Route path="/mentors/become-mentor" element={
              <ProtectedRoute>
                <BecomeMentor />
              </ProtectedRoute>
            } />
            <Route path="/account" element={
              <ProtectedRoute>
                <Account />
              </ProtectedRoute>
            } />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
