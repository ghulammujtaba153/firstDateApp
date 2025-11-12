import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
import EmailVerification from "./pages/EmailVerification";
import OnBoarding from "./pages/OnBoarding";
import PartnerPreferences from "./pages/PartnerPreferences";
import ForgetPassword from "./pages/ForgetPassword";
import OTP from "./pages/OTP";
import ResetPassword from "./pages/ResetPassword";
import DashboardLayout from "./layout/DashboardLayout";
import Privacy from "./pages/dashboard/Privacy";
import Matches from "./pages/dashboard/Matches";
import MatchDetail from "./pages/dashboard/MatchDetail";
import Events from "./pages/dashboard/Events";
import Settings from "./pages/dashboard/Settings";
import Profile from "./pages/dashboard/Profile";
import Subscription from "./pages/dashboard/Subscription";
import Chats from "./pages/dashboard/Chats";
import FaceVerification from "./pages/FaceVerification";
import VideoCall from "./pages/dashboard/VideoCall";
import HomePage from "./pages/dashboard/call/HomePage";
import VideoCallPage from "./pages/dashboard/call/VideoCallPage";
import WaitingRoomPage from "./pages/dashboard/call/WaitingRoomPage";
import CreateCallPage from "./pages/dashboard/call/CreateCallPage";
import JoinCallPage from "./pages/dashboard/call/JoinCallPage";
import SettingsPage from "./pages/dashboard/call/SettingsPage";
import ProtectedRoute from "./components/ProtectedRoutes";
import UserRoutes from "./components/UserRoutes";
import GoogleAuth from "./pages/GoogleAuth";
import FreeScreenProtectedRoutes from "./components/FreeScreenProtectedRoutes";
import FaceTryVerification from "./pages/FaceTryVerification";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* route */}

        <Route path="/" element={<UserRoutes />} />
        <Route path="/verification" element={<FaceVerification />} />
        <Route path="/try-verification" element={<FaceTryVerification />} />

        {/* Onboarding routes - accessible to authenticated users who haven't completed onboarding */}
        <Route path="/onboarding" element={<OnBoarding />} />
        <Route path="/onboarding/partner-preferences" element={<PartnerPreferences />} />

        <Route element={<FreeScreenProtectedRoutes />}>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />


          <Route path="/forget-password" element={<ForgetPassword />} />
          <Route path="/forget-password/otp" element={<OTP />} />

          <Route
            path="/forget-password/reset-password"
            element={<ResetPassword />}
          />
          <Route path="/email-verification" element={<EmailVerification />} />

          <Route path="/google-auth" element={<GoogleAuth />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route path="/video-call" element={<HomePage />} />
          <Route path="/join" element={<JoinCallPage />} />
          <Route path="/create" element={<CreateCallPage />} />
          <Route path="/waiting" element={<WaitingRoomPage />} />
          <Route path="/call" element={<VideoCallPage />} />
          <Route path="/settings" element={<SettingsPage />} />

          <Route
            path="/dashboard"
            element={
              <DashboardLayout>
                <Home />
              </DashboardLayout>
            }
          />



          <Route
            path="/dashboard/chats"
            element={
              <DashboardLayout>
                <Chats />
              </DashboardLayout>
            }
          />




          <Route
            path="/dashboard/privacy-policy"
            element={
              <DashboardLayout>
                <Privacy />
              </DashboardLayout>
            }
          />

          <Route
            path="/dashboard/matches"
            element={
              <DashboardLayout>
                <Matches />
              </DashboardLayout>
            }
          />

          <Route
            path="/dashboard/matches/:id"
            element={
              <DashboardLayout>
                <MatchDetail />
              </DashboardLayout>
            }
          />

          <Route
            path="/dashboard/events"
            element={
              <DashboardLayout>
                <Events />
              </DashboardLayout>
            }
          />

          <Route
            path="/dashboard/Settings"
            element={
              <DashboardLayout>
                <Settings />
              </DashboardLayout>
            }
          />


          <Route
            path="/dashboard/profile"
            element={
              <DashboardLayout>
                <Profile />
              </DashboardLayout>
            }
          />

          <Route
            path="/dashboard/subscriptions"
            element={
              <DashboardLayout>
                <Subscription />
              </DashboardLayout>
            }
          />

        </Route>




      </Routes>
    </BrowserRouter>
  );
}

export default App;
