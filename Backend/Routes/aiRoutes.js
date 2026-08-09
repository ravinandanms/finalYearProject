import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "AIzaSyCZdWdPqQ-tSlgMMcd4PC8bpUOCLhKY7_s"); 
// Fallback to the old key for development if env is not set correctly yet, though it should be in .env

// In-memory conversation store for the first implementation
// Map of conversationId -> ChatSession
const conversations = new Map();

const systemInstruction = `You are Teleseva AI, an assistant integrated into the Teleseva telemedicine application.
Your role is to help patients with:
1. HEALTH / SYMPTOM ASSISTANCE: When the user describes symptoms, ask relevant follow-up questions if needed. Do not make a definitive diagnosis. Explain this is not a medical diagnosis. Provide general information, identify warning signs, and encourage consulting a doctor. Never claim certainty.
2. DIET / NUTRITION ASSISTANCE: Create SHORT, actionable diet plans. If they ask for a plan, ask for age, dietary preference, goals, activity level, allergies if you don't know them. Output a simple daily meal plan with bullets.
3. GENERAL HEALTH QUESTIONS: Answer general wellness and nutrition queries concisely.
4. TELESEVA APPLICATION ASSISTANCE: Help users navigate the app. 
- "How to book a doctor" -> Tell them to click on "Doctors" or "Video Consultation" in the app.
- "Pharmacy locator" -> Tell them to use the "Pharmacy Locator" feature on the dashboard.
- "Medical reports" -> Tell them to check the "Medical Records" section.
- "Video call not working" -> Tell them to check their camera/mic permissions and ensure the doctor is online.

Keep responses concise, easy to scan, use short paragraphs or bullets.
Determine the user's intent automatically from their prompt. Do NOT use markdown code blocks unless necessary.`;

router.post('/chat', async (req, res) => {
    try {
        const { message, conversationId, context } = req.body;

        if (!message) {
            return res.status(400).json({ success: false, error: 'Message is required' });
        }

        const model = genAI.getGenerativeModel({ 
            model: "gemini-2.5-flash",
            systemInstruction: systemInstruction 
        });

        let chat;
        let activeConversationId = conversationId;

        if (activeConversationId && conversations.has(activeConversationId)) {
            chat = conversations.get(activeConversationId);
        } else {
            activeConversationId = activeConversationId || Date.now().toString();
            chat = model.startChat({
                history: [
                    {
                        role: "user",
                        parts: [{ text: `System Context: The user is currently on the "${context?.page || 'unknown'}" page. Their role is "${context?.userRole || 'patient'}".` }]
                    },
                    {
                        role: "model",
                        parts: [{ text: "Understood. I am Teleseva AI." }]
                    }
                ],
                generationConfig: {
                    maxOutputTokens: 1000,
                    temperature: 0.5,
                },
            });
            conversations.set(activeConversationId, chat);
        }

        const result = await chat.sendMessage(message);
        const responseText = result.response.text();

        res.json({
            success: true,
            reply: responseText,
            conversationId: activeConversationId
        });
    } catch (error) {
        console.error('Error in AI Chat:', error);
        res.status(500).json({ 
            success: false, 
            error: 'I am sorry, I could not process that request right now. Please try again.',
            details: error.message
        });
    }
});

export default router;
