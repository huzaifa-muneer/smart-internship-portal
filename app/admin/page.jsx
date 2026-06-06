'use client';
import { useEffect, useMemo, useState } from 'react';
import Shell from '@/components/Shell';
import InternshipCard from '@/components/InternshipCard';

function AdminLogin({ onAuth }) {
  const [form, setForm] = useState({ email:'', password:'' });
  const [msg, setMsg] = useState('');
  const upd = e => setForm(f=>({...f,[e.target.name]:e.target.value}));
  async function submit() {
    setMsg('Authenticating...');
    const res = await fetch('/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...form,role:'admin'})});
    const data = await res.json();
    if(!res.ok){setMsg(data.error||'Access denied');return;}
    localStorage.setItem('token',data.token);
    localStorage.setItem('user',JSON.stringify(data.user));
    onAuth(data.user,data.token);
  }
  return (
    <div className="card p-6 max-w-sm mx-auto">
      <h2 className="text-2xl font-black text-navy mb-1">⚙️ Admin Panel</h2>
      <p className="text-sm text-slate-500 mb-4">Restricted to authorized administrators only.</p>
      <div className="grid gap-3">
        <input className="input" name="email" value={form.email} onChange={upd} type="email" placeholder="Admin email" />
        <input className="input" name="password" value={form.password} onChange={upd} type="password" placeholder="Admin password" />
        {msg && <p className="text-sm font-semibold text-red-500">{msg}</p>}
        <button className="btn-primary" onClick={submit}>🔐 Sign In as Admin</button>
        <p className="text-xs text-slate-400 text-center">Default: admin@siportal.local / admin12345</p>
      </div>
    </div>
  );
}

export default function Admin() {
  const [user,      setUser]      = useState(null);
  const [token,     setToken]     = useState('');
  const [items,     setItems]     = useState([]);
  const [apps,      setApps]      = useState([]);
  const [students,  setStudents]  = useState([]);
  const [companies, setCompanies] = useState([]);
  const [stats,     setStats]     = useState({});
  const [topFields, setTopFields] = useState([]);
  const [topSkills, setTopSkills] = useState([]);
  const [q,         setQ]         = useState('');
  const [statusF,   setStatusF]   = useState('all');
  const [tab,       setTab]       = useState('overview');
  const [file,      setFile]      = useState(null);
  const [msg,       setMsg]       = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(()=>{
    const t=localStorage.getItem('token'); const u=localStorage.getItem('user');
    if(t&&u){const p=JSON.parse(u);if(p.role==='admin'){setToken(t);setUser(p);}}
  },[]);
  useEffect(()=>{if(token)load();},[token]);

  async function load() {
    const hdr={Authorization:'Bearer '+token};
    fetch('/api/internships?admin=1',{headers:hdr}).then(r=>r.json()).then(d=>setItems(d.internships||[]));
    fetch('/api/applications',{headers:hdr}).then(r=>r.json()).then(d=>{setApps(d.applications||[]);setStudents(d.students||[]);});
    fetch('/api/companies',{headers:hdr}).then(r=>r.json()).then(d=>setCompanies(d.companies||[]));
    fetch('/api/dashboard').then(r=>r.json()).then(d=>{setStats(d.stats||{});setTopFields(d.topFields||[]);setTopSkills(d.topSkills||[]);});
  }

  async function patch(id,body) {
    await fetch('/api/internships/'+id,{method:'PATCH',headers:{'Content-Type':'application/json',Authorization:'Bearer '+token},body:JSON.stringify(body)});
    load();
  }
  async function del(id) {
    if(!confirm('Delete this record permanently?'))return;
    await fetch('/api/internships/'+id,{method:'DELETE',headers:{Authorization:'Bearer '+token}});
    load();
  }
  async function upload() {
    if(!file){setMsg('Please select a file first.');return;}
    setUploading(true);setMsg('Importing...');
    const fd=new FormData();fd.append('file',file);
    const res=await fetch('/api/internships/import',{method:'POST',headers:{Authorization:'Bearer '+token},body:fd});
    const d=await res.json();
    setUploading(false);
    setMsg(res.ok?`✅ Imported ${d.imported} records, skipped ${d.skipped} duplicates.`:'❌ '+d.error);
    if(res.ok){setFile(null);load();}
  }
  function exportFile(format) {
    const url=format==='csv'?'/api/internships/export?format=csv':'/api/internships/export';
    fetch(url,{headers:{Authorization:'Bearer '+token}}).then(r=>r.blob()).then(b=>{
      const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=`internships.${format}`;a.click();
    });
  }

  const filtered = useMemo(()=>{
    const ql=q.toLowerCase();
    return items.filter(i=>(statusF==='all'||i.status===statusF)&&(!q||(i.title+i.companyName+i.field+i.city+i.skills).toLowerCase().includes(ql)));
  },[items,q,statusF]);

  const pending  = items.filter(i=>i.status==='pending').length;
  const approved = items.filter(i=>i.status==='approved').length;
  const rejected = items.filter(i=>i.status==='rejected').length;

  const TABS=[['overview','📊 Overview'],['records','📋 Records'],['students','🎓 Students'],['applications','📨 Applications'],['companies','🏢 Companies'],['import','📥 Import/Export']];

  if(!user) {
    return (
      <Shell>
        <div className="mb-6 card p-6 bg-gradient-to-br from-slate-800 to-navy text-white rounded-3xl">
          <h1 className="text-3xl font-black mb-2">⚙️ Admin Control Center</h1>
          <p className="text-slate-300 max-w-xl">Manage all internship records, verify submissions, view students, track applications, and export data. Created &amp; managed by Malik Mohazin.</p>
        </div>
        <AdminLogin onAuth={(u,t)=>{setUser(u);setToken(t);}} />
      </Shell>
    );
  }

  return (
    <Shell>
      {/* Admin header */}
      <div className="card p-4 mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-navy font-black text-white text-sm shadow">⚙️</div>
          <div><p className="font-black text-navy text-sm">Admin Control Center</p><p className="text-xs text-slate-500">Logged in as {user.email} · Malik Mohazin Portal</p></div>
        </div>
        <button className="btn-soft text-xs" onClick={()=>{localStorage.clear();setUser(null);setToken('');}}>Sign Out</button>
      </div>

      {/* Pending alert */}
      {pending>0 && (
        <div className="mb-4 rounded-xl bg-amber-50 border border-amber-200 p-3 flex items-center justify-between">
          <p className="text-sm font-semibold text-amber-700">⚠️ {pending} internship{pending>1?'s':''} pending your review &amp; verification</p>
          <button className="text-xs font-bold text-amber-700 hover:underline" onClick={()=>{setTab('records');setStatusF('pending');}}>Review now →</button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-5">
        {TABS.map(([key,label])=>(
          <button key={key} onClick={()=>setTab(key)} className={`text-xs px-3 py-2 rounded-xl font-semibold border transition ${tab===key?'bg-navy text-white border-navy':'bg-white text-slate-600 border-slate-200 hover:border-navy'}`}>{label}</button>
        ))}
      </div>

      {/* ── OVERVIEW ── */}
      {tab==='overview' && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {[['Total Internships',stats.totalInternships,'📋','#0f2742'],['Approved & Live',approved,'✅','#059669'],['Pending Review',pending,'⏳','#d97706'],['Rejected',rejected,'❌','#dc2626'],['Paid Internships',stats.paidInternships,'💰','#7c3aed'],['Remote',stats.remoteInternships,'🌐','#2563eb'],['Students',students.length,'🎓','#0891b2'],['Applications',apps.length,'📨','#16a34a']].map(([label,value,icon,color])=>(
              <div key={label} className="card p-4">
                <div className="flex items-center justify-between mb-1"><p className="text-xs font-semibold text-slate-500">{label}</p><span className="text-lg">{icon}</span></div>
                <p className="text-2xl font-black" style={{color}}>{value??0}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="card p-5">
              <h3 className="font-bold text-navy mb-4">📊 Top Fields</h3>
              <div className="space-y-2">
                {topFields.slice(0,8).map(({field,count})=>(
                  <div key={field} className="flex items-center gap-3">
                    <span className="text-xs text-slate-600 w-36 truncate">{field}</span>
                    <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden"><div className="h-full rounded-full bg-blue-500" style={{width:`${Math.round((count/(topFields[0]?.count||1))*100)}%`}} /></div>
                    <span className="text-xs font-bold text-slate-500 w-6 text-right">{count}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="card p-5">
              <h3 className="font-bold text-navy mb-4">⚡ Most Demanded Skills</h3>
              <div className="flex flex-wrap gap-1.5">
                {topSkills.slice(0,20).map(({skill,count})=>(
                  <span key={skill} className="badge-blue text-xs">{skill} <strong>({count})</strong></span>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="card p-5">
              <h3 className="font-bold text-navy mb-4">💰 Paid vs Unpaid</h3>
              {[['Paid',stats.paidInternships,'#059669'],['Unpaid',(stats.totalInternships||0)-(stats.paidInternships||0),'#94a3b8']].map(([label,count,color])=>(
                <div key={label} className="mb-3">
                  <div className="flex justify-between text-xs mb-1"><span className="font-semibold text-slate-600">{label}</span><span className="font-bold" style={{color}}>{count??0}</span></div>
                  <div className="h-3 rounded-full bg-slate-100 overflow-hidden"><div className="h-full rounded-full transition-all" style={{width:`${Math.round(((count||0)/Math.max(1,stats.totalInternships||1))*100)}%`,background:color}} /></div>
                </div>
              ))}
            </div>
            <div className="card p-5">
              <h3 className="font-bold text-navy mb-4">🌐 Remote vs On-site vs Hybrid</h3>
              {[['Remote',stats.remoteInternships,'#2563eb'],['On-site',stats.onSiteInternships,'#7c3aed'],['Hybrid',stats.hybridInternships,'#d97706']].map(([label,count,color])=>(
                <div key={label} className="mb-3">
                  <div className="flex justify-between text-xs mb-1"><span className="font-semibold text-slate-600">{label}</span><span className="font-bold" style={{color}}>{count??0}</span></div>
                  <div className="h-3 rounded-full bg-slate-100 overflow-hidden"><div className="h-full rounded-full transition-all" style={{width:`${Math.round(((count||0)/Math.max(1,stats.totalInternships||1))*100)}%`,background:color}} /></div>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-5 bg-navy text-white">
            <h3 className="font-bold mb-1">🏆 About This Portal</h3>
            <p className="text-sm text-blue-200"><strong className="text-white">Smart Internship Intelligence Portal</strong> — Created, Researched &amp; Managed by <strong className="text-yellow-300">Malik Mohazin</strong>. All internships manually verified before publishing. AI-based smart matching connects students with the right opportunities.</p>
          </div>
        </div>
      )}

      {/* ── RECORDS ── */}
      {tab==='records' && (
        <div>
          <div className="card p-4 mb-4">
            <div className="flex flex-wrap gap-3 items-center">
              <input className="input flex-1 min-w-48" placeholder="🔍 Search by title, company, field, city..." value={q} onChange={e=>setQ(e.target.value)} />
              <div className="flex gap-2 flex-wrap">
                {[['all','All'],['pending','⏳ Pending'],['approved','✅ Approved'],['rejected','❌ Rejected']].map(([v,l])=>(
                  <button key={v} onClick={()=>setStatusF(v)} className={`text-xs px-3 py-2 rounded-lg font-semibold border transition ${statusF===v?'bg-navy text-white border-navy':'bg-white text-slate-600 border-slate-200'}`}>
                    {l} ({v==='all'?items.length:items.filter(i=>i.status===v).length})
                  </button>
                ))}
              </div>
            </div>
          </div>
          <p className="text-sm text-slate-500 mb-4 font-semibold">{filtered.length} records shown</p>
          <div className="grid gap-4 md:grid-cols-2">
            {filtered.slice(0,60).map(i=><InternshipCard key={i.id} item={i} admin onUpdate={patch} onDelete={del}/>)}
          </div>
          {filtered.length>60 && <p className="text-center text-slate-400 text-sm mt-4">Showing 60 of {filtered.length}. Use search to narrow down.</p>}
        </div>
      )}

      {/* ── STUDENTS ── */}
      {tab==='students' && (
        <div className="card p-5">
          <h2 className="font-bold text-navy mb-4">🎓 Student Registrations ({students.length})</h2>
          {students.length===0
            ? <div className="text-center py-8 text-slate-400">No students registered yet.</div>
            : <div className="overflow-auto"><table className="tbl"><thead><tr><th>Name</th><th>Email</th><th>University</th><th>Field</th><th>City</th><th>Skills</th><th>Date</th></tr></thead><tbody>
                {students.map(s=>(
                  <tr key={s.id}>
                    <td className="font-semibold">{s.name||'—'}</td>
                    <td className="text-slate-500">{s.email}</td>
                    <td>{s.university||'—'}</td>
                    <td>{s.field?<span className="badge-blue">{s.field}</span>:'—'}</td>
                    <td>{s.city||'—'}</td>
                    <td className="max-w-32 truncate text-xs text-slate-500">{s.skills||'—'}</td>
                    <td className="text-xs text-slate-400">{s.created_at?.split('T')[0]||'—'}</td>
                  </tr>
                ))}
              </tbody></table></div>
          }
        </div>
      )}

      {/* ── APPLICATIONS ── */}
      {tab==='applications' && (
        <div className="card p-5">
          <h2 className="font-bold text-navy mb-4">📨 All Applications ({apps.length})</h2>
          {apps.length===0
            ? <div className="text-center py-8 text-slate-400">No applications yet.</div>
            : <div className="overflow-auto"><table className="tbl"><thead><tr><th>Student</th><th>Email</th><th>Internship</th><th>Company</th><th>Match %</th><th>Status</th><th>Date</th></tr></thead><tbody>
                {apps.map(a=>(
                  <tr key={a.id}>
                    <td className="font-semibold">{a.student_name||'—'}</td>
                    <td className="text-xs text-slate-500">{a.student_email}</td>
                    <td>{a.internship_title}</td>
                    <td>{a.company_name}</td>
                    <td><span className={a.match_score>=70?'badge-green':a.match_score>=50?'badge-blue':'badge-slate'}>{a.match_score||0}%</span></td>
                    <td><span className="badge-blue">{a.status}</span></td>
                    <td className="text-xs text-slate-400">{a.created_at?.split('T')[0]}</td>
                  </tr>
                ))}
              </tbody></table></div>
          }
        </div>
      )}

      {/* ── COMPANIES ── */}
      {tab==='companies' && (
        <div className="card p-5">
          <h2 className="font-bold text-navy mb-4">🏢 Registered Companies ({companies.length})</h2>
          {companies.length===0
            ? <div className="text-center py-8 text-slate-400">No company registrations yet.</div>
            : <div className="overflow-auto"><table className="tbl"><thead><tr><th>Company</th><th>Email</th><th>HR Name</th><th>Website</th><th>Contact</th><th>Status</th></tr></thead><tbody>
                {companies.map(c=>(
                  <tr key={c.id}>
                    <td className="font-semibold">{c.company_name||'—'}</td>
                    <td className="text-xs text-slate-500">{c.email}</td>
                    <td>{c.hr_name||'—'}</td>
                    <td>{c.website?<a href={c.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-xs hover:underline">Visit</a>:'—'}</td>
                    <td className="text-xs">{c.contact||'—'}</td>
                    <td><span className={c.status==='active'?'badge-green':'badge-amber'}>{c.status||'pending'}</span></td>
                  </tr>
                ))}
              </tbody></table></div>
          }
        </div>
      )}

      {/* ── IMPORT / EXPORT ── */}
      {tab==='import' && (
        <div className="grid gap-5 md:grid-cols-2">
          <div className="card p-5">
            <h2 className="font-bold text-navy mb-1">📥 Import from Excel / CSV</h2>
            <p className="text-sm text-slate-500 mb-4">Upload .xlsx or .csv to bulk-import internships. Duplicates are skipped automatically.</p>
            <div className="grid gap-3">
              <input className="input" type="file" accept=".xlsx,.xls,.csv" onChange={e=>setFile(e.target.files[0])} />
              {file && <p className="text-xs text-slate-500">Selected: {file.name}</p>}
              <button className="btn-primary" onClick={upload} disabled={uploading||!file}>{uploading?'⏳ Importing...':'📤 Upload & Import'}</button>
            </div>
            {msg && <div className={`mt-3 rounded-xl p-3 text-sm font-semibold ${msg.startsWith('✅')?'bg-emerald-50 text-emerald-700 border border-emerald-200':'bg-red-50 text-red-600 border border-red-200'}`}>{msg}</div>}
            <div className="mt-4 rounded-xl bg-blue-50 border border-blue-200 p-4 text-xs text-blue-800">
              <p className="font-bold mb-2">Supported Excel Columns:</p>
              <p className="leading-relaxed">Internship ID, Internship Title, Company / Organization Name, Field / Domain, Required Skills, City, Country, Internship Mode, Paid or Unpaid, Monthly Stipend, Duration, Deadline, Direct Apply Link, HR Contact Email, Description, Verified Status, Application Status</p>
            </div>
          </div>
          <div className="card p-5">
            <h2 className="font-bold text-navy mb-1">📤 Export Data</h2>
            <p className="text-sm text-slate-500 mb-4">Export approved internship records for university use or sharing.</p>
            <div className="grid gap-3">
              <button className="btn-green" onClick={()=>exportFile('xlsx')}>📊 Export as Excel (.xlsx)</button>
              <button className="btn-soft" onClick={()=>exportFile('csv')}>📄 Export as CSV</button>
            </div>
            <div className="mt-4 rounded-xl bg-emerald-50 border border-emerald-200 p-4">
              <p className="text-xs font-bold text-emerald-800 mb-2">📊 Current Database</p>
              <div className="grid grid-cols-2 gap-2 text-xs text-emerald-700">
                <span>Total Records: <strong>{items.length}</strong></span>
                <span>Approved: <strong>{approved}</strong></span>
                <span>Pending: <strong>{pending}</strong></span>
                <span>Students: <strong>{students.length}</strong></span>
              </div>
            </div>
          </div>
        </div>
      )}
    </Shell>
  );
}
