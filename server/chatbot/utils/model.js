import { GroqModel1 } from "../../config/config.js";
import { AIMessage, HumanMessage, SystemMessage, ToolMessage } from "@langchain/core/messages";
import { createRetrievalTools } from "../retrival/retrievalTools.js";
import { formatConversationHistory } from "./conversation.js";

export async function generateAnswer(query, conversationHistory = []) {
    const tools = createRetrievalTools();
    const toolMap = new Map(tools.map(retrievalTool => [retrievalTool.name, retrievalTool]));
    const model = GroqModel1.bindTools(tools);
    const recentHistory = formatConversationHistory(conversationHistory);

    const messages = [
        new SystemMessage(`You answer movie knowledge questions using retrieval tools if needed.
            Call graph_search for exact entities, relationships, years, awards, and multi-hop facts.
            Call similarity_search for descriptions, themes, plots, and semantic context.
            Use the rewritten question as the query argument. Call one or both tools when needed.
            The rewritten question is the current request and has priority over every
            earlier conversation message. Use history only to resolve references; never
            answer an earlier request.
            After receiving tool results, answer the user's question naturally and concisely.

            Never mention tools, databases, graph searches, semantic searches, retrieval,
            query rewriting, entity resolution, spelling corrections, or how the information
            was found. Never say that a movie, actor, or name is "listed in the database",
            "associated with" a spelling, or "spelled" a certain way. Do not expose internal
            labels or explain a mismatch between the user's wording and the results.
            Silently use the most likely correct spelling and present the movie information
            directly. Never show synthetic identifiers such as "Movie 0345", "Movie 0997",
            or any title that is only a generic word followed by digits. If the results contain
            only such identifiers and no meaningful title, plot, cast, director, or other
            identifying information, do not list them; say that there is not enough useful
            information to provide a reliable movie answer. If the retrieved information does
            not support an answer, say you are not sure without describing the retrieval problem.`),
        new HumanMessage(`Earlier conversation for reference only:
        ${recentHistory || "None"}

        CURRENT REWRITTEN USER QUESTION:
        ${query}`)
    ];

    for (let attempt = 0; attempt < 4; attempt++) {
        const response = await model.invoke(messages);

        if (!response.tool_calls?.length) {
            return response.content;
        }

        messages.push(new AIMessage({
            content: response.content || "",
            tool_calls: response.tool_calls
        }));

        for (const toolCall of response.tool_calls) {
            const selectedTool = toolMap.get(toolCall.name);
            if (!selectedTool) continue;
            const toolResult = await selectedTool.invoke({ query });
            messages.push(new ToolMessage({ content: String(toolResult), tool_call_id: toolCall.id }));
        }
    }

    return "I am not sure based on the available movie information.";
}