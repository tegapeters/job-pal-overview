import { NextResponse } from 'next/server'

export const revalidate = 3600  // re-fetch GitHub every hour

const RAW_URL = 'https://raw.githubusercontent.com/tegapeters/job-bot/main/BUILDPLAN.md'

export type GradeRow = { area: string; grade: string; note: string }
export type BuildPlan = {
  grades: GradeRow[]
  overall: string          // e.g. "B (79/100)"
  overallScore: number     // e.g. 79
  currentPhase: string     // e.g. "Phase 1 — TF-IDF Embedding"
  lastUpdated: string      // value from "Last updated:" line
  fetchedAt: string        // ISO timestamp of this fetch
}

function parseGrades(md: string): GradeRow[] {
  const rows: GradeRow[] = []
  let inGradeTable = false
  for (const line of md.split('\n')) {
    if (/## current grades/i.test(line)) { inGradeTable = true; continue }
    if (inGradeTable && line.startsWith('##')) break  // next section
    if (!inGradeTable) continue
    if (!line.startsWith('|') || /^[|\s\-:]+$/.test(line)) continue
    const cols = line.split('|').map(c => c.trim()).filter(Boolean)
    if (cols.length >= 3 && cols[0] !== 'Area') {
      rows.push({ area: cols[0], grade: cols[1], note: cols[2] })
    }
  }
  return rows
}

function parseOverall(md: string): { label: string; score: number } {
  const m = md.match(/\*\*Overall:\s*([A-Z][+-]?)\s*\((\d+)\/100\)\*\*/)
  return m ? { label: `${m[1]} (${m[2]}/100)`, score: parseInt(m[2]) } : { label: 'B (79/100)', score: 79 }
}

function parseCurrentPhase(md: string): string {
  const m = md.match(/### (Phase \d[^\n]*?)\s*\(NOW.*?✅\)/)
  return m ? m[1] : 'Phase 1'
}

function parseLastUpdated(md: string): string {
  const m = md.match(/\*\*Last updated:\*\*\s*(.+)/)
  return m ? m[1].trim() : ''
}

export async function GET() {
  try {
    const res = await fetch(RAW_URL, { next: { revalidate: 3600 } })
    if (!res.ok) throw new Error(`GitHub ${res.status}`)
    const md = await res.text()

    const { label, score } = parseOverall(md)
    const plan: BuildPlan = {
      grades:       parseGrades(md),
      overall:      label,
      overallScore: score,
      currentPhase: parseCurrentPhase(md),
      lastUpdated:  parseLastUpdated(md),
      fetchedAt:    new Date().toISOString(),
    }
    return NextResponse.json(plan)
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
