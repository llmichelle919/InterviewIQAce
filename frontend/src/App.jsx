import { useState } from 'react'
import RoleSetup from './components/RoleSetup'
import QuestionDashboard from './components/QuestionDashboard'
import PracticeMode from './components/PracticeMode'
import StarFormatter from './components/StarFormatter'
import QuestionBank from './components/QuestionBank'
import CaseStudyBank from './components/CaseStudyBank'

const TABS = [
  { id: 'setup',     label: 'Setup',    emoji: '🎯' },
  { id: 'questions', label: 'My Qs',    emoji: '❓', requiresSetup: true },
  { id: 'practice',  label: 'Practice', emoji: '🎤' },
  { id: 'star',      label: 'STAR',     emoji: '⭐' },
  { id: 'library',   label: 'Library',  emoji: '📚' },
]

export default function App() {
  const [activeTab, setActiveTab] = useState('setup')
  const [libraryView, setLibraryView] = useState('bank')
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
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Compact header */}
      <header
        className="bg-white border-b border-slate-200 sticky top-0 z-10"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <div className="px-4 py-3 flex items-center justify-between max-w-3xl mx-auto w-full">
          <div className="flex items-center gap-2">
            <span className="text-xl">🎯</span>
            <div>
              <h1 className="font-bold text-slate-900 leading-tight">InterviewAce</h1>
              <p className="text-[10px] text-slate-400 leading-tight hidden sm:block">AI-powered interview prep</p>
            </div>
          </div>
          {roleContext && (
            <span className="text-xs font-medium text-blue-700 bg-blue-50 border border-blue-100 rounded-full px-3 py-1 max-w-[140px] truncate">
              ✓ {roleContext.company_name || 'Role'} ready
            </span>
          )}
        </div>
      </header>

      {/* Main content — pb-28 leaves room above bottom nav + safe area */}
      <main className="flex-1 px-4 py-5 pb-28 max-w-3xl mx-auto w-full">
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
        {activeTab === 'library' && (
          <div className="space-y-4">
            {/* iOS-style segment control */}
            <div className="flex bg-slate-100 rounded-xl p-1">
              <button
                onClick={() => setLibraryView('bank')}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                  libraryView === 'bank'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 active:text-slate-700'
                }`}
              >
                📚 Question Bank
              </button>
              <button
                onClick={() => setLibraryView('cases')}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                  libraryView === 'cases'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 active:text-slate-700'
                }`}
              >
                💼 Case Studies
              </button>
            </div>
            {libraryView === 'bank'
              ? <QuestionBank onPractice={handlePractice} />
              : <CaseStudyBank onPractice={handlePractice} />
            }
          </div>
        )}
      </main>

      {/* iPhone-style bottom tab bar */}
      <nav
        className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur border-t border-slate-200 z-20"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="flex max-w-lg mx-auto">
          {TABS.map((tab) => {
            const locked = tab.requiresSetup && !generatedData
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => !locked && setActiveTab(tab.id)}
                disabled={locked}
                className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 min-h-[52px] transition-all
                  ${isActive
                    ? 'text-blue-600'
                    : locked
                      ? 'text-slate-300'
                      : 'text-slate-500 active:text-slate-800 active:scale-95'
                  }`}
              >
                <span className={`text-[22px] leading-none transition-transform duration-150 ${isActive ? 'scale-110' : ''}`}>
                  {tab.emoji}
                </span>
                <span className={`text-[10px] leading-none mt-0.5 ${isActive ? 'font-semibold' : 'font-medium'}`}>
                  {tab.label}
                </span>
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
