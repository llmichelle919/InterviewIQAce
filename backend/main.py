import json
import os
import re
from typing import Optional

import anthropic
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

load_dotenv()

app = FastAPI(title="InterviewAce API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))


# ── Request Models ────────────────────────────────────────────────────────────

class RoleContext(BaseModel):
    job_description: str
    company_name: Optional[str] = ""
    hiring_manager_name: Optional[str] = ""
    hiring_manager_linkedin: Optional[str] = ""
    hiring_manager_notes: Optional[str] = ""
    previous_hires_notes: Optional[str] = ""


class AnalyzeRoleRequest(BaseModel):
    role_context: RoleContext


class GradeAnswerRequest(BaseModel):
    question: str
    answer: str
    question_type: str
    role_context: Optional[RoleContext] = None


class StarFormatRequest(BaseModel):
    story: str
    question: Optional[str] = ""


class ProcessVerbalRequest(BaseModel):
    transcript: str
    question: Optional[str] = ""


# ── Helpers ───────────────────────────────────────────────────────────────────

def build_role_context(ctx: RoleContext) -> str:
    parts = []
    if ctx.company_name:
        parts.append(f"Company: {ctx.company_name}")
    if ctx.job_description:
        parts.append(f"Job Description:\n{ctx.job_description}")
    if ctx.hiring_manager_name:
        parts.append(f"Hiring Manager: {ctx.hiring_manager_name}")
    if ctx.hiring_manager_linkedin:
        parts.append(f"Hiring Manager LinkedIn / Background:\n{ctx.hiring_manager_linkedin}")
    if ctx.hiring_manager_notes:
        parts.append(f"Additional Hiring Manager Notes:\n{ctx.hiring_manager_notes}")
    if ctx.previous_hires_notes:
        parts.append(f"Notes on Previous Hires in This Role:\n{ctx.previous_hires_notes}")
    return "\n\n".join(parts)


def extract_json(text: str) -> dict:
    """Extract JSON from Claude's response, handling markdown code fences."""
    match = re.search(r"```(?:json)?\n?(.*?)\n?```", text, re.DOTALL)
    if match:
        text = match.group(1)
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        start, end = text.find("{"), text.rfind("}") + 1
        if start != -1 and end > start:
            try:
                return json.loads(text[start:end])
            except json.JSONDecodeError:
                pass
    return {"error": "Could not parse JSON response", "raw": text}


def claude(system: str, user: str, max_tokens: int = 4096) -> dict:
    """Call Claude with adaptive thinking and extract JSON from response."""
    response = client.messages.create(
        model="claude-opus-4-6",
        max_tokens=max_tokens,
        thinking={"type": "adaptive"},
        system=system,
        messages=[{"role": "user", "content": user}],
    )
    # With adaptive thinking the last block is always the text response
    text = next(
        (b.text for b in reversed(response.content) if b.type == "text"), ""
    )
    return extract_json(text)


# ── Endpoints ─────────────────────────────────────────────────────────────────

@app.post("/api/analyze-role")
async def analyze_role(request: AnalyzeRoleRequest):
    """Analyze the role and generate tailored interview questions."""
    role_text = build_role_context(request.role_context)

    system = """You are an expert interview coach and talent strategist.

Analyze the role context and return a JSON object with this exact structure:
{
  "role_analysis": {
    "key_competencies": ["competency 1", "competency 2"],
    "culture_signals": ["signal 1", "signal 2"],
    "likely_themes": ["theme 1", "theme 2"],
    "red_flags_to_address": ["potential concern 1"]
  },
  "hiring_manager_insights": {
    "likely_priorities": ["priority 1", "priority 2"],
    "rapport_points": ["talking point 1"],
    "potential_concerns": ["concern 1"]
  },
  "questions": {
    "behavioral": [
      {"question": "...", "why_asked": "...", "key_points": ["point 1", "point 2"], "difficulty": "Medium"}
    ],
    "technical": [
      {"question": "...", "why_asked": "...", "key_points": ["point 1"], "difficulty": "Hard"}
    ],
    "situational": [
      {"question": "...", "why_asked": "...", "key_points": ["point 1"], "difficulty": "Medium"}
    ],
    "culture_fit": [
      {"question": "...", "why_asked": "...", "key_points": ["point 1"], "difficulty": "Easy"}
    ],
    "leadership": [
      {"question": "...", "why_asked": "...", "key_points": ["point 1"], "difficulty": "Hard"}
    ],
    "role_specific": [
      {"question": "...", "why_asked": "...", "key_points": ["point 1"], "difficulty": "Medium"}
    ]
  }
}

Generate 5-6 questions per category. Make them specific to the job description and hiring manager context.
Return ONLY the JSON object, no markdown wrapping."""

    return claude(system, f"Analyze this role and generate interview questions:\n\n{role_text}")


@app.post("/api/grade-answer")
async def grade_answer(request: GradeAnswerRequest):
    """Grade an interview answer using a detailed rubric."""
    role_section = ""
    if request.role_context:
        role_section = f"\n\nRole Context:\n{build_role_context(request.role_context)}"

    if request.question_type == "case_study":
        system = """You are a senior interviewer from a top-tier management consulting firm (McKinsey, BCG, or Bain).
Grade the candidate's case study response with the rigour of a real consulting interview.

Return ONLY a JSON object with this exact structure:
{
  "scores": {
    "problem_structuring": {"score": 8, "feedback": "..."},
    "hypothesis_driven": {"score": 7, "feedback": "..."},
    "analytical_rigor": {"score": 6, "feedback": "..."},
    "synthesis": {"score": 8, "feedback": "..."},
    "recommendation": {"score": 7, "feedback": "..."}
  },
  "overall_score": 7.2,
  "grade": "B+",
  "summary": "2-3 sentence overall assessment from a consulting perspective.",
  "strengths": ["Strength 1", "Strength 2"],
  "improvements": ["Improvement area 1", "Improvement area 2"],
  "quick_wins": ["Immediate coaching tip 1", "Immediate coaching tip 2"],
  "model_answer_outline": "How a strong candidate would structure and answer this case."
}

Scoring guide (each dimension 1–10):
- problem_structuring: Did they define the problem clearly and break it down MECE-ly with a logical issue tree?
- hypothesis_driven: Did they lead with a hypothesis / initial take, rather than just gathering data aimlessly?
- analytical_rigor: Did they identify the right data to request, show their calculations, and question assumptions?
- synthesis: Did they synthesise findings into crisp insights (not just list data points)?
- recommendation: Was the final recommendation clear, specific, actionable, and supported by the analysis?

Grade scale: 9-10=A (offer), 8-8.9=A- (strong pass), 7-7.9=B+ (pass), 6-6.9=B (borderline), 5-5.9=C (no offer), below 5=significant gaps.
Be direct and constructive — consulting interviewers are blunt but helpful."""

        user = f"""Grade this case study interview response:

Case: {request.question}

Candidate's response: {request.answer}{role_section}"""
    else:
        system = """You are an expert interview coach who grades answers objectively and constructively.

Return ONLY a JSON object with this exact structure:
{
  "scores": {
    "clarity_structure": {"score": 8, "feedback": "..."},
    "relevance": {"score": 7, "feedback": "..."},
    "star_format": {"score": 6, "feedback": "..."},
    "specificity": {"score": 8, "feedback": "..."},
    "impact": {"score": 7, "feedback": "..."}
  },
  "overall_score": 7.2,
  "grade": "B+",
  "summary": "2-3 sentence overall assessment.",
  "strengths": ["Strength 1", "Strength 2"],
  "improvements": ["Improvement area 1", "Improvement area 2"],
  "quick_wins": ["Immediate actionable tip 1", "Immediate actionable tip 2"],
  "model_answer_outline": "Brief outline of what an ideal answer would cover."
}

Scoring guide:
- clarity_structure: Is the answer clear and well-organized?
- relevance: Does it directly answer the question asked?
- star_format: (for behavioral) Does it follow Situation/Task/Action/Result?
- specificity: Does it use concrete examples and numbers?
- impact: Is the answer memorable and compelling?

Grade scale: 9-10=A, 8-8.9=A-, 7-7.9=B+, 6-6.9=B, 5-5.9=C, below 5=needs work"""

        user = f"""Grade this interview answer:

Question Type: {request.question_type}
Question: {request.question}

Answer: {request.answer}{role_section}"""

    return claude(system, user, max_tokens=2048)


@app.post("/api/format-star")
async def format_star(request: StarFormatRequest):
    """Reformat a story into polished STAR structure."""
    system = """You are an expert interview coach specializing in STAR storytelling.

Return ONLY a JSON object with this exact structure:
{
  "star": {
    "situation": {
      "content": "Polished situation paragraph.",
      "tips": "What makes this situation setup strong or what to add."
    },
    "task": {
      "content": "Polished task paragraph.",
      "tips": "Coaching note on task clarity."
    },
    "action": {
      "content": "Polished action paragraph using 'I' statements.",
      "action_steps": ["Specific step 1", "Specific step 2", "Specific step 3"],
      "tips": "Coaching note on action specificity."
    },
    "result": {
      "content": "Polished result paragraph with quantified outcomes.",
      "metrics": "Specific numbers or measurable outcomes to highlight.",
      "tips": "Coaching note on result impact."
    }
  },
  "full_answer": "Complete polished 2-3 minute STAR answer written as flowing prose.",
  "short_version": "30-second punchy summary version.",
  "power_words": ["impactful", "drove", "achieved"],
  "missing_elements": ["What's weak or missing from the original story"],
  "estimated_duration": "2 minutes 30 seconds"
}

Focus on: strong action verbs, quantified results, clear 'I' ownership of actions."""

    question_ctx = f"This story answers: {request.question}\n\n" if request.question else ""
    return claude(system, f"{question_ctx}Format into STAR:\n\n{request.story}", max_tokens=3000)


@app.post("/api/process-verbal")
async def process_verbal(request: ProcessVerbalRequest):
    """Clean up a verbally spoken, transcribed interview answer."""
    system = """You are an expert interview coach processing a verbally transcribed answer.

Return ONLY a JSON object with this exact structure:
{
  "cleaned_text": "Full polished written version with filler words removed and sentences cleaned up.",
  "key_points": ["Main point 1", "Main point 2", "Main point 3"],
  "summary": "2-sentence executive summary of the answer.",
  "filler_words_found": ["um", "uh", "like"],
  "filler_word_count": 12,
  "readability": "High",
  "word_count": 187,
  "estimated_duration": "1 minute 30 seconds",
  "coaching_notes": ["Note on pacing", "Note on structure"],
  "star_potential": "This story could work well for STAR format — consider expanding the Result section."
}"""

    question_ctx = f"This verbal answer is for: {request.question}\n\n" if request.question else ""
    return claude(
        system,
        f"{question_ctx}Process this verbally spoken answer:\n\n{request.transcript}",
        max_tokens=2048,
    )


@app.get("/api/question-bank")
async def get_question_bank():
    """Return a curated question bank organized by category."""
    return {
        "behavioral": [
            {"question": "Tell me about a time you led a challenging project.", "difficulty": "Medium", "tip": "Focus on YOUR actions and measurable outcomes."},
            {"question": "Describe a conflict with a colleague and how you resolved it.", "difficulty": "Medium", "tip": "Show empathy, communication, and collaborative resolution."},
            {"question": "Tell me about a time you failed. What did you learn?", "difficulty": "Hard", "tip": "Be honest, emphasize growth mindset and concrete lessons."},
            {"question": "Give an example of when you had to adapt quickly to change.", "difficulty": "Medium", "tip": "Highlight flexibility and a positive outcome."},
            {"question": "Tell me about a time you went above and beyond expectations.", "difficulty": "Easy", "tip": "Show initiative, ownership, and measurable impact."},
            {"question": "Tell me about a time you had to manage competing priorities.", "difficulty": "Medium", "tip": "Discuss your prioritization framework and the outcomes."},
            {"question": "Give an example of when you influenced stakeholders without authority.", "difficulty": "Hard", "tip": "Focus on persuasion, data, and relationship building."},
            {"question": "Tell me about a time you received difficult feedback.", "difficulty": "Medium", "tip": "Show receptiveness, action taken, and growth."},
            {"question": "Describe a time you had to make a decision with limited information.", "difficulty": "Hard", "tip": "Show your decision-making framework and risk management."},
            {"question": "Tell me about your biggest professional achievement.", "difficulty": "Easy", "tip": "Quantify the impact; connect it to the role you're applying for."},
        ],
        "situational": [
            {"question": "How would you handle a project that's falling behind schedule?", "difficulty": "Medium", "tip": "Discuss communication, prioritization, and contingency planning."},
            {"question": "What would you do if you disagreed with your manager's decision?", "difficulty": "Hard", "tip": "Show professionalism and upward communication skills."},
            {"question": "How would you handle multiple urgent tasks landing at once?", "difficulty": "Medium", "tip": "Explain your prioritization framework clearly."},
            {"question": "What would you do in your first 30/60/90 days?", "difficulty": "Medium", "tip": "Show strategic thinking: listen first, then act."},
            {"question": "How would you handle a difficult stakeholder or client?", "difficulty": "Medium", "tip": "Emphasize empathy, active listening, and solution focus."},
            {"question": "What would you do if a teammate wasn't delivering?", "difficulty": "Hard", "tip": "Show coaching instincts before escalation."},
        ],
        "leadership": [
            {"question": "Describe your leadership style.", "difficulty": "Easy", "tip": "Give specific examples supporting every claim you make."},
            {"question": "How do you motivate a struggling team?", "difficulty": "Medium", "tip": "Show empathy, individual coaching, and results."},
            {"question": "How do you develop your team members?", "difficulty": "Medium", "tip": "Discuss coaching, delegation, stretch assignments, and outcomes."},
            {"question": "Give an example of a time you drove significant change.", "difficulty": "Hard", "tip": "Highlight stakeholder alignment and change management."},
            {"question": "How do you handle underperformers?", "difficulty": "Hard", "tip": "Show clarity, fairness, and a documented process."},
        ],
        "culture_fit": [
            {"question": "Why do you want to work here specifically?", "difficulty": "Easy", "tip": "Be specific about company values, mission, and this role."},
            {"question": "What kind of environment do you thrive in?", "difficulty": "Easy", "tip": "Research company culture and align your answer accordingly."},
            {"question": "Where do you see yourself in 5 years?", "difficulty": "Medium", "tip": "Show ambition that aligns with the company growth path."},
            {"question": "What are your core values?", "difficulty": "Easy", "tip": "Be authentic and give concrete examples of each value in action."},
            {"question": "How do you handle ambiguity?", "difficulty": "Medium", "tip": "Show comfort with uncertainty and a structured approach to clarity."},
        ],
        "problem_solving": [
            {"question": "Walk me through how you approach a complex problem.", "difficulty": "Medium", "tip": "Describe a clear framework and back it with a real example."},
            {"question": "Tell me about a creative solution you developed.", "difficulty": "Medium", "tip": "Highlight innovation and measurable impact."},
            {"question": "Describe a time your initial solution didn't work.", "difficulty": "Hard", "tip": "Show adaptability, learning, and persistence."},
            {"question": "How do you use data to make decisions?", "difficulty": "Medium", "tip": "Give specific examples with metrics."},
        ],
        "communication": [
            {"question": "Tell me about a high-stakes presentation you gave.", "difficulty": "Medium", "tip": "Focus on preparation, delivery, and outcome."},
            {"question": "How do you communicate complex ideas to non-technical audiences?", "difficulty": "Medium", "tip": "Show empathy and give a real simplification example."},
            {"question": "Describe a time you had to deliver difficult feedback.", "difficulty": "Hard", "tip": "Show directness balanced with empathy (radical candor)."},
            {"question": "How do you build relationships with new stakeholders quickly?", "difficulty": "Easy", "tip": "Discuss your approach with a concrete example."},
        ],
        "closing": [
            {"question": "What questions do you have for me?", "difficulty": "Easy", "tip": "Prepare 3–5 thoughtful questions. Avoid asking about salary/benefits here."},
            {"question": "Is there anything else you'd like us to know?", "difficulty": "Easy", "tip": "Prepare a 60-second 'closing pitch' that reinforces your fit."},
            {"question": "What are your salary expectations?", "difficulty": "Hard", "tip": "Research market rates; anchor high with flexibility."},
        ],
    }
