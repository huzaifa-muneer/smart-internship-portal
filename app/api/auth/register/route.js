import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { signUser, safeUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const b = await req.json();
    if (!['student', 'company'].includes(b.role))
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    if (!b.email || !b.password)
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 });

    // Build full user profile object from submitted form data
    const profileUser = {
      id: Date.now(), // unique enough for session use
      role: b.role,
      email: b.email.toLowerCase().trim(),
      name: b.name || b.hrName || b.companyName || '',
      university: b.university || '',
      degree: b.degree || '',
      semester: b.semester || '',
      field: b.field || '',
      city: b.city || '',
      mode_preference: b.modePreference || 'Hybrid',
      level: b.level || 'Entry Level',
      skills: b.skills || '',
      company_name: b.companyName || '',
      hr_name: b.hrName || '',
      website: b.website || '',
      linkedin: b.linkedin || '',
      contact: b.contact || '',
      status: b.role === 'company' ? 'pending' : 'active',
    };

    // Try to save to database (works locally, may fail on Vercel)
    try {
      const { getDb } = await import('@/lib/db');
      const db = await getDb();
      const info = db.prepare(
        `INSERT INTO users(role,email,password_hash,name,university,degree,semester,field,city,mode_preference,level,skills,company_name,hr_name,website,linkedin,contact,status)
         VALUES(@role,@email,@hash,@name,@university,@degree,@semester,@field,@city,@modePreference,@level,@skills,@companyName,@hrName,@website,@linkedin,@contact,@status)`
      ).run({
        role: profileUser.role, email: profileUser.email,
        hash: bcrypt.hashSync(b.password, 10),
        name: profileUser.name, university: profileUser.university,
        degree: profileUser.degree, semester: profileUser.semester,
        field: profileUser.field, city: profileUser.city,
        modePreference: profileUser.mode_preference, level: profileUser.level,
        skills: profileUser.skills, companyName: profileUser.company_name,
        hrName: profileUser.hr_name, website: profileUser.website,
        linkedin: profileUser.linkedin, contact: profileUser.contact,
        status: profileUser.status,
      });
      profileUser.id = info.lastInsertRowid;
    } catch {
      // DB unavailable (Vercel cold start) — use stateless token with profile embedded
    }

    // Sign a token that carries the full profile — works with or without DB
    const token = signUser(profileUser);
    return NextResponse.json({ user: safeUser(profileUser), token });
  } catch (e) {
    return NextResponse.json({
      error: e.message.includes('UNIQUE') ? 'Email already registered' : e.message
    }, { status: 400 });
  }
}
