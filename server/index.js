import "dotenv/config";
import express from "express";
import cors from "cors";
import { runQuery } from "./chatbot/index.js";

const app = express();

app.use(cors({
    origin: process.env.CLIENT_URL,
}));

app.use(express.json());

const PORT = Number(process.env.PORT) || 5000;

app.post("/api/v1/search", async (req, res) => {
    try {
        const question = req.body.question;

        if (typeof question !== "string" || !question.trim()) {
            return res.status(400).json({
                success: false,
                message: "Question is required",
            });
        }

        const ans = await runQuery(question);

        return res.status(200).json({
            success: true,
            data: ans,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Failed to process question",
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});