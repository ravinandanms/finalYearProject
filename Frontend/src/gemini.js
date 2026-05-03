import { GoogleGenerativeAI } from "@google/generative-ai";

const MAP_API = "AIzaSyDL9n0tALTGxBzXygiZXtYZYcKzzUTyqXc"
const API_KEY = "AIzaSyCZdWdPqQ-tSlgMMcd4PC8bpUOCLhKY7_s";
const genAI = new GoogleGenerativeAI(API_KEY);

// Function to check symptoms
export async function checkSymptoms(symptomText) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `You are an AI-powered symptom checker.  
      Your role is to help users understand their symptoms, suggest possible conditions, and provide general health advice.
      Example style:  
      “Based on your symptoms of headache and nausea for 2 days, 
      some possible causes could be dehydration, migraine, or stomach infection. 
      If the headache worsens suddenly, or you develop vision changes or confusion, seek urgent care. 
      Otherwise, stay hydrated, rest, and consult a doctor if it doesn’t improve.”
      also provide home remedies for the user and please ensure the following:
      1. always answer even if the question is vague 
      2. dont give the answer in more than 5 to 6 lines
      3. give the answer in points and specify symptomms, causes and home remidies seperately 
      4. reply in the language the prompt is given in`;

    const user = `Symptoms: ${symptomText}`;

    const result = await model.generateContent({
      contents: [
        { role: "user", parts: [{ text: prompt }] },
        { role: "user", parts: [{ text: user }] },
      ],
      generationConfig: {
        temperature: 0.4,
      },
    });

    return result.response.text();
  } catch (error) {
    console.error("Error with Gemini API:", error);
    return "Sorry, something went wrong. Please try again.";
  }
}

// Function to generate diet plan
export async function generateDietPlan({ age, gender, activity, preference, goal, allergies }) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const prompt = `You are a certified nutrition assistant. Create a SHORT, actionable diet plan.
Hard limits: MAX ~180-200 words total.
Return ONLY:
- Daily calories estimate and macro split (1 line).
- Simple daily meal plan (breakfast, lunch, snack, dinner) as 4 bullets.
- Weekly overview with 3 bullets.
- Compact grocery list (5-8 items).
Formatting: bullet points, ultra-concise, no extra explanation or disclaimers.`;
    const user = `Profile:
Age: ${age}
Gender: ${gender}
Activity: ${activity}
Diet preference: ${preference}
Goal: ${goal || "General wellness"}
Allergies/avoid: ${allergies || "none"}`;

    const result = await model.generateContent({
      contents: [
        { role: "user", parts: [{ text: prompt }] },
        { role: "user", parts: [{ text: user }] },
      ],
      generationConfig: { temperature: 0.5 },
    });
    return result.response.text();
  } catch (e) {
    console.error("Diet plan error:", e);
    return "Unable to generate a diet plan right now.";
  }
}