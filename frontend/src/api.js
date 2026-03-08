const BASE_URL = 'http://localhost:8000'

async function post(path, body) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(err || `Request failed: ${res.status}`)
  }
  return res.json()
}

export async function analyzeRole(roleContext) {
  return post('/api/analyze-role', { role_context: roleContext })
}

export async function gradeAnswer(question, answer, questionType, roleContext) {
  return post('/api/grade-answer', {
    question,
    answer,
    question_type: questionType,
    role_context: roleContext,
  })
}

export async function formatStar(story, question = '') {
  return post('/api/format-star', { story, question })
}

export async function processVerbal(transcript, question = '') {
  return post('/api/process-verbal', { transcript, question })
}

export async function getQuestionBank() {
  const res = await fetch(`${BASE_URL}/api/question-bank`)
  if (!res.ok) throw new Error('Failed to fetch question bank')
  return res.json()
}
