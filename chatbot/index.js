import { resolveEntities } from "./utils/entityResolver.js";
import { hybridRetrieve } from "./retrival/hybridRetrival.js";
import { generateAnswer } from "./utils/model.js";
import readlineSync  from 'readline-sync';
import { fileURLToPath } from "node:url";
import path from "node:path";

export async function runQuery(query) {

  console.log("Resolving entities...");
  const resolved = await resolveEntities(query);

//   console.log("Resolved Entities:", JSON.stringify(resolved, null, 2));

  console.log("Retrieving data...");
  const results = await hybridRetrieve(query, resolved);

  console.log("Generating answer...");
  const answer = await generateAnswer(query, results);

  return { answer, resolved, results };
}

async function main() {

    console.log("Welcome to the Movie Knowledge Chatbot! Type 'exit' to quit.");

    while (true) {
        const userProblem = readlineSync.question("Ask me anything--> ");
        if (userProblem == "exit") break;
        const { answer } = await runQuery(userProblem);
        console.log("\nAnswer:\n");
        console.log(answer);
    }

}

const currentFile = fileURLToPath(import.meta.url);
const invokedFile = process.argv[1] ? path.resolve(process.argv[1]) : "";

if (currentFile === invokedFile) {
  main();
}