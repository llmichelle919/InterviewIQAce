import { useState } from 'react'
import RoleSetup from './components/RoleSetup'
import QuestionDashboard from './components/QuestionDashboard'
import PracticeMode from './components/PracticeMode'
import StarFormatter from './components/StarFormatter'
import QuestionBank from './components/QuestionBank'

const TABS = [
  { id: 'setup',     label: 'Role Setup',     emoji: '🎯', desc: 'Add job & context' },
  { id: 'questions', label: 'Questions',       emoji: '❓', desc: 'AI-generated list' },
  { id: 'practice',  label: 'Practice',        emoji: '🎤', desc: 'Answer & get graded' },
  { id: 'star',      label: 'STAR Stories',    emoji: '⭐', desc: 'Format your stories' },
  { id: 'bank',      label: 'Question Bank',   emoji: '📚', desc: 'Browse all questions' },
]

export default function App() {
  const [activeTab, setActiveTab] = useState('setup')
  const [roleContext, setRoleContext] = useState(null)
  const [generatedData, setGeneratedData] = useState(null)
  const [practiceQuestion, setPracticeQuestion] = useState(null)

  function handleRoleComplete(context, data) {
    setRoleContext(context)
    setGeneratedData(data)
    setActiveTab('questions')
  }

  function handlePractice(question) {
    setPracticeQuestion(question)
    setActiveTab('practice')
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎯</span>
            <div>
              <h1 className="font-bold text-slate-900 leading-none">InterviewAce</h1>
              <p className="text-xs text-slate-400">AI-powered interview preparation</p>
            </div>
          </div>
          {roleContext && (
            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 bg-blue-50 border border-blue-100 rounded-lg px-3 py-1.5">
              <span className="text-blue-500">✓</span>
              <span className="font-medium text-blue-700">
                {roleContext.company_name || 'Role'} loaded
              </span>
            </div>
          )}
        </div>
      </header>

      {/* Tab navigation */}
      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex overflow-x-auto">
            {TABS.map((tab) => {
              const locked = (tab.id === 'questions') && !generatedData
              return (
                <button
                  key={tab.id}
                  onClick={() => !locked && setActiveTab(tab.id)}
                  disabled={locked}
                  className={`flex items-center gap-1.5 px-4 py-3.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors
                    ${activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : locked
                        ? 'border-transparent text-slate-300 cursor-not-allowed'
                        : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                    }`}
                >
                  <span>{tab.emoji}</span>
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6">
        {activeTab === 'setup' && (
          <RoleSetup onComplete={handleRoleComplete} existing={roleContext} />
        )}
        {activeTab === 'questions' && (
          <QuestionDashboard data={generatedData} onPractice={handlePractice} />
        )}
        {activeTab === 'practice' && (
          <PracticeMode
            roleContext={roleContext}
            generatedData={generatedData}
            initialQuestion={practiceQuestion}
          />
        )}
        {activeTab === 'star' && <StarFormatter />}
        {activeTab === 'bank' && <QuestionBank onPractice={handlePractice} />}
      </main>
    </div>
  )
}
