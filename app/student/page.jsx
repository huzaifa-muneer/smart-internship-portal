'use client';
import { useEffect, useMemo, useState } from 'react';
import Shell from '@/components/Shell';
import InternshipCard from '@/components/InternshipCard';
import { matchScore, matchLabel } from '@/lib/matching';

const FIELDS = ['Software Engineering','Web Development','Full Stack Development','Frontend Development','App Development','Artificial Intelligence','Machine Learning','Data Science','Data Analytics','Cyber Security','Cloud Computing','DevOps','IT Support','Graphic Designing','UI/UX Design','Digital Marketing','Business Administration','Finance','Accounting','Human Resources','Content Writing','Research & Development','Other'];
const DEGREES = ['BS/BE','BBA','BSc','MS/ME','MBA','MPhil','PhD','Diploma / Associate','Other'];
const LEVELS  = ['Entry Level','Beginner','Intermediate','Advanced'];
const MODES   = ['Remote','On-site','Hybrid'];
const SEMS    = ['1st','2nd','3rd','4th','5th','6th','7th','8th','Graduate'];
const STEPS   = ['Basic Info','Education','Skills','Preferences','Account'];

function StepBar({ current }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-6">
      {STEPS.map((label, i) => (
        <div key={label} className="flex items-center gap-2">
          <div className={`step-dot ${i < current ? 'done' : i === current ? 'active' : 'pending'}`}>
            {i < current ? '✓' : i + 1}
          </div>
          {i < STEPS.length - 1 && (
            <div className={`h-0.5 w-5 rounded ${i < current ? 'bg-emerald-400' : 'bg-slate-200'}`} />
          )}
        </div>
      ))}
    </div>
  );
}

function RegisterWizard({ onAuth }) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ name:'',university:'',degree:'',semester:'',field:'',skills:'',level:'Entry Level',city:'',country:'Pakistan',modePreference:'Hybrid',email:'',password:'' });
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const upd = e => set(e.target.name, e.target.value);

  async function submit() {
    setLoading(true); setMsg('Creating your account...');
    const res = await fetch('/api/auth/register', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({...form,role:'student'}) });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setMsg(data.error||'Registration failed'); return; }
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    onAuth(data.user, data.token);
  }

  const stepContent = [
    <div key={0} className="grid gap-4">
      <div><label className="text-xs font-bold text-slate-500 mb-1 block">Full Name *</label><input className="input" name="name" value={form.name} onChange={upd} placeholder="e.g. Ali Hassan" /></div>
      <div><label className="text-xs font-bold text-slate-500 mb-1 block">City *</label><input className="input" name="city" value={form.city} onChange={upd} placeholder="e.g. Islamabad" /></div>
      <div><label className="text-xs font-bold text-slate-500 mb-1 block">Country</label><input className="input" name="country" value={form.country} onChange={upd} /></div>
    </div>,
    <div key={1} className="grid gap-4">
      <div><label className="text-xs font-bold text-slate-500 mb-1 block">University / Institution *</label><input className="input" name="university" value={form.university} onChange={upd} placeholder="e.g. University of Haripur" /></div>
      <div><label className="text-xs font-bold text-slate-500 mb-1 block">Degree Program *</label><select className="input" name="degree" value={form.degree} onChange={upd}><option value="">Select degree</option>{DEGREES.map(d=><option key={d}>{d}</option>)}</select></div>
      <div><label className="text-xs font-bold text-slate-500 mb-1 block">Current Semester</label><select className="input" name="semester" value={form.semester} onChange={upd}><option value="">Select semester</option>{SEMS.map(s=><option key={s}>{s}</option>)}</select></div>
    </div>,
    <div key={2} className="grid gap-4">
      <div><label className="text-xs font-bold text-slate-500 mb-1 block">Career Field / Interest *</label><select className="input" name="field" value={form.field} onChange={upd}><option value="">Select your field</option>{FIELDS.map(f=><option key={f}>{f}</option>)}</select></div>
      <div>
        <label className="text-xs font-bold text-slate-500 mb-1 block">Your Skills (comma-separated) *</label>
        <textarea className="input h-20" name="skills" value={form.skills} onChange={upd} placeholder="e.g. Python, SQL, Machine Learning, Excel" />
        <p className="text-xs text-slate-400 mt-1">Tip: more specific skills = better matches</p>
      </div>
      <div>
        <label className="text-xs font-bold text-slate-500 mb-1 block">Experience Level</label>
        <div className="flex flex-wrap gap-2">
          {LEVELS.map(l=><button key={l} type="button" onClick={()=>set('level',l)} className={`px-3 py-1.5 rounded-xl text-sm font-semibold border transition ${form.level===l?'bg-navy text-white border-navy':'bg-white text-slate-600 border-slate-200 hover:border-navy'}`}>{l}</button>)}
        </div>
      </div>
    </div>,
    <div key={3} className="grid gap-4">
      <div>
        <label className="text-xs font-bold text-slate-500 mb-1 block">Work Mode Preference</label>
        <div className="flex gap-2">
          {MODES.map(m=><button key={m} type="button" onClick={()=>set('modePreference',m)} className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition ${form.modePreference===m?'bg-navy text-white border-navy':'bg-white text-slate-600 border-slate-200 hover:border-navy'}`}>{m==='Remote'?'🌐 Remote':m==='On-site'?'🏢 On-site':'🔄 Hybrid'}</button>)}
        </div>
      </div>
    </div>,
    <div key={4} className="grid gap-4">
      <div><label className="text-xs font-bold text-slate-500 mb-1 block">Email Address *</label><input className="input" name="email" value={form.email} onChange={upd} type="email" placeholder="you@university.edu" /></div>
      <div><label className="text-xs font-bold text-slate-500 mb-1 block">Password *</label><input className="input" name="password" value={form.password} onChange={upd} type="password" placeholder="Min 6 characters" /></div>
      {msg && <p className="text-sm font-semibold text-red-500">{msg}</p>}
    </div>,
  ];

  const canNext = [form.name&&form.city, form.university&&form.degree, form.field&&form.skills, true, form.email&&form.password&&form.password.length>=6];

  return (
    <div className="card p-6 max-w-lg mx-auto w-full">
      <h2 className="text-2xl font-black text-navy mb-1">Create Student Profile</h2>
      <p className="text-sm text-slate-500 mb-5">Step {step+1} of {STEPS.length}: <strong>{STEPS[step]}</strong></p>
      <StepBar current={step} />
      {stepContent[step]}
      <div className="flex gap-3 mt-6">
        {step > 0 && <button className="btn-soft flex-1" onClick={()=>setStep(s=>s-1)}>← Back</button>}
        {step < STEPS.length-1
          ? <button className="btn-primary flex-1" disabled={!canNext[step]} onClick={()=>setStep(s=>s+1)}>Next →</button>
          : <button className="btn-green flex-1" disabled={!canNext[step]||loading} onClick={submit}>{loading?'Creating...':'🚀 Create Account & Find Matches'}</button>
        }
      </div>
    </div>
  );
}

function LoginForm({ onAuth, onSwitch }) {
  const [form, setForm] = useState({ email:'', password:'' });
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const upd = e => setForm(f=>({...f,[e.target.name]:e.target.value}));

  async function submit() {
    setLoading(true); setMsg('Signing in...');
    const res = await fetch('/api/auth/login', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({...form,role:'student'}) });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setMsg(data.error||'Login failed'); return; }
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    onAuth(data.user, data.token);
  }

  return (
    <div className="card p-6 max-w-sm mx-auto w-full">
      <h2 className="text-2xl font-black text-navy mb-1">Student Login</h2>
      <p className="text-sm text-slate-500 mb-4">Sign in to view your personalized matches.</p>
      <div className="grid gap-3">
        <input className="input" name="email" value={form.email} onChange={upd} type="email" placeholder="Email address" />
        <input className="input" name="password" value={form.password} onChange={upd} type="password" placeholder="Password" />
        {msg && <p className="text-sm font-semibold text-red-500">{msg}</p>}
        <button className="btn-primary" onClick={submit} disabled={loading}>{loading?'Signing in...':'🔐 Sign In'}</button>
        <button className="text-sm font-semibold text-blue-600 hover:underline text-center" onClick={onSwitch}>New student? Create profile →</button>
      </div>
    </div>
  );
}

export default function Student() {
  const [user,   setUser]   = useState(null);
  const [token,  setToken]  = useState('');
  const [items,  setItems]  = useState([]);
  const [apps,   setApps]   = useState([]);
  const [mode,   setMode]   = useState('login');
  const [tab,    setTab]    = useState('matches');
  const [filter, setFilter] = useState('all');
  const [applyMsg,setApplyMsg] = useState('');

  useEffect(() => {
    const t = localStorage.getItem('token');
    const u = localStorage.getItem('user');
    if (t && u) { const p = JSON.parse(u); if (p.role==='student') { setToken(t); setUser(p); } }
    fetch('/api/internships').then(r=>r.json()).then(d=>setItems(d.internships||[]));
  }, []);

  useEffect(() => {
    if (token) fetch('/api/applications',{headers:{Authorization:'Bearer '+token}}).then(r=>r.json()).then(d=>setApps(d.applications||[]));
  }, [token]);

  function onAuth(u, t) { setUser(u); setToken(t); }

  async function apply(item, score) {
    setApplyMsg('');
    const res = await fetch('/api/applications', { method:'POST', headers:{'Content-Type':'application/json',Authorization:'Bearer '+token}, body:JSON.stringify({internshipId:item.id,matchScore:score}) });
    if (res.ok) {
      setApplyMsg('✅ Applied to "'+item.title+'" successfully!');
      fetch('/api/applications',{headers:{Authorization:'Bearer '+token}}).then(r=>r.json()).then(d=>setApps(d.applications||[]));
    } else {
      const d = await res.json();
      setApplyMsg(d.error||'Already applied or an error occurred.');
    }
    setTimeout(()=>setApplyMsg(''), 4000);
  }

  const ranked = useMemo(() => {
    if (!user) return [];
    return items.map(i=>({...i,score:matchScore(user,i)})).sort((a,b)=>b.score-a.score);
  }, [items, user]);

  const displayed = useMemo(() => {
    if (filter==='excellent') return ranked.filter(x=>x.score>=70);
    if (filter==='good')      return ranked.filter(x=>x.score>=50);
    return ranked;
  }, [ranked, filter]);

  const appliedIds = new Set(apps.map(a=>a.internship_id));

  if (!user) {
    return (
      <Shell>
        <div className="mb-6 card p-6 bg-gradient-to-br from-blue-600 to-navy text-white rounded-3xl">
          <h1 className="text-3xl font-black mb-2">🎓 Student Portal</h1>
          <p className="text-blue-100 max-w-xl">Build your profile and get AI-powered internship recommendations tailored to your skills, field, and location.</p>
        </div>
        <div className="flex flex-col items-center gap-5">
          {mode==='login'
            ? <LoginForm onAuth={onAuth} onSwitch={()=>setMode('register')} />
            : <RegisterWizard onAuth={onAuth} />
          }
          {mode==='register' && <button className="text-sm font-semibold text-blue-600 hover:underline" onClick={()=>setMode('login')}>Already have an account? Sign in →</button>}
        </div>
      </Shell>
    );
  }

  const excellent = ranked.filter(x=>x.score>=70).length;
  const good      = ranked.filter(x=>x.score>=50).length;

  return (
    <Shell>
      {applyMsg && (
        <div className={`mb-4 rounded-xl p-3 text-sm font-semibold ${applyMsg.startsWith('✅')?'bg-emerald-50 text-emerald-700 border border-emerald-200':'bg-red-50 text-red-700 border border-red-200'}`}>
          {applyMsg}
        </div>
      )}
      <div className="grid gap-5 lg:grid-cols-4">
        {/* Profile sidebar */}
        <div className="lg:col-span-1">
          <div className="card p-5 sticky top-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-navy font-black text-white text-lg shadow">{(user.name||'S').charAt(0).toUpperCase()}</div>
              <div><p className="font-bold text-navy text-sm">{user.name||'Student'}</p><p className="text-xs text-slate-500 truncate">{user.email}</p></div>
            </div>
            {[['🎓 University',user.university],['📚 Degree',user.degree],['📅 Semester',user.semester],['💼 Field',user.field],['📍 City',user.city],['🔄 Mode Pref.',user.modePreference],['⚡ Skills',user.skills]].filter(([,v])=>v).map(([k,v])=>(
              <div key={k} className="mb-2">
                <p className="text-xs font-bold text-slate-400 mb-0.5">{k}</p>
                <p className="text-xs text-slate-700 rounded-lg bg-slate-50 px-2.5 py-1.5 leading-relaxed">{v}</p>
              </div>
            ))}
            <button className="btn-soft w-full mt-3 text-xs" onClick={()=>{localStorage.clear();setUser(null);setToken('');setApps([])}}>Sign Out</button>
          </div>
        </div>

        {/* Main */}
        <div className="lg:col-span-3 space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="card p-4 text-center"><p className="text-2xl font-black text-emerald-600">{excellent}</p><p className="text-xs text-slate-500 mt-1 font-semibold">Excellent Matches (≥70%)</p></div>
            <div className="card p-4 text-center"><p className="text-2xl font-black text-blue-600">{good}</p><p className="text-xs text-slate-500 mt-1 font-semibold">Good Matches (≥50%)</p></div>
            <div className="card p-4 text-center"><p className="text-2xl font-black text-navy">{apps.length}</p><p className="text-xs text-slate-500 mt-1 font-semibold">My Applications</p></div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2">
            <button className={`btn flex-1 ${tab==='matches'?'btn-primary':'btn-soft'}`} onClick={()=>setTab('matches')}>🤖 My Matches</button>
            <button className={`btn flex-1 ${tab==='applications'?'btn-primary':'btn-soft'}`} onClick={()=>setTab('applications')}>📨 Applications ({apps.length})</button>
          </div>

          {/* Matches */}
          {tab==='matches' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-bold text-navy">🤖 AI-Powered Internship Matches</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Ranked by compatibility · {displayed.length} results</p>
                </div>
                <div className="flex gap-1.5">
                  {[['all','All'],['excellent','Excellent'],['good','Good+']].map(([v,l])=>(
                    <button key={v} onClick={()=>setFilter(v)} className={`text-xs px-3 py-1.5 rounded-lg font-semibold border transition ${filter===v?'bg-navy text-white border-navy':'bg-white text-slate-600 border-slate-200 hover:border-navy'}`}>{l}</button>
                  ))}
                </div>
              </div>
              {displayed.length===0
                ? <div className="card p-8 text-center"><p className="text-3xl mb-3">🔍</p><p className="font-bold text-slate-600">No matches for this filter</p><button className="btn-primary mt-4" onClick={()=>setFilter('all')}>Show All</button></div>
                : <div className="grid gap-4 md:grid-cols-2">{displayed.map(i=><InternshipCard key={i.id} item={i} score={i.score} onApply={appliedIds.has(i.id)?null:apply}/>)}</div>
              }
            </div>
          )}

          {/* Applications */}
          {tab==='applications' && (
            <div className="card p-5">
              <h2 className="font-bold text-navy mb-4">📨 My Applications</h2>
              {apps.length===0
                ? <div className="text-center py-8"><p className="text-3xl mb-2">📭</p><p className="text-slate-500 font-semibold">No applications yet</p><p className="text-slate-400 text-sm mt-1">Go to Matches tab and apply to internships</p></div>
                : <div className="overflow-auto"><table className="tbl"><thead><tr><th>Internship</th><th>Company</th><th>Field</th><th>Match</th><th>Status</th></tr></thead><tbody>{apps.map(a=>{const ml=matchLabel(a.match_score||0);return(<tr key={a.id}><td className="font-semibold">{a.internship?.title}</td><td>{a.internship?.companyName}</td><td>{a.internship?.field}</td><td><span className={ml.color}>{a.match_score||0}%</span></td><td><span className="badge-blue">{a.status}</span></td></tr>)})}</tbody></table></div>
              }
            </div>
          )}
        </div>
      </div>
    </Shell>
  );
}
