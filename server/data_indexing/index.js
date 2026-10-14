import { extractMoviesFromPDF } from "./parsers/pdf2text.js";
import { uploadMoviesToPinecone } from "./uploaders/uploadPinecone.js";
import { buildGraph } from "./uploaders/uploadNeo4j.js";
import { parseMoviesFromText } from "./parsers/text2jsonManual.js";

async function main() {
    const filePath = "./data_indexing/data/movies.pdf";
    const MovieText = await extractMoviesFromPDF(filePath);
    console.log("Movie Text Extracted:", MovieText.length, "characters");

    const extractedData = parseMoviesFromText(MovieText);
    const fileteredData = extractedData.filter(movie => movie.movie.title && movie.director.name && movie.actors.length && movie.genres.length );

    await uploadMoviesToPinecone(fileteredData);
    await buildGraph(fileteredData);

    console.log("Data Indexing Completed Successfully! ✅");
}

await main();