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

const BATCH_SIZE = 96;

export async function uploadMoviesToPinecone(movies) {
    console.log(`\n-------> Uploading movies to Pinecone (batch size: ${BATCH_SIZE})...\n`);

    for (let start = 0; start < movies.length; start += BATCH_SIZE) {
        const batch = movies.slice(start, start + BATCH_SIZE).map((movie, offset) => ({
            _id: `movie_${start + offset}`,
            text: movieToText(movie),
            title: movie.movie.title,
            year: movie.movie.year,
            director: movie.director.name,
            actors: movie.actors,
            genres: movie.genres,
            themes: movie.themes,
            awards: movie.awards,
        }));

        const uploadedCount = start + batch.length;
        try {
            await index.documents.upsert({ documents: batch });
        } catch (error) {
            console.error(`Error uploading movies ${start + 1}-${uploadedCount}:`, error);
            throw error;
        }

        console.log(
            `-------> Uploaded ${uploadedCount}/${movies.length} movies to Pinecone ✅`
        );
    }

    console.log(`\n-------> All ${movies.length} movies uploaded to Pinecone. ✅`);
}