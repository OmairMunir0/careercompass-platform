from __future__ import annotations
from fastapi import UploadFile
import os
from dotenv import load_dotenv
import openai
import tempfile
from pathlib import Path
import subprocess
import math
from typing import List, Tuple, Dict
import uuid
import whisper 

load_dotenv()
UPLOAD_DIR = os.getenv("UPLOAD_DIR", "uploads/videos")
BASE_URL = os.getenv("FASTAPI_BASE_URL", "http://127.0.0.1:8000")
ANSWER_TIME = os.getenv("ANSWER_TIME", 40)
whisper_model = whisper.load_model("base")
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Lazy loading for Whisper model (only loads when needed)
_whisper_model = None

def get_whisper_model():
    """Load Whisper model lazily - only when actually needed for transcription."""
    global _whisper_model
    if _whisper_model is None:
        print("[Whisper] Loading model (this may take a moment and download if first time)...")
        _whisper_model = whisper.load_model("base")
        print("[Whisper] Model loaded successfully")
    return _whisper_model


# === MODULE 1: Save uploaded video ===
def save_uploaded_video(file: UploadFile) -> str:
    file_location = os.path.join(UPLOAD_DIR, file.filename)
    with open(file_location, "wb") as f:
        content = file.file.read()
        f.write(content)
    return file_location


# === MODULE 2: Extract audio to temp WAV ===
def extract_audio_to_wav(video_path: str) -> str:
    video_path = str(Path(video_path).resolve())

    # Create a temporary MP3 file
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
        print(f"[FFmpeg] Audio extracted: {tmp_mp3_path}")
    except subprocess.CalledProcessError as e:
        print(f"FFmpeg error: {e.stderr.decode() if e.stderr else 'No stderr'}")
        raise
    except FileNotFoundError:
        raise RuntimeError("FFmpeg not installed or not found in PATH")

    return tmp_mp3_path


# === MODULE 3: Transcribe with timestamps + split into 40-sec chunks ===
def transcribe_and_split(audio_path: str, segment_duration: int = ANSWER_TIME) -> Tuple[str, List[str]]:
    if not os.path.exists(audio_path):
        raise FileNotFoundError(f"Audio not found: {audio_path}")

    model = get_whisper_model()  # Lazy load model only when needed
    result = model.transcribe(
        audio_path,
        word_timestamps=True,
    )

    full_transcript = result["text"].strip()
    segments = result["segments"]

    num_chunks = 10
    chunks = [""] * num_chunks

    segment_duration = float(segment_duration)

    for seg in segments:
        start = float(seg["start"]) 
        text = seg["text"].strip()

        bucket_idx = min(int(start // segment_duration), num_chunks - 1)
        chunks[bucket_idx] += " " + text

    chunks = [c.strip() or "[silent]" for c in chunks]
    return full_transcript, chunks


# === MODULE 4: Clean up temp file ===
def cleanup_temp_file(path: str) -> None:
    if path and os.path.exists(path):
        try:
            os.unlink(path)
        except Exception as e:
            print(f"Warning: Failed to delete {path}: {e}")