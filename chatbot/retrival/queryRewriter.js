import { z } from "zod";
import { GroqModel1 } from "../../config/config.js";
import { formatConversationHistory } from "../utils/conversation.js";

const RewrittenQuerySchema = z.object({
    isMovieQuestion: z.boolean(),
    rewrittenQuery: z.string(),
    response: z.string()
});

export async function rewriteUserQuery(query, conversationHistory = []) {
    const model = GroqModel1.withStructuredOutput(RewrittenQuerySchema);
    const recentHistory = formatConversationHistory(conversationHistory);

    const result = await model.invoke(`
        Understand the user's intent before deciding whether retrieval is needed.
        Use the recent conversation and the latest message together. The latest message
        may be short, informal, misspelled, or refer to an earlier movie, person, genre,
        mood, or recommendation.

        Set isMovieQuestion to true for any movie-related intent, including requests to
        recommend a movie, requests made because the user is bored, comparisons,
        follow-up questions such as "any other one?", and questions about movies,
        actors, directors, genres, themes, awards, or relationships.
        For these requests, rewrite the intent as one precise standalone movie question.
        Resolve references from the recent conversation and preserve all user constraints.
        A short follow-up may replace only one part of the previous request. Carry forward
        every unresolved constraint, such as genre, actor, director, year, mood, or request
        type, unless the latest message clearly changes it. For example, after a request
        for romantic movies featuring Zendaya, "Of Zendaya" still means romantic movies
        featuring Zendaya, not all movies featuring Zendaya.
        Do not answer the question in this step.

        Examples:
        - "I'm feeling bored, suggest me something" becomes
            "Recommend a movie I might enjoy; use any genre or preferences from the recent conversation."
        - "Any other movie then it?" becomes a request for another movie related to the
            previously discussed movie or criteria.
        - "What about the director?" becomes a question about the director of the movie
            discussed in the recent conversation.

        For capability questions, greetings, and clarification requests, set
        isMovieQuestion to false and provide a helpful response explaining what this
        movie assistant can do.
        For unrelated requests, set isMovieQuestion to false and provide a short polite
        refusal. Do not reject a request merely because it is informal or does not contain
        an explicit movie name.
    Return JSON with exactly these fields: isMovieQuestion, rewrittenQuery, response.

    Recent conversation:
    ${recentHistory || "None"}

    Latest question: ${query}`);

    return result;
}
