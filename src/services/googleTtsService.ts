import * as FileSystem from 'expo-file-system';
import { Audio } from 'expo-av';

const SERVER_URL = process.env.POSE_SERVER_URL || 'http://10.0.2.2:8080';

export async function speakViaServer(text: string) {
  try {
    const resp = await fetch(`${SERVER_URL}/synthesize-tts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    if (!resp.ok) throw new Error('TTS server error');
    const blob = await resp.blob();
    const fileUri = `${FileSystem.cacheDirectory}tts_${Date.now()}.mp3`;
    const buffer = await blob.arrayBuffer();
    await FileSystem.writeAsStringAsync(fileUri, Buffer.from(buffer).toString('base64'), { encoding: FileSystem.EncodingType.Base64 });
    const { sound } = await Audio.Sound.createAsync({ uri: fileUri });
    await sound.playAsync();
  } catch (err) {
    console.warn('[googleTtsService] error', err);
  }
}

export async function prefetchTts(text: string): Promise<string> {
  // returns local URI of the downloaded MP3
  const resp = await fetch(`${SERVER_URL}/synthesize-tts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
  if (!resp.ok) throw new Error('TTS server error');
  const blob = await resp.blob();
  const fileUri = `${FileSystem.cacheDirectory}tts_prefetch_${Date.now()}.mp3`;
  const buffer = await blob.arrayBuffer();
  await FileSystem.writeAsStringAsync(fileUri, Buffer.from(buffer).toString('base64'), { encoding: FileSystem.EncodingType.Base64 });
  return fileUri;
}

export async function playFromUri(uri: string) {
  const { sound } = await Audio.Sound.createAsync({ uri });
  await sound.playAsync();
  return sound;
}

export default { speakViaServer, prefetchTts, playFromUri };
