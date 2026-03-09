import cv2
import subprocess
import os


def convert_to_mp4(video_path):
    """
    Convert .webm or unsupported formats to .mp4 using FFmpeg.
    Returns path to mp4 file.
    """
    ext = os.path.splitext(video_path)[1].lower()
    if ext == ".mp4":
        return video_path 
    mp4_path = os.path.splitext(video_path)[0] + ".mp4"
    if not os.path.exists(mp4_path):
        print(f"Converting {video_path} → {mp4_path} ...")
        subprocess.run([
            "ffmpeg", "-i", video_path, "-c:v", "libx264",
            "-preset", "fast", "-crf", "23", mp4_path
        ], check=True)
    return mp4_path


def open_video(video_path):
    """
    Open video with OpenCV. Returns VideoCapture, FPS, duration, total frames.
    """
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        raise ValueError("Cannot open video:", video_path)

    fps = cap.get(cv2.CAP_PROP_FPS)
    if fps <= 0 or fps > 120:
        fps = 30  # fallback
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    duration = total_frames / fps if total_frames > 0 else None
    return cap, fps, duration, total_frames


# Load cascade once at module level
FACE_CASCADE = cv2.CascadeClassifier(
    cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
)

def detect_faces(frame, scaleFactor=1.1, minNeighbors=3):
    """Detect faces using Haar Cascade."""
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    faces = FACE_CASCADE.detectMultiScale(gray, scaleFactor=scaleFactor, minNeighbors=minNeighbors)
    if len(faces) == 0:
        # Retry with even more lenient parameters if first pass fails
        faces = FACE_CASCADE.detectMultiScale(gray, scaleFactor=1.05, minNeighbors=3)
    
    return faces