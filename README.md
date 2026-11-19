# MovieKnowledge: Graph RAG

MovieKnowledge is a web-based movie question-answering application built with Graph RAG. It combines a Neo4j knowledge graph with Pinecone semantic search so users can ask questions about movies, actors, directors, genres, themes, and awards.

## 1. Problem

Large collections of movie data are difficult to search with a normal keyword search.

Users may ask questions such as:

- “Which movies feature Zendaya?”
- “Find romantic sci-fi movies.”
- “Who directed The Matrix?”
- “Which movies won an Oscar?”

These questions often need relationships between different pieces of information. A regular search may miss those relationships, while a knowledge graph can represent them directly.

## 2. Why Graph RAG Is Useful

Graph RAG combines two types of retrieval:

- **Graph search** finds exact relationships, for example actors in movies or directors of movies.
- **Semantic search** finds related information based on meaning, descriptions, and loosely matching words.

Together, they help the system answer structured and descriptive movie questions.

## 3. Technology Stack

### Frontend

- React 19
- Vite
- Tailwind CSS 4
- Axios
- React Markdown

### Backend

- Node.js
- Express
- LangChain
- Groq language models
- Zod

### Data and Tracing

- Neo4j
- Pinecone
- LangSmith

## 4. Agent Architecture

The chatbot uses a small retrieval agent flow.
![Architecture](server\docs\chatbot_arc.png)

### Query Rewriter Agent

The query rewriter:

- decides whether the request is about movies
- rewrites short or unclear questions into standalone questions
- uses recent conversation history to resolve references
- separates greeting and unrelated requests from retrieval requests

### Answer Agent

The answer agent:

- receives the rewritten question
- chooses one or more retrieval tools
- reads the retrieved information
- produces a concise answer in Markdown
- uses conversation history only to resolve references

### Graph Search Tool

The graph search tool:

- converts the question into a read-only Cypher query
- uses Neo4j parameters
- searches movies, actors, directors, genres, themes, and awards

### Similarity Search Tool

The similarity search tool:

- searches indexed movie text in Pinecone
- returns semantically similar movie records
- provides supporting details such as title, year, cast, director, genres, themes, and awards

## 5. Retrieval Flow

1. The user asks a question in the React interface.
2. The frontend sends the question and session ID to the Express API.
3. The server rewrites the question and checks whether it is movie-related.
4. The answer agent calls the graph search tool and, if needed, the similarity search tool.
5. Neo4j handles exact relationships and graph queries.
6. Pinecone handles semantic or descriptive matching.
7. The agent combines the useful results into an answer.
8. The answer is returned to the frontend as Markdown.

## 6. Knowledge Graph Structure

The Neo4j graph has this structure:

```text
(:Actor)-[:ACTED_IN]->(:Movie)
(:Director)-[:DIRECTED]->(:Movie)
(:Movie)-[:BELONGS_TO]->(:Genre)
(:Movie)-[:EXPLORES]->(:Theme)
(:Movie)-[:WON]->(:Award)
```

Movie nodes contain the title and release year. Actor and director nodes contain names. Awards can also contain award categories.

Indexes are created for movie titles, actor names, director names, genre names, theme names, and award names/categories.

## 7. Project Structure

```text
MovieKnowledge/
├── client/
│   ├── src/
│   │   ├── api/              Frontend API client
│   │   ├── App.jsx           Chat interface
│   │   └── main.jsx          React entry point
│   └── package.json
├── server/
│   ├── chatbot/
│   │   ├── retrival/         Query rewriting and retrieval tools
│   │   ├── utils/            Answer generation and history
│   │   ├── chat.js           Agent flow
│   │   └── index.js          CLI entry point
│   ├── config/
│   │   └── config.js         Groq, Pinecone, Neo4j, LangSmith config
│   ├── data_indexing/
│   │   ├── data/             Source PDF files
│   │   ├── parsers/          PDF and text parsers
│   │   └── uploaders/        Pinecone and Neo4j loaders
│   ├── index.js              Express API
│   └── package.json
└── README.md
```

## 8. Prerequisites

Install:

- Node.js 18 or newer
- npm
- a Groq API key
- a Pinecone account and index
- a Neo4j database
- an optional LangSmith account

## 9. Environment Setup

Create `server/.env` using `server/.env.example`.

```dotenv
GROQ_API_KEY1="your_groq_key"
GROQ_API_KEY2="your_second_groq_key"
PINECONE_API_KEY="your_pinecone_key"
PINECONE_INDEX="your_pinecone_index"
NEO4J_URI="neo4j+s://your-database"
NEO4J_USERNAME="neo4j"
NEO4J_PASSWORD="your_password"
LANGSMITH_TRACING="true"
LANGSMITH_ENDPOINT="https://api.smith.langchain.com"
LANGSMITH_API_KEY="your_langsmith_key"
LANGSMITH_PROJECT="movie-knowledge-chatbot"
PORT="5000"
CLIENT_URL="http://localhost:5173"
```

Create `client/.env` using `client/.env.example`.

```dotenv
VITE_SERVER_URL=http://localhost:5000
```

Variable names must match the server configuration. In particular, the Groq model configuration currently uses `GROQ_API_KEY1` and `GROQ_API_KEY2`.

## 10. Install Dependencies

From the project root:

```bash
cd server
npm install

cd ../client
npm install
```

## 11. Index the Movie Data

Place the source PDF inside:

```text
server/data_indexing/data/movies-real.pdf
```

Then run:

```bash
cd server
npm run data_indexing
```

This process:

1. extracts text from the PDF
2. converts movie blocks into structured records
3. removes records missing required fields
4. uploads movie documents to Pinecone
5. creates nodes and relationships in Neo4j
6. creates Neo4j indexes

The indexing script uses the source file configured in `server/data_indexing/index.js`.

## 12. Run the Application

Start the backend:

```bash
cd server
npm run dev
```

The API runs at:

```text
http://localhost:5000
```

In a second terminal, start the frontend:

```bash
cd client
npm run dev
```

Open the Vite URL printed in the terminal, usually:

```text
http://localhost:5173
```

## 13. Run the CLI

The chatbot is also available in the terminal:

```bash
cd server
npm run dev_cli
```

Type `exit` to stop the CLI.

