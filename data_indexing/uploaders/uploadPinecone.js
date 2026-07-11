import { index } from "../../config/config.js";

function movieToText(movie) {
    return `
        ${movie.movie.title} (${movie.movie.year})
        Directed by ${movie.director.name}
        Actors: ${movie.actors.join(", ")}
        Genres: ${movie.genres.join(", ")}
        Themes: ${movie.themes.join(", ")}
        Awards: ${movie.awards.join(", ")}
        `;
}

const BATCH_SIZE = 50;   // optimal size

export async function uploadMoviesToPinecone(movies) {

    let batch = [];
    let erroBatch = [];

    for (let i = 0; i < movies.length; i++) {

        const movie = movies[i];

        batch.push({
            id: `movie_${i}`,
            text: movieToText(movie),   // Pinecone generates embeddings
            title: movie.movie.title,
            year: movie.movie.year,
            director: movie.director.name,
            actors: movie.actors,
            genres: movie.genres,
            themes: movie.themes,
            awards: movie.awards

        });

        if (batch.length === BATCH_SIZE) {
            try {
                console.log(`Uploading batch of ${batch.length} movies...`);
                await index.upsertRecords({ records: batch });
                console.log(`Uploaded ${i + 1} movies`);
                batch = [];
            }
            catch (error) {
                console.error("Error uploading batch:", error);
                erroBatch.push(...batch);
                batch = [];
            }
        }
    }

    // Upload any remaining movies in the last batch

    if (erroBatch.length > 0) {
        console.log(`Retrying upload of ${erroBatch.length} movies...`);
        try {
            await index.upsertRecords({ records: erroBatch });
            console.log(`Successfully uploaded erroBatch of ${erroBatch.length} movies`);
        } catch (error) {
            console.error("Error uploading erroBatch:", error);
        }
    }


    console.log("✅ All movies uploaded to Pinecone");
}