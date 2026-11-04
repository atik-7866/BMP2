import { traceable } from "langsmith/traceable";
import { rewriteUserQuery } from "./retrival/queryRewriter.js";
import { generateAnswer } from "./utils/model.js";

export async function getChatbotReply(query, conversationHistory = [], sessionId) {
    const run = traceable(
        async (currentQuery, history) => {
            const rewriteResult = await rewriteUserQuery(currentQuery, history);
            console.log(rewriteResult);

            if (!rewriteResult.isMovieQuestion) {
                return rewriteResult.response;
            }

            return generateAnswer(rewriteResult.rewrittenQuery, history);
        },
        {
            name: "movie_chatbot",
            run_type: "chain",
            ...(sessionId ? { metadata: { thread_id: sessionId } } : {}),
            tags: ["movie-bot"],
        }
    );

    return run(query, conversationHistory);
}
