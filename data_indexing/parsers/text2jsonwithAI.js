import { extractMovie1, extractMovie2 } from "../config_structured_models.js";

export async function ExtractData(movieText) {

    // const movieText = moviesText;
    console.log("Total blocks:", movieText.length);

    const movieJSON = [];

    for (let i = 0; i < movieText.length; i++) {

        if (movieText[i].trim().length === 0) continue;  // skip empty blocks    

        try {
            const response1 = await extractMovie1(movieText[i]);
            console.log("Response 1:", response1);
            if (response1) movieJSON.push(response1);
        }

        catch (error) {
            console.error(`Error processing block ${i} with Model 1:`, error);

            const response2 = await extractMovie2(movieText[i]);
            console.log("Response 2:", response2);
            if (response2) movieJSON.push(response2);
        }
    }

    console.log("\n Extraction complete");
    console.log("Movies extracted:", movieJSON.length);

    return movieJSON;
}

// await ExtractData("./Data/movies.pdf")