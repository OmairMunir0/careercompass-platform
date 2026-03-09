import re
import unicodedata
from collections import Counter
import json

import PyPDF2
from docx import Document
import spacy
from sentence_transformers import SentenceTransformer, util

# ========================
# Load NLP Models (with fallback)
# ========================
print("Loading NLP models...")
try:
    nlp = spacy.load('en_core_web_sm')
except OSError:
    print("Downloading spaCy model...")
    import subprocess
    subprocess.run(["python", "-m", "spacy", "download", "en_core_web_sm"], check=True)
    nlp = spacy.load('en_core_web_sm')

semantic_model = SentenceTransformer('all-MiniLM-L6-v2')
print("Models loaded successfully!")


# ========================
# Text Extraction
# ========================
def extract_text_from_pdf(pdf_path):
    try:
        with open(pdf_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            text = ""
            for page in pdf_reader.pages:
                text += page.extract_text() or ""
            return text
    except Exception as e:
        return f"Error reading PDF: {str(e)}"


def extract_text_from_docx(docx_path):
    try:
        doc = Document(docx_path)
        text = "\n".join([paragraph.text for paragraph in doc.paragraphs])
        return text
    except Exception as e:
        return f"Error reading DOCX: {str(e)}"


def clean_text(text):
    if not text:
        return ""

    text = unicodedata.normalize("NFKC", text)

    # Remove emojis
    emoji_pattern = re.compile(
        "["u"\U0001F600-\U0001F64F"
        u"\U0001F300-\U0001F5FF"
        u"\U0001F680-\U0001F6FF"
        u"\U0001F1E0-\U0001F1FF""]+", flags=re.UNICODE)
    text = emoji_pattern.sub("", text)

    # Preserve emails, URLs, GitHub/Netlify links
    preserved_patterns = re.findall(
        r"[\w\.\-+]+@[\w\.\-]+|https?:\/\/\S+|github\.com/\S+|netlify\.app/\S+",
        text
    )

    # Remove unwanted characters but keep spaces and preserved items
    text = re.sub(r"[^a-zA-Z0-9\s@\/\:\.\-\_\+]", " ", text)
    text = re.sub(r"\s+", " ", text).strip()

    return text


def identify_sections(text):
    sections = {
        'education': False,
        'experience': False,
        'skills': False,
        'certifications': False,
        'projects': False
    }

    text_lower = text.lower()

    if any(word in text_lower for word in ['education', 'degree', 'university', 'college']):
        sections['education'] = True
    if any(word in text_lower for word in ['experience', 'work history', 'employment']):
        sections['experience'] = True
    if any(word in text_lower for word in ['skills', 'technical skills', 'competencies']):
        sections['skills'] = True
    if any(word in text_lower for word in ['certification', 'certified', 'certificate']):
        sections['certifications'] = True
    if any(word in text_lower for word in ['project', 'portfolio']):
        sections['projects'] = True

    return sections


# ========================
# Keyword Extraction
# ========================
def extract_keywords(text, top_n=20):
    doc = nlp(text)
    keywords = []
    for token in doc:
        if token.pos_ in ['NOUN', 'PROPN', 'ADJ'] and not token.is_stop:
            keywords.append(token.text.lower())
    keyword_freq = Counter(keywords)
    return [word for word, _ in keyword_freq.most_common(top_n)]


def analyze_keywords(resume_text, job_description):
    job_keywords = extract_keywords(job_description, top_n=30)
    resume_lower = resume_text.lower()

    matches = []
    missing = []

    for keyword in job_keywords:
        if keyword in resume_lower:
            frequency = resume_lower.count(keyword)
            matches.append({
                'keyword': keyword,
                'frequency': frequency,
                'found': True
            })
        else:
            missing.append({
                'keyword': keyword,
                'found': False
            })

    match_rate = (len(matches) / len(job_keywords) * 100) if job_keywords else 0

    return {
        'total_keywords': len(job_keywords),
        'matched': matches,
        'missing': missing,
        'match_rate': round(match_rate, 1)
    }


# ========================
# Skills Extraction
# ========================
COMMON_SKILLS = [
    'python', 'javascript', 'java', 'c++', 'c#', 'ruby', 'php', 'swift', 'kotlin',
    'typescript', 'go', 'rust', 'scala', 'r', 'matlab',
    'html', 'css', 'react', 'reactjs', 'nextjs', 'react.js', 'next.js', 'angular', 'vue', 'node.js', 'express', 'django',
    'flask', 'spring', 'asp.net', 'next.js', 'nuxt.js',
    'sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'oracle', 'cassandra',
    'dynamodb', 'elasticsearch',
    'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'terraform',
    'ansible', 'ci/cd', 'git', 'github', 'gitlab',
    'machine learning', 'deep learning', 'tensorflow', 'pytorch', 'scikit-learn',
    'nlp', 'computer vision', 'data science',
    'agile', 'scrum', 'jira', 'rest api', 'graphql', 'microservices',
    'testing', 'unit testing', 'integration testing'
]

def extract_skills(text):
    text_lower = text.lower()
    return [skill for skill in COMMON_SKILLS if skill in text_lower]


def analyze_skill_gap(resume_text, job_description):
    resume_skills = set(extract_skills(resume_text))
    required_skills = set(extract_skills(job_description))

    matched_skills = resume_skills & required_skills
    missing_skills = required_skills - resume_skills
    extra_skills = resume_skills - required_skills

    match_percentage = (len(matched_skills) / len(required_skills) * 100) if required_skills else 0

    return {
        'matched': list(matched_skills),
        'missing': list(missing_skills),
        'extra': list(extra_skills),
        'match_percentage': round(match_percentage, 1)
    }


# ========================
# Semantic Similarity
# ========================
def calculate_semantic_similarity(resume_text, job_description):
    resume_embedding = semantic_model.encode(resume_text, convert_to_tensor=True)
    job_embedding = semantic_model.encode(job_description, convert_to_tensor=True)
    similarity = util.cos_sim(resume_embedding, job_embedding)
    return round(float(similarity[0][0]) * 100, 1)


# ========================
# Formatting & ATS Score
# ========================
def analyze_formatting(resume_text, sections):
    issues = []
    word_count = len(resume_text.split())

    if word_count < 300:
        issues.append("Resume too short (aim for 400-800 words)")
    elif word_count > 1000:
        issues.append("Resume too long (aim for 400-800 words)")

    if not sections['education']:
        issues.append("Missing 'Education' section")
    if not sections['experience']:
        issues.append("Missing 'Experience' section")
    if not sections['skills']:
        issues.append("Missing 'Skills' section")

    if not re.search(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', resume_text):
        issues.append("No email address found")
    if not re.search(r'\b\d{3}[-.]?\d{3}[-.]?\d{4}\b', resume_text):
        issues.append("No phone number found")

    return issues


def calculate_ats_score(keyword_analysis, skill_analysis, semantic_score, formatting_issues):
    weights = {
        'keyword_match': 0.30,
        'skill_match': 0.25,
        'semantic_similarity': 0.25,
        'formatting': 0.20
    }

    keyword_score = keyword_analysis['match_rate']
    skill_score = skill_analysis['match_percentage']
    formatting_score = max(0, 100 - (len(formatting_issues) * 12))

    ats_score_val = (
        keyword_score * weights['keyword_match'] +
        skill_score * weights['skill_match'] +
        semantic_score * weights['semantic_similarity'] +
        formatting_score * weights['formatting']
    )

    return {
        'overall_score': round(ats_score_val, 1),
        'breakdown': {
            'keyword_match': round(keyword_score, 1),
            'skill_match': round(skill_score, 1),
            'semantic_similarity': round(semantic_score, 1),
            'formatting': round(formatting_score, 1)
        }
    }


def generate_suggestions(keyword_analysis, skill_analysis, formatting_issues, ats_score):
    suggestions = []

    for kw in keyword_analysis['missing'][:5]:
        suggestions.append({
            'priority': 'HIGH',
            'category': 'Keywords',
            'suggestion': f"Add '{kw['keyword']}' to your resume if applicable",
            'impact': '+5-8 points'
        })

    for skill in skill_analysis['missing'][:3]:
        suggestions.append({
            'priority': 'MEDIUM',
            'category': 'Skills',
            'suggestion': f"Include '{skill}' if you have experience with it",
            'impact': '+3-5 points'
        })

    for issue in formatting_issues:
        suggestions.append({
            'priority': 'MEDIUM',
            'category': 'Formatting',
            'suggestion': issue,
            'impact': '+2-4 points'
        })

    if ats_score['overall_score'] < 70:
        suggestions.append({
            'priority': 'HIGH',
            'category': 'General',
            'suggestion': 'Tailor your resume more closely to the job description',
            'impact': '+10-15 points'
        })

    return suggestions


# ========================
# Main Analysis Function
# ========================
def analyze_resume(resume_path_or_text, job_description, is_file=True, file_type="pdf"):
    print("\nStarting ATS Resume Analysis...\n")

    if is_file:
        if file_type.lower() == "pdf":
            resume_text = extract_text_from_pdf(resume_path_or_text)
        elif file_type.lower() == "docx":
            resume_text = extract_text_from_docx(resume_path_or_text)
        else:
            return {"error": "Unsupported file type"}
    else:
        resume_text = resume_path_or_text

    if "Error" in resume_text:
        return {"error": resume_text}

    resume_text = clean_text(resume_text)
    job_description = clean_text(job_description)

    sections = identify_sections(resume_text)
    keyword_analysis = analyze_keywords(resume_text, job_description)
    skill_analysis = analyze_skill_gap(resume_text, job_description)
    semantic_score = calculate_semantic_similarity(resume_text, job_description)
    formatting_issues = analyze_formatting(resume_text, sections)
    ats_score = calculate_ats_score(keyword_analysis, skill_analysis, semantic_score, formatting_issues)
    suggestions = generate_suggestions(keyword_analysis, skill_analysis, formatting_issues, ats_score)

    results = {
        'ats_score': ats_score,
        'keyword_analysis': keyword_analysis,
        'skill_analysis': skill_analysis,
        'semantic_score': semantic_score,
        'formatting_issues': formatting_issues,
        'suggestions': suggestions
    }

    return results


def print_results(results):
    print("="*80)
    print("ATS RESUME ANALYSIS RESULTS")
    print("="*80)

    score = results['ats_score']['overall_score']
    print(f"\nOVERALL ATS SCORE: {score}/100")

    if score >= 80:
        print("   Excellent! Your resume is highly ATS-compatible")
    elif score >= 60:
        print("   Good, but there's room for improvement")
    else:
        print("   Needs significant optimization")

    print("\nSCORE BREAKDOWN:")
    b = results['ats_score']['breakdown']
    print(f"   • Keyword Match: {b['keyword_match']}/100")
    print(f"   • Skill Match: {b['skill_match']}/100")
    print(f"   • Semantic Similarity: {b['semantic_similarity']}/100")
    print(f"   • Formatting: {b['formatting']}/100")

    print(f"\nKeyword Match Rate: {results['keyword_analysis']['match_rate']}%")
    if results['keyword_analysis']['missing']:
        print("   Top Missing Keywords:")
        for i, m in enumerate(results['keyword_analysis']['missing'][:5], 1):
            print(f"      {i}. {m['keyword']}")

    print(f"\nSkill Match: {results['skill_analysis']['match_percentage']}%")
    if results['skill_analysis']['missing']:
        print("   Missing Skills:", ", ".join(results['skill_analysis']['missing'][:10]))

    if results['formatting_issues']:
        print(f"\nFormatting Issues ({len(results['formatting_issues'])}):")
        for i, issue in enumerate(results['formatting_issues'], 1):
            print(f"   {i}. {issue}")

    print("\nTOP SUGGESTIONS:")
    high = [s for s in results['suggestions'] if s['priority'] == 'HIGH']
    for i, sug in enumerate(high[:3], 1):
        print(f"   {i}. [HIGH] {sug['suggestion']} ({sug['impact']})")

    print("\n" + "="*80)


# ========================
# Example Usage
# ========================
if __name__ == "__main__":
    # Update these paths
    RESUME_FILE = "Cv Resume.pdf"        # or "resume.docx"
    JOB_DESC = """Paste full job description here..."""

    results = analyze_resume(RESUME_FILE, JOB_DESC, is_file=True, file_type="pdf")
    if "error" not in results:
        print_results(results)