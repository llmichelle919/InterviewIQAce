import { useState } from 'react'
import { formatStar } from '../api'

export default function StarFormatter() {
  const [story, setStory] = useState('')
  const [question, setQuestion] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState('')

  async function handleFormat() {
    if (!story.trim()) { setError('Please enter your story.'); return }
    setError('')
    setResult(null)
    setLoading(true)
    try {
      const data = await formatStar(story, question)
      setResult(data)
    } catch (err) {
      setError(`Failed to format: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  function copyText(text, key) {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(''), 2000)
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">STAR Story Formatter</h2>
        <p className="text-sm text-slate-500 mt-1">
          Paste any story or answer — Claude will restructure it into a polished STAR format.
        </p>
      </div>

      {/* Input card */}
      <div className="card p-5 space-y-4">
        <div>
          <label className="label">
            Question this story answers
            <span className="ml-2 text-xs font-normal text-slate-400">(optional — improves output)</span>
          </label>
          <input
            className="input"
            placeholder="e.g. Tell me about a time you led through ambiguity."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
        </div>
        <div>
          <label className="label">Your Story / Answer</label>
          <textarea
            className="input min-h-[200px] resize-y"
            placeholder="Paste your raw story here — bullet points, rough notes, or a full answer are all fine. Claude will structure it into STAR for you..."
            value={story}
            onChange={(e) => { setStory(e.target.value); setResult(null) }}
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
            {error}
          </div>
        )}

        <button onClick={handleFormat} disabled={loading || !story.trim()} className="btn-primary w-full py-3 text-base">
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Structuring your story...
            </span>
          ) : (
            '⭐ Format into STAR'
          )}
        </button>
      </div>

      {/* Result */}
      {result && !result.error && (
        <div className="space-y-4">
          {/* STAR breakdown */}
          {result.star && (
            <div className="space-y-3">
              {[
                { key: 'situation', label: 'Situation', emoji: '🌍', color: 'blue' },
                { key: 'task', label: 'Task', emoji: '📋', color: 'purple' },
                { key: 'action', label: 'Action', emoji: '⚡', color: 'orange' },
                { key: 'result', label: 'Result', emoji: '🏆', color: 'green' },
              ].map(({ key, label, emoji, color }) => {
                const section = result.star[key]
                if (!section) return null
                const colorMap = {
                  blue: 'border-blue-400 bg-blue-50',
                  purple: 'border-purple-400 bg-purple-50',
                  orange: 'border-orange-400 bg-orange-50',
                  green: 'border-green-400 bg-green-50',
                }
                return (
                  <div key={key} className={`card p-4 border-l-4 ${colorMap[color]}`}>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold text-slate-800 flex items-center gap-2">
                        <span>{emoji}</span> {label}
                      </h4>
                      <CopyButton
                        onClick={() => copyText(section.content, key)}
                        copied={copied === key}
                      />
                    </div>
                    <p className="text-sm text-slate-700 leading-relaxed mb-2">{section.content}</p>
                    {key === 'action' && section.action_steps?.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs font-semibold text-slate-400 uppercase mb-1">Action Steps</p>
                        <ol className="space-y-1">
                          {section.action_steps.map((step, i) => (
                            <li key={i} className="text-xs text-slate-600 flex gap-2">
                              <span className="font-bold text-orange-500 flex-shrink-0">{i + 1}.</span> {step}
                            </li>
                          ))}
                        </ol>
                      </div>
                    )}
                    {key === 'result' && section.metrics && (
                      <p className="text-xs text-green-700 mt-2 font-medium">📊 {section.metrics}</p>
                    )}
                    {section.tips && (
                      <p className="text-xs text-slate-400 italic mt-2 border-t border-slate-200 pt-2">
                        💡 Coach tip: {section.tips}
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* Full answer */}
          {result.full_answer && (
            <div className="card p-5">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-slate-800 flex items-center gap-2">
                  <span>📝</span> Full Polished Answer
                  {result.estimated_duration && (
                    <span className="text-xs font-normal text-slate-400">~{result.estimated_duration}</span>
                  )}
                </h4>
                <CopyButton
                  onClick={() => copyText(result.full_answer, 'full')}
                  copied={copied === 'full'}
                />
              </div>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{result.full_answer}</p>
            </div>
          )}

          {/* Short version */}
          {result.short_version && (
            <div className="card p-4 bg-slate-50">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-slate-700 flex items-center gap-2">
                  <span>⚡</span> 30-Second Version
                </h4>
                <CopyButton
                  onClick={() => copyText(result.short_version, 'short')}
                  copied={copied === 'short'}
                />
              </div>
              <p className="text-sm text-slate-600 italic leading-relaxed">{result.short_version}</p>
            </div>
          )}

          {/* Power words + missing elements */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {result.power_words?.length > 0 && (
              <div className="card p-4">
                <h4 className="font-semibold text-slate-700 mb-2 text-sm flex items-center gap-1.5">
                  💪 Power Words Used
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {result.power_words.map((w, i) => (
                    <span key={i} className="badge bg-blue-100 text-blue-700">{w}</span>
                  ))}
                </div>
              </div>
            )}
            {result.missing_elements?.length > 0 && (
              <div className="card p-4">
                <h4 className="font-semibold text-orange-600 mb-2 text-sm flex items-center gap-1.5">
                  📋 Strengthen These
                </h4>
                <ul className="space-y-1">
                  {result.missing_elements.map((m, i) => (
                    <li key={i} className="text-xs text-slate-600 flex gap-1.5">
                      <span className="text-orange-400">•</span> {m}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {result?.error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 text-sm">
          {result.error}
        </div>
      )}
    </div>
  )
}

function CopyButton({ onClick, copied }) {
  return (
    <button
      onClick={onClick}
      className="text-xs text-slate-400 hover:text-slate-600 transition-colors px-2 py-1 rounded hover:bg-slate-100"
    >
      {copied ? '✓ Copied!' : 'Copy'}
    </button>
  )
}
