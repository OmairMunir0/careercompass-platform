# app/utils/accuracy.py   ← REPLACE YOUR WHOLE FILE WITH THIS

from __future__ import annotations
import os
from datetime import datetime
from typing import List, Tuple, Dict
import numpy as np
from sentence_transformers import SentenceTransformer

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

        ref_ans = q["answer"]

        if not user_ans:
            similarity = 0.0
        else:
            similarity = batch_similarity([(user_ans, ref_ans)])[0]
            if similarity < 0.40:
                similarity = 0.0

        similarity = round(similarity, 4)
        percentage = round(similarity * 100, 2)

        if user_ans:
            valid_scores.append(similarity)

        result.append({
            "question_id": q["_id"],
            "question": q["question"],
            "user_answer": user_ans,
            "reference_answer": ref_ans,
            "similarity": similarity,
            "percentage": percentage,
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