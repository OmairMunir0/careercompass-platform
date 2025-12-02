# app/utils/accuracy.py - OpenAI Embeddings API version

from __future__ import annotations
import os
from typing import List, Tuple, Dict
import numpy as np
import openai
from dotenv import load_dotenv

load_dotenv()

# Initialize OpenAI client
client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

EMBEDDING_MODEL = "text-embedding-3-small"
THRESHOLD = 0.75

# ----------------------------------------------------------------------
# OpenAI Embeddings helper
# ----------------------------------------------------------------------
def get_embeddings(texts: List[str]) -> np.ndarray:
    """Get embeddings from OpenAI API"""
    response = client.embeddings.create(
        model=EMBEDDING_MODEL,
        input=texts
    )
    return np.array([item.embedding for item in response.data])

# ----------------------------------------------------------------------
# Core class using OpenAI Embeddings
# ----------------------------------------------------------------------
class TextSimilarity:
    @staticmethod
    def cosine(a: np.ndarray, b: np.ndarray) -> float:
        return float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b)))

    def embed(self, texts: List[str]) -> np.ndarray:
        return get_embeddings(texts)

    def similarity(self, ref: str, user: str) -> float:
        emb = self.embed([ref, user])
        return self.cosine(emb[0], emb[1])

    def batch_similarity(self, pairs: List[Tuple[str, str]]) -> List[float]:
        refs, users = zip(*pairs)
        emb = self.embed(list(refs) + list(users))
        split = len(pairs)
        return [self.cosine(r, u) for r, u in zip(emb[:split], emb[split:])]

# ----------------------------------------------------------------------
# Public API
# ----------------------------------------------------------------------
_similarity = TextSimilarity()

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