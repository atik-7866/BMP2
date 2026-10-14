import { GroqModel1 } from "../../config/config.js";

function formatResults(value, maxLength = 12000) {
    const text = JSON.stringify(value ?? null);
    return text.length > maxLength ? `${text.slice(0, maxLength)}\n[truncated]` : text;
}

export async function generateAnswer(query, results) {
    const graphEvidence = Array.isArray(results?.graphResults) ? results.graphResults : [];
    const semanticEvidence = results?.semanticResults?.result?.hits
        ?? results?.semanticResults?.hits
        ?? results?.semanticResults?.matches
        ?? [];

    if (graphEvidence.length === 0 && semanticEvidence.length === 0) {
        return "I could not find a supported match in the movie data.";
    }

    const prompt = `
            User question:
            ${query}

            Graph database results (the only factual source):
            ${formatResults(graphEvidence)}

            Semantic search results (the only factual source):
            ${formatResults(semanticEvidence)}

            Answer using only facts explicitly present in those results.
            Never invent, autocomplete, or guess a movie title, person, year, genre, theme, or award.
            If the results do not support the question, say exactly: I could not find a supported match in the movie data.
            Do not mention databases or technical details.
            Keep the answer concise (2-3 sentences).
            `;

    const response = await Promise.race([
        GroqModel1.invoke(prompt),
        new Promise((_, reject) => {
            setTimeout(() => reject(new Error("Answer generation timed out. Try a shorter question.")), 45000);
        })
    ]);

    return response.content;
}