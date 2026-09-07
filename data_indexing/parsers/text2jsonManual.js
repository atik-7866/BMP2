export function parseMovieBlock(text) {

  const lines = text.split("\n");

  const result = {
    movie: { title: null, year: null },
    director: { name: null },
    actors: [],
    genres: [],
    themes: [],
    awards: [],
  };

  let currentSection = null;

  for (let rawLine of lines) {
    const line = rawLine.trim();

    if (!line) continue;

    // ignore page markers
    if (line.startsWith("--") && line.includes("of")) continue;

    // single value fields
    if (line.startsWith("Movie Title:")) {
      result.movie.title = line.replace("Movie Title:", "").trim();
      continue;
    }

    if (line.startsWith("Release Year:")) {
      result.movie.year = Number(line.replace("Release Year:", "").trim());
      continue;
    }

    if (line.startsWith("Director:")) {
      result.director.name = line.replace("Director:", "").trim();
      continue;
    }

    // detect sections
    if (line.startsWith("Actors:")) {
      currentSection = "actors";
      continue;
    }

    if (line.startsWith("Genre:")) {
      currentSection = "genres";
      continue;
    }

    if (line.startsWith("Themes:")) {
      currentSection = "themes";
      continue;
    }

    if (line.startsWith("Awards:")) {
      currentSection = "awards";
      continue;
    }

    // collect list items
    if (line.startsWith("-")) {
      const value = line.replace("-", "").trim();

      // convert "None" → empty
      if (value.toLowerCase() === "none") continue;

      result[currentSection].push(value);
    }
  }

  return result;
}

export function parseMoviesFromText(movieTexts) {
  const movies = [];
  for (const text of movieTexts) {
    const movieData = parseMovieBlock(text);
    movies.push(movieData);
  }
    return movies;
}