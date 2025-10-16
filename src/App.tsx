import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Employees from "./pages/Employees";
import Attendance from "./pages/Attendance";
import Leave from "./pages/Leave";
import Payroll from "./pages/Payroll";
import Reports from "./pages/Reports";
import Profile from "./pages/Profile";
import Inbox from "./pages/Inbox";
import Calendar from "./pages/Calendar";
import Todos from "./pages/Todos";
import Jobs from "./pages/Jobs";
import Candidates from "./pages/Candidates";
import CareerSite from "./pages/CareerSite";
import Timesheet from "./pages/Timesheet";
import Structure from "./pages/Structure";
import Meeting from "./pages/Meeting";
import Settings from "./pages/Settings";
import HelpCentre from "./pages/HelpCentre";
import Announcements from "./pages/Announcements";
import Tripets from "./pages/Tripets";
import DashboardLayout from "./components/dashboard/DashboardLayout";
import ProtectedRoute from "./components/auth/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="employees" element={<Employees />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="leave" element={<Leave />} />
          <Route path="payroll" element={<Payroll />} />
          <Route path="reports" element={<Reports />} />
          <Route path="profile" element={<Profile />} />
          <Route path="inbox" element={<Inbox />} />
          <Route path="calendar" element={<Calendar />} />
          <Route path="todos" element={<Todos />} />
          <Route path="jobs" element={<Jobs />} />
          <Route path="candidates" element={<Candidates />} />
          <Route path="career-site" element={<CareerSite />} />
          <Route path="timesheet" element={<Timesheet />} />
          <Route path="structure" element={<Structure />} />
          <Route path="meeting" element={<Meeting />} />
          <Route path="settings" element={<Settings />} />
          <Route path="help-centre" element={<HelpCentre />} />
          <Route path="announcements" element={<Announcements />} />
          <Route path="tripets" element={<Tripets />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
