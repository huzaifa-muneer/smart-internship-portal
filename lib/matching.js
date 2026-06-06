export function tokens(v) {
  return String(v || '').toLowerCase().split(/[,|/\s]+/).map(s => s.trim()).filter(Boolean);
}

const FIELD_GROUPS = [
  ['software engineering','software development','full stack development','backend development','frontend development'],
  ['artificial intelligence','machine learning','deep learning','ai','ml'],
  ['data science','data analytics','data analysis','big data','business intelligence'],
  ['web development','frontend development','full stack development'],
  ['cyber security','information security','network security'],
  ['cloud computing','devops','cloud'],
  ['app development','mobile development','android development','ios development'],
  ['ui/ux design','graphic designing','product design'],
  ['digital marketing','social media marketing','content marketing','seo'],
];

function fieldGroupScore(a, b) {
  const al = a.toLowerCase();
  const bl = b.toLowerCase();
  if (al === bl) return 1;
  if (al.includes(bl) || bl.includes(al)) return 0.8;
  for (const group of FIELD_GROUPS) {
    const inA = group.some(g => al.includes(g) || g.includes(al));
    const inB = group.some(g => bl.includes(g) || g.includes(bl));
    if (inA && inB) return 0.6;
  }
  return 0;
}

export function matchScore(profile, internship) {
  if (!profile || !internship) return 0;
  let score = 0;

  // Field match up to 35pts
  const fieldA = String(profile.field || '').trim();
  const fieldB = String(internship.field || '').trim();
  if (fieldA && fieldB) score += Math.round(fieldGroupScore(fieldA, fieldB) * 35);

  // Skills overlap up to 30pts
  const profileSkills = new Set(tokens(profile.skills));
  const internSkills = tokens(internship.skills);
  if (internSkills.length && profileSkills.size) {
    const overlap = internSkills.filter(s => profileSkills.has(s)).length;
    score += Math.min(30, Math.round((overlap / Math.max(1, internSkills.length)) * 30));
  }

  // City/remote up to 15pts
  const city = String(profile.city || '').toLowerCase().trim();
  const iCity = String(internship.city || '').toLowerCase().trim();
  const iMode = String(internship.mode || '').toLowerCase();
  if (city && (city === iCity || iMode.includes('remote'))) score += 15;
  else if (iMode.includes('remote')) score += 8;

  // Mode preference up to 10pts
  const pref = String(profile.modePreference || profile.mode_preference || '').toLowerCase().split(/[\s,]/)[0];
  if (pref && iMode.includes(pref)) score += 10;

  // Level match up to 10pts
  const level = String(profile.level || '').toLowerCase();
  const iLevel = String(internship.level || '').toLowerCase();
  if (!level || !iLevel || iLevel.includes(level) || level.includes(iLevel) || iLevel.includes('entry') || iLevel.includes('beginner')) score += 10;

  return Math.min(100, score);
}

export function matchLabel(score) {
  if (score >= 80) return { label: 'Excellent Match', color: 'badge-green' };
  if (score >= 60) return { label: 'Good Match', color: 'badge-blue' };
  if (score >= 40) return { label: 'Fair Match', color: 'badge-amber' };
  return { label: 'Low Match', color: 'badge-slate' };
}
