import OpenAI from "openai";
import sql from "../configs/db.js"; 
import { clerkClient } from "@clerk/express";

const AI = new OpenAI({
    apiKey: process.env.GEMINI_API_KEY,
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
});

export const generateArticle = async (req, res) => {
    try {
        // 1. Fix: req.auth is an object, not a function
        const { userId } = req.auth; 
        const { prompt, length } = req.body;
        
        // These are likely coming from a custom middleware you wrote
        const plan = req.plan;
        const free_usage = req.free_usage || 0;

        // 2. Usage Limit Check
        if (plan !== 'premium' && free_usage >= 10) {
            return res.status(403).json({ success: false, message: "Limit reached. Upgrade to continue." });
        }

        // 3. AI Completion
        const response = await AI.chat.completions.create({
            model: "gemini-2.5-flash",
            messages: [
                {
                    role: "user",
                    content: prompt,
                },
            ],
            temperature: 0.7, // Fix: Added missing 'e'
            max_tokens: length || 1000,
        });

        const content = response.choices[0].message.content;

        // 4. Database Logging
        await sql`INSERT INTO creations (user_id, prompt, content, type) 
                  VALUES (${userId}, ${prompt}, ${content}, 'article')`;

        // 5. Update Usage in Clerk
        if (plan !== 'premium') {
            await clerkClient.users.updateUserMetadata(userId, {
                privateMetadata: { 
                    free_usage: free_usage + 1 // Kept naming consistent
                }
            });
        }

        res.json({ success: true, content });

    } catch (error) {
        console.error("Controller Error:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
}