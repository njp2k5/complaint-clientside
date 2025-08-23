import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import LoginSelection from "./pages/LoginSelection";
import StudentLogin from "./pages/StudentLogin";
import AdminLogin from "./pages/AdminLogin";
import StudentDashboard from "./pages/StudentDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import SubmitComplaint from "./pages/SubmitComplaint";
import MyComplaints from "./pages/MyComplaints";
import AdminComplaints from "./pages/AdminComplaints";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const userType = localStorage.getItem('userType') as 'student' | 'admin' | null;
  const userName = localStorage.getItem('userName') || 'User';

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Layout><LoginSelection /></Layout>} />
            <Route path="/student/login" element={<Layout><StudentLogin /></Layout>} />
            <Route path="/admin/login" element={<Layout><AdminLogin /></Layout>} />
            
            {/* Student Routes */}
            <Route path="/student/dashboard" element={<Layout userType="student" userName={userName}><StudentDashboard /></Layout>} />
            <Route path="/student/complaints/new" element={<Layout userType="student" userName={userName}><SubmitComplaint /></Layout>} />
            <Route path="/student/complaints" element={<Layout userType="student" userName={userName}><MyComplaints /></Layout>} />
            
            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={<Layout userType="admin" userName={userName}><AdminDashboard /></Layout>} />
            <Route path="/admin/complaints" element={<Layout userType="admin" userName={userName}><AdminComplaints /></Layout>} />
            
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
