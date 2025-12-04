---
mode: agent
description: RAG system architecture and query patterns
---

# RAG (Retrieval-Augmented Generation) Patterns

Build and query knowledge bases for LLM-powered applications.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         INGESTION                           │
│  Documents → Chunking → Embeddings → Vector Database        │
└─────────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────────┐
│                         RETRIEVAL                           │
│  Query → Embedding → Similarity Search → Top-K Chunks       │
└─────────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────────┐
│                         GENERATION                          │
│  Chunks + Query → LLM Context → Response                    │
└─────────────────────────────────────────────────────────────┘
```

## Chunking Strategies

### 1. Fixed-Size Chunking

```typescript
function fixedSizeChunk(
  text: string,
  chunkSize: number = 512,
  overlap: number = 50
): string[] {
  const chunks: string[] = [];
  let start = 0;
  
  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    chunks.push(text.slice(start, end));
    start += chunkSize - overlap;
  }
  
  return chunks;
}
```

**Use when:** Uniform content where structure matters less.

### 2. Recursive Character Chunking

```typescript
function recursiveChunk(
  text: string,
  separators: string[] = ['\n\n', '\n', '. ', ' '],
  maxSize: number = 512
): string[] {
  const chunks: string[] = [];
  
  function split(content: string, sepIndex: number): void {
    if (content.length <= maxSize || sepIndex >= separators.length) {
      chunks.push(content);
      return;
    }
    
    const parts = content.split(separators[sepIndex]);
    for (const part of parts) {
      if (part.length > maxSize) {
        split(part, sepIndex + 1);
      } else {
        chunks.push(part);
      }
    }
  }
  
  split(text, 0);
  return chunks;
}
```

**Use when:** Documents with paragraph structure (Markdown, articles).

### 3. Markdown-Aware Chunking

```typescript
function markdownChunk(content: string): string[] {
  const chunks: string[] = [];
  const sections = content.split(/(?=^#{1,3} )/m);
  
  for (const section of sections) {
    if (section.length > MAX_CHUNK_SIZE) {
      // Further split by paragraphs
      chunks.push(...recursiveChunk(section));
    } else {
      chunks.push(section);
    }
  }
  
  return chunks;
}
```

**Use when:** Knowledge base documents with headers.

## Search Types

### Dense (Vector) Search

Best for semantic similarity.

```typescript
// Generate query embedding
const queryEmbedding = await embed(query);

// Search in pgvector
const results = await db.query(`
  SELECT 
    id,
    content,
    1 - (embedding <=> $1::vector) as similarity
  FROM chunks
  ORDER BY embedding <=> $1::vector
  LIMIT $2
`, [queryEmbedding, limit]);
```

### Sparse (Keyword) Search

Best for exact terms, error codes, IDs.

```typescript
// PostgreSQL full-text search
const results = await db.query(`
  SELECT 
    id,
    content,
    ts_rank(search_vector, plainto_tsquery('english', $1)) as rank
  FROM chunks
  WHERE search_vector @@ plainto_tsquery('english', $1)
  ORDER BY rank DESC
  LIMIT $2
`, [query, limit]);
```

### Hybrid Search (Recommended)

Combines semantic and keyword search.

```typescript
async function hybridSearch(
  query: string,
  limit: number,
  alpha: number = 0.7  // Weight for vector search
): Promise<SearchResult[]> {
  const [vectorResults, keywordResults] = await Promise.all([
    vectorSearch(query, limit * 2),
    keywordSearch(query, limit * 2),
  ]);

  // Reciprocal Rank Fusion
  const scores = new Map<string, number>();
  const k = 60; // RRF constant

  vectorResults.forEach((r, i) => {
    scores.set(r.id, (scores.get(r.id) || 0) + alpha / (k + i + 1));
  });

  keywordResults.forEach((r, i) => {
    scores.set(r.id, (scores.get(r.id) || 0) + (1 - alpha) / (k + i + 1));
  });

  return Array.from(scores.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([id, score]) => ({ id, score }));
}
```

## Database Schema (pgvector)

```sql
-- Enable extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create chunks table
CREATE TABLE chunks (
  id SERIAL PRIMARY KEY,
  skill_id VARCHAR(100) NOT NULL,
  content TEXT NOT NULL,
  embedding vector(768),  -- Gemini text-embedding-004
  search_vector tsvector,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_chunks_embedding ON chunks 
  USING hnsw (embedding vector_cosine_ops);

CREATE INDEX idx_chunks_search ON chunks 
  USING gin(search_vector);

-- Trigger for search vector
CREATE OR REPLACE FUNCTION update_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := to_tsvector('english', NEW.content);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER chunks_search_vector_trigger
BEFORE INSERT OR UPDATE ON chunks
FOR EACH ROW EXECUTE FUNCTION update_search_vector();
```

## Embedding Generation

```typescript
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: 'text-embedding-004' });

async function generateEmbedding(text: string): Promise<number[]> {
  const result = await model.embedContent(text);
  return result.embedding.values;
}

async function batchEmbed(texts: string[]): Promise<number[][]> {
  const results = await model.batchEmbedContents({
    requests: texts.map(text => ({ content: { parts: [{ text }] } })),
  });
  return results.embeddings.map(e => e.values);
}
```

## Query Protocol

### When to Query

**✅ DO Query:**
- Starting complex technical tasks
- Need best practices or decision frameworks
- Encountering knowledge gaps

**❌ DON'T Query:**
- Simple conversational requests
- Already have skill in context
- Task fully covered by system prompt

### Query Flow

```typescript
async function retrieveAndGenerate(
  query: string,
  systemPrompt: string
): Promise<string> {
  // 1. Retrieve relevant chunks
  const chunks = await hybridSearch(query, 5);
  
  // 2. Build context
  const context = chunks
    .map(c => c.content)
    .join('\n\n---\n\n');
  
  // 3. Generate with context
  const response = await llm.chat([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: `
Context from knowledge base:
${context}

User query: ${query}
    `},
  ]);
  
  return response;
}
```

## Evaluation Metrics

| Metric | Description |
|--------|-------------|
| **Faithfulness** | Answer from context only |
| **Answer Relevance** | Addresses the query |
| **Context Precision** | Relevant chunks ranked high |
| **Context Recall** | All needed info retrieved |

## Key Principles

1. **Chunk semantically** — Don't cut in middle of concepts
2. **Hybrid search** — Combine semantic + keyword
3. **Overlap chunks** — Avoid lost context at boundaries
4. **Test retrieval** — Measure before optimizing generation
5. **Metadata matters** — Store source, section, skill ID
