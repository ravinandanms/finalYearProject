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

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

// In-memory store for online users
// Maps userId to socketId
const onlineUsers = new Map();

io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    // When a user logs in / connects, they send their userId and role
    socket.on("join", ({ userId, role }) => {
        onlineUsers.set(userId, { socketId: socket.id, role });
        console.log(`User ${userId} joined as ${role}`);
        
        // Broadcast updated online doctors to everyone
        broadcastOnlineDoctors();
    });

    socket.on("get_online_doctors", () => {
        const doctors = [];
        for (let [userId, details] of onlineUsers.entries()) {
            if (details.role === 'doctor') {
                doctors.push(userId);
            }
        }
        socket.emit("online_doctors_list", doctors);
    });

    // Patient requests a video call to a doctor
    socket.on("call_user", ({ userToCall, signalData, from, name }) => {
        const doctorSocket = onlineUsers.get(userToCall)?.socketId;
        if (doctorSocket) {
            io.to(doctorSocket).emit("incoming_call", { signal: signalData, from, name });
        }
    });

    // Doctor answers the call
    socket.on("answer_call", (data) => {
        const callerSocket = onlineUsers.get(data.to)?.socketId;
        if (callerSocket) {
            io.to(callerSocket).emit("call_accepted", data.signal);
        }
    });

    // Doctor rejects the call
    socket.on("reject_call", (data) => {
        const callerSocket = onlineUsers.get(data.to)?.socketId;
        if (callerSocket) {
            io.to(callerSocket).emit("call_rejected");
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
                doctors.push(userId); // Or send more details if needed
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
connectToDatabase();