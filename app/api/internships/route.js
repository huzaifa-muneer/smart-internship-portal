import { NextResponse } from 'next/server';
import { getDb, mapInternship } from '@/lib/db';
import { requireUser } from '@/lib/auth';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

function loadSeed() {
  const p = path.join(process.cwd(), 'data', 'seed-internships.json');
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

export async function GET(req) {
  try {
    const url = new URL(req.url);
    const admin = url.searchParams.get('admin') === '1';
    const mine  = url.searchParams.get('mine')  === '1';
    const q     = (url.searchParams.get('q') || '').toLowerCase();
    const field = url.searchParams.get('field') || '';
    const mode  = url.searchParams.get('mode')  || '';
    const paid  = url.searchParams.get('paid')  || '';
    const country = url.searchParams.get('country') || '';

    // Admin/mine views require DB
    if (admin || mine) {
      const db = await getDb();
      let current = null;
      if (admin) current = await requireUser(req, ['admin']);
      if (mine)  current = await requireUser(req, ['company', 'admin']);
      let where = admin ? '1=1' : 'submitted_by=?';
      const params = [];
      if (mine) params.push(current.id);
      if (q)     { where += ' AND lower(title||company_name||skills||field||city) LIKE ?'; params.push(`%${q}%`); }
      if (field) { where += ' AND field=?';   params.push(field); }
      if (mode)  { where += ' AND mode=?';    params.push(mode); }
      const rows = db.prepare(`SELECT * FROM internships WHERE ${where} ORDER BY featured DESC, id DESC LIMIT 500`).all(...params).map(mapInternship);
      return NextResponse.json({ internships: rows });
    }

    // Public view — serve from JSON (always works on Vercel)
    let rows = loadSeed().filter(r => r.status === 'approved');

    if (q)    rows = rows.filter(r => `${r.title} ${r.companyName} ${r.skills} ${r.field} ${r.city}`.toLowerCase().includes(q));
    if (field) rows = rows.filter(r => r.field === field);
    if (mode)  rows = rows.filter(r => r.mode  === mode);
    if (paid === 'Paid')   rows = rows.filter(r => (r.paidStatus||'').toLowerCase().includes('paid') && !(r.paidStatus||'').toLowerCase().includes('unpaid'));
    if (paid === 'Unpaid') rows = rows.filter(r => (r.paidStatus||'').toLowerCase().includes('unpaid'));
    if (country === 'Pakistan')      rows = rows.filter(r => r.country === 'Pakistan');
    if (country === 'International') rows = rows.filter(r => r.country !== 'Pakistan');

    const internships = rows.slice(0, 500).map((r, i) => ({ ...r, id: r.id || i + 1 }));
    return NextResponse.json({ internships });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const user = await requireUser(req, ['company', 'admin']);
    const b = await req.json();
    const status = user.role === 'admin' ? (b.status || 'approved') : 'pending';
    const db = await getDb();
    const info = db.prepare(
      `INSERT INTO internships(title,company_name,field,skills,city,country,mode,paid_status,stipend,deadline,apply_link,description,status,verified_status,application_status,submitted_by,featured,level)
       VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
    ).run(b.title, b.companyName || user.company_name, b.field, b.skills, b.city, b.country || 'Pakistan', b.mode, b.paidStatus, b.stipend || '', b.deadline, b.applyLink, b.description || '', status, status === 'approved' ? 'Verified' : 'Pending', 'Open', user.id, b.featured ? 1 : 0, b.level || 'Entry Level');
    return NextResponse.json({ internship: mapInternship(db.prepare('SELECT * FROM internships WHERE id=?').get(info.lastInsertRowid)) });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 403 });
  }
}
