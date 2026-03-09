from .video_check import convert_to_mp4, open_video, detect_faces
from .emotional_analysis import analyze_frame_faces
from .feedback import generate_feedback
from collections import defaultdict
import numpy as np
import cv2

def analyze_interview_video(video_path, frame_interval_seconds=1, display_timeline=False):
    # Auto-convert to mp4 if needed
    video_path = convert_to_mp4(video_path)

    cap, fps, duration, total_frames = open_video(video_path)
    print(f"Video: {duration:.1f}s, FPS: {fps:.1f}, Total frames: {total_frames}")

    emotions_over_time = []
    total_smile_count = 0
    processed_frames = 0

    t = 0
    while t < duration:
        cap.set(cv2.CAP_PROP_POS_MSEC, t*1000)
        ret, frame = cap.read()
        if not ret:
            break

        faces = detect_faces(frame)
        print(f"[DEBUG] Time: {t}s | Faces: {len(faces)}")
        if len(faces) > 0:
            avg_emotions, smiles = analyze_frame_faces(faces, frame)
            if avg_emotions:
                avg_emotions['time'] = t
                emotions_over_time.append(avg_emotions)
                total_smile_count += smiles
                processed_frames += 1

        t += frame_interval_seconds

    cap.release()

    if processed_frames == 0:
        return {"error": "No faces detected"}

    # Overall averages
    avg_emotions = {k: float(round(np.mean([e[k] for e in emotions_over_time]),2))
                    for k in emotions_over_time[0] if k != 'time'}

    # Dominant emotions summary
    emotion_counts = defaultdict(int)
    for e in emotions_over_time:
        dominant = max({k:v for k,v in e.items() if k != 'time'}, key=lambda x: e[x])
        emotion_counts[dominant] += 1
    dominant_summary = {k: round(v / processed_frames * 100,1) for k,v in emotion_counts.items()}

    smile_percentage = round(total_smile_count / processed_frames * 100,1)
    confidence_score = round((smile_percentage * 0.5) + (avg_emotions.get('happy',0) * 0.5))

    feedback = generate_feedback(avg_emotions, smile_percentage)
    

    return {
        "summary": {
            "smile_percentage": smile_percentage,
            "confidence_score": min(confidence_score,100),
            "processed_frames": processed_frames,
            "duration_seconds": round(duration,1)
        },
        "avg_emotions": avg_emotions,
        "dominant_emotions": dominant_summary,
        "feedback": feedback,
        "emotions_over_time": emotions_over_time
    }