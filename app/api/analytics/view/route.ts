import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../lib/supabaseAdmin';

export const dynamic = 'force-dynamic';

type Body = { code: string };

export async function POST(req: Request) {
  let bodyUnknown: unknown;
  try {
    bodyUnknown = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
  const { code } = (bodyUnknown as Partial<Body>) ?? {};
  if (!code || typeof code !== 'string') {
    return NextResponse.json({ error: 'Missing code' }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from('analytics_views')
    .insert({ code });

  if (error) {
    return NextResponse.json({ error: 'Insert failed' }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
