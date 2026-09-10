import { z } from "zod";
import { driver, GroqModel1 } from "../../config/config.js";

const QueryPlanSchema = z.object({
  cypher: z.string().min(1),
  params: z.string().default("{}")
});

const graphQueryPrompt = `
  You are a Cypher query planner for a read-only movie knowledge graph.
  Create one parameterized Cypher query for the rewritten question.

  Graph structure:
  - (:Movie {title: string, year: integer})
  - (:Actor {name: string})-[:ACTED_IN]->(:Movie)
  - (:Director {name: string})-[:DIRECTED]->(:Movie)
  - (:Movie)-[:BELONGS_TO]->(:Genre {name: string})
  - (:Movie)-[:EXPLORES]->(:Theme {name: string})
  - (:Movie)-[:WON]->(:Award {name: string, category: string})

  Rules:
  - Return useful scalar values and collections with clear aliases.
  - Use case-insensitive comparisons with toLower for names and titles.
  - Use Cypher parameters for user-provided values; put them in params.
  - Always include a LIMIT of 25 or less.
  - Generate read-only Cypher only. Never use CREATE, MERGE, SET, DELETE, REMOVE,
    DROP, LOAD CSV, FOREACH, CALL, or any procedure.
  - Do not use multiple statements or semicolons.

  Examples:
  Question: Which movies did Tom Hanks act in that were directed by Robert Zemeckis?
  Cypher:
  MATCH (a:Actor)-[:ACTED_IN]->(m:Movie)<-[:DIRECTED]-(d:Director)
  WHERE toLower(a.name) = toLower($actor) AND toLower(d.name) = toLower($director)
  RETURN m.title AS movie, m.year AS year
  ORDER BY year DESC LIMIT 25
  Params: "{\"actor\":\"Tom Hanks\",\"director\":\"Robert Zemeckis\"}"

  Question: Which actors worked with the director of Inception?
  Cypher:
  MATCH (director:Director)-[:DIRECTED]->(m:Movie {title: $movie})
  MATCH (actor:Actor)-[:ACTED_IN]->(other:Movie)<-[:DIRECTED]-(director)
  RETURN director.name AS director, actor.name AS actor,
        collect(DISTINCT other.title) AS movies
  LIMIT 25
  Params: "{\"movie\":\"Inception\"}"

  Question: What genres and themes are connected to movies that won an Oscar?
  Cypher:
  MATCH (m:Movie)-[:WON]->(award:Award)
  WHERE toLower(award.name) = toLower($award)
  OPTIONAL MATCH (m)-[:BELONGS_TO]->(genre:Genre)
  OPTIONAL MATCH (m)-[:EXPLORES]->(theme:Theme)
  RETURN m.title AS movie, collect(DISTINCT genre.name) AS genres,
        collect(DISTINCT theme.name) AS themes
  LIMIT 25
  Params: "{\"award\":\"Oscar\"}"
  `;

const mutationPattern = /\b(CREATE|MERGE|SET|DELETE|REMOVE|DROP|LOAD\s+CSV|FOREACH|CALL|APOC|DBMS)\b/i;

export function assertReadOnlyCypher(cypher) {
  const normalized = cypher.trim();

  if (!normalized || normalized.includes(";") || mutationPattern.test(normalized)) {
    throw new Error("Generated Cypher was rejected because it is not a single read-only query.");
  }

  if (!/\bRETURN\b/i.test(normalized)) {
    throw new Error("Generated Cypher was rejected because it does not return results.");
  }

  return normalized;
}

async function planQuery(query) {
  const model = GroqModel1.withStructuredOutput(QueryPlanSchema);
  const result = await model.invoke(`${graphQueryPrompt}

  Return JSON with exactly two fields: cypher and params.
  The params field must be a JSON-encoded string containing an object.
  Rewritten question: ${query}`);

  let params = {};
  try {
    params = JSON.parse(result.params);
  } catch {
    throw new Error("Generated Cypher parameters were not valid JSON.");
  }

  if (!params || Array.isArray(params) || typeof params !== "object") {
    throw new Error("Generated Cypher parameters must be a JSON object.");
  }

  return {
    cypher: assertReadOnlyCypher(result.cypher),
    params
  };
}

export async function graphSearch(query) {
  const session = driver.session();
  try {
    const queryPlan = await planQuery(query);
    const result = await session.run(queryPlan.cypher, queryPlan.params);

    return result.records.map(record => record.toObject());
  } finally {
    await session.close();
  }
}
