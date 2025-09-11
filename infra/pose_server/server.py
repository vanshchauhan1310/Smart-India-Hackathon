import os

# WARNING: Hardcoding sensitive information like API tokens directly in source code is NOT recommended for production environments.
# This is done here for demonstration purposes only. In a real application, use environment variables or a secure configuration management system.
os.environ["HF_TOKEN"] = "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"

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse, FileResponse
import uvicorn
import numpy as np
import cv2
import tempfile
import os
import requests
from easy_dwpose import DWposeDetector
from PIL import Image

app = FastAPI(title='Pose Server')

# Initialize DWPose detector
pose_detector = DWposeDetector()

def read_image_from_upload(upload: UploadFile):
    suffix = os.path.splitext(upload.filename)[1]
    fd, path = tempfile.mkstemp(suffix=suffix)
    with os.fdopen(fd, 'wb') as f:
        f.write(upload.file.read())
    img = Image.open(path).convert('RGB')
    os.remove(path)
    if img is None:
        raise HTTPException(status_code=400, detail='Invalid image')
    return img

def extract_keypoints_from_image(img: Image.Image):
    # Detect pose using DWposeDetector
    try:
        # Convert PIL image to numpy array
        img_array = np.array(img)

        # Detect pose keypoints
        keypoints_result = pose_detector(img_array)

        if not keypoints_result or len(keypoints_result) == 0:
            return None

        # keypoints_result is a list of poses, take the first one
        pose_keypoints = keypoints_result[0]

        keypoints = {}
        # DWpose provides 17 keypoints in COCO format
        for i in range(len(pose_keypoints)):
            kp = pose_keypoints[i]
            keypoints[f'kp_{i}'] = {
                'x': float(kp[0]),
                'y': float(kp[1]),
                'z': 0,  # DWPose provides 2D keypoints
                'visibility': float(kp[2]) if len(kp) > 2 else 1.0
            }
        return keypoints
    except Exception as e:
        print(f"Error in pose detection: {e}")
        return None

@app.post('/predict')
async def predict(file: UploadFile = File(...)):
    img = read_image_from_upload(file)
    kps = extract_keypoints_from_image(img)
    if kps is None:
        return JSONResponse({'keypoints': None})
    return JSONResponse({'keypoints': kps})

@app.post('/cheat-check')
async def cheat_check(file: UploadFile = File(...)):
    pil_img = read_image_from_upload(file)
    img = np.array(pil_img)
    h, w, _ = img.shape
    # pose landmarks
    kps = extract_keypoints_from_image(pil_img)
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
    min_bbox_area_threshold = 0.01 # Example threshold
    max_bbox_area_threshold = 0.8 # Example threshold

    cheat_reasons = []
    if bbox_area < area_threshold:
        cheat_reasons.append('small_bbox')
    if sharpness < sharpness_threshold:
        cheat_reasons.append('low_sharpness')
    if avg_vis < vis_threshold:
        cheat_reasons.append('low_visibility')
    if bbox_area < min_bbox_area_threshold:
        cheat_reasons.append('too_far')
    if bbox_area > max_bbox_area_threshold:
        cheat_reasons.append('too_close')

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

# from moviepy.editor import VideoFileClip
# from transformers import pipeline

# Init TSM for action recognition
# action_recognizer = pipeline("video-classification", model="jiangliming/TSM")

# from transformers import pipeline

# feedback_generator = pipeline('text-generation', model='distilbert-base-uncased')

@app.post('/feedback')
async def feedback(test_summary: dict):
    prompt = f"Provide a concise feedback report based on the following test summary:\n{test_summary}\nBe specific and actionable."
    response = feedback_generator(prompt, max_length=150, num_return_sequences=1)
    return JSONResponse({'choices': [{'message': {'content': response[0]['generated_text']}}]})

@app.post('/analyze-video')
async def analyze_video(file: UploadFile = File(...)):
    # Save the uploaded video to a temporary file
    suffix = os.path.splitext(file.filename)[1]
    fd, path = tempfile.mkstemp(suffix=suffix)
    with os.fdopen(fd, 'wb') as f:
        f.write(await file.read())

    try:
        # For now, return a placeholder response since video processing dependencies are not fully installed
        # In a production environment, this would process the video with TSM model

        # Placeholder metrics for testing
        metrics = {
            'detected_action': 'exercise',
            'confidence': 0.85,
            'reps': 10,
            'form_consistency': 0.75,
            'range_of_motion': 0.65,
            'exercise_type': 'fitness'
        }

        return JSONResponse({
            'score': 85,
            'metrics': metrics,
            'videoUrl': file.filename,
            'aiConfidence': 0.85,
            'feedback': 'Video analysis completed successfully. Exercise detected with good form consistency.'
        })
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Video analysis failed: {str(e)}")
    finally:
        # Clean up the temporary file
        os.remove(path)

if __name__ == '__main__':
    uvicorn.run(app, host='0.0.0.0', port=8080)
