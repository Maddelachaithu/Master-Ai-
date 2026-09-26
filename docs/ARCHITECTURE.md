# MASTER AI — System Architecture & Technical Specification

**Project**: MASTER AI  
**Subtitle**: Autonomous AI Interview & Debate Platform  
**Architecture Version**: 2.0 (Stages 1–6 Production Architecture)  

---

## 1. High-Level Architectural Overview

MASTER AI is an autonomous, multimodal, multi-agent platform designed for high-pressure technical interviews, adversarial debates, and objective rubric evaluations. The system operates on a decoupled client-server architecture:

- **Frontend Client**: React 18 + TypeScript + Vite, featuring a dark glassmorphism SaaS cockpit, real-time Web Audio API & MediaRecorder pipelines, MediaPipe computer vision tracking, browser TTS speech synthesis, and live state visualization.
- **Backend Server**: FastAPI (Python 3.11+ / 3.13+), orchestrating faster-whisper speech-to-text inference, multi-agent adversarial evaluation (Interviewer, Challenger, Fact Checker, Rubric Synthesizer), semantic RAG grounding via ChromaDB & HuggingFace sentence transformers, candidate resume parsing, and relational persistence.

```mermaid
graph TD
    subgraph Client ["Client Browser (React 18 + TypeScript)"]
        UI[Glassmorphism UI Cockpit]
        Cam[Real Browser Webcam]
        Mic[Real Browser Microphone]
        MP[MediaPipe Face & Pose Vision Engine]
        MR[MediaRecorder Audio Buffer]
        TTS[Browser SpeechSynthesis TTS]
    end

    subgraph Backend ["Backend Gateway (FastAPI + AsyncIO)"]
        API[FastAPI Router & API Gateway]
        STT[faster-whisper STT Service]
        Orch[Multi-Agent Orchestrator]
    end

    subgraph Agents ["Multi-Agent Advisory Core"]
        IA[Interviewer Agent]
        CA[Challenger Agent]
        FC[Fact Checker Agent]
        RS[Rubric Synthesizer]
    end

    subgraph RAGCore ["Grounded Knowledge Base (RAG)"]
        Chroma[(ChromaDB Vector Store)]
        Embed[all-MiniLM-L6-v2 Embeddings]
        Docs[Technical Standard Docs]
    end

    subgraph Storage ["Persistence Layer"]
        DB[(SQLite / PostgreSQL DB)]
        Resume[Resume & Candidate Parser]
    end

    Mic -->|Audio Chunks| MR
    MR -->|Audio WebM Blob| STT
    STT -->|Transcribed Text| API
    Cam -->|Video Frames| MP
    MP -->|1Hz Observability Telemetry| API
    API --> Orch

    Orch --> IA
    Orch --> CA
    Orch --> FC
    Orch --> RS

    FC -->|Semantic Query| Chroma
    IA -->|Grounding Context| Chroma
    Docs --> Embed --> Chroma

    RS -->|Structured Rubric| DB
    Resume -->|Extracted Profile & Skills| DB
    DB -->|Longitudinal Analytics| UI
    Orch -->|Next Adaptive Question| UI
    UI --> TTS
```

---

## 2. Autonomous Interview Turn Lifecycle

The interview operates as a deterministic, non-blocking asynchronous state machine ensuring synchronized speech, vision capture, evaluation, and question progression.

```mermaid
sequenceDiagram
    autonumber
    actor Candidate
    participant Cockpit as Frontend Cockpit
    participant Speech as Speech & Audio Engine
    participant Gateway as FastAPI Backend
    participant Whisper as faster-whisper STT
    participant Orchestrator as Multi-Agent Orchestrator
    participant RAG as ChromaDB / RAG Engine
    participant Agents as Specialized Agents (Challenger / FactChecker / Rubric)
    participant DB as Relational Database

    Cockpit->>Gateway: POST /api/interview/session (Start Session)
    Gateway-->>Cockpit: Session initialized (Question 1)
    Cockpit->>Speech: TTS speak(Question 1)
    Speech-->>Candidate: Spoken Question Audio
    Speech-->>Cockpit: Speech complete -> State: WAITING_FOR_CANDIDATE

    Candidate->>Cockpit: Clicks "Start Answer"
    Cockpit->>Speech: MediaRecorder.start(100ms) + WebSpeech interim
    Candidate-->>Speech: Candidate speaks verbal answer
    Speech-->>Cockpit: Live interim words streamed to Transcript

    Candidate->>Cockpit: Clicks "Finish Answer & Transcribe"
    Cockpit->>Speech: stopRecording() -> Buffer flushed -> Blob created
    Cockpit->>Gateway: POST /api/speech/transcribe (Audio Blob)
    Gateway->>Whisper: transcribe_audio_file() with VAD fallback
    Whisper-->>Gateway: Authoritative Transcript Text
    Gateway-->>Cockpit: Return Transcript Text
    Cockpit->>Cockpit: Commit user answer to Transcript UI

    Cockpit->>Gateway: POST /api/interview/{id}/answer
    Gateway->>Orchestrator: process_turn(answer, vision_summary, topic)
    
    par Agent Orchestration
        Orchestrator->>RAG: Retrieve grounded context
        RAG-->>Orchestrator: Relevant document excerpts
        Orchestrator->>Agents: Fact Checker verifies claims
        Orchestrator->>Agents: Challenger detects contradictions
        Orchestrator->>Agents: Rubric Synthesizer scores 5 rubric dimensions
    end

    Orchestrator->>DB: Persist Turn & update Skill Mastery
    Orchestrator-->>Gateway: Return Evaluation + Fact Checks + Next Adaptive Question
    Gateway-->>Cockpit: AnswerSubmissionResponse
    
    Cockpit->>Cockpit: Question Counter increments (Question 02/10)
    Cockpit->>Cockpit: Render Fact Check tags & Challenger banner
    Cockpit->>Speech: TTS speak(Next Question)
    Speech-->>Candidate: Spoken Next Question
```

---

## 3. Finite State Machine (FSM)

The platform enforces a single authoritative interview state machine across the application:

```mermaid
stateDiagram-v2
    [*] --> READY
    READY --> ASKING : Session Started
    ASKING --> WAITING : TTS Question Speech Finished
    WAITING --> RECORDING : Candidate Clicks "Start Answer"
    RECORDING --> TRANSCRIBING : Candidate Clicks "Finish Answer"
    TRANSCRIBING --> EVALUATING : Valid Transcript Generated
    TRANSCRIBING --> WAITING : No Speech Detected (Retry)
    EVALUATING --> ASKING_NEXT : Orchestrator Selects Next Question
    EVALUATING --> COMPLETED : All Domains Completed / User Ends
    ASKING_NEXT --> WAITING : TTS Next Question Finished
    COMPLETED --> [*]
```

---

## 4. Multi-Agent Advisory Architecture

Rather than relying on a single monolith prompt, MASTER AI coordinates four decoupled specialized agents:

1. **Interviewer Agent**: Formulates domain-aligned Socratic questions tailored to the candidate's target role (e.g. SOC Analyst), resume skills, and active skill gaps.
2. **Challenger Agent**: Performs adversarial reasoning to probe assumptions, detect self-contradictions against earlier candidate statements, and generate targeted counter-questions.
3. **Fact Checker Agent**: Extracts technical claims (e.g., event codes, protocols, cipher suites, command syntaxes) and verifies them against indexed technical authorities (MITRE ATT&CK, NIST, RFCs).
4. **Rubric Synthesizer**: Independently scores five observable dimensions:
   - **Knowledge Correctness** (40%)
   - **Reasoning Depth & Logic** (25%)
   - **Communication Clarity** (15%)
   - **Adaptability to Probes** (10%)
   - **Multimodal Presentation & Cadence** (10%)

---

## 5. Multimodal Vision & Presentation Telemetry

1. **Zero Raw Video Retention**: No video frames or images are ever stored on disk or sent over the network.
2. **Edge Signal Processing**: MediaPipe Tasks Vision extracts observable geometrical landmarks inside the browser at ~8 FPS.
3. **Extracted Observables**:
   - Camera engagement index (0–100%)
   - Head orientation (Yaw, Pitch, Roll angles)
   - Posture alignment consistency (Upright, Slouching, Lateral Lean)
   - Lighting & Framing quality scores
4. **1Hz Bounded Telemetry Buffer**: Buffered locally and converted to a per-turn `AnswerVisionSummary` submitted asynchronously upon answer completion.

---

## 6. Security Hardening & Prompt Injection Defense

1. **Untrusted Data Boundaries**: Candidate answers, resume text, job descriptions, and retrieved RAG document chunks are treated as untrusted data and wrapped in boundary tags:
   - `<candidate_untrusted_input>`
   - `<retrieved_evidence>`
2. **Path Traversal Protection**: Uploaded filenames are sanitized through `sanitize_filename()` to strip `../`, null bytes, and non-whitelisted characters.
3. **File Upload Security**: Enforces `MAX_UPLOAD_MB=10` and MIME validation (`.pdf`, `.txt`, `.md`), rejecting executables (`.exe`, `.sh`, `.bat`).
4. **Sanitized Logging**: Strict log sanitization ensures no API keys, tokens, or candidate personal identifiers are ever written to stdout or logs.

---

## 7. Demo Mode Isolation Architecture

- **Deterministic Fixture**: SOC Analyst Cybersecurity scenario with 4 pre-computed turns containing realistic Whisper STT output, MediaPipe vision metrics, RAG evidence, fact-checks, challenger probes, and rubric scores.
- **Strict Data Isolation**: Demo sessions are explicitly marked `is_demo = true`. Demo evaluations bypass candidate PostgreSQL/SQLite tables and do not alter real candidate skill mastery or practice recommendations.
- **Demo Reset**: `POST /api/demo/reset` safely flushes demo caches without affecting real user records.
