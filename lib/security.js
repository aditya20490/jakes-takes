import { createHash } from 'crypto';

export const DEVICE_RE = /^[0-9a-fA-F-]{36}$/;
export const VIDEO_RE = /^[A-Za-z0-9_-]{11}$/;

// One-way hash. Raw IPs and device IDs are never stored.
export function hash(value) {
  return createHash('sha256')
    .update(`${process.env.VOTER_SALT || ''}|${value}`)
    .digest('hex');
}

export function clientIp(request) {
  const fwd = request.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();
  return request.headers.get('x-real-ip') || 'unknown';
}

// Browsers always send Origin on POST. Reject posts from other websites.
export function sameOrigin(request) {
  const origin = request.headers.get('origin');
  if (!origin) return false;
  try {
    return new URL(origin).host === request.headers.get('host');
  } catch {
    return false;
  }
}

export function json(data, status = 200) {
  return Response.json(data, { status });
}
