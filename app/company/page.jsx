'use client';
import { useEffect, useState } from 'react';
import Shell from '@/components/Shell';

const FIELDS = ['Software Engineering','Web Development','Full Stack Development','Frontend Development','App Development','Artificial Intelligence','Machine Learning','Data Science','Data Analytics','Cyber Security','Cloud Computing','DevOps','IT Support','Graphic Designing','UI/UX Design','Digital Marketing','Business Administration','Finance','Accounting','Human Resources','Content Writing','Research & Development','Other'];

function CompanyLogin({ onAuth, onSwitch }) {
  const [form, setForm] = useState({ email:'', password:'' });
  const [msg, setMsg] = useState('');
  const upd = e => setForm(f=>({...f,[e.target.name]:e.target.value}));
  async function submit() {
    setMsg('Signing in...');
    const res = await fetch('/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...form,role:'company'})});
    const data = await res.json();
    if (!res.ok) { setMsg(data.error||'Login failed'); return; }
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    onAuth(data.user, data.token);
  }
  return (
    <div className="card p-6 max-w-sm mx-auto w-full">
      <h2 className="text-2xl font-black text-navy mb-1">Company Login</h2>
      <p className="text-sm text-slate-500 mb-4">Access your company dashboard.</p>
      <div className="grid gap-3">
        <input className="input" name="email" value={form.email} onChange={upd} type="email" placeholder="Company email" />
        <input className="input" name="password" value={form.password} onChange={upd} type="password" placeholder="Password" />
        {msg && <p className="text-sm font-semibold text-red-500">{msg}</p>}
        <button className="btn-primary" onClick={submit}>🔐 Sign In</button>
        <button className="text-sm font-semibold text-blue-600 hover:underline text-center" onClick={onSwitch}>New company? Register →</button>
      </div>
    </div>
  );
}

function CompanyRegister({ onAuth, onSwitch }) {
  const [form, setForm] = useState({companyName:'',hrName:'',website:'',linkedin:'',contact:'',email:'',password:''});
  const [msg, setMsg] = useState('');
  const upd = e => setForm(f=>({...f,[e.target.name]:e.target.value}));
  async function submit() {
    setMsg('Registering...');
    const res = await fetch('/api/auth/register',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...form,role:'company'})});
    const data = await res.json();
    if (!res.ok) { setMsg(data.error||'Registration failed'); return; }
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    onAuth(data.user, data.token);
  }
  return (
    <div className="card p-6 max-w-lg mx-auto w-full">
      <h2 className="text-2xl font-black text-navy mb-1">Register Company</h2>
      <p className="text-sm text-slate-500 mb-5">Register to submit internship opportunities for admin review and verification.</p>
      <div className="grid gap-3 md:grid-cols-2">
        <div className="md:col-span-2"><label className="text-xs font-bold text-slate-500 mb-1 block">Company / Organization Name *</label><input className="input" name="companyName" value={form.companyName} onChange={upd} placeholder="e.g. Tech Solutions Ltd." /></div>
        <div><label className="text-xs font-bold text-slate-500 mb-1 block">HR Contact Name *</label><input className="input" name="hrName" value={form.hrName} onChange={upd} placeholder="HR Manager name" /></div>
        <div><label className="text-xs font-bold text-slate-500 mb-1 block">Contact Number</label><input className="input" name="contact" value={form.contact} onChange={upd} placeholder="+92-xxx-xxxxxxx" /></div>
        <div><label className="text-xs font-bold text-slate-500 mb-1 block">Company Website</label><input className="input" name="website" value={form.website} onChange={upd} placeholder="https://..." /></div>
        <div><label className="text-xs font-bold text-slate-500 mb-1 block">LinkedIn Page</label><input className="input" name="linkedin" value={form.linkedin} onChange={upd} placeholder="LinkedIn URL" /></div>
        <div><label className="text-xs font-bold text-slate-500 mb-1 block">Email Address *</label><input className="input" name="email" value={form.email} onChange={upd} type="email" placeholder="hr@company.com" /></div>
        <div><label className="text-xs font-bold text-slate-500 mb-1 block">Password *</label><input className="input" name="password" value={form.password} onChange={upd} type="password" placeholder="Min 6 characters" /></div>
      </div>
      {msg && <p className="text-sm text-red-500 font-semibold mt-3">{msg}</p>}
      <div className="flex gap-3 mt-4">
        <button className="btn-primary flex-1" onClick={submit}>🏢 Register Company</button>
        <button className="btn-soft" onClick={onSwitch}>Sign In</button>
      </div>
    </div>
  );
}

export default function Company() {
  const [user,    setUser]    = useState(null);
  const [token,   setToken]   = useState('');
  const [items,   setItems]   = useState([]);
  const [authMode,setAuthMode]= useState('login');
  const [msg,     setMsg]     = useState('');
  const [loading, setLoading] = useState(false);

  const EMPTY = {title:'',field:'',city:'',country:'Pakistan',mode:'On-site',paidStatus:'Unpaid',stipend:'',duration:'',level:'Entry Level',deadline:'',skills:'',applyLink:'',hrEmail:'',description:'',responsibilities:'',benefits:'',companyType:'Private'};
  const [form, setForm] = useState(EMPTY);
  const upd = e => setForm(f=>({...f,[e.target.name]:e.target.value}));

  useEffect(()=>{
    const t=localStorage.getItem('token'); const u=localStorage.getItem('user');
    if(t&&u){const p=JSON.parse(u);if(p.role==='company'){setToken(t);setUser(p);}}
  },[]);
  useEffect(()=>{if(token)load();},[token]);

  function load() {
    fetch('/api/internships?mine=1',{headers:{Authorization:'Bearer '+token}}).then(r=>r.json()).then(d=>setItems(d.internships||[]));
  }
  function onAuth(u,t){setUser(u);setToken(t);}

  async function submit() {
    if(!form.title||!form.field||!form.skills||!form.applyLink){setMsg('Please fill: Title, Field, Skills, Apply Link.');return;}
    setLoading(true);setMsg('Submitting for admin verification...');
    const res = await fetch('/api/internships',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+token},body:JSON.stringify({...form,companyName:user.companyName})});
    const data = await res.json();
    setLoading(false);
    if(res.ok){setMsg('✅ Submitted! Admin will review and verify within 24 hours.');setForm(EMPTY);load();}
    else setMsg('❌ '+(data.error||'Submission failed'));
  }

  if(!user) {
    return (
      <Shell>
        <div className="mb-6 card p-6 bg-gradient-to-br from-blue-700 to-navy text-white rounded-3xl">
          <h1 className="text-3xl font-black mb-2">🏢 Company Portal</h1>
          <p className="text-blue-100 max-w-xl">Submit your internship opportunities for admin verification. Once approved by Malik Mohazin, your internship will be published as a verified opportunity to thousands of students.</p>
          <div className="mt-4 flex flex-wrap gap-2 text-xs">
            <span className="badge bg-white/15 text-white border-white/20">✅ Manually verified by Malik Mohazin</span>
            <span className="badge bg-white/15 text-white border-white/20">🎓 Reach university students</span>
            <span className="badge bg-white/15 text-white border-white/20">🤖 AI-matched to relevant students</span>
          </div>
        </div>
        <div className="flex flex-col items-center gap-5">
          {authMode==='login'
            ? <CompanyLogin onAuth={onAuth} onSwitch={()=>setAuthMode('register')} />
            : <CompanyRegister onAuth={onAuth} onSwitch={()=>setAuthMode('login')} />
          }
        </div>
      </Shell>
    );
  }

  const pending  = items.filter(i=>i.status==='pending').length;
  const approved = items.filter(i=>i.status==='approved').length;
  const rejected = items.filter(i=>i.status==='rejected').length;

  return (
    <Shell>
      {/* Header */}
      <div className="card p-5 mb-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-navy font-black text-white text-lg shadow">{(user.companyName||'C').charAt(0).toUpperCase()}</div>
            <div><h1 className="font-black text-navy">{user.companyName||'Company Portal'}</h1><p className="text-xs text-slate-500">{user.email} · HR: {user.hrName}</p></div>
          </div>
          <button className="btn-soft text-xs" onClick={()=>{localStorage.clear();setUser(null);setToken('');setItems([])}}>Sign Out</button>
        </div>
        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-center"><p className="text-xl font-black text-amber-700">{pending}</p><p className="text-xs font-semibold text-amber-600">Pending Review</p></div>
          <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-center"><p className="text-xl font-black text-emerald-700">{approved}</p><p className="text-xs font-semibold text-emerald-600">Approved &amp; Live</p></div>
          <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-center"><p className="text-xl font-black text-red-700">{rejected}</p><p className="text-xs font-semibold text-red-600">Rejected</p></div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Submit form */}
        <div className="card p-5">
          <h2 className="font-bold text-navy mb-1">📝 Submit New Internship</h2>
          <p className="text-xs text-slate-500 mb-4">Fill all details. Fields marked * are required. Admin verifies before publishing.</p>
          <div className="grid gap-3">
            <div><label className="text-xs font-bold text-slate-500 mb-1 block">Internship Title *</label><input className="input" name="title" value={form.title} onChange={upd} placeholder="e.g. Software Development Intern" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs font-bold text-slate-500 mb-1 block">Field / Domain *</label><select className="input" name="field" value={form.field} onChange={upd}><option value="">Select field</option>{FIELDS.map(f=><option key={f}>{f}</option>)}</select></div>
              <div><label className="text-xs font-bold text-slate-500 mb-1 block">Company Type</label><select className="input" name="companyType" value={form.companyType} onChange={upd}>{['Private','Startup','Government','University','NGO','MNC'].map(t=><option key={t}>{t}</option>)}</select></div>
            </div>
            <div><label className="text-xs font-bold text-slate-500 mb-1 block">Required Skills * (comma-separated)</label><input className="input" name="skills" value={form.skills} onChange={upd} placeholder="e.g. Python, Django, MySQL, REST APIs" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs font-bold text-slate-500 mb-1 block">City *</label><input className="input" name="city" value={form.city} onChange={upd} placeholder="Islamabad / Remote" /></div>
              <div><label className="text-xs font-bold text-slate-500 mb-1 block">Country</label><input className="input" name="country" value={form.country} onChange={upd} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs font-bold text-slate-500 mb-1 block">Mode</label><select className="input" name="mode" value={form.mode} onChange={upd}>{['On-site','Remote','Hybrid'].map(m=><option key={m}>{m}</option>)}</select></div>
              <div><label className="text-xs font-bold text-slate-500 mb-1 block">Paid / Unpaid</label><select className="input" name="paidStatus" value={form.paidStatus} onChange={upd}><option>Paid</option><option>Unpaid</option></select></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs font-bold text-slate-500 mb-1 block">Stipend (if paid)</label><input className="input" name="stipend" value={form.stipend} onChange={upd} placeholder="e.g. 15000 PKR" /></div>
              <div><label className="text-xs font-bold text-slate-500 mb-1 block">Duration</label><input className="input" name="duration" value={form.duration} onChange={upd} placeholder="e.g. 2 Months" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs font-bold text-slate-500 mb-1 block">Deadline *</label><input className="input" name="deadline" value={form.deadline} onChange={upd} type="date" /></div>
              <div><label className="text-xs font-bold text-slate-500 mb-1 block">Level</label><select className="input" name="level" value={form.level} onChange={upd}>{['Entry Level','Beginner','Intermediate','Advanced'].map(l=><option key={l}>{l}</option>)}</select></div>
            </div>
            <div><label className="text-xs font-bold text-slate-500 mb-1 block">Direct Apply Link *</label><input className="input" name="applyLink" value={form.applyLink} onChange={upd} placeholder="https://..." /></div>
            <div><label className="text-xs font-bold text-slate-500 mb-1 block">HR Contact Email</label><input className="input" name="hrEmail" value={form.hrEmail} onChange={upd} type="email" placeholder="hr@company.com" /></div>
            <div><label className="text-xs font-bold text-slate-500 mb-1 block">Internship Description *</label><textarea className="input h-20" name="description" value={form.description} onChange={upd} placeholder="Describe the internship role and what the intern will learn..." /></div>
            <div><label className="text-xs font-bold text-slate-500 mb-1 block">Key Responsibilities</label><textarea className="input h-14" name="responsibilities" value={form.responsibilities} onChange={upd} placeholder="Main tasks and responsibilities..." /></div>
            <div><label className="text-xs font-bold text-slate-500 mb-1 block">Benefits / Perks</label><input className="input" name="benefits" value={form.benefits} onChange={upd} placeholder="e.g. Certificate, Stipend, Mentorship" /></div>
          </div>
          {msg && <div className={`mt-4 rounded-xl p-3 text-sm font-semibold ${msg.startsWith('✅')?'bg-emerald-50 text-emerald-700 border border-emerald-200':'bg-red-50 text-red-600 border border-red-200'}`}>{msg}</div>}
          <button className="btn-primary w-full mt-4" onClick={submit} disabled={loading}>{loading?'Submitting...':'📤 Submit for Admin Verification'}</button>
        </div>

        {/* Right panel */}
        <div className="space-y-5">
          <div className="card p-5 bg-blue-50 border-blue-200">
            <h3 className="font-bold text-navy mb-3">🔍 Verification Process</h3>
            <div className="space-y-2 text-sm text-blue-800">
              {[['1️⃣','Submit','Fill the form and submit your internship.'],['2️⃣','Review','Malik Mohazin manually reviews company details and links.'],['3️⃣','Verify','Genuineness of the opportunity is confirmed.'],['4️⃣','Published','Approved internships go live with "Verified by Malik Mohazin" badge.']].map(([icon,title,desc])=>(
                <div key={title} className="flex gap-2"><span>{icon}</span><p><strong>{title}:</strong> {desc}</p></div>
              ))}
            </div>
          </div>
          <div className="card p-5">
            <h2 className="font-bold text-navy mb-4">📋 My Submissions ({items.length})</h2>
            {items.length===0
              ? <div className="text-center py-6 text-slate-400"><p className="text-2xl mb-2">📝</p><p className="text-sm">No submissions yet.</p></div>
              : <div className="overflow-auto max-h-96"><table className="tbl"><thead><tr><th>Title</th><th>Field</th><th>Mode</th><th>Status</th></tr></thead><tbody>{items.map(i=>(
                  <tr key={i.id}><td className="font-semibold">{i.title}</td><td>{i.field}</td><td>{i.mode}</td><td><span className={i.status==='approved'?'badge-green':i.status==='pending'?'badge-amber':'badge-red'}>{i.status==='approved'?'✅ Live':i.status==='pending'?'⏳ Pending':'❌ Rejected'}</span></td></tr>
                ))}</tbody></table></div>
            }
          </div>
        </div>
      </div>
    </Shell>
  );
}
