export interface Project {
  id: string
  name: string
  number: string
  customer: string
  address: string
  startDate: string
  endDate: string
  budget: number
  status: 'planering' | 'produktion' | 'avslutat'
  createdAt: string
  updatedAt: string
}

export interface Activity {
  id: string
  projectId: string
  name: string
  startDate: string
  endDate: string
  progress: number
  status: 'ej_redo' | 'redo' | 'pågår' | 'klar' | 'blockerad'
  dependencies: string[]
  trades: string[]
  createdAt: string
  updatedAt: string
}

export interface Deviation {
  id: string
  projectId: string
  title: string
  description: string
  category: string
  priority: 'låg' | 'medel' | 'hög' | 'kritisk'
  status: 'upptäckt' | 'tilldelad' | 'åtgärdad' | 'verifierad'
  photos: string[]
  location: string
  assignedTo?: string
  createdAt: string
  updatedAt: string
}

export interface DailyLog {
  id: string
  projectId: string
  date: string
  weather: string
  personnel: {
    own: number
    subcontractors: number
  }
  equipment: string[]
  activities: string[]
  deviations: string[]
  deliveries: string[]
  notes: string
  createdAt: string
  updatedAt: string
}

export interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'projectManager' | 'subcontractor' | 'customer'
  projects: string[]
  createdAt: string
  updatedAt: string
}

export interface Drawing {
  id: string
  projectId: string
  name: string
  version: number
  fileUrl: string
  folder: string
  uploadedAt: string
  uploadedBy: string
  previousVersion?: string
}

export interface Task {
  id: string
  projectId: string
  title: string
  description: string
  status: 'backlog' | 'todo' | 'in_progress' | 'done'
  priority: 'låg' | 'medel' | 'hög'
  dueDate?: string
  assignedTo?: string
  source: 'manual' | 'meeting' | 'safetyRound' | 'deviation'
  createdAt: string
  updatedAt: string
}

export interface Meeting {
  id: string
  projectId: string
  title: string
  date: string
  attendees: string[]
  decisions: string[]
  actionItems: string[]
  transcript?: string
  summary?: string
  createdAt: string
  updatedAt: string
}

export interface SafetyRound {
  id: string
  projectId: string
  date: string
  category: 'fallskydd' | 'lyft' | 'el' | 'brand' | 'trafik'
  findings: Array<{
    description: string
    photos: string[]
    responsible: string
    deadline: string
  }>
  createdAt: string
  updatedAt: string
}

export interface ChangeOrder {
  id: string
  projectId: string
  title: string
  amount: number
  status: 'utkast' | 'skickad' | 'godkänd' | 'fakturerad'
  description: string
  subcontractorId?: string
  documents: string[]
  createdAt: string
  updatedAt: string
}
