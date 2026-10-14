# MovieKnowledge

A GraphRAG project built using **Neo4j** and **Pinecone**.

## Setup

1. Clone the repository.

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the project root and add the following:

```env
GROQ_API_KEY1=your_groq_api_key
GROQ_API_KEY2=your_groq_api_key

PINECONE_API_KEY=your_pinecone_api_key
PINECONE_INDEX=your_pinecone_index

NEO4J_URI=your_neo4j_uri
NEO4J_USERNAME=your_neo4j_username
NEO4J_PASSWORD=your_neo4j_password
```

## Index Data

Run the following command to extract and index the dat (Keep Patience this process will be slow):

```bash
npm run data_indexing
```

## Start the Chatbot

Run:

```bash
npm run dev
```
