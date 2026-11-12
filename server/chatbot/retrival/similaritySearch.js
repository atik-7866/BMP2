import { traceable } from "langsmith/traceable";
import { index } from "../../config/config.js";

export const similaritySearch = traceable(
  async (query) => {
    const result = await index.documents.search({
      scoreBy: [{ type: "embed", field: "text", query }],
      topK: 7,
      includeFields: ["title", "year", "director", "actors", "genres", "themes", "awards"]
    });

    return {
      ...result,
      matches: result.matches.map((match) => ({
        ...match,
        text: `
        ${match.title} (${match.year})
        Directed by ${match.director}
        Actors: ${match.actors.join(", ")}
        Genres: ${match.genres.join(", ")}
        Themes: ${match.themes.join(", ")}
        Awards: ${match.awards.join(", ")}
        `
      }))
    };
  },
  { name: "pinecone_search", run_type: "retriever" }
);
