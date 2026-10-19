import { topicKeywords, overrides, defaultTopic } from '../data/videos';

const API = 'https://www.googleapis.com/youtube/v3';
const CHANNEL_ID = 'UCbf-pkIyuBy_m_Mh3WtxsMQ';
const UPLOADS_PLAYLIST = 'UU' + CHANNEL_ID.slice(2);

// Anything shorter than this is treated as a Short and left out.
// Shorts can be up to 3 minutes, so 181 is the safe cutoff.
const MIN_SECONDS = 181;
const MAX_PAGES = 20; // 20 pages x 50 = up to 1000 videos
const REVALIDATE = 3600; // refresh from YouTube at most once an hour

async function api(path, params, key) {
  const url = `${API}/${path}?${new URLSearchParams({ ...params, key })}`;
  const res = await fetch(url, { next: { revalidate: REVALIDATE } });
  if (!res.ok) throw new Error(`YouTube API error ${res.status}`);
  return res.json();
}

function toSeconds(iso) {
  const m = /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/.exec(iso || '');
  if (!m) return 0;
  return (+m[1] || 0) * 3600 + (+m[2] || 0) * 60 + (+m[3] || 0);
}

function pickTopic(id, title, isLive) {
  if (overrides[id]) return overrides[id];
  if (isLive) return 'Livestreams';
  for (const [topic, words] of Object.entries(topicKeywords)) {
    if (words.some((w) => new RegExp('\\b' + w, 'i').test(title))) return topic;
  }
  return defaultTopic;
}

export async function getVideos() {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) return { videos: [], error: 'missing-key' };

  try {
    const ids = [];
    let pageToken;
    for (let i = 0; i < MAX_PAGES; i++) {
      const data = await api(
        'playlistItems',
        { part: 'contentDetails', playlistId: UPLOADS_PLAYLIST, maxResults: '50', ...(pageToken ? { pageToken } : {}) },
        key
      );
      for (const it of data.items || []) ids.push(it.contentDetails.videoId);
      pageToken = data.nextPageToken;
      if (!pageToken) break;
    }

    const videos = [];
    for (let i = 0; i < ids.length; i += 50) {
      const data = await api(
        'videos',
        { part: 'snippet,contentDetails,statistics,liveStreamingDetails', id: ids.slice(i, i + 50).join(',') },
        key
      );
      for (const v of data.items || []) {
        if (v.snippet.liveBroadcastContent !== 'none') continue; // skip upcoming / live-now
        if (toSeconds(v.contentDetails.duration) < MIN_SECONDS) continue; // skip Shorts
        const isLive = Boolean(v.liveStreamingDetails);
        const when = v.liveStreamingDetails?.actualStartTime || v.snippet.publishedAt;
        videos.push({
          id: v.id,
          title: v.snippet.title,
          topic: pickTopic(v.id, v.snippet.title, isLive),
          date: when.slice(0, 10),
          views: v.statistics?.viewCount ? Number(v.statistics.viewCount) : null,
        });
      }
    }

    videos.sort((a, b) => b.date.localeCompare(a.date));
    return { videos, error: null };
  } catch {
    return { videos: [], error: 'api-error' };
  }
}
