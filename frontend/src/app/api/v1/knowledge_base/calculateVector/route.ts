import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { HfInference } from '@huggingface/inference';

const hf = new HfInference(process.env.HF_TOKEN);


export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// use the Hugging Face Inference API to generate bge-m3 embeddings
// Use the official SDK and force the feature-extraction (embedding) task
async function embedWithBGE_M3(query: string): Promise<number[]> {
  const output = await hf.featureExtraction({
    model: 'BAAI/bge-m3',
    inputs: `query: ${query}`,
    // provider: 'hf-inference',
  });

  // output could be Float32Array | number[] | number[][] | number[][][]
  const toVector = (x: any): number[] => {
    if (ArrayBuffer.isView(x)) return Array.from(x as Float32Array);
    if (Array.isArray(x) && typeof x[0] === 'number') return x as number[];             // [dim]
    if (Array.isArray(x) && Array.isArray(x[0]) && typeof x[0][0] === 'number') {
      const tokens = x as number[][];                                                   // [tokens, dim]
      const dim = tokens[0].length;
      const sum = new Array(dim).fill(0);
      for (const t of tokens) for (let i = 0; i < dim; i++) sum[i] += t[i];
      return sum.map(v => v / tokens.length);                                           // mean pooling
    }
    if (Array.isArray(x) && Array.isArray(x[0]) && Array.isArray(x[0][0])) {
      return toVector(x[0]);                                                            // [1, tokens, dim]
    }
    throw new Error('Unexpected embedding shape from HF SDK');
  };

  const vec = toVector(output);

  // L2 Normalization
  const norm = Math.sqrt(vec.reduce((s, v) => s + v * v, 0)) || 1;
  return vec.map(v => v / norm);
}




function assertVector(v: unknown): asserts v is number[] {
  if (!Array.isArray(v) || v.some((x) => typeof x !== 'number' || !Number.isFinite(x))) {
    throw new Error('`embedding` must be a finite number[]');
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const {
      query,
      embedding,
      topK = 10,
      minScore = 0,
      probes = 20,
    }: {
      query?: string;
      embedding?: number[];
      topK?: number;
      minScore?: number;
      probes?: number;
    } = body ?? {};

    let queryEmbedding: number[];

    if (Array.isArray(embedding) && embedding.length) {
      assertVector(embedding);
      queryEmbedding = embedding;
    } else if (typeof query === 'string' && query.trim()) {
      if (!process.env.HF_TOKEN) {
        return NextResponse.json(
          { error: 'No embedding provided and HF_TOKEN is not set' },
          { status: 400 }
        );
      }
      queryEmbedding = await embedWithBGE_M3(query.trim());
    } else {
      return NextResponse.json(
        { error: 'Provide either `query` (string) or `embedding` (number[])' },
        { status: 400 }
      );
    }

    if (queryEmbedding.length !== 1024) {
      return NextResponse.json(
        { error: `Embedding dim must be 1024, got ${queryEmbedding.length}` },
        { status: 400 }
      );
    }

    // Supabase Admin Client
    const supabase = getSupabaseAdmin();

    const safeTopK = Math.min(Math.max(Number(topK) || 10, 1), 100);
    const safeMinScore = Math.max(Math.min(Number(minScore) || 0, 1), 0);
    const safeProbes = Math.min(Math.max(Number(probes) || 20, 1), 500);

    const { data, error } = await supabase.rpc('match_knowledge_base', {
      query_embedding: queryEmbedding,
      match_count: safeTopK,
      min_score: safeMinScore,
      probes: safeProbes,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      query: typeof query === 'string' ? query : undefined,
      topK: safeTopK,
      results: data, // [{ chunk_id, text, metadata, model, dim, distance, similarity }]
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'Unknown server error' }, { status: 500 });
  }
}
