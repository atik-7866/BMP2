import { ChatGroq } from "@langchain/groq";
import { Pinecone } from "@pinecone-database/pinecone";
import neo4j from "neo4j-driver";
import dotenv from "dotenv";

dotenv.config();

/////////////////////////
//// Pinecone Setup ////
/////////////////////////


// console.log(process.env.PINECONE_API_KEY);

export const pc = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY,
});

export const index = pc.Index(process.env.PINECONE_INDEX);

/////////////////////////
/////  Neo4j Setup /////
/////////////////////////

export const driver = neo4j.driver(
    process.env.NEO4J_URI,
    neo4j.auth.basic(
        process.env.NEO4J_USERNAME,
        process.env.NEO4J_PASSWORD
    )
);

/////////////////////////
//// Test Connections ///
/////////////////////////

export async function testConnections() {
    try {
        const session = driver.session();
        const result = await session.run("RETURN 'Aura Connected' AS msg");
        console.log(result.records[0].get("msg"));

        console.log("Neo4j Connected");
        console.log("Pinecone Ready");
        await session.close();

    } catch (error) {
        console.error("Connection Error:", error);
    }
}

/////////////////
//// GROQ ///////
////////////////

// console.log("KEY1:", process.env.GROQ_API_KEY1 ? "OK" : "MISSING");
// console.log("KEY2:", process.env.GROQ_API_KEY2 ? "OK" : "MISSING");

export const GroqModel1 = new ChatGroq({ apiKey: process.env.GROQ_API_KEY1, model: "openai/gpt-oss-120b", temperature: 0 })
export const GroqModel2 = new ChatGroq({ apiKey: process.env.GROQ_API_KEY2, model: "llama-3.3-70b-versatile", temperature: 0 })

// testConnections();