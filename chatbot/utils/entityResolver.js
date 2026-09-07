import { z } from "zod";
import { GroqModel1 } from "../config/config.js";

const IntentSchema = z.object({
    movies: z.array(z.string()).nullish().transform(v => v ?? []),
    actors: z.array(z.string()).nullish().transform(v => v ?? []),
    directors: z.array(z.string()).nullish().transform(v => v ?? []),
    genres: z.array(z.string()).nullish().transform(v => v ?? []),
    themes: z.array(z.string()).nullish().transform(v => v ?? []),
    awards: z.array(
        z.object({
            name: z.string(),
            category: z.string().nullish().transform(v => v ?? null)
        })
    ).nullish().transform(v => v ?? []),

    year: z.number().nullish().transform(v => v ?? null),
    resultType: z.enum(["movies", "directors", "actors", "awards", "genres", "themes"])
        .default("movies"),
});

const structuredModel = GroqModel1.withStructuredOutput(IntentSchema);

export async function resolveEntities(query) {
    const raw = await structuredModel.invoke(`
    Extract entities from this movie question.

    Fields:
    - movies:    specific movie titles mentioned
    - actors:    actor names mentioned
    - directors: director names mentioned
    - genres:    genres like Action, Drama, Horror
    - themes:    themes like Friendship, Revenge, Love
    - awards:    list of objects with:
                   name     → award type e.g. "Oscar", "Golden Globe"
                   category → category e.g. "Best Director", "Best Picture"
                              (null if no category mentioned)
    - year:      specific year if mentioned (number)
    - resultType: what the user wants back:
        "movies"    → asking for movie names        e.g. "which movies..."
        "directors" → asking for director names     e.g. "list directors who..."
        "actors"    → asking for actor names        e.g. "which actors..."
        "awards"    → asking for award names        e.g. "what awards did..."
        "genres"    → asking for genres             e.g. "what genres..."
        "themes"    → asking for themes             e.g. "what themes..."

    Examples:
    Q: "Movies with Tom Hanks"
    → { actors: ["Tom Hanks"], resultType: "movies" }

    Q: "Directors Tom Hanks worked with and won Oscar"
    → { actors: ["Tom Hanks"], awards: [{name:"Oscar", category:null}], resultType: "directors" }

    Q: "Movies that won Oscar for Best Picture in 2020"
    → { awards: [{name:"Oscar", category:"Best Picture"}], year: 2020, resultType: "movies" }

    Q: "What themes does Inception explore"
    → { movies: ["Inception"], resultType: "themes" }

    Return JSON only.
    Question: ${query}
  `);

    // console.log("Resolved Entities:", JSON.stringify(raw, null, 2));
    return raw;
}