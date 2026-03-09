# emotion_analysis.py
import numpy as np
from deepface import DeepFace

def analyze_frame_faces(faces, frame):
    """
    Analyze all faces in a frame.
    Returns average emotions and smile count.
    """
    frame_emotions_list = []
    smile_count = 0

    for (x, y, w, h) in faces:
        face = frame[y:y+h, x:x+w]
        try:
            result = DeepFace.analyze(
                img_path=face,
                actions=['emotion'],
                enforce_detection=False,
                detector_backend='skip',
                silent=True
            )[0]

            emotions = result['emotion']
            frame_emotions_list.append(emotions)

            dominant = result['dominant_emotion']
            if dominant == "happy" and emotions['happy'] > 50:
                smile_count += 1
        except Exception as e:
            print(f"DeepFace error: {e}")
            continue

    if frame_emotions_list:
        avg_emotions = {k: float(np.mean([f[k] for f in frame_emotions_list])) for k in frame_emotions_list[0]}
    else:
        avg_emotions = None

    return avg_emotions, smile_count
