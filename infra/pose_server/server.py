from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse, FileResponse
import uvicorn
import numpy as np
import mediapipe as mp
import cv2
import tempfile
import os
import requests
from google.cloud import texttospeech

app = FastAPI(title='Pose Server')

mp_pose = mp.solutions.pose
pose = mp_pose.Pose(static_image_mode=False, model_complexity=1, enable_segmentation=False, min_detection_confidence=0.5)

def read_image_from_upload(upload: UploadFile):
    suffix = os.path.splitext(upload.filename)[1]
    fd, path = tempfile.mkstemp(suffix=suffix)
    with os.fdopen(fd, 'wb') as f:
        f.write(upload.file.read())
    img = cv2.imread(path)
    os.remove(path)
    if img is None:
        raise HTTPException(status_code=400, detail='Invalid image')
    return img

def extract_keypoints_from_image(img: np.ndarray):
    # convert to RGB
    rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    results = pose.process(rgb)
    if not results.pose_landmarks:
        return None
    h, w, _ = img.shape
    keypoints = {}
    for idx, lm in enumerate(results.pose_landmarks.landmark):
        keypoints[f'kp_{idx}'] = { 'x': lm.x, 'y': lm.y, 'z': lm.z, 'visibility': lm.visibility }
    return keypoints

@app.post('/predict')
async def predict(file: UploadFile = File(...)):
    img = read_image_from_upload(file)
    kps = extract_keypoints_from_image(img)
    if kps is None:
        return JSONResponse({'keypoints': None})
    return JSONResponse({'keypoints': kps})

@app.post('/cheat-check')
async def cheat_check(file: UploadFile = File(...)):
    img = read_image_from_upload(file)
    h, w, _ = img.shape
    # pose landmarks
    kps = extract_keypoints_from_image(img)
    if not kps:
        return JSONResponse({'cheat': True, 'reason': 'no_person_detected'})
    # compute average visibility
    vis = [v['visibility'] for v in kps.values() if 'visibility' in v]
    avg_vis = float(np.mean(vis)) if vis else 0.0

    # compute bounding box of detected landmarks
    xs = [v['x'] for v in kps.values() if 'x' in v]
    ys = [v['y'] for v in kps.values() if 'y' in v]
    if not xs or not ys:
        return JSONResponse({'cheat': True, 'reason': 'invalid_keypoints'})
    minx, maxx = min(xs), max(xs)
    miny, maxy = min(ys), max(ys)
    # normalized area
    bbox_area = max(0.0, (maxx - minx) * (maxy - miny))

    # image sharpness using Laplacian variance
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    lap = cv2.Laplacian(gray, cv2.CV_64F)
    sharpness = float(np.var(lap))

    # heuristics
    area_threshold = 0.02
    sharpness_threshold = 10.0
    vis_threshold = 0.25

    cheat_reasons = []
    if bbox_area < area_threshold:
        cheat_reasons.append('small_bbox')
    if sharpness < sharpness_threshold:
        cheat_reasons.append('low_sharpness')
    if avg_vis < vis_threshold:
        cheat_reasons.append('low_visibility')

    is_cheat = len(cheat_reasons) > 0
    return JSONResponse({
        'cheat': bool(is_cheat),
        'reasons': cheat_reasons,
        'metrics': {
            'avg_visibility': avg_vis,
            'bbox_area': bbox_area,
            'sharpness': sharpness
        }
    })

@app.post('/synthesize-tts')
async def synthesize_tts(text: str):
    # requires GOOGLE_APPLICATION_CREDENTIALS environment variable or service account
    client = texttospeech.TextToSpeechClient()
    input_text = texttospeech.SynthesisInput(text=text)
    voice = texttospeech.VoiceSelectionParams(language_code='en-US', ssml_gender=texttospeech.SsmlVoiceGender.NEUTRAL)
    audio_config = texttospeech.AudioConfig(audio_encoding=texttospeech.AudioEncoding.MP3)
    response = client.synthesize_speech(input=input_text, voice=voice, audio_config=audio_config)
    fd, path = tempfile.mkstemp(suffix='.mp3')
    with os.fdopen(fd, 'wb') as f:
        f.write(response.audio_content)
    return FileResponse(path, media_type='audio/mpeg')

@app.post('/feedback')
async def feedback(test_summary: dict):
    # call OpenRouter (or other LLM) directly here using API key in env OPENROUTER_API_KEY
    or_key = os.environ.get('OPENROUTER_API_KEY')
    if not or_key:
        raise HTTPException(status_code=500, detail='OpenRouter key not configured')
    prompt = f"Provide a concise feedback report based on the following test summary:\n{test_summary}\nBe specific and actionable."
    payload = {
        'model': 'openai/gpt-3.5-turbo',
        'messages': [
            {'role': 'system', 'content': 'You are a sports assessment assistant.'},
            {'role': 'user', 'content': prompt}
        ]
    }
    r = requests.post('https://openrouter.ai/api/v1/chat/completions', json=payload, headers={'Authorization': f'Bearer {or_key}'}, timeout=30)
    if not r.ok:
        raise HTTPException(status_code=500, detail=f'OpenRouter error: {r.status_code}')
    return JSONResponse(r.json())

@app.post('/analyze-video')
async def analyze_video(file: UploadFile = File(...)):
    # Placeholder implementation
    # In a real application, you would process the video here
    # For now, we'll just return a dummy response
    return JSONResponse({
        'score': 85,
        'metrics': {
            'reps': 10,
            'form_consistency': 0.92,
            'range_of_motion': 0.88
        },
        'videoUrl': 'https://example.com/video.mp4',
        'aiConfidence': 0.95,
        'feedback': 'Great job! You maintained good form throughout the exercise. Try to increase your range of motion on the next set.'
    })

if __name__ == '__main__':
    uvicorn.run(app, host='0.0.0.0', port=8080)
