import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../lib/supabaseAdmin';
import { createHash } from 'crypto';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs'; // use Node so we can hash

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { code?: string };
    const code = body?.code?.trim();
    if (!code) {
      return NextResponse.json({ error: 'Missing code' }, { status: 400 });
    }

    // Non-creepy user hash: user agent + day (resets daily)
    const ua = req.headers.get('user-agent') ?? '';
    const day = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const user_hash = createHash('sha256')
      .update(`${ua}|${day}`)
      .digest('hex')
      .slice(0, 32);

    // Try to resolve guide_id for this code (ok if null)
    const { data: link } = await supabaseAdmin
      .from('access_links')
      .select('guide_id')
      .eq('code', code)
      .maybeSingle<{ guide_id: string | null }>();

    const guide_id = link?.guide_id ?? null;

    const { error } = await supabaseAdmin.from('analytics_events').insert({
      guide_id,
      code,
      user_hash,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    return NextResponse.json(
      { error: (e as Error).message ?? 'unknown' },
      { status: 500 }
    );
  }
}
