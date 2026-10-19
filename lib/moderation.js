import { blockedWords, blockedStems } from '../data/blocklist';

const WORDS = new Set(blockedWords.map((w) => w.toLowerCase()));
const STEMS = blockedStems.map((s) => s.toLowerCase());
const LEET = { '0': 'o', '1': 'i', '3': 'e', '4': 'a', '5': 's', '7': 't', '@': 'a', '$': 's', '!': 'i' };

// Strips control and invisible characters and collapses whitespace.
export function clean(text) {
  return String(text ?? '')
    .replace(/[\u0000-\u001F\u007F\u200B-\u200F\u202A-\u202E\u2060\uFEFF]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function containsBlocked(text) {
  const normalized = text
    .toLowerCase()
    .replace(/[01345 7@$!]/g, (c) => LEET[c] || c)
    .replace(/[^a-z]+/g, ' ');
  return normalized
    .split(' ')
    .filter(Boolean)
    .some((token) => WORDS.has(token) || STEMS.some((s) => token.startsWith(s)));
}

export function hasLink(text) {
  return /(https?:\/\/|www\.|\b[a-z0-9-]+\.(com|net|org|io|in|co|xyz|ru|me|ly|gg|tv)\b)/i.test(text);
}

export function hasSpam(text) {
  return /(.)\1{9,}/.test(text);
}
