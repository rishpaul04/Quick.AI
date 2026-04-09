import { clerkMiddleware, requireAuth } from '@clerk/express';
import cors from 'cors';
import 'dotenv/config';
import express from 'express';
import connectCloudinary from './configs/cloudinary.js';
import aiRouter from './routes/airoutes.js';
import userRouter from './routes/userRoutes.js';

// 🚨 1. ANTI-CRASH DEBUGGERS
process.on('uncaughtException', (err) => {
  console.error('🚨 UNCAUGHT EXCEPTION KILLED THE APP:', err);
});
process.on('unhandledRejection', (reason, promise) => {
  console.error('🚨 UNHANDLED REJECTION KILLED THE APP:', reason);
});

console.log("DEBUG CHECK:");
console.log("1. CLERK KEY:", process.env.CLERK_SECRET_KEY ? "✅ Loaded" : "❌ MISSING");
console.log("2. GEMINI KEY:", process.env.GEMINI_API_KEY ? "✅ Loaded" : "❌ MISSING");

const app = express();

// 🚨 2. SAFE CLOUDINARY CONNECTION
try {
  await connectCloudinary();
  console.log("3. CLOUDINARY: ✅ Connected");
} catch (error) {
  console.error("❌ CLOUDINARY CONNECTION FAILED:", error);
}

// 3. Global Middleware
app.use(cors({
  origin: "https://quick-ai-s88q.vercel.app", 
  credentials: true 
}));
app.use(express.json());
app.use(clerkMiddleware()); 

// 4. API Routes
app.use('/api/ai', requireAuth(), aiRouter);
app.use('/api/user', userRouter);

// 5. Public/Root Routes
app.get('/', (req, res) => {
    res.send("Hello from QuickAI");
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));