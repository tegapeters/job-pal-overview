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

export async function getStats() {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('job_applications')
    .select('source, status, score, salary_range, created_at')
    .order('created_at', { ascending: false })

  if (error || !data) return null

  const total      = data.length
  const queue      = data.filter(r => r.status === 'new' && (r.score ?? 0) >= 7).length
  const applied    = data.filter(r => r.status === 'applied').length
  const interviews = data.filter(r => r.status === 'interview').length
  const withSalary = data.filter(r => r.salary_range).length

  // Score distribution
  const scoreBuckets: Record<string, number> = { '1-3': 0, '4-6': 0, '7-8': 0, '9-10': 0 }
  data.forEach(r => {
    const s = r.score ?? 0
    if (s <= 3) scoreBuckets['1-3']++
    else if (s <= 6) scoreBuckets['4-6']++
    else if (s <= 8) scoreBuckets['7-8']++
    else scoreBuckets['9-10']++
  })

  // Source breakdown
  const sourceMap: Record<string, number> = {}
  data.forEach(r => {
    const src = r.source || 'unknown'
    sourceMap[src] = (sourceMap[src] ?? 0) + 1
  })

  // Pipeline
  const pipeline: Record<string, number> = {}
  data.forEach(r => {
    const s = r.status || 'unknown'
    pipeline[s] = (pipeline[s] ?? 0) + 1
  })

  // Scrape trend (last 14 days, by day)
  const trend: Record<string, number> = {}
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - 13)
  data.forEach(r => {
    const d = r.created_at?.slice(0, 10)
    if (d && new Date(d) >= cutoff) {
      trend[d] = (trend[d] ?? 0) + 1
    }
  })

  return { total, queue, applied, interviews, withSalary, scoreBuckets, sourceMap, pipeline, trend }
}
