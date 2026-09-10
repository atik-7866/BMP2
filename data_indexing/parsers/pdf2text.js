import { PDFParse } from "pdf-parse";

export async function extractMoviesFromPDF(filePath) {

  const loader = new PDFParse({ url: filePath });

  const docs = await loader.getText();
  const text = docs.text;

  const movies = text.split(/-{10}/);
  
  const filtered_movies = movies.filter((m) => m.trim().length > 0);

  return filtered_movies;
}
