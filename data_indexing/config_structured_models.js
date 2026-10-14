import { z } from "zod";
import { GroqModel1, GroqModel2 } from "../config/config.js";

// Schema for Movies
const MovieSchema = 
    z.object({
        movie: z.object({
            title: z.string(),
            year: z.number(),
        }),
        director: z.object({
            name: z.string(),
        }),
        actors: z.array(z.string()),
        genres: z.array(z.string()),
        themes: z.array(z.string()),
        awards: z.array(z.string()),
    }
);

// Structured Model
const structuredModel1 = GroqModel1.withStructuredOutput(MovieSchema);
const structuredModel2 = GroqModel2.withStructuredOutput(MovieSchema);

// Pass function
export async function extractMovie1(text) {
    const response = await structuredModel1.invoke(` 
            Output this EXACT JSON structure:
            {
            "movie": {"title": "string", "year": number},
            "director": {"name": "string"},
            "actors": ["string"],
            "genres": ["string"],
            "themes": ["string"],
            "awards": ["string"]
            }

            Rules:
            - If awards say "None", return awards as empty array []
            - Keep exact names as written in the Text
            - Year must be a number, not string
            - Return ONLY valid JSON. No markdown, no backticks, no explanation. 
            
            Text is given below TEXT: ${text}`);
    return response;
}

export async function extractMovie2(text) {
    const response = await structuredModel2.invoke(` Output this EXACT JSON structure:
            {
            "movie": {"title": "string", "year": number},
            "director": {"name": "string"},
            "actors": ["string"],
            "genres": ["string"],
            "themes": ["string"],
            "awards": ["string"]
            }

            Rules:
            - If awards say "None", return awards as empty array []
            - Keep exact names as written in the Text
            - Year must be a number, not string
            - Return ONLY valid JSON. No markdown, no backticks, no explanation. 
            
            Text is given below TEXT: ${text}`);
    return response;
}
