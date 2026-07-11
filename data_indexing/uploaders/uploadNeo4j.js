// =====================================================================
// Structured JSON → Neo4j Graph (BATCH VERSION)
// =====================================================================
//
// Same idea as before (MERGE = no duplicates, indexes = fast MERGE),
// but instead of running separate queries PER MOVIE, we send a whole
// BATCH of movies in one query using UNWIND.
//
// UNWIND basically turns a list into rows Neo4j can loop over
// server-side, in a single query — much faster than one query per movie.
//
// Example:
//   UNWIND [1, 2, 3] AS x
//   CREATE (:Number {value: x})
//   → creates 3 nodes in ONE query instead of 3 queries
// =====================================================================

import { driver } from "../../config/config.js";

const BATCH_SIZE = 100; // how many movies to send per query batch

// Insert ONE batch (chunk) of movies
async function insertMovieBatch(batch) {
  const session = driver.session();

  try {
    await session.executeWrite(async (tx) => {

      // Movie nodes
      await tx.run(
        `UNWIND $movies AS movie
         MERGE (m:Movie {title: movie.title})
         SET m.year = movie.year`,
        { movies: batch.map((e) => e.movie) }
      );

      // Director nodes + DIRECTED relationships
      await tx.run(
        `UNWIND $rows AS row
         MERGE (d:Director {name: row.directorName})
         MERGE (m:Movie {title: row.title})
         MERGE (d)-[:DIRECTED]->(m)`,
        {
          rows: batch.map((e) => ({
            directorName: e.director.name,
            title: e.movie.title,
          })),
        }
      );

      // Actor nodes + ACTED_IN relationships
      // (flatten: one row per actor, per movie)
      await tx.run(
        `UNWIND $rows AS row
         MERGE (a:Actor {name: row.actorName})
         MERGE (m:Movie {title: row.title})
         MERGE (a)-[:ACTED_IN]->(m)`,
        {
          rows: batch.flatMap((e) =>
            e.actors.map((actorName) => ({ actorName, title: e.movie.title }))
          ),
        }
      );

      // Genre nodes + BELONGS_TO relationships
      await tx.run(
        `UNWIND $rows AS row
         MERGE (g:Genre {name: row.genreName})
         MERGE (m:Movie {title: row.title})
         MERGE (m)-[:BELONGS_TO]->(g)`,
        {
          rows: batch.flatMap((e) =>
            e.genres.map((genreName) => ({ genreName, title: e.movie.title }))
          ),
        }
      );

      // Theme nodes + EXPLORES relationships
      await tx.run(
        `UNWIND $rows AS row
         MERGE (t:Theme {name: row.themeName})
         MERGE (m:Movie {title: row.title})
         MERGE (m)-[:EXPLORES]->(t)`,
        {
          rows: batch.flatMap((e) =>
            e.themes.map((themeName) => ({ themeName, title: e.movie.title }))
          ),
        }
      );

      // Award nodes + WON relationships
      // "Oscar (Best Cinematography)" → type: "Oscar", category: "Best Cinematography"
      const awardRows = batch.flatMap((e) =>
        e.awards
          .map((awardName) => {
            const match = awardName.match(/^(.+?)\s*\((.+)\)$/);
            if (!match) return null;
            return {
              awardType: match[1].trim(),
              category: match[2].trim(),
              title: e.movie.title,
            };
          })
          .filter(Boolean)
      );

      if (awardRows.length > 0) {
        await tx.run(
          `UNWIND $rows AS row
           MERGE (aw:Award {name: row.awardType, category: row.category})
           MERGE (m:Movie {title: row.title})
           MERGE (m)-[:WON]->(aw)`,
          { rows: awardRows }
        );
      }
    });
  } finally {
    await session.close();
  }
}

// Build complete graph for ALL movies, in batches
async function buildGraph(entities) {
  console.log(`\n-------> Building graph for ${entities.length} movies...\n`);

  // Step 1: Create indexes for fast MERGE
  const session = driver.session();
  try {
    await session.run("CREATE INDEX IF NOT EXISTS FOR (m:Movie) ON (m.title)");
    await session.run("CREATE INDEX IF NOT EXISTS FOR (d:Director) ON (d.name)");
    await session.run("CREATE INDEX IF NOT EXISTS FOR (a:Actor) ON (a.name)");
    await session.run("CREATE INDEX IF NOT EXISTS FOR (g:Genre) ON (g.name)");
    await session.run("CREATE INDEX IF NOT EXISTS FOR (t:Theme) ON (t.name)");
    await session.run("CREATE INDEX IF NOT EXISTS FOR (aw:Award) ON (aw.name, aw.category)");
    console.log("-------> Indexes created. ✅");
  } finally {
    await session.close();
  }

  // Step 2: Insert movies in batches instead of one-by-one
  console.log(`\n-------> Inserting movies into graph (batch size: ${BATCH_SIZE})...\n`);
  for (let i = 0; i < entities.length; i += BATCH_SIZE) {
    const batch = entities.slice(i, i + BATCH_SIZE);
    await insertMovieBatch(batch);
    console.log(
      `-------> Inserted ${Math.min(i + BATCH_SIZE, entities.length)}/${entities.length} movies ✅`
    );
  }
  console.log(`\n-------> All movies inserted into graph. ✅`);

  // Step 3: Print stats
  const statsSession = driver.session();
  try {
    const nodeCount = await statsSession.run("MATCH (n) RETURN count(n) AS count");
    const relCount = await statsSession.run("MATCH ()-[r]->() RETURN count(r) AS count");
    console.log(`\n-------> Graph built!`);
    console.log(`\n-------> Nodes: ${nodeCount.records[0].get("count")}`);
    console.log(`\n-------> Relationships: ${relCount.records[0].get("count")}`);
  } finally {
    await statsSession.close();
  }
}

export { insertMovieBatch, buildGraph };