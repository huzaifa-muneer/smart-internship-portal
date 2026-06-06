'use client';
import Shell from '@/components/Shell';
import Link from 'next/link';

const acknowledgees = [
  'Abdullah Sajid', 'Jawad Safder', 'Safi Ullah', 'Aisha Siddiqui',
  'Inshirah Hassan', 'Omama Sajid', 'Saleha Arshad',
  'Seerat E. Maryum', 'Abdul Dayyan', 'Zaigham Abdullah',
];

export default function About() {
  return (
    <Shell>
      {/* Hero */}
      <section className="mb-6 rounded-3xl bg-gradient-to-br from-navy via-blue-800 to-blue-600 p-8 text-white shadow-lg">
        <span className="badge bg-white/15 text-white border-white/20 mb-4">💡 About This Project</span>
        <h1 className="text-3xl md:text-4xl font-black leading-tight">Smart Internship Intelligence Portal</h1>
        <p className="mt-3 text-blue-100 max-w-2xl text-sm md:text-base">
          A student career intelligence platform built to help university students discover, match, and apply
          for verified internship opportunities — personalised to their skills, field, and goals.
        </p>
        <p className="mt-5 text-xs text-blue-200">
          Created, Researched &amp; Managed by <strong className="text-white">Malik Mohazin</strong>
        </p>
      </section>

      <div className="grid md:grid-cols-2 gap-5 mb-5">
        {/* About the Project */}
        <div className="card p-6">
          <h2 className="text-lg font-black text-navy mb-3">🎯 Purpose</h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            This portal was built to convert a raw internship Excel database into a complete student career
            intelligence system. Instead of showing every internship to every student, it collects a student&apos;s
            profile — degree, skills, field, city, and preferences — and uses a smart matching algorithm to
            rank and recommend the most relevant opportunities with a compatibility percentage.
          </p>
          <p className="text-sm text-slate-600 leading-relaxed mt-3">
            Companies and organisations can submit internship listings through a dedicated portal. Each
            submission is reviewed and verified by the admin before going live, ensuring students only see
            genuine, quality-checked opportunities.
          </p>
        </div>

        {/* Tech Stack */}
        <div className="card p-6">
          <h2 className="text-lg font-black text-navy mb-3">⚙️ How It Works</h2>
          <ul className="space-y-2 text-sm text-slate-600">
            <li className="flex gap-2"><span className="text-blue-500 font-bold">→</span><span><strong>Smart Matching:</strong> Rule-based AI scoring engine compares student profile against every internship across field, skills, location, mode, and level.</span></li>
            <li className="flex gap-2"><span className="text-blue-500 font-bold">→</span><span><strong>3-Role System:</strong> Separate portals for Students, Companies, and Admins — each with their own dashboard and access level.</span></li>
            <li className="flex gap-2"><span className="text-blue-500 font-bold">→</span><span><strong>Verified Only:</strong> All internships pass through admin review before publishing. Every card carries a Verified badge.</span></li>
            <li className="flex gap-2"><span className="text-blue-500 font-bold">→</span><span><strong>354+ Opportunities:</strong> Seeded from a curated Pakistan + International internship database covering 15+ fields.</span></li>
          </ul>
        </div>
      </div>

      {/* Creator */}
      <div className="card p-6 mb-5 border-l-4 border-navy">
        <h2 className="text-lg font-black text-navy mb-1">👤 Creator</h2>
        <p className="text-sm text-slate-500 mb-3">PAF-IAST University</p>
        <p className="text-sm text-slate-600 leading-relaxed">
          This project was independently conceptualised, researched, designed, and developed by{' '}
          <strong className="text-navy">Malik Mohazin</strong> as a university career initiative. The vision was
          to build a professional-grade internship intelligence platform that serves as both a practical tool
          for students and a showcase of applied software development. Every internship listing was manually
          researched, verified, and curated.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {['Researcher', 'Designer', 'Developer', 'Data Curator', 'Project Manager'].map(role => (
            <span key={role} className="badge bg-navy/10 text-navy border-navy/20">{role}</span>
          ))}
        </div>
      </div>

      {/* Acknowledgements */}
      <div className="card p-6 mb-5">
        <h2 className="text-lg font-black text-navy mb-1">🤝 Acknowledgements</h2>
        <p className="text-xs text-slate-500 mb-4">PAF-IAST Students</p>
        <p className="text-sm text-slate-600 leading-relaxed mb-5">
          <em>Smart Internship Intelligence</em> was inspired by the support, guidance, and encouragement of the
          following PAF-IAST students. Their assistance throughout my academic journey and internships played a
          valuable role in shaping this initiative. I am grateful for their mentorship, insights, and continuous
          support, and I am pleased to acknowledge their contribution and inspiration.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {acknowledgees.map((name) => (
            <div key={name} className="flex flex-col items-center gap-2 rounded-xl bg-blue-50 border border-blue-100 p-3 text-center">
              <div className="h-10 w-10 rounded-full bg-navy grid place-items-center text-white font-black text-sm">
                {name.split(' ').map(w => w[0]).slice(0, 2).join('')}
              </div>
              <p className="text-xs font-semibold text-slate-700 leading-tight">{name}</p>
              <p className="text-xs text-slate-400">PAF-IAST</p>
            </div>
          ))}
        </div>
      </div>

      {/* Future Roadmap */}
      <div className="card p-6">
        <h2 className="text-lg font-black text-navy mb-3">🚀 Future Roadmap</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            ['Phase 1 ✅', 'Smart rule-based matching, 3-role portal, admin verification, Excel import/export'],
            ['Phase 2 🔜', 'CV upload & parsing, skill extraction from CV, improved match scoring'],
            ['Phase 3 🔜', 'AI/ML semantic matching using embeddings, fake internship detection'],
            ['Phase 4 🔜', 'Email & WhatsApp alerts for deadlines, AI career chatbot, university partnerships'],
          ].map(([phase, desc]) => (
            <div key={phase} className="rounded-xl bg-slate-50 border border-slate-200 p-4">
              <p className="text-sm font-bold text-navy mb-1">{phase}</p>
              <p className="text-xs text-slate-500">{desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-5 text-center">
          <Link href="/" className="btn bg-navy text-white hover:bg-blue-800">← Back to Dashboard</Link>
        </div>
      </div>
    </Shell>
  );
}
