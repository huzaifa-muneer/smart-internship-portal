'use client';
import { matchLabel } from '@/lib/matching';

function MatchBar({ score }) {
  const color = score>=80?'#10b981':score>=60?'#3b82f6':score>=40?'#f59e0b':'#94a3b8';
  return (
    <div className="mt-2">
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="font-semibold text-slate-600">Match Score</span>
        <span className="font-bold" style={{color}}>{score}%</span>
      </div>
      <div className="match-bar">
        <div className="match-fill" style={{width:`${score}%`,background:color}} />
      </div>
    </div>
  );
}

export default function InternshipCard({ item, score, onApply, admin, onUpdate, onDelete }) {
  const statusBadge = item.status==='approved'?'badge-green':item.status==='pending'?'badge-amber':'badge-red';
  const skillList = String(item.skills||'').split(',').map(s=>s.trim()).filter(Boolean).slice(0,5);
  const isVerified = item.status==='approved'||item.verifiedStatus==='Verified';

  return (
    <div className="card p-5 flex flex-col hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="min-w-0">
          <h3 className="font-bold text-navy text-base leading-tight line-clamp-2">{item.title}</h3>
          <p className="text-sm text-slate-500 mt-0.5 truncate">{item.companyName}</p>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          {item.featured && <span className="badge-amber">⭐ Featured</span>}
          <span className={statusBadge}>
            {item.status==='approved'?'Verified':item.status==='pending'?'Pending':'Rejected'}
          </span>
        </div>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5 mb-2">
        {item.field   && <span className="badge-blue">{item.field}</span>}
        {item.mode    && <span className="badge-slate">{item.mode}</span>}
        {item.paidStatus && <span className={item.paidStatus==='Paid'?'badge-green':'badge-slate'}>{item.paidStatus==='Paid'?'💰 Paid':'Unpaid'}</span>}
      </div>

      {/* Info */}
      <p className="text-xs text-slate-500 mb-2">
        📍 {item.city||'Remote'} · {item.country||'Pakistan'}
        {item.duration?` · ${item.duration}`:''}
        {item.deadline?` · Deadline: ${item.deadline}`:''}
      </p>

      {/* Skills */}
      {skillList.length>0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {skillList.map(s=><span key={s} className="badge-purple text-xs">{s}</span>)}
        </div>
      )}

      {/* Description */}
      {item.description && <p className="text-xs text-slate-500 line-clamp-2 mb-3">{item.description}</p>}

      {/* Match bar */}
      {score!==undefined && <MatchBar score={score} />}

      {/* Verified credit */}
      {isVerified && <p className="text-xs text-emerald-600 font-semibold mt-2">✅ Verified by Malik Mohazin</p>}

      {/* Actions */}
      <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-slate-100">
        {onApply && <button className="btn-primary flex-1" onClick={()=>onApply(item,score)}>Apply Now</button>}
        {item.applyLink && <a className="btn-soft flex-1 text-center" href={item.applyLink} target="_blank" rel="noopener noreferrer">🔗 Apply Link</a>}
        {admin && <>
          <button className="btn-soft text-xs" onClick={()=>onUpdate(item.id,{featured:!item.featured})}>{item.featured?'Unfeature':'⭐ Feature'}</button>
          {item.status!=='approved' && <button className="btn-green text-xs" onClick={()=>onUpdate(item.id,{status:'approved',verifiedStatus:'Verified'})}>✅ Approve</button>}
          {item.status==='approved'  && <button className="btn-amber text-xs" onClick={()=>onUpdate(item.id,{status:'pending',verifiedStatus:'Pending'})}>Unpublish</button>}
          {item.status!=='rejected'  && <button className="btn-red text-xs" onClick={()=>onUpdate(item.id,{status:'rejected',verifiedStatus:'Rejected'})}>Reject</button>}
          <button className="btn-soft text-xs text-red-600" onClick={()=>onDelete(item.id)}>🗑 Delete</button>
        </>}
      </div>
    </div>
  );
}
