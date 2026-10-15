import { useState } from "react";
import { chatBoat } from "./api/api.js";
import ReactMarkdown from "react-markdown";

const examples = [
  "Which movies feature both Zendaya and Leonardo DiCaprio?",
  "Which movies explore themes of Technology and Identity?",
  "Which directors have movies that won an Oscar for Best Picture?",
  "Find psychological thrillers released after 2010.",
  "Which movies feature the most actors?",
  "Which movies combine Romance and Sci-Fi genres?",
];

function App() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSearch(e) {
    e.preventDefault();

    const query = question.trim();
    if (!query || loading) return;

    setLoading(true);
    setAnswer(null);
    setError("");

    try {
      const result = await chatBoat.getAnswer(query);

      setAnswer(
        typeof result === "string"
          ? result
          : typeof result?.answer === "string"
            ? result.answer
            : JSON.stringify(result, null, 2)
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to get an answer. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f5f2eb] text-[#252a26]">
      <div className="mx-auto flex min-h-screen w-[calc(100%-32px)] max-w-4xl flex-col sm:w-[calc(100%-64px)]">
        <header className="border-b border-[#dcd9cf] py-6 sm:py-8">
          <h1 className="font-serif text-2xl font-semibold tracking-tight sm:text-3xl">
            Movie Knowledge
          </h1>
        </header>

        <section className="pt-10 sm:pt-14">
          <form onSubmit={handleSearch}>
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask a question about movies..."
                autoComplete="off"
                required
                className="min-w-0 flex-1 rounded-md border border-[#d7d5cb] bg-[#fbfaf6] px-4 py-3.5 text-sm text-[#252a26] outline-none transition focus:border-[#247f72] focus:ring-2 focus:ring-[#247f72]/10 sm:text-base"
              />

              <button
                type="submit"
                disabled={loading || !question.trim()}
                className="rounded-md bg-[#247f72] px-6 py-3.5 text-sm font-medium text-white transition hover:bg-[#1d685e] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Searching Archive..." : "Search Archive"}
              </button>
            </div>
          </form>

          <div className="mt-5">
            <p className="mb-3 font-mono text-xs font-medium uppercase tracking-[0.12em] text-[#777a70]">
              Try asking
            </p>

            <div className="flex flex-wrap gap-2">
              {examples.map((example) => (
                <button
                  key={example}
                  type="button"
                  onClick={() => setQuestion(example)}
                  className={`rounded-full border px-3.5 py-2 text-left text-xs transition sm:text-sm ${
                    question === example
                      ? "border-[#247f72] bg-[#e5eee7] text-[#205f56]"
                      : "border-[#dcd9cf] bg-transparent text-[#62665e] hover:border-[#247f72] hover:text-[#247f72]"
                  }`}
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        </section>

        {loading && (
          <p className="mt-10 text-sm text-[#777a70]" role="status">
            Searching for an answer...
          </p>
        )}

        {error && (
          <p
            role="alert"
            className="mt-8 rounded-md border border-[#efc8bd] bg-[#fff6f2] p-4 text-sm text-[#a34432]"
          >
            {error}
          </p>
        )}

        {answer !== null && !loading && (
          <section className="mt-10 border-t border-[#dcd9cf] pt-7 sm:mt-12 sm:pt-9">
            <h2 className="mb-5 font-serif text-2xl font-semibold tracking-tight sm:text-3xl">
              Answer
            </h2>

            <article className="max-w-none wrap-break-word text-[14px] leading-7 text-[#343a35] sm:text-[15px] sm:leading-7 [&_h1]:mb-3 [&_h1]:mt-6 [&_h1]:font-serif [&_h1]:text-2xl [&_h1]:font-semibold [&_h1]:text-[#252a26] [&_h2]:mb-3 [&_h2]:mt-6 [&_h2]:font-serif [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-[#252a26] [&_h3]:mb-2 [&_h3]:mt-5 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-[#252a26] [&_p]:mb-4 [&_ol]:mb-5 [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-6 [&_ul]:mb-5 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6 [&_li]:pl-1 [&_strong]:font-semibold [&_strong]:text-[#252a26] [&_em]:italic [&_a]:text-[#247f72] [&_a]:underline [&_blockquote]:my-4 [&_blockquote]:border-l-2 [&_blockquote]:border-[#247f72] [&_blockquote]:pl-4 [&_blockquote]:text-[#62665e] [&_pre]:my-4 [&_pre]:overflow-x-auto [&_pre]:rounded-md [&_pre]:bg-[#e9e6dd] [&_pre]:p-4 [&_pre]:text-xs [&_code]:font-mono [&_code]:text-[0.9em] [&_hr]:my-5 [&_hr]:border-[#dcd9cf]">
              <ReactMarkdown>{answer}</ReactMarkdown>
            </article>
          </section>
        )}
      </div>
    </main>
  );
}

export default App;
