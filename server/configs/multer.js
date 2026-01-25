import multer from "multer";

// USE MEMORY STORAGE (This keeps the file in RAM so we can access .buffer)
const storage = multer.memoryStorage();

export const upload = multer({ storage });