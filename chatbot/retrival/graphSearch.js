import { driver } from "../config/config.js";

export async function graphSearch(entities) {
  const session = driver.session();

  try {
    let cypher = `MATCH (m:Movie)`;
    const params = {};
    const conditions = [];

    if (entities.movies.length > 0) {
      params.movies = entities.movies.map(m => m.toLowerCase());
      conditions.push(`toLower(m.title) IN $movies`);
    }

    if (entities.year) {
      params.year = entities.year;
      conditions.push(`m.year = $year`);
    }

    if (conditions.length > 0)
      cypher += `\nWHERE ` + conditions.join(" AND ");

    cypher += `\nWITH DISTINCT m`;

    if (entities.actors.length > 0) {
      params.actors = entities.actors.map(a => a.toLowerCase());
      cypher += `
\nMATCH (a:Actor)-[:ACTED_IN]->(m)
WHERE toLower(a.name) IN $actors
WITH DISTINCT m`;
    }

    if (entities.directors.length > 0) {
      params.directors = entities.directors.map(d => d.toLowerCase());
      cypher += `
\nMATCH (d:Director)-[:DIRECTED]->(m)
WHERE toLower(d.name) IN $directors
WITH DISTINCT m`;
    }

    if (entities.genres.length > 0) {
      params.genres = entities.genres.map(g => g.toLowerCase());
      cypher += `
\nMATCH (m)-[:BELONGS_TO]->(g:Genre)
WHERE toLower(g.name) IN $genres
WITH DISTINCT m`;
    }

    if (entities.themes.length > 0) {
      params.themes = entities.themes.map(t => t.toLowerCase());
      cypher += `
\nMATCH (m)-[:EXPLORES]->(t:Theme)
WHERE toLower(t.name) IN $themes
WITH DISTINCT m`;
    }

    if (entities.awards.length > 0) {
      params.awards = entities.awards.map(a => ({
        name:     a.name.toLowerCase(),
        category: a.category ? a.category.toLowerCase() : null
      }));
      cypher += `
\nMATCH (m)-[:WON]->(aw_f:Award)
WHERE ANY(aw_filter IN $awards WHERE
  toLower(aw_f.name) = aw_filter.name
  AND (aw_filter.category IS NULL OR toLower(aw_f.category) = aw_filter.category)
)
WITH DISTINCT m`;
    }

    if (entities.resultType === "directors") {
      cypher += `
\nMATCH (d:Director)-[:DIRECTED]->(m)
OPTIONAL MATCH (m)-[:WON]->(aw:Award)
RETURN DISTINCT
  d.name AS director,
  collect(DISTINCT m.title) AS movies,
  collect(DISTINCT
    CASE WHEN aw IS NOT NULL
         THEN aw.name + CASE WHEN aw.category IS NOT NULL
                             THEN " (" + aw.category + ")"
                             ELSE "" END
    END
  ) AS awards
LIMIT 10`;
    }

    else if (entities.resultType === "actors") {
      cypher += `
\nMATCH (a:Actor)-[:ACTED_IN]->(m)
OPTIONAL MATCH (m)-[:WON]->(aw:Award)
RETURN DISTINCT
  a.name AS actor,
  collect(DISTINCT m.title) AS movies,
  collect(DISTINCT
    CASE WHEN aw IS NOT NULL
         THEN aw.name + CASE WHEN aw.category IS NOT NULL
                             THEN " (" + aw.category + ")"
                             ELSE "" END
    END
  ) AS awards
LIMIT 10`;
    }

    else if (entities.resultType === "awards") {
      cypher += `
\nMATCH (m)-[:WON]->(aw:Award)
RETURN DISTINCT
  aw.name     AS awardName,
  aw.category AS awardCategory,
  collect(DISTINCT m.title) AS movies
LIMIT 10`;
    }

    else if (entities.resultType === "genres") {
      cypher += `
\nMATCH (m)-[:BELONGS_TO]->(g:Genre)
RETURN DISTINCT
  g.name AS genre,
  collect(DISTINCT m.title) AS movies
LIMIT 10`;
    }

    else if (entities.resultType === "themes") {
      cypher += `
\nMATCH (m)-[:EXPLORES]->(t:Theme)
RETURN DISTINCT
  t.name AS theme,
  collect(DISTINCT m.title) AS movies
LIMIT 10`;
    }

    else {
      // Default — full movie detail
      cypher += `
\nOPTIONAL MATCH (d:Director)-[:DIRECTED]->(m)
OPTIONAL MATCH (a:Actor)-[:ACTED_IN]->(m)
OPTIONAL MATCH (m)-[:BELONGS_TO]->(g:Genre)
OPTIONAL MATCH (m)-[:WON]->(aw:Award)
RETURN DISTINCT
  m.title AS movie,
  m.year  AS year,
  collect(DISTINCT d.name) AS directors,
  collect(DISTINCT a.name) AS actors,
  collect(DISTINCT g.name) AS genres,
  collect(DISTINCT
    CASE WHEN aw IS NOT NULL
         THEN aw.name + CASE WHEN aw.category IS NOT NULL
                             THEN " (" + aw.category + ")"
                             ELSE "" END
    END
  ) AS awards
LIMIT 10`;
    }

    const result = await session.run(cypher, params);

    const cleanList = arr => (arr ?? []).filter(v => v != null && v !== "");

    if (entities.resultType === "directors")
      return result.records.map(r => ({
        director: r.get("director"),
        movies:   r.get("movies"),
        awards:   cleanList(r.get("awards"))
      }));

    if (entities.resultType === "actors")
      return result.records.map(r => ({
        actor:  r.get("actor"),
        movies: r.get("movies"),
        awards: cleanList(r.get("awards"))
      }));

    if (entities.resultType === "awards")
      return result.records.map(r => ({
        award:  r.get("awardName") + (r.get("awardCategory") ? ` (${r.get("awardCategory")})` : ""),
        movies: r.get("movies")
      }));

    if (entities.resultType === "genres")
      return result.records.map(r => ({
        genre:  r.get("genre"),
        movies: r.get("movies")
      }));

    if (entities.resultType === "themes")
      return result.records.map(r => ({
        theme:  r.get("theme"),
        movies: r.get("movies")
      }));

    return result.records.map(r => ({
      movie:     r.get("movie"),
      year:      r.get("year"),
      directors: r.get("directors"),
      actors:    r.get("actors"),
      genres:    r.get("genres"),
      awards:    cleanList(r.get("awards"))
    }));

  } finally {
    await session.close();
  }
}
