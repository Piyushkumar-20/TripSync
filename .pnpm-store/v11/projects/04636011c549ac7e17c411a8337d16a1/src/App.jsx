import { Navigate, Route, Routes, useLocation } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import LandingPage from "@/pages/LandingPage"
import DocsPage from "@/pages/DocsPage"
import ForgotPasswordPage from "@/pages/ForgotPasswordPage"
import ResetPasswordPage from "@/pages/ResetPasswordPage"
import VerifyEmailPage from "@/pages/VerifyEmailPage"
import CheckEmailPage from "@/pages/CheckEmailPage"
import LoginPage from "@/pages/LoginPage"
import RegisterPage from "@/pages/RegisterPage"
import DashboardPage from "@/pages/DashboardPage"
import TripsPage from "@/pages/TripsPage"
import TripDetailsPage from "@/pages/TripDetailsPage"
import DestinationActivitiesPage from "@/pages/DestinationActivitiesPage"
import MembersPage from "@/pages/MembersPage"
import InvitationPage from "@/pages/InvitationPage"
import ShareInvitePage from "@/pages/ShareInvitePage"
import SubscriptionPage from "@/pages/SubscriptionPage"
import SettingsPage from "@/pages/SettingsPage"
import ChecklistsPage from "@/pages/ChecklistsPage"
import CommentsPage from "@/pages/CommentsPage"
import MainLayout from "@/layouts/MainLayout"

function ProtectedRoute({ children }) {
  const location = useLocation()
  const { user, loading } = useAuth()
  if (loading) return null
  return user ? children : <Navigate to="/login" replace state={{ from: location }} />
}

function GuestRoute({ children }) {
  const location = useLocation()
  const { user, loading } = useAuth()
  if (loading) return null
  return user ? <Navigate to={location.state?.from?.pathname ?? "/dashboard"} replace /> : children
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/docs" element={<DocsPage />} />
      <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
      <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />
      <Route path="/signup" element={<GuestRoute><RegisterPage /></GuestRoute>} />
      <Route path="/check-email" element={<GuestRoute><CheckEmailPage /></GuestRoute>} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
      <Route path="/verify-email/:token" element={<VerifyEmailPage />} />

      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/trips" element={<TripsPage />} />
        <Route path="/trips/:tripId" element={<TripDetailsPage />} />
        <Route path="/trips/:tripId/comments" element={<CommentsPage />} />
        <Route path="/trips/:tripId/checklists" element={<ChecklistsPage />} />
        <Route path="/trips/:tripId/destinations/:destinationId/activities" element={<DestinationActivitiesPage />} />
        <Route path="/members" element={<MembersPage />} />
        <Route path="/invite/:token" element={<ShareInvitePage />} />
        <Route path="/invitations/:token" element={<InvitationPage />} />
        <Route path="/subscription" element={<SubscriptionPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  )
}
