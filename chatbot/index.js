import { resolveEntities } from "./entityResolver.js";
import { hybridRetrieve } from "./hybridRetrival.js";
import { generateAnswer } from "./utils/model.js";
import readlineSync  from 'readline-sync';

export async function runQuery(query) {

  console.log("Resolving entities...");
  const resolved = await resolveEntities(query);

//   console.log("Resolved Entities:", JSON.stringify(resolved, null, 2));

  console.log("Retrieving data...");
  const results = await hybridRetrieve(query, resolved);

  console.log("Generating answer...");
  const answer = await generateAnswer(query, results);

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