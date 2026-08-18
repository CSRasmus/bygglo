import { cn } from '@/lib/utils'

interface DrainVisualizationProps {
  distanceM: number
  recommendedMmPerM: number
  minMmPerM: number
  maxMmPerM?: number
  plannedMmPerM?: number
  className?: string
}

export function DrainVisualization({
  distanceM,
  recommendedMmPerM,
  minMmPerM,
  maxMmPerM,
  plannedMmPerM,
  className,
}: DrainVisualizationProps) {
  const width = 400
  const height = 220
  const padding = { top: 30, right: 30, bottom: 50, left: 50 }
  const floorWidth = width - padding.left - padding.right
  const floorY = height - padding.bottom

  const scale = 3
  const recDrop = Math.min(recommendedMmPerM * scale, 60)
  const minDrop = Math.min(minMmPerM * scale, 40)
  const maxDrop = maxMmPerM ? Math.min(maxMmPerM * scale, 80) : undefined
  const plannedDrop = plannedMmPerM ? Math.min(plannedMmPerM * scale, 80) : undefined

  const drainX = padding.left + floorWidth * 0.7
  const highX = padding.left + floorWidth * 0.1

  return (
    <div className={cn('bg-slate-50 rounded-xl border border-slate-200 p-4', className)}>
      <div className="text-xs font-medium text-slate-500 mb-3 uppercase tracking-wide">
        Tvärsnitt – fall mot brunn
      </div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full max-w-md mx-auto"
        role="img"
        aria-label="Visualisering av golvfall mot golvbrunn"
      >
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e2e8f0" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect x={padding.left} y={padding.top} width={floorWidth} height={floorY - padding.top} fill="url(#grid)" />

        {maxDrop !== undefined && (
          <polygon
            points={`${highX},${floorY - maxDrop} ${drainX},${floorY} ${highX},${floorY}`}
            fill="#fef3c7"
            opacity="0.5"
          />
        )}

        <polygon
          points={`${highX},${floorY - minDrop} ${drainX},${floorY} ${highX},${floorY}`}
          fill="#dcfce7"
          opacity="0.6"
        />

        <line
          x1={highX}
          y1={floorY - recDrop}
          x2={drainX}
          y2={floorY}
          stroke="#0f766e"
          strokeWidth="3"
          strokeLinecap="round"
        />

        {plannedDrop !== undefined && (
          <line
            x1={highX}
            y1={floorY - plannedDrop}
            x2={drainX}
            y2={floorY}
            stroke="#2563eb"
            strokeWidth="2"
            strokeDasharray="6 4"
            strokeLinecap="round"
          />
        )}

        <rect x={padding.left} y={floorY} width={floorWidth} height="4" fill="#94a3b8" rx="1" />

        <circle cx={drainX} cy={floorY + 2} r="14" fill="#334155" />
        <circle cx={drainX} cy={floorY + 2} r="8" fill="#64748b" />
        <circle cx={drainX} cy={floorY + 2} r="4" fill="#1e293b" />

        <line x1={highX} y1={floorY - recDrop - 8} x2={highX} y2={floorY + 8} stroke="#64748b" strokeWidth="1" strokeDasharray="3 3" />
        <text x={highX} y={floorY - recDrop - 14} textAnchor="middle" className="fill-slate-600 text-[11px]">
          Högsta punkt
        </text>

        <text x={drainX} y={floorY + 28} textAnchor="middle" className="fill-slate-600 text-[11px] font-medium">
          Golvbrunn
        </text>

        <text x={(highX + drainX) / 2} y={floorY - recDrop / 2 - 8} textAnchor="middle" className="fill-teal-700 text-[11px] font-semibold">
          ↘ Fall
        </text>

        <line x1={highX} y1={floorY + 20} x2={drainX} y2={floorY + 20} stroke="#64748b" strokeWidth="1" markerEnd="url(#arrow)" />
        <text x={(highX + drainX) / 2} y={floorY + 38} textAnchor="middle" className="fill-slate-500 text-[10px]">
          {distanceM.toLocaleString('sv-SE')} m
        </text>
      </svg>

      <div className="flex flex-wrap justify-center gap-4 mt-2 text-xs text-slate-500">
        <span className="flex items-center gap-1.5">
          <span className="w-4 h-0.5 bg-teal-700 rounded" />
          Riktvärde
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-4 h-3 bg-green-100 border border-green-200 rounded-sm" />
          Tillåtet intervall
        </span>
        {plannedMmPerM !== undefined && (
          <span className="flex items-center gap-1.5">
            <span className="w-4 h-0.5 bg-blue-600 rounded border-dashed" style={{ borderTop: '2px dashed #2563eb' }} />
            Ditt planerade fall
          </span>
        )}
      </div>
    </div>
  )
}
