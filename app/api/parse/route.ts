import Anthropic from '@anthropic-ai/sdk';
import { systemPrompt } from '@/lib/prompt';
import { ParseResponseSchema } from '@/lib/schema';

type RawTask = {
  title?: unknown;
  priority?: unknown;
  estimateMin?: unknown;
  deadline?: unknown;
  reminderAt?: unknown;
  project?: unknown;
};

function clamp(n: number, min: number, max: number): number {
  return Math.min(Math.max(n, min), max);
}

/**
 * Normalize Claude's raw output to fit our schema:
 * - reminderAt: append Z if no timezone given (treat as UTC)
 * - estimateMin: round and clamp [5, 240]
 * - title: trim
 */
function normalizeTasks(parsed: { tasks?: RawTask[] } | null): { tasks: unknown[] } {
  const tasks = Array.isArray(parsed?.tasks) ? parsed!.tasks : [];
  return {
    tasks: tasks.map((t) => {
      let reminderAt: string | null | undefined;
      if (typeof t.reminderAt === 'string' && t.reminderAt.trim()) {
        const s = t.reminderAt.trim();
        // Add Z if missing timezone
        reminderAt = /[Z+-]\d{0,2}:?\d{0,2}$|Z$/.test(s) ? s : `${s}Z`;
      } else {
        reminderAt = undefined;
      }

      const rawEstimate = Number(t.estimateMin);
      const estimateMin = Number.isFinite(rawEstimate)
        ? clamp(Math.round(rawEstimate), 5, 240)
        : 30;

      return {
        title: typeof t.title === 'string' ? t.title.trim() : '',
        priority: t.priority,
        estimateMin,
        deadline: t.deadline,
        reminderAt,
        project:
          typeof t.project === 'string' && t.project.trim() ? t.project.trim() : null,
      };
    }),
  };
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return Response.json({ error: 'ANTHROPIC_API_KEY not set' }, { status: 500 });
  }

  let body: { text?: string; today?: string; knownProjects?: string[] };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const text = (body.text ?? '').trim();
  const today = body.today ?? new Date().toISOString().slice(0, 10);
  const knownProjects = Array.isArray(body.knownProjects) ? body.knownProjects : [];

  if (!text) {
    return Response.json({ error: 'Empty text' }, { status: 400 });
  }
  if (text.length > 5000) {
    return Response.json({ error: 'Text too long (max 5000)' }, { status: 400 });
  }

  const client = new Anthropic({ apiKey });

  let raw = '';
  try {
    const resp = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2000,
      system: systemPrompt(today, knownProjects),
      messages: [{ role: 'user', content: text }],
    });
    const block = resp.content.find(b => b.type === 'text');
    raw = block && block.type === 'text' ? block.text : '';
  } catch (err) {
    console.error('Anthropic error', err);
    return Response.json({ error: 'AI call failed' }, { status: 502 });
  }

  // Парсимо JSON. Claude іноді обертає в ```json — спробуємо витягти.
  const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim();

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    console.error('Bad JSON from Claude:', raw);
    return Response.json({ error: 'AI returned non-JSON' }, { status: 502 });
  }

  const normalized = normalizeTasks(parsed as { tasks?: RawTask[] } | null);
  const result = ParseResponseSchema.safeParse(normalized);
  if (!result.success) {
    const details = result.error.flatten();
    console.error('Schema mismatch after normalization:', details, 'raw:', raw);
    return Response.json(
      { error: 'AI returned invalid schema', details, raw: raw.slice(0, 500) },
      { status: 502 },
    );
  }

  return Response.json(result.data);
}
