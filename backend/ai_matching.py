import re
import io
from typing import Dict, List, Tuple, Any
from pypdf import PdfReader
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# Predefined dictionary of common tech skills to extract from resumes
TECH_SKILLS_DICTIONARY = [
    "python", "javascript", "typescript", "html", "css", "react", "next.js", 
    "vue.js", "angular", "node.js", "express", "nest.js", "fastapi", "django", 
    "flask", "sql", "postgresql", "sqlite", "mongodb", "mysql", "redis", 
    "docker", "kubernetes", "aws", "gcp", "azure", "git", "github", "gitlab", 
    "ci/cd", "linux", "c++", "c#", "java", "kotlin", "swift", "arduino", 
    "esp32", "iot", "embedded", "raspberry pi", "ros", "firmware", "microcontrollers",
    "figma", "ui/ux", "product management", "scrum", "agile", "project management"
]

def clean_text(text: str) -> str:
    """Helper to clean text for NLP processing"""
    if not text:
        return ""
    text = text.lower()
    text = re.sub(r'\s+', ' ', text)
    text = re.sub(r'[^\w\s\-\/\.\,\@]', '', text)
    return text.strip()

def parse_cv_pdf(file_bytes: bytes) -> Dict[str, Any]:
    """
    Parses an uploaded PDF CV, extracts text, matches skills, and extracts contact info.
    """
    text = ""
    try:
        pdf = PdfReader(io.BytesIO(file_bytes))
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
    except Exception as e:
        print(f"Error parsing PDF: {e}")
        return {"error": "Failed to parse PDF file"}

    # Basic cleaning
    cleaned = clean_text(text)
    
    # 1. Extract Email
    email_match = re.search(r'[\w\.-]+@[\w\.-]+\.\w+', text)
    email = email_match.group(0) if email_match else None
    
    # 2. Extract Telegram Handle
    telegram_match = re.search(r'(?:t\.me\/|@)([a-zA-Z0-9_]{5,32})', text)
    telegram = telegram_match.group(1) if telegram_match else None
    
    # 3. Extract GitHub link
    github_match = re.search(r'github\.com\/([a-zA-Z0-9_-]+)', text, re.IGNORECASE)
    github = github_match.group(0) if github_match else None
    if github and not github.startswith("http"):
        github = "https://" + github

    # 4. Extract LinkedIn link
    linkedin_match = re.search(r'linkedin\.com\/in\/([a-zA-Z0-9_-]+)', text, re.IGNORECASE)
    linkedin = linkedin_match.group(0) if linkedin_match else None
    if linkedin and not linkedin.startswith("http"):
        linkedin = "https://" + linkedin

    # 5. Extract Skills
    found_skills = []
    for skill in TECH_SKILLS_DICTIONARY:
        # Match word boundaries or special characters for skills like C++, C#, .NET, Node.js
        pattern = r'\b' + re.escape(skill) + r'\b'
        # Special cases for Next.js, C++, C#
        if skill in ["next.js", "vue.js", "node.js"]:
            pattern = re.escape(skill)
        elif skill == "c++":
            pattern = r'c\+\+'
        elif skill == "c#":
            pattern = r'c\#'
            
        if re.search(pattern, cleaned, re.IGNORECASE):
            found_skills.append(skill)
            
    # Capitalize tags properly
    formatted_skills = []
    for skill in found_skills:
        # Map back to proper case
        mapping = {
            "python": "Python", "javascript": "JavaScript", "typescript": "TypeScript", 
            "html": "HTML", "css": "CSS", "react": "React", "next.js": "Next.js", 
            "vue.js": "Vue.js", "angular": "Angular", "node.js": "Node.js", 
            "express": "Express", "nest.js": "Nest.js", "fastapi": "FastAPI", 
            "django": "Django", "flask": "Flask", "sql": "SQL", "postgresql": "PostgreSQL", 
            "sqlite": "SQLite", "mongodb": "MongoDB", "mysql": "MySQL", "redis": "Redis", 
            "docker": "Docker", "kubernetes": "Kubernetes", "aws": "AWS", "gcp": "GCP", 
            "azure": "Azure", "git": "Git", "github": "GitHub", "gitlab": "GitLab", 
            "ci/cd": "CI/CD", "linux": "Linux", "c++": "C++", "c#": "C#", "java": "Java", 
            "kotlin": "Kotlin", "swift": "Swift", "arduino": "Arduino", "esp32": "ESP32", 
            "iot": "IoT", "embedded": "Embedded", "raspberry pi": "Raspberry Pi", 
            "ros": "ROS", "firmware": "Firmware", "microcontrollers": "Microcontrollers",
            "figma": "Figma", "ui/ux": "UI/UX", "product management": "Product Management", 
            "scrum": "Scrum", "agile": "Agile", "project management": "Project Management"
        }
        formatted_skills.append(mapping.get(skill, skill.title()))

    # 6. Extract candidate name (heuristics: first line or line containing "Resume" / "CV")
    lines = [line.strip() for line in text.split('\n') if line.strip()]
    full_name = "Candidate Name"
    if lines:
        for line in lines[:4]: # check first 4 lines
            if len(line.split()) >= 2 and not any(kw in line.lower() for kw in ["resume", "cv", "curriculum", "email", "phone", "profile"]):
                full_name = line
                break

    return {
        "full_name": full_name,
        "email": email,
        "telegram": telegram,
        "github": github,
        "linkedin": linkedin,
        "skills": ", ".join(formatted_skills),
        "raw_text": text
    }

def calculate_match(candidate_skills_str: str, candidate_experience: str, candidate_bio: str, 
                    job_skills_str: str, job_description: str, job_requirements: str) -> Dict[str, Any]:
    """
    Computes a match percentage score and explains the alignment/gaps.
    """
    # 1. Skill Overlap Matching (60% weight)
    candidate_skills = [s.strip().lower() for s in candidate_skills_str.split(",") if s.strip()]
    job_skills = [s.strip().lower() for s in job_skills_str.split(",") if s.strip()]

    matched_skills = []
    missing_skills = []

    if job_skills:
        for skill in job_skills:
            if skill in candidate_skills:
                matched_skills.append(skill)
            else:
                missing_skills.append(skill)
        skill_score = len(matched_skills) / len(job_skills)
    else:
        skill_score = 1.0

    # 2. Text Cosine Similarity matching (40% weight)
    candidate_corpus = clean_text(f"{candidate_skills_str} {candidate_experience} {candidate_bio}")
    job_corpus = clean_text(f"{job_skills_str} {job_description} {job_requirements}")

    cosine_score = 0.0
    if candidate_corpus and job_corpus:
        try:
            vectorizer = TfidfVectorizer()
            tfidf = vectorizer.fit_transform([candidate_corpus, job_corpus])
            cosine_score = cosine_similarity(tfidf[0:1], tfidf[1:2])[0][0]
        except Exception as e:
            print(f"Error calculating cosine similarity: {e}")
            cosine_score = 0.0

    # Combine scores
    final_score = (0.6 * skill_score) + (0.4 * cosine_score)
    final_percentage = round(min(max(final_score * 100, 0), 100), 1)

    # Format output labels nicely
    matched_skills_formatted = [s.title() for s in matched_skills]
    missing_skills_formatted = [s.title() for s in missing_skills]

    # Generate NLP Explanation
    if final_percentage >= 85:
        explanation = "Excellent match! The candidate possesses almost all required skills and has strong background relevance."
    elif final_percentage >= 65:
        explanation = f"Good match. The candidate aligns with the core requirements (matches {len(matched_skills)} skills) but has some gaps (missing {len(missing_skills)} skills)."
    elif final_percentage >= 40:
        explanation = "Moderate match. The candidate meets some requirements but might need training or additional onboarding in core technologies."
    else:
        explanation = "Low match. The candidate's background does not align well with the technical stack of this vacancy."

    return {
        "score": final_percentage,
        "matched_skills": matched_skills_formatted,
        "missing_skills": missing_skills_formatted,
        "explanation": explanation
    }
