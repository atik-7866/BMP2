import { rewriteUserQuery } from "./retrival/queryRewriter.js";
import { generateAnswer } from "./utils/model.js";
import readlineSync from 'readline-sync';

const conversationHistory = [];

function rememberConversation(userMessage, assistantMessage) {
  conversationHistory.push(
    { role: "user", content: userMessage },
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
    console.log("-".repeat(100));

    return;
  }

  console.log("\nGenerating answer...");
  const answer = await generateAnswer(rewriteResult.rewrittenQuery, conversationHistory);
  rememberConversation(query, answer);

  console.log("\nAnswer:\n");
  console.log(answer);
  console.log("-".repeat(100));
}

async function main() {

  console.log("\nWelcome to the Movie Knowledge Chatbot! Type 'exit' to quit.\n");

  while (true) {
    const userProblem = readlineSync.question("\nAsk me anything--> ");
    if (userProblem == "exit") break;
    await runQuery(userProblem);
  }

}

const currentFile = fileURLToPath(import.meta.url);
const invokedFile = process.argv[1] ? path.resolve(process.argv[1]) : "";

if (currentFile === invokedFile) {
  main();
}