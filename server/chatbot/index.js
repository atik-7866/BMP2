import { getChatbotReply } from "./chat.js";
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
  console.log("\nGenerating answer...");
  const answer = await getChatbotReply(query, conversationHistory);
  rememberConversation(query, answer);
  return answer;
}

async function main() {

  console.log("\nWelcome to the Movie Knowledge Chatbot! Type 'exit' to quit.\n");

  while (true) {
    const userProblem = readlineSync.question("\nAsk me anything--> ");
    if (userProblem == "exit") break;
    const answer = await runQuery(userProblem);
    console.log("\nAnswer:\n");
    console.log(answer);
    console.log("-".repeat(100));
  }

}
