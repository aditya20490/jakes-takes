import { topicKeywords, overrides, defaultTopic } from '../data/videos';

const API = 'https://www.googleapis.com/youtube/v3';
const CHANNEL_ID = 'UCbf-pkIyuBy_m_Mh3WtxsMQ';
const UPLOADS_PLAYLIST = 'UU' + CHANNEL_ID.slice(2);

// Livestreams stay on the site for this many days after they aired.
export const LIVESTREAM_DAYS = 6;

const MIN_SECONDS = 181; // shorter than this = a Short, left out
const MAX_PAGES = 40; // 40 x 50 = up to 2000 uploads
const REVALIDATE = 3600;
const PARALLEL = 8;

const VIDEO_PARTS = 'snippet,contentDetails,statistics,liveStreamingDetails';
const VIDEO_FIELDS =
  'items(id,snippet(title,publishedAt,liveBroadcastContent,channelId),contentDetails(duration),statistics(viewCount),liveStreamingDetails(actualStartTime))';

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

// Livestreams dated before this (UTC date) are no longer shown.
export function livestreamCutoff() {
  return new Date(Date.now() - LIVESTREAM_DAYS * 86400000).toISOString().slice(0, 10);
}

function normalize(v) {
  if (v.snippet.channelId !== CHANNEL_ID) return null;
  if (v.snippet.liveBroadcastContent !== 'none') return null; // skip upcoming / live-now
  if (toSeconds(v.contentDetails.duration) < MIN_SECONDS) return null; // skip Shorts
  const isLive = Boolean(v.liveStreamingDetails);
  const when = v.liveStreamingDetails?.actualStartTime || v.snippet.publishedAt;
  return {
    id: v.id,
    title: v.snippet.title,
    topic: pickTopic(v.id, v.snippet.title, isLive),
    date: when.slice(0, 10),
    publishedAt: when,
    views: v.statistics?.viewCount ? Number(v.statistics.viewCount) : null,
  };
}

// Everything on the channel, including old livestreams (used by the cleanup job).
export async function getAllVideos() {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) return { videos: [], error: 'missing-key' };

  try {
    const ids = [];
    let pageToken;
    for (let i = 0; i < MAX_PAGES; i++) {
      const data = await api(
        'playlistItems',
        {
          part: 'contentDetails',
          playlistId: UPLOADS_PLAYLIST,
          maxResults: '50',
          fields: 'nextPageToken,items(contentDetails(videoId))',
          ...(pageToken ? { pageToken } : {}),
        },
        key
      );
      for (const it of data.items || []) ids.push(it.contentDetails.videoId);
      pageToken = data.nextPageToken;
      if (!pageToken) break;
    }

    const chunks = [];
    for (let i = 0; i < ids.length; i += 50) chunks.push(ids.slice(i, i + 50).join(','));

    const videos = [];
    for (let i = 0; i < chunks.length; i += PARALLEL) {
      const results = await Promise.all(
        chunks
          .slice(i, i + PARALLEL)
          .map((c) => api('videos', { part: VIDEO_PARTS, id: c, fields: VIDEO_FIELDS }, key))
      );
      for (const data of results) {
        for (const v of data.items || []) {
          const n = normalize(v);
          if (n) videos.push(n);
        }
      }
    }

    videos.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
    return { videos, error: null };
  } catch {
    return { videos: [], error: 'api-error' };
  }
}

// What visitors see: all videos, plus only the recent livestreams.
export async function getVideos() {
  const { videos, error } = await getAllVideos();
  const cutoff = livestreamCutoff();
  return {
    videos: videos.filter((v) => v.topic !== 'Livestreams' || v.date >= cutoff),
    error,
  };
}

// One video, one API call. Used by video pages and by the rating/comment routes.
export async function getVideo(id) {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) return { video: null, error: 'missing-key' };
  if (!/^[A-Za-z0-9_-]{11}$/.test(id || '')) return { video: null, error: null };

  try {
    const data = await api('videos', { part: VIDEO_PARTS, id, fields: VIDEO_FIELDS }, key);
    const v = data.items && data.items[0];
    const video = v ? normalize(v) : null;
    if (!video) return { video: null, error: null };
    if (video.topic === 'Livestreams' && video.date < livestreamCutoff()) {
      return { video: null, error: null };
    }
    return { video, error: null };
  } catch {
    return { video: null, error: 'api-error' };
  }
}
