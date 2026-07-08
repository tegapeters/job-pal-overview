'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line,
} from 'recharts'
import { getStats } from '@/lib/supabase'

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

/* ── Page ────────────────────────────────────────────────── */
export default function Overview() {
  const [stats, setStats]   = useState<Stats>(null)
  const [section, setSection] = useState('overview')

  useEffect(() => { getStats().then(setStats) }, [])

  const scoreData  = stats ? Object.entries(stats.scoreBuckets).map(([name, value]) => ({ name, value })) : []
  const sourceData = stats ? Object.entries(stats.sourceMap).sort((a, b) => b[1] - a[1]).map(([name, value]) => ({ name, value })) : []
  const trendData  = stats ? Object.entries(stats.trend).sort(([a], [b]) => a.localeCompare(b)).map(([date, count]) => ({ date: date.slice(5), count })) : []

  const navItems = [
    { id: 'overview',  icon: '◈', label: 'Overview'  },
    { id: 'features',  icon: '⊞', label: 'Features'  },
    { id: 'stack',     icon: '◎', label: 'Tech Stack' },
    { id: 'pipeline',  icon: '↗', label: 'Pipeline'   },
    { id: 'metrics',   icon: '▦', label: 'Live Data'  },
  ]

  return (
    <div className="flex min-h-screen">

      {/* ── Sidebar ─────────────────────────────────────── */}
      <aside className="w-52 shrink-0 bg-surface border-r border-border flex flex-col py-6 px-4">
        <div className="mb-8 px-2">
          <div className="font-mono text-[10px] text-muted tracking-widest uppercase mb-1">techturi</div>
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
          <span className="font-mono text-[9px] text-muted tracking-widest uppercase px-2 mb-2 block">Launch</span>
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
            <div className="mb-8">
              <div className="font-mono text-[10px] text-accent tracking-widest uppercase mb-2">Project Overview</div>
              <h1 className="font-serif text-4xl font-light text-ink leading-tight mb-3">
                Your AI <em className="text-accent">job search</em> engine.
              </h1>
              <p className="font-mono text-xs text-muted max-w-xl leading-relaxed">
                Job Pal is a full-stack AI job search pipeline. It scrapes 5+ job boards,
                scores every listing against your resume using Claude, generates tailored
                cover letters for strong matches, surfaces local networking events, and
                learns your preferences over time.
              </p>
            </div>

            <SectionLabel>What it does</SectionLabel>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-10">
              {[
                ['Scrapes', 'Pulls jobs from LinkedIn, RemoteOK, Remotive, Jobicy, and WWR. Enriches LinkedIn listings with full descriptions and real posted dates.'],
                ['Scores',  'Claude Sonnet scores every job 1–10 against your resume. Skill-first prompt, seniority as a nudge not a gate. Cover letters generated for 8+ scores.'],
                ['Learns',  'Tracks apply/skip signals to personalise ranking. Penalises companies you\'ve rejected. Protects target role keywords from becoming negative signals.'],
                ['Events',  'Scrapes Meetup, Luma, and Eventbrite for local tech networking events. Scores relevance against your resume and tracks interested/attending status.'],
                ['Multi-user', 'Full Supabase Auth. Each user gets isolated data via scoped ID hashing and row-level security. Setup page saves resume and target roles per account.'],
                ['CI',      'GitHub Actions runs 5 health checks on every push: syntax, scraper routing for 5 user types, EXCLUDE_KEYWORDS drift, skill extraction, and config leaks.'],
              ].map(([title, desc]) => (
                <div key={title} className="bg-card border border-border rounded-xl p-5">
                  <div className="font-mono text-[10px] text-accent tracking-widest uppercase mb-2">{title}</div>
                  <div className="font-mono text-[11px] text-muted leading-relaxed">{desc}</div>
                </div>
              ))}
            </div>

            <SectionLabel>Status</SectionLabel>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'App',         status: 'Live',        color: 'accent' as const },
                { label: 'Auth',        status: 'Live',        color: 'accent' as const },
                { label: 'CI',          status: 'Passing',     color: 'green'  as const },
                { label: 'Stripe',      status: 'Backlog',     color: 'default' as const },
                { label: 'Daily Cron',  status: 'Backlog',     color: 'default' as const },
                { label: 'Daily Digest',status: 'Backlog',     color: 'default' as const },
                { label: 'Multi-user',  status: 'Beta',        color: 'blue'   as const },
                { label: 'Weekly Scan', status: 'Scheduled',   color: 'green'  as const },
              ].map(({ label, status, color }) => (
                <div key={label} className="bg-card border border-border rounded-xl p-4 flex items-center justify-between">
                  <span className="font-mono text-[11px] text-muted">{label}</span>
                  <Tag color={color}>{status}</Tag>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ════ FEATURES ════ */}
        {section === 'features' && (
          <div>
            <div className="mb-8">
              <div className="font-mono text-[10px] text-accent tracking-widest uppercase mb-2">Features</div>
              <h1 className="font-serif text-3xl font-light text-ink mb-2">Core functionality</h1>
              <p className="font-mono text-xs text-muted">Each module, what it does, and the key design decisions.</p>
            </div>

            <SectionLabel>Scraping layer</SectionLabel>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <FeatureCard icon="🔍" title="Multi-source scraper"
                desc="Scrapes LinkedIn (HTML + guest API enrichment), RemoteOK, Remotive, Jobicy, and We Work Remotely. Jobicy uses dynamic tag derivation from target roles — a lawyer gets legal/consulting tags, a nurse gets healthcare. LinkedIn descriptions are fetched before scoring so Claude has full context."
                tags={['linkedin', 'remoteok', 'remotive', 'jobicy', 'wwr']} />
              <FeatureCard icon="🔄" title="Role-aware deduplication"
                desc="IDs are MD5(url)[:8] + MD5(user_id)[:8] — same URL maps to a unique row per user without partitioned tables. Cross-source duplicates collapsed by (title, company) in Python. Role filter uses 60% keyword overlap so 'Registered Nurse ICU' matches 'ICU Registered Nurse'."
                tags={['md5 scoping', 'cross-source dedup', 'keyword overlap']} />
              <FeatureCard icon="📅" title="LinkedIn enrichment"
                desc="After dedup, LinkedIn jobs (no descriptions from the search page) are enriched via the guest jobs API. Extracts full description, company, salary, and posted date from 'X days ago' text. Already-enriched jobs are skipped to prevent double HTTP fetches."
                tags={['guest api', 'posted_at', 'salary extraction']} />
              <FeatureCard icon="📡" title="Event scraping"
                desc="Meetup (RSS by city group), Luma (city page __NEXT_DATA__ JSON), and Eventbrite (ld+json structured data). Virtual events filtered. Past events auto-pruned on page load. Cross-project RLS handled with service_role key since auth runs on a different Supabase project."
                tags={['meetup', 'luma', 'eventbrite', 'service_role']} />
            </div>

            <SectionLabel>AI scoring layer</SectionLabel>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <FeatureCard icon="🤖" title="Two-pass scoring"
                desc="Pass 1: cheap heuristic pre-filter using skills extracted from the user's resume (not hardcoded vocab). Pass 2: Claude Sonnet scores 1–10 against the full resume. In hybrid mode, only jobs scoring ≥6 on cheap reach Claude. Reduces cost ~60% with minimal quality loss."
                tags={['claude-sonnet-4-6', 'hybrid mode', 'skill extraction']} />
              <FeatureCard icon="✍️" title="Cover letter generation"
                desc="Generated for jobs scoring 8+. Prompt enforces: body only (no header block), first person, specific achievements with numbers, forward-looking close. 900 token budget. System prompt caches the resume via prompt caching to reduce token cost across a batch."
                tags={['prompt caching', '900 tokens', 'skill-first']} />
              <FeatureCard icon="🧠" title="Personalization engine"
                desc="Learns from apply/skip signals. Positive: company bonus, good source bonus, title token match. Negative: company penalty, neg title token penalty. Min 3 occurrences before a token becomes negative. Target role keywords are protected — 'genai' can't become a negative signal."
                tags={['event tracking', 'token protection', 'personalization']} />
              <FeatureCard icon="📊" title="Event relevance scoring"
                desc="Heuristic scoring against resume skills. 18 domain categories covering all professions — legal, healthcare, sales, marketing, HR, finance, engineering, and tech. Score 4 base + domain hits (capped at 4) + skill overlap + professional signals − beginner event penalty."
                tags={['18 domains', 'multi-profession', 'heuristic']} />
            </div>

            <SectionLabel>Platform layer</SectionLabel>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FeatureCard icon="🔐" title="Auth & multi-user isolation"
                desc="Supabase Auth (email/password + OTP magic link). User IDs scoped via MD5 hashing — same job URL creates separate rows per user. Session persistence restores resume and target roles on login. Auth wall enforced before any data access."
                tags={['supabase auth', 'otp', 'row isolation']} />
              <FeatureCard icon="🌐" title="Multi-profession support"
                desc="EXCLUDE_KEYWORDS slimmed to universal terms only. Skill vocab covers 15+ professions. Jobicy and WWR derive queries dynamically from user target roles. A lawyer gets legal tags; a designer gets design feeds. Skills detected from resume shown as chips in Setup."
                tags={['dynamic tags', 'skill chips', 'any profession']} />
            </div>
          </div>
        )}

        {/* ════ TECH STACK ════ */}
        {section === 'stack' && (
          <div>
            <div className="mb-8">
              <div className="font-mono text-[10px] text-accent tracking-widest uppercase mb-2">Tech Stack</div>
              <h1 className="font-serif text-3xl font-light text-ink mb-2">Architecture & dependencies</h1>
              <p className="font-mono text-xs text-muted">Every layer of the stack, what it does, and why.</p>
            </div>

            <SectionLabel>Application</SectionLabel>
            <div className="bg-card border border-border rounded-xl divide-y divide-border mb-8">
              <StackRow layer="Frontend"  tech={['Streamlit 1.51', 'Python 3.13']}              note="Single-file UI (ui_v2.py). Custom CSS dark theme matching techturi brand." />
              <StackRow layer="AI"        tech={['Claude Sonnet 4.6', 'Anthropic SDK']}         note="Job scoring, cover letters, role suggestion. Haiku for batch event scoring." />
              <StackRow layer="Database"  tech={['Supabase (PostgreSQL)', 'supabase-py 2.4']}   note="job_applications, networking_events, user_sessions, application_events." />
              <StackRow layer="Auth"      tech={['Supabase Auth', 'Email/Password', 'OTP']}     note="Magic link + password login. Session restored from Supabase on each load." />
              <StackRow layer="Scraping"  tech={['requests', 'feedparser', 'BeautifulSoup']}    note="HTML parsing, RSS feeds, JSON-LD extraction. No headless browser needed." />
              <StackRow layer="Deploy"    tech={['Streamlit Cloud', 'Auto-deploy on push']}     note="Secrets in Streamlit Cloud dashboard. Redeploys from main branch in ~2min." />
            </div>

            <SectionLabel>Data sources</SectionLabel>
            <div className="bg-card border border-border rounded-xl divide-y divide-border mb-8">
              <StackRow layer="LinkedIn"   tech={['Public HTML search', 'Jobs Guest API']}    note="Titles + companies from search HTML. Full descriptions from /jobs-guest/ API." />
              <StackRow layer="RemoteOK"   tech={['REST API (free)']}                          note="tag-based queries, salary data, no auth. Tags derived from target roles." />
              <StackRow layer="Remotive"   tech={['REST API (free)']}                          note="Full job descriptions, remote-first roles." />
              <StackRow layer="Jobicy"     tech={['REST API (free)']}                          note="Dynamic tags from user roles. 13 profession categories mapped." />
              <StackRow layer="WWR"        tech={['RSS feeds']}                                note="5 live category feeds. Feed selection dynamic from target roles." />
              <StackRow layer="Events"     tech={['Meetup RSS', 'Luma JSON', 'Eventbrite LD']} note="3 sources, city-slug normalised, past events auto-pruned." />
            </div>

            <SectionLabel>Infra & tooling</SectionLabel>
            <div className="bg-card border border-border rounded-xl divide-y divide-border">
              <StackRow layer="CI/CD"      tech={['GitHub Actions']}    note="5 health checks on every push. ~37s runtime. No secrets needed." />
              <StackRow layer="Scanner"    tech={['Claude Code Remote']} note="Weekly remote agent (Mondays 9am CT) scanning for regressions." />
              <StackRow layer="Overview"   tech={['Next.js 14', 'Vercel', 'Recharts', 'Tailwind']} note="This page. Live Supabase pull, deployed on Vercel." />
              <StackRow layer="MCP"        tech={['mcp_server.py']}     note="Exposes pipeline as MCP tool so Claude can orchestrate via natural language." />
            </div>
          </div>
        )}

        {/* ════ PIPELINE ════ */}
        {section === 'pipeline' && (
          <div>
            <div className="mb-8">
              <div className="font-mono text-[10px] text-accent tracking-widest uppercase mb-2">Pipeline</div>
              <h1 className="font-serif text-3xl font-light text-ink mb-2">How a job goes from URL to queue</h1>
              <p className="font-mono text-xs text-muted">End-to-end flow from raw scrape to review queue.</p>
            </div>

            <SectionLabel>Job pipeline</SectionLabel>
            <div className="space-y-2 mb-10">
              {[
                { step: '01', label: 'Scrape',         desc: 'scrape_all() — 5 sources in parallel. Role filter removes off-target titles using 60% keyword overlap.',            tag: 'scrapers/' },
                { step: '02', label: 'Dedup',           desc: 'get_seen_ids() returns all job IDs for the user. New jobs only continue. Scoped IDs prevent cross-user collisions.', tag: 'tracker.py' },
                { step: '03', label: 'Beta cap',        desc: 'If >50 new jobs, cheap-score all, keep top 50 by cheap score, reset scores. Prevents runaway API costs.',           tag: 'ui_v2.py' },
                { step: '04', label: 'Enrich',          desc: 'LinkedIn jobs without descriptions are fetched via guest API (title, company, salary, posted_at, description).',   tag: 'fetcher.py' },
                { step: '05', label: 'Pass 1 — Cheap',  desc: 'Resume skills extracted dynamically. Job skills matched. Title/role/location/salary checked. Score 1–10.',         tag: 'agent.py' },
                { step: '06', label: 'Pass 2 — Claude', desc: 'Jobs scoring ≥5 sent to Claude Sonnet with full resume + job description. Returns score, reason, seniority.',     tag: 'agent.py' },
                { step: '07', label: 'Cover letters',   desc: 'Jobs scoring 8+ get a cover letter generated by Claude Sonnet. Cached system prompt reduces token cost.',          tag: 'agent.py' },
                { step: '08', label: 'Upsert',          desc: 'upsert_jobs() saves all scored jobs to Supabase with on_conflict="id". Salary ranges, seniority, score saved.',   tag: 'tracker.py' },
                { step: '09', label: 'Personalise',     desc: 'get_personalization_context() reads event signals. Rank queue adds personal bonus (company/token/source weights).', tag: 'tracker.py' },
                { step: '10', label: 'Review',          desc: 'Jobs scoring ≥7 appear in Review Queue sorted by effective score. User applies, skips, or marks applied.',         tag: 'ui_v2.py' },
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
            <div className="flex flex-wrap items-center gap-2 font-mono text-[11px]">
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
          </div>
        )}

        {/* ════ LIVE DATA ════ */}
        {section === 'metrics' && (
          <div>
            <div className="mb-8">
              <div className="font-mono text-[10px] text-accent tracking-widest uppercase mb-2">Live Data</div>
              <h1 className="font-serif text-3xl font-light text-ink mb-2">Pipeline metrics</h1>
              <p className="font-mono text-xs text-muted">Live from Supabase — refreshes on page load.</p>
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
                  <MetricCard label="Interviews"      value={stats.interviews}                                                    />
                  <MetricCard label="With Salary"     value={stats.withSalary} sub={`${Math.round(stats.withSalary/Math.max(stats.total,1)*100)}% coverage`} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                  <div className="bg-card border border-border rounded-xl p-5">
                    <SectionLabel>Score distribution</SectionLabel>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie data={scoreData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3}>
                          {scoreData.map(e => <Cell key={e.name} fill={SCORE_COLORS[e.name] ?? '#6B6B65'} />)}
                        </Pie>
                        <Tooltip contentStyle={{ background:'#1C1C18', border:'1px solid #2A2A25', borderRadius:8, fontFamily:'JetBrains Mono', fontSize:11 }} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex gap-3 justify-center mt-2">
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
