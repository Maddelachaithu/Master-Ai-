# MASTER AI — 5–10 Minute Live Demonstration & Presentation Script

**Project**: MASTER AI  
**Subtitle**: Autonomous AI Interview & Debate Platform  
**Target Audience**: College Evaluators, Project Review Committee, Viva Panel, Tech Recruiters  

---

## 🎬 30-Second Elevator Pitch
> *"Good morning, esteemed panel. We are proud to present **MASTER AI: Autonomous AI Interview & Debate Platform**. Most existing AI interview tools are simple prompt chatbots or static questionnaire scripts. MASTER AI is an autonomous, multimodal, multi-agent AI sparring partner. It observes your facial delivery and posture via computer vision, transcribes your spoken answers using faster-whisper, fact-checks your technical claims against MITRE ATT&CK and NIST standards through RAG, and coordinates adversarial agents to challenge your reasoning in real time."*

---

## ⏱️ Demonstration Timeline (8-Minute Plan)

| Time | Phase | Focus |
| :--- | :--- | :--- |
| **00:00 – 01:00** | **Landing & Identity** | Commercial UI/UX, product identity, architecture overview |
| **01:00 – 02:00** | **Profile & Resume RAG** | Resume parsing, skill-gap engine, target role alignment |
| **02:00 – 03:00** | **Pre-Flight System Check** | Camera, Mic, Whisper, ChromaDB, and Database probes |
| **03:00 – 05:30** | **Live Autonomous Interview** | Speech capture, Whisper STT, Multi-Agent Challenger & Fact-Checker |
| **05:30 – 06:45** | **Performance Report & RAG** | Objective 5-dimension rubric, score explanation, grounded evidence |
| **06:45 – 07:30** | **Analytics & Longitudinal Tracking** | Skill heatmap, speaking pace, historical progress |
| **07:30 – 08:00** | **Demo Mode & Q&A Conclusion** | Deterministic demo isolation, security hardening, conclusion |

---

## 📋 Step-by-Step Demonstration Walkthrough

### Phase 1: Landing Page & Dashboard (00:00 – 01:00)
1. **Action**: Open `http://localhost:5173`. Show the Landing Page with dark glassmorphism design.
2. **What to Say**:
   > *"Here is the MASTER AI application shell. Notice the dark obsidian design tokens, responsive typography, and clear status indicators. We have unified modules for Live Interview, Candidate Profile, Adversary Debate Arena, Performance Analytics, and Knowledge Base."*
3. **What to Click**: Click **"Go to Dashboard →"**. Point out the **Interview Readiness Index** (calculated from past scores) and the **Quick Start Card**.

---

### Phase 2: Candidate Profile & Resume Parsing (01:00 – 02:00)
1. **What to Click**: Navigate to **Candidate Profile** in the sidebar.
2. **Action**: Point to the parsed resume competencies (SIEM, Threat Hunting, MITRE ATT&CK, Linux Forensics).
3. **What to Say**:
   > *"MASTER AI ingests candidate resumes, extracts core competencies using regex and NLP parsers, and maps them against the Target Role taxonomy. The Skill-Gap Engine identifies areas requiring practice and informs the Interviewer Agent's question strategy."*

---

### Phase 3: Pre-Interview Diagnostic & System Check (02:00 – 03:00)
1. **What to Click**: Navigate to **Live Interview** and click **"Start Session"**.
2. **Action**: The **Pre-Interview System Check Modal** opens.
3. **What to Show**:
   - `✓ Camera & Video Stream` (Webcam initialized)
   - `✓ Microphone & Audio Stream` (Audio stream ready)
   - `✓ Whisper STT Engine` (faster-whisper int8 model ready)
   - `✓ RAG & ChromaDB Knowledge Base` (Vector store ready)
   - `✓ MediaPipe Vision Tracking` (Edge vision pipeline online)
   - `✓ Database Persistence` (SQLite/PostgreSQL persistence connected)
4. **What to Say**:
   > *"Before entering the high-pressure cockpit, MASTER AI runs a comprehensive hardware and backend diagnostic, ensuring audio, vision, and vector databases are synchronized."*
5. **What to Click**: Click **"Enter Interview Cockpit"**.

---

### Phase 4: Live Multimodal Interview Cockpit (03:00 – 05:30)
1. **What to Show**:
   - **Candidate Camera Panel**: Live HD preview, head-pose tracking reticle (`FACE LOCK`), camera engagement percentage, and spine posture status.
   - **AI Avatar Orb**: Reactive dynamic avatar reflecting AI states (`SPEAKING`, `LISTENING`, `RECORDING`, `TRANSCRIBING`, `EVALUATING`, `CHALLENGING`).
   - **Autonomous Question 1**: Generated dynamically and spoken aloud via Browser SpeechSynthesis TTS.
2. **Action**: Click **"Start Answer"** (Push-to-Talk).
3. **Speak into the Microphone**:
   > *"To investigate suspicious authentication, I would query the SIEM for Event ID 4625 failed logons followed by Event ID 4624 Type 3 network logons, checking source IP addresses and anomalous off-hours timing."*
4. **Point to the Screen**:
   - Live streaming speech appears in real-time in the transcript.
   - Audio waveform bars react to microphone volume.
5. **Action**: Click **"Finish Answer & Transcribe"**.
6. **What to Point Out**:
   - `● Whisper STT Processing`: `faster-whisper` transcribes audio with 100% precision.
   - `● Multi-Agent Orchestrator`:
     - **Fact Checker**: Extracts `Event ID 4624` & `4625` and tags them as `✓ Supported` with green highlight.
     - **Challenger Agent**: Detects high mastery and issues a Socratic counter-probe: *"What if the attacker bypassed domain controller logs using Pass-the-Hash?"*
     - **Question Counter**: Seamlessly updates to **Question 02 / 10**.

---

### Phase 5: RAG Grounded Evidence Inspection (05:30 – 06:15)
1. **What to Click**: Click the **"Evidence"** button in the header or active claim badge.
2. **What to Show**:
   - Document Name: `Active Directory Security & Windows Event Log Guide`
   - Retrieved Excerpt from ChromaDB: `Event ID 4624 Type 3 logon telemetry correlation...`
   - Similarity Confidence: `96%`
3. **What to Say**:
   > *"Every technical evaluation is grounded in our ChromaDB vector database. The system never relies on ungrounded hallucinations for technical scoring."*

---

### Phase 6: Performance Report & Longitudinal Analytics (06:15 – 07:30)
1. **Action**: Click **"End Interview"** → Confirm.
2. **What to Show on the Performance Report**:
   - **Overall Score & Grade** (e.g. `86% • A`)
   - **Explainable Scores**: Knowledge (`88%`), Reasoning (`84%`), Communication (`82%`), Presentation (`88%`).
   - **Observable Presentation Metrics**: Forward eye-engagement (`88%`), posture consistency (`92%`), speaking rate (`136 WPM`).
   - **Export Capabilities**: 1-click **"Export JSON"** and **"Print / PDF Report"**.
3. **What to Click**: Navigate to **Analytics** in the sidebar. Show the **Skill Mastery Heatmap** and **Progress Trends** over time.

---

### Phase 7: Demo Mode & Isolation Showcase (07:30 – 08:00)
1. **What to Show**: Click **"⚡ Try Demo"** from the top navbar.
2. **What to Say**:
   > *"For offline venues without microphone or webcam hardware, MASTER AI features a deterministic Demo Mode (SOC Analyst Cybersecurity Interview) with pre-computed agent timelines and simulated STT. Crucially, demo runs are stamped `is_demo = true` and strictly isolated from candidate database records."*

---

## 🎯 Key Differentiators to Emphasize to Evaluators

1. **Multimodal Edge Perception**: Real-time camera engagement & posture analysis with zero raw video retention.
2. **Autonomous Multi-Agent Architecture**: Decoupled Interviewer, Challenger, Fact Checker, and Rubric Synthesizer.
3. **Grounded RAG Engine**: ChromaDB vector store with sentence-transformers for verified technical grading.
4. **Security Hardening**: Defensive containment against prompt injection, sanitized file uploads, and path traversal protection.
5. **Production Quality**: 30/30 automated tests passing, 0 TypeScript build errors, and responsive dark glassmorphism SaaS UI.
