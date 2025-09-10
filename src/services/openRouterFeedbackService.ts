const SERVER_URL = process.env.POSE_SERVER_URL || 'http://10.0.2.2:8080';

export async function requestFeedback(summary: any) {
  try {
    const resp = await fetch(`${SERVER_URL}/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(summary),
    });
    if (!resp.ok) {
      const txt = await resp.text();
      throw new Error(`feedback server error: ${txt}`);
    }
    const json = await resp.json();
    return json;
  } catch (err) {
    console.warn('[openRouterFeedbackService] error', err);
    throw err;
  }
}

export default { requestFeedback };
