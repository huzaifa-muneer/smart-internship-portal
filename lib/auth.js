import jwt from 'jsonwebtoken';
import { getDb } from './db';

export const secret = process.env.JWT_SECRET || 'dev-secret-change-me';

export function signUser(user) {
  return jwt.sign({ id: user.id, role: user.role, email: user.email }, secret, { expiresIn: '7d' });
}

export async function requireUser(req, roles = []) {
  const auth = req.headers.get('authorization') || '';
  const token = auth.replace('Bearer ', '');
  if (!token) throw new Error('Unauthorized');
  const payload = jwt.verify(token, secret);
  if (roles.length && !roles.includes(payload.role)) throw new Error('Forbidden');
  const db = await getDb();
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(payload.id);
  if (!user) throw new Error('Unauthorized');
  return user;
}

export function safeUser(u) {
  return {
    id: u.id, role: u.role, email: u.email, name: u.name,
    university: u.university, degree: u.degree, semester: u.semester,
    field: u.field, city: u.city, modePreference: u.mode_preference,
    level: u.level, skills: u.skills, companyName: u.company_name,
    hrName: u.hr_name, website: u.website, linkedin: u.linkedin,
    contact: u.contact, status: u.status,
  };
}
