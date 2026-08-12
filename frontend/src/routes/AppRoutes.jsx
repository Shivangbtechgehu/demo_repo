import { Route, Routes } from 'react-router-dom'
import MainLayout from '../components/layout/MainLayout'
import ProtectedRoute from './ProtectedRoute'
import Dashboard from '../pages/Dashboard'
import Home from '../pages/Home'
import Login from '../pages/Login'
import NotFound from '../pages/NotFound'
import Register from '../pages/Register'
import VerifyRegisterOtp from '../pages/VerifyRegisterOtp'
import VerifyLoginOtp from '../pages/VerifyLoginOtp'
import Profile from '../pages/Profile'
import CareerGoals from '../pages/CareerGoals'
import Skills from '../pages/Skills'
import GapAnalysis from '../pages/GapAnalysis'
import Roadmap from '../pages/Roadmap'
import Progress from '../pages/Progress'
import MentorDashboard from '../pages/MentorDashboard'
import ProjectPlanner from '../pages/ProjectPlanner'
import AdminDashboard from '../pages/AdminDashboard'
import Notifications from '../pages/Notifications'
import AuditLogs from '../pages/AuditLogs'

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-register-otp" element={<VerifyRegisterOtp />} />
        <Route path="/verify-login-otp" element={<VerifyLoginOtp />} />

        {/* Protected routes — all authenticated users */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/goals" element={<CareerGoals />} />
          <Route path="/skills" element={<Skills />} />
          <Route path="/gap-analysis" element={<GapAnalysis />} />
          <Route path="/roadmap" element={<Roadmap />} />
          <Route path="/progress" element={<Progress />} />
          {/* Mentor-only */}
          <Route path="/mentor" element={<MentorDashboard />} />
          {/* Project Planner */}
          <Route path="/projects" element={<ProjectPlanner />} />
          {/* Admin only */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/audit-logs" element={<AuditLogs />} />
          {/* Notifications */}
          <Route path="/notifications" element={<Notifications />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
