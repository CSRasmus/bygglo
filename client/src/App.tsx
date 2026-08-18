import { Routes, Route } from 'react-router-dom'
import { ToolsLayout } from '@/components/tools/ToolsLayout'
import { ProtectedApp } from '@/components/ProtectedApp'
import { LoginPage } from '@/pages/Login'
import { ToolsIndex } from '@/pages/tools/ToolsIndex'
import { DrainSlopeCalculator } from '@/pages/tools/DrainSlopeCalculator'

export default function App() {
  return (
    <Routes>
      <Route path="/verktyg" element={<ToolsLayout />}>
        <Route index element={<ToolsIndex />} />
        <Route path="brunnfall-kalkylator" element={<DrainSlopeCalculator />} />
      </Route>

      <Route path="/login" element={<LoginPage />} />

      <Route path="/*" element={<ProtectedApp />} />
    </Routes>
  )
}
