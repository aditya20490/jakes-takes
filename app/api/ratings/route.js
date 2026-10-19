import { getDb } from '../../../lib/supabase';
import { hash, clientIp, sameOrigin, json, DEVICE_RE, VIDEO_RE } from '../../../lib/security';
import { allow, cleanup } from '../../../lib/ratelimit';
import { getVideos } from '../../../lib/youtube';

export const dynamic = 'force-dynamic';

async function summary(db, videoId) {
  const { data, error } = await db.rpc('rating_summary', { p_video: videoId });
  if (error) throw error;
  const row = Array.isArray(data) ? data[0] : data;
  return { average: Number(row?.average || 0), total: Number(row?.total || 0) };
}

export async function GET(request) {
  const videoId = new URL(request.url).searchParams.get('videoId') || '';
  if (!VIDEO_RE.test(videoId)) return json({ error: 'Invalid video.' }, 400);
  const db = getDb();
  if (!db) return json({ error: 'Not configured.' }, 503);
  try {
    return json(await summary(db, videoId));
  } catch {
    return json({ error: 'Could not load ratings.' }, 500);
  }
}

export async function POST(request) {
  if (!sameOrigin(request)) return json({ error: 'Not allowed.' }, 403);

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Bad request.' }, 400);
  }

  const { videoId, score, deviceId } = body || {};
  if (typeof videoId !== 'string' || !VIDEO_RE.test(videoId)) return json({ error: 'Invalid video.' }, 400);
  if (typeof deviceId !== 'string' || !DEVICE_RE.test(deviceId)) return json({ error: 'Invalid request.' }, 400);
  if (!Number.isInteger(score) || score < 1 || score > 10) return json({ error: 'Score must be 1 to 10.' }, 400);

  const db = getDb();
  if (!db) return json({ error: 'Not configured.' }, 503);

  try {
    // Only real, finished videos from the channel can be rated.
    const { videos, error: ytError } = await getVideos();
    if (ytError) return json({ error: 'Please try again later.' }, 503);
    if (!videos.some((v) => v.id === videoId)) return json({ error: 'Unknown video.' }, 404);

    const ip = hash('ip:' + clientIp(request));
    const device = hash('dev:' + deviceId);

    const okIp = await allow(db, `rate:ip:${ip}`, 60, 3600);
    const okDev = okIp && (await allow(db, `rate:dev:${device}`, 60, 3600));
    if (!okIp || !okDev) return json({ error: 'Too many ratings. Please wait a bit.' }, 429);

    // One row per device per video. Re-rating updates it instead of adding another.
    const { error } = await db
      .from('ratings')
      .upsert({ video_id: videoId, voter_hash: device, score }, { onConflict: 'video_id,voter_hash' });
    if (error) throw error;

    cleanup(db).catch(() => {});
    return json({ ok: true, ...(await summary(db, videoId)) });
  } catch {
    return json({ error: 'Something went wrong. Please try again.' }, 500);
  }
}
