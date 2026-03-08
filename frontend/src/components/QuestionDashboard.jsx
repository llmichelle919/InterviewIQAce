import { useState } from 'react'

const DIFFICULTY_COLORS = {
  Easy: 'bg-green-100 text-green-700',
  Medium: 'bg-yellow-100 text-yellow-700',
  Hard: 'bg-red-100 text-red-700',
}

const CATEGORY_LABELS = {
  behavioral: { label: 'Behavioral', emoji: '🧠', color: 'blue' },
  technical: { label: 'Technical / Skills', emoji: '⚙️', color: 'purple' },
  situational: { label: 'Situational', emoji: '💼', color: 'orange' },
  culture_fit: { label: 'Culture Fit', emoji: '🤝', color: 'teal' },
  leadership: { label: 'Leadership', emoji: '🏆', color: 'indigo' },
  role_specific: { label: 'Role-Specific', emoji: '🎯', color: 'pink' },
}

export default function QuestionDashboard({ data, onPractice }) {
  const [expandedQ, setExpandedQ] = useState(null)
  const [activeCategory, setActiveCategory] = useState('all')

  if (!data) {
    return (
      <div className="text-center py-20 text-slate-400">
        Complete Role Setup first to see your tailored questions.
      </div>
    )
  }

  const { role_analysis, hiring_manager_insights, questions } = data

  const categories = Object.keys(questions || {}).filter((k) => questions[k]?.length)
  const filteredQuestions =
    activeCategory === 'all'
      ? categories.flatMap((cat) => questions[cat].map((q) => ({ ...q, category: cat })))
      : (questions[activeCategory] || []).map((q) => ({ ...q, category: activeCategory }))

  return (
    <div className="space-y-6">
      {/* Insights cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Role analysis */}
        {role_analysis && (
          <div className="card p-5">
            <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
              <span>📊</span> Role Insights
            </h3>
            <div className="space-y-3">
              <InsightSection label="Key Competencies" items={role_analysis.key_competencies} color="blue" />
              <InsightSection label="Likely Themes" items={role_analysis.likely_themes} color="purple" />
              {role_analysis.red_flags_to_address?.length > 0 && (
                <InsightSection label="Address Proactively" items={role_analysis.red_flags_to_address} color="orange" />
              )}
            </div>
          </div>
        )}

        {/* HM insights */}
        {hiring_manager_insights && (
          <div className="card p-5">
            <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
              <span>👤</span> Hiring Manager Insights
            </h3>
            <div className="space-y-3">
              <InsightSection label="Their Priorities" items={hiring_manager_insights.likely_priorities} color="teal" />
              <InsightSection label="Rapport Points" items={hiring_manager_insights.rapport_points} color="green" />
              {hiring_manager_insights.potential_concerns?.length > 0 && (
                <InsightSection label="Potential Concerns" items={hiring_manager_insights.potential_concerns} color="red" />
              )}
            </div>
          </div>
        )}
      </div>

      {/* Category filter */}
      <div className="card p-4">
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setActiveCategory('all')}
            className={`badge px-3 py-1 text-sm cursor-pointer transition-colors ${
              activeCategory === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All ({categories.reduce((sum, c) => sum + (questions[c]?.length || 0), 0)})
          </button>
          {categories.map((cat) => {
            const meta = CATEGORY_LABELS[cat] || { label: cat, emoji: '❓' }
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`badge px-3 py-1 text-sm cursor-pointer transition-colors ${
                  activeCategory === cat
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {meta.emoji} {meta.label} ({questions[cat]?.length || 0})
              </button>
            )
          })}
        </div>
      </div>

      {/* Questions list */}
      <div className="space-y-3">
        {filteredQuestions.map((q, i) => {
          const meta = CATEGORY_LABELS[q.category] || { label: q.category, emoji: '❓' }
          const key = `${q.category}-${i}`
          const isOpen = expandedQ === key
          return (
            <div key={key} className="card overflow-hidden">
              <button
                className="w-full text-left p-4 hover:bg-slate-50 transition-colors"
                onClick={() => setExpandedQ(isOpen ? null : key)}
              >
                <div className="flex items-start gap-3">
                  <span className="text-lg mt-0.5">{meta.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="badge bg-slate-100 text-slate-600">{meta.label}</span>
                      {q.difficulty && (
                        <span className={`badge ${DIFFICULTY_COLORS[q.difficulty] || 'bg-slate-100 text-slate-600'}`}>
                          {q.difficulty}
                        </span>
                      )}
                    </div>
                    <p className="font-medium text-slate-800">{q.question}</p>
                  </div>
                  <span className="text-slate-400 ml-2 flex-shrink-0">{isOpen ? '▲' : '▼'}</span>
                </div>
              </button>

              {isOpen && (
                <div className="px-4 pb-4 border-t border-slate-100 pt-3 space-y-3">
                  {q.why_asked && (
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Why They Ask This</p>
                      <p className="text-sm text-slate-600">{q.why_asked}</p>
                    </div>
                  )}
                  {q.key_points?.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">What to Cover</p>
                      <ul className="space-y-1">
                        {q.key_points.map((pt, j) => (
                          <li key={j} className="text-sm text-slate-600 flex gap-2">
                            <span className="text-blue-400 flex-shrink-0">•</span> {pt}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <button
                    onClick={() => onPractice({ question: q.question, type: q.category })}
                    className="btn-primary text-sm"
                  >
                    🎤 Practice This Question
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function InsightSection({ label, items, color }) {
  if (!items?.length) return null
  const colors = {
    blue: 'bg-blue-50 text-blue-700',
    purple: 'bg-purple-50 text-purple-700',
    teal: 'bg-teal-50 text-teal-700',
    green: 'bg-green-50 text-green-700',
    orange: 'bg-orange-50 text-orange-700',
    red: 'bg-red-50 text-red-700',
  }
  return (
    <div>
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {items.map((item, i) => (
          <span key={i} className={`badge text-xs ${colors[color] || 'bg-slate-100 text-slate-600'}`}>
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}
