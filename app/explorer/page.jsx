'use client';
import { useEffect, useMemo, useState } from 'react';
import Shell from '@/components/Shell';
import InternshipCard from '@/components/InternshipCard';

export default function Explorer() {
  const [items,   setItems]   = useState([]);
  const [q,       setQ]       = useState('');
  const [field,   setField]   = useState('');
  const [mode,    setMode]    = useState('');
  const [paid,    setPaid]    = useState('');
  const [country, setCountry] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    fetch('/api/internships').then(r=>r.json()).then(d=>{setItems(d.internships||[]);setLoading(false);});
  },[]);

  const fields    = [...new Set(items.map(i=>i.field).filter(Boolean))].sort();
  const modes     = [...new Set(items.map(i=>i.mode).filter(Boolean))].sort();
  const countries = [...new Set(items.map(i=>i.country).filter(Boolean))].sort();

  const filtered = useMemo(()=>{
    const ql=q.toLowerCase();
    return items.filter(i=>
      (!q||(i.title+i.companyName+i.skills+i.field+i.city+(i.description||'')).toLowerCase().includes(ql))&&
      (!field   ||i.field===field)&&
      (!mode    ||i.mode===mode)&&
      (!paid    ||i.paidStatus===paid)&&
      (!country ||i.country===country)
    );
  },[items,q,field,mode,paid,country]);

  const reset=()=>{setQ('');setField('');setMode('');setPaid('');setCountry('');};

  return (
    <Shell>
      <div className="card p-6 mb-5">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <h1 className="text-2xl font-black text-navy">🔍 Internship Explorer</h1>
            <p className="text-slate-500 text-sm mt-1">Browse {items.length} verified internships. All manually reviewed by Malik Mohazin.</p>
          </div>
          <span className="badge-green text-sm shrink-0">{filtered.length} Results</span>
        </div>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          <input className="input" placeholder="🔍 Search title, company, skills..." value={q} onChange={e=>setQ(e.target.value)} />
          <select className="input" value={field} onChange={e=>setField(e.target.value)}>
            <option value="">All Fields / Domains</option>
            {fields.map(x=><option key={x}>{x}</option>)}
          </select>
          <select className="input" value={mode} onChange={e=>setMode(e.target.value)}>
            <option value="">All Modes</option>
            {modes.map(x=><option key={x}>{x}</option>)}
          </select>
          <select className="input" value={paid} onChange={e=>setPaid(e.target.value)}>
            <option value="">Paid &amp; Unpaid</option>
            <option>Paid</option><option>Unpaid</option>
          </select>
          <select className="input" value={country} onChange={e=>setCountry(e.target.value)}>
            <option value="">All Countries</option>
            {countries.map(x=><option key={x}>{x}</option>)}
          </select>
          <button className="btn-soft" onClick={reset}>✕ Clear Filters</button>
        </div>
      </div>

      {loading
        ? <div className="text-center py-16 text-slate-400 font-semibold">Loading internships...</div>
        : filtered.length===0
          ? <div className="text-center py-16">
              <p className="text-4xl mb-3">🔍</p>
              <p className="font-bold text-slate-600">No internships found</p>
              <p className="text-slate-400 text-sm">Try adjusting your filters</p>
              <button className="btn-primary mt-4" onClick={reset}>Clear Filters</button>
            </div>
          : <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map(i=><InternshipCard key={i.id} item={i}/>)}
            </div>
      }
    </Shell>
  );
}
