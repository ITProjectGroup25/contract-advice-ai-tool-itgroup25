# RAG Implementation Guide for Contract Advice Tool

## Overview

Implement a Retrieval-Augmented Generation (RAG) system to provide intelligent guidance based on user form submissions.

## Architecture

```
User Form Submission
    ↓
Query Construction (from answers)
    ↓
Vector Embedding
    ↓
Vector Database Search (retrieve relevant guidance)
    ↓
LLM Generation (with retrieved context)
    ↓
Structured Response to User
```

## What You Need to Do

### Phase 1: Prepare Knowledge Base (Data Collection)

#### 1.1 Gather Guidance Documents

Collect all guidance resources that should be searchable:

**Document Categories:**
```
/knowledge-base/
├── nhmrc-guidelines/
│   ├── background-ip-guidelines.md
│   ├── liability-clauses.md
│   ├── multi-institutional-agreements.md
│   └── compliance-requirements.md
├── arc-guidelines/
│   ├── arc-ip-policy.md
│   ├── collaboration-agreements.md
│   └── post-award-management.md
├── internal-policies/
│   ├── university-liability-policy.md
│   ├── insurance-requirements.md
│   ├── indemnity-standards.md
│   └── risk-management-policy.md
├── templates/
│   ├── ip-clause-templates.md
│   ├── collaboration-agreement-template.md
│   └── service-agreement-template.md
└── faqs/
    ├── common-ip-questions.md
    ├── liability-insurance-faq.md
    └── mri-facility-faq.md
```

**Content Format:**
```markdown
---
title: Background IP Guidelines for NHMRC Grants
category: nhmrc-guidelines
tags: [background-ip, nhmrc, intellectual-property, pre-award]
relevance_keywords: [background IP, intellectual property, NHMRC, ownership, license]
applies_to:
  grants_scheme: [nhmrc, mrff]
  clause_type: [background-ip, project-ip]
  query_stage: [pre-award, post-award]
---

# Background IP in NHMRC Grants

## Definition
Background IP refers to intellectual property that exists before the project commences...

## Key Principles
1. **Ownership**: Background IP should remain with the original owner
2. **Access Rights**: Limited to project purposes only
3. **Standard Clause**: "Each party retains ownership..."

## Common Issues
- Collaborators requesting too broad access rights
- Commercial partners wanting ownership transfer
...
```

#### 1.2 Create Guidance Resource Records

Store metadata in database (`guidance_resource` table):

```sql
INSERT INTO guidance_resource (resource_type, title, summary, content_html, content_uri, audience) VALUES
('HTML', 'Background IP Guidelines', 'Understanding background IP in NHMRC grants', '<div>...</div>', NULL, 'Requestor'),
('Link', 'EAAC Training Guide', 'Comprehensive grant management guide', NULL, '/docs/EAAC-Guide.pdf', 'Both'),
('File', 'IP Clause Template', 'Standard IP clause language', NULL, '/templates/ip-clause.docx', 'Admin');
```

#### 1.3 Define Trigger Keywords

Store search keywords (`guidance_trigger` table):

```sql
-- For Background IP resource (resource_id = 1)
INSERT INTO guidance_trigger (form_id, question_id, keyword, match_type, resource_id, weight) VALUES
(1, NULL, 'background ip', 'Contains', 1, 100),
(1, NULL, 'background intellectual property', 'Contains', 1, 100),
(1, NULL, 'existing ip', 'Contains', 1, 80),
(1, NULL, 'pre-existing', 'Contains', 1, 70);

-- For Liability resource (resource_id = 4)
INSERT INTO guidance_trigger (form_id, question_id, keyword, match_type, resource_id, weight) VALUES
(1, NULL, 'unlimited liability', 'Contains', 4, 100),
(1, NULL, 'liability cap', 'Contains', 4, 90),
(1, NULL, 'liability clause', 'Contains', 4, 85);
```

---

### Phase 2: Set Up Vector Database

#### 2.1 Choose Vector Database

**Recommended Options:**

1. **Supabase pgvector** (Best for your project)
   - Already using Supabase
   - No additional infrastructure
   - PostgreSQL extension
   
2. **Pinecone**
   - Managed service
   - Easy setup
   - Pay-as-you-go
   
3. **Weaviate**
   - Open source
   - Self-hosted option

**Recommended: Use Supabase pgvector**

#### 2.2 Enable pgvector in Supabase

```sql
-- Run in Supabase SQL Editor
CREATE EXTENSION IF NOT EXISTS vector;

-- Create embeddings table
CREATE TABLE guidance_embeddings (
  id BIGSERIAL PRIMARY KEY,
  resource_id BIGINT REFERENCES guidance_resource(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  embedding vector(1536), -- OpenAI ada-002 dimension
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create index for similarity search
CREATE INDEX ON guidance_embeddings USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);
```

#### 2.3 Generate Embeddings

Create embeddings for all guidance documents:

```typescript
// scripts/generate-embeddings.ts
import { OpenAI } from 'openai';
import { createClient } from '@supabase/supabase-js';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

async function generateEmbedding(text: string) {
  const response = await openai.embeddings.create({
    model: 'text-embedding-ada-002',
    input: text,
  });
  return response.data[0].embedding;
}

async function processGuidanceResources() {
  // Get all guidance resources
  const { data: resources } = await supabase
    .from('guidance_resource')
    .select('*');

  for (const resource of resources || []) {
    // Combine title, summary, and content for embedding
    const textToEmbed = `
      Title: ${resource.title}
      Summary: ${resource.summary}
      Content: ${stripHtml(resource.content_html)}
    `.trim();

    // Generate embedding
    const embedding = await generateEmbedding(textToEmbed);

    // Store embedding
    await supabase.from('guidance_embeddings').insert({
      resource_id: resource.id,
      content: textToEmbed,
      embedding,
      metadata: {
        resource_type: resource.resource_type,
        title: resource.title,
      },
    });

    console.log(`✓ Processed: ${resource.title}`);
  }
}

processGuidanceResources();
```

---

### Phase 3: Implement RAG Query System

#### 3.1 Create Query Construction Logic

Transform user's form answers into search queries:

```typescript
// lib/rag/queryConstructor.ts

interface FormAnswers {
  [key: string]: string | string[];
}

export function constructSearchQuery(answers: FormAnswers): string {
  const queryParts: string[] = [];

  // Extract query type
  const queryType = answers['query-type'] as string;
  queryParts.push(`Query type: ${queryType}`);

  // Extract selected clause types
  const clauseTypes = answers['simple-clause-type'] as string[];
  if (clauseTypes?.length > 0) {
    queryParts.push(`Clause types: ${clauseTypes.join(', ')}`);
  }

  // Extract grants scheme
  const grantsScheme = answers['simple-grants-scheme'] as string[];
  if (grantsScheme?.length > 0) {
    queryParts.push(`Grants scheme: ${grantsScheme.join(', ')}`);
  }

  // Extract free-text explanation
  const explanation = answers['simple-request-explanation'] as string;
  if (explanation) {
    queryParts.push(`User request: ${explanation}`);
  }

  return queryParts.join('. ');
}

// Example output:
// "Query type: simple. Clause types: background-ip, liability. Grants scheme: nhmrc. 
//  User request: I need to review background IP clause in collaboration agreement..."
```

#### 3.2 Implement Vector Search

```typescript
// lib/rag/vectorSearch.ts

import { createClient } from '@supabase/supabase-js';
import { OpenAI } from 'openai';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function searchGuidance(query: string, topK: number = 5) {
  // Generate query embedding
  const embeddingResponse = await openai.embeddings.create({
    model: 'text-embedding-ada-002',
    input: query,
  });
  const queryEmbedding = embeddingResponse.data[0].embedding;

  // Search for similar documents using cosine similarity
  const { data, error } = await supabase.rpc('match_guidance', {
    query_embedding: queryEmbedding,
    match_threshold: 0.7, // Similarity threshold
    match_count: topK,
  });

  if (error) throw error;

  return data;
}
```

#### 3.3 Create PostgreSQL Function for Similarity Search

```sql
-- Run in Supabase SQL Editor
CREATE OR REPLACE FUNCTION match_guidance(
  query_embedding vector(1536),
  match_threshold FLOAT,
  match_count INT
)
RETURNS TABLE (
  resource_id BIGINT,
  content TEXT,
  similarity FLOAT,
  metadata JSONB
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    ge.resource_id,
    ge.content,
    1 - (ge.embedding <=> query_embedding) AS similarity,
    ge.metadata
  FROM guidance_embeddings ge
  WHERE 1 - (ge.embedding <=> query_embedding) > match_threshold
  ORDER BY ge.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
```

#### 3.4 Implement LLM Response Generation

```typescript
// lib/rag/responseGenerator.ts

import { OpenAI } from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface RetrievedContext {
  content: string;
  similarity: number;
  metadata: any;
}

export async function generateResponse(
  userQuery: string,
  retrievedContexts: RetrievedContext[],
  formAnswers: any
) {
  // Construct context from retrieved documents
  const context = retrievedContexts
    .map((ctx, idx) => `[Document ${idx + 1}]\n${ctx.content}`)
    .join('\n\n');

  // Create system prompt
  const systemPrompt = `You are a university grants and contracts advisor assistant. 
Your role is to provide clear, actionable guidance based on university policies and grant requirements.

User's Form Submission:
- Query Type: ${formAnswers['query-type']}
- Grants Scheme: ${formAnswers['simple-grants-scheme']?.join(', ')}
- Clause Types: ${formAnswers['simple-clause-type']?.join(', ')}
- Stage: ${formAnswers['stage-of-query']}

Use the following retrieved guidance documents to answer the user's query:

${context}

Provide a structured response with:
1. Direct answer to their query
2. Key points they need to know
3. Specific recommendations
4. Any warnings or red flags
5. Next steps

Be concise but comprehensive. Use markdown formatting.`;

  // Generate response
  const completion = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userQuery },
    ],
    temperature: 0.7,
    max_tokens: 1500,
  });

  return completion.choices[0].message.content;
}
```

---

### Phase 4: Create API Endpoint

#### 4.1 RAG Query API

```typescript
// app/api/v1/guidance/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { constructSearchQuery } from '@/lib/rag/queryConstructor';
import { searchGuidance } from '@/lib/rag/vectorSearch';
import { generateResponse } from '@/lib/rag/responseGenerator';
import { getSupabaseAdmin } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { submissionId, formAnswers } = body;

    // 1. Construct search query from form answers
    const searchQuery = constructSearchQuery(formAnswers);
    console.log('Search query:', searchQuery);

    // 2. Perform vector search
    const retrievedDocs = await searchGuidance(searchQuery, 5);
    console.log(`Retrieved ${retrievedDocs.length} relevant documents`);

    // 3. Get full resource details
    const supabase = getSupabaseAdmin();
    const resourceIds = retrievedDocs.map((doc) => doc.resource_id);
    const { data: resources } = await supabase
      .from('guidance_resource')
      .select('*')
      .in('id', resourceIds);

    // 4. Generate AI response
    const aiResponse = await generateResponse(
      searchQuery,
      retrievedDocs,
      formAnswers
    );

    // 5. Combine with structured resources
    const response = {
      submissionId,
      queryType: formAnswers['query-type'],
      aiGeneratedGuidance: aiResponse,
      relevantResources: resources?.map((resource, idx) => ({
        ...resource,
        relevanceScore: retrievedDocs[idx].similarity,
      })),
      searchQuery,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('RAG query error:', error);
    return NextResponse.json(
      { error: 'Failed to generate guidance' },
      { status: 500 }
    );
  }
}
```

#### 4.2 Usage Example

```typescript
// Call from frontend after form submission
const response = await fetch('/api/v1/guidance', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    submissionId: 'SR-20251016-001',
    formAnswers: {
      'query-type': 'simple',
      'simple-clause-type': ['background-ip'],
      'simple-grants-scheme': ['nhmrc'],
      'simple-request-explanation': 'Need help with background IP clause...',
      // ... other answers
    },
  }),
});

const guidance = await response.json();
console.log(guidance.aiGeneratedGuidance);
```

---

### Phase 5: Hybrid Search (RAG + Rule-Based)

Combine vector search with rule-based matching for best results:

```typescript
// lib/rag/hybridSearch.ts

export async function getGuidanceForSubmission(formAnswers: any) {
  // 1. Rule-based matching (for exact clause types, etc.)
  const ruleBasedResources = await getRuleBasedMatches(formAnswers);

  // 2. Vector search (for semantic understanding)
  const searchQuery = constructSearchQuery(formAnswers);
  const vectorResults = await searchGuidance(searchQuery, 5);

  // 3. Combine and deduplicate
  const allResourceIds = new Set([
    ...ruleBasedResources.map((r) => r.id),
    ...vectorResults.map((r) => r.resource_id),
  ]);

  // 4. Fetch full resources
  const supabase = getSupabaseAdmin();
  const { data: resources } = await supabase
    .from('guidance_resource')
    .select('*')
    .in('id', Array.from(allResourceIds));

  // 5. Score and rank
  return resources?.map((resource) => {
    const ruleMatch = ruleBasedResources.find((r) => r.id === resource.id);
    const vectorMatch = vectorResults.find((r) => r.resource_id === resource.id);

    return {
      ...resource,
      score: (ruleMatch ? 0.6 : 0) + (vectorMatch?.similarity || 0) * 0.4,
      matchType: ruleMatch ? 'rule-based' : 'semantic',
    };
  }).sort((a, b) => b.score - a.score);
}

async function getRuleBasedMatches(formAnswers: any) {
  const supabase = getSupabaseAdmin();
  const conditions = [];

  // Match based on clause types
  if (formAnswers['simple-clause-type']) {
    conditions.push(
      ...formAnswers['simple-clause-type'].map((type: string) => 
        `metadata->>'clause_type' @> '["${type}"]'`
      )
    );
  }

  // Query with conditions
  const { data } = await supabase
    .from('guidance_resource')
    .select('*')
    // Add your filtering logic here
    ;

  return data || [];
}
```

---

## Environment Variables

Add to `.env.local`:

```bash
# OpenAI
OPENAI_API_KEY=sk-...

# Supabase (already have these)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-key
```

---

## Cost Estimation

### OpenAI API Costs (text-embedding-ada-002)

- Embedding generation: $0.0001 / 1K tokens
- 100 guidance documents (avg 500 tokens each): ~$0.005
- Per query embedding: ~$0.0001
- Per month (1000 queries): ~$0.10

### OpenAI API Costs (GPT-4 response)

- GPT-4-turbo: $0.01 / 1K input tokens, $0.03 / 1K output tokens
- Per response (avg 2K input + 1K output): ~$0.05
- Per month (1000 queries): ~$50

**Monthly Estimate: ~$50-60 for 1000 queries**

---

## Testing Strategy

### 1. Test Query Construction
```typescript
const testAnswers = {
  'query-type': 'simple',
  'simple-clause-type': ['background-ip'],
  'simple-request-explanation': 'Need help with IP clause',
};
const query = constructSearchQuery(testAnswers);
console.log(query);
```

### 2. Test Vector Search
```typescript
const results = await searchGuidance('background intellectual property NHMRC');
console.log(results);
```

### 3. Test End-to-End
```typescript
const guidance = await getGuidanceForSubmission(testFormAnswers);
console.log(guidance);
```

---

## Monitoring & Improvement

### Log Search Queries
```sql
INSERT INTO guidance_search_log (submission_id, query_text, results_count)
VALUES (123, 'background ip nhmrc', 5);
```

### Track User Feedback
```sql
ALTER TABLE submission ADD COLUMN guidance_helpful BOOLEAN;
ALTER TABLE submission ADD COLUMN guidance_feedback TEXT;
```

### Iterate Based on Data
- Monitor which queries get poor results
- Add more guidance documents for underserved topics
- Refine embeddings based on user feedback

---

## Next Steps Checklist

- [ ] Set up pgvector in Supabase
- [ ] Collect and format guidance documents
- [ ] Generate embeddings for all documents
- [ ] Implement query construction logic
- [ ] Create RAG API endpoint
- [ ] Test with sample queries
- [ ] Integrate with form submission flow
- [ ] Add user feedback mechanism
- [ ] Monitor and iterate
