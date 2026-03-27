import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import { Project, Deviation, Task } from '@/types'

export function Dashboard() {
  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ['projects'],
    queryFn: () => apiClient.get('/projects').then(r => r.data),
  })

  const { data: deviations = [] } = useQuery<Deviation[]>({
    queryKey: ['deviations'],
    queryFn: () => apiClient.get('/deviations').then(r => r.data),
  })

  const { data: tasks = [] } = useQuery<Task[]>({
    queryKey: ['tasks'],
    queryFn: () => apiClient.get('/tasks').then(r => r.data),
  })

  const activeProjects = projects.filter(p => p.status === 'produktion').length
  const openDeviations = deviations.filter(d => d.status !== 'verifierad').length
  const todayTasks = tasks.filter(t => t.status === 'in_progress').length
  const totalBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0)

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Överblick</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard label="Aktiva projekt" value={activeProjects} sub={`${projects.length} totalt`} />
        <StatCard label="Öppna avvikelser" value={openDeviations} sub={`${deviations.length} totalt`} highlight={openDeviations > 0} />
        <StatCard label="Pågående uppgifter" value={todayTasks} sub={`${tasks.length} totalt`} />
        <StatCard label="Total budget" value={`${(totalBudget / 1000000).toFixed(1)} Mkr`} sub={`${projects.length} projekt`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="font-semibold text-lg mb-4">Projekt</h2>
          {projects.length === 0 ? (
            <p className="text-muted-foreground text-sm">Inga projekt ännu.</p>
          ) : (
            <div className="space-y-3">
              {projects.slice(0, 5).map(p => (
                <div key={p.id} className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-sm">{p.name}</div>
                    <div className="text-xs text-muted-foreground">{p.customer}</div>
                  </div>
                  <StatusBadge status={p.status} />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="font-semibold text-lg mb-4">Senaste avvikelser</h2>
          {deviations.length === 0 ? (
            <p className="text-muted-foreground text-sm">Inga avvikelser.</p>
          ) : (
            <div className="space-y-3">
              {deviations.slice(0, 5).map(d => (
                <div key={d.id} className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-sm">{d.title}</div>
                    <div className="text-xs text-muted-foreground">{d.location}</div>
                  </div>
                  <PriorityBadge priority={d.priority} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, sub, highlight }: { label: string; value: string | number; sub?: string; highlight?: boolean }) {
  return (
    <div className={`bg-card border rounded-lg p-6 ${highlight ? 'border-red-300' : 'border-border'}`}>
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className={`text-3xl font-bold mt-1 ${highlight ? 'text-red-600' : ''}`}>{value}</div>
      {sub && <div className="text-xs text-muted-foreground mt-1">{sub}</div>}
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    planering: 'bg-blue-100 text-blue-700',
    produktion: 'bg-green-100 text-green-700',
    avslutat: 'bg-gray-100 text-gray-600',
  }
  const labels: Record<string, string> = {
    planering: 'Planering',
    produktion: 'Produktion',
    avslutat: 'Avslutat',
  }
  return <span className={`text-xs px-2 py-1 rounded-full font-medium ${map[status] || 'bg-gray-100'}`}>{labels[status] || status}</span>
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
