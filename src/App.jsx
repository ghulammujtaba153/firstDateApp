import { BrowserRouter, Routes, Route } from "react-router-dom";
import './App.css'
import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
import EmailVerification from "./pages/EmailVerification";
import OnBoarding from "./pages/OnBoarding";
import PartnerPreferences from "./pages/PartnerPreferences";
import ForgetPassword from "./pages/ForgetPassword";
import OTP from "./pages/OTP";
import ResetPassword from "./pages/ResetPassword";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Example route */}
        <Route path="/home" element={<Home/>} />
        <Route path="/" element={<Register/>} />
        <Route path="/login" element={<Login/>} />
        <Route path="/forget-password" element={<ForgetPassword/>} />
        <Route path="/forget-password/otp" element={<OTP/>} />
        <Route path="/forget-password/reset-password" element={<ResetPassword/>} />
        <Route path="/email-verification" element={<EmailVerification/>} />
        <Route path="/onboarding" element={<OnBoarding/>} />
        <Route path="/onboarding/partner-preferences" element={<PartnerPreferences/>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App;
