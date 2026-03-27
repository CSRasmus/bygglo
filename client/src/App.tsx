import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/lib/auth'
import { apiClient } from '@/lib/api'
import { Layout } from '@/components/Layout'
import { Dashboard } from '@/pages/Dashboard'
import { LoginPage } from '@/pages/Login'
import { ProjectsPage } from '@/pages/Projects'
import { DeviationsPage } from '@/pages/Deviations'
import { TasksPage } from '@/pages/Tasks'

export default function App() {
  const { user, token, loading, login, setLoading, logout } = useAuthStore()

  useEffect(() => {
    if (!token) {
      setLoading(false)
      return
    }
    apiClient.get('/auth/me')
      .then(res => {
        login(res.data, token)
      })
      .catch(() => {
        logout()
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-500">Laddar...</div>
      </div>
    )
  }

  if (!user) {
    return <LoginPage />
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/projekt" element={<ProjectsPage />} />
        <Route path="/avvikelser" element={<DeviationsPage />} />
        <Route path="/uppgifter" element={<TasksPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  )
}
