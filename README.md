# MASTER AI

> **Autonomous AI Interview & Debate Platform**  
> *Multimodal AI sparring partner for high-pressure technical interviews, adversarial debates, and objective rubric evaluations.*

---

## 🚀 Overview

**MASTER AI** is an autonomous, multimodal, multi-agent AI sparring partner designed for high-pressure technical interviews and debates. Unlike static chatbots or fixed question lists, MASTER AI is architected as an **adaptive adversarial system** that:

1. **Listens and Transcribes** candidate verbal answers in real time using quantized `faster-whisper` speech-to-text with Voice Activity Detection (VAD) fallback.
2. **Observes Delivery & Cadence** through client-side computer vision (MediaPipe Face & Pose Landmarkers) for neutral camera engagement, posture consistency, and speaking rate analysis—with **zero raw video retention**.
3. **Coordinates a Multi-Agent Advisory Core** (Interviewer, Challenger, Fact Checker, Rubric Synthesizer) orchestrated by an autonomous state machine.
4. **Grounds Evaluations with RAG** using ChromaDB vector database and `sentence-transformers/all-MiniLM-L6-v2` embeddings to fact-check technical claims against MITRE ATT&CK, NIST, and RFC standards.
5. **Tracks Longitudinal Mastery** across candidate skill graphs with PostgreSQL / SQLite relational persistence.
6. **Features an Isolated Demo Engine** for offline, zero-dependency demonstrations.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend Framework** | React 18, TypeScript, Vite |
| **Styling & Design System** | Tailwind CSS (Dark Glassmorphism SaaS palette, Cyan/Indigo glows) |
| **Computer Vision** | MediaPipe Tasks Vision (Face Landmarker, Pose Landmarker, Edge Canvas pipeline) |
| **Audio Processing** | Web Audio API, `MediaRecorder`, Web Speech API real-time fallback |
| **Speech Synthesis** | Browser SpeechSynthesis API (TTS with pitch/rate tuning) |
| **Backend Framework** | FastAPI (Python 3.11+ / 3.13+), AsyncIO, Uvicorn |
| **Speech-to-Text (STT)** | `faster-whisper` (CTranslate2 int8 quantized models) |
| **Vector DB & RAG** | ChromaDB, HuggingFace `sentence-transformers/all-MiniLM-L6-v2` |
| **Database & ORM** | SQLite / PostgreSQL, SQLAlchemy |
| **Testing** | Pytest, FastAPI TestClient, Vite TypeScript Build |

---

## 🏛️ System Architecture

```
[Candidate Webcam & Mic] ──► [React 18 Cockpit] ──► [MediaRecorder / MediaPipe Vision]
                                     │
                        (Audio WebM / Telemetry)
                                     ▼
                        [FastAPI Backend Gateway]
                                     │
           ┌─────────────────────────┼─────────────────────────┐
           ▼                         ▼                         ▼
   [faster-whisper STT]   [Multi-Agent Orchestrator]   [ChromaDB Vector RAG]
           │                         │                         │
           ▼                         ▼                         ▼
  (Transcribed Text)      (Interviewer / Challenger)   (NIST / MITRE Grounding)
                          (Fact Checker / Rubric)
                                     │
                                     ▼
                        [SQLite / PostgreSQL DB]
                                     │
                                     ▼
                    [Performance Report & Analytics]
```

---

## 🤖 Multi-Agent Advisory Topology

- **Interviewer Agent**: Selects role-aligned Socratic questions tailored to the candidate's target job and skill gap matrix.
- **Challenger Agent**: Performs adversarial reasoning, detects logical contradictions against earlier turns, and issues high-pressure counter-probes.
- **Fact Checker Agent**: Extracts technical claims (e.g. event IDs, cipher suites, protocol headers) and validates them against indexed technical authorities.
- **Rubric Synthesizer**: Independently scores five observable dimensions:
  - **Knowledge Correctness** (40%)
  - **Reasoning Depth & Logic** (25%)
  - **Communication Clarity** (15%)
  - **Adaptability to Probes** (10%)
  - **Presentation & Cadence** (10%)

---

## 🔒 Security & Privacy Guarantees

1. **Zero Raw Video Stored**: No video frames or images are ever stored on disk or transmitted over the network.
2. **Prompt Injection Defense**: Untrusted candidate input, uploaded resume text, and retrieved RAG chunks are enclosed in secure boundary blocks (`<candidate_untrusted_input>`, `<retrieved_evidence>`).
3. **Path Traversal Defense**: Filename sanitization strips null bytes, `/`, `\`, and `../` sequences.
4. **File Upload Limits**: Enforces 10MB limit and MIME validation (`.pdf`, `.txt`, `.md`), rejecting executables (`.exe`, `.sh`, `.bat`).
5. **Sanitized Logging**: Zero leakage of API keys, tokens, or personal identifiers in server logs.

---

## 📁 Repository Structure

```
master-ai/
├── backend/                         # FastAPI backend application
│   ├── app/
│   │   ├── agents/                  # Multi-Agent advisory system
│   │   │   ├── challenger.py        # Socratic counter-probes & contradiction detector
│   │   │   ├── fact_checker.py      # Technical claim extraction & verification
│   │   │   ├── interviewer.py       # Role-aligned adaptive question generation
│   │   │   ├── orchestrator.py      # Multi-Agent turn coordinator
│   │   │   └── rubric_synthesizer.py# 5-dimension objective grading engine
│   │   ├── rag/                     # Retrieval-Augmented Generation
│   │   │   ├── chunker.py           # Semantic document chunking
│   │   │   ├── embeddings.py        # all-MiniLM-L6-v2 dense embeddings
│   │   │   ├── rag_pipeline.py      # Context grounding & citation extractor
│   │   │   └── vector_store.py      # ChromaDB persistent collection
│   │   ├── routes/                  # REST API endpoints
│   │   │   ├── demo.py              # Isolated demo mode endpoints
│   │   │   ├── interview.py         # Session orchestration & answer submission
│   │   │   ├── profile.py           # Resume upload & skill-gap analysis
│   │   │   └── speech.py            # faster-whisper transcription
│   │   ├── services/                # Core business logic services
│   │   └── utils/security.py        # Prompt injection & upload sanitization
│   ├── tests/                       # 30 automated Pytest unit/integration tests
│   └── requirements.txt             # Python dependencies
├── docs/                            # Production documentation
│   ├── ARCHITECTURE.md              # Detailed technical specification & Mermaid diagrams
│   ├── VIVA.md                      # 35+ Viva & technical interview Q&A guide
│   └── DEMO_SCRIPT.md               # 5-10 minute live presentation & demo script
├── src/                             # React 18 + TypeScript frontend
│   ├── components/
│   │   ├── common/                  # Reusable UI primitives (ErrorBoundary, OfflineBanner)
│   │   ├── dashboard/               # Readiness index, quick start, skill heatmap
│   │   ├── interview/               # Live cockpit, camera panel, AI avatar orb, transcript
│   │   └── onboarding/              # 6-step first-run onboarding wizard
│   ├── context/                     # SessionContext, AuthContext, SettingsContext
│   ├── hooks/                       # useCamera hook (real MediaStream lifecycle)
│   ├── pages/                       # Cockpit, Profile, Analytics, Debate, Reports
│   └── services/                    # apiClient, speechService, visionService, demoApi
├── package.json
└── tailwind.config.js
```

---

## ⚡ Quick Start & Installation

### 1. Prerequisites
- **Node.js**: v18.0 or higher
- **Python**: v3.11 or higher
- **Modern Browser**: Google Chrome, Microsoft Edge, Firefox, or Safari

### 2. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Create and activate Python virtual environment
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

# Start FastAPI backend daemon
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### 3. Frontend Setup
```bash
# Open a new terminal in the project root
npm install

# Start Vite dev server
npm run dev
```
Open **`http://localhost:5173`** in your browser.

---

## 🧪 Automated Testing

### Backend Test Suite (30/30 Passing)
```bash
cd backend
python -m pytest tests -v
```

### Frontend Production Build
```bash
npm run build
```

---

## 📖 Additional Documentation

- **[System Architecture & Diagrams](file:///c:/Users/CHAITANYA/Documents/Master%20Ai/docs/ARCHITECTURE.md)** — In-depth architectural breakdown and sequence diagrams.
- **[Viva & Technical Interview Guide](file:///c:/Users/CHAITANYA/Documents/Master%20Ai/docs/VIVA.md)** — 35+ questions and comprehensive answers for project viva and technical defense.
- **[Live Demonstration Script](file:///c:/Users/CHAITANYA/Documents/Master%20Ai/docs/DEMO_SCRIPT.md)** — Step-by-step 5–10 minute demonstration walkthrough.
