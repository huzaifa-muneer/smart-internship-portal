import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { signUser, safeUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const b = await req.json();
    const email = String(b.email || '').toLowerCase().trim();
    const password = String(b.password || '');
    const role = String(b.role || '');

    // Admin: authenticate directly from env vars — no database needed
    if (role === 'admin') {
      const adminEmail = (process.env.ADMIN_EMAIL || 'admin@siportal.local').toLowerCase();
      const adminPass  =  process.env.ADMIN_PASSWORD || 'admin12345';
      if (email !== adminEmail || password !== adminPass) {
        return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
      }
      const adminUser = { id: 0, role: 'admin', email: adminEmail, name: 'System Admin', status: 'active' };
      return NextResponse.json({ user: adminUser, token: signUser(adminUser) });
    }

    // Student / Company: use database
    const { getDb } = await import('@/lib/db');
    const db = await getDb();
    const user = db.prepare('SELECT * FROM users WHERE email = ? AND role = ?').get(email, role);
    if (!user || !bcrypt.compareSync(password, user.password_hash)) {
      return NextResponse.json({ error: 'Invalid email, password, or role' }, { status: 401 });
    }
    return NextResponse.json({ user: safeUser(user), token: signUser(user) });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
