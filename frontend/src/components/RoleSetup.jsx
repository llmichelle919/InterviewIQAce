import { useState } from 'react'
import { analyzeRole } from '../api'

export default function RoleSetup({ onComplete, existing }) {
  const [form, setForm] = useState(existing || {
    company_name: '',
    job_description: '',
    hiring_manager_name: '',
    hiring_manager_linkedin: '',
    hiring_manager_notes: '',
    previous_hires_notes: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.job_description.trim()) {
      setError('Job description is required.')
      return
    }
    setError('')
    setLoading(true)
    try {
      const data = await analyzeRole(form)
      onComplete(form, data)
    } catch (err) {
      setError(`Failed to analyze role: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-900">Role Setup</h2>
        <p className="text-sm text-slate-500 mt-1">
          Paste the job description and hiring context. Claude will generate tailored questions and insights.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Company + HM name row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Company Name</label>
            <input
              className="input"
              placeholder="e.g. Acme Corp"
              value={form.company_name}
              onChange={(e) => set('company_name', e.target.value)}
            />
          </div>
          <div>
            <label className="label">Hiring Manager Name</label>
            <input
              className="input"
              placeholder="e.g. Sarah Chen"
              value={form.hiring_manager_name}
              onChange={(e) => set('hiring_manager_name', e.target.value)}
            />
          </div>
        </div>

        {/* Job description */}
        <div>
          <label className="label">
            Job Description <span className="text-red-500">*</span>
          </label>
          <textarea
            className="input min-h-[200px] resize-y"
            placeholder="Paste the full job description here..."
            value={form.job_description}
            onChange={(e) => set('job_description', e.target.value)}
          />
        </div>

        {/* LinkedIn content */}
        <div>
          <label className="label">
            Hiring Manager LinkedIn / Background
            <span className="ml-2 text-xs font-normal text-slate-400">(paste profile content or summary)</span>
          </label>
          <textarea
            className="input min-h-[100px] resize-y"
            placeholder="Paste their LinkedIn summary, recent posts, or background notes here..."
            value={form.hiring_manager_linkedin}
            onChange={(e) => set('hiring_manager_linkedin', e.target.value)}
          />
          <p className="text-xs text-slate-400 mt-1">
            💡 Open LinkedIn → copy their About section + Experience. This helps generate personalized rapport points.
          </p>
        </div>

        {/* HM notes */}
        <div>
          <label className="label">
            Additional Notes on Hiring Manager
            <span className="ml-2 text-xs font-normal text-slate-400">(optional)</span>
          </label>
          <textarea
            className="input min-h-[80px] resize-y"
            placeholder="e.g. Values data-driven decision making, recently shipped X project, known to ask about X..."
            value={form.hiring_manager_notes}
            onChange={(e) => set('hiring_manager_notes', e.target.value)}
          />
        </div>

        {/* Previous hires */}
        <div>
          <label className="label">
            Previous Hires in This Role
            <span className="ml-2 text-xs font-normal text-slate-400">(optional — LinkedIn searches help)</span>
          </label>
          <textarea
            className="input min-h-[80px] resize-y"
            placeholder="e.g. Previous person came from Google, had 8+ years in X, focused on Y. They were promoted after 18 months..."
            value={form.previous_hires_notes}
            onChange={(e) => set('previous_hires_notes', e.target.value)}
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
            {error}
          </div>
        )}

        <button type="submit" className="btn-primary w-full py-3 text-base" disabled={loading}>
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <LoadingSpinner /> Analyzing role with Claude...
            </span>
          ) : (
            '🚀 Generate Interview Prep Plan'
          )}
        </button>
      </form>
    </div>
  )
}

function LoadingSpinner() {
  return (
    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}
