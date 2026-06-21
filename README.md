# AI Resume and Job Matcher 🚀
> An advanced, production-grade full-stack AI SaaS suite featuring secure user authentication, local MongoDB telemetry persistence tracking, and vector-based semantic profile matching.

---

##  Screenshots Workspace

###  Centralized Analytics & Compatibility Matrix
![Dashboard Core Analytics](./Images/dashboard_metrics.png)

###  Automated Document Synthesis & Simulation Labs
![AI Advanced Workspaces](./Images/ai_workspaces.png)

---

##  Core Architecture & Features
Unlike primitive standalone scripts, this application runs on an enterprise-grade **decoupled client-server architecture**:

- **Secure Identity Gateways**: Implements a dedicated user authentication layer (**Signup and Login loops**) backed by safe client-side `localStorage` token trackers.
- **Cryptographic Cipher Hashing**: Uses secure Python database verification systems to convert text credentials into irreversible SHA-256 secure hashes before repository insertion.
- **Persistent Storage Telemetry**: Integrated directly with a local **MongoDB Database Server** instance to capture historical telemetry data pipelines, saving past user metrics data sheets automatically.
- **Semantic Vector Match Engine**: Computes high-dimensional vector embeddings using Deep Learning (`all-mpnet-base-v2`) to determine accurate **Cosine Similarity** context matches.
- **Multi-Agent System Workflows**: Generates customized secondary assets dynamically, featuring an automated **Contextual Cover Letter Synthesizer** and an adaptive **Technical Interview Sandbox**.

---

##  Tech Stack Matrix

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend Client** | React.js, Vite, TypeScript, Tailwind CSS, Lucide Icons |
| **Backend Server** | FastAPI (Python), Asyncio, Uvicorn Architecture |
| **Database Engine** | MongoDB Community Server (Local Document Storage Collections) |
| **AI / Machine Learning** | Sentence-Transformers (BERT), Groq API Engine (Llama 3.3 70B Model) |
| **Data Parsing Core** | PDFMiner Infrastructure Frameworks |

---

##  Project Repository Structure
```text
AI-Resume-and-Job-Matcher/
├── main.py              # FastAPI server routes, database configurations & auth endpoint metrics
├── processor.py         # Sentence embedding vector loops, Groq integrations & parsing logic
├── requirements.py      # Core backend python dependencies manifest list
├── .env                 # Local security credential keys setup (Hidden)
└── frontend-react/      # Pure React + Vite playground
    ├── src/
    │   ├── App.tsx       # Unified authenticated React application UI workspace layout
    │   ├── main.tsx      # Application framework window entry point
    │   └── index.css     # Tailwind custom directive utility rules
    ├── index.html        # Client mount layout shell with Tailwind runtime injection
    └── package.json      # Node modules dependency control configuration
```

---

##  Setup & Local Installation Guide

### Prerequisites
- Python 3.10+
- MongoDB Installed and Running background service locally on Windows
- Node.js v18+ & npm
- A Groq API Key (Get it from [Groq Console](https://groq.com))

### 1. Clone the Workspace
```bash
git clone https://github.com/divy686/AI-Resume-and-Job-Matcher.git
cd AI-Resume-and-Job-Matcher
```

### 2. Configure Backend Engine
Create a local `.env` file in the root directory:
```env
GROQ_API_KEY=your_actual_groq_api_key_here
MONGO_URI=mongodb://localhost:27017
```
Install required Python libraries (including new database tools):
```bash
pip install fastapi uvicorn groq sentence-transformers sklearn pdfminer.high_level python-dotenv pymongo pyjwt passlib[bcrypt] python-multipart
```
Boot up the local API Microservice:
```bash
python main.py
```
*The server will initialize the BERT embedding matrix, establish stable handshakes with your local MongoDB, and begin listening dynamically on `http://localhost:8000`*

### 3. Configure Frontend Workbench
Open a secondary independent terminal window:
```bash
cd frontend-react
npm install
```
Boot up the hot-reloading React client playground:
```bash
npm run dev
```
Open **`http://localhost:5173`** in your browser to interface with the authenticated application portal! 

---

##  Licence Matrix
Distributed under the MIT License. See `LICENSE` for more structural parameter details.
