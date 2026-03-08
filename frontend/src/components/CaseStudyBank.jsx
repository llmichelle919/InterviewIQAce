import { useState } from 'react'

const CATEGORIES = {
  market_sizing: { label: 'Market Sizing',    emoji: '📏', color: 'blue' },
  profitability:  { label: 'Profitability',    emoji: '💰', color: 'green' },
  market_entry:   { label: 'Market Entry',     emoji: '🌍', color: 'purple' },
  ma_investment:  { label: 'M&A / Investment', emoji: '🤝', color: 'indigo' },
  operations:     { label: 'Operations',       emoji: '⚙️',  color: 'orange' },
  strategy:       { label: 'Strategy',         emoji: '🎯', color: 'rose' },
}

const COLOR_MAP = {
  blue:   { badge: 'bg-blue-50 text-blue-700',   border: 'border-blue-200',   tip: 'bg-blue-50 border-blue-100 text-blue-800' },
  green:  { badge: 'bg-green-50 text-green-700',  border: 'border-green-200',  tip: 'bg-green-50 border-green-100 text-green-800' },
  purple: { badge: 'bg-purple-50 text-purple-700',border: 'border-purple-200', tip: 'bg-purple-50 border-purple-100 text-purple-800' },
  indigo: { badge: 'bg-indigo-50 text-indigo-700',border: 'border-indigo-200', tip: 'bg-indigo-50 border-indigo-100 text-indigo-800' },
  orange: { badge: 'bg-orange-50 text-orange-700',border: 'border-orange-200', tip: 'bg-orange-50 border-orange-100 text-orange-800' },
  rose:   { badge: 'bg-rose-50 text-rose-700',    border: 'border-rose-200',   tip: 'bg-rose-50 border-rose-100 text-rose-800' },
}

const DIFFICULTY_COLORS = {
  Easy:   'bg-green-100 text-green-700',
  Medium: 'bg-yellow-100 text-yellow-700',
  Hard:   'bg-red-100 text-red-700',
}

const CASE_BANK = {
  market_sizing: [
    {
      id: 'ms1',
      title: 'Coffee Shops in NYC',
      scenario: 'A private equity firm is considering investing in a coffee shop chain. Estimate the total addressable market for coffee shops in New York City — both the number of shops and total annual revenue.',
      difficulty: 'Easy',
      frameworks: ['Bottom-up sizing (population → drinkers → frequency → spend)', 'Top-down sanity check (shops × avg revenue)'],
      key_questions: [
        'NYC population? (~8.3M)',
        'What % buy coffee out at least occasionally? (~65%)',
        'How many times per week do they buy? (~3×)',
        'Average spend per visit? (~$5–6)',
        'Sanity check: how many coffee shops exist? (~30,000)',
      ],
      approach: 'Bottom-up: 8.3M × 65% × 3× per week × 52 weeks × $5.50 ≈ $46B/yr. Top-down check: 30,000 shops × $1.5M avg revenue = $45B. ✓ Consistent. Present both and reconcile.',
      tip: 'Always run TWO approaches and reconcile. If they agree → confidence. If they differ → find the discrepancy. End by stating which you trust more and why.',
    },
    {
      id: 'ms2',
      title: 'EV Charging Stations in the UK',
      scenario: 'A major energy company wants to size the market opportunity for public EV charging infrastructure in the UK over the next 5 years. How many public chargers will be needed?',
      difficulty: 'Medium',
      frameworks: ['Fleet analysis (total EVs → charging demand)', 'Utilisation rate modelling'],
      key_questions: [
        'Total cars in UK? (~33M)',
        '% EVs by 2029? (~15–20% with policy tailwinds)',
        'How often does an EV need public charging? (~1–2× per week)',
        'Average session duration? (~30–45 min for fast chargers)',
        'Target utilisation rate for chargers? (~35–45%)',
      ],
      approach: 'EVs: 33M × 17% = ~5.6M EVs. Public charging sessions: 5.6M × 1.5× per week = 8.4M sessions/week. At 45-min sessions and 40% utilisation: 8.4M × 45min ÷ (10,080 min/week × 40%) ≈ 94,000 public chargers needed. Add 20% buffer = ~113K.',
      tip: 'Segment fast (motorway) vs slow (urban) chargers — they have very different economics and utilisation patterns. Show you understand the nuance.',
    },
    {
      id: 'ms3',
      title: 'Food Delivery MAUs in London',
      scenario: 'A VC is evaluating an investment in a food delivery app targeting London. Estimate the potential monthly active user base a well-funded entrant could realistically capture in Year 2.',
      difficulty: 'Medium',
      frameworks: ['TAM → SAM → SOM funnel', 'Customer segmentation by willingness to pay'],
      key_questions: [
        'London population? (~9M)',
        'Smartphone penetration? (~85%)',
        'Who actually orders delivery? (skews 18–45, working professionals)',
        'Frequency per month? (~3–4 orders)',
        'Realistic market share vs Deliveroo/UberEats in Year 2? (~15–25%)',
      ],
      approach: 'TAM: 9M × 85% smartphone × 60% right demographic = 4.6M potential users. SAM: those who would switch / try new app = 50% = 2.3M. SOM Y2 at 20% share = 460K MAUs. Revenue: 460K × 3.5 orders × £28 AOV × 28% commission ≈ £127M GMV → ~£36M revenue.',
      tip: 'VCs want a realistic SOM, not just TAM. Explicitly state your market share assumption and defend it (what differentiation justifies it?).',
    },
  ],
  profitability: [
    {
      id: 'pr1',
      title: 'Retail Chain Profit Decline',
      scenario: 'A mid-sized UK clothing retailer with 200 stores has seen profits fall 40% YoY despite broadly flat revenues. The CEO has three months to diagnose the problem and present a recovery plan. Where do you start?',
      difficulty: 'Medium',
      frameworks: ['Profit tree: P = Revenue − Costs', 'Revenue decomposition (volume × price × mix)', 'Cost structure analysis (fixed vs variable, COGS vs SG&A)'],
      key_questions: [
        'Is revenue truly flat, or is there a mix shift (fewer premium items)?',
        'Which cost categories increased YoY? (COGS, rent, wages, logistics)',
        'Are some store formats or regions driving the decline?',
        'Has discounting increased? (impacts gross margin)',
        'Any one-off costs that inflate the comparison?',
      ],
      approach: 'Revenue flat + profit −40% → costs rose significantly. Isolate: if COGS up → supplier pricing or promotional discounting issue. If rent/occupancy up → lease renewals post-pandemic. If wages up → National Living Wage impact. Most likely: combination of wage inflation + discount-driven margin compression. Quick fix: exit 20 underperforming stores; medium-term: renegotiate supplier terms.',
      tip: 'Use the profit tree religiously: P = R − C. Then decompose R = Volume × Price × Mix. Then split C = Fixed + Variable. Identify the single biggest driver before jumping to solutions.',
    },
    {
      id: 'pr2',
      title: 'SaaS ARR Growth Slowdown',
      scenario: 'A B2B SaaS company grew ARR 40% last year and only 8% this year. Gross margins remain healthy at 72%, but EBITDA is deteriorating and the board is concerned. Walk through your diagnostic approach.',
      difficulty: 'Hard',
      frameworks: ['SaaS unit economics: ARR, NRR, churn, CAC, LTV', 'Cohort analysis', 'Revenue waterfall (new logo + expansion − churn)'],
      key_questions: [
        'Is slowdown in new logos, expansion revenue, or both?',
        'What is gross and net revenue retention (NRR)?',
        'Has Customer Acquisition Cost (CAC) risen? Payback period?',
        'Which cohorts or segments are churning most?',
        'Has anything changed in product, pricing, or competitive landscape?',
      ],
      approach: 'Revenue waterfall: New ARR + Expansion ARR − Churned ARR = Net new ARR. If new logos down → GTM problem (pipeline, conversion, positioning). If churn up → product/value issue (check NPS, feature adoption). If expansion down → land-and-expand model broken. Cross with CAC trends: rising CAC + slower growth = GTM efficiency crisis. Recommend: cohort churn analysis by segment; cut CAC by focusing on ICP; double down on expansion in healthy cohorts.',
      tip: 'NRR (Net Revenue Retention) > 100% means existing customers grow faster than they churn. This is the single most important SaaS health metric. Always ask for it.',
    },
  ],
  market_entry: [
    {
      id: 'me1',
      title: 'US Fintech Entering the UK',
      scenario: 'A US-based consumer fintech app with 50M users and P2P payment features (similar to Venmo) is evaluating the UK market. Should they enter? If yes, how and when?',
      difficulty: 'Medium',
      frameworks: ['Market attractiveness (size, growth, profitability)', 'Competitive landscape analysis', 'Entry mode: organic vs acquisition vs JV'],
      key_questions: [
        'UK market size and addressable fintech opportunity?',
        'Who are incumbents? (Monzo, Revolut, Wise, PayM)',
        'Regulatory requirements? (FCA authorisation — typically 12–18 months)',
        'Is the product transferable to UK (different payment rails: Faster Payments vs ACH)?',
        'What is our differentiation vs Revolut which already dominates?',
      ],
      approach: 'Market: UK is mature, high smartphone penetration, strong fintech adoption. Attractive. Competition: Revolut has 8M+ UK users — very hard to beat on parity. Entry mode: organic would take 2+ years for regulatory approval + brand build. Recommendation: Acquire a smaller FCA-authorised UK fintech to fast-track regulatory standing, then leverage US brand/network effects. Target NPV positive within 4 years.',
      tip: 'Frame market entry as three questions: Should we enter? (market attractiveness) → How? (build/buy/partner) → When and in what sequence? Always address regulatory timeline — it changes everything in fintech.',
    },
    {
      id: 'me2',
      title: 'Luxury Brand Goes Digital',
      scenario: 'A leading French luxury fashion house has resisted e-commerce for decades to preserve exclusivity. The new CEO wants to evaluate launching a direct-to-consumer online channel. Should they, and if so, how?',
      difficulty: 'Hard',
      frameworks: ['Brand equity vs growth trade-off', 'Channel conflict analysis', 'Customer lifetime value by channel'],
      key_questions: [
        'What % of luxury purchases are moving online? (Bain: ~30% by 2025)',
        'Do their highest-LTV customers (top 5%) shop online or in-store?',
        'How will wholesale partners (Harrods, department stores) react?',
        'What is the counterfeit/grey market risk of online presence?',
        'Can exclusivity be preserved digitally (appointment booking, waitlists)?',
      ],
      approach: 'The brand risks losing relevance if the entire category moves digital while they stay offline. Key risk is not entering — it\'s doing it badly. Recommendation: Launch e-commerce but with extreme curation. Limit to accessories and entry-tier (scarves, small leather goods — not core RTW). Build a bespoke digital experience: virtual appointments, invitation-only drops, no discounting ever. Pilot US + China before global rollout. Protect flagships by making online complementary, not a substitute.',
      tip: 'Luxury cases always have the growth vs brand equity tension at the core. Acknowledge it explicitly and show that your recommendation navigates both. Avoid "it depends" — take a stance and defend it.',
    },
  ],
  ma_investment: [
    {
      id: 'ma1',
      title: 'Acquire a Direct Competitor?',
      scenario: 'Our client is a mid-market B2B software company ($200M ARR, growing 15%). They have the opportunity to acquire a direct competitor ($80M ARR, growing 5%) at a 6× ARR multiple ($480M). Should they proceed?',
      difficulty: 'Hard',
      frameworks: ['Strategic rationale (4Cs: Capabilities, Customers, Cost, Competition)', 'Synergy quantification', 'Integration risk assessment', 'Valuation relative to synergies'],
      key_questions: [
        'What is the strategic rationale? (market share, product gaps, eliminating a competitor, talent)',
        'What revenue synergies exist? (cross-sell, upsell, geographic expansion)',
        'What cost synergies? (consolidate infra, G&A, duplicate R&D)',
        'Is 6× ARR fair for 5%-growth SaaS? (market comps are 3–5× at that growth)',
        'What is the integration risk? (culture, tech stack, customer overlap/churn)',
      ],
      approach: 'Valuation: at 5% growth, fair value is ~4× ARR = $320M. At 6× = $480M, acquirer is paying $160M premium. Synergies needed to justify: $160M NPV over 5 years at 10% discount rate = ~$42M/yr net benefit. Cross-sell 10% of $80M base = $8M ARR; cost saves of $15M/yr; churn reduction 2% = $16M ARR protected. Total ~$39M/yr — close but tight. Recommend: counter-offer at 4.5× with performance earnout up to 6×.',
      tip: 'M&A = Strategic fit × Synergies / Price. Always quantify synergies in $/yr and discount back. Never say "there are synergies" — show the maths. Explicitly address integration risk (many deals destroy value in execution).',
    },
    {
      id: 'ma2',
      title: 'VC Investment in EdTech Startup',
      scenario: 'You are advising a Series B VC fund evaluating a $20M investment in an AI-powered tutoring startup (pre-revenue, 50K users, growing 30% MoM). Is this a good investment?',
      difficulty: 'Medium',
      frameworks: ['VC investment criteria: Team, Market, Product, Traction, Business model', 'Unit economics potential', 'Return modelling (MOIC, IRR)'],
      key_questions: [
        'Is the 30% MoM growth organic or paid? Retention after month 3?',
        'Global K-12 tutoring market size? (~$200B+)',
        'How defensible is the AI moat? (data advantage, proprietary model?)',
        'Path to monetisation and unit economics at scale?',
        'At what valuation, and what return does that imply at exit?',
      ],
      approach: 'Key risks: pre-revenue makes unit economics speculative; EdTech has a mixed track record post-COVID. Key upside: AI tutoring is a genuine step-change in personalised learning; market is massive. If retention is strong (>60% at M3) and cost of AI inference is falling, there\'s a real business here. Return model: $20M at say $80M pre-money (0.25× ownership). At $1B exit (achievable if they hit 1M paying users at $100 LTV) → 2.5× gross MOIC (~5–7× net with dilution). Marginal for a top-tier fund — needs to believe in 10× path.',
      tip: 'VC cases need a clear return thesis. Always back-calculate: "At what exit valuation does this work, and how achievable is that?" Don\'t just describe the opportunity — model the return.',
    },
  ],
  operations: [
    {
      id: 'op1',
      title: 'NHS A&E Wait Time Crisis',
      scenario: 'A major NHS hospital trust has seen A&E wait times rise from 4 to 7 hours average over 18 months. The CEO has 90 days to demonstrate measurable improvement before government intervention. How do you approach this?',
      difficulty: 'Medium',
      frameworks: ['Process flow mapping + bottleneck analysis', 'Demand vs capacity framework', 'Quick wins vs structural fixes (time-horizoned)'],
      key_questions: [
        'Where in the A&E process is the time lost? (triage, assessment, treatment, discharge, bed wait)',
        'Is the problem demand-driven (more patients) or supply-driven (fewer beds/staff)?',
        'What is ward bed occupancy? (exit block is the #1 cause of A&E waits)',
        'Are there time-of-day patterns (evening surges, weekend dips in discharge)?',
        'What are the easy wins achievable in 30 days vs structural 90-day fixes?',
      ],
      approach: 'Root cause: typically "exit block" — patients clinically ready to leave A&E but no ward bed available. Diagnostic: map every hour of the A&E pathway and find where time accumulates. 30-day quick wins: discharge lounge (free beds 2hrs earlier), GP streaming for minor conditions (removes 20% of presentations), 7-day ward rounds (improves weekend discharge rate). 90-day: virtual ward pilot, same-day emergency care unit, booking admin to reduce no-shows.',
      tip: 'Operations cases need a process map. Draw the flow → find the bottleneck → fix the constraint. The Theory of Constraints applies: there is always ONE binding constraint. Find it first.',
    },
    {
      id: 'op2',
      title: 'Semiconductor Supply Chain Shock',
      scenario: 'Our client is a UK automotive manufacturer. A key semiconductor supplier has announced a 6-month production halt due to a factory fire. Semiconductors are 40% of vehicle BOM cost. What would you recommend?',
      difficulty: 'Hard',
      frameworks: ['Supply chain risk: likelihood × impact matrix', 'Mitigation hierarchy (avoid → reduce → transfer → accept)', 'Time-horizoned action plan'],
      key_questions: [
        'Which specific chips are affected? How many vehicle models impacted?',
        'Current inventory buffer? (days of supply)',
        'Alternative qualified suppliers anywhere in the world?',
        'Can any models be redesigned around different available chips?',
        'What contractual protections or force majeure clauses exist?',
      ],
      approach: 'Immediate (Week 1): Full inventory audit, halt non-production use, secure all spot market supply (even at premium). Short-term (1–3 months): Emergency qualification of secondary supplier, production prioritised to highest-margin models, consider halting low-margin variants. Medium-term (3–6 months): Redesign around available silicon where feasible, draw up business interruption insurance claim. Structural (post-crisis): Move from single-source to dual-source all tier-1 components; increase safety stock from 2 to 6 weeks on critical parts.',
      tip: 'Supply chain cases: always think in time horizons — today, this week, this month, this quarter. The first question is always "what can we do right now?" before the strategic fixes.',
    },
  ],
  strategy: [
    {
      id: 'st1',
      title: 'Responding to a Disruptive Entrant',
      scenario: 'Our client is the market leader in B2B insurance software (40% share). A well-funded startup has launched a cloud-native product at 70% lower price and is winning SME customers at pace. How should our client respond?',
      difficulty: 'Hard',
      frameworks: ["Innovator's Dilemma (Clayton Christensen)", 'Competitive response options matrix', 'Portfolio / flanking strategy'],
      key_questions: [
        'Which customer segments is the startup winning? (SME vs enterprise)',
        'Is the threat likely to move upmarket toward enterprise over time?',
        'What is our actual cost structure vs theirs? (legacy infra disadvantage?)',
        'Do we have the internal capability to build a competing cloud-native product?',
        'What is the 3-year cost of inaction (market share model)?',
      ],
      approach: "Classic innovator's dilemma — startup is attacking the low end (SME) with a good-enough product at a fraction of the cost. Long-term, they will improve and move upmarket. Options: 1) Defend enterprise only (cede SME) — buys time, risky. 2) Acquire the startup — expensive and cultural risk. 3) Build a flanking product with a separate team (avoid internal cannibalisation fears). Recommendation: Option 3 — create an independent 'Lite' product with its own P&L, priced to deny the startup oxygen in SME while protecting enterprise margin. Give it a different brand to avoid confusion.",
      tip: "Don't give equal weight to all options. Rank them and recommend one. Then stress-test your recommendation: 'The risk to this approach is X, which we would mitigate by Y.'",
    },
    {
      id: 'st2',
      title: 'New Product Launch Decision',
      scenario: 'An FMCG company has developed a premium plant-based cleaning product line. Consumer research shows 72% intent to try. Investment required is £15M over 2 years. Should they launch, and if so, how?',
      difficulty: 'Medium',
      frameworks: ['Launch decision: strategic fit → financial case → execution risk', 'Intent-to-purchase adjustment (70% intent → ~12% actual purchase)', 'NPV / payback analysis'],
      key_questions: [
        '72% intent: what is realistic conversion? (intent-to-purchase ~10–15% for new categories)',
        'What is the gross margin vs existing chemical product lines?',
        'Will this cannibalize existing products?',
        'How will retailers respond? (shelf space trade-off)',
        'What marketing spend is embedded in the £15M?',
      ],
      approach: 'Adjusted demand: UK cleaning market £2.5B. Premium eco segment ~15% = £375M SAM. At 8% share = £30M revenue. At 45% GM = £13.5M gross profit. Marketing: £8M/yr Year 1-2. EBITDA Year 2: £13.5M − £8M − £4M overheads = £1.5M. Payback ~4 years. Marginal financially but strategically sound (regulatory tailwinds, brand halo effect). Recommendation: Launch in Waitrose/Ocado first (lower volume, proves the concept), expand to mass market in Year 2.',
      tip: "Product launch cases need a go/no-go with a number. Don't just list risks — build a simple P&L. Even rough maths ('back-of-envelope') shows structured thinking. Always address cannibalization explicitly.",
    },
  ],
}

export default function CaseStudyBank({ onPractice }) {
  const [activeCategory, setActiveCategory] = useState('all')
  const [expanded, setExpanded] = useState(null)
  const [search, setSearch] = useState('')

  const allCases = Object.entries(CASE_BANK).flatMap(([cat, cases]) =>
    cases.map((c) => ({ ...c, category: cat }))
  )

  const filtered = allCases.filter((c) => {
    const matchCat = activeCategory === 'all' || c.category === activeCategory
    const matchSearch = !search || c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.scenario.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Case Study Bank</h2>
        <p className="text-sm text-slate-500 mt-1">
          {allCases.length} cases across {Object.keys(CASE_BANK).length} categories.
          Tap to see frameworks, key questions, and approach.
        </p>
      </div>

      {/* Search + category filter */}
      <div className="card p-4 space-y-3">
        <input
          className="input"
          placeholder="🔍 Search cases..."
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
            All ({allCases.length})
          </button>
          {Object.entries(CATEGORIES).map(([key, meta]) => {
            const count = CASE_BANK[key]?.length || 0
            return (
              <button
                key={key}
                onClick={() => setActiveCategory(key)}
                className={`badge px-3 py-1 text-sm cursor-pointer transition-colors ${
                  activeCategory === key
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

      {/* Cases */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-slate-400">No cases match your search.</div>
      ) : (
        <div className="space-y-2">
          {filtered.map((c) => {
            const meta = CATEGORIES[c.category] || { label: c.category, emoji: '❓', color: 'slate' }
            const colors = COLOR_MAP[meta.color] || COLOR_MAP.blue
            const isOpen = expanded === c.id

            return (
              <div key={c.id} className="card overflow-hidden">
                <button
                  className="w-full text-left p-4 hover:bg-slate-50 active:bg-slate-100 transition-colors"
                  onClick={() => setExpanded(isOpen ? null : c.id)}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-xl mt-0.5 flex-shrink-0">{meta.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className={`badge text-xs ${colors.badge}`}>{meta.label}</span>
                        <span className={`badge text-xs ${DIFFICULTY_COLORS[c.difficulty] || 'bg-slate-100 text-slate-600'}`}>
                          {c.difficulty}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-slate-800">{c.title}</p>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">{c.scenario}</p>
                    </div>
                    <span className="text-slate-300 ml-1 flex-shrink-0 text-xs mt-1">{isOpen ? '▲' : '▼'}</span>
                  </div>
                </button>

                {isOpen && (
                  <div className="px-4 pb-5 pt-3 border-t border-slate-100 space-y-4">
                    {/* Full scenario */}
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Full Scenario</p>
                      <p className="text-sm text-slate-700 leading-relaxed">{c.scenario}</p>
                    </div>

                    {/* Frameworks */}
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Frameworks to Use</p>
                      <ul className="space-y-1">
                        {c.frameworks.map((f, i) => (
                          <li key={i} className="text-sm text-slate-600 flex gap-2">
                            <span className="text-blue-400 flex-shrink-0">▸</span> {f}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Key questions to ask */}
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Key Data to Ask For</p>
                      <ul className="space-y-1">
                        {c.key_questions.map((q, i) => (
                          <li key={i} className="text-sm text-slate-600 flex gap-2">
                            <span className="text-slate-300 flex-shrink-0">?</span> {q}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Sample approach */}
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Sample Approach</p>
                      <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 rounded-lg p-3">{c.approach}</p>
                    </div>

                    {/* Coaching tip */}
                    <div className={`rounded-lg px-3 py-2.5 border ${colors.tip}`}>
                      <p className="text-xs font-semibold mb-0.5">💡 Coaching Tip</p>
                      <p className="text-sm leading-relaxed">{c.tip}</p>
                    </div>

                    {/* Practice button */}
                    <button
                      onClick={() => onPractice({
                        question: `[CASE STUDY] ${c.title}\n\n${c.scenario}`,
                        type: 'case_study',
                      })}
                      className="btn-primary w-full text-sm py-2.5"
                    >
                      🎤 Practice This Case
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
