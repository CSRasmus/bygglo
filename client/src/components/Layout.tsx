import { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { useAuthStore } from '@/lib/auth'

const navItems = [
  { to: '/', label: 'Översikt', exact: true },
  { to: '/projekt', label: 'Projekt' },
  { to: '/tidsplan', label: 'Tidsplan' },
  { to: '/avvikelser', label: 'Avvikelser' },
  { to: '/uppgifter', label: 'Uppgifter' },
]

export function Layout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuthStore()

  return (
    <div className="flex h-screen bg-background">
      <aside className="w-64 border-r border-border bg-card flex flex-col">
        <div className="p-6 border-b border-border">
          <h1 className="text-xl font-bold">Platsledning.ai</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Byggprojektledning</p>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.exact}
              className={({ isActive }) =>
                `block px-4 py-2 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-foreground font-medium'
                    : 'hover:bg-muted text-foreground'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-border">
          <div className="text-sm font-medium mb-0.5">{user?.name}</div>
          <div className="text-xs text-muted-foreground mb-3">{user?.email}</div>
          <button
            onClick={logout}
            className="w-full text-sm px-4 py-2 rounded-lg border border-border hover:bg-muted text-left"
          >
            Logga ut
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
