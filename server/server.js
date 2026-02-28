import { clerkMiddleware, requireAuth } from '@clerk/express';
import cors from 'cors';
import 'dotenv/config';
import express from 'express';
import connectCloudinary from './configs/cloudinary.js';
import aiRouter from './routes/airoutes.js';
import userRouter from './routes/userRoutes.js';
// Ensure casing matches your filename
console.log("DEBUG CHECK:");
console.log("1. CLERK KEY:", process.env.CLERK_SECRET_KEY ? "✅ Loaded" : "❌ MISSING");
console.log("2. GEMINI KEY:", process.env.GEMINI_API_KEY ? "✅ Loaded" : "❌ MISSING");

const app = express();
await connectCloudinary();

// 1. Global Middleware
app.use(cors());
app.use(express.json());
app.use(clerkMiddleware()); 

// 2. API Routes (Mount these BEFORE the root/generic routes)
// We apply requireAuth() specifically to this group
app.use('/api/ai', requireAuth(), aiRouter);
app.use('/api/user', userRouter);

// 3. Public/Root Routes (Generic fallback)
app.get('/', (req, res) => {
    res.send("Hello from QuickAI");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));