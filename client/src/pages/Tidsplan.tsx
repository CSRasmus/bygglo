import { useState, useRef, useEffect, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import { Project } from '@/types'
import {
  addDays, subDays, differenceInDays, parseISO, format,
  endOfMonth, eachMonthOfInterval, eachWeekOfInterval, startOfMonth,
} from 'date-fns'
import { sv } from 'date-fns/locale'

const DAY_WIDTH = 28
const ROW_HEIGHT = 44
const SIDEBAR_WIDTH = 220

interface ActivityRow {
  id: string
  project_id: string
  name: string
  start_date: string
  end_date: string
  progress: number
  status: 'ej_redo' | 'redo' | 'pågår' | 'klar' | 'blockerad'
  dependencies: string[]
  trades: string[]
}

type DragState = {
  activityId: string
  type: 'move' | 'resize-left' | 'resize-right'
  startX: number
  originalStart: Date
  originalEnd: Date
}

const STATUS_COLORS: Record<string, string> = {
  ej_redo: 'bg-slate-400',
  redo: 'bg-blue-500',
  pågår: 'bg-amber-400',
  klar: 'bg-green-500',
  blockerad: 'bg-red-500',
}

const STATUS_BAR_COLORS: Record<string, string> = {
  ej_redo: '#94a3b8',
  redo: '#3b82f6',
  pågår: '#fbbf24',
  klar: '#22c55e',
  blockerad: '#ef4444',
}

const STATUS_LABELS: Record<string, string> = {
  ej_redo: 'Ej redo',
  redo: 'Redo',
  pågår: 'Pågår',
  klar: 'Klar',
  blockerad: 'Blockerad',
}

function computeRange(activities: ActivityRow[], today: Date) {
  if (activities.length > 0) {
    const starts = activities.map(a => parseISO(a.start_date).getTime())
    const ends = activities.map(a => parseISO(a.end_date).getTime())
    return {
      rangeStart: subDays(new Date(Math.min(...starts)), 7),
      rangeEnd: addDays(new Date(Math.max(...ends)), 21),
    }
  }
  return {
    rangeStart: startOfMonth(today),
    rangeEnd: addDays(today, 90),
  }
}

export function TidsplanPage() {
  const qc = useQueryClient()
  const [selectedProject, setSelectedProject] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editActivity, setEditActivity] = useState<ActivityRow | null>(null)
  const [localActivities, setLocalActivities] = useState<ActivityRow[] | null>(null)
  const dragRef = useRef<DragState | null>(null)
  const serverActivitiesRef = useRef<ActivityRow[]>([])
  const containerRef = useRef<HTMLDivElement>(null)
  const didScrollRef = useRef(false)

  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ['projects'],
    queryFn: () => apiClient.get('/projects').then(r => r.data),
  })

  const { data: serverActivities = [], isLoading } = useQuery<ActivityRow[]>({
    queryKey: ['activities', selectedProject],
    queryFn: () =>
      apiClient
        .get('/activities', { params: selectedProject ? { project_id: selectedProject } : {} })
        .then(r => r.data),
  })

  useEffect(() => {
    serverActivitiesRef.current = serverActivities
    setLocalActivities(null)
  }, [serverActivities])

  const updateActivity = useMutation({
    mutationFn: ({ id, ...data }: Partial<ActivityRow> & { id: string }) =>
      apiClient.put(`/activities/${id}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['activities'] }),
  })

  const displayed = localActivities ?? serverActivities

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const { rangeStart, rangeEnd } = computeRange(displayed, today)
  const totalDays = differenceInDays(rangeEnd, rangeStart) + 1
  const totalWidth = totalDays * DAY_WIDTH

  const dateToX = useCallback(
    (date: Date) => differenceInDays(date, rangeStart) * DAY_WIDTH,
    [rangeStart]
  )

  // Scroll to today once on load
  useEffect(() => {
    if (!containerRef.current || didScrollRef.current) return
    if (serverActivities.length === 0 && isLoading) return
    didScrollRef.current = true
    const { rangeStart: rs } = computeRange(serverActivities, today)
    const todayX = differenceInDays(today, rs) * DAY_WIDTH + SIDEBAR_WIDTH
    containerRef.current.scrollLeft = Math.max(0, todayX - 300)
  }, [serverActivities, isLoading])

  // Mouse drag handlers
  const handleBarMouseDown = useCallback(
    (e: React.MouseEvent, activity: ActivityRow, type: DragState['type']) => {
      e.preventDefault()
      e.stopPropagation()
      dragRef.current = {
        activityId: activity.id,
        type,
        startX: e.clientX,
        originalStart: parseISO(activity.start_date),
        originalEnd: parseISO(activity.end_date),
      }
    },
    []
  )

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!dragRef.current) return
      const drag = dragRef.current
      const dx = e.clientX - drag.startX
      const deltaDays = Math.round(dx / DAY_WIDTH)

      setLocalActivities(prev => {
        const base = prev ?? serverActivitiesRef.current
        return base.map(a => {
          if (a.id !== drag.activityId) return a
          if (drag.type === 'move') {
            return {
              ...a,
              start_date: format(addDays(drag.originalStart, deltaDays), 'yyyy-MM-dd'),
              end_date: format(addDays(drag.originalEnd, deltaDays), 'yyyy-MM-dd'),
            }
          }
          if (drag.type === 'resize-left') {
            const newStart = addDays(drag.originalStart, deltaDays)
            if (differenceInDays(drag.originalEnd, newStart) < 1) return a
            return { ...a, start_date: format(newStart, 'yyyy-MM-dd') }
          }
          const newEnd = addDays(drag.originalEnd, deltaDays)
          if (differenceInDays(newEnd, drag.originalStart) < 1) return a
          return { ...a, end_date: format(newEnd, 'yyyy-MM-dd') }
        })
      })
    }

    const onMouseUp = () => {
      if (!dragRef.current) return
      const { activityId } = dragRef.current
      dragRef.current = null
      setLocalActivities(prev => {
        if (!prev) return prev
        const updated = prev.find(a => a.id === activityId)
        if (updated) {
          updateActivity.mutate({
            id: updated.id,
            start_date: updated.start_date,
            end_date: updated.end_date,
          })
        }
        return prev
      })
    }

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
    return () => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }
  }, [updateActivity])

  const months = eachMonthOfInterval({ start: rangeStart, end: rangeEnd })
  const weeks = eachWeekOfInterval(
    { start: rangeStart, end: rangeEnd },
    { weekStartsOn: 1 }
  )

  const todayInRange = today >= rangeStart && today <= rangeEnd
  const todayLineX = SIDEBAR_WIDTH + dateToX(today) + DAY_WIDTH / 2

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 7rem)' }}>
      {/* Toolbar */}
      <div className="flex items-center gap-4 mb-4">
        <h1 className="text-3xl font-bold">Tidsplan</h1>
        <div className="flex-1" />
        <select
          value={selectedProject}
          onChange={e => {
            setSelectedProject(e.target.value)
            didScrollRef.current = false
          }}
          className="px-3 py-2 border border-input rounded-lg bg-background text-sm"
        >
          <option value="">Alla projekt</option>
          {projects.map(p => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <button
          onClick={() => {
            setEditActivity(null)
            setShowModal(true)
          }}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90"
        >
          + Ny aktivitet
        </button>
      </div>

      {/* Gantt container */}
      {isLoading ? (
        <div className="text-muted-foreground py-8">Laddar...</div>
      ) : (
        <div
          ref={containerRef}
          className="flex-1 border border-border rounded-lg overflow-auto bg-card select-none"
        >
          <div className="relative" style={{ width: SIDEBAR_WIDTH + totalWidth }}>
            {/* Sticky header */}
            <div
              className="sticky top-0 z-20 flex bg-card border-b border-border"
              style={{ height: 56 }}
            >
              {/* Sidebar header */}
              <div
                className="sticky left-0 z-30 bg-card border-r border-border flex items-end pb-2 px-4 flex-shrink-0"
                style={{ width: SIDEBAR_WIDTH }}
              >
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Aktivitet
                </span>
              </div>

              {/* Timeline header */}
              <div className="relative flex-shrink-0" style={{ width: totalWidth, height: 56 }}>
                {/* Month labels */}
                {months.map(monthStart => {
                  const clampedStart = monthStart < rangeStart ? rangeStart : monthStart
                  const monthEnd = endOfMonth(monthStart)
                  const clampedEnd = monthEnd > rangeEnd ? rangeEnd : monthEnd
                  const x = dateToX(clampedStart)
                  const w = (differenceInDays(clampedEnd, clampedStart) + 1) * DAY_WIDTH
                  return (
                    <div
                      key={monthStart.toISOString()}
                      className="absolute top-0 border-r border-border/30 overflow-hidden"
                      style={{ left: x, width: w }}
                    >
                      <div className="px-2 pt-1.5 text-xs font-semibold capitalize">
                        {format(monthStart, 'MMMM yyyy', { locale: sv })}
                      </div>
                    </div>
                  )
                })}

                {/* Week markers */}
                {weeks.map(weekStart => {
                  const clamped = weekStart < rangeStart ? rangeStart : weekStart
                  const x = dateToX(clamped)
                  return (
                    <div
                      key={weekStart.toISOString()}
                      className="absolute border-l border-border/40 flex items-end pb-1"
                      style={{ left: x, top: 28, bottom: 0 }}
                    >
                      <span className="text-[10px] text-muted-foreground px-1">
                        v{format(weekStart, 'w')}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Today vertical line (behind rows) */}
            {todayInRange && (
              <div
                className="absolute top-0 bottom-0 pointer-events-none z-10"
                style={{
                  left: todayLineX,
                  width: 1,
                  background: 'rgba(239,68,68,0.45)',
                }}
              />
            )}

            {/* Activity rows */}
            {displayed.length === 0 ? (
              <div className="flex items-center justify-center py-20 text-muted-foreground text-sm">
                Inga aktiviteter. Klicka "+ Ny aktivitet" för att börja.
              </div>
            ) : (
              displayed.map((a, i) => {
                const start = parseISO(a.start_date)
                const end = parseISO(a.end_date)
                const barX = dateToX(start)
                const barW = Math.max(
                  (differenceInDays(end, start) + 1) * DAY_WIDTH,
                  DAY_WIDTH * 2
                )
                const barColor = STATUS_BAR_COLORS[a.status] || '#3b82f6'

                return (
                  <div
                    key={a.id}
                    className={`flex border-b border-border ${i % 2 === 1 ? 'bg-muted/20' : ''}`}
                    style={{ height: ROW_HEIGHT }}
                  >
                    {/* Sticky name cell */}
                    <div
                      className={`sticky left-0 z-10 border-r border-border flex items-center px-3 gap-2 cursor-pointer hover:bg-muted/50 flex-shrink-0 ${
                        i % 2 === 1 ? 'bg-muted/20' : 'bg-card'
                      }`}
                      style={{ width: SIDEBAR_WIDTH }}
                      onClick={() => {
                        setEditActivity(a)
                        setShowModal(true)
                      }}
                    >
                      <div
                        className={`w-2 h-2 rounded-full flex-shrink-0 ${STATUS_COLORS[a.status] || 'bg-blue-500'}`}
                      />
                      <span className="text-sm truncate flex-1">{a.name}</span>
                      {a.progress > 0 && (
                        <span className="text-xs text-muted-foreground flex-shrink-0">
                          {a.progress}%
                        </span>
                      )}
                    </div>

                    {/* Chart cell */}
                    <div className="relative flex-shrink-0" style={{ width: totalWidth }}>
                      {/* Gantt bar */}
                      <div
                        className="absolute top-2.5 rounded cursor-grab active:cursor-grabbing"
                        style={{
                          left: barX,
                          width: barW,
                          height: ROW_HEIGHT - 20,
                          background: barColor,
                        }}
                        onMouseDown={e => handleBarMouseDown(e, a, 'move')}
                      >
                        {/* Left resize handle */}
                        <div
                          className="absolute inset-y-0 left-0 w-2 rounded-l cursor-ew-resize hover:bg-black/20"
                          onMouseDown={e => handleBarMouseDown(e, a, 'resize-left')}
                        />

                        {/* Label */}
                        <div className="absolute inset-0 flex items-center px-3 pointer-events-none overflow-hidden">
                          <span className="text-xs text-white font-medium truncate drop-shadow-sm">
                            {a.name}
                          </span>
                        </div>

                        {/* Progress stripe */}
                        {a.progress > 0 && (
                          <div
                            className="absolute bottom-0 left-0 h-1 rounded-b pointer-events-none bg-white/40"
                            style={{ width: `${Math.min(100, a.progress)}%` }}
                          />
                        )}

                        {/* Right resize handle */}
                        <div
                          className="absolute inset-y-0 right-0 w-2 rounded-r cursor-ew-resize hover:bg-black/20"
                          onMouseDown={e => handleBarMouseDown(e, a, 'resize-right')}
                        />
                      </div>

                      {/* Date tooltip on hover */}
                      <div
                        className="absolute bottom-0 pointer-events-none opacity-0 group-hover:opacity-100 text-[10px] text-muted-foreground"
                        style={{ left: barX }}
                      >
                        {format(start, 'd MMM', { locale: sv })} –{' '}
                        {format(end, 'd MMM', { locale: sv })}
                      </div>
                    </div>
                  </div>
                )
              })
            )}

            {/* Today label at top */}
            {todayInRange && (
              <div
                className="sticky top-0 pointer-events-none z-30"
                style={{ marginTop: -56 }}
              >
                <div
                  className="absolute"
                  style={{ left: todayLineX - 14, top: 2 }}
                >
                  <span className="text-[10px] bg-red-500 text-white px-1 rounded font-medium">
                    Idag
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
        {Object.entries(STATUS_LABELS).map(([key, label]) => (
          <div key={key} className="flex items-center gap-1.5">
            <div
              className="w-3 h-3 rounded-sm"
              style={{ background: STATUS_BAR_COLORS[key] }}
            />
            {label}
          </div>
        ))}
        <div className="flex items-center gap-1.5 ml-2">
          <div className="w-3 h-0.5 bg-red-400" />
          Idag
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <ActivityModal
          projects={projects}
          defaultProjectId={selectedProject}
          activity={editActivity}
          onClose={() => {
            setShowModal(false)
            setEditActivity(null)
          }}
          onSaved={() => {
            qc.invalidateQueries({ queryKey: ['activities'] })
            setShowModal(false)
            setEditActivity(null)
          }}
          onDeleted={
            editActivity
              ? () => {
                  qc.invalidateQueries({ queryKey: ['activities'] })
                  setShowModal(false)
                  setEditActivity(null)
                }
              : undefined
          }
        />
      )}
    </div>
  )
}

function ActivityModal({
  projects,
  defaultProjectId,
  activity,
  onClose,
  onSaved,
  onDeleted,
}: {
  projects: Project[]
  defaultProjectId: string
  activity: ActivityRow | null
  onClose: () => void
  onSaved: () => void
  onDeleted?: () => void
}) {
  const [form, setForm] = useState({
    project_id: activity?.project_id ?? defaultProjectId,
    name: activity?.name ?? '',
    start_date: activity?.start_date ?? format(new Date(), 'yyyy-MM-dd'),
    end_date: activity?.end_date ?? format(addDays(new Date(), 7), 'yyyy-MM-dd'),
    status: (activity?.status ?? 'ej_redo') as ActivityRow['status'],
    progress: activity?.progress ?? 0,
    trades: activity?.trades?.join(', ') ?? '',
  })
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.project_id || !form.name || !form.start_date || !form.end_date) return
    setSaving(true)
    try {
      const payload = {
        ...form,
        progress: Number(form.progress),
        trades: form.trades
          ? form.trades
              .split(',')
              .map(t => t.trim())
              .filter(Boolean)
          : [],
      }
      if (activity) {
        await apiClient.put(`/activities/${activity.id}`, payload)
      } else {
        await apiClient.post('/activities', payload)
      }
      onSaved()
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!activity || !confirm('Ta bort aktiviteten?')) return
    setDeleting(true)
    try {
      await apiClient.delete(`/activities/${activity.id}`)
      onDeleted?.()
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-xl shadow-xl w-full max-w-lg">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="font-semibold text-lg">
            {activity ? 'Redigera aktivitet' : 'Ny aktivitet'}
          </h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Project */}
          <div>
            <label className="block text-sm font-medium mb-1">Projekt *</label>
            <select
              value={form.project_id}
              onChange={e => setForm(f => ({ ...f, project_id: e.target.value }))}
              required
              className="w-full px-3 py-2 border border-input rounded-lg bg-background text-sm"
            >
              <option value="">Välj projekt</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium mb-1">Aktivitetsnamn *</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              required
              placeholder="t.ex. Gjuta grund"
              className="w-full px-3 py-2 border border-input rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Startdatum *</label>
              <input
                type="date"
                value={form.start_date}
                onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))}
                required
                className="w-full px-3 py-2 border border-input rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Slutdatum *</label>
              <input
                type="date"
                value={form.end_date}
                onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))}
                required
                className="w-full px-3 py-2 border border-input rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* Status + Progress */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                value={form.status}
                onChange={e =>
                  setForm(f => ({ ...f, status: e.target.value as ActivityRow['status'] }))
                }
                className="w-full px-3 py-2 border border-input rounded-lg bg-background text-sm"
              >
                {Object.entries(STATUS_LABELS).map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Framsteg ({form.progress}%)
              </label>
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={form.progress}
                onChange={e => setForm(f => ({ ...f, progress: Number(e.target.value) }))}
                className="w-full mt-2"
              />
            </div>
          </div>

          {/* Trades */}
          <div>
            <label className="block text-sm font-medium mb-1">Yrkeskategorier</label>
            <input
              type="text"
              value={form.trades}
              onChange={e => setForm(f => ({ ...f, trades: e.target.value }))}
              placeholder="t.ex. Betong, El, VVS (kommaseparerat)"
              className="w-full px-3 py-2 border border-input rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50"
            >
              {saving ? 'Sparar...' : activity ? 'Uppdatera' : 'Skapa aktivitet'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm border border-border hover:bg-muted"
            >
              Avbryt
            </button>
            {activity && onDeleted && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="ml-auto px-4 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950 disabled:opacity-50"
              >
                {deleting ? 'Tar bort...' : 'Ta bort'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
