import { PDFParse } from "pdf-parse";

export async function extractMoviesFromPDF(filePath) {

  // load PDF
  const loader = new PDFParse({ url: filePath });

  // get full text
  const docs = await loader.getText();
  const text = docs.text;

  // Split the Movies 
  const movies = text.split(/-{10}/);
  
  const filtered_movies = movies.filter((m) => m.trim().length > 0);

  return filtered_movies;
}
