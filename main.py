from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from processor import process_resume_logic
from groq import Groq
import io
import os
from pdfminer.high_level import extract_text

app = FastAPI(title="Advanced AI Resume API Suite")

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],     
)

@app.get("/")
def home():
    return {"message": "AI Resume Matcher API is Running!"}

@app.post("/analyze")
async def analyze_resume(job_description: str = Form(...), resume_file: UploadFile = File(...)):
    try:
        contents = await resume_file.read()
        result = process_resume_logic(contents, job_description)
        return {"status": "success", "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# <--- ADVANCED FEATURE 1: COVER LETTER GENERATOR --->
@app.post("/generate-cover-letter")
async def generate_cover_letter(job_description: str = Form(...), resume_file: UploadFile = File(...)):
    try:
        contents = await resume_file.read()
        resume_text = extract_text(io.BytesIO(contents))
        
        client = Groq(api_key=os.getenv("GROQ_API_KEY"))
        prompt = f"""
        You are an expert career coach. Write a highly professional, compelling, and tailored Cover Letter 
        for a candidate based on their Resume and the Target Job Description.
        
        Candidate Resume text:
        {resume_text}
        
        Target Job Description:
        {job_description}
        
        Guidelines:
        - Keep it under 300 words.
        - Structure it properly with placeholders like [Your Name], [Company Name], etc.
        - Highlight the overlapping strengths from the resume that fit the job perfectly.
        - Do not add any conversational filler, just give the cover letter content directly.
        """
        
        chat_completion = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="llama-3.3-70b-versatile",
            temperature=0.7
        )
        
        letter = chat_completion.choices[0].message.content
        return {"status": "success", "cover_letter": letter}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# <--- ADVANCED FEATURE 2: MOCK INTERVIEW PREP ROOM --->
@app.post("/generate-interview-prep")
async def generate_interview_prep(job_description: str = Form(...)):
    try:
        client = Groq(api_key=os.getenv("GROQ_API_KEY"))
        prompt = f"""
        You are an elite technical interviewer. Based on the target Job Description below, 
        generate exactly 5 of the hardest technical or situational interview questions that a candidate will face.
        For each question, provide a detailed, high-scoring ideal model answer.
        
        Job Description:
        {job_description}
        
        Format your response ONLY as a strict, clean string. Do not include markdown fillers like conversational text.
        Use clear headers like "Question 1:" and "Ideal Answer:" for each point.
        """
        
        chat_completion = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="llama-3.3-70b-versatile",
            temperature=0.5
        )
        return {"status": "success", "interview_prep": chat_completion.choices[0].message.content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
