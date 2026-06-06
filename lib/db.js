import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

let _db = null;

async function initSqlJs() {
  const { default: init } = await import('sql.js');
  return init();
}

export async function getDb() {
  if (_db) return _db;

  const SQL = await initSqlJs();
  // Vercel & serverless: filesystem is read-only except /tmp
  const defaultPath = process.env.VERCEL
    ? '/tmp/portal.sqlite'
    : './data/portal.sqlite';
  const dbPath = process.env.DATABASE_PATH || defaultPath;
  const abs = path.isAbsolute(dbPath) ? dbPath : path.resolve(process.cwd(), dbPath);
  fs.mkdirSync(path.dirname(abs), { recursive: true });

  const raw = fs.existsSync(abs)
    ? new SQL.Database(fs.readFileSync(abs))
    : new SQL.Database();

  _db = makeWrapper(raw, abs);
  migrate(_db);
  seedIfEmpty(_db);
  persist(raw, abs);

  return _db;
}

function persist(raw, abs) {
  fs.writeFileSync(abs, Buffer.from(raw.export()));
}

function makeWrapper(raw, abs) {
  let timer;
  function save() {
    clearTimeout(timer);
    timer = setTimeout(() => fs.writeFileSync(abs, Buffer.from(raw.export())), 50);
  }

  function namedParams(obj) {
    if (!obj || Array.isArray(obj)) return obj || [];
    const out = {};
    for (const [k, v] of Object.entries(obj)) {
      out[k.startsWith('@') || k.startsWith(':') || k.startsWith('$') ? k : `@${k}`] = v;
    }
    return out;
  }

  return {
    exec(sql) { raw.run(sql); save(); },

    prepare(sql) {
      return {
        run(...args) {
          const params = args.length === 1 && typeof args[0] === 'object' && !Array.isArray(args[0])
            ? namedParams(args[0]) : args;
          raw.run(sql, params);
          const id = raw.exec('SELECT last_insert_rowid() AS id')?.[0]?.values?.[0]?.[0] || 0;
          const changes = raw.getRowsModified?.() || 0;
          save();
          return { lastInsertRowid: id, changes };
        },

        get(...args) {
          const params = args.length === 1 && typeof args[0] === 'object' && !Array.isArray(args[0])
            ? namedParams(args[0]) : args;
          const stmt = raw.prepare(sql);
          try {
            if (params && (Array.isArray(params) ? params.length : Object.keys(params).length)) {
              stmt.bind(params);
            }
            return stmt.step() ? stmt.getAsObject() : undefined;
          } finally { stmt.free(); }
        },

        all(...args) {
          const params = args.length === 1 && typeof args[0] === 'object' && !Array.isArray(args[0])
            ? namedParams(args[0]) : args;
          const stmt = raw.prepare(sql);
          const rows = [];
          try {
            if (params && (Array.isArray(params) ? params.length : Object.keys(params).length)) {
              stmt.bind(params);
            }
            while (stmt.step()) rows.push(stmt.getAsObject());
            return rows;
          } finally { stmt.free(); }
        },
      };
    },

    transaction(fn) {
      return (items) => {
        raw.run('BEGIN');
        try {
          const result = fn(items);
          raw.run('COMMIT');
          save();
          return result;
        } catch (e) {
          raw.run('ROLLBACK');
          throw e;
        }
      };
    },
  };
}

function migrate(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      role TEXT NOT NULL, email TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL,
      name TEXT, university TEXT, degree TEXT, semester TEXT, field TEXT,
      city TEXT, mode_preference TEXT, level TEXT, skills TEXT,
      company_name TEXT, hr_name TEXT, website TEXT, linkedin TEXT, contact TEXT,
      status TEXT DEFAULT 'active', created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS internships (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      external_id TEXT, title TEXT NOT NULL, company_name TEXT, company_type TEXT,
      category TEXT, field TEXT, paid_status TEXT, stipend TEXT, duration TEXT,
      mode TEXT, level TEXT, eligibility TEXT, skills TEXT, start_date TEXT,
      deadline TEXT, city TEXT, country TEXT, remote_availability TEXT,
      website TEXT, career_page TEXT, apply_link TEXT, hr_email TEXT,
      contact_number TEXT, linkedin TEXT, description TEXT, responsibilities TEXT,
      benefits TEXT, certificate TEXT, placement TEXT, government_private TEXT,
      verified_status TEXT, application_status TEXT, notes TEXT,
      status TEXT DEFAULT 'approved', featured INTEGER DEFAULT 0,
      submitted_by INTEGER, created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS applications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL, internship_id INTEGER NOT NULL,
      status TEXT DEFAULT 'Applied', match_score INTEGER DEFAULT 0,
      note TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(student_id, internship_id)
    );
  `);
}

function seedIfEmpty(db) {
  const count = db.prepare('SELECT COUNT(*) AS c FROM internships').get()?.c || 0;

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@siportal.local';
  const adminPass  = process.env.ADMIN_PASSWORD || 'admin12345';
  const exists = db.prepare('SELECT id FROM users WHERE email = ?').get(adminEmail);
  if (!exists) {
    db.prepare(
      'INSERT INTO users(role,email,password_hash,name,status) VALUES(?,?,?,?,?)'
    ).run('admin', adminEmail, bcrypt.hashSync(adminPass, 10), 'System Admin', 'active');
  }

  if (count > 0) return;

  const seedPath = path.join(process.cwd(), 'data', 'seed-internships.json');
  if (!fs.existsSync(seedPath)) return;

  const rows = JSON.parse(fs.readFileSync(seedPath, 'utf8'));
  const insert = db.prepare(`
    INSERT INTO internships (
      external_id,title,company_name,company_type,category,field,
      paid_status,stipend,duration,mode,level,eligibility,skills,
      start_date,deadline,city,country,remote_availability,
      website,career_page,apply_link,hr_email,contact_number,linkedin,
      description,responsibilities,benefits,certificate,placement,
      government_private,verified_status,application_status,notes,status,featured
    ) VALUES (
      @externalId,@title,@companyName,@companyType,@category,@field,
      @paidStatus,@stipend,@duration,@mode,@level,@eligibility,@skills,
      @startDate,@deadline,@city,@country,@remoteAvailability,
      @website,@careerPage,@applyLink,@hrEmail,@contactNumber,@linkedin,
      @description,@responsibilities,@benefits,@certificate,@placement,
      @governmentPrivate,@verifiedStatus,@applicationStatus,@notes,@status,@featured
    )
  `);

  const insertMany = db.transaction((items) => {
    for (const item of items) insert.run({ ...item, featured: item.featured ? 1 : 0 });
  });
  insertMany(rows);
}

export function mapInternship(row = {}) {
  if (!row) return null;
  return {
    id: row.id, externalId: row.external_id, title: row.title,
    companyName: row.company_name, companyType: row.company_type,
    category: row.category, field: row.field, paidStatus: row.paid_status,
    stipend: row.stipend, duration: row.duration, mode: row.mode,
    level: row.level, eligibility: row.eligibility, skills: row.skills,
    startDate: row.start_date, deadline: row.deadline, city: row.city,
    country: row.country, remoteAvailability: row.remote_availability,
    website: row.website, careerPage: row.career_page, applyLink: row.apply_link,
    hrEmail: row.hr_email, contactNumber: row.contact_number, linkedin: row.linkedin,
    description: row.description, responsibilities: row.responsibilities,
    benefits: row.benefits, certificate: row.certificate, placement: row.placement,
    governmentPrivate: row.government_private, verifiedStatus: row.verified_status,
    applicationStatus: row.application_status, notes: row.notes,
    status: row.status, featured: !!row.featured,
    submittedBy: row.submitted_by, createdAt: row.created_at,
  };
}

export const publicInternshipWhere = "status = 'approved'";
