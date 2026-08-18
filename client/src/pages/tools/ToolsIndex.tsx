import { Link } from 'react-router-dom'
import { ArrowRight, Calculator, Droplets, Ruler } from 'lucide-react'
import { SeoHead } from '@/components/tools/SeoHead'

const TOOLS = [
  {
    slug: 'brunnfall-kalkylator',
    title: 'Brunnfall-kalkylator',
    description:
      'Räkna ut rätt lutning mot golvbrunn enligt AMA, BBR och GVK. Badrum, storkök, garage och spillvattenrör.',
    icon: Droplets,
    available: true,
    tags: ['VVS', 'Våtrum', 'AMA'],
  },
  {
    slug: 'tattskiktsarea',
    title: 'Tätskiktsarea våtrum',
    description: 'Beräkna tätskiktsarea och materialåtgång för våtrum.',
    icon: Ruler,
    available: false,
    tags: ['Våtrum', 'Kommer snart'],
  },
]

export function ToolsIndex() {
  return (
    <>
      <SeoHead
        title="Gratis byggverktyg"
        description="Kostnadsfria verktyg för byggbranschen. Brunnfall-kalkylator enligt AMA och BBR. För platschefer, VVS-installatörer och projektörer."
        path="/verktyg"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: 'Gratis byggverktyg – Platsledning.ai',
          description: 'Kostnadsfria verktyg för byggbranschen baserade på AMA och BBR.',
          url: 'https://platsledning.ai/verktyg',
        }}
      />

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900" />
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-400 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-400 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-teal-200 text-xs font-medium mb-6">
              <Calculator className="w-3.5 h-3.5" />
              Gratis för byggbranschen
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight mb-4">
              Verktyg som sparar tid på plats
            </h1>
            <p className="text-lg text-slate-300 leading-relaxed">
              Professionella beräkningar baserade på AMA, BBR och branschregler.
              Inga konto krävs – använd direkt i mobilen på bygget.
            </p>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 -mt-8 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {TOOLS.map(tool => {
            const Icon = tool.icon
            const content = (
              <div
                className={`group relative bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm transition-all ${
                  tool.available
                    ? 'hover:shadow-lg hover:border-teal-200 hover:-translate-y-0.5 cursor-pointer'
                    : 'opacity-60'
                }`}
              >
                {!tool.available && (
                  <span className="absolute top-4 right-4 text-xs font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-500">
                    Kommer snart
                  </span>
                )}
                <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center mb-5 group-hover:bg-teal-100 transition-colors">
                  <Icon className="w-6 h-6 text-teal-700" />
                </div>
                <h2 className="text-xl font-semibold text-slate-900 mb-2">{tool.title}</h2>
                <p className="text-slate-500 text-sm leading-relaxed mb-4">{tool.description}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {tool.tags.map(tag => (
                    <span key={tag} className="text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                      {tag}
                    </span>
                  ))}
                </div>
                {tool.available && (
                  <span className="inline-flex items-center gap-1 text-sm font-medium text-teal-700 group-hover:gap-2 transition-all">
                    Öppna verktyg
                    <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </div>
            )

            return tool.available ? (
              <Link key={tool.slug} to={`/verktyg/${tool.slug}`}>
                {content}
              </Link>
            ) : (
              <div key={tool.slug}>{content}</div>
            )
          })}
        </div>

        <div className="mt-12 bg-slate-900 rounded-2xl p-8 sm:p-10 text-center">
          <h3 className="text-xl font-semibold text-white mb-2">Behöver du mer än beräkningar?</h3>
          <p className="text-slate-400 mb-6 max-w-lg mx-auto">
            Platsledning.ai samlar projekt, avvikelser, egenkontroller och uppgifter – allt för byggprojektledning.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-slate-900 font-medium hover:bg-slate-100 transition-colors"
          >
            Prova Platsledning.ai
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </>
  )
}
