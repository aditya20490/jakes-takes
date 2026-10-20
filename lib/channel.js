const CHANNEL_ID = 'UCbf-pkIyuBy_m_Mh3WtxsMQ';

// Subscriber count from YouTube. YouTube rounds it. Returns null if hidden or unavailable.
export async function getSubscribers() {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) return null;
  try {
    const params = new URLSearchParams({
      part: 'statistics',
      id: CHANNEL_ID,
      fields: 'items(statistics(subscriberCount,hiddenSubscriberCount))',
      key,
    });
    const res = await fetch(`https://www.googleapis.com/youtube/v3/channels?${params}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    const s = data.items && data.items[0] && data.items[0].statistics;
    if (!s || s.hiddenSubscriberCount) return null;
    const n = Number(s.subscriberCount);
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}
