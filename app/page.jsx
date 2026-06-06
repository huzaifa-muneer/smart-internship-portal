'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Shell from '@/components/Shell';

export default function Home() {
  const [data, setData] = useState({ stats:{}, featured:[], topFields:[] });
  useEffect(()=>{ fetch('/api/dashboard').then(r=>r.json()).then(setData); },[]);
  const { stats, featured, topFields } = data;

  const statCards = [
    ['Total Internships', stats.totalInternships,  '📋', '#0f2742'],
    ['Paid Internships',  stats.paidInternships,   '💰', '#059669'],
    ['Remote / Online',   stats.remoteInternships, '🌐', '#2563eb'],
    ['On-site',           stats.onSiteInternships, '🏢', '#7c3aed'],
    ['Hybrid',            stats.hybridInternships, '🔄', '#d97706'],
    ['Companies / Orgs',  stats.uniqueCompanies,   '🏛️', '#db2777'],
    ['Registered Students',stats.totalStudents,    '🎓', '#0891b2'],
    ['Total Applications',stats.totalApplications, '📨', '#16a34a'],
  ];

  return (
    <Shell>
      {/* Hero */}
      <section className="mb-6 rounded-3xl bg-gradient-to-br from-navy via-blue-800 to-blue-600 p-8 text-white shadow-lg">
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="badge bg-white/15 text-white border-white/20">✅ Verified Internships Only</span>
          <span className="badge bg-white/15 text-white border-white/20">🤖 Smart AI Matching</span>
          <span className="badge bg-white/15 text-white border-white/20">🎓 University Grade Portal</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-black leading-tight max-w-2xl">Smart Internship Intelligence Portal</h1>
        <p className="mt-3 text-blue-100 max-w-2xl text-sm md:text-base">
          Pakistan&apos;s most comprehensive internship matching platform. Build your profile and get AI-powered
          personalized recommendations from {stats.totalInternships??0}+ verified opportunities.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/student" className="btn bg-white text-navy hover:bg-blue-50 font-bold shadow">🎓 Find My Internships</Link>
          <Link href="/explorer" className="btn bg-white/15 text-white hover:bg-white/25 border border-white/30">🔍 Browse All</Link>
          <Link href="/company" className="btn bg-white/15 text-white hover:bg-white/25 border border-white/30">🏢 Submit Internship</Link>
        </div>
        <p className="mt-5 text-xs text-blue-200">
          Created, Researched &amp; Managed by <strong className="text-white">Malik Mohazin</strong>
        </p>
      </section>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 mb-6">
        {statCards.map(([label,value,icon,color])=>(
          <div key={label} className="card p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</p>
              <span className="text-xl">{icon}</span>
            </div>
            <p className="text-3xl font-black" style={{color}}>{value??0}</p>
          </div>
        ))}
      </div>

      {/* Top fields */}
      {topFields?.length>0 && (
        <div className="card p-5 mb-6">
          <h2 className="font-bold text-navy mb-4">📊 Top Internship Fields</h2>
          <div className="grid gap-2.5 md:grid-cols-2">
            {topFields.slice(0,8).map(({field,count})=>(
              <div key={field} className="flex items-center justify-between gap-3">
                <span className="text-sm text-slate-700 truncate">{field}</span>
                <div className="flex items-center gap-2 shrink-0">
                  <div className="w-24 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full rounded-full bg-blue-500" style={{width:`${Math.round((count/(topFields[0]?.count||1))*100)}%`}} />
                  </div>
                  <span className="text-xs font-bold text-slate-500 w-6 text-right">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Featured */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-navy">⭐ Featured &amp; Latest Opportunities</h2>
        <Link href="/explorer" className="text-sm font-bold text-blue-600 hover:underline">View all →</Link>
      </div>
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        {featured?.map(i=>(
          <div key={i.id} className="card p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between gap-2 mb-3">
              <div>
                <h3 className="font-bold text-navy text-sm leading-tight">{i.title}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{i.companyName}</p>
              </div>
              {i.featured?<span className="badge-amber shrink-0">⭐ Featured</span>:<span className="badge-green shrink-0">✅ Verified</span>}
            </div>
            <div className="flex flex-wrap gap-1 mb-3">
              {i.field&&<span className="badge-blue text-xs">{i.field}</span>}
              {i.mode&&<span className="badge-slate text-xs">{i.mode}</span>}
              {i.paidStatus==='Paid'&&<span className="badge-green text-xs">💰 Paid</span>}
            </div>
            <p className="text-xs text-slate-500 mb-2">📍 {i.city}{i.deadline?` · Deadline: ${i.deadline}`:''}</p>
            <p className="text-xs text-emerald-600 font-semibold mb-3">✅ Verified by Malik Mohazin</p>
            <Link href="/student" className="btn-primary w-full text-center text-xs">Get Matched &amp; Apply →</Link>
          </div>
        ))}
      </div>

      {/* How it works */}
      <div className="card p-6">
        <h2 className="font-bold text-navy mb-5 text-center">🚀 How It Works</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            ['🎓','Build Your Profile','Enter your degree, skills, field, city, and career interests in our smart profile wizard.'],
            ['🤖','Get Smart Matches','Our AI matching engine ranks internships by compatibility — see match % for each opportunity.'],
            ['📨','Apply with Confidence','Every internship is manually verified before publishing. Apply only to genuine opportunities.'],
          ].map(([icon,title,desc])=>(
            <div key={title} className="text-center p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-3xl mb-3">{icon}</div>
              <h3 className="font-bold text-navy mb-2">{title}</h3>
              <p className="text-sm text-slate-500">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </Shell>
  );
}
