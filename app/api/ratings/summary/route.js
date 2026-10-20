import { getDb } from '../../../../lib/supabase';
import { json } from '../../../../lib/security';

export const dynamic = 'force-dynamic';

// Average and count for every rated video, in one request (used by the video cards).
export async function GET() {
  const db = getDb();
  if (!db) return json({ ratings: {} }, 503);

  const { data, error } = await db.rpc('rating_summaries');
  if (error) return json({ ratings: {} }, 500);

  const ratings = {};
  for (const row of data || []) {
    ratings[row.video_id] = { average: Number(row.average), total: Number(row.total) };
  }
  return Response.json(
    { ratings },
    { headers: { 'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=30' } }
  );
}
