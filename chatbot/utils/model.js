import { GroqModel1 } from "../../config/config.js";

export async function generateAnswer(query, results) {

    const prompt = `
            User question:
            ${query}

            Graph database results:
            ${results.graphResults || "None"}

            Semantic search results:
            ${results?.semanticResults || "None"}

            Using both sources, provide the best possible answer.
            If one source is more relevant, prioritize it.
            Do not mention databases or technical details.
            If you are not able to answer says not sure.
            and keep the answer concise (2-3 sentences).
            can go to 10 sentences if the question is complex.
            but not more than that.
            `;

    const response = await GroqModel1.invoke(prompt);

    return response.content;
}