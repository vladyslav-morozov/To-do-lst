import Anthropic from '@anthropic-ai/sdk';
import { systemPrompt } from '@/lib/prompt';
import { ParseResponseSchema } from '@/lib/schema';

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

  const result = ParseResponseSchema.safeParse(parsed);
  if (!result.success) {
    console.error('Schema mismatch:', result.error.flatten());
    return Response.json({ error: 'AI returned invalid schema' }, { status: 502 });
  }

  return Response.json(result.data);
}
