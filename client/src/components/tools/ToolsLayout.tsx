import { Link, Outlet } from 'react-router-dom'
import { ArrowRight, Wrench } from 'lucide-react'

export function ToolsLayout() {
  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col">
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/verktyg" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-lg bg-slate-900 flex items-center justify-center group-hover:bg-slate-800 transition-colors">
              <Wrench className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="font-semibold text-slate-900 leading-tight">Platsledning.ai</div>
              <div className="text-[11px] text-slate-500 leading-tight">Gratis byggverktyg</div>
            </div>
          </Link>

          <nav className="hidden sm:flex items-center gap-6 text-sm">
            <Link
              to="/verktyg"
              className="text-slate-600 hover:text-slate-900 transition-colors"
            >
              Alla verktyg
            </Link>
            <Link
              to="/verktyg/brunnfall-kalkylator"
              className="text-slate-600 hover:text-slate-900 transition-colors"
            >
              Brunnfall
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition-colors"
            >
              Logga in
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </nav>

          <Link
            to="/login"
            className="sm:hidden inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 text-white text-sm font-medium"
          >
            Logga in
          </Link>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-slate-200 bg-white mt-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="font-semibold text-slate-900 mb-2">Platsledning.ai</div>
              <p className="text-sm text-slate-500 leading-relaxed">
                Gratis verktyg för byggbranschen. Beräkningar baserade på AMA, BBR och branschregler.
              </p>
            </div>
            <div>
              <div className="font-medium text-slate-900 mb-3 text-sm">Verktyg</div>
              <ul className="space-y-2 text-sm text-slate-500">
                <li>
                  <Link to="/verktyg/brunnfall-kalkylator" className="hover:text-slate-900 transition-colors">
                    Brunnfall-kalkylator
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <div className="font-medium text-slate-900 mb-3 text-sm">Plattform</div>
              <ul className="space-y-2 text-sm text-slate-500">
                <li>
                  <Link to="/login" className="hover:text-slate-900 transition-colors">
                    Projektledning för bygg
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-slate-100 text-xs text-slate-400">
            Verktygen ger vägledande beräkningar. Projektering ska alltid verifieras mot gällande AMA, BBR och lokala krav.
          </div>
        </div>
      </footer>
    </div>
  )
}
