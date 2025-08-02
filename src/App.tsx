
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/feed/Index";
import PostView from "./pages/feed/PostView";
import Explore from "./pages/explore/Explore";
import Notifications from "./pages/notifications/Notifications";
import Messages from "./pages/messages/Messages";
import Groups from "./pages/groups/Groups";
import Tutoring from "./pages/tutoring/Tutoring";
import Mentors from "./pages/mentors/Mentors";
import Account from "./pages/account/Account";
import Compose from "./pages/feed/Compose";
import BecomeTutor from "./pages/applications/BecomeTutor";
import BecomeMentor from "./pages/applications/BecomeMentor";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/compose" element={<Compose />} />
          <Route path="/post/:postId" element={<PostView />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/groups" element={<Groups />} />
          <Route path="/tutoring" element={<Tutoring />} />
          <Route path="/tutoring/become-tutor" element={<BecomeTutor />} />
          <Route path="/mentors" element={<Mentors />} />
          <Route path="/mentors/become-mentor" element={<BecomeMentor />} />
          <Route path="/account" element={<Account />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
