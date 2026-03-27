import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import { Project } from '@/types'

export function ProjectsPage() {
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', number: '', customer: '', address: '', budget: '', status: 'planering' as Project['status'] })

  const { data: projects = [], isLoading } = useQuery<Project[]>({
    queryKey: ['projects'],
    queryFn: () => apiClient.get('/projects').then(r => r.data),
  })

  const createProject = useMutation({
    mutationFn: (data: typeof form) => apiClient.post('/projects', { ...data, budget: Number(data.budget) || 0 }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['projects'] })
      setShowForm(false)
      setForm({ name: '', number: '', customer: '', address: '', budget: '', status: 'planering' })
    },
  })

  const deleteProject = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/projects/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['projects'] }),
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Projekt</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90"
        >
          + Nytt projekt
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={e => { e.preventDefault(); createProject.mutate(form) }}
          className="bg-card border border-border rounded-lg p-6 mb-6 grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <h2 className="col-span-full font-semibold text-lg">Skapa projekt</h2>
          <Field label="Projektnamn *" value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))} required />
          <Field label="Projektnummer" value={form.number} onChange={v => setForm(f => ({ ...f, number: v }))} />
          <Field label="Kund" value={form.customer} onChange={v => setForm(f => ({ ...f, customer: v }))} />
          <Field label="Adress" value={form.address} onChange={v => setForm(f => ({ ...f, address: v }))} />
          <Field label="Budget (kr)" value={form.budget} onChange={v => setForm(f => ({ ...f, budget: v }))} type="number" />
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              value={form.status}
              onChange={e => setForm(f => ({ ...f, status: e.target.value as Project['status'] }))}
              className="w-full px-3 py-2 border border-input rounded-lg bg-background text-sm"
            >
              <option value="planering">Planering</option>
              <option value="produktion">Produktion</option>
              <option value="avslutat">Avslutat</option>
            </select>
          </div>
          <div className="col-span-full flex gap-2">
            <button type="submit" disabled={createProject.isPending} className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50">
              {createProject.isPending ? 'Sparar...' : 'Spara projekt'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg text-sm border border-border hover:bg-muted">
              Avbryt
            </button>
          </div>
        </form>
      )}

      {isLoading ? (
        <div className="text-muted-foreground">Laddar...</div>
      ) : projects.length === 0 ? (
        <div className="bg-card border border-border rounded-lg p-12 text-center text-muted-foreground">
          Inga projekt ännu. Skapa ditt första projekt ovan.
        </div>
      ) : (
        <div className="grid gap-4">
          {projects.map(p => (
            <div key={p.id} className="bg-card border border-border rounded-lg p-6 flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-semibold">{p.name}</h3>
                  <StatusBadge status={p.status} />
                </div>
                <div className="text-sm text-muted-foreground flex gap-4">
                  {p.number && <span>#{p.number}</span>}
                  {p.customer && <span>{p.customer}</span>}
                  {p.address && <span>{p.address}</span>}
                  {p.budget && <span>{Number(p.budget).toLocaleString('sv-SE')} kr</span>}
                </div>
              </div>
              <button
                onClick={() => { if (confirm('Ta bort projektet?')) deleteProject.mutate(p.id) }}
                className="text-sm text-muted-foreground hover:text-red-600 px-3 py-1"
              >
                Ta bort
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function Field({ label, value, onChange, required, type = 'text' }: { label: string; value: string; onChange: (v: string) => void; required?: boolean; type?: string }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        required={required}
        className="w-full px-3 py-2 border border-input rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
      />
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    planering: 'bg-blue-100 text-blue-700',
    produktion: 'bg-green-100 text-green-700',
    avslutat: 'bg-gray-100 text-gray-600',
  }
  const labels: Record<string, string> = { planering: 'Planering', produktion: 'Produktion', avslutat: 'Avslutat' }
  return <span className={`text-xs px-2 py-1 rounded-full font-medium ${map[status] || 'bg-gray-100'}`}>{labels[status] || status}</span>
}
