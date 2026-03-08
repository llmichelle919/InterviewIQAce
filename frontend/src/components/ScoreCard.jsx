export default function ScoreCard({ data }) {
  if (!data || data.error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 text-sm">
        {data?.error || 'Something went wrong'}{data?.raw ? `: ${data.raw.slice(0, 200)}` : ''}
      </div>
    )
  }

  const { scores, overall_score, grade, summary, strengths, improvements, quick_wins, model_answer_outline } = data

  const scoreColor = (s) => {
    if (s >= 8) return 'text-green-600'
    if (s >= 6) return 'text-yellow-600'
    return 'text-red-500'
  }

  const barColor = (s) => {
    if (s >= 8) return 'bg-green-500'
    if (s >= 6) return 'bg-yellow-400'
    return 'bg-red-400'
  }

  const gradeBg = () => {
    if (overall_score >= 8) return 'bg-green-50 border-green-200 text-green-800'
    if (overall_score >= 6) return 'bg-yellow-50 border-yellow-200 text-yellow-800'
    return 'bg-red-50 border-red-200 text-red-800'
  }

  const SCORE_LABELS = {
    // Standard interview rubric
    clarity_structure: 'Clarity & Structure',
    relevance: 'Relevance',
    star_format: 'STAR Format',
    specificity: 'Specificity',
    impact: 'Impact',
    // Case study rubric
    problem_structuring: 'Problem Structuring (MECE)',
    hypothesis_driven: 'Hypothesis-Driven Thinking',
    analytical_rigor: 'Analytical Rigor',
    synthesis: 'Synthesis & Insights',
    recommendation: 'Recommendation Quality',
  }

  return (
    <div className="space-y-5 mt-6">
      {/* Overall score */}
      <div className={`card p-5 border ${gradeBg()}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium opacity-70">Overall Score</p>
            <div className="flex items-end gap-2 mt-1">
              <span className="text-4xl font-bold">{grade || '—'}</span>
              <span className="text-xl font-semibold opacity-60 mb-1">
                {overall_score != null ? `${overall_score.toFixed(1)}/10` : ''}
              </span>
            </div>
          </div>
          <div className="text-5xl">
            {overall_score >= 8 ? '🌟' : overall_score >= 6 ? '📈' : '💪'}
          </div>
        </div>
        {summary && <p className="text-sm mt-3 opacity-80">{summary}</p>}
      </div>

      {/* Rubric breakdown */}
      {scores && (
        <div className="card p-5">
          <h4 className="font-semibold text-slate-800 mb-4">Rubric Breakdown</h4>
          <div className="space-y-3">
            {Object.entries(scores).map(([key, val]) => {
              if (!val) return null
              const { score, feedback } = val
              return (
                <div key={key}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-slate-700">{SCORE_LABELS[key] || key}</span>
                    <span className={`text-sm font-bold ${scoreColor(score)}`}>{score}/10</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${barColor(score)}`}
                      style={{ width: `${score * 10}%` }}
                    />
                  </div>
                  {feedback && <p className="text-xs text-slate-400 mt-1">{feedback}</p>}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Strengths + improvements */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {strengths?.length > 0 && (
          <div className="card p-4">
            <h4 className="font-semibold text-green-700 mb-2 flex items-center gap-1.5">
              <span>✅</span> Strengths
            </h4>
            <ul className="space-y-1.5">
              {strengths.map((s, i) => (
                <li key={i} className="text-sm text-slate-600 flex gap-2">
                  <span className="text-green-400 flex-shrink-0">•</span> {s}
                </li>
              ))}
            </ul>
          </div>
        )}
        {improvements?.length > 0 && (
          <div className="card p-4">
            <h4 className="font-semibold text-orange-600 mb-2 flex items-center gap-1.5">
              <span>📋</span> Areas to Improve
            </h4>
            <ul className="space-y-1.5">
              {improvements.map((s, i) => (
                <li key={i} className="text-sm text-slate-600 flex gap-2">
                  <span className="text-orange-400 flex-shrink-0">•</span> {s}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Quick wins */}
      {quick_wins?.length > 0 && (
        <div className="card p-4 border-l-4 border-l-blue-400">
          <h4 className="font-semibold text-blue-700 mb-2 flex items-center gap-1.5">
            <span>⚡</span> Quick Wins
          </h4>
          <ul className="space-y-1.5">
            {quick_wins.map((w, i) => (
              <li key={i} className="text-sm text-slate-600 flex gap-2">
                <span className="text-blue-400 flex-shrink-0">→</span> {w}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Model answer outline */}
      {model_answer_outline && (
        <div className="card p-4 bg-slate-50">
          <h4 className="font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
            <span>💡</span> Ideal Answer Outline
          </h4>
          <p className="text-sm text-slate-600 leading-relaxed">{model_answer_outline}</p>
        </div>
      )}
    </div>
  )
}
