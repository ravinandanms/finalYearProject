// Hello from your AI! I am directly editing this file to prove I can see and modify it.
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import connectToDatabase from "./Database/database.js";

// Routes
import authRoutes from "./Routes/authRoutes.js";
import userRoutes from "./Routes/userRoutes.js";
import aiRoutes from "./Routes/aiRoutes.js";
import adminRoutes from "./Routes/adminRoutes.js";
import patientRoutes from "./Routes/patientRoutes.js";
import doctorRoutes from "./Routes/doctorRoutes.js";
import doctorHospitalRoutes from "./Routes/doctorHospitalRoutes.js";
import paymentRoutes from "./Routes/paymentRoutes.js";
import { seedAdmin } from "./Database/seedAdmin.js";
import path from "path";

dotenv.config();
const PORT = process.env.PORT || 5000;

const app = express();
const httpServer = createServer(app);

// Socket.IO setup
const io = new Server(httpServer, {
    cors: {
        origin: "*", // Adjust this in production to your frontend URL
        methods: ["GET", "POST"]
    }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(process.cwd(), 'public/uploads')));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/doctors-hospitals", doctorHospitalRoutes);
app.use("/api/payments", paymentRoutes);

// In-memory store for online users
// Maps userId string to socket details
const onlineUsers = new Map();

io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    // When a user logs in / connects, they send their userId and role
    socket.on("join", ({ userId, role, name }) => {
        if (!userId) return;
        const uid = String(userId);
        onlineUsers.set(uid, { socketId: socket.id, role, name: name || 'User', userId: uid });
        console.log(`User ${uid} (${name || 'User'}) joined as role: ${role}`);
        
        // Broadcast updated online doctors to everyone
        broadcastOnlineDoctors();
    });

    socket.on("get_online_doctors", () => {
        const doctors = [];
        for (let [userId, details] of onlineUsers.entries()) {
            if (details.role === 'doctor') {
                doctors.push(String(userId));
            }
        }
        socket.emit("online_doctors_list", doctors);
    });

    // Patient requests a video call to a doctor
    socket.on("call_user", ({ userToCall, signalData, from, name }) => {
        const targetId = String(userToCall);
        const doctorData = onlineUsers.get(targetId);
        console.log(`Call requested from ${from} (${name}) to doctor ${targetId}. Found:`, !!doctorData);
        
        if (doctorData?.socketId) {
            io.to(doctorData.socketId).emit("incoming_call", { 
                signal: signalData, 
                from: String(from), 
                name: name || 'Patient' 
            });
        } else {
            socket.emit("call_failed", { message: "Doctor is currently offline or unreachable." });
        }
    });

    // Doctor answers the call
    socket.on("answer_call", (data) => {
        const callerId = String(data.to);
        const callerData = onlineUsers.get(callerId);
        console.log(`Doctor answered call for caller ${callerId}. Found:`, !!callerData);
        
        if (callerData?.socketId) {
            io.to(callerData.socketId).emit("call_accepted", data.signal);
        }
    });

    // Doctor rejects the call
    socket.on("reject_call", (data) => {
        const callerId = String(data.to);
        const callerData = onlineUsers.get(callerId);
        if (callerData?.socketId) {
            io.to(callerData.socketId).emit("call_rejected");
        }
    });

    // End call signal
    socket.on("end_call", (data) => {
        const targetId = data?.to ? String(data.to) : null;
        if (targetId) {
            const targetData = onlineUsers.get(targetId);
            if (targetData?.socketId) {
                io.to(targetData.socketId).emit("call_ended");
            }
        }
    });

    // Forward digital prescription & updated consultation fee to patient
    socket.on("prescription_created", (data) => {
        const targetId = data?.to ? String(data.to) : null;
        console.log(`Prescription created by doctor, forwarding to patient ${targetId}. Fee:`, data?.prescriptionData?.consultationFee);
        if (targetId) {
            const patientData = onlineUsers.get(targetId);
            if (patientData?.socketId) {
                io.to(patientData.socketId).emit("prescription_created", data);
            }
        }
    });

    socket.on("disconnect", () => {
        console.log(`User disconnected: ${socket.id}`);
        // Remove user from onlineUsers
        for (let [userId, userDetails] of onlineUsers.entries()) {
            if (userDetails.socketId === socket.id) {
                onlineUsers.delete(userId);
                break;
            }
        }
        // Broadcast updated list
        broadcastOnlineDoctors();
    });

    // Helper function to send online doctors to all connected patients
    function broadcastOnlineDoctors() {
        const doctors = [];
        for (let [userId, details] of onlineUsers.entries()) {
            if (details.role === 'doctor') {
                doctors.push(String(userId));
            }
        }
        io.emit("online_doctors_list", doctors);
    }
});


// Start the server
httpServer.listen(PORT, () => {
    console.log(`server running on http://localhost:${PORT}`);
});

// Connecting to database 
connectToDatabase().then(() => {
    seedAdmin();
});