import { NextResponse } from 'next/server';
import { aiService } from '@/lib/services/ai';
import { getAuthUser } from '@/lib/services/auth';
import { recordAnalysisResult } from '@/lib/services/stats';
import { z } from 'zod';

const voiceSchema = z.object({
  duration: z.number().default(30),
  hasTriggerWords: z.boolean().default(false)
});

export async function POST(request: Request) {
  try {
    // 1. Authenticate user
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = voiceSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation Error', details: parsed.error.format() }, { status: 400 });
    }

    const { duration, hasTriggerWords } = parsed.data;
    
    // 2. Perform simulated AI scoring
    const result = await aiService.analyzeVoice(duration, hasTriggerWords);

    // 3. Record in user's isolated workspace
    const record = await recordAnalysisResult(
      user.id,
      'voice',
      `Voice call duration: ${duration}s, triggers: ${hasTriggerWords}`,
      result
    );

    return NextResponse.json({
      success: true,
      analysisId: record?.scan?.id || Math.random().toString(),
      analysis: result
    });

  } catch (err: any) {
    return NextResponse.json({ error: 'Internal Server Error', details: err.message }, { status: 500 });
  }
}
