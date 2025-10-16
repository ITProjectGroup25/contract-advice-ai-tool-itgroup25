import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';

/**
 * Direct guidance generation endpoint
 * Accepts form answers directly without requiring submission storage
 * 
 * POST /api/v1/guidance/generate
 * Body: { formAnswers: { ... }, formId?: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { formAnswers, formId } = body;

    // Validate input
    if (!formAnswers || typeof formAnswers !== 'object') {
      return NextResponse.json(
        { error: 'formAnswers is required and must be an object' },
        { status: 400 }
      );
    }

    // Log received answers for debugging
    console.log('Received form answers:', {
      keys: Object.keys(formAnswers),
      totalAnswers: Object.keys(formAnswers).length,
    });

    // Get form questions from database
    const supabase = getSupabaseAdmin();
    const { data: questions, error: questionsError } = await supabase
      .from('question')
      .select('id, label, q_type')
      .eq('form_id', formId || 1) // Default to form 1 if not specified
      .order('order_index');

    if (questionsError) {
      console.error('Failed to fetch questions:', questionsError);
    }

    // Generate guidance
    const startTime = Date.now();
    const guidance = await generateGuidance({
      formAnswers,
      questions: questions || [],
      formId,
    });
    const processingTime = (Date.now() - startTime) / 1000;

    return NextResponse.json({
      status: 'success',
      generatedAt: new Date().toISOString(),
      processingTime,
      guidance,
    });

  } catch (error: any) {
    console.error('Guidance generation error:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate guidance',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * Parameters for guidance generation
 */
interface GuidanceParams {
  formAnswers: Record<string, any>;
  questions: Array<{ id: string; label: string; q_type: string }>;
  formId?: string;
  submissionId?: string;
}

/**
 * Main guidance generation function
 * Uses simplified approach: build context from questions + answers
 */
async function generateGuidance(params: GuidanceParams) {
  const { formAnswers, questions } = params;
  
  // Build question-answer context (simplified approach)
  const userContext = buildContextFromQA(questions, formAnswers);
  
  console.log('User Context:', userContext.substring(0, 200) + '...');

  // TODO: Implement RAG pipeline here
  // The userContext contains all questions and answers in this format:
  // "Question: Your Name
  //  Answer: Dr. Sarah Chen
  //  
  //  Question: Grants Scheme
  //  Answer: NHMRC, ARC
  //  ..."
  //
  // You can:
  // 1. const relevantDocs = await vectorSearch(userContext);
  // 2. const llmResponse = await generateWithLLM(userContext, relevantDocs);
  // 3. return any structure you want

  // Placeholder: return the context for now
  return {
    userContext,
    questionsCount: questions.length,
    answersCount: Object.keys(formAnswers).length,
    message: 'RAG not implemented yet. Implement your own response structure.',
  };
}

/**
 * Build context from questions and answers
 * This is the simplified approach - no need to know field IDs
 */
function buildContextFromQA(
  questions: Array<{ id: string; label: string; q_type: string }>,
  formAnswers: Record<string, any>
): string {
  const qaLines: string[] = [];

  for (const question of questions) {
    const answer = formAnswers[question.id];

    // Skip empty answers
    if (answer === undefined || answer === null || answer === '') {
      continue;
    }

    if (Array.isArray(answer) && answer.length === 0) {
      continue;
    }

    // Format answer
    let formattedAnswer: string;

    if (Array.isArray(answer)) {
      formattedAnswer = answer.join(', ');
    } else if (typeof answer === 'object') {
      formattedAnswer = JSON.stringify(answer);
    } else {
      formattedAnswer = String(answer);
    }

    // Add question-answer pair
    qaLines.push(`Question: ${question.label}`);
    qaLines.push(`Answer: ${formattedAnswer}`);
    qaLines.push(''); // Empty line for separation
  }

  return qaLines.join('\n');
}
