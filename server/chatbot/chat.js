import { rewriteUserQuery } from "./retrival/queryRewriter.js";
import { generateAnswer } from "./utils/model.js";

export async function getChatbotReply(query, conversationHistory = []) {
    const rewriteResult = await rewriteUserQuery(query, conversationHistory);

    if (!rewriteResult.isMovieQuestion) {
        return rewriteResult.response;
    }

    return generateAnswer(rewriteResult.rewrittenQuery, conversationHistory);
}
