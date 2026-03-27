import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import { Task, Project } from '@/types'

const COLUMNS: { key: Task['status']; label: string }[] = [
  { key: 'backlog', label: 'Backlog' },
  { key: 'todo', label: 'Att göra' },
  { key: 'in_progress', label: 'Pågår' },
  { key: 'done', label: 'Klar' },
]

export function TasksPage() {
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [selectedProject, setSelectedProject] = useState('')
  const [form, setForm] = useState({ project_id: '', title: '', description: '', priority: 'medel' as Task['priority'], due_date: '' })

  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ['projects'],
    queryFn: () => apiClient.get('/projects').then(r => r.data),
  })

  const { data: tasks = [], isLoading } = useQuery<Task[]>({
    queryKey: ['tasks', selectedProject],
    queryFn: () => apiClient.get('/tasks', { params: selectedProject ? { project_id: selectedProject } : {} }).then(r => r.data),
  })

  const create = useMutation({
    mutationFn: (data: typeof form) => apiClient.post('/tasks', { ...data, due_date: data.due_date || undefined }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks'] })
      setShowForm(false)
      setForm({ project_id: '', title: '', description: '', priority: 'medel', due_date: '' })
    },
  })

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => apiClient.put(`/tasks/${id}`, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
  })

  const deleteTask = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/tasks/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Uppgifter</h1>
        <button onClick={() => setShowForm(!showForm)} className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90">
          + Ny uppgift
        </button>
      </div>

      <div className="flex gap-3 mb-6">
        <select value={selectedProject} onChange={e => setSelectedProject(e.target.value)} className="px-3 py-2 border border-input rounded-lg bg-background text-sm">
          <option value="">Alla projekt</option>
          {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>

      {showForm && (
        <form onSubmit={e => { e.preventDefault(); create.mutate(form) }} className="bg-card border border-border rounded-lg p-6 mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <h2 className="col-span-full font-semibold text-lg">Ny uppgift</h2>
          <div>
            <label className="block text-sm font-medium mb-1">Projekt *</label>
            <select value={form.project_id} onChange={e => setForm(f => ({ ...f, project_id: e.target.value }))} required className="w-full px-3 py-2 border border-input rounded-lg bg-background text-sm">
              <option value="">Välj projekt</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <Field label="Titel *" value={form.title} onChange={v => setForm(f => ({ ...f, title: v }))} required />
          <Field label="Beskrivning" value={form.description} onChange={v => setForm(f => ({ ...f, description: v }))} />
          <Field label="Förfallodatum" value={form.due_date} onChange={v => setForm(f => ({ ...f, due_date: v }))} type="date" />
          <div>
            <label className="block text-sm font-medium mb-1">Prioritet</label>
            <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value as Task['priority'] }))} className="w-full px-3 py-2 border border-input rounded-lg bg-background text-sm">
              <option value="låg">Låg</option>
              <option value="medel">Medel</option>
              <option value="hög">Hög</option>
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

      {isLoading ? <div className="text-muted-foreground">Laddar...</div> : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {COLUMNS.map(col => {
            const colTasks = tasks.filter(t => t.status === col.key)
            return (
              <div key={col.key} className="bg-muted/50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-sm">{col.label}</h3>
                  <span className="text-xs bg-background border border-border rounded-full px-2 py-0.5">{colTasks.length}</span>
                </div>
                <div className="space-y-2">
                  {colTasks.map(t => (
                    <div key={t.id} className="bg-card border border-border rounded-lg p-3">
                      <div className="font-medium text-sm mb-1">{t.title}</div>
                      {t.description && <div className="text-xs text-muted-foreground mb-2">{t.description}</div>}
                      <div className="flex items-center justify-between">
                        <PriorityBadge priority={t.priority} />
                        <div className="flex gap-1">
                          {COLUMNS.filter(c => c.key !== col.key).map(c => (
                            <button key={c.key} onClick={() => updateStatus.mutate({ id: t.id, status: c.key })} className="text-xs text-muted-foreground hover:text-foreground px-1">
                              →{c.label}
                            </button>
                          ))}
                          <button onClick={() => { if (confirm('Ta bort?')) deleteTask.mutate(t.id) }} className="text-xs text-red-400 hover:text-red-600 px-1">✕</button>
                        </div>
                      </div>
                      {t.due_date && <div className="text-xs text-muted-foreground mt-1">📅 {new Date(t.due_date).toLocaleDateString('sv-SE')}</div>}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function Field({ label, value, onChange, required, type = 'text' }: { label: string; value: string; onChange: (v: string) => void; required?: boolean; type?: string }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} required={required} className="w-full px-3 py-2 border border-input rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
    </div>
  )
}

function PriorityBadge({ priority }: { priority: string }) {
  const map: Record<string, string> = {
    låg: 'bg-gray-100 text-gray-600',
    medel: 'bg-yellow-100 text-yellow-700',
    hög: 'bg-orange-100 text-orange-700',
  }
  return <span className={`text-xs px-2 py-1 rounded-full font-medium ${map[priority] || 'bg-gray-100'}`}>{priority}</span>
}
