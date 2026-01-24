import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { clerkMiddleware, requireAuth } from '@clerk/express';
import aiRouter from './routes/airoutes.js'; // Ensure casing matches your filename

const app = express();

// 1. Global Middleware
app.use(cors());
app.use(express.json());
app.use(clerkMiddleware()); 

// 2. API Routes (Mount these BEFORE the root/generic routes)
// We apply requireAuth() specifically to this group
app.use('/api/ai', requireAuth(), aiRouter);

// 3. Public/Root Routes (Generic fallback)
app.get('/', (req, res) => {
    res.send("Hello from QuickAI");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));