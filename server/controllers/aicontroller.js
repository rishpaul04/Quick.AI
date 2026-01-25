import { GoogleGenerativeAI } from "@google/generative-ai";
import sql from "../configs/db.js";
import { clerkClient } from "@clerk/express";
import { v2 as cloudinary } from 'cloudinary';
import axios from "axios";
import FormData from "form-data"; 

// Initialize Google AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const handleUsageAndDb = async (userId, prompt, content, type, plan, free_usage, publish = false) => {
    await sql`INSERT INTO creations (user_id, prompt, content, type, publish) 
              VALUES (${userId}, ${prompt}, ${content}, ${type}, ${publish})`;

    if (plan !== 'premium') {
        await clerkClient.users.updateUserMetadata(userId, {
            privateMetadata: { free_usage: free_usage + 1 }
        });
    }
};

// 1. Text Article
export const generateArticle = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { prompt, length } = req.body;
        const plan = req.plan;
        const free_usage = req.free_usage || 0;

        if (plan !== 'premium' && free_usage >= 10) return res.status(403).json({ success: false, message: "Limit reached." });

        // Using gemini-2.5-flash as requested
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash", generationConfig: { maxOutputTokens: 8000 } });
        const result = await model.generateContent(`Write a detailed article about "${prompt}". Approx ${length || 1000} words.`);
        const content = result.response.text();

        await handleUsageAndDb(userId, prompt, content, 'article', plan, free_usage);
        res.json({ success: true, content });
    } catch (error) {
        console.error("Article Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// 2. Blog Title
export const generateBlogTitle = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { prompt } = req.body;
        const plan = req.plan;
        const free_usage = req.free_usage || 0;

        if (plan !== 'premium' && free_usage >= 10) return res.status(403).json({ success: false, message: "Limit reached." });

        // Using gemini-2.5-flash as requested
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const result = await model.generateContent(`Generate 5 catchy blog titles for: ${prompt}`);
        const content = result.response.text();

        await handleUsageAndDb(userId, prompt, content, 'title', plan, free_usage);
        res.json({ success: true, content });
    } catch (error) {
        console.error("Title Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// 3. Image Generation
export const generateImage = async (req, res) => {
    try {
        const { userId } = req.auth(); 
        const { prompt, publish } = req.body;
        const plan = req.plan;
        const free_usage = req.free_usage || 0;

        if (plan !== 'premium' && free_usage >= 10) {
            return res.json({ success: false, message: "Premium only." });
        }

        const form = new FormData();
        form.append('prompt', prompt);

        const { data } = await axios.post('https://clipdrop-api.co/text-to-image/v1', form, {
            headers: {
                'x-api-key': process.env.CLIPDROP_API_KEY,
                ...form.getHeaders()
            },
            responseType: 'arraybuffer'
        });

        const base64Image = `data:image/png;base64,${Buffer.from(data).toString('base64')}`;
        const { secure_url } = await cloudinary.uploader.upload(base64Image);

        await handleUsageAndDb(userId, prompt, secure_url, 'image', plan, free_usage, publish);
        res.json({ success: true, secure_url });

    } catch (error) {
        console.error("Image Error:", error.message);
        if (error.response) {
            console.error("ClipDrop Error Details:", error.response.data.toString());
        }
        res.status(500).json({ success: false, message: error.message || "Image generation failed" });
    }
};

// 4. Remove Image Background
export const removeImageBackground = async (req, res) => {
    try {
        const { userId } = req.auth();
        
        // FIX 1: req.file is the file object, don't destructure it
        const image = req.file; 
        
        const plan = req.plan;
        const free_usage = req.free_usage || 0;
        
        // FIX 2: Define 'publish' (extracted from request body)
        const { publish } = req.body; 

        if (plan !== 'premium' && free_usage >= 10) {
            return res.json({ success: false, message: "This feature is only available for premium users." });
        }

        const { secure_url } = await cloudinary.uploader.upload(image.path, {
            transformation: [
                {
                    effect: 'background_removal',
                    background_removal: 'remove_the_background'
                }
            ]
        })
        
        // FIX 3: Added 'publish' to the column list so it matches the 5 values
        await sql`INSERT INTO creations (user_id, prompt, content, type, publish) VALUES (${userId}, 'Removed Background from image', ${secure_url}, ${'image'}, ${publish ?? false})`;

        res.json({ success: true, secure_url });

    } catch (error) {
        console.error("Remove BG Error:", error.message);
        // Cleaned up the error logging since ClipDrop is no longer used
        res.status(500).json({ success: false, message: error.message || "Background removal failed" });
    }
};