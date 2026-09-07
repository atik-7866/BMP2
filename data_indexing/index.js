import { extractMoviesFromPDF } from "./parsers/pdf2text.js";
import { ExtractData } from "./parsers/text2jsonwithAI.js";
import { uploadMoviesToPinecone } from "./uploaders/uploadPinecone.js";
import { buildGraph } from "./uploaders/uploadNeo4j.js";
import { parseMoviesFromText } from "./parsers/text2jsonManual.js";

async function main() {
    const filePath = "./data_indexing/data/movies.pdf";
    const MovieText = await extractMoviesFromPDF(filePath);
    console.log("Movie Text Extracted:", MovieText.length, "characters");

    // Manual Text to JSOn
    const extractedData = parseMoviesFromText(MovieText);
    // const extractedData = await ExtractData(MovieText); // with help of AI
    const fileteredData = extractedData.filter(movie => movie.movie.title && movie.director.name && movie.actors.length && movie.genres.length ); // Remove Movies with missing title or director

    await buildGraph(fileteredData);

    try {
        await uploadMoviesToPinecone(fileteredData);
    } catch (error) {
        console.error("Pinecone indexing failed; Neo4j graph is still available:", error);
    }

    console.log("Data Indexing Completed Successfully! ✅");
}

await main();