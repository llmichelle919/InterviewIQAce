import { useState, useEffect } from 'react'
import { getQuestionBank } from '../api'

const CATEGORY_META = {
  behavioral:     { label: 'Behavioral',       emoji: '🧠', color: 'blue' },
  situational:    { label: 'Situational',       emoji: '💼', color: 'purple' },
  leadership:     { label: 'Leadership',        emoji: '🏆', color: 'indigo' },
  culture_fit:    { label: 'Culture Fit',       emoji: '🤝', color: 'teal' },
  problem_solving:{ label: 'Problem Solving',   emoji: '🔍', color: 'orange' },
  communication:  { label: 'Communication',     emoji: '💬', color: 'pink' },
  closing:        { label: 'Closing',           emoji: '🎯', color: 'green' },
}

const DIFFICULTY_COLORS = {
  Easy:   'bg-green-100 text-green-700',
  Medium: 'bg-yellow-100 text-yellow-700',
  Hard:   'bg-red-100 text-red-700',
}

export default function QuestionBank({ onPractice }) {
  const [bank, setBank] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('all')
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState(null)

  useEffect(() => {
    getQuestionBank()
      .then(setBank)
      .catch(() => setBank({}))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="text-center py-20 text-slate-400">Loading question bank...</div>
  }

  const categories = Object.keys(bank || {})
  const allQuestions = categories.flatMap((cat) =>
    (bank[cat] || []).map((q) => ({ ...q, category: cat }))
  )

  const filtered = allQuestions.filter((q) => {
    const matchCat = activeCategory === 'all' || q.category === activeCategory
    const matchSearch = !search || q.question.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Question Bank</h2>
        <p className="text-sm text-slate-500 mt-1">
          {allQuestions.length} curated questions across {categories.length} categories. Click any to practice.
        </p>
      </div>

      {/* Search + filters */}
      <div className="card p-4 space-y-3">
        <input
          className="input"
          placeholder="🔍 Search questions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveCategory('all')}
            className={`badge px-3 py-1 text-sm cursor-pointer transition-colors ${
              activeCategory === 'all'
                ? 'bg-slate-800 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All ({allQuestions.length})
          </button>
          {categories.map((cat) => {
            const meta = CATEGORY_META[cat] || { label: cat, emoji: '❓' }
            const count = bank[cat]?.length || 0
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`badge px-3 py-1 text-sm cursor-pointer transition-colors ${
                  activeCategory === cat
                    ? 'bg-slate-800 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {meta.emoji} {meta.label} ({count})
              </button>
            )
          })}
        </div>
      </div>

      {/* Questions */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-slate-400">No questions match your search.</div>
      ) : (
        <div className="space-y-2">
          {filtered.map((q, i) => {
            const meta = CATEGORY_META[q.category] || { label: q.category, emoji: '❓', color: 'slate' }
            const colorMap = {
              blue: 'text-blue-600 bg-blue-50',
              purple: 'text-purple-600 bg-purple-50',
              indigo: 'text-indigo-600 bg-indigo-50',
              teal: 'text-teal-600 bg-teal-50',
              orange: 'text-orange-600 bg-orange-50',
              pink: 'text-pink-600 bg-pink-50',
              green: 'text-green-600 bg-green-50',
              slate: 'text-slate-600 bg-slate-50',
            }
            const isOpen = expanded === i

            return (
              <div key={i} className="card overflow-hidden">
                <button
                  className="w-full text-left p-4 hover:bg-slate-50 transition-colors"
                  onClick={() => setExpanded(isOpen ? null : i)}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-lg mt-0.5">{meta.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className={`badge text-xs ${colorMap[meta.color]}`}>{meta.label}</span>
                        {q.difficulty && (
                          <span className={`badge text-xs ${DIFFICULTY_COLORS[q.difficulty] || 'bg-slate-100 text-slate-600'}`}>
                            {q.difficulty}
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-medium text-slate-800">{q.question}</p>
                    </div>
                    <span className="text-slate-300 ml-2 flex-shrink-0 text-xs">{isOpen ? '▲' : '▼'}</span>
                  </div>
                </button>

                {isOpen && (
                  <div className="px-4 pb-4 pt-2 border-t border-slate-100 space-y-3">
                    {q.tip && (
                      <div className="bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">
                        <p className="text-xs font-semibold text-blue-600 mb-0.5">💡 Coaching Tip</p>
                        <p className="text-sm text-blue-700">{q.tip}</p>
                      </div>
                    )}
                    <button
                      onClick={() => onPractice({ question: q.question, type: q.category })}
                      className="btn-primary text-sm"
                    >
                      🎤 Practice This
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
