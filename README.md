# InterviewAce 🎯

AI-powered interview preparation — built with Claude Opus 4.6.

## Features

| Feature | Description |
|---|---|
| **Role Analysis** | Paste a job description + hiring manager context → Claude generates competency map, culture signals, and tailored questions |
| **Question Generation** | AI-generated questions across 6 categories: Behavioral, Technical, Situational, Culture Fit, Leadership, Role-Specific |
| **Answer Grading** | Type or record your answer → scored on a 5-dimension rubric with detailed feedback |
| **STAR Formatter** | Paste any rough story → Claude structures it into polished Situation/Task/Action/Result format with a 30-second version |
| **Voice Recording** | Speak your answer → real-time browser transcription → Claude cleans it up and removes filler words |
| **Question Bank** | 60+ curated questions across 7 categories with coaching tips |

## Quick Start

### 1. Set your API key

```bash
cp backend/.env.example backend/.env
# Edit backend/.env and set ANTHROPIC_API_KEY=sk-ant-...
```

### 2. Run the app

```bash
./start.sh
```

Open **http://localhost:5173** in your browser.

> The script auto-installs Python and npm dependencies on first run.

---

## Manual Setup

### Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## How to Use

### Step 1 — Role Setup
Paste the job description and any hiring manager context (LinkedIn About section, recent posts, notes from mutual connections). The more context you give, the more tailored the questions.

### Step 2 — Questions Dashboard
Review AI-generated questions with:
- Why the interviewer is asking each question
- Key points to cover in your answer
- Difficulty rating

Click **Practice This Question** to jump directly into practice mode.

### Step 3 — Practice Mode
- **Type your answer** in the text box, or
- **Record your answer** verbally using the microphone (Chrome recommended)

After submitting, you'll receive a detailed scorecard with:
- Score across 5 dimensions (clarity, relevance, STAR format, specificity, impact)
- Strengths and improvement areas
- Quick wins you can apply immediately
- Outline of an ideal answer

### Step 4 — STAR Stories
Polish your behavioral stories:
1. Paste your rough story or notes
2. Optionally specify which question it answers
3. Get back a full STAR-structured answer + a 30-second version

### Step 5 — Question Bank
Browse 60+ curated questions with coaching tips. Click any question to open it in Practice Mode.

---

## Architecture

```
interview-prep/
├── backend/
│   ├── main.py          # FastAPI app with 5 AI endpoints
│   └── requirements.txt
└── frontend/
    └── src/
        ├── App.jsx
        ├── api.js                    # API client
        └── components/
            ├── RoleSetup.jsx         # Job context input
            ├── QuestionDashboard.jsx # AI-generated questions
            ├── PracticeMode.jsx      # Answer + grading
            ├── StarFormatter.jsx     # STAR story structuring
            ├── VoiceRecorder.jsx     # Browser speech-to-text
            ├── QuestionBank.jsx      # Curated question library
            └── ScoreCard.jsx         # Rubric display
```

## Voice Recording

Voice recording uses the browser's built-in **Web Speech API** — no audio files are uploaded. The transcription happens locally in real time. After you stop recording, Claude cleans up the text (removes filler words, fixes grammar) and optionally grades the answer.

**Browser support:** Chrome / Edge work best. Firefox has limited support.
