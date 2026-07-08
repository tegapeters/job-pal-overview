'use client'

import { useEffect, useState } from 'react'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line, Legend,
} from 'recharts'
import { getStats } from '@/lib/supabase'

const COLORS = ['#D4FF3A', '#4ADE80', '#60A5FA', '#F472B6', '#A78BFA', '#FB923C']
const SCORE_COLORS: Record<string, string> = {
  '9-10': '#D4FF3A',
  '7-8':  '#4ADE80',
  '4-6':  '#60A5FA',
  '1-3':  '#6B6B65',
}

function MetricCard({ label, value, sub, accent }: {
  label: string; value: string | number; sub?: string; accent?: boolean
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 flex flex-col gap-1">
      <span className="font-mono text-[10px] text-muted tracking-widest uppercase">{label}</span>
      <span className={`text-3xl font-bold ${accent ? 'text-accent' : 'text-ink'}`}>{value}</span>
      {sub && <span className="font-mono text-[11px] text-muted">{sub}</span>}
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-mono text-[10px] tracking-widest uppercase text-muted mb-3">{children}</h2>
  )
}

type Stats = Awaited<ReturnType<typeof getStats>>

export default function Overview() {
  const [stats, setStats] = useState<Stats>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getStats().then(s => { setStats(s); setLoading(false) })
  }, [])

  const scoreData = stats
    ? Object.entries(stats.scoreBuckets).map(([name, value]) => ({ name, value }))
    : []

  const sourceData = stats
    ? Object.entries(stats.sourceMap)
        .sort((a, b) => b[1] - a[1])
        .map(([name, value]) => ({ name, value }))
    : []

  const pipelineData = stats
    ? Object.entries(stats.pipeline)
        .filter(([s]) => !['new'].includes(s))
        .sort((a, b) => b[1] - a[1])
        .map(([name, value]) => ({ name, value }))
    : []

  const trendData = stats
    ? Object.entries(stats.trend)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, count]) => ({ date: date.slice(5), count }))
    : []

  return (
    <div className="flex min-h-screen">
      {/* ── Sidebar ── */}
      <aside className="w-52 shrink-0 bg-surface border-r border-border flex flex-col py-6 px-4 gap-1">
        <div className="mb-6 px-2">
          <div className="font-mono text-[10px] text-muted tracking-widest uppercase mb-1">techturi</div>
          <div className="font-serif text-lg text-ink">Job Pal</div>
          <div className="font-mono text-[10px] text-muted">AI Job Search</div>
        </div>

        <span className="font-mono text-[9px] text-muted tracking-widest uppercase px-2 mb-1">Main</span>
        <a href="#" className="flex items-center gap-2 px-3 py-2 rounded-lg bg-accent/10 text-accent font-mono text-xs">
          <span>◈</span> Overview
        </a>
        <a href="https://jobpal.streamlit.app" target="_blank" rel="noreferrer"
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-muted hover:text-ink hover:bg-card font-mono text-xs transition-colors">
          <span>⊞</span> Review Queue
        </a>
        <a href="https://jobpal.streamlit.app" target="_blank" rel="noreferrer"
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-muted hover:text-ink hover:bg-card font-mono text-xs transition-colors">
          <span>◎</span> Applications
        </a>

        <span className="font-mono text-[9px] text-muted tracking-widest uppercase px-2 mt-4 mb-1">Tools</span>
        <a href="https://jobpal.streamlit.app" target="_blank" rel="noreferrer"
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-muted hover:text-ink hover:bg-card font-mono text-xs transition-colors">
          <span>▶</span> Run Pipeline
        </a>
        <a href="https://jobpal.streamlit.app" target="_blank" rel="noreferrer"
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-muted hover:text-ink hover:bg-card font-mono text-xs transition-colors">
          <span>📅</span> Events
        </a>

        <div className="mt-auto pt-6 border-t border-border px-2">
          <div className="font-mono text-[9px] text-muted tracking-widest uppercase">Live data</div>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            <span className="font-mono text-[10px] text-accent">Connected</span>
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="flex-1 overflow-auto p-8">
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-light text-ink mb-1">Overview</h1>
          <p className="font-mono text-xs text-muted">Live job pipeline analytics</p>
        </div>

        {loading ? (
          <div className="flex items-center gap-3 text-muted font-mono text-sm">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            Loading pipeline data…
          </div>
        ) : !stats ? (
          <div className="text-muted font-mono text-sm">Could not load data. Check Supabase connection.</div>
        ) : (
          <>
            {/* ── Metric cards ── */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
              <MetricCard label="Total Tracked"  value={stats.total}      />
              <MetricCard label="In Queue (7+)"  value={stats.queue}      accent />
              <MetricCard label="Applied"         value={stats.applied}    />
              <MetricCard label="Interviews"      value={stats.interviews} />
              <MetricCard label="With Salary"     value={`${stats.withSalary}`} sub={`${Math.round(stats.withSalary / Math.max(stats.total, 1) * 100)}% coverage`} />
            </div>

            {/* ── Row 1: Score distribution + Source breakdown ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
              <div className="bg-card border border-border rounded-xl p-5">
                <SectionLabel>Score Distribution</SectionLabel>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={scoreData} dataKey="value" nameKey="name"
                      cx="50%" cy="50%" innerRadius={60} outerRadius={90}
                      paddingAngle={3} label={({ name, value }) => `${name}: ${value}`}
                      labelLine={false}>
                      {scoreData.map(entry => (
                        <Cell key={entry.name} fill={SCORE_COLORS[entry.name] ?? '#6B6B65'} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: '#1C1C18', border: '1px solid #2A2A25', borderRadius: 8, fontFamily: 'JetBrains Mono', fontSize: 11 }}
                      labelStyle={{ color: '#F5F4EE' }}
                    />
                    <Legend
                      iconType="circle" iconSize={8}
                      formatter={(v) => <span style={{ fontSize: 11, fontFamily: 'JetBrains Mono', color: '#6B6B65' }}>{v}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-card border border-border rounded-xl p-5">
                <SectionLabel>Jobs by Source</SectionLabel>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={sourceData} layout="vertical" margin={{ left: 8, right: 16 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2A2A25" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 10, fontFamily: 'JetBrains Mono', fill: '#6B6B65' }} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fontFamily: 'JetBrains Mono', fill: '#6B6B65' }} axisLine={false} tickLine={false} width={72} />
                    <Tooltip
                      contentStyle={{ background: '#1C1C18', border: '1px solid #2A2A25', borderRadius: 8, fontFamily: 'JetBrains Mono', fontSize: 11 }}
                    />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                      {sourceData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* ── Row 2: Scrape trend + Application pipeline ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="bg-card border border-border rounded-xl p-5">
                <SectionLabel>Scrape Activity — Last 14 Days</SectionLabel>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={trendData} margin={{ right: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2A2A25" />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fontFamily: 'JetBrains Mono', fill: '#6B6B65' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fontFamily: 'JetBrains Mono', fill: '#6B6B65' }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ background: '#1C1C18', border: '1px solid #2A2A25', borderRadius: 8, fontFamily: 'JetBrains Mono', fontSize: 11 }}
                    />
                    <Line type="monotone" dataKey="count" stroke="#D4FF3A" strokeWidth={2} dot={{ fill: '#D4FF3A', r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-card border border-border rounded-xl p-5">
                <SectionLabel>Application Pipeline</SectionLabel>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={pipelineData} margin={{ left: 8, right: 16 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2A2A25" horizontal={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fontFamily: 'JetBrains Mono', fill: '#6B6B65' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fontFamily: 'JetBrains Mono', fill: '#6B6B65' }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ background: '#1C1C18', border: '1px solid #2A2A25', borderRadius: 8, fontFamily: 'JetBrains Mono', fontSize: 11 }}
                    />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {pipelineData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* ── Footer ── */}
            <div className="mt-8 pt-4 border-t border-border flex items-center justify-between">
              <span className="font-mono text-[10px] text-muted">
                techturi · Job Pal · Live pipeline data
              </span>
              <a href="https://jobpal.streamlit.app" target="_blank" rel="noreferrer"
                className="font-mono text-[10px] text-accent hover:underline">
                Open app →
              </a>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
