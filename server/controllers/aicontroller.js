import { GoogleGenerativeAI } from "@google/generative-ai";
import sql from "../configs/db.js";
import { clerkClient } from "@clerk/express";
import { v2 as cloudinary } from 'cloudinary';
import axios from "axios";
import FormData from "form-data";
import fs from "fs";
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdf = require('pdf-parse');

// Initialize Google AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Helper: cleanup uploaded file to save disk space
const cleanupFile = (path) => {
    if (path && fs.existsSync(path)) {
        fs.unlink(path, (err) => {
            if (err) console.error("Error deleting file:", err);
        });
    }
};

// Centralized Usage and DB Handler
const handleUsageAndDb = async (userId, prompt, content, type, plan, free_usage, publish = false) => {
    try {
        await sql`INSERT INTO creations (user_id, prompt, content, type, publish) 
                  VALUES (${userId}, ${prompt}, ${content}, ${type}, ${publish})`;

        if (plan !== 'premium') {
            await clerkClient.users.updateUserMetadata(userId, {
                privateMetadata: { free_usage: free_usage + 1 }
            });
        }
    } catch (error) {
        console.error("DB/Usage Update Error:", error);
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
        res.status(500).json({ success: false, message: error.message || "Image generation failed" });
    }
};

// 4. Remove Image Background
export const removeImageBackground = async (req, res) => {
    const image = req.file;
    try {
        const { userId } = req.auth();
        const plan = req.plan;
        const free_usage = req.free_usage || 0;
        const { publish } = req.body;

        if (plan !== 'premium' && free_usage >= 10) {
            return res.json({ success: false, message: "Limit reached or Premium only." });
        }
        
        if (!image) return res.status(400).json({ success: false, message: "No image uploaded" });

        const { secure_url } = await cloudinary.uploader.upload(image.path, {
            transformation: [
                {
                    effect: 'background_removal',
                    background_removal: 'remove_the_background'
                }
            ]
        });

        await handleUsageAndDb(userId, 'Removed Background', secure_url, 'image', plan, free_usage, publish);
        
        res.json({ success: true, secure_url });

    } catch (error) {
        console.error("Remove BG Error:", error.message);
        res.status(500).json({ success: false, message: error.message });
    } finally {
        if(image) cleanupFile(image.path);
    }
};

// 5. Remove Object
export const removeImageObject = async (req, res) => {
    const image = req.file;
    try {
        const { userId } = req.auth();
        const plan = req.plan;
        const free_usage = req.free_usage || 0;
        
        // Extracted 'object' from body to fix the ReferenceError
        const { publish, object } = req.body; 

        if (plan !== 'premium' && free_usage >= 10) {
            return res.json({ success: false, message: "Limit reached or Premium only." });
        }
        
        if (!image) return res.status(400).json({ success: false, message: "No image uploaded" });
        if (!object) return res.status(400).json({ success: false, message: "No object specified to remove" });

        const { public_id } = await cloudinary.uploader.upload(image.path);

        const imageurl = cloudinary.url(public_id, {
            transformation: [
                {
                    effect: `gen_remove:prompt_${object}`
                }
            ],
            resource_type: 'image'
        });

        await handleUsageAndDb(userId, `Removed ${object} from image`, imageurl, 'image', plan, free_usage, publish);

        res.json({ success: true, imageurl });

    } catch (error) {
        console.error("Remove Object Error:", error.message);
        res.status(500).json({ success: false, message: error.message });
    } finally {
        if(image) cleanupFile(image.path);
    }
};

// 6. Resume Review
export const resumeReview = async (req, res) => {
    const resume = req.file;
    try {
        const { userId } = req.auth();
        const plan = req.plan;
        const free_usage = req.free_usage || 0;
        const { publish } = req.body;

        if (plan !== 'premium' && free_usage >= 10) {
            return res.json({ success: false, message: "Limit reached or Premium only." });
        }

        if (!resume) return res.status(400).json({ success: false, message: "No file uploaded" });

        // Fixed size limit: 5MB
        if (resume.size > 5 * 1024 * 1024) {
            return res.json({ success: false, message: "Resume file size exceeds allowed size (5MB)" });
        }

        const dataBuffer = fs.readFileSync(resume.path);
        const pdfData = await pdf(dataBuffer);

        // Fixed template literal syntax (replaced single quotes with backticks)
        const prompt = `Review the following resume and provide constructive feedback on its strength, weaknesses, and areas for improvement: \n\n${pdfData.text}`;

        // Using gemini-2.5-flash as requested
        const response = await genAI.getGenerativeModel({ model: "gemini-2.5-flash" }).generateContent(prompt);
        const reviewContent = response.response.text();

        await handleUsageAndDb(userId, 'Resume Review', reviewContent, 'resume', plan, free_usage, publish);

        res.json({ success: true, content: reviewContent });

    } catch (error) {
        console.error("Resume Review Error:", error.message);
        res.status(500).json({ success: false, message: error.message });
    } finally {
        if(resume) cleanupFile(resume.path);
    }
};