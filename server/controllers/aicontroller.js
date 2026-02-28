import { GoogleGenerativeAI } from "@google/generative-ai";
import sql from "../configs/db.js";
import { clerkClient } from "@clerk/express";
import { v2 as cloudinary } from 'cloudinary';
import axios from "axios";
import FormData from "form-data";
import fs from "fs";
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import pdf from "pdf-parse-fork";


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

export const removeImageBackground = async (req, res) => {
    const image = req.file;

    try {
        const { userId } = req.auth;
        const plan = req.plan;
        const free_usage = req.free_usage || 0;
        const { publish } = req.body;

        if (plan !== 'premium' && free_usage >= 10) {
            return res.json({ success: false, message: "Limit reached or Premium only." });
        }

        if (!image) {
            return res.status(400).json({ success: false, message: "No image uploaded" });
        }

        // 1. Upload the raw image to Cloudinary
        const result = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    background_removal: "cloudinary_ai"
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );
            uploadStream.end(image.buffer);
        });

        // 2. THE BULLETPROOF FIX: Manually inject the transformation into the URL string
        let transparent_url = result.secure_url;

        // Inject the 'e_background_removal' effect right after '/upload/'
        transparent_url = transparent_url.replace('/upload/', '/upload/e_background_removal/');

        // Force the file extension to be .png so it supports transparency
        transparent_url = transparent_url.replace(/\.(jpg|jpeg|webp)$/i, '.png');

        // Log to database
        await handleUsageAndDb(userId, 'Removed Background', transparent_url, 'image', plan, free_usage, publish);

        // Send the completely formatted URL back to React!
        res.json({ success: true, secure_url: transparent_url });

    } catch (error) {
        console.error("Remove BG Error:", error.message);
        res.status(500).json({ success: false, message: "Failed to process image." });
    }
};
export const removeImageObject = async (req, res) => {
    const image = req.file;

    try {
        const { userId } = req.auth;
        const plan = req.plan;
        const free_usage = req.free_usage || 0;

        // We are using 'object' here to match your frontend fix!
        const { publish, object } = req.body;

        if (plan !== 'premium' && free_usage >= 10) {
            return res.json({ success: false, message: "Limit reached or Premium only." });
        }

        // 1. Validate inputs
        if (!image) return res.status(400).json({ success: false, message: "No image uploaded" });
        if (!object) return res.status(400).json({ success: false, message: "No object specified to remove" });

        // 2. THE FIX: Convert Multer memory buffer to Base64 string
        // This completely bypasses the need for image.path!
        const b64 = Buffer.from(image.buffer).toString("base64");
        const dataURI = `data:${image.mimetype};base64,${b64}`;

        // 3. Upload the Base64 string directly to Cloudinary
        const uploadResult = await cloudinary.uploader.upload(dataURI, {
            resource_type: "image"
        });

        // 4. Apply Cloudinary's Generative Remove via the URL string
        const imageUrl = cloudinary.url(uploadResult.public_id, {
            secure: true,
            effect: `gen_remove:prompt_${object}`
        });

        // 5. Log to database
        await handleUsageAndDb(userId, `Removed ${object} from image`, imageUrl, 'image', plan, free_usage, publish);

        // 6. Send the generated URL back to React
        res.json({ success: true, secure_url: imageUrl });

    } catch (error) {
        console.error("Remove Object Error:", error.message);
        // Sending error.message helps us see Cloudinary's exact complaints on the frontend
        res.status(400).json({ success: false, message: error.message });
    }
};

// 6. Resume Review


export const resumeReview = async (req, res) => {
    const resume = req.file;

    try {
        // FIX 1: Clerk auth is an object, not a function
        const { userId } = req.auth();
        const plan = req.plan;
        const free_usage = req.free_usage || 0;
        const { publish } = req.body;

        if (plan !== 'premium' && free_usage >= 10) {
            return res.json({ success: false, message: "Limit reached or Premium only." });
        }

        if (!resume) return res.status(400).json({ success: false, message: "No file uploaded" });

        if (resume.size > 5 * 1024 * 1024) {
            return res.json({ success: false, message: "Resume file size exceeds allowed size (5MB)" });
        }

        // FIX 2: Support Multer memoryStorage (buffer) or diskStorage (path) safely
        const dataBuffer = resume.buffer ? resume.buffer : fs.readFileSync(resume.path);

        // Extract text from the PDF
        
        const pdfData = await pdf(dataBuffer);

        // FIX 3: Force Gemini to output strict JSON matching our React State
        const prompt = `
        You are an expert ATS resume reviewer and career coach. Review the following resume text and provide constructive feedback. 
        
        You MUST respond ONLY with a valid JSON object using the exact structure below. Do not add markdown formatting or extra conversational text.
        {
            "score": <number between 1 and 100 representing overall quality>,
            "summary": "<A detailed overall summary of the resume's strength>",
            "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
            "improvements": ["<improvement 1>", "<improvement 2>", "<improvement 3>"]
        }
        
        Resume Text:
        ${pdfData.text}
        `;

        const response = await genAI.getGenerativeModel({ model: "gemini-2.5-flash" }).generateContent(prompt);
        let reviewContent = response.response.text();

        // FIX 4: Clean the response in case Gemini wraps it in ```json ... ``` markdown
        reviewContent = reviewContent.replace(/```json/g, '').replace(/```/g, '').trim();

        // Parse the string into an actual JavaScript object
        const analysisData = JSON.parse(reviewContent);

        // Save to Database (I stringified analysisData so it saves nicely in your DB text column)
        await handleUsageAndDb(userId, 'Resume Review', JSON.stringify(analysisData), 'resume', plan, free_usage, publish);

        // FIX 5: Send back the 'analysis' object exactly as React expects it!
        res.json({ success: true, analysis: analysisData });

    } catch (error) {
        console.error("Resume Review Error:", error.message);
        res.status(500).json({ success: false, message: "Failed to analyze resume." });
    } finally {
        // Safe cleanup: Only try to delete if a physical path actually exists
        if (resume && resume.path) cleanupFile(resume.path);
    }
};