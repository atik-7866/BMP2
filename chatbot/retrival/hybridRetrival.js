import { graphSearch } from "./graphSearch.js";
import { similaritySearch } from "./similaritySearch.js";

export async function hybridRetrieve(query, resolvedEntities) {

  const [graphResults, semanticResults] = await Promise.all([
    graphSearch(resolvedEntities),
    similaritySearch(query)
  ]);

  // console.log("Graph Results:", graphResults);
  // console.log("Semantic Search Results:", semanticResults);
  
  return {
    graphResults,
    semanticResults
  };
}