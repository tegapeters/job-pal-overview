'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line,
} from 'recharts'
import { getStats, buildScoreBuckets } from '@/lib/supabase'

/* ── Colour palette ─────────────────────────────────────── */
const ACCENT   = '#D4FF3A'
const COLORS   = ['#D4FF3A', '#4ADE80', '#60A5FA', '#F472B6', '#A78BFA', '#FB923C']
const SCORE_COLORS: Record<string, string> = {
  '9-10': '#D4FF3A', '7-8': '#4ADE80', '4-6': '#60A5FA', '1-3': '#6B6B65',
}

/* ── Sub-components ─────────────────────────────────────── */
function Tag({ children, color = 'default' }: { children: React.ReactNode; color?: 'accent' | 'green' | 'blue' | 'default' }) {
  const cls = {
    accent:  'bg-accent/10 text-accent border-accent/30',
    green:   'bg-green-400/10 text-green-400 border-green-400/30',
    blue:    'bg-blue-400/10 text-blue-400 border-blue-400/30',
    default: 'bg-white/5 text-muted border-border',
  }[color]
  return (
    <span className={`inline-block border rounded px-2 py-0.5 font-mono text-[10px] tracking-wide ${cls}`}>
      {children}
    </span>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="font-mono text-[10px] tracking-widest uppercase text-muted mb-4 flex items-center gap-3">
      <span>{children}</span>
      <span className="flex-1 h-px bg-border" />
    </div>
  )
}

function MetricCard({ label, value, sub, accent }: {
  label: string; value: string | number; sub?: string; accent?: boolean
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="font-mono text-[10px] text-muted tracking-widest uppercase mb-2">{label}</div>
      <div className={`text-3xl font-bold ${accent ? 'text-accent' : 'text-ink'}`}>{value}</div>
      {sub && <div className="font-mono text-[10px] text-muted mt-1">{sub}</div>}
    </div>
  )
}

function FeatureCard({ icon, title, desc, tags }: {
  icon: string; title: string; desc: string; tags?: string[]
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 flex flex-col gap-3">
      <div className="text-2xl">{icon}</div>
      <div>
        <div className="font-serif text-base text-ink mb-1">{title}</div>
        <div className="font-mono text-[11px] text-muted leading-relaxed">{desc}</div>
      </div>
      {tags && (
        <div className="flex flex-wrap gap-1.5 mt-auto pt-2">
          {tags.map(t => <Tag key={t}>{t}</Tag>)}
        </div>
      )}
    </div>
  )
}

function StackRow({ layer, tech, note }: { layer: string; tech: string[]; note: string }) {
  return (
    <div className="flex items-start gap-4 py-3 border-b border-border last:border-0">
      <div className="font-mono text-[10px] text-muted tracking-widest uppercase w-24 shrink-0 pt-0.5">{layer}</div>
      <div className="flex flex-wrap gap-1.5 flex-1">
        {tech.map(t => <Tag key={t} color="default">{t}</Tag>)}
      </div>
      <div className="font-mono text-[10px] text-muted w-48 shrink-0 text-right leading-relaxed">{note}</div>
    </div>
  )
}

type Stats = Awaited<ReturnType<typeof getStats>>
type GradeRow = { area: string; grade: string; note: string }
type BuildPlan = { grades: GradeRow[]; overall: string; overallScore: number; currentPhase: string; lastUpdated: string; fetchedAt: string }

function gradeColor(grade: string) {
  if (grade.startsWith('A')) return 'text-accent'
  if (grade === 'B+' || grade === 'B') return 'text-green-400'
  if (grade === 'B-') return 'text-blue-400'
  return 'text-orange-400'
}

/* ── Page ────────────────────────────────────────────────── */
export default function Overview() {
  const [stats, setStats]         = useState<Stats>(null)
  const [plan, setPlan]           = useState<BuildPlan | null>(null)
  const [section, setSection]     = useState('overview')
  const [scoreSource, setScoreSource] = useState('all')
  const [scoreModel,  setScoreModel]  = useState('all')

  useEffect(() => { getStats().then(setStats) }, [])
  useEffect(() => {
    fetch('/api/buildplan').then(r => r.json()).then(setPlan).catch(() => {})
  }, [])

  const filteredBuckets = stats ? (() => {
    let rows = stats.rows
    if (scoreSource !== 'all') rows = rows.filter(r => (r.source || 'unknown') === scoreSource)
    if (scoreModel  !== 'all') rows = rows.filter(r => r.scored_by === scoreModel)
    return buildScoreBuckets(rows)
  })() : {}

  const scoreData  = Object.entries(filteredBuckets).map(([name, value]) => ({ name, value }))
  const sourceData = stats ? Object.entries(stats.sourceMap).sort((a, b) => b[1] - a[1]).map(([name, value]) => ({ name, value })) : []
  const trendData  = stats ? Object.entries(stats.trend).sort(([a], [b]) => a.localeCompare(b)).map(([date, count]) => ({ date: date.slice(5), count })) : []

  const navItems = [
    { id: 'overview',  icon: '◈', label: 'Overview'    },
    { id: 'problem',   icon: '!', label: 'Problem'      },
    { id: 'features',  icon: '⊞', label: 'How It Works' },
    { id: 'stack',     icon: '◎', label: 'Tech Stack'   },
    { id: 'pipeline',  icon: '↗', label: 'Pipeline'     },
    { id: 'grades',    icon: '◉', label: 'Build Plan'   },
    { id: 'metrics',   icon: '▦', label: 'Live Traction' },
  ]

  return (
    <div className="flex min-h-screen">

      {/* ── Sidebar ─────────────────────────────────────── */}
      <aside className="w-52 shrink-0 bg-surface border-r border-border flex flex-col py-6 px-4">
        <div className="mb-8 px-2">
          <img src="/logo.svg" alt="techturi" className="h-6 w-auto mb-3 opacity-90" />
          <div className="font-serif text-xl text-ink leading-tight">Job Pal</div>
          <div className="font-mono text-[10px] text-muted mt-0.5">AI Job Search · v1.0</div>
        </div>

        <span className="font-mono text-[9px] text-muted tracking-widest uppercase px-2 mb-2">Navigation</span>
        {navItems.map(n => (
          <button key={n.id} onClick={() => setSection(n.id)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg font-mono text-xs text-left transition-colors ${
              section === n.id
                ? 'bg-accent/10 text-accent'
                : 'text-muted hover:text-ink hover:bg-card'
            }`}>
            <span>{n.icon}</span> {n.label}
          </button>
        ))}

        <div className="mt-4 border-t border-border pt-4">
          <span className="font-mono text-[9px] text-muted tracking-widest uppercase px-2 mb-2 block">Links</span>
          <a href="https://jobpal.streamlit.app" target="_blank" rel="noreferrer"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-muted hover:text-ink hover:bg-card font-mono text-xs transition-colors">
            <span>↗</span> Open App
          </a>
          <a href="https://github.com/tegapeters/job-bot" target="_blank" rel="noreferrer"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-muted hover:text-ink hover:bg-card font-mono text-xs transition-colors">
            <span>⌥</span> GitHub
          </a>
        </div>

        <div className="mt-auto pt-6 border-t border-border px-2">
          {stats ? (
            <>
              <div className="font-mono text-[9px] text-muted tracking-widest uppercase">Live data</div>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                <span className="font-mono text-[10px] text-accent">Connected · {stats.total} jobs</span>
              </div>
            </>
          ) : (
            <div className="font-mono text-[10px] text-muted">Loading…</div>
          )}
        </div>
      </aside>

      {/* ── Main ─────────────────────────────────────────── */}
      <main className="flex-1 overflow-auto p-8 max-w-5xl">

        {/* ════ OVERVIEW ════ */}
        {section === 'overview' && (
          <div>
            {/* Hero */}
            <div className="mb-10">
              <div className="font-mono text-[10px] text-accent tracking-widest uppercase mb-3">Job Pal — Product Overview</div>
              <h1 className="font-serif text-5xl font-light text-ink leading-tight mb-4">
                AI that finds, scores, and<br/>
                <em className="text-accent">applies</em> to jobs for you.
              </h1>
              <p className="font-mono text-xs text-muted max-w-2xl leading-relaxed mb-6">
                Job Pal is a production AI job search pipeline. It scrapes 5+ job boards daily, scores
                every listing against your resume using Claude AI, writes tailored cover letters for your
                best matches, surfaces local networking events, and learns your preferences over time — all
                in one automated system.
              </p>
              <div className="flex gap-3 flex-wrap">
                <a href="https://jobpal.streamlit.app" target="_blank" rel="noreferrer"
                  className="inline-flex items-center gap-2 bg-accent text-bg font-mono text-xs px-4 py-2 rounded-lg hover:bg-accent/90 transition-colors">
                  Try the app ↗
                </a>
                <button onClick={() => setSection('metrics')}
                  className="inline-flex items-center gap-2 border border-border text-muted font-mono text-xs px-4 py-2 rounded-lg hover:text-ink hover:border-ink transition-colors">
                  View live traction →
                </button>
              </div>
            </div>

            {/* Live snapshot */}
            {stats && (
              <div className="mb-10">
                <SectionLabel>Live traction — pulled from production database</SectionLabel>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <MetricCard label="Jobs tracked"    value={stats.total}    accent />
                  <MetricCard label="In review queue" value={stats.queue}    sub="scored 7+ by Claude" />
                  <MetricCard label="Applied"          value={stats.applied}  sub="tracked applications" />
                  <MetricCard label="With salary data" value={stats.withSalary} sub={`${Math.round(stats.withSalary / Math.max(stats.total, 1) * 100)}% of listings`} />
                </div>
              </div>
            )}

            {/* Value props */}
            <SectionLabel>Why it exists</SectionLabel>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
              {[
                {
                  label: 'The problem',
                  body: 'Job searching is a full-time job. Candidates spend 5–10 hours a week manually sifting through listings, writing cover letters, and tracking applications. Most tools just aggregate listings — they don\'t filter, score, or write for you.',
                  color: 'text-muted',
                },
                {
                  label: 'The solution',
                  body: 'Job Pal runs the entire pipeline autonomously. Scrape → score → cover letter → track. You open the app to a ranked, curated queue of your best matches — with cover letters already written — and decide apply or skip.',
                  color: 'text-ink',
                },
                {
                  label: 'The edge',
                  body: 'Two-pass AI scoring cuts API costs 60%. Personalization engine learns from every apply/skip. Multi-source enrichment finds salary data and real post dates that job boards hide. Works for any profession.',
                  color: 'text-muted',
                },
              ].map(({ label, body, color }) => (
                <div key={label} className="bg-card border border-border rounded-xl p-5">
                  <div className="font-mono text-[10px] text-accent tracking-widest uppercase mb-3">{label}</div>
                  <div className={`font-mono text-[11px] leading-relaxed ${color}`}>{body}</div>
                </div>
              ))}
            </div>

            {/* Status grid */}
            <SectionLabel>Build status</SectionLabel>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'App (Streamlit)',  status: 'Live',        color: 'accent' as const },
                { label: 'Multi-user Auth',  status: 'Live',        color: 'accent' as const },
                { label: 'CI / 5 checks',    status: 'Passing',     color: 'green'  as const },
                { label: 'MCP integration',  status: 'Live',        color: 'accent' as const },
                { label: 'Weekly scan bot',  status: 'Scheduled',   color: 'green'  as const },
                { label: 'Multi-profession', status: 'Beta',        color: 'blue'   as const },
                { label: 'Stripe / billing', status: 'Backlog',     color: 'default' as const },
                { label: 'Daily digest',     status: 'Backlog',     color: 'default' as const },
              ].map(({ label, status, color }) => (
                <div key={label} className="bg-card border border-border rounded-xl p-4 flex items-center justify-between">
                  <span className="font-mono text-[11px] text-muted">{label}</span>
                  <Tag color={color}>{status}</Tag>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ════ PROBLEM ════ */}
        {section === 'problem' && (
          <div>
            <div className="mb-8">
              <div className="font-mono text-[10px] text-accent tracking-widest uppercase mb-2">The Problem</div>
              <h1 className="font-serif text-4xl font-light text-ink mb-3">Job searching is broken.</h1>
              <p className="font-mono text-xs text-muted max-w-xl leading-relaxed">
                Job boards surface thousands of listings. Candidates have no way to filter by actual fit,
                no time to research every company, and no tool that writes for them. The result: spray-and-pray
                applications with zero personalization — which employers ignore.
              </p>
            </div>

            <SectionLabel>The friction points</SectionLabel>
            <div className="space-y-3 mb-10">
              {[
                ['5–10 hrs/week', 'Average time a serious job seeker spends manually searching, filtering, and applying. That\'s a second job on top of their current one.'],
                ['Cover letters', 'Expected on most senior roles. Each one takes 20–45 minutes to write well. Most candidates reuse a generic template — and hiring managers can tell.'],
                ['Tracking', 'Candidates use spreadsheets to track applications. No status updates, no reminders, no signal on what\'s working or what to avoid.'],
                ['Bad signals', 'Most ATS tools rank candidates by keyword density, not by actual job fit. Candidates have no visibility into how they score before applying.'],
                ['Fragmented sources', 'The best jobs are spread across LinkedIn, company sites, niche boards, and aggregators. No single tool pulls and ranks them all.'],
              ].map(([title, desc]) => (
                <div key={title} className="flex gap-4 bg-card border border-border rounded-xl p-5">
                  <div className="font-mono text-[10px] text-accent w-28 shrink-0 pt-0.5 leading-relaxed">{title}</div>
                  <div className="font-mono text-[11px] text-muted leading-relaxed">{desc}</div>
                </div>
              ))}
            </div>

            <SectionLabel>The opportunity</SectionLabel>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                ['$28B', 'Size of the global online recruitment market (2023). Dominated by aggregators that sell attention, not outcomes.'],
                ['200M+', 'Active job seekers globally at any given time. Professionals changing roles, new graduates, displaced workers — all underserved.'],
                ['AI timing', 'LLMs now produce cover letter quality that matches strong human writers. The scoring problem — does this job fit me? — is exactly what Claude is built for.'],
                ['Moat', 'The personalization engine learns from each user\'s apply/skip signals. The longer you use it, the better it gets — and the data is yours, not LinkedIn\'s.'],
              ].map(([title, desc]) => (
                <div key={title} className="bg-card border border-border rounded-xl p-5">
                  <div className="font-serif text-2xl text-accent mb-2">{title}</div>
                  <div className="font-mono text-[11px] text-muted leading-relaxed">{desc}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ════ FEATURES / HOW IT WORKS ════ */}
        {section === 'features' && (
          <div>
            <div className="mb-8">
              <div className="font-mono text-[10px] text-accent tracking-widest uppercase mb-2">How It Works</div>
              <h1 className="font-serif text-3xl font-light text-ink mb-2">From raw listing to ready-to-send application.</h1>
              <p className="font-mono text-xs text-muted">Ten automated steps between a job URL and your decision to apply.</p>
            </div>

            <SectionLabel>Core modules</SectionLabel>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <FeatureCard icon="🔍" title="Multi-source scraper"
                desc="Pulls from LinkedIn, RemoteOK, Remotive, Jobicy, and We Work Remotely. LinkedIn descriptions are fetched in full before scoring so Claude has complete context. Role filtering uses 60% keyword overlap — broad enough to catch variants, tight enough to cut noise."
                tags={['5 job boards', 'real descriptions', 'role-aware']} />
              <FeatureCard icon="🤖" title="Two-pass AI scoring"
                desc="Pass 1: cheap heuristic using skills extracted from your resume (not hardcoded vocab). Pass 2: Claude Sonnet scores 1–10 against your full resume with reasoning. Only jobs passing the heuristic reach Claude — cuts API cost ~60% with minimal quality loss."
                tags={['claude-sonnet-4-6', 'hybrid mode', 'cost-efficient']} />
              <FeatureCard icon="✍️" title="Tailored cover letters"
                desc="Generated automatically for jobs scoring 8+. Prompt enforces first-person, specific achievements with metrics, forward-looking close. Resume cached at the system prompt level via prompt caching — one cache hit covers an entire batch run."
                tags={['8+ score only', 'prompt caching', 'metrics-driven']} />
              <FeatureCard icon="🧠" title="Personalization engine"
                desc="Learns from every apply and skip. Positive signals: company, source, and title tokens that predict your yes. Negative signals penalised only after 3+ occurrences. Target role keywords are protected — they can never become a negative signal."
                tags={['apply/skip signals', 'company memory', 'token protection']} />
              <FeatureCard icon="📅" title="Networking events"
                desc="Scrapes Meetup, Luma, and Eventbrite for local tech and professional events. Scores relevance against your resume across 18 domain categories. Virtual events filtered. Past events auto-pruned. Track interested and attending status per event."
                tags={['meetup', 'luma', 'eventbrite', '18 domains']} />
              <FeatureCard icon="🔐" title="Multi-user, any profession"
                desc="Full Supabase Auth. Each user's data is isolated via MD5-scoped job IDs — same URL creates separate rows per user without partitioned tables. Works for lawyers, nurses, engineers, designers, marketers — job vocab and scraper tags derived from your target roles."
                tags={['supabase auth', 'any profession', 'row isolation']} />
            </div>

            <SectionLabel>Differentiators</SectionLabel>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                ['Skill-first scoring', 'Score prompt ranks skills before seniority. A 6-year engineer doesn\'t get filtered out of a "Senior" role — the match matters more than the title.'],
                ['Full-description enrichment', 'LinkedIn search pages hide descriptions. Job Pal fetches the full text via the guest API before any scoring happens.'],
                ['CI on every push', 'GitHub Actions runs 5 health checks: syntax, scraper routing for 5 user archetypes, keyword drift, skill extraction, and config leak detection.'],
              ].map(([title, desc]) => (
                <div key={title} className="bg-card border border-border rounded-xl p-5">
                  <div className="font-mono text-[10px] text-accent tracking-widest uppercase mb-2">{title}</div>
                  <div className="font-mono text-[11px] text-muted leading-relaxed">{desc}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ════ TECH STACK ════ */}
        {section === 'stack' && (
          <div>
            <div className="mb-8">
              <div className="font-mono text-[10px] text-accent tracking-widest uppercase mb-2">Tech Stack</div>
              <h1 className="font-serif text-3xl font-light text-ink mb-2">Built lean. Scales without refactoring.</h1>
              <p className="font-mono text-xs text-muted">Every dependency chosen for cost, speed, and replaceability. No vendor lock-in except Supabase (swappable) and Claude (the core product value).</p>
            </div>

            <SectionLabel>Application layer</SectionLabel>
            <div className="bg-card border border-border rounded-xl divide-y divide-border mb-8">
              <StackRow layer="Frontend"  tech={['Streamlit 1.51', 'Python 3.13']}              note="Single-file UI. Custom dark CSS. Deploys in 2 min from push." />
              <StackRow layer="AI"        tech={['Claude Sonnet 4.6', 'Anthropic SDK']}         note="Scoring, cover letters, event relevance. Haiku for cheap pass." />
              <StackRow layer="Database"  tech={['Supabase', 'PostgreSQL', 'supabase-py 2.4']} note="job_applications, events, sessions, application_events." />
              <StackRow layer="Auth"      tech={['Supabase Auth', 'Email/OTP']}                 note="Magic link + password. Session restored on every load." />
              <StackRow layer="Scraping"  tech={['requests', 'feedparser', 'BeautifulSoup']}    note="No headless browser. Pure HTTP + HTML/JSON/RSS parsing." />
              <StackRow layer="Deploy"    tech={['Streamlit Cloud']}                            note="Free tier. Secrets in dashboard. Auto-deploy on push to main." />
            </div>

            <SectionLabel>Data sources</SectionLabel>
            <div className="bg-card border border-border rounded-xl divide-y divide-border mb-8">
              <StackRow layer="LinkedIn"   tech={['Public search HTML', 'Guest Jobs API']}  note="Titles + companies from search. Full descriptions from /jobs-guest/." />
              <StackRow layer="RemoteOK"   tech={['REST API (free)']}                        note="Tag-based queries, salary data, no auth required." />
              <StackRow layer="Remotive"   tech={['REST API (free)']}                        note="Full descriptions, remote-first focus." />
              <StackRow layer="Jobicy"     tech={['REST API (free)']}                        note="Dynamic tags derived from user's target roles." />
              <StackRow layer="WWR"        tech={['RSS feeds']}                              note="5 live category feeds. Category selection dynamic." />
              <StackRow layer="Events"     tech={['Meetup RSS', 'Luma JSON', 'Eventbrite']} note="City-slug normalised. Past events auto-pruned on load." />
            </div>

            <SectionLabel>Infrastructure & tooling</SectionLabel>
            <div className="bg-card border border-border rounded-xl divide-y divide-border mb-8">
              <StackRow layer="CI/CD"      tech={['GitHub Actions']}               note="5 health checks per push. ~37s runtime. No secrets needed." />
              <StackRow layer="Scan bot"   tech={['Claude Code Remote Agent']}     note="Weekly scheduled agent (Mon 9am CT) scanning for regressions." />
              <StackRow layer="MCP"        tech={['mcp_server.py']}               note="Exposes pipeline as MCP tool — Claude can orchestrate via chat." />
              <StackRow layer="Overview"   tech={['Next.js 14', 'Vercel', 'Recharts', 'Tailwind']} note="This page. Live Supabase pull, deployed on Vercel Edge." />
            </div>

            <SectionLabel>What it would take to scale</SectionLabel>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                ['1k users', 'No changes. Supabase free tier handles ~500k rows. Streamlit Cloud handles concurrent sessions. Claude API cost ~$0.20/user/week in hybrid mode.'],
                ['10k users', 'Move to Supabase Pro ($25/mo). Add a job queue (BullMQ or Celery) for async scrape runs. Background processing keeps the UI snappy.'],
                ['100k users', 'Replace Streamlit with Next.js or FastAPI frontend. Add Redis caching for scored jobs. Consider Claude Batch API for 50% cost reduction on scoring.'],
              ].map(([tier, desc]) => (
                <div key={tier} className="bg-card border border-border rounded-xl p-5">
                  <div className="font-mono text-[10px] text-accent tracking-widest uppercase mb-2">{tier}</div>
                  <div className="font-mono text-[11px] text-muted leading-relaxed">{desc}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ════ PIPELINE ════ */}
        {section === 'pipeline' && (
          <div>
            <div className="mb-8">
              <div className="font-mono text-[10px] text-accent tracking-widest uppercase mb-2">Pipeline</div>
              <h1 className="font-serif text-3xl font-light text-ink mb-2">From raw listing to curated queue.</h1>
              <p className="font-mono text-xs text-muted">Every step between a job URL and the moment you decide to apply.</p>
            </div>

            <SectionLabel>The 10-step job pipeline</SectionLabel>
            <div className="space-y-2 mb-10">
              {[
                { step: '01', label: 'Scrape',          desc: 'scrape_all() hits 5 sources. Role filter removes off-target titles using 60% keyword overlap. Runs in parallel.',         tag: 'scrapers/' },
                { step: '02', label: 'Dedup',            desc: 'get_seen_ids() returns all job IDs for this user. New jobs only proceed. MD5-scoped IDs prevent cross-user collisions.', tag: 'tracker.py' },
                { step: '03', label: 'Beta cap',         desc: 'If >50 new jobs, cheap-score all, keep top 50 by heuristic score. Prevents runaway Claude API costs during a big scrape.', tag: 'ui_v2.py' },
                { step: '04', label: 'Enrich',           desc: 'LinkedIn jobs without descriptions are fetched via guest API — full description, salary, posted date. Already-enriched jobs skipped.', tag: 'fetcher.py' },
                { step: '05', label: 'Pass 1 — Cheap',  desc: 'Skills extracted from your resume dynamically. Job skills matched. Title, role, location, salary checked. Score 1–10 in milliseconds.', tag: 'agent.py' },
                { step: '06', label: 'Pass 2 — Claude', desc: 'Jobs scoring ≥5 on cheap sent to Claude Sonnet with your full resume + job description. Returns score 1–10, reasoning, and seniority match.', tag: 'agent.py' },
                { step: '07', label: 'Cover letters',   desc: 'Jobs scoring 8+ get a cover letter from Claude Sonnet. System prompt (with resume) is cached — one cache hit covers the whole batch.', tag: 'agent.py' },
                { step: '08', label: 'Upsert',           desc: 'upsert_jobs() saves all scored jobs to Supabase with on_conflict="id". Score, salary range, seniority, source all persisted.', tag: 'tracker.py' },
                { step: '09', label: 'Personalise',     desc: 'get_personalization_context() reads your apply/skip history. Review queue re-ranked by effective score (base + personal bonuses).', tag: 'tracker.py' },
                { step: '10', label: 'Review',           desc: 'Jobs scoring ≥7 appear in your queue sorted by effective score. Cover letters pre-loaded. One click to apply, skip, or save.', tag: 'ui_v2.py' },
              ].map(({ step, label, desc, tag }) => (
                <div key={step} className="flex gap-4 bg-card border border-border rounded-xl p-4">
                  <div className="font-mono text-[10px] text-accent w-6 shrink-0 pt-0.5">{step}</div>
                  <div className="flex-1">
                    <div className="font-mono text-xs text-ink mb-0.5">{label}</div>
                    <div className="font-mono text-[11px] text-muted leading-relaxed">{desc}</div>
                  </div>
                  <Tag color="default">{tag}</Tag>
                </div>
              ))}
            </div>

            <SectionLabel>Application lifecycle</SectionLabel>
            <div className="flex flex-wrap items-center gap-2 font-mono text-[11px] mb-8">
              {['new', '→', 'applied', '→', 'interview', '→', 'rejected'].map((s, i) => (
                s === '→'
                  ? <span key={i} className="text-border">→</span>
                  : <span key={i} className="bg-card border border-border rounded px-3 py-1.5 text-muted">{s}</span>
              ))}
              <span className="text-border mx-2">|</span>
              {['skipped', 'application_closed'].map(s => (
                <span key={s} className="bg-card border border-border rounded px-3 py-1.5 text-muted">{s}</span>
              ))}
            </div>

            <SectionLabel>What gets tracked per job</SectionLabel>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {['title', 'company', 'source', 'url', 'score (1–10)', 'reasoning', 'seniority', 'salary_range',
                'cover_letter', 'status', 'applied_at', 'created_at', 'scored_by', 'cheap_score'].map(f => (
                <div key={f} className="bg-card border border-border rounded px-3 py-2 font-mono text-[10px] text-muted">{f}</div>
              ))}
            </div>
          </div>
        )}

        {/* ════ BUILD PLAN ════ */}
        {section === 'grades' && (
          <div>
            <div className="mb-8">
              <div className="font-mono text-[10px] text-accent tracking-widest uppercase mb-2">Build Plan</div>
              <h1 className="font-serif text-4xl font-light text-ink mb-3">Honest grades. Clear path to A.</h1>
              <p className="font-mono text-xs text-muted max-w-xl leading-relaxed">
                Where Job Pal stands today — pulled live from{' '}
                <a href="https://github.com/tegapeters/job-bot/blob/main/BUILDPLAN.md" target="_blank" rel="noreferrer" className="text-accent hover:underline">BUILDPLAN.md</a>.
                Updates automatically with every push.
                {plan && <> Overall: <span className="text-ink">{plan.overall}</span>. Active: <span className="text-ink">{plan.currentPhase}</span>.</>}
              </p>
              {plan?.lastUpdated && (
                <div className="font-mono text-[10px] text-muted mt-2">Last updated: {plan.lastUpdated}</div>
              )}
            </div>

            <SectionLabel>Current grades {plan ? `— live from GitHub` : `— loading…`}</SectionLabel>
            <div className="bg-card border border-border rounded-xl overflow-hidden mb-10">
              {plan ? plan.grades.map(({ area, grade, note }) => (
                <div key={area} className="flex gap-4 items-start p-4 border-b border-border last:border-0 hover:bg-white/[0.02] transition-colors">
                  <div className={`font-mono text-lg font-bold w-8 shrink-0 ${gradeColor(grade)}`}>{grade}</div>
                  <div className="flex-1">
                    <div className="font-mono text-[11px] text-ink mb-0.5">{area}</div>
                    <div className="font-mono text-[10px] text-muted leading-relaxed">{note}</div>
                  </div>
                </div>
              )) : (
                <div className="p-8 text-center font-mono text-[11px] text-muted">
                  <span className="inline-block w-2 h-2 rounded-full bg-accent animate-pulse mr-2" />
                  Fetching latest grades from GitHub…
                </div>
              )}
            </div>

            <SectionLabel>Roadmap to A across the board</SectionLabel>
            <div className="space-y-3 mb-10">
              {[
                {
                  phase: 'Phase 1 — SaaS foundation (2–3 weeks)',
                  color: 'accent',
                  items: [
                    ['Stripe integration', 'Billing page, usage metering per scrape run, free tier (100 jobs/mo), paid tier ($12/mo, unlimited). Webhook for subscription status.'],
                    ['Rate limiting', 'Cap scrape runs per user per day (free: 1, paid: 5). Enforce in Streamlit session state + Supabase row count check.'],
                    ['Error handling', 'Catch Supabase connection failures gracefully. Show user-friendly messages, not stack traces. Log errors to Supabase error_log table.'],
                    ['Automated daily scraping', 'Cron job (GitHub Actions or Render) to run scrape_all() for all active users daily at 7am. Send digest email with new top matches.'],
                  ],
                },
                {
                  phase: 'Phase 2 — Scraper resilience (1–2 weeks)',
                  color: 'green',
                  items: [
                    ['Add Indeed', 'Largest job board by volume. Requires HTML scraping (no public API). Adds ~2x coverage.'],
                    ['Add Greenhouse/Lever', 'ATS boards where companies post directly. Higher quality, lower volume. Important for senior roles.'],
                    ['LinkedIn fallback', 'If LinkedIn HTML structure changes (it does), fall back to Bing Jobs or SerpAPI. Prevents full pipeline outage from one scraper break.'],
                    ['Scraper health dashboard', 'Track success rate per source per run. Alert (email or Slack) if a source returns 0 results — catches breaks before users notice.'],
                  ],
                },
                {
                  phase: 'Phase 3 — User growth (ongoing)',
                  color: 'blue',
                  items: [
                    ['Non-tech user beta', 'Recruit 5 non-tech users (nurses, lawyers, marketers). Run setup flow with them. Fix every friction point before paid launch.'],
                    ['Mobile UX', 'Streamlit renders on mobile but isn\'t optimized. Add mobile-specific CSS tweaks for the review queue — users will check jobs on their phone.'],
                    ['Apply/skip data flywheel', 'The personalization engine needs data. Encourage users to rate every job (even quick ones). Add "not relevant" reason codes to improve signal quality.'],
                    ['Weekly digest email', 'Sunday night email: top 5 new matches this week, events to check out, application status updates. Keeps users engaged between scrape runs.'],
                  ],
                },
              ].map(({ phase, color, items }) => (
                <div key={phase} className="bg-card border border-border rounded-xl p-5">
                  <div className={`font-mono text-[10px] tracking-widest uppercase mb-4 text-${color}`}>{phase}</div>
                  <div className="space-y-3">
                    {items.map(([title, desc]) => (
                      <div key={title} className="flex gap-3">
                        <span className={`font-mono text-[10px] text-${color} mt-0.5 shrink-0`}>→</span>
                        <div>
                          <span className="font-mono text-[11px] text-ink">{title}: </span>
                          <span className="font-mono text-[11px] text-muted">{desc}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <SectionLabel>What an A looks like</SectionLabel>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                ['Paying users', 'First 10 paying customers ($12/mo). Proves the value prop is real, not just a personal tool.'],
                ['Source diversity', '5+ sources, none >40% of volume. LinkedIn parity with at least 2 backup scrapers.'],
                ['Daily automation', 'Zero manual triggers. Scrape + score + digest runs every day without user action.'],
                ['Non-tech NPS', '3 non-tech users complete full flow (setup → scrape → apply) with no help from the builder.'],
              ].map(([title, desc]) => (
                <div key={title} className="bg-card border border-border rounded-xl p-4 flex gap-3 items-start">
                  <span className="text-accent font-mono text-base shrink-0">✓</span>
                  <div>
                    <div className="font-mono text-[11px] text-ink mb-0.5">{title}</div>
                    <div className="font-mono text-[10px] text-muted leading-relaxed">{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ════ LIVE TRACTION ════ */}
        {section === 'metrics' && (
          <div>
            <div className="mb-8">
              <div className="font-mono text-[10px] text-accent tracking-widest uppercase mb-2">Live Traction</div>
              <h1 className="font-serif text-3xl font-light text-ink mb-2">Real numbers from production.</h1>
              <p className="font-mono text-xs text-muted">Pulled live from Supabase on page load. No mocked data.</p>
            </div>

            {!stats ? (
              <div className="flex items-center gap-3 text-muted font-mono text-sm">
                <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                Loading…
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                  <MetricCard label="Total Tracked"  value={stats.total}                                                        />
                  <MetricCard label="In Queue (7+)"  value={stats.queue}      accent                                            />
                  <MetricCard label="Applied"         value={stats.applied}                                                      />
                  <MetricCard label="Interviews"      value={stats.interviews}                                                   />
                  <MetricCard label="With Salary"     value={stats.withSalary} sub={`${Math.round(stats.withSalary/Math.max(stats.total,1)*100)}% coverage`} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                  <div className="bg-card border border-border rounded-xl p-5">
                    <div className="flex items-start justify-between mb-4">
                      <SectionLabel>Score distribution</SectionLabel>
                    </div>
                    <div className="flex gap-2 mb-4 flex-wrap">
                      <select
                        value={scoreSource}
                        onChange={e => setScoreSource(e.target.value)}
                        className="bg-surface border border-border rounded px-2 py-1 font-mono text-[10px] text-muted focus:outline-none focus:border-accent"
                      >
                        <option value="all">All sources</option>
                        {stats.sources.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                      {stats.models.length > 0 ? (
                        <select
                          value={scoreModel}
                          onChange={e => setScoreModel(e.target.value)}
                          className="bg-surface border border-border rounded px-2 py-1 font-mono text-[10px] text-muted focus:outline-none focus:border-accent"
                        >
                          <option value="all">All models</option>
                          {stats.models.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                      ) : (
                        <span className="font-mono text-[10px] text-muted/40 py-1 px-2 border border-dashed border-border rounded">
                          model filter — add scored_by col
                        </span>
                      )}
                    </div>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie data={scoreData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3}>
                          {scoreData.map(e => <Cell key={e.name} fill={SCORE_COLORS[e.name] ?? '#6B6B65'} />)}
                        </Pie>
                        <Tooltip contentStyle={{ background:'#1C1C18', border:'1px solid #2A2A25', borderRadius:8, fontFamily:'JetBrains Mono', fontSize:11 }} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex gap-3 justify-center mt-2 flex-wrap">
                      {scoreData.map(e => (
                        <div key={e.name} className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full" style={{ background: SCORE_COLORS[e.name] ?? '#6B6B65' }} />
                          <span className="font-mono text-[10px] text-muted">{e.name}: {e.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-card border border-border rounded-xl p-5">
                    <SectionLabel>Jobs by source</SectionLabel>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={sourceData} layout="vertical" margin={{ left: 8, right: 16 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#2A2A25" horizontal={false} />
                        <XAxis type="number" tick={{ fontSize:10, fontFamily:'JetBrains Mono', fill:'#6B6B65' }} axisLine={false} tickLine={false} />
                        <YAxis type="category" dataKey="name" tick={{ fontSize:10, fontFamily:'JetBrains Mono', fill:'#6B6B65' }} axisLine={false} tickLine={false} width={72} />
                        <Tooltip contentStyle={{ background:'#1C1C18', border:'1px solid #2A2A25', borderRadius:8, fontFamily:'JetBrains Mono', fontSize:11 }} />
                        <Bar dataKey="value" radius={[0,4,4,0]}>
                          {sourceData.map((_,i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-card border border-border rounded-xl p-5">
                  <SectionLabel>Scrape activity — last 14 days</SectionLabel>
                  <ResponsiveContainer width="100%" height={160}>
                    <LineChart data={trendData} margin={{ right: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#2A2A25" />
                      <XAxis dataKey="date" tick={{ fontSize:10, fontFamily:'JetBrains Mono', fill:'#6B6B65' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize:10, fontFamily:'JetBrains Mono', fill:'#6B6B65' }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ background:'#1C1C18', border:'1px solid #2A2A25', borderRadius:8, fontFamily:'JetBrains Mono', fontSize:11 }} />
                      <Line type="monotone" dataKey="count" stroke={ACCENT} strokeWidth={2} dot={{ fill:ACCENT, r:3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </>
            )}
          </div>
        )}

        <div className="mt-12 pt-4 border-t border-border flex items-center justify-between">
          <span className="font-mono text-[10px] text-muted">techturi · Job Pal · {new Date().getFullYear()}</span>
          <a href="https://jobpal.streamlit.app" target="_blank" rel="noreferrer"
            className="font-mono text-[10px] text-accent hover:underline">Open app →</a>
        </div>
      </main>
    </div>
  )
}
