import { useState, useEffect } from 'react'
import { gradeAnswer, processVerbal } from '../api'
import VoiceRecorder from './VoiceRecorder'
import ScoreCard from './ScoreCard'

const QUESTION_TYPES = [
  { value: 'behavioral', label: 'Behavioral (STAR)' },
  { value: 'situational', label: 'Situational' },
  { value: 'technical', label: 'Technical / Skills' },
  { value: 'culture_fit', label: 'Culture Fit' },
  { value: 'leadership', label: 'Leadership' },
  { value: 'problem_solving', label: 'Problem Solving' },
  { value: 'general', label: 'General' },
]

export default function PracticeMode({ roleContext, generatedData, initialQuestion }) {
  const [inputMode, setInputMode] = useState('text') // 'text' | 'voice'
  const [question, setQuestion] = useState(initialQuestion?.question || '')
  const [questionType, setQuestionType] = useState(initialQuestion?.type || 'behavioral')
  const [answer, setAnswer] = useState('')
  const [loading, setLoading] = useState(false)
  const [processingVerbal, setProcessingVerbal] = useState(false)
  const [gradeResult, setGradeResult] = useState(null)
  const [verbalResult, setVerbalResult] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (initialQuestion) {
      setQuestion(initialQuestion.question || '')
      setQuestionType(initialQuestion.type || 'behavioral')
      setGradeResult(null)
      setVerbalResult(null)
      setAnswer('')
    }
  }, [initialQuestion])

  // Collect generated questions for quick-select
  const quickQuestions = generatedData?.questions
    ? Object.entries(generatedData.questions).flatMap(([type, qs]) =>
        (qs || []).map((q) => ({ ...q, type }))
      )
    : []

  async function handleVerbalTranscript(transcript) {
    setAnswer(transcript)
    setProcessingVerbal(true)
    setVerbalResult(null)
    try {
      const result = await processVerbal(transcript, question)
      setVerbalResult(result)
      // Use the cleaned text as the answer for grading
      if (result.cleaned_text) setAnswer(result.cleaned_text)
    } catch (err) {
      setError(`Failed to process verbal answer: ${err.message}`)
    } finally {
      setProcessingVerbal(false)
    }
  }

  async function handleGrade() {
    if (!question.trim()) { setError('Please enter a question.'); return }
    if (!answer.trim()) { setError('Please enter an answer.'); return }
    setError('')
    setGradeResult(null)
    setLoading(true)
    try {
      const result = await gradeAnswer(question, answer, questionType, roleContext)
      setGradeResult(result)
    } catch (err) {
      setError(`Failed to grade: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Practice Mode</h2>
        <p className="text-sm text-slate-500 mt-1">
          Type or record your answer. Claude will grade it and tell you exactly how to improve.
        </p>
      </div>

      {/* Question input */}
      <div className="card p-5 space-y-4">
        <div className="flex items-start gap-4 flex-col sm:flex-row">
          <div className="flex-1 w-full">
            <label className="label">Question</label>
            <textarea
              className="input min-h-[80px] resize-y"
              placeholder="Type or paste the interview question..."
              value={question}
              onChange={(e) => { setQuestion(e.target.value); setGradeResult(null) }}
            />
          </div>
          <div className="sm:w-48 w-full">
            <label className="label">Question Type</label>
            <select
              className="input"
              value={questionType}
              onChange={(e) => setQuestionType(e.target.value)}
            >
              {QUESTION_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick question selector */}
        {quickQuestions.length > 0 && (
          <div>
            <label className="label text-xs">Quick-pick from your role questions:</label>
            <div className="max-h-36 overflow-y-auto space-y-1 border border-slate-200 rounded-lg p-2">
              {quickQuestions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setQuestion(q.question)
                    setQuestionType(q.type)
                    setGradeResult(null)
                    setAnswer('')
                    setVerbalResult(null)
                  }}
                  className="w-full text-left text-xs text-slate-600 hover:bg-blue-50 hover:text-blue-700 rounded px-2 py-1.5 transition-colors"
                >
                  <span className="text-slate-300 mr-1">[{q.type}]</span> {q.question}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Answer input mode toggle */}
      <div className="card p-5 space-y-4">
        <div className="flex gap-2">
          <button
            onClick={() => setInputMode('text')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              inputMode === 'text'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            ✏️ Type Answer
          </button>
          <button
            onClick={() => setInputMode('voice')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              inputMode === 'voice'
                ? 'bg-red-500 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            🎤 Record Answer
          </button>
        </div>

        {inputMode === 'text' ? (
          <div>
            <label className="label">Your Answer</label>
            <textarea
              className="input min-h-[180px] resize-y"
              placeholder="Type your answer here. For behavioral questions, try to follow STAR: Situation → Task → Action → Result..."
              value={answer}
              onChange={(e) => { setAnswer(e.target.value); setGradeResult(null) }}
            />
          </div>
        ) : (
          <div>
            <label className="label mb-3 block">Record Your Verbal Answer</label>
            <VoiceRecorder onTranscript={handleVerbalTranscript} />

            {processingVerbal && (
              <div className="mt-3 flex items-center gap-2 text-sm text-blue-600">
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Processing verbal answer with Claude...
              </div>
            )}

            {verbalResult && !verbalResult.error && (
              <VerbalSummary data={verbalResult} />
            )}

            {answer && !processingVerbal && (
              <div className="mt-4">
                <label className="label text-xs">Cleaned answer (will be graded):</label>
                <textarea
                  className="input min-h-[120px] resize-y text-sm"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {/* Grade button */}
      <button
        onClick={handleGrade}
        disabled={loading || !answer.trim() || !question.trim()}
        className="btn-primary w-full py-3 text-base"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Grading your answer...
          </span>
        ) : (
          '📊 Grade My Answer'
        )}
      </button>

      {/* Score card */}
      {gradeResult && <ScoreCard data={gradeResult} />}
    </div>
  )
}

function VerbalSummary({ data }) {
  return (
    <div className="mt-4 card p-4 bg-blue-50 border-blue-100 space-y-3">
      <h4 className="font-semibold text-blue-800 text-sm flex items-center gap-1.5">
        🎙️ Verbal Analysis
      </h4>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
        <Stat label="Duration" value={data.estimated_duration || '—'} />
        <Stat label="Word Count" value={data.word_count || '—'} />
        <Stat label="Filler Words" value={data.filler_word_count ?? '—'} />
        <Stat label="Readability" value={data.readability || '—'} />
      </div>
      {data.key_points?.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">Key Points</p>
          <ul className="space-y-0.5">
            {data.key_points.map((p, i) => (
              <li key={i} className="text-xs text-slate-600 flex gap-1.5">
                <span className="text-blue-400">•</span> {p}
              </li>
            ))}
          </ul>
        </div>
      )}
      {data.filler_words_found?.length > 0 && (
        <p className="text-xs text-slate-500">
          Filler words removed: <span className="italic">{data.filler_words_found.join(', ')}</span>
        </p>
      )}
    </div>
  )
}

function Stat({ label, value }) {
  return (
    <div className="bg-white rounded-lg p-2 border border-blue-100">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="font-semibold text-slate-800 text-sm">{value}</p>
    </div>
  )
}
