import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

export const supabase = url && key ? createClient(url, key) : null

export interface JobRow {
  id: string
  source: string
  title: string
  company: string
  status: string
  score: number | null
  salary_range: string | null
  created_at: string
}

export interface RawRow {
  source: string
  status: string
  score: number | null
  salary_range: string | null
  created_at: string
  scored_by?: string | null
}

function buildScoreBuckets(rows: RawRow[]) {
  const b: Record<string, number> = { '1-3': 0, '4-6': 0, '7-8': 0, '9-10': 0 }
  rows.forEach(r => {
    const s = r.score ?? 0
    if (s <= 3) b['1-3']++
    else if (s <= 6) b['4-6']++
    else if (s <= 8) b['7-8']++
    else b['9-10']++
  })
  return b
}

export async function getStats() {
  if (!supabase) return null

  // Try with scored_by; fall back if PostgREST schema cache hasn't caught up yet
  let rows: RawRow[]
  const res = await supabase
    .from('job_applications')
    .select('source, status, score, salary_range, created_at, scored_by')
    .order('created_at', { ascending: false })

  if (res.error?.message?.includes('scored_by')) {
    const fallback = await supabase
      .from('job_applications')
      .select('source, status, score, salary_range, created_at')
      .order('created_at', { ascending: false })
    if (fallback.error || !fallback.data) return null
    rows = fallback.data as RawRow[]
  } else if (res.error || !res.data) {
    return null
  } else {
    rows = res.data as RawRow[]
  }

  const total      = rows.length
  const queue      = rows.filter(r => r.status === 'new' && (r.score ?? 0) >= 7).length
  const applied    = rows.filter(r => r.status === 'applied').length
  const interviews = rows.filter(r => r.status === 'interview').length
  const withSalary = rows.filter(r => r.salary_range).length

  const scoreBuckets = buildScoreBuckets(rows)

  const sourceMap: Record<string, number> = {}
  rows.forEach(r => {
    const src = r.source || 'unknown'
    sourceMap[src] = (sourceMap[src] ?? 0) + 1
  })

  const pipeline: Record<string, number> = {}
  rows.forEach(r => {
    const s = r.status || 'unknown'
    pipeline[s] = (pipeline[s] ?? 0) + 1
  })

  const trend: Record<string, number> = {}
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - 13)
  rows.forEach(r => {
    const d = r.created_at?.slice(0, 10)
    if (d && new Date(d) >= cutoff) {
      trend[d] = (trend[d] ?? 0) + 1
    }
  })

  // Unique sources and models (for filter dropdowns)
  const sourceSet = new Set(rows.map(r => r.source || 'unknown'))
  const sources = Array.from(sourceSet).sort()
  const modelSet = new Set(rows.map(r => r.scored_by).filter(Boolean))
  const models = Array.from(modelSet) as string[]

  return { total, queue, applied, interviews, withSalary, scoreBuckets, sourceMap, pipeline, trend, rows, sources, models }
}

export { buildScoreBuckets }
