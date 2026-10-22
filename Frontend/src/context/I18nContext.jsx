import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const I18nContext = createContext(null);

const translations = {
  en: {
    // Brand & Navigation
    "brand.name": "Teleseva",
    "brand.tag": "Health & Medical Telehealth Platform",
    "nav.home": "Home",
    "nav.about": "About",
    "nav.services": "Services",
    "nav.doctors": "Doctors",
    "nav.contact": "Contact",
    "nav.back": "Back to Home",
    "profile.logout": "Logout",
    "profile.myProfile": "My Profile",
    "profile.edit": "Edit Profile",
    "profile.personalInfo": "Personal Information",
    "profile.medicalInfo": "Medical Information",
    "profile.records": "Medical Records",

    // Hero Section
    "hero.kicker": "AI-POWERED TELEHEALTH & LOCAL CLINICAL CARE",
    "hero.title": "Accessible Healthcare for Everyone, Everywhere",
    "hero.subtitle": "Diagnose symptoms with AI, get specialist recommendations, and discover budget-friendly to premium hospitals and pharmacies in your locality.",
    "hero.cta.symptom": "AI Symptom Checker",
    "hero.cta.find": "Find Nearby Doctors & Hospitals",

    // Services Section
    "services.title": "Our Healthcare Services",
    "services.subtitle": "Complete digital health solutions from online consultations to nearby hospital & pharmacy discovery.",
    "services.explore": "Explore Service",
    "service.finder.title": "Find Doctors & Hospitals",
    "service.finder.desc": "Budget vs Premium Specialists & Map Locator",
    "service.ai.title": "AI Symptoms Checker",
    "service.ai.desc": "AI Triage & Specialist Recommendation",
    "service.video.title": "Video Consultation",
    "service.video.desc": "Live Consultation with Online Doctors",
    "service.pharmacy.title": "Pharmacy & Hospital Locator",
    "service.pharmacy.desc": "Locate Nearby 24/7 Medical Stores & Clinics",
    "service.records.title": "Medical Records",
    "service.records.desc": "Digital Health Records & Prescriptions",
    "service.diet.title": "Diet Planner",
    "service.diet.desc": "Personalized AI Nutrition & Wellness Plans",

    // About Section
    "about.heading": "How TeleSeva Works",
    "about.step1.title": "Patient Registration & Triage",
    "about.step1.desc": "Sign up seamlessly, track your health history, or use AI symptom assessment for instant guidance.",
    "about.step2.title": "Live Video Consultation",
    "about.step2.desc": "Connect instantly with certified doctors in high-definition video calls for personalized diagnosis.",
    "about.step3.title": "Digital Prescription & Payment",
    "about.step3.desc": "Receive digital doctor prescriptions immediately after your call with integrated secure payments.",
    "about.step4.title": "Nearby Pharmacy & Hospital Routing",
    "about.step4.desc": "Locate local pharmacies stocking prescribed medicines with 1-click GPS navigation and delivery.",

    // Doctors Section
    "doctors.title": "Meet Our Verified Doctors",
    "doctors.subtitle": "Qualified medical specialists available for instant video consultation and clinic visits.",
    "doctors.bookConsult": "Consult Online",

    // CTA & Footer
    "cta.title": "Ready to Connect with a Doctor?",
    "cta.subtitle": "Get expert advice, instant digital prescriptions, and personalized healthcare today.",
    "cta.button": "Start Consultation Now",
    "footer.rights": "All rights reserved.",
    "footer.built": "Built with ❤️ for accessible healthcare in Karnataka and beyond.",

    // Auth & Login
    "auth.signIn": "Sign In",
    "auth.signUpRegister": "Sign Up / Register",
    "auth.welcome": "Welcome to TeleSeva",
    "auth.tagline": "Your trusted healthcare companion for better health management",
    "auth.newHere": "New here?",
    "auth.signUpLink": "Sign Up / Register",
    "auth.alreadyAccount": "Already have an account?",
    "auth.forgot": "Forgot password?",
    "auth.email": "Email Address",
    "auth.password": "Password",
    "auth.signInCta": "Sign In to Account",
    "auth.registerCta": "Create My Account",
    "auth.name": "Full Name",
    "auth.phone": "Phone Number",
    "auth.gender": "Gender",
    "auth.age": "Age",
    "auth.role": "I am a",
    "auth.role.patient": "Patient",
    "auth.role.doctor": "Doctor / Medical Specialist",
    "auth.specialization": "Medical Specialization (e.g. Cardiologist, Physician)",
    "auth.gender.male": "Male",
    "auth.gender.female": "Female",
    "auth.gender.other": "Other",
    "auth.placeholder.phone": "e.g. 9876543210",
    "auth.placeholder.name": "Enter your full name",
    "auth.placeholder.email": "name@example.com",
    "auth.placeholder.password": "Enter secure password",
    "auth.reset.title": "Reset Password",
    "auth.reset.sendOtp": "Send OTP",
    "auth.reset.verify": "Verify & Continue",
    "auth.otp": "Enter 6-digit OTP",

    // Video Consultation & Post Call
    "video.title": "Video Consultation",
    "video.subtitle": "Connect instantly with verified doctors via secure high-definition video call",
    "video.online": "Online & Available",
    "video.offline": "Currently Offline",
    "video.startCall": "Start Video Call",
    "video.calling": "Calling Doctor...",
    "video.connecting": "Connecting securely to doctor...",
    "video.live": "LIVE CONSULTATION",
    "video.endCall": "End Call",
    "video.mute": "Mute",
    "video.unmute": "Unmute",
    "video.cameraOn": "Cam On",
    "video.cameraOff": "Cam Off",
    "video.callCompleted": "Consultation Completed Successfully",
    "video.doctorCompletedMsg": "The doctor has finished the consultation and generated your medical report.",

    // Prescriptions & Recommendations
    "rx.title": "Official Digital Prescription",
    "rx.rxSymbol": "℞ Medical Prescription",
    "rx.patientName": "Patient Name",
    "rx.doctorName": "Doctor Name",
    "rx.date": "Date & Time",
    "rx.diagnosis": "Clinical Diagnosis",
    "rx.medicines": "Prescribed Medications",
    "rx.medicineName": "Medicine / Formulation",
    "rx.dosage": "Dosage",
    "rx.timing": "Frequency / Timing",
    "rx.duration": "Duration",
    "rx.instructions": "Instructions",
    "rx.doctorNotes": "Doctor's Advice & Lifestyle Guidance",
    "rx.testsAdvised": "Recommended Diagnostic Tests",
    "rx.signature": "Verified Digital Signature & Registration Stamp",
    "rx.download": "Download / Print Prescription",
    "rx.locatePharmacies": "Locate Nearby Pharmacies with These Medicines",
    "rx.orderDelivery": "Order from Nearby Pharmacy",

    // Payment System
    "pay.title": "Consultation Fee Payment",
    "pay.subtitle": "Securely pay for your medical consultation to unlock official prescription & records",
    "pay.summary": "Payment Summary",
    "pay.consultFee": "Doctor Consultation Fee",
    "pay.serviceFee": "TeleSeva Platform & Convenience Fee",
    "pay.totalAmount": "Total Payable Amount",
    "pay.selectMethod": "Select Payment Method",
    "pay.upi": "UPI (Google Pay, PhonePe, Paytm, BHIM)",
    "pay.card": "Credit / Debit Card (Visa, MasterCard, RuPay)",
    "pay.netbanking": "Net Banking (SBI, HDFC, ICICI, Canara)",
    "pay.qrCode": "Scan UPI QR Code",
    "pay.enterUpiId": "Enter UPI ID (e.g. mobile@upi)",
    "pay.cardNumber": "16-digit Card Number",
    "pay.cardExpiry": "MM/YY",
    "pay.cardCvv": "CVV",
    "pay.cardHolder": "Cardholder Name",
    "pay.payNow": "Pay Now Securely",
    "pay.processing": "Processing Payment with Bank Gateway...",
    "pay.success": "Payment Successful!",
    "pay.txnId": "Transaction Reference ID",
    "pay.paidAt": "Payment Timestamp",
    "pay.viewReceipt": "View Official Receipt & Prescription",
    "pay.downloadInvoice": "Download Tax Invoice",

    // Pharmacy & Hospital Locator
    "loc.title": "Pharmacy & Hospital Locator",
    "loc.subtitle": "Locate nearby 24/7 medical stores, generic medicine shops, and hospitals on live map",
    "loc.all": "All Facilities",
    "loc.pharmacies": "Pharmacies & Medical Stores",
    "loc.hospitals": "Hospitals & Emergency Clinics",
    "loc.searchPlaceholder": "Search city or locality (e.g. Indiranagar, Jayanagar, Bengaluru, Mysuru)...",
    "loc.searchBtn": "Search Area",
    "loc.useGps": "Use My Location (GPS)",
    "loc.radius": "Search Radius",
    "loc.distanceAway": "away (straight line)",
    "loc.getDirections": "Get Directions & Route",
    "loc.call": "Call Facility",
    "loc.openHours": "24/7 Open / Extended Hours",
    "loc.inStock": "Prescribed Medicines in Stock",
    "loc.orderNow": "Order for Pickup / Delivery",
    "loc.routeInfo": "Travel Route Information",
    "loc.travelDistance": "Driving Distance",
    "loc.estTime": "Estimated Travel Time",
    "loc.clearRoute": "Clear Route",
    "loc.googleMaps": "Open in Google Maps",
    "loc.noPlaces": "No facilities found in this range. Try increasing the search radius.",

    // AI Symptom Checker & Diet Planner
    "ai.symptomTitle": "AI Symptom Checker & Specialist Finder",
    "ai.symptomSubtitle": "Automated clinical triage and hospital recommendation",
    "ai.describe": "Describe your symptoms (e.g. chest pain, rash, fever, knee pain)...",
    "ai.analyzing": "Analyzing symptoms with medical AI...",
    "ai.commonSymptoms": "Common Symptoms:",
    "ai.dietTitle": "Personalized AI Diet Planner",
    "ai.dietSubtitle": "Fill in your wellness goals to generate customized nutrition plans",
    "ai.generateDiet": "Generate Diet Plan",

    // Doctor Dashboard
    "doc.dashboard": "Doctor Portal & Dashboard",
    "doc.overview": "Overview",
    "doc.appointments": "Appointments",
    "doc.consultationRoom": "Consultation Room",
    "doc.prescribe": "Issue Prescription",
    "doc.addMed": "+ Add Medicine",
    "doc.removeMed": "Remove",
    "doc.saveRx": "Save & Send Digital Prescription",
    "doc.incomingCall": "Incoming Video Consultation Call!",
    "doc.acceptCall": "Accept Call",
    "doc.declineCall": "Decline",
    "doc.todayAppts": "Today's Consultations",
    "doc.pendingPatients": "Pending Patients",
    "doc.completedConsults": "Completed Consultations"
  },

  kn: {
    // Brand & Navigation
    "brand.name": "ಟೆಲಿಸೇವಾ",
    "brand.tag": "ಆರೋಗ್ಯ ಮತ್ತು ವೈದ್ಯಕೀಯ ಟೆಲಿಹೆಲ್ತ್ ಪ್ಲಾಟ್‌ಫಾರ್ಮ್",
    "nav.home": "ಮುಖಪುಟ",
    "nav.about": "ನಮ್ಮ ಬಗ್ಗೆ",
    "nav.services": "ಸೇವೆಗಳು",
    "nav.doctors": "ವೈದ್ಯರು",
    "nav.contact": "ಸಂಪರ್ಕಿಸಿ",
    "nav.back": "ಮುಖಪುಟಕ್ಕೆ ಹಿಂತಿರುಗಿ",
    "profile.logout": "ಲಾಗ್ ಔಟ್",
    "profile.myProfile": "ನನ್ನ ಪ್ರೊಫೈಲ್",
    "profile.edit": "ಪ್ರೊಫೈಲ್ ತಿದ್ದುಪಡಿ",
    "profile.personalInfo": "ವೈಯಕ್ತಿಕ ಮಾಹಿತಿ",
    "profile.medicalInfo": "ವೈದ್ಯಕೀಯ ಮಾಹಿತಿ",
    "profile.records": "ವೈದ್ಯಕೀಯ ದಾಖಲೆಗಳು",

    // Hero Section
    "hero.kicker": "AI-ಆಧಾರಿತ ಟೆಲಿಹೆಲ್ತ್ ಮತ್ತು ಸ್ಥಳೀಯ ವೈದ್ಯಕೀಯ ಆರೈಕೆ",
    "hero.title": "ಎಲ್ಲರಿಗೂ, ಎಲ್ಲೆಡೆಯೂ ಸುಲಭವಾಗಿ ಲಭ್ಯವಾಗುವ ಆರೋಗ್ಯ ಸೇವೆ",
    "hero.subtitle": "AI ಮೂಲಕ ನಿಮ್ಮ ರೋಗಲಕ್ಷಣಗಳನ್ನು ಪರಿಶೀಲಿಸಿ, ತಜ್ಞ ವೈದ್ಯರ ಸಲಹೆ ಪಡೆಯಿರಿ ಮತ್ತು ನಿಮ್ಮ ಸಮೀಪದ ಕೈಗೆಟುಕುವ ಆಸ್ಪತ್ರೆಗಳು ಹಾಗೂ ಔಷಧಾಲಯಗಳನ್ನು ಸುಲಭವಾಗಿ ಹುಡುಕಿ.",
    "hero.cta.symptom": "AI ರೋಗಲಕ್ಷಣ ಪರೀಕ್ಷಕ",
    "hero.cta.find": "ಸಮೀಪದ ವೈದ್ಯರು ಮತ್ತು ಆಸ್ಪತ್ರೆಗಳನ್ನು ಹುಡುಕಿ",

    // Services Section
    "services.title": "ನಮ್ಮ ಸಮಗ್ರ ಆರೋಗ್ಯ ಸೇವೆಗಳು",
    "services.subtitle": "ಆನ್‌ಲೈನ್ ಸಮಾಲೋಚನೆಯಿಂದ ಹಿಡಿದು ಸಮೀಪದ ಆಸ್ಪತ್ರೆ ಮತ್ತು ಮೆಡಿಕಲ್ ಶಾಪ್ ಹುಡುಕಾಟದವರೆಗೆ ಸಂಪೂರ್ಣ ಡಿಜಿಟಲ್ ಆರೋಗ್ಯ ಪರಿಹಾರ.",
    "services.explore": "ಸೇವೆಯನ್ನು ವೀಕ್ಷಿಸಿ",
    "service.finder.title": "ವೈದ್ಯರು ಮತ್ತು ಆಸ್ಪತ್ರೆಗಳ ಹುಡುಕಾಟ",
    "service.finder.desc": "ಕೈಗೆಟುಕುವ ವೆಚ್ಚ ಮತ್ತು ಉನ್ನತ ದರ್ಜೆಯ ತಜ್ಞ ವೈದ್ಯರ ಪಟ್ಟಿ",
    "service.ai.title": "AI ರೋಗಲಕ್ಷಣ ಪರೀಕ್ಷಕ",
    "service.ai.desc": "AI ರೋಗ ಪತ್ತೆ ಮತ್ತು ಸೂಕ್ತ ತಜ್ಞ ವೈದ್ಯರ ಶಿಫಾರಸು",
    "service.video.title": "ವೀಡಿಯೊ ಸಮಾಲೋಚನೆ",
    "service.video.desc": "ಆನ್‌ಲೈನ್ ವೈದ್ಯರೊಂದಿಗೆ ನೇರ ವೀಡಿಯೊ ಸಮಾಲೋಚನೆ",
    "service.pharmacy.title": "ಔಷಧಾಲಯ ಮತ್ತು ಆಸ್ಪತ್ರೆ ಲೊಕೇಟರ್",
    "service.pharmacy.desc": "ಸಮೀಪದ 24/7 ಮೆಡಿಕಲ್ ಸ್ಟೋರ್‌ಗಳು ಮತ್ತು ಕ್ಲಿನಿಕ್‌ಗಳು",
    "service.records.title": "ವೈದ್ಯಕೀಯ ದಾಖಲೆಗಳು",
    "service.records.desc": "ಡಿಜಿಟಲ್ ಆರೋಗ್ಯ ದಾಖಲೆಗಳು ಮತ್ತು ಪ್ರಿಸ್ಕ್ರಿಪ್ಷನ್‌ಗಳು",
    "service.diet.title": "ಆಹಾರ ಮತ್ತು ಪೋಷಕಾಂಶ ಯೋಜನೆ",
    "service.diet.desc": "ವೈಯಕ್ತಿಕ AI ಡಯಟ್ ಮತ್ತು ಪೌಷ್ಟಿಕಾಂಶ ಯೋಜನೆ",

    // About Section
    "about.heading": "ಟೆಲಿಸೇವಾ ಹೇಗೆ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತದೆ",
    "about.step1.title": "ರೋಗಿಗಳ ನೋಂದಣಿ ಮತ್ತು ರೋಗ ತಪಾಸಣೆ",
    "about.step1.desc": "ಸುಲಭವಾಗಿ ನೋಂದಾಯಿಸಿ, ನಿಮ್ಮ ಆರೋಗ್ಯ ಇತಿಹಾಸವನ್ನು ದಾಖಲಿಸಿ ಅಥವಾ ತ್ವರಿತ AI ಸಹಾಯದಿಂದ ರೋಗಲಕ್ಷಣ ಪರೀಕ್ಷಿಸಿ.",
    "about.step2.title": "ನೇರ ವೀಡಿಯೊ ಸಮಾಲೋಚನೆ",
    "about.step2.desc": "ಪ್ರಮಾಣೀಕೃತ ವೈದ್ಯರೊಂದಿಗೆ ನೇರ, ಸುರಕ್ಷಿತ ವೀಡಿಯೊ ಕರೆಯ ಮೂಲಕ ಮಾತನಾಡಿ ಸಂಪೂರ್ಣ ಸಲಹೆ ಪಡೆಯಿರಿ.",
    "about.step3.title": "ಡಿಜಿಟಲ್ ಪ್ರಿಸ್ಕ್ರಿಪ್ಷನ್ ಮತ್ತು ಪಾವತಿ",
    "about.step3.desc": "ಕರೆ ಮುಗಿದ ತಕ್ಷಣ ಅಧಿಕೃತ ಡಿಜಿಟಲ್ ಔಷಧ ಚೀಟಿ (ಪ್ರಿಸ್ಕ್ರಿಪ್ಷನ್) ಪಡೆಯಿರಿ ಮತ್ತು ಸುಲಭವಾಗಿ ಪಾವತಿ ಮಾಡಿ.",
    "about.step4.title": "ಸಮೀಪದ ಔಷಧಾಲಯ ಮತ್ತು ಆಸ್ಪತ್ರೆ ಮಾರ್ಗ",
    "about.step4.desc": "ಶಿಫಾರಸು ಮಾಡಿದ ಔಷಧಿಗಳು ದೊರೆಯುವ ಸಮೀಪದ ಮೆಡಿಕಲ್ ಶಾಪ್‌ಗಳನ್ನು ನಕ್ಷೆಯಲ್ಲಿ ಗುರುತಿಸಿ ಸುಲಭವಾಗಿ ತಲುಪಿ.",

    // Doctors Section
    "doctors.title": "ನಮ್ಮ ಪರಿಣಿತ ವೈದ್ಯರನ್ನು ಭೇಟಿ ಮಾಡಿ",
    "doctors.subtitle": "ಆನ್‌ಲೈನ್ ವೀಡಿಯೊ ಕರೆ ಹಾಗೂ ನೇರ ಚಿಕಿತ್ಸೆಗಾಗಿ ಸದಾ ಸಿದ್ಧರಾಗಿರುವ ಪರಿಣಿತ ವೈದ್ಯರು.",
    "doctors.bookConsult": "ಆನ್‌ಲೈನ್ ಸಮಾಲೋಚನೆ ಪಡೆಯಿರಿ",

    // CTA & Footer
    "cta.title": "ವೈದ್ಯರೊಂದಿಗೆ ಸಮಾಲೋಚಿಸಲು ಸಿದ್ಧರಿದ್ದೀರಾ?",
    "cta.subtitle": "ಇಂದೇ ತಜ್ಞರ ಸಲಹೆ, ತ್ವರಿತ ಡಿಜಿಟಲ್ ಪ್ರಿಸ್ಕ್ರಿಪ್ಷನ್ ಮತ್ತು ವೈಯಕ್ತಿಕ ಆರೋಗ್ಯ ಕಾಳಜಿ ಪಡೆಯಿರಿ.",
    "cta.button": "ಈಗಲೇ ಸಮಾಲೋಚನೆ ಪ್ರಾರಂಭಿಸಿ",
    "footer.rights": "ಎಲ್ಲಾ ಹಕ್ಕುಗಳನ್ನು ಕಾಯ್ದಿರಿಸಲಾಗಿದೆ.",
    "footer.built": "ಕರ್ನಾಟಕ ಹಾಗೂ ದೇಶದ ಪ್ರತಿಯೊಬ್ಬರಿಗೂ ಉತ್ತಮ ಆರೋಗ್ಯ ಸೇವೆ ಒದಗಿಸಲು ❤️ ಪ್ರೀತಿಯಿಂದ ನಿರ್ಮಿಸಲಾಗಿದೆ.",

    // Auth & Login
    "auth.signIn": "ಸೈನ್ ಇನ್",
    "auth.signUpRegister": "ನೋಂದಾಯಿಸಿ (ಸೈನ್ ಅಪ್)",
    "auth.welcome": "ಟೆಲಿಸೇವಾವಿಗೆ ಸುಸ್ವಾಗತ",
    "auth.tagline": "ನಿಮ್ಮ ಆರೋಗ್ಯದ ಉತ್ತಮ ನಿರ್ವಹಣೆಗಾಗಿ ವಿಶ್ವಾಸಾರ್ಹ ಡಿಜಿಟಲ್ ಒಡನಾಡಿ",
    "auth.newHere": "ಹೊಸ ಬಳಕೆದಾರರೇ?",
    "auth.signUpLink": "ಇಲ್ಲಿ ನೋಂದಾಯಿಸಿ",
    "auth.alreadyAccount": "ಈಗಾಗಲೇ ಖಾತೆ ಹೊಂದಿದ್ದೀರಾ?",
    "auth.forgot": "ಪಾಸ್‌ವರ್ಡ್ ಮರೆತಿರಾ?",
    "auth.email": "ಇಮೇಲ್ ವಿಳಾಸ",
    "auth.password": "ಪಾಸ್‌ವರ್ಡ್",
    "auth.signInCta": "ಖಾತೆಗೆ ಲಾಗಿನ್ ಮಾಡಿ",
    "auth.registerCta": "ಹೊಸ ಖಾತೆ ತೆರೆಯಿರಿ",
    "auth.name": "ಪೂರ್ಣ ಹೆಸರು",
    "auth.phone": "ಮೊಬೈಲ್ ಸಂಖ್ಯೆ",
    "auth.gender": "ಲಿಂಗ",
    "auth.age": "ವಯಸ್ಸು",
    "auth.role": "ನಾನು",
    "auth.role.patient": "ರೋಗಿ (ಪೇಷೆಂಟ್)",
    "auth.role.doctor": "ವೈದ್ಯರು (ಡಾಕ್ಟರ್)",
    "auth.specialization": "ವೈದ್ಯಕೀಯ ವಿಶೇಷತೆ (ಉದಾ. ಹೃದ್ರೋಗ ತಜ್ಞರು, ಸಾಮಾನ್ಯ ವೈದ್ಯರು)",
    "auth.gender.male": "ಪುರುಷ",
    "auth.gender.female": "ಮಹಿಳೆ",
    "auth.gender.other": "ಇತರ",
    "auth.placeholder.phone": "ಉದಾ. 9876543210",
    "auth.placeholder.name": "ನಿಮ್ಮ ಪೂರ್ಣ ಹೆಸರನ್ನು ನಮೂದಿಸಿ",
    "auth.placeholder.email": "name@example.com",
    "auth.placeholder.password": "ಸುರಕ್ಷಿತ ಪಾಸ್‌ವರ್ಡ್ ರಚಿಸಿ",
    "auth.reset.title": "ಪಾಸ್‌ವರ್ಡ್ ಮರುಹೊಂದಿಸಿ",
    "auth.reset.sendOtp": "OTP ಕಳುಹಿಸಿ",
    "auth.reset.verify": "ಪರಿಶೀಲಿಸಿ ಮುಂದುವರಿಯಿರಿ",
    "auth.otp": "6-ಅಂಕಿಯ OTP ನಮೂದಿಸಿ",

    // Video Consultation & Post Call
    "video.title": "ವೀಡಿಯೊ ಸಮಾಲೋಚನೆ",
    "video.subtitle": "ಸುರಕ್ಷಿತ ವೀಡಿಯೊ ಕರೆಯ ಮೂಲಕ ಆನ್‌ಲೈನ್‌ನಲ್ಲಿರುವ ಪರಿಣಿತ ವೈದ್ಯರೊಂದಿಗೆ ನೇರವಾಗಿ ಸಮಾಲೋಚಿಸಿ",
    "video.online": "ಆನ್‌ಲೈನ್‌ನಲ್ಲಿದ್ದಾರೆ (ಲಭ್ಯವಿದೆ)",
    "video.offline": "ಪ್ರಸ್ತುತ ಆಫ್‌ಲೈನ್‌ನಲ್ಲಿದ್ದಾರೆ",
    "video.startCall": "ವೀಡಿಯೊ ಕರೆ ಪ್ರಾರಂಭಿಸಿ",
    "video.calling": "ವೈದ್ಯರಿಗೆ ಕರೆ ಮಾಡಲಾಗುತ್ತಿದೆ...",
    "video.connecting": "ವೈದ್ಯರೊಂದಿಗೆ ಸುರಕ್ಷಿತ ಸಂಪರ್ಕ ಕಲ್ಪಿಸಲಾಗುತ್ತಿದೆ...",
    "video.live": "ನೇರ ಸಮಾಲೋಚನೆ ಲೈವ್",
    "video.endCall": "ಕರೆ ಮುಕ್ತಾಯಗೊಳಿಸಿ",
    "video.mute": "ಮ್ಯೂಟ್",
    "video.unmute": "ಅನ್‌ಮ್ಯೂಟ್",
    "video.cameraOn": "ಕ್ಯಾಮೆರಾ ಆನ್",
    "video.cameraOff": "ಕ್ಯಾಮೆರಾ ಆಫ್",
    "video.callCompleted": "ವೈದ್ಯರೊಂದಿಗಿನ ಸಮಾಲೋಚನೆ ಯಶಸ್ವಿಯಾಗಿ ಮುಗಿದಿದೆ",
    "video.doctorCompletedMsg": "ವೈದ್ಯರು ನಿಮ್ಮ ಆರೋಗ್ಯ ತಪಾಸಣೆ ಪೂರ್ಣಗೊಳಿಸಿ ಅಧಿಕೃತ ಪ್ರಿಸ್ಕ್ರಿಪ್ಷನ್ ಸಿದ್ಧಪಡಿಸಿದ್ದಾರೆ.",

    // Prescriptions & Recommendations
    "rx.title": "ಅಧಿಕೃತ ಡಿಜಿಟಲ್ ಪ್ರಿಸ್ಕ್ರಿಪ್ಷನ್ (ಔಷಧ ಚೀಟಿ)",
    "rx.rxSymbol": "℞ ವೈದ್ಯಕೀಯ ಚೀಟಿ",
    "rx.patientName": "ರೋಗಿಯ ಹೆಸರು",
    "rx.doctorName": "ವೈದ್ಯರ ಹೆಸರು",
    "rx.date": "ದಿನಾಂಕ ಮತ್ತು ಸಮಯ",
    "rx.diagnosis": "ರೋಗನಿರ್ಣಯ (ಡಯಾಗ್ನೋಸಿಸ್)",
    "rx.medicines": "ಶಿಫಾರಸು ಮಾಡಿದ ಔಷಧಿಗಳು",
    "rx.medicineName": "ಔಷಧಿಯ ಹೆಸರು",
    "rx.dosage": "ಪ್ರಮಾಣ (ಡೋಸ್)",
    "rx.timing": "ತೆಗೆದುಕೊಳ್ಳುವ ಸಮಯ",
    "rx.duration": "ಅವಧಿ",
    "rx.instructions": "ವಿಶೇಷ ಸೂಚನೆಗಳು",
    "rx.doctorNotes": "ವೈದ್ಯರ ಸಲಹೆ ಮತ್ತು ಆಹಾರ ಪಥ್ಯ",
    "rx.testsAdvised": "ಶಿಫಾರಸು ಮಾಡಿದ ರಕ್ತ/ಲ್ಯಾಬ್ ಪರೀಕ್ಷೆಗಳು",
    "rx.signature": "ದೃಢೀಕೃತ ಡಿಜಿಟಲ್ ಸಹಿ ಮತ್ತು ಮುದ್ರೆ",
    "rx.download": "ಪ್ರಿಸ್ಕ್ರಿಪ್ಷನ್ ಡೌನ್‌ಲೋಡ್ / ಪ್ರಿಂಟ್ ಮಾಡಿ",
    "rx.locatePharmacies": "ಈ ಔಷಧಿಗಳು ದೊರೆಯುವ ಸಮೀಪದ ಮೆಡಿಕಲ್ ಶಾಪ್ ಹುಡುಕಿ",
    "rx.orderDelivery": "ಸಮೀಪದ ಮೆಡಿಕಲ್ ಶಾಪ್‌ನಿಂದ ಆರ್ಡರ್ ಮಾಡಿ",

    // Payment System
    "pay.title": "ಸಮಾಲೋಚನಾ ಶುಲ್ಕ ಪಾವತಿ",
    "pay.subtitle": "ಅಧಿಕೃತ ಡಿಜಿಟಲ್ ಪ್ರಿಸ್ಕ್ರಿಪ್ಷನ್ ಮತ್ತು ರಸೀದಿ ಪಡೆಯಲು ಶುಲ್ಕ ಪಾವತಿಸಿ",
    "pay.summary": "ಶುಲ್ಕದ ವಿವರಣೆ",
    "pay.consultFee": "ವೈದ್ಯರ ಸಮಾಲೋಚನಾ ಶುಲ್ಕ",
    "pay.serviceFee": "ಟೆಲಿಸೇವಾ ಪ್ಲಾಟ್‌ಫಾರ್ಮ್ ಶುಲ್ಕ",
    "pay.totalAmount": "ಒಟ್ಟು ಪಾವತಿಸಬೇಕಾದ ಮೊತ್ತ",
    "pay.selectMethod": "ಪಾವತಿ ವಿಧಾನವನ್ನು ಆಯ್ಕೆಮಾಡಿ",
    "pay.upi": "UPI (Google Pay, PhonePe, Paytm, BHIM)",
    "pay.card": "ಡೆಬಿಟ್ / ಕ್ರೆಡಿಟ್ ಕಾರ್ಡ್ (Visa, RuPay, MasterCard)",
    "pay.netbanking": "ನೆಟ್ ಬ್ಯಾಂಕಿಂಗ್ (SBI, HDFC, Canara, ICICI)",
    "pay.qrCode": "QR ಕೋಡ್ ಸ್ಕ್ಯಾನ್ ಮಾಡಿ ಪಾವತಿಸಿ",
    "pay.enterUpiId": "UPI ID ನಮೂದಿಸಿ (ಉದಾ. 9876543210@upi)",
    "pay.cardNumber": "16-ಅಂಕಿಯ ಕಾರ್ಡ್ ಸಂಖ್ಯೆ",
    "pay.cardExpiry": "ತಿಂಗಳು/ವರ್ಷ (MM/YY)",
    "pay.cardCvv": "CVV ಕೋಡ್",
    "pay.cardHolder": "ಕಾರ್ಡ್ ಹೊಂದಿರುವವರ ಹೆಸರು",
    "pay.payNow": "ಸುರಕ್ಷಿತವಾಗಿ ಈಗಲೇ ಪಾವತಿಸಿ",
    "pay.processing": "ಬ್ಯಾಂಕ್ ಗೇಟ್‌ವೇ ಮೂಲಕ ಪಾವತಿ ಪ್ರಕ್ರಿಯೆ ನಡೆಯುತ್ತಿದೆ...",
    "pay.success": "ಪಾವತಿ ಯಶಸ್ವಿಯಾಗಿದೆ!",
    "pay.txnId": "ವಹಿವಾಟು ಉಲ್ಲೇಖ ಸಂಖ್ಯೆ (Txn ID)",
    "pay.paidAt": "ಪಾವತಿ ದಿನಾಂಕ ಮತ್ತು ಸಮಯ",
    "pay.viewReceipt": "ಅಧಿಕೃತ ರಸೀದಿ ಮತ್ತು ಪ್ರಿಸ್ಕ್ರಿಪ್ಷನ್ ವೀಕ್ಷಿಸಿ",
    "pay.downloadInvoice": "ತೆರಿಗೆ ಇನ್‌ವಾಯ್ಸ್ ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ",

    // Pharmacy & Hospital Locator
    "loc.title": "ಔಷಧಾಲಯ ಮತ್ತು ಆಸ್ಪತ್ರೆ ಲೊಕೇಟರ್",
    "loc.subtitle": "ನಿಮ್ಮ ಸಮೀಪದಲ್ಲಿರುವ 24/7 ಮೆಡಿಕಲ್ ಸ್ಟೋರ್‌ಗಳು, ಜನೌಷಧಿ ಕೇಂದ್ರಗಳು ಮತ್ತು ಆಸ್ಪತ್ರೆಗಳನ್ನು ಹುಡುಕಿ",
    "loc.all": "ಎಲ್ಲಾ ಕೇಂದ್ರಗಳು",
    "loc.pharmacies": "ಮೆಡಿಕಲ್ ಶಾಪ್ / ಔಷಧಾಲಯಗಳು",
    "loc.hospitals": "ಆಸ್ಪತ್ರೆಗಳು ಮತ್ತು ಕ್ಲಿನಿಕ್‌ಗಳು",
    "loc.searchPlaceholder": "ನಗರ ಅಥವಾ ಬಡಾವಣೆ ಹುಡುಕಿ (ಉದಾ. ಇಂದಿರಾನಗರ, ಜಯನಗರ, ಬೆಂಗಳೂರು, ಮೈಸೂರು, ಹುಬ್ಬಳ್ಳಿ)...",
    "loc.searchBtn": "ಹುಡುಕಿ",
    "loc.useGps": "ನನ್ನ ಪ್ರಸ್ತುತ ಸ್ಥಳ ಬಳಸಿ (GPS)",
    "loc.radius": "ಹುಡುಕಾಟದ ವ್ಯಾಪ್ತಿ",
    "loc.distanceAway": "ದೂರದಲ್ಲಿದೆ (ನೇರ ಅಂತರ)",
    "loc.getDirections": "ಮಾರ್ಗ ನಿರ್ದೇಶನ ಪಡೆಯಿರಿ",
    "loc.call": "ಕರೆ ಮಾಡಿ",
    "loc.openHours": "24/7 ತೆರೆದಿರುತ್ತದೆ",
    "loc.inStock": "ಪ್ರಿಸ್ಕ್ರಿಪ್ಷನ್ ಔಷಧಿಗಳು ಲಭ್ಯವಿದೆ",
    "loc.orderNow": "ಆರ್ಡರ್ / ಕಾಯ್ದಿರಿಸಿ",
    "loc.routeInfo": "ಪ್ರಯಾಣದ ಮಾರ್ಗ ವಿವರ",
    "loc.travelDistance": "ಚಾಲನಾ ದೂರ",
    "loc.estTime": "ಅಂದಾಜು ತಲುಪುವ ಸಮಯ",
    "loc.clearRoute": "ಮಾರ್ಗ ತೆರವುಗೊಳಿಸಿ",
    "loc.googleMaps": "ಗೂಗಲ್ ಮ್ಯಾಪ್ಸ್‌ನಲ್ಲಿ ವೀಕ್ಷಿಸಿ",
    "loc.noPlaces": "ಈ ವ್ಯಾಪ್ತಿಯಲ್ಲಿ ಯಾವುದೇ ಕೇಂದ್ರಗಳು ಕಂಡುಬಂದಿಲ್ಲ. ಹುಡುಕಾಟದ ವ್ಯಾಪ್ತಿಯನ್ನು ಹೆಚ್ಚಿಸಿ ಪ್ರಯತ್ನಿಸಿ.",

    // AI Symptom Checker & Diet Planner
    "ai.symptomTitle": "AI ರೋಗಲಕ್ಷಣ ಪರೀಕ್ಷಕ ಮತ್ತು ತಜ್ಞರ ಹುಡುಕಾಟ",
    "ai.symptomSubtitle": "ಸ್ವಯಂಚಾಲಿತ ವೈದ್ಯಕೀಯ ತಪಾಸಣೆ ಮತ್ತು ಆಸ್ಪತ್ರೆಗಳ ಶಿಫಾರಸು",
    "ai.describe": "ನಿಮ್ಮ ರೋಗಲಕ್ಷಣಗಳನ್ನು ವಿವರಿಸಿ (ಉದಾ. ಎದೆನೋವು, ಜ್ವರ, ಚರ್ಮದ ದದ್ದು, ಕೀಲು ನೋವು)...",
    "ai.analyzing": "ವೈದ್ಯಕೀಯ AI ಮೂಲಕ ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತಿದೆ...",
    "ai.commonSymptoms": "ಸಾಮಾನ್ಯ ರೋಗಲಕ್ಷಣಗಳು:",
    "ai.dietTitle": "ವೈಯಕ್ತಿಕ AI ಆಹಾರ ಮತ್ತು ಪೋಷಕಾಂಶ ಯೋಜನೆ",
    "ai.dietSubtitle": "ನಿಮ್ಮ ಆರೋಗ್ಯ ಗುರಿಗಳನ್ನು ನಮೂದಿಸಿ ಪೌಷ್ಟಿಕಾಂಶ ಯೋಜನೆಯನ್ನು ರಚಿಸಿ",
    "ai.generateDiet": "ಆಹಾರ ಯೋಜನೆಯನ್ನು ರಚಿಸಿ",

    // Doctor Dashboard
    "doc.dashboard": "ವೈದ್ಯರ ಪೋರ್ಟಲ್ ಮತ್ತು ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
    "doc.overview": "ಅವಲೋಕನ",
    "doc.appointments": "ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್‌ಗಳು",
    "doc.consultationRoom": "ಸಮಾಲೋಚನಾ ಕೊಠಡಿ",
    "doc.prescribe": "ಪ್ರಿಸ್ಕ್ರಿಪ್ಷನ್ ನೀಡಿ",
    "doc.addMed": "+ ಔಷಧ ಸೇರಿಸಿ",
    "doc.removeMed": "ತೆಗೆದುಹಾಕಿ",
    "doc.saveRx": "ಪ್ರಿಸ್ಕ್ರಿಪ್ಷನ್ ಉಳಿಸಿ ಮತ್ತು ರೋಗಿಗೆ ಕಳುಹಿಸಿ",
    "doc.incomingCall": "ಒಳಬರುವ ವೀಡಿಯೊ ಸಮಾಲೋಚನೆ ಕರೆ!",
    "doc.acceptCall": "ಕರೆ ಸ್ವೀಕರಿಸಿ",
    "doc.declineCall": "ತಿರಸ್ಕರಿಸಿ",
    "doc.todayAppts": "ಇಂದಿನ ಸಮಾಲೋಚನೆಗಳು",
    "doc.pendingPatients": "ಕಾಯುತ್ತಿರುವ ರೋಗಿಗಳು",
    "doc.completedConsults": "ಪೂರ್ಣಗೊಂಡ ಸಮಾಲೋಚನೆಗಳು"
  }
};

export function I18nProvider({ children }) {
  const [lang, setLang] = useState("en");

  useEffect(() => {
    const stored = localStorage.getItem("teleseva_lang");
    if (stored && (stored === "en" || stored === "kn")) {
      setLang(stored);
    } else {
      setLang("en");
    }
  }, []);

  function changeLanguage(next) {
    const validLang = next === "kn" ? "kn" : "en";
    setLang(validLang);
    try {
      localStorage.setItem("teleseva_lang", validLang);
    } catch (_) {}
  }

  function t(key, fallbackText) {
    if (!key) return fallbackText || "";
    const langTable = translations[lang] || translations.en;
    if (langTable[key]) return langTable[key];
    if (translations.en[key]) return translations.en[key];
    return fallbackText !== undefined ? fallbackText : key;
  }

  const value = useMemo(() => ({ lang, setLang: changeLanguage, t, isKannada: lang === 'kn' }), [lang]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within an I18nProvider");
  return ctx;
}
