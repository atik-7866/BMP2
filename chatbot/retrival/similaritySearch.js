import { index } from "../../config/config.js";

export async function similaritySearch(query) {

  const results = await index.searchRecords({
    query: {
      inputs: { text: query },
      topK: 10
    }
  });

  return results;
}
