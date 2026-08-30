import React, { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import { Routes, Route, useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import About from "./components/About";
import Services from "./components/Services";
import Doctors from "./components/Doctors";
import CTA from "./components/CTA";
import Footer from "./components/Footer";
import AISymptomChecker from "./components/AISymptomChecker";
import DietPlanner from "./components/DietPlanner";
import PharmacyLocator from "./components/PharmacyLocator";
import Login from "./components/Login";
import VideoConsultation from "./components/VideoConsultation";
import PatientProfile from "./components/PatientProfile";

import DoctorDashboard from "./components/DoctorDashboard";
import AdminDashboard from "./components/AdminDashboard";
import AIChatbot from "./components/AIChatbot";
import ProtectedRoute from "./components/ProtectedRoute";

function PatientHome() {
  const navigate = useNavigate();
  const [chatbotPrompt, setChatbotPrompt] = React.useState('');
  return (
    <>
      <Navbar />
      <Hero />
      <div data-aos="fade-up"><About /></div>
      <div data-aos="fade-up">
        <Services 
          onAiClick={() => setChatbotPrompt('Check my symptoms')} 
          onDietClick={() => setChatbotPrompt('Create a diet plan')}
          onPharmacyClick={() => navigate('/pharmacy-locator')}
          onVideoConsultationClick={() => navigate('/video-consultation')}
          onMedicalRecordsClick={() => navigate('/profile')}
        />
      </div>
      <div data-aos="fade-up"><Doctors /></div>
      <div data-aos="fade-up"><CTA /></div>
      <div data-aos="fade-up"><Footer /></div>
      <AIChatbot 
        context={{ page: 'home', userRole: 'patient' }} 
        initialPrompt={chatbotPrompt} 
        onClosePrompt={() => setChatbotPrompt('')}
      />
    </>
  );
}

export default function App() {
  const { user } = useAuth();

  useEffect(() => {
    AOS.init({
      duration: 1000,
      easing: "ease-in-out",
      once: true,
    });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 text-slate-800 scroll-smooth">
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Admin Routes */}
        <Route path="/admin/*" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        
        {/* Doctor Routes */}
        <Route path="/doctor/*" element={
          <ProtectedRoute allowedRoles={['doctor']}>
            <DoctorDashboard />
          </ProtectedRoute>
        } />
        
        {/* Patient Routes */}
        <Route path="/" element={
          <ProtectedRoute allowedRoles={['patient']}>
            <PatientHome />
          </ProtectedRoute>
        } />
        <Route path="/ai-symptom-checker" element={
          <ProtectedRoute allowedRoles={['patient']}>
            <AISymptomChecker onBackHome={() => window.history.back()} />
          </ProtectedRoute>
        } />
        <Route path="/diet-planner" element={
          <ProtectedRoute allowedRoles={['patient']}>
            <DietPlanner onBackHome={() => window.history.back()} />
          </ProtectedRoute>
        } />
        <Route path="/pharmacy-locator" element={
          <ProtectedRoute allowedRoles={['patient']}>
            <PharmacyLocator onBackHome={() => window.history.back()} />
          </ProtectedRoute>
        } />
        <Route path="/video-consultation" element={
          <ProtectedRoute allowedRoles={['patient']}>
            <VideoConsultation onBackHome={() => window.history.back()} />
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute allowedRoles={['patient']}>
            <PatientProfile onBackHome={() => window.history.back()} />
          </ProtectedRoute>
        } />
      </Routes>
    </div>
  );
}