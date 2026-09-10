import { rewriteUserQuery } from "./retrival/queryRewriter.js";
import { generateAnswer } from "./utils/model.js";
import readlineSync  from 'readline-sync';

const conversationHistory = [];

function rememberConversation(userMessage, assistantMessage, intent) {
  conversationHistory.push(
    { role: "user", content: userMessage, ...(intent ? { intent } : {}) },
    { role: "assistant", content: assistantMessage }
  );
  conversationHistory.splice(0, Math.max(0, conversationHistory.length - 6));
}

export async function runQuery(query) {
  const rewriteResult = await rewriteUserQuery(query, conversationHistory);

  if (!rewriteResult.isMovieQuestion) {
    console.log("\nAnswer:\n");
    console.log(rewriteResult.response);
    rememberConversation(query, rewriteResult.response);
    return;
  }

  console.log("Generating answer...");
  const answer = await generateAnswer(rewriteResult.rewrittenQuery, conversationHistory);
  rememberConversation(query, answer, rewriteResult.rewrittenQuery);

  console.log("\nAnswer:\n");
  console.log(answer);
}

async function main() {

    console.log("Welcome to the Movie Knowledge Chatbot! Type 'exit' to quit.");

    while (true) {
        const userProblem = readlineSync.question("Ask me anything--> ");
        if (userProblem == "exit") break;
        await runQuery(userProblem);
    }

}

main();