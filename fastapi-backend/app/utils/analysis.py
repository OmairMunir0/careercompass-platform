from __future__ import annotations
from fastapi import UploadFile
import speech_recognition as sr
import os
from dotenv import load_dotenv
import openai
import tempfile
from pathlib import Path
import subprocess
import math
from openai import OpenAI
from pathlib import Path
from typing import List
import uuid
import whisper


load_dotenv()
openai.api_key = os.getenv("OPENAI_API_KEY")
whisper_model = whisper.load_model("base")
UPLOAD_DIR = os.getenv("UPLOAD_DIR", "uploads/videos")
BASE_URL = os.getenv("FASTAPI_BASE_URL", "http://127.0.0.1:8000")
os.makedirs(UPLOAD_DIR, exist_ok=True)


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


# === MODULE 3: Transcribe audio in chunks ===
def transcribe_audio_chunks(audio_path: str, chunk_duration: int = 25) -> str:
    if not os.path.exists(audio_path):
        raise FileNotFoundError(f"Audio file not found: {audio_path}")

    print(f"[Local Whisper] Loading audio: {audio_path}")
    audio = whisper.load_audio(audio_path)
    duration = len(audio) / whisper.audio.SAMPLE_RATE

    chunks = math.ceil(duration / chunk_duration)
    full_transcript = []

    for i in range(chunks):
        start = i * chunk_duration
        end = min((i + 1) * chunk_duration, duration)
        print(f"  → Chunk {i+1}: {start:.1f}s → {end:.1f}s")

        chunk_audio = audio[int(start * whisper.audio.SAMPLE_RATE): int(end * whisper.audio.SAMPLE_RATE)]
        result = whisper_model.transcribe(chunk_audio, language="en")
        full_transcript.append(result["text"].strip())

    final_text = " ".join(full_transcript)
    print(f"[Local Whisper] Done. Transcript length: {len(final_text)} chars")
    return final_text


# === Helper: Get audio duration ===
def _get_audio_duration(audio_path: str) -> float:
    cmd = [
        "ffprobe", "-v", "error",
        "-show_entries", "format=duration",
        "-of", "json", audio_path
    ]
    result = subprocess.run(cmd, capture_output=True, text=True, check=True)
    import json
    data = json.loads(result.stdout)
    return float(data["format"]["duration"])


# === Helper: Extract a time chunk using ffmpeg ===
def _extract_audio_chunk(audio_path: str, start: float, duration: float, index: int) -> str:
    tmp_dir = Path(audio_path).parent / "tmp_chunks"
    tmp_dir.mkdir(exist_ok=True)
    chunk_path = str(tmp_dir / f"chunk_{uuid.uuid4().hex}.mp3")

    cmd = [
        "ffmpeg", "-y",
        "-i", audio_path,
        "-ss", str(start),
        "-t", str(duration),
        "-acodec", "libmp3lame",
        "-b:a", "64k",
        "-ar", "16000",
        "-ac", "1",
        chunk_path
    ]
    try:
        subprocess.run(cmd, check=True, capture_output=True)
    except subprocess.CalledProcessError as e:
        raise RuntimeError(f"Failed to extract chunk {index}: {e.stderr.decode() if e.stderr else 'Unknown'}")
    return chunk_path


# === MODULE 4: Clean up temp file ===
def cleanup_temp_file(path: str) -> None:
    if path and os.path.exists(path):
        try:
            os.unlink(path)
        except Exception as e:
            print(f"Warning: Failed to delete {path}: {e}")