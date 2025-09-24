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
import PrivacyPolicy from "./pages/dashboard/PrivacyPolicy";
import Matches from "./pages/dashboard/Matches";
import Events from "./pages/dashboard/Events";
import Settings from "./pages/dashboard/Settings";
import Profile from "./pages/dashboard/Profile";
import Subscription from "./pages/dashboard/Subscription";
import Chats from "./pages/dashboard/Chats";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Example route */}

        <Route path="/" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forget-password" element={<ForgetPassword />} />
        <Route path="/forget-password/otp" element={<OTP />} />
        <Route
          path="/forget-password/reset-password"
          element={<ResetPassword />}
        />
        <Route path="/email-verification" element={<EmailVerification />} />
        <Route path="/onboarding" element={<OnBoarding />} />
        <Route
          path="/onboarding/partner-preferences"
          element={<PartnerPreferences />}
        />

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
              <PrivacyPolicy />
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
      </Routes>
    </BrowserRouter>
  );
}

export default App;
