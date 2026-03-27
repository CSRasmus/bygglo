import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import { Deviation, Project } from '@/types'

export function DeviationsPage() {
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [selectedProject, setSelectedProject] = useState('')
  const [form, setForm] = useState({ project_id: '', title: '', description: '', category: '', priority: 'medel' as Deviation['priority'], location: '' })

  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ['projects'],
    queryFn: () => apiClient.get('/projects').then(r => r.data),
  })

  const { data: deviations = [], isLoading } = useQuery<Deviation[]>({
    queryKey: ['deviations', selectedProject],
    queryFn: () => apiClient.get('/deviations', { params: selectedProject ? { project_id: selectedProject } : {} }).then(r => r.data),
  })

  const create = useMutation({
    mutationFn: (data: typeof form) => apiClient.post('/deviations', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['deviations'] })
      setShowForm(false)
      setForm({ project_id: '', title: '', description: '', category: '', priority: 'medel', location: '' })
    },
  })

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => apiClient.put(`/deviations/${id}`, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['deviations'] }),
  })

  const STATUSES: Deviation['status'][] = ['upptäckt', 'tilldelad', 'åtgärdad', 'verifierad']

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Avvikelser</h1>
        <button onClick={() => setShowForm(!showForm)} className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90">
          + Ny avvikelse
        </button>
      </div>

      <div className="flex gap-3 mb-6">
        <select
          value={selectedProject}
          onChange={e => setSelectedProject(e.target.value)}
          className="px-3 py-2 border border-input rounded-lg bg-background text-sm"
        >
          <option value="">Alla projekt</option>
          {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>

      {showForm && (
        <form
          onSubmit={e => { e.preventDefault(); create.mutate(form) }}
          className="bg-card border border-border rounded-lg p-6 mb-6 grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <h2 className="col-span-full font-semibold text-lg">Ny avvikelse</h2>
          <div>
            <label className="block text-sm font-medium mb-1">Projekt *</label>
            <select value={form.project_id} onChange={e => setForm(f => ({ ...f, project_id: e.target.value }))} required className="w-full px-3 py-2 border border-input rounded-lg bg-background text-sm">
              <option value="">Välj projekt</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <Field label="Titel *" value={form.title} onChange={v => setForm(f => ({ ...f, title: v }))} required />
          <Field label="Beskrivning" value={form.description} onChange={v => setForm(f => ({ ...f, description: v }))} />
          <Field label="Kategori" value={form.category} onChange={v => setForm(f => ({ ...f, category: v }))} />
          <Field label="Plats" value={form.location} onChange={v => setForm(f => ({ ...f, location: v }))} />
          <div>
            <label className="block text-sm font-medium mb-1">Prioritet</label>
            <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value as Deviation['priority'] }))} className="w-full px-3 py-2 border border-input rounded-lg bg-background text-sm">
              <option value="låg">Låg</option>
              <option value="medel">Medel</option>
              <option value="hög">Hög</option>
              <option value="kritisk">Kritisk</option>
            </select>
          </div>
          <div className="col-span-full flex gap-2">
            <button type="submit" disabled={create.isPending} className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50">
              {create.isPending ? 'Sparar...' : 'Spara'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg text-sm border border-border hover:bg-muted">Avbryt</button>
          </div>
        </form>
      )}

      {isLoading ? <div className="text-muted-foreground">Laddar...</div> : deviations.length === 0 ? (
        <div className="bg-card border border-border rounded-lg p-12 text-center text-muted-foreground">Inga avvikelser.</div>
      ) : (
        <div className="space-y-3">
          {deviations.map(d => (
            <div key={d.id} className="bg-card border border-border rounded-lg p-5 flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold">{d.title}</h3>
                  <PriorityBadge priority={d.priority} />
                </div>
                {d.description && <p className="text-sm text-muted-foreground mb-2">{d.description}</p>}
                {d.location && <p className="text-xs text-muted-foreground">📍 {d.location}</p>}
              </div>
              <div className="ml-4 flex items-center gap-2">
                <select
                  value={d.status}
                  onChange={e => updateStatus.mutate({ id: d.id, status: e.target.value })}
                  className="text-xs px-2 py-1 border border-input rounded bg-background"
                >
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function Field({ label, value, onChange, required }: { label: string; value: string; onChange: (v: string) => void; required?: boolean }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <input type="text" value={value} onChange={e => onChange(e.target.value)} required={required} className="w-full px-3 py-2 border border-input rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
    </div>
  )
}

function PriorityBadge({ priority }: { priority: string }) {
  const map: Record<string, string> = {
    låg: 'bg-gray-100 text-gray-600',
    medel: 'bg-yellow-100 text-yellow-700',
    hög: 'bg-orange-100 text-orange-700',
    kritisk: 'bg-red-100 text-red-700',
  }
  return <span className={`text-xs px-2 py-1 rounded-full font-medium ${map[priority] || 'bg-gray-100'}`}>{priority}</span>
}
