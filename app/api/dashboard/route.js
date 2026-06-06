import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

function loadSeed() {
  const p = path.join(process.cwd(), 'data', 'seed-internships.json');
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

export async function GET() {
  try {
    const rows = loadSeed().filter(r => r.status === 'approved');

    const paid = rows.filter(r => {
      const ps = (r.paidStatus || '').toLowerCase();
      return ps.includes('paid') && !ps.includes('unpaid');
    });
    const remote  = rows.filter(r => (r.mode || '').toLowerCase().includes('remote'));
    const onSite  = rows.filter(r => { const m = (r.mode||'').toLowerCase(); return m.includes('on-site')||m.includes('onsite'); });
    const hybrid  = rows.filter(r => (r.mode || '').toLowerCase().includes('hybrid'));
    const companies = new Set(rows.map(r => r.companyName).filter(Boolean));

    const stats = {
      totalInternships:  rows.length,
      paidInternships:   paid.length,
      remoteInternships: remote.length,
      onSiteInternships: onSite.length,
      hybridInternships: hybrid.length,
      uniqueCompanies:   companies.size,
      totalStudents:     0,
      totalApplications: 0,
    };

    // Top fields
    const fieldCounts = {};
    for (const r of rows) {
      if (r.field) fieldCounts[r.field] = (fieldCounts[r.field] || 0) + 1;
    }
    const topFields = Object.entries(fieldCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .map(([field, count]) => ({ field, count }));

    // Top skills
    const skillCounts = {};
    for (const r of rows) {
      for (const s of String(r.skills || '').split(',')) {
        const sk = s.trim();
        if (sk && sk.length > 1) skillCounts[sk] = (skillCounts[sk] || 0) + 1;
      }
    }
    const topSkills = Object.entries(skillCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 25)
      .map(([skill, count]) => ({ skill, count }));

    // Featured — first 6
    const featured = rows.slice(0, 6).map((r, i) => ({ ...r, id: i + 1 }));

    // Try to get real student/application counts from db
    try {
      const { getDb } = await import('@/lib/db');
      const db = await getDb();
      stats.totalStudents     = db.prepare("SELECT COUNT(*) AS c FROM users WHERE role='student'").get()?.c || 0;
      stats.totalApplications = db.prepare('SELECT COUNT(*) AS c FROM applications').get()?.c || 0;
    } catch { /* db unavailable on cold start — fine */ }

    return NextResponse.json({ stats, featured, topFields, topSkills });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
