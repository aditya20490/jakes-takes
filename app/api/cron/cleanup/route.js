import { getDb } from '../../../../lib/supabase';
import { json } from '../../../../lib/security';
import { getAllVideos, livestreamCutoff } from '../../../../lib/youtube';

export const dynamic = 'force-dynamic';

// Runs once a day (see vercel.json). Deletes ratings and comments of livestreams
// that are older than the 6-day window. Regular videos are never touched.
export async function GET(request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) {
    return json({ error: 'Unauthorized' }, 401);
  }

  const db = getDb();
  if (!db) return json({ error: 'Not configured' }, 503);

  // Safety: if the video list could not be loaded, delete nothing.
  const { videos, error } = await getAllVideos();
  if (error || videos.length === 0) {
    return json({ ok: false, skipped: 'Could not load the video list. Nothing was deleted.' });
  }

  const cutoff = livestreamCutoff();
  const expired = videos
    .filter((v) => v.topic === 'Livestreams' && v.date < cutoff)
    .map((v) => v.id);

  let removedComments = 0;
  let removedRatings = 0;
  for (let i = 0; i < expired.length; i += 100) {
    const chunk = expired.slice(i, i + 100);
    const c = await db.from('comments').delete({ count: 'exact' }).in('video_id', chunk);
    const r = await db.from('ratings').delete({ count: 'exact' }).in('video_id', chunk);
    if (c.error || r.error) return json({ ok: false, error: 'Database error' }, 500);
    removedComments += c.count || 0;
    removedRatings += r.count || 0;
  }

  // Housekeeping: old rate-limit records.
  const old = new Date(Date.now() - 31 * 86400 * 1000).toISOString();
  await db.from('rate_events').delete().lt('created_at', old);

  return json({ ok: true, expiredLivestreams: expired.length, removedComments, removedRatings });
}
