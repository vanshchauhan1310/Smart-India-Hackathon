import Constants from 'expo-constants';

/**
 * poseApiService
 * - Intended for local development using a Python venv-running pose server (see infra/pose_server/requirements.txt).
 * - Set POSE_API_URL to point to that server (e.g. http://192.168.0.5:8000) so devices on your LAN can reach it.
 * - This file exposes helpers to upload images for pose keypoints and to upload recorded videos for analysis.
 */

// For local development prefer a venv-run server. Set POSE_API_URL to point at the server (e.g. http://192.168.0.5:8000)
const POSE_API_URL = process.env.POSE_API_URL || (Constants.expoConfig as any)?.extra?.POSE_API_URL;
const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY || (Constants.expoConfig as any)?.extra?.HUGGINGFACE_API_KEY;
const HUGGINGFACE_POSE_MODEL = process.env.HUGGINGFACE_POSE_MODEL || (Constants.expoConfig as any)?.extra?.HUGGINGFACE_POSE_MODEL;

async function wait(ms: number) {
  return new Promise(res => setTimeout(res, ms));
}

async function tryParseKeypoints(json: any) {
  if (!json) return null;
  // common shapes: { keypoints: {...} } or [{keypoints: {...}}]
  if (json.keypoints) return json.keypoints;
  if (Array.isArray(json) && json[0] && json[0].keypoints) return json[0].keypoints;
  // some models return predictions array
  if (json.predictions && Array.isArray(json.predictions) && json.predictions[0]?.keypoints) return json.predictions[0].keypoints;
  return null;
}

/**
 * Upload image and return parsed JSON or null. Implements simple retries/backoff.
 */
async function uploadImageForPose(uri: string, opts?: { maxRetries?: number; timeoutMs?: number }): Promise<any> {
  const maxRetries = opts?.maxRetries ?? 2;
  const timeoutMs = opts?.timeoutMs ?? 30_000;
  let attempt = 0;
  let lastErr: any = null;

  const resFetch = async () => {
    // fetch image blob
    const resp = await fetch(uri);
    const blob = await resp.blob();

    if (POSE_API_URL) {
      const form = new FormData();
      // @ts-ignore
      form.append('file', blob, 'snapshot.jpg');
      const r = await fetch(POSE_API_URL, { method: 'POST', body: form as any });
      if (!r.ok) throw new Error(`pose server ${r.status}`);
      return r.json();
    }

    if (HUGGINGFACE_API_KEY && HUGGINGFACE_POSE_MODEL) {
      const arrayBuf = await blob.arrayBuffer();
      const r = await fetch(`https://api-inference.huggingface.co/models/${HUGGINGFACE_POSE_MODEL}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${HUGGINGFACE_API_KEY}`,
          'Content-Type': blob.type || 'application/octet-stream',
          Accept: 'application/json',
        },
        body: arrayBuf as any,
      });
      if (!r.ok) {
        const txt = await r.text();
        throw new Error(`huggingface ${r.status}: ${txt}`);
      }
      return r.json();
    }

    return null;
  };

  while (attempt <= maxRetries) {
    try {
      attempt++;
      const p = resFetch();
      const timeoutPromise = new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), timeoutMs));
      const json = await Promise.race([p, timeoutPromise]);
      const keypoints = await tryParseKeypoints(json);
      if (keypoints) return { keypoints, raw: json };
      // if no keypoints but some response, return raw (caller can decide)
      return { raw: json };
    } catch (err) {
      lastErr = err;
      const shouldRetry = attempt <= maxRetries && (String(err).includes('timeout') || String(err).includes('429') || String(err).includes('503') || String(err).includes('network'));
      if (!shouldRetry) break;
      const backoff = 300 * Math.pow(2, attempt - 1);
      console.warn(`[poseApiService] attempt ${attempt} failed, retrying in ${backoff}ms`, err);
      await wait(backoff);
      continue;
    }
  }
  console.error('[poseApiService] all attempts failed', lastErr);
  throw lastErr;
}

/**
 * Upload recorded video for server-side analysis.
 * Expects the server to expose a `/analyze-video` POST endpoint that accepts a multipart 'file' field
 * and returns a TestResult-like JSON: { score, metrics, videoUrl, aiConfidence, feedback }
 */
async function uploadVideoForAnalysis(uri: string, opts?: { timeoutMs?: number }) {
  if (!POSE_API_URL) throw new Error('POSE_API_URL not configured');
  const timeoutMs = opts?.timeoutMs ?? 120_000;

  const resp = await fetch(uri);
  const blob = await resp.blob();
  const form = new FormData();
  // @ts-ignore
  form.append('file', blob, 'recording.mp4');

  const controller = new AbortController();
  const to = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const r = await fetch(`${POSE_API_URL.replace(/\/$/, '')}/analyze-video`, { method: 'POST', body: form as any, signal: controller.signal });
    clearTimeout(to);
    if (!r.ok) {
      const txt = await r.text().catch(() => '');
      throw new Error(`video analysis failed ${r.status}: ${txt}`);
    }
    return r.json();
  } catch (err) {
    clearTimeout(to);
    console.error('[poseApiService] uploadVideoForAnalysis error', err);
    throw err;
  }
}

async function uploadImageForCheatCheck(uri: string, opts?: { timeoutMs?: number }): Promise<any> {
  if (!POSE_API_URL) throw new Error('POSE_API_URL not configured');
  const timeoutMs = opts?.timeoutMs ?? 30_000;

  const resp = await fetch(uri);
  const blob = await resp.blob();
  const form = new FormData();
  // @ts-ignore
  form.append('file', blob, 'snapshot.jpg');

  const controller = new AbortController();
  const to = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const r = await fetch(`${POSE_API_URL.replace(/\/$/, '')}/cheat-check`, { method: 'POST', body: form as any, signal: controller.signal });
    clearTimeout(to);
    if (!r.ok) {
      const txt = await r.text().catch(() => '');
      throw new Error(`cheat check failed ${r.status}: ${txt}`);
    }
    return r.json();
  } catch (err) {
    clearTimeout(to);
    console.error('[poseApiService] uploadImageForCheatCheck error', err);
    throw err;
  }
}

export default { uploadImageForPose };
export { uploadVideoForAnalysis, uploadImageForCheatCheck };
