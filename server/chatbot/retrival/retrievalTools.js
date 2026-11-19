import { z } from "zod";
import { tool } from "@langchain/core/tools";
import { graphSearch } from "./graphSearch.js";
import { similaritySearch } from "./similaritySearch.js";

const querySchema = z.object({
  query: z.string().min(1)
});

export function createRetrievalTools() {
  return [
    tool(
      async ({ query }) => {
        const graphResults = await graphSearch(query);
        if (graphResults.length > 0) {
          return JSON.stringify(graphResults);
        }

        return JSON.stringify(await similaritySearch(query));
      },
      {
        name: "graph_search",
        description: "Search the movie knowledge graph for exact entities, relationships, years, awards, and multi-hop facts.",
        schema: querySchema
      }
    ),
    tool(
      async ({ query }) => JSON.stringify(await similaritySearch(query)),
      {
        name: "similarity_search",
        description: "Search semantically similar movie documents for descriptions, themes, plots, and supporting context.",
        schema: querySchema
      }
    )
  ];
}
