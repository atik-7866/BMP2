import { traceable } from "langsmith/traceable";
import { index } from "../../config/config.js";

export const similaritySearch = traceable(
  async (query) => {
    return index.searchRecords({
      query: {
        inputs: { text: query },
        topK: 7
      }
    });
  },
  { name: "pinecone_search", run_type: "retriever" }
);
