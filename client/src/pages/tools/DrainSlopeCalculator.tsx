import { useState, useMemo, type ComponentType } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  Bath,
  Car,
  Check,
  ChefHat,
  ChevronDown,
  Factory,
  Info,
  Pipette,
  ShowerHead,
  Shirt,
  AlertTriangle,
  CheckCircle2,
  XCircle,
} from 'lucide-react'
import { SeoHead } from '@/components/tools/SeoHead'
import { DrainVisualization } from '@/components/tools/DrainVisualization'
import { cn } from '@/lib/utils'
import {
  ROOM_OPTIONS,
  DRAIN_OPTIONS,
  PIPE_SLOPE_RULES,
  SLOPE_RULES,
  type RoomCategory,
  type DrainType,
} from '@/lib/tools/drainSlopeRules'
import {
  calculateDrainSlope,
  formatMm,
  formatDistanceM,
  mmPerMToPercent,
  type ValidationStatus,
} from '@/lib/tools/drainSlopeCalc'

const ICONS: Record<string, ComponentType<{ className?: string }>> = {
  shower: ShowerHead,
  washing: Shirt,
  chef: ChefHat,
  car: Car,
  factory: Factory,
  pipe: Pipette,
}

type Step = 1 | 2 | 3 | 4

const FAQ = [
  {
    q: 'Vilket fall ska jag ha i duschen?',
    a: 'I duschplats gäller minst 7 mm/m (1:150) och högst 30 mm/m (1:35) enligt GVK Säkra Våtrum 2026. Riktvärde vid projektering är ca 15 mm/m.',
  },
  {
    q: 'Hur långt från väggen ska golvbrunnen sitta?',
    a: 'Enligt Säker Vatten ska avståndet mellan golvbrunnens yttre fläns och väggens tätskikt vara minst 200 mm, om inte typgodkänd väggnära brunn används.',
  },
  {
    q: 'Vilket fall krävs på spillvattenrör?',
    a: 'Minimilutning beror på rördimension: DN 50 = 20 mm/m, DE/DN 75 = 14 mm/m, DN 100/110 = 9 mm/m enligt leverantörsanvisningar och AMA VVS.',
  },
  {
    q: 'Vilket fall ska storkök ha?',
    a: 'Minst 1:100 (10 mm/m) mot avloppspunkter rekommenderas. Plushöjd bör vara minst 100 mm för självfall.',
  },
]

function StatusBadge({ status }: { status: ValidationStatus }) {
  const config = {
    ok: { icon: CheckCircle2, className: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Godkänt' },
    warning: { icon: AlertTriangle, className: 'bg-amber-50 text-amber-700 border-amber-200', label: 'Varning' },
    error: { icon: XCircle, className: 'bg-red-50 text-red-700 border-red-200', label: 'Underkänt' },
    info: { icon: Info, className: 'bg-blue-50 text-blue-700 border-blue-200', label: 'Info' },
  }[status]
  const Icon = config.icon
  return (
    <span className={cn('inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border', config.className)}>
      <Icon className="w-4 h-4" />
      {config.label}
    </span>
  )
}

export function DrainSlopeCalculator() {
  const [step, setStep] = useState<Step>(1)
  const [selectedRoom, setSelectedRoom] = useState<RoomCategory | null>(null)
  const [bathroomZone, setBathroomZone] = useState<'dusch' | 'ovrig'>('dusch')
  const [drainType, setDrainType] = useState<DrainType | null>(null)
  const [distanceM, setDistanceM] = useState('2.0')
  const [distanceToWallMm, setDistanceToWallMm] = useState('')
  const [plannedSlope, setPlannedSlope] = useState('')
  const [pipeDiameter, setPipeDiameter] = useState('DN100')
  const [pipeLengthM, setPipeLengthM] = useState('5')
  const [faqOpen, setFaqOpen] = useState<number | null>(null)

  const isBathroom = selectedRoom === 'badrum_dusch'
  const isPipe = selectedRoom === 'spillvattenror'
  const effectiveRuleId: RoomCategory | null = isBathroom
    ? bathroomZone === 'dusch'
      ? 'badrum_dusch'
      : 'badrum_ovrig'
    : selectedRoom

  const availableDrains = useMemo(() => {
    if (!effectiveRuleId) return []
    return DRAIN_OPTIONS.filter(d => d.applicableRooms.includes(effectiveRuleId))
  }, [effectiveRuleId])

  const result = useMemo(() => {
    if (!effectiveRuleId || step < 4) return null
    const dist = parseFloat(distanceM.replace(',', '.'))
    if (isNaN(dist) || dist <= 0) return null

    return calculateDrainSlope({
      roomCategory: effectiveRuleId,
      zone: isBathroom ? bathroomZone : undefined,
      distanceM: dist,
      distanceToWallMm: distanceToWallMm ? parseFloat(distanceToWallMm.replace(',', '.')) : undefined,
      plannedSlopeMmPerM: plannedSlope ? parseFloat(plannedSlope.replace(',', '.')) : undefined,
      pipeDiameter: isPipe ? pipeDiameter : undefined,
      pipeLengthM: isPipe ? parseFloat(pipeLengthM.replace(',', '.')) : undefined,
    })
  }, [effectiveRuleId, step, distanceM, distanceToWallMm, plannedSlope, isBathroom, bathroomZone, isPipe, pipeDiameter, pipeLengthM])

  const stepLabels = ['Utrymme', isPipe ? 'Rör' : 'Detaljer', 'Mått', 'Resultat']

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'Brunnfall-kalkylator',
      applicationCategory: 'UtilitiesApplication',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'SEK' },
      description: 'Beräkna rätt fall mot golvbrunn enligt AMA, BBR och GVK.',
      url: 'https://byggos.vercel.app/verktyg/brunnfall-kalkylator',
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: FAQ.map(item => ({
        '@type': 'Question',
        name: item.q,
        acceptedAnswer: { '@type': 'Answer', text: item.a },
      })),
    },
  ]

  const goNext = () => setStep(s => Math.min(4, s + 1) as Step)
  const goBack = () => setStep(s => Math.max(1, s - 1) as Step)

  const canProceedStep1 = selectedRoom !== null
  const canProceedStep2 = isPipe || isBathroom || drainType !== null || availableDrains.length === 0
  const canProceedStep3 = (() => {
    const dist = parseFloat(distanceM.replace(',', '.'))
    if (isPipe) {
      const len = parseFloat(pipeLengthM.replace(',', '.'))
      return !isNaN(dist) && dist > 0 && !isNaN(len) && len > 0
    }
    return !isNaN(dist) && dist > 0
  })()

  return (
    <>
      <SeoHead
        title="Brunnfall-kalkylator – rätt lutning enligt AMA & BBR"
        description="Gratis kalkylator för brunnfall och golvavrinning. Badrum, dusch, storkök och spillvattenrör enligt AMA, BBR och GVK Säkra Våtrum 2026."
        path="/verktyg/brunnfall-kalkylator"
        jsonLd={jsonLd}
      />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <Link
          to="/verktyg"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Alla verktyg
        </Link>

        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-2">
            Brunnfall-kalkylator
          </h1>
          <p className="text-slate-500 leading-relaxed">
            Räkna ut rätt lutning mot golvbrunn enligt AMA, BBR och branschregler.
            Välj utrymme, ange mått – få svar direkt.
          </p>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {stepLabels.map((label, i) => {
            const num = (i + 1) as Step
            const active = step === num
            const done = step > num
            return (
              <div key={label} className="flex items-center gap-2 flex-1">
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium shrink-0 transition-colors',
                    done && 'bg-teal-600 text-white',
                    active && 'bg-slate-900 text-white',
                    !done && !active && 'bg-slate-100 text-slate-400',
                  )}
                >
                  {done ? <Check className="w-4 h-4" /> : num}
                </div>
                <span
                  className={cn(
                    'text-xs font-medium hidden sm:block',
                    active ? 'text-slate-900' : 'text-slate-400',
                  )}
                >
                  {label}
                </span>
                {i < stepLabels.length - 1 && (
                  <div className={cn('flex-1 h-0.5 rounded', done ? 'bg-teal-600' : 'bg-slate-200')} />
                )}
              </div>
            )
          })}
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Step 1: Room */}
          {step === 1 && (
            <div className="p-6 sm:p-8">
              <h2 className="text-lg font-semibold text-slate-900 mb-1">Vilket utrymme gäller det?</h2>
              <p className="text-sm text-slate-500 mb-6">Valet styr vilka regler som används i beräkningen.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {ROOM_OPTIONS.map(room => {
                  const Icon = ICONS[room.icon] ?? Bath
                  const selected = selectedRoom === room.id || (room.id === 'badrum_dusch' && selectedRoom === 'badrum_dusch')
                  return (
                    <button
                      key={room.id}
                      type="button"
                      onClick={() => {
                        setSelectedRoom(room.id)
                        setDrainType(null)
                      }}
                      className={cn(
                        'text-left p-4 rounded-xl border-2 transition-all',
                        selected
                          ? 'border-teal-600 bg-teal-50/50 ring-1 ring-teal-600/20'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50',
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={cn(
                            'w-10 h-10 rounded-lg flex items-center justify-center shrink-0',
                            selected ? 'bg-teal-100' : 'bg-slate-100',
                          )}
                        >
                          <Icon className={cn('w-5 h-5', selected ? 'text-teal-700' : 'text-slate-500')} />
                        </div>
                        <div>
                          <div className="font-medium text-slate-900">{room.label}</div>
                          <div className="text-xs text-slate-500 mt-0.5 leading-relaxed">{room.description}</div>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Step 2: Details */}
          {step === 2 && (
            <div className="p-6 sm:p-8">
              {isBathroom && (
                <>
                  <h2 className="text-lg font-semibold text-slate-900 mb-1">Vilken del av badrummet?</h2>
                  <p className="text-sm text-slate-500 mb-6">Duschplats och övrig yta har olika krav enligt GVK.</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                    {(['dusch', 'ovrig'] as const).map(zone => {
                      const rule = zone === 'dusch' ? SLOPE_RULES.badrum_dusch : SLOPE_RULES.badrum_ovrig
                      const selected = bathroomZone === zone
                      return (
                        <button
                          key={zone}
                          type="button"
                          onClick={() => setBathroomZone(zone)}
                          className={cn(
                            'text-left p-4 rounded-xl border-2 transition-all',
                            selected
                              ? 'border-teal-600 bg-teal-50/50'
                              : 'border-slate-200 hover:border-slate-300',
                          )}
                        >
                          <div className="font-medium text-slate-900">{rule.label}</div>
                          <div className="text-xs text-slate-500 mt-1">
                            {rule.minMmPerM}–{rule.maxMmPerM ?? '∞'} mm/m
                          </div>
                        </button>
                      )
                    })}
                  </div>

                  <h2 className="text-lg font-semibold text-slate-900 mb-1">Typ av brunn</h2>
                  <p className="text-sm text-slate-500 mb-4">Valfritt – påverkar avståndskrav till vägg.</p>
                  <div className="grid grid-cols-1 gap-3">
                    {availableDrains.map(drain => (
                      <button
                        key={drain.id}
                        type="button"
                        onClick={() => setDrainType(drainType === drain.id ? null : drain.id)}
                        className={cn(
                          'text-left p-4 rounded-xl border-2 transition-all',
                          drainType === drain.id
                            ? 'border-teal-600 bg-teal-50/50'
                            : 'border-slate-200 hover:border-slate-300',
                        )}
                      >
                        <div className="font-medium text-slate-900">{drain.label}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{drain.description}</div>
                      </button>
                    ))}
                  </div>
                </>
              )}

              {isPipe && (
                <>
                  <h2 className="text-lg font-semibold text-slate-900 mb-1">Rördimension</h2>
                  <p className="text-sm text-slate-500 mb-6">Välj dimension för liggande spillvattenledning.</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {Object.entries(PIPE_SLOPE_RULES)
                      .filter(([key], i, arr) => arr.findIndex(([k]) => PIPE_SLOPE_RULES[k].label === PIPE_SLOPE_RULES[key].label) === i)
                      .map(([key, pipe]) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setPipeDiameter(key)}
                          className={cn(
                            'p-4 rounded-xl border-2 text-center transition-all',
                            pipeDiameter === key
                              ? 'border-teal-600 bg-teal-50/50'
                              : 'border-slate-200 hover:border-slate-300',
                          )}
                        >
                          <div className="font-semibold text-slate-900">{pipe.label}</div>
                          <div className="text-xs text-teal-700 mt-1">Min {pipe.minPromille} mm/m</div>
                        </button>
                      ))}
                  </div>
                </>
              )}

              {!isPipe && !isBathroom && availableDrains.length > 0 && (
                <>
                  <h2 className="text-lg font-semibold text-slate-900 mb-1">Typ av brunn</h2>
                  <p className="text-sm text-slate-500 mb-6">Välj vilken typ av avloppspunkt du projekterar.</p>
                  <div className="grid grid-cols-1 gap-3">
                    {availableDrains.map(drain => (
                      <button
                        key={drain.id}
                        type="button"
                        onClick={() => setDrainType(drain.id)}
                        className={cn(
                          'text-left p-4 rounded-xl border-2 transition-all',
                          drainType === drain.id
                            ? 'border-teal-600 bg-teal-50/50'
                            : 'border-slate-200 hover:border-slate-300',
                        )}
                      >
                        <div className="font-medium text-slate-900">{drain.label}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{drain.description}</div>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Step 3: Measurements */}
          {step === 3 && (
            <div className="p-6 sm:p-8">
              <h2 className="text-lg font-semibold text-slate-900 mb-1">Ange mått</h2>
              <p className="text-sm text-slate-500 mb-6">
                {isPipe
                  ? 'Avstånd från brunn/avsättning till högsta punkt och rörsträcka.'
                  : 'Avstånd från golvbrunn till högsta punkt på golvet.'}
              </p>

              <div className="space-y-5">
                <div>
                  <label htmlFor="distance" className="block text-sm font-medium text-slate-700 mb-1.5">
                    {isPipe ? 'Avstånd till högsta punkt' : 'Avstånd brunn → högsta punkt'}
                  </label>
                  <div className="relative">
                    <input
                      id="distance"
                      type="text"
                      inputMode="decimal"
                      value={distanceM}
                      onChange={e => setDistanceM(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none text-lg font-medium"
                      placeholder="2,0"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">meter</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1.5">Horisontellt avstånd längs golvet</p>
                </div>

                {isPipe && (
                  <div>
                    <label htmlFor="pipeLength" className="block text-sm font-medium text-slate-700 mb-1.5">
                      Rörsträcka (lutande del)
                    </label>
                    <div className="relative">
                      <input
                        id="pipeLength"
                        type="text"
                        inputMode="decimal"
                        value={pipeLengthM}
                        onChange={e => setPipeLengthM(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none text-lg font-medium"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">meter</span>
                    </div>
                  </div>
                )}

                {!isPipe && effectiveRuleId && SLOPE_RULES[effectiveRuleId]?.minWallDistanceMm && (
                  <div>
                    <label htmlFor="wallDist" className="block text-sm font-medium text-slate-700 mb-1.5">
                      Avstånd brunn → vägg <span className="text-slate-400 font-normal">(valfritt)</span>
                    </label>
                    <div className="relative">
                      <input
                        id="wallDist"
                        type="text"
                        inputMode="decimal"
                        value={distanceToWallMm}
                        onChange={e => setDistanceToWallMm(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none"
                        placeholder="200"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">mm</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1.5">Minst 200 mm enligt Säker Vatten (ej väggnära brunn)</p>
                  </div>
                )}

                <div>
                  <label htmlFor="planned" className="block text-sm font-medium text-slate-700 mb-1.5">
                    Planerat fall <span className="text-slate-400 font-normal">(valfritt – för validering)</span>
                  </label>
                  <div className="relative">
                    <input
                      id="planned"
                      type="text"
                      inputMode="decimal"
                      value={plannedSlope}
                      onChange={e => setPlannedSlope(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none"
                      placeholder="15"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">mm/m</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1.5">Ange ditt planerade fall för att kontrollera om det ligger inom tolerans</p>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Results */}
          {step === 4 && result && (
            <div className="p-6 sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">{result.rule.label}</h2>
                  <p className="text-sm text-slate-500">{result.rule.description}</p>
                </div>
                {result.validation && <StatusBadge status={result.validation.status} />}
              </div>

              {/* Main result card */}
              <div className="bg-gradient-to-br from-teal-600 to-teal-800 rounded-2xl p-6 sm:p-8 text-white mb-6">
                <div className="text-teal-100 text-sm font-medium mb-1">Rekommenderat fall (riktvärde)</div>
                <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                  <span className="text-4xl sm:text-5xl font-bold tracking-tight">
                    {result.recommendedMmPerM}
                  </span>
                  <span className="text-xl text-teal-100">mm/m</span>
                </div>
                <div className="flex flex-wrap gap-4 mt-3 text-teal-100 text-sm">
                  <span>{result.ratioRecommended}</span>
                  <span>•</span>
                  <span>{result.promilleRecommended} ‰</span>
                  <span>•</span>
                  <span>{mmPerMToPercent(result.recommendedMmPerM)}</span>
                </div>
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                <StatBox label="Minimum" value={`${result.minMmPerM} mm/m`} sub={result.ratioMin} />
                {result.maxMmPerM !== undefined && (
                  <StatBox label="Maximum" value={`${result.maxMmPerM} mm/m`} sub={result.ratioMax} />
                )}
                <StatBox
                  label="Höjdskillnad"
                  value={formatMm(result.heightDiffRecommendedMm)}
                  sub={`vid ${formatDistanceM(parseFloat(distanceM.replace(',', '.')))}`}
                />
                <StatBox
                  label="Min höjdskillnad"
                  value={formatMm(result.heightDiffMinMm)}
                  sub="vid minimumfall"
                />
              </div>

              {result.validation && (
                <div
                  className={cn(
                    'rounded-xl border p-4 mb-6',
                    result.validation.status === 'ok' && 'bg-emerald-50 border-emerald-200',
                    result.validation.status === 'error' && 'bg-red-50 border-red-200',
                    result.validation.status === 'warning' && 'bg-amber-50 border-amber-200',
                  )}
                >
                  <div className="font-medium text-slate-900 mb-1">
                    Ditt planerade fall: {result.validation.plannedMmPerM} mm/m ({result.validation.plannedRatio})
                  </div>
                  <p className="text-sm text-slate-600">{result.validation.message}</p>
                  <p className="text-sm text-slate-500 mt-1">
                    Höjdskillnad: {formatMm(result.validation.plannedHeightDiffMm)}
                  </p>
                </div>
              )}

              {result.wallValidation && (
                <div
                  className={cn(
                    'rounded-xl border p-4 mb-6',
                    result.wallValidation.status === 'ok' ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200',
                  )}
                >
                  <p className="text-sm text-slate-700">{result.wallValidation.message}</p>
                </div>
              )}

              {result.plushojdValidation && (
                <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 mb-6">
                  <p className="text-sm text-slate-700">{result.plushojdValidation.message}</p>
                </div>
              )}

              {!isPipe && (
                <DrainVisualization
                  distanceM={parseFloat(distanceM.replace(',', '.'))}
                  recommendedMmPerM={result.recommendedMmPerM}
                  minMmPerM={result.minMmPerM}
                  maxMmPerM={result.maxMmPerM}
                  plannedMmPerM={plannedSlope ? parseFloat(plannedSlope.replace(',', '.')) : undefined}
                  className="mb-6"
                />
              )}

              {/* Sources */}
              <div className="rounded-xl border border-slate-200 p-4 mb-6">
                <div className="text-sm font-medium text-slate-900 mb-2">Källor</div>
                <ul className="space-y-1">
                  {result.rule.sources.map((source, i) => (
                    <li key={source} className="text-sm text-slate-500 flex items-start gap-2">
                      <span className="text-teal-600 mt-0.5">•</span>
                      {result.rule.sourceUrls?.[i] ? (
                        <a
                          href={result.rule.sourceUrls[i]}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-teal-700 underline underline-offset-2"
                        >
                          {source}
                        </a>
                      ) : (
                        source
                      )}
                    </li>
                  ))}
                </ul>
                {result.rule.notes && (
                  <div className="mt-3 pt-3 border-t border-slate-100">
                    {result.rule.notes.map(note => (
                      <p key={note} className="text-xs text-slate-400 flex items-start gap-2 mt-1">
                        <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        {note}
                      </p>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-slate-50 rounded-xl p-4 text-xs text-slate-400 leading-relaxed">
                Vägledande beräkning baserad på AMA, BBR och branschregler. Projektering ska alltid verifieras
                mot gällande föreskrifter och lokala krav.
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between gap-4 px-6 sm:px-8 py-4 border-t border-slate-100 bg-slate-50/50">
            {step > 1 ? (
              <button
                type="button"
                onClick={goBack}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Tillbaka
              </button>
            ) : (
              <div />
            )}

            {step < 4 ? (
              <button
                type="button"
                onClick={goNext}
                disabled={
                  (step === 1 && !canProceedStep1) ||
                  (step === 2 && !canProceedStep2) ||
                  (step === 3 && !canProceedStep3)
                }
                className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-teal-700 text-white text-sm font-medium hover:bg-teal-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                {step === 3 ? 'Visa resultat' : 'Fortsätt'}
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setStep(1)}
                className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition-colors"
              >
                Ny beräkning
              </button>
            )}
          </div>
        </div>

        {/* FAQ */}
        <section className="mt-12">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Vanliga frågor</h2>
          <div className="space-y-2">
            {FAQ.map((item, i) => (
              <div key={item.q} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                  className="w-full flex items-center justify-between gap-4 p-4 text-left hover:bg-slate-50 transition-colors"
                >
                  <span className="font-medium text-slate-900 text-sm">{item.q}</span>
                  <ChevronDown
                    className={cn('w-4 h-4 text-slate-400 shrink-0 transition-transform', faqOpen === i && 'rotate-180')}
                  />
                </button>
                {faqOpen === i && (
                  <div className="px-4 pb-4 text-sm text-slate-500 leading-relaxed">{item.a}</div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div className="mt-8 bg-slate-900 rounded-2xl p-6 sm:p-8 text-center">
          <h3 className="text-lg font-semibold text-white mb-2">Spara beräkningar i projektet</h3>
          <p className="text-slate-400 text-sm mb-4">
            Med Platsledning.ai kopplar du egenkontroller och avvikelser direkt till dina byggprojekt.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-slate-900 text-sm font-medium hover:bg-slate-100 transition-colors"
          >
            Prova gratis
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </>
  )
}

function StatBox({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
      <div className="text-xs text-slate-500 mb-0.5">{label}</div>
      <div className="font-semibold text-slate-900 text-sm">{value}</div>
      {sub && <div className="text-xs text-slate-400 mt-0.5">{sub}</div>}
    </div>
  )
}
