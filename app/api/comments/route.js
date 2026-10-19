import { getDb } from '../../../lib/supabase';
import { hash, clientIp, sameOrigin, json, DEVICE_RE, VIDEO_RE } from '../../../lib/security';
import { allow, cleanup } from '../../../lib/ratelimit';
import { clean, containsBlocked, hasLink, hasSpam } from '../../../lib/moderation';
import { getVideos } from '../../../lib/youtube';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const videoId = new URL(request.url).searchParams.get('videoId') || '';
  if (!VIDEO_RE.test(videoId)) return json({ error: 'Invalid video.' }, 400);
  const db = getDb();
  if (!db) return json({ error: 'Not configured.' }, 503);

  const { data, error } = await db
    .from('comments')
    .select('id, author_name, body, created_at')
    .eq('video_id', videoId)
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
    .limit(100);
  if (error) return json({ error: 'Could not load comments.' }, 500);
  return json({ comments: data });
}

export async function POST(request) {
  if (!sameOrigin(request)) return json({ error: 'Not allowed.' }, 403);

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Bad request.' }, 400);
  }
  body = body || {};

  // Hidden honeypot field. Real people never fill it. Bots do. Pretend it worked.
  if (body.website) return json({ ok: true, status: 'pending' });

  const { videoId, deviceId } = body;
  if (typeof videoId !== 'string' || !VIDEO_RE.test(videoId)) return json({ error: 'Invalid video.' }, 400);
  if (typeof deviceId !== 'string' || !DEVICE_RE.test(deviceId)) return json({ error: 'Invalid request.' }, 400);

  const nameRaw = typeof body.name === 'string' ? body.name : '';
  const textRaw = typeof body.body === 'string' ? body.body : '';
  if (nameRaw.length > 200 || textRaw.length > 2000) return json({ error: 'That is too long.' }, 400);

  const name = clean(nameRaw);
  const text = clean(textRaw);

  if (name.length < 1 || name.length > 40) return json({ error: 'Please enter a name (max 40 characters).' }, 400);
  if (text.length < 2 || text.length > 500) return json({ error: 'Comments must be 2 to 500 characters.' }, 400);
  if (hasLink(name) || hasLink(text)) return json({ error: 'Links are not allowed in comments.' }, 400);
  if (hasSpam(text) || hasSpam(name)) return json({ error: 'That looks like spam. Please write a normal comment.' }, 400);
  if (containsBlocked(name) || containsBlocked(text)) return json({ error: 'Please keep it respectful and remove blocked words.' }, 400);

  const db = getDb();
  if (!db) return json({ error: 'Not configured.' }, 503);

  try {
    const { videos, error: ytError } = await getVideos();
    if (ytError) return json({ error: 'Please try again later.' }, 503);
    if (!videos.some((v) => v.id === videoId)) return json({ error: 'Unknown video.' }, 404);

    const ip = hash('ip:' + clientIp(request));
    const device = hash('dev:' + deviceId);

    const checks = [
      [`c10:ip:${ip}`, 6, 600],
      [`c24:ip:${ip}`, 40, 86400],
      [`c10:dev:${device}`, 3, 600],
      [`c24:dev:${device}`, 15, 86400],
    ];
    for (const [key, max, seconds] of checks) {
      if (!(await allow(db, key, max, seconds))) {
        return json({ error: 'You are commenting too fast. Please wait a few minutes.' }, 429);
      }
    }

    // Duplicate detection: the same text posted anywhere in the last 7 days.
    const bodyHash = hash('body:' + text.toLowerCase());
    const since = new Date(Date.now() - 7 * 86400 * 1000).toISOString();
    const { data: dup } = await db
      .from('comments')
      .select('id')
      .eq('body_hash', bodyHash)
      .gte('created_at', since)
      .limit(1);
    if (dup && dup.length) return json({ error: 'That comment was already posted.' }, 409);

    // New comments wait for approval unless you set COMMENTS_AUTO_APPROVE=true in Vercel.
    const status = process.env.COMMENTS_AUTO_APPROVE === 'true' ? 'approved' : 'pending';

    const { error } = await db.from('comments').insert({
      video_id: videoId,
      author_name: name,
      body: text,
      status,
      voter_hash: device,
      body_hash: bodyHash,
    });
    if (error) throw error;

    cleanup(db).catch(() => {});
    return json({ ok: true, status });
  } catch {
    return json({ error: 'Something went wrong. Please try again.' }, 500);
  }
}
