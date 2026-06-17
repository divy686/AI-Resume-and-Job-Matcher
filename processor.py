import io
import json  # <--- JSON parsing ke liye add kiya
from pdfminer.high_level import extract_text
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
from groq import Groq
import os
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("GROQ_API_KEY")

print("Loading Embedding Model...")
ats_model = SentenceTransformer('sentence-transformers/all-mpnet-base-v2')

def process_resume_logic(resume_bytes, job_desc):
    try:
        resume_text = extract_text(io.BytesIO(resume_bytes))
        if not resume_text.strip():
            return {"error": "Resume se text nahi nikal paya. PDF check karein."}
    except Exception as e:
        return {"error": f"Parsing failed: {str(e)}"}

    # 1. Semantic Similarity Score
    embeddings1 = ats_model.encode([resume_text])
    embeddings2 = ats_model.encode([job_desc])
    similarity_score = float(cosine_similarity(embeddings1, embeddings2)[0][0])

    # 2. LLM Analysis (Groq) with JSON Schema
    try:
        client = Groq(api_key=api_key)
        
        # Prompt ko update kiya taaki AI humein proper format de
        prompt = f"""
        You are an expert ATS and Technical Recruiter. 
        Analyze the candidate's resume against the Job Description.
        
        Candidate Resume: {resume_text}
        Job Description: {job_desc}
        
        You MUST respond ONLY with a valid JSON object matching this structure. Do not include markdown blocks like ```json.
        {{
            "match_percentage": {round(similarity_score * 100, 2)},
            "found_skills": ["skill1", "skill2"],
            "missing_skills": ["skill1", "skill2"],
            "experience_feedback": "Write a short paragraph evaluating their experience level.",
            "suggestions": ["specific tip 1", "specific tip 2", "specific tip 3"]
        }}
        """
        
        chat_completion = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="llama-3.3-70b-versatile",
            temperature=0.1  # Low temperature se AI exact format follow karega
        )
        
        # Raw response nikalna aur string se JSON object mein convert karna
        raw_output = chat_completion.choices[0].message.content.strip()
        report_json = json.loads(raw_output)
        return report_json
        
    except Exception as e:
        # Fallback agar AI JSON format kharab kar de
        return {
            "match_percentage": round(similarity_score * 100, 2),
            "found_skills": ["Error extracting"],
            "missing_skills": ["Error extracting"],
            "experience_feedback": "Could not parse AI response structure.",
            "suggestions": [f"System Exception: {str(e)}"]
        }
