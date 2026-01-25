import axios from "axios";
import FormData from "form-data";
import dotenv from "dotenv";

// 1. Load the .env file manually to check if it works
dotenv.config();

console.log("-----------------------------------------");
console.log("TESTING CLIPDROP KEY...");
console.log("KEY LENGTH:", process.env.CLIPDROP_API_KEY ? process.env.CLIPDROP_API_KEY.length : "MISSING");
console.log("KEY START:", process.env.CLIPDROP_API_KEY ? process.env.CLIPDROP_API_KEY.substring(0, 5) : "NONE");
console.log("-----------------------------------------");

const testClipDrop = async () => {
    try {
        if (!process.env.CLIPDROP_API_KEY) {
            throw new Error("❌ KEY IS MISSING. Check your .env file location.");
        }

        const form = new FormData();
        form.append('prompt', 'a simple red square');

        console.log("📡 Sending test request to ClipDrop...");
        
        const response = await axios.post('https://clipdrop-api.co/text-to-image/v1', form, {
            headers: {
                'x-api-key': process.env.CLIPDROP_API_KEY,
                ...form.getHeaders()
            },
            responseType: 'arraybuffer'
        });

        console.log("✅ SUCCESS! Your API Key is working perfectly.");
        console.log("You can delete this file now.");

    } catch (error) {
        console.log("❌ FAILED!");
        if (error.response) {
            console.log("Server responded with:", error.response.status, error.response.statusText);
            console.log("This means your KEY is invalid or expired.");
        } else {
            console.log("Error:", error.message);
        }
    }
};

testClipDrop();