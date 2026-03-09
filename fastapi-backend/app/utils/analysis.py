from __future__ import annotations
import os
import tempfile
import subprocess
from pathlib import Path
from typing import List, Tuple
import whisper
from dotenv import load_dotenv

load_dotenv()

UPLOAD_DIR = os.getenv("UPLOAD_DIR", "uploads/videos")
BASE_URL = os.getenv("FASTAPI_BASE_URL", "http://127.0.0.1:8000")
ANSWER_TIME = int(os.getenv("ANSWER_TIME", "40"))

os.makedirs(UPLOAD_DIR, exist_ok=True)

_whisper_model = None

def get_whisper_model():
    """Load Whisper 'base' model ONCE at startup (called from lifespan)"""
    global _whisper_model
    if _whisper_model is None:
        print("[Whisper] Loading 'base' model... (this takes ~10–20 seconds once)")
        _whisper_model = whisper.load_model("base")
        print("[Whisper] Model loaded and ready for transcription! 🎤")
    return _whisper_model


# === 1. Save uploaded video ===
def save_uploaded_video(file) -> str:
    file_location = os.path.join(UPLOAD_DIR, file.filename)
    with open(file_location, "wb") as f:
        content = file.file.read()
        f.write(content)
    return file_location


# === 2. Extract audio to temp MP3 (smaller & faster) ===
def extract_audio_to_wav(video_path: str) -> str:
    video_path = str(Path(video_path).resolve())
    tmp_mp3 = tempfile.NamedTemporaryFile(delete=False, suffix=".mp3")
    tmp_mp3_path = tmp_mp3.name
    tmp_mp3.close()

    ffmpeg_cmd = [
        "ffmpeg",
        "-i", video_path,
        "-vn",
        "-acodec", "libmp3lame",
        "-ab", "192k",
        "-ar", "44100",
        "-y",
        tmp_mp3_path
    ]

    try:
        subprocess.run(ffmpeg_cmd, check=True, capture_output=True)
        print(f"[FFmpeg] Audio extracted → {tmp_mp3_path}")
    except subprocess.CalledProcessError as e:
        error = e.stderr.decode() if e.stderr else "Unknown FFmpeg error"
        raise RuntimeError(f"FFmpeg failed: {error}")
    except FileNotFoundError:
        raise RuntimeError("FFmpeg not found! Install it on the server.")

    return tmp_mp3_path


# === 3. Transcribe + Split into 40-second chunks ===
def transcribe_and_split(audio_path: str, segment_duration: int = ANSWER_TIME) -> Tuple[str, List[str]]:
    if not os.path.exists(audio_path):
        raise FileNotFoundError(f"Audio file not found: {audio_path}")
    
    segment_duration = float(segment_duration)

    model = get_whisper_model() 

    print("[Whisper] Starting transcription...")
    result = model.transcribe(audio_path, word_timestamps=True)
    full_transcript = result["text"].strip()

    segments = result["segments"]
    num_chunks = 10
    chunks = [""] * num_chunks

    for seg in segments:
        start = float(seg["start"])
        text = seg["text"].strip()
        bucket_idx = min(int(start // segment_duration), num_chunks - 1)
        chunks[bucket_idx] += " " + text

    chunks = [c.strip() or "[silent]" for c in chunks]
    print(f"[Whisper] Transcription complete → {len(chunks)} chunks")

    return full_transcript, chunks


# === 4. Clean up temp files ===
def cleanup_temp_file(path: str) -> None:
    if path and os.path.exists(path):
        try:
            os.unlink(path)
        except Exception as e:
            print(f"[Cleanup] Failed to delete {path}: {e}")