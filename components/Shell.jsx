'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  ['/', '🏠 Dashboard'],
  ['/explorer', '🔍 Browse Internships'],
  ['/student', '🎓 Student Portal'],
  ['/company', '🏢 Company Portal'],
  ['/admin', '⚙️ Admin Panel'],
  ['/about', '💡 About & Credits'],
];

export default function Shell({ children }) {
  const path = usePathname();
  return (
    <div className="min-h-screen" style={{background:'var(--bg)'}}>
      <div className="mx-auto flex max-w-7xl gap-5 p-3 md:p-5">

        {/* Sidebar */}
        <aside className="hidden w-60 shrink-0 md:block">
          <div className="card sticky top-5 p-5 flex flex-col">
            <div className="mb-6 flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-navy font-black text-white text-lg shadow">SI</div>
              <div>
                <p className="font-black text-navy text-sm leading-tight">Smart Internship</p>
                <p className="text-xs text-slate-500">Intelligence Portal</p>
              </div>
            </div>
            <nav className="space-y-1">
              {links.map(([href, label]) => (
                <Link key={href} href={href} className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all ${path===href?'bg-navy text-white shadow-sm':'text-slate-600 hover:bg-slate-100'}`}>
                  {label}
                </Link>
              ))}
            </nav>
            <div className="mt-6 rounded-xl bg-blue-50 border border-blue-100 p-3">
              <p className="text-xs font-bold text-blue-800 mb-1">Role-Based Access</p>
              <p className="text-xs text-blue-600">🎓 Student · 🏢 Company · ⚙️ Admin</p>
            </div>
            <div className="mt-3 rounded-xl bg-slate-50 border border-slate-200 p-3">
              <p className="text-xs text-slate-500 leading-relaxed">
                <span className="font-bold text-slate-700">Created, Researched &amp; Managed by</span><br />
                <span className="text-navy font-bold">Malik Mohazin</span>
              </p>
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="min-w-0 flex-1">
          {/* Mobile header */}
          <header className="mb-4 flex items-center justify-between rounded-2xl bg-white p-3 shadow-sm border border-slate-200 md:hidden">
            <div className="flex items-center gap-2">
              <div className="grid h-8 w-8 place-items-center rounded-lg bg-navy font-black text-white text-xs">SI</div>
              <span className="font-bold text-sm text-navy">SI Portal</span>
            </div>
            <select onChange={e=>{ if(e.target.value) location.href=e.target.value; }} value={path} className="input max-w-40 text-xs">
              {links.map(([href, label]) => <option key={href} value={href}>{label}</option>)}
            </select>
          </header>

          {children}

          <footer className="mt-10 border-t border-slate-200 pt-6 pb-4 text-center">
            <p className="text-xs text-slate-400">
              <span className="font-semibold text-slate-500">Smart Internship Intelligence Portal</span>
              {' · '}Created, Researched &amp; Managed by{' '}
              <span className="font-bold text-navy">Malik Mohazin</span>
              {' · '}All internships verified before publishing
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
}
