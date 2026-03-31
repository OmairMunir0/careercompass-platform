from __future__ import annotations
import os
from datetime import datetime
from typing import List, Tuple, Dict
import numpy as np
from sentence_transformers import SentenceTransformer
import google.generativeai as genai
import json
import re

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

model_gemini = genai.GenerativeModel('gemini-2.5-flash', generation_config={"response_mime_type": "application/json"})

def get_llm_rubric_score(question: str, transcript: str) -> dict:
    if not transcript or len(transcript.strip()) < 5:
        return {"technical_accuracy": 0, "depth": 0, "clarity": 0}
        
    prompt = f"""
    You are a senior technical interviewer.
    Question: {question}
    Candidate Answer: {transcript}

    Score from 0 to 10 on the following metrics based on the answer provided.
    Be Lineant.
    Ensure output is exactly this JSON structure:
    {{
        "technical_accuracy": 0,
        "depth": 0,
        "clarity": 0
    }}
    """
    try:
        response = model_gemini.generate_content(prompt)
        result = json.loads(response.text)
        print(result)
        return {
            "technical_accuracy": float(result.get("technical_accuracy", 0)),
            "depth": float(result.get("depth", 0)),
            "clarity": float(result.get("clarity", 0))
        }
    except Exception as e:
        print(f"Gemini API Error: {e}")
        return {"technical_accuracy": 0, "depth": 0, "clarity": 0}

def get_filler_words_count(transcript: str) -> int:
    fillers = [r'\bum\b', r'\buh\b', r'\blike\b', r'\byou know\b', r'\bah\b']
    count = 0
    text_lower = transcript.lower()
    for f in fillers:
        count += len(re.findall(f, text_lower))
    return count

def get_concept_coverage(transcript: str, concepts: List[str]) -> dict:
    if not concepts:
        return {"hit": [], "missed": []}
    
    text_lower = transcript.lower()
    hit = []
    missed = []
    for c in concepts:
        if c.lower() in text_lower:
            hit.append(c)
        else:
            missed.append(c)
    return {"hit": hit, "missed": missed}


# ----------------------------------------------------------------------
# 1. GLOBAL MODEL (singleton) – THIS IS THE KEY
# ----------------------------------------------------------------------
_MODEL: SentenceTransformer | None = None
_DEFAULT_MODEL = os.getenv("MODEL_NAME", "intfloat/e5-large-v2")
_DEFAULT_PREFIX = "query: "
THRESHOLD = 0.75

def _load_model(model_name: str | None = None, device: str | None = None) -> SentenceTransformer:
    global _MODEL
    if _MODEL is None:
        name = model_name or _DEFAULT_MODEL
        print(f"[accuracy.py] Loading accuracy model '{name}'...", end="", flush=True)
        _MODEL = SentenceTransformer(name, device=device)
        print(" Done! Model ready for answer similarity.")
    return _MODEL

# ----------------------------------------------------------------------
# 2. Core class (unchanged logic, just uses global model)
# ----------------------------------------------------------------------
class TextSimilarity:
    def __init__(self, model_name: str | None = None, device: str | None = None, prefix: str = _DEFAULT_PREFIX):
        self.model = _load_model(model_name, device)  # ← uses global _MODEL
        self.prefix = prefix

    def _add_prefix(self, texts: List[str]) -> List[str]:
        return [f"{self.prefix}{t}" for t in texts]

    def embed(self, texts: List[str]) -> np.ndarray:
        prefixed = self._add_prefix(texts)
        return self.model.encode(prefixed, normalize_embeddings=True, batch_size=32, show_progress_bar=False)

    @staticmethod
    def cosine(a: np.ndarray, b: np.ndarray) -> float:
        return float(np.dot(a, b))

    def similarity(self, ref: str, user: str) -> float:
        emb = self.embed([ref, user])
        return self.cosine(emb[0], emb[1])

    def batch_similarity(self, pairs: List[Tuple[str, str]]) -> List[float]:
        refs, users = zip(*pairs)
        emb = self.embed(list(refs) + list(users))
        split = len(pairs)
        return [float(np.dot(r, u)) for r, u in zip(emb[:split], emb[split:])]

# ----------------------------------------------------------------------
# 3. Public API (same as before)
# ----------------------------------------------------------------------
_similarity = TextSimilarity()  # default instance

def get_similarity(ref: str, user: str) -> float:
    return _similarity.similarity(ref, user)

def batch_similarity(pairs: List[Tuple[str, str]]) -> List[float]:
    return _similarity.batch_similarity(pairs)

# ----------------------------------------------------------------------
# 4. Your get_accuracy function – NO CHANGES NEEDED
# ----------------------------------------------------------------------
def get_accuracy(segmented_chunks: List[str], questions_list: List[dict]) -> Dict:
    if not questions_list:
        return {"result": [], "overall_score": 0.0}

    result = []
    valid_scores = []

    for i, q in enumerate(questions_list):
        user_ans = ""
        if i < len(segmented_chunks):
            raw = segmented_chunks[i].strip()
            if raw.lower() != "[silent]":
                user_ans = raw

        ref_ans = q.get("answer", "")
        concepts = q.get("concepts", [])
        
        concept_cov = get_concept_coverage(user_ans, concepts)
        filler_count = get_filler_words_count(user_ans)

        if not user_ans:
            similarity = 0.0
            llm_scores = {"technical_accuracy": 0, "depth": 0, "clarity": 0}
        else:
            similarity = batch_similarity([(user_ans, ref_ans)])[0]
            if similarity < 0.40:
                similarity = 0.0
                
            llm_scores = get_llm_rubric_score(q["question"], user_ans)

        # Combine semantic cosine similarity and Gemini rubric
        llm_avg = (llm_scores["technical_accuracy"] + llm_scores["depth"] + llm_scores["clarity"]) / 3.0
        
        if user_ans:
            combined_score = (similarity * 0.4) + ((llm_avg / 10.0) * 0.6)
            # Apply tiny bonus for concepts, tiny penalty for excessive filler words
            bonus = min(len(concept_cov["hit"]) * 0.05, 0.15)
            penalty = min(filler_count * 0.01, 0.10)
            combined_score = max(0.0, min(1.0, combined_score + bonus - penalty))
        else:
            combined_score = 0.0
            
        similarity = round(combined_score, 4)
        percentage = round(combined_score * 100, 2)

        if user_ans:
            valid_scores.append(similarity)

        result.append({
            "question_id": q["_id"],
            "question": q["question"],
            "user_answer": user_ans,
            "reference_answer": ref_ans,
            "similarity": similarity,
            "percentage": percentage,
            "llm_scores": llm_scores,
            "concepts_hit": concept_cov["hit"],
            "concepts_missed": concept_cov["missed"],
            "filler_words": filler_count
        })

    overall_score = round(sum(valid_scores) / len(valid_scores) * 100, 2) if valid_scores else 0.0

    return {
        "result": result,
        "overall_score": overall_score
    }

# ----------------------------------------------------------------------
# 5. Self-test (optional, keep it)
# ----------------------------------------------------------------------
TEST_CASES: List[Tuple[str, str, float, str]] = [
    ("I love coding.", "I love coding.", 0.99, "exact"),
    ("I am a CS student.", "I study computer science.", 0.80, "synonyms"),
    ("Python is great.", "I like pizza.", 0.30, "unrelated"),
    ("Yes", "No", 0.20, "short"),
]

def _run_self_test():
    sim = TextSimilarity()
    print("\n" + "="*80)
    print("ACCURACY MODEL SELF-TEST")
    print("="*80)
    for ref, usr, exp, name in TEST_CASES:
        score = sim.similarity(ref, usr)
        print(f"{score:.4f} | {name:12} | {ref} → {usr}")
    print("="*80)

if __name__ == "__main__":
    _run_self_test()

__all__ = ["get_similarity", "batch_similarity", "TextSimilarity", "get_accuracy"]