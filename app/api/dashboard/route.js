import { NextResponse } from 'next/server';
import { getDb, mapInternship } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const db = await getDb();
  const one = q => db.prepare(q).get()?.c || 0;

  const stats = {
    totalInternships:  one("SELECT COUNT(*) c FROM internships WHERE status='approved'"),
    paidInternships:   one("SELECT COUNT(*) c FROM internships WHERE status='approved' AND lower(paid_status) LIKE '%paid%' AND lower(paid_status) NOT LIKE '%unpaid%'"),
    remoteInternships: one("SELECT COUNT(*) c FROM internships WHERE status='approved' AND lower(mode) LIKE '%remote%'"),
    onSiteInternships: one("SELECT COUNT(*) c FROM internships WHERE status='approved' AND (lower(mode) LIKE '%on-site%' OR lower(mode) LIKE '%onsite%')"),
    hybridInternships: one("SELECT COUNT(*) c FROM internships WHERE status='approved' AND lower(mode) LIKE '%hybrid%'"),
    uniqueCompanies:   one("SELECT COUNT(DISTINCT company_name) c FROM internships WHERE status='approved'"),
    totalStudents:     one("SELECT COUNT(*) c FROM users WHERE role='student'"),
    totalApplications: one("SELECT COUNT(*) c FROM applications"),
  };

  const topFields = db.prepare(
    "SELECT field, COUNT(*) c FROM internships WHERE status='approved' AND field IS NOT NULL AND field != '' GROUP BY field ORDER BY c DESC LIMIT 15"
  ).all().map(r => ({ field: r.field, count: r.c }));

  const allSkillRows = db.prepare(
    "SELECT skills FROM internships WHERE status='approved' AND skills IS NOT NULL AND skills != ''"
  ).all();
  const skillCounts = {};
  for (const row of allSkillRows) {
    for (const s of String(row.skills || '').split(',')) {
      const sk = s.trim();
      if (sk && sk.length > 1) skillCounts[sk] = (skillCounts[sk] || 0) + 1;
    }
  }
  const topSkills = Object.entries(skillCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 25)
    .map(([skill, count]) => ({ skill, count }));

  const featured = db.prepare(
    "SELECT * FROM internships WHERE status='approved' ORDER BY featured DESC, id DESC LIMIT 6"
  ).all().map(mapInternship);

  return NextResponse.json({ stats, featured, topFields, topSkills });
}
