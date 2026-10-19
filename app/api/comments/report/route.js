import { getDb } from '../../../../lib/supabase';
import { hash, clientIp, sameOrigin, json, DEVICE_RE } from '../../../../lib/security';
import { allow } from '../../../../lib/ratelimit';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  if (!sameOrigin(request)) return json({ error: 'Not allowed.' }, 403);

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Bad request.' }, 400);
  }

  const { commentId, deviceId } = body || {};
  if (!Number.isInteger(commentId) || commentId < 1) return json({ error: 'Invalid comment.' }, 400);
  if (typeof deviceId !== 'string' || !DEVICE_RE.test(deviceId)) return json({ error: 'Invalid request.' }, 400);

  const db = getDb();
  if (!db) return json({ error: 'Not configured.' }, 503);

  try {
    const ip = hash('ip:' + clientIp(request));
    const device = hash('dev:' + deviceId);

    if (!(await allow(db, `report:ip:${ip}`, 20, 3600))) return json({ error: 'Too many reports.' }, 429);
    // Each device can report a given comment only once.
    if (!(await allow(db, `report:${commentId}:${device}`, 1, 30 * 86400))) return json({ ok: true });

    const { data: row } = await db
      .from('comments')
      .select('reports, status')
      .eq('id', commentId)
      .single();
    if (!row || row.status !== 'approved') return json({ ok: true });

    const reports = row.reports + 1;
    // 3 reports hides the comment automatically. You can restore it in Supabase.
    await db
      .from('comments')
      .update({ reports, status: reports >= 3 ? 'hidden' : 'approved' })
      .eq('id', commentId);

    return json({ ok: true });
  } catch {
    return json({ error: 'Something went wrong.' }, 500);
  }
}
