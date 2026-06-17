from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from processor import process_resume_logic
from groq import Groq
import io
import os
import jwt
from datetime import datetime, timedelta
import hashlib 

from pymongo import MongoClient
from pdfminer.high_level import extract_text

app = FastAPI(title="TalentPulse AI Enterprise Suite")

# 1. CORS Rules Setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],     
)

# 2. MongoDB & Encryption Tooling Setup
# Local MongoDB connection pipeline
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
db_client = MongoClient(MONGO_URI)
db = db_client["resume_matcher_db"]


SECRET_KEY = "NEURAL_MATRIX_SECRET_KEY_GUARD"
ALGORITHM = "HS256"

# Pure inbuilt secure password hashing implementation
def get_password_hash(password: str):
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(plain_password: str, hashed_password: str):
    return hashlib.sha256(plain_password.encode()).hexdigest() == hashed_password

# 3. Dynamic Authentication Endpoints
@app.post("/auth/signup")
async def signup(username: str = Form(...), password: str = Form(...)):
    if db.users.find_one({"username": username}):
        raise HTTPException(status_code=400, detail="User already registered in database.")
    
    user_document = {
        "username": username,
        "password": get_password_hash(password),
        "created_at": datetime.utcnow()
    }
    db.users.insert_one(user_document)
    return {"status": "success", "message": "User registry initialized."}

@app.post("/auth/login")
async def login(username: str = Form(...), password: str = Form(...)):
    user = db.users.find_one({"username": username})
    if not user or not verify_password(password, user["password"]):
        raise HTTPException(status_code=400, detail="Invalid credential parameters.")
    
    token_expiry = datetime.utcnow() + timedelta(hours=24)
    token_payload = {"sub": str(user["_id"]), "exp": token_expiry}
    encoded_jwt = jwt.encode(token_payload, SECRET_KEY, algorithm=ALGORITHM)
    
    return {"status": "success", "access_token": encoded_jwt, "username": username}

# 4. Core Core Analytics Endpoint (Now saving history to Mongo!)
@app.post("/analyze")
async def analyze_resume(
    job_description: str = Form(...), 
    resume_file: UploadFile = File(...),
    username: str = Form("anonymous")
):
    try:
        contents = await resume_file.read()
        result = process_resume_logic(contents, job_description)
        
        # Save record parameters dynamically to user document logs collections
        history_log = {
            "username": username,
            "timestamp": datetime.utcnow(),
            "job_summary": job_description[:100] + "...",
            "score": result.get("match_percentage", 0),
            "full_analytics": result
        }
        db.history.insert_one(history_log)
        
        return {"status": "success", "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Keep your existing cover letter and interview endpoints below this line...
@app.post("/generate-cover-letter")
async def generate_cover_letter(job_description: str = Form(...), resume_file: UploadFile = File(...)):
    try:
        contents = await resume_file.read()
        resume_text = extract_text(io.BytesIO(contents))
        client = Groq(api_key=os.getenv("GROQ_API_KEY"))
        prompt = f"Write a professional cover letter.\nResume:\n{resume_text}\nJD:\n{job_description}"
        chat_completion = client.chat.completions.create(messages=[{"role": "user", "content": prompt}], model="llama-3.3-70b-versatile")
        return {"status": "success", "cover_letter": chat_completion.choices[0].message.content}
    except Exception as e: raise HTTPException(status_code=500, detail=str(e))

@app.post("/generate-interview-prep")
async def generate_interview_prep(job_description: str = Form(...)):
    try:
        client = Groq(api_key=os.getenv("GROQ_API_KEY"))
        prompt = f"Generate 5 hardest technical questions and ideal answers for this JD:\n{job_description}"
        chat_completion = client.chat.completions.create(messages=[{"role": "user", "content": prompt}], model="llama-3.3-70b-versatile")
        return {"status": "success", "interview_prep": chat_completion.choices[0].message.content}
    except Exception as e: raise HTTPException(status_code=500, detail=str(e))
