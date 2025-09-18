import { BrowserRouter, Routes, Route } from "react-router-dom";
import './App.css'
import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
import EmailVerification from "./pages/EmailVerification";
import OnBoarding from "./pages/OnBoarding";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Example route */}
        <Route path="/home" element={<Home/>} />
        <Route path="/" element={<Register/>} />
        <Route path="/login" element={<Login/>} />
        <Route path="/email-verification" element={<EmailVerification/>} />
        <Route path="/onboarding" element={<OnBoarding/>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App;
