import React, { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
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
import MedicalRecords from "./components/MedicalRecords";

import DoctorDashboard from "./components/DoctorDashboard";

export default function App() {
  const [currentPage, setCurrentPage] = React.useState('home');
  const { user } = useAuth();

  useEffect(() => {
    AOS.init({
      duration: 1000,
      easing: "ease-in-out",
      once: true,
    });
  }, []);

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'ai-symptom-checker':
        return <AISymptomChecker onBackHome={() => setCurrentPage('home')} />;
      case 'diet-planner':
        return <DietPlanner onBackHome={() => setCurrentPage('home')} />;
      case 'pharmacy-locator':
        return <PharmacyLocator onBackHome={() => setCurrentPage('home')} />;
      case 'video-consultation':
        return <VideoConsultation onBackHome={() => setCurrentPage('home')} />;
      case 'medical-records':
        return <MedicalRecords onBackHome={() => setCurrentPage('home')} />;
      default:
        return (
          <>
            <Navbar />
            <Hero />
            <div data-aos="fade-up"><About /></div>
            <div data-aos="fade-up"><Services 
              onAiClick={() => setCurrentPage('ai-symptom-checker')} 
              onDietClick={() => setCurrentPage('diet-planner')}
              onPharmacyClick={() => setCurrentPage('pharmacy-locator')}
              onVideoConsultationClick={() => setCurrentPage('video-consultation')}
              onMedicalRecordsClick={() => setCurrentPage('medical-records')}
            /></div>
            <div data-aos="fade-up"><Doctors /></div>
            <div data-aos="fade-up"><CTA /></div>
            <div data-aos="fade-up"><Footer /></div>
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-slate-800 scroll-smooth">
      {!user ? (
        <Login />
      ) : user.role === 'doctor' ? (
        <DoctorDashboard />
      ) : (
        renderCurrentPage()
      )}
    </div>
  );
}