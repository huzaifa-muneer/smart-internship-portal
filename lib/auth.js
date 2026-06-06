import jwt from 'jsonwebtoken';

export const secret = process.env.JWT_SECRET || 'dev-secret-change-me';

// Sign a token that embeds the full profile — no DB lookup needed on verify
export function signUser(user) {
  return jwt.sign({
    id: user.id, role: user.role, email: user.email,
    name: user.name || '',
    university: user.university || '',
    degree: user.degree || '',
    semester: user.semester || '',
    field: user.field || '',
    city: user.city || '',
    mode_preference: user.mode_preference || user.modePreference || '',
    level: user.level || '',
    skills: user.skills || '',
    company_name: user.company_name || user.companyName || '',
    hr_name: user.hr_name || user.hrName || '',
    website: user.website || '',
    linkedin: user.linkedin || '',
    contact: user.contact || '',
    status: user.status || 'active',
  }, secret, { expiresIn: '7d' });
}

// Verify token and return user — never needs DB
export async function requireUser(req, roles = []) {
  const auth = req.headers.get('authorization') || '';
  const token = auth.replace('Bearer ', '');
  if (!token) throw new Error('Unauthorized');
  const payload = jwt.verify(token, secret);
  if (roles.length && !roles.includes(payload.role)) throw new Error('Forbidden');
  // Token already contains full profile — return directly
  return payload;
}

export function safeUser(u) {
  return {
    id: u.id, role: u.role, email: u.email, name: u.name,
    university: u.university, degree: u.degree, semester: u.semester,
    field: u.field, city: u.city,
    modePreference: u.mode_preference || u.modePreference,
    level: u.level, skills: u.skills,
    companyName: u.company_name || u.companyName,
    hrName: u.hr_name || u.hrName,
    website: u.website, linkedin: u.linkedin,
    contact: u.contact, status: u.status,
  };
}
