export const db = {
  projects: [
    {
      id: '1',
      name: 'Villa Renovering',
      number: 'P-2026-001',
      customer: 'Privatkund AB',
      address: 'Storgatan 12, Stockholm',
      startDate: '2026-01-15',
      endDate: '2026-09-30',
      budget: 4500000,
      status: 'produktion',
    },
    {
      id: '2',
      name: 'Kontorsbyggnad',
      number: 'P-2026-002',
      customer: 'Fastighets AB',
      address: 'Industrivägen 5, Göteborg',
      startDate: '2026-03-01',
      endDate: '2027-06-30',
      budget: 12000000,
      status: 'planering',
    },
  ],
  deviations: [
    {
      id: '1',
      projectId: '1',
      title: 'Felaktig lutning mot golvbrunn',
      description: 'Fall i dusch understiger 7 mm/m',
      category: 'kvalitet',
      priority: 'hög',
      status: 'tilldelad',
      location: 'Badrum plan 2',
      photos: [],
    },
    {
      id: '2',
      projectId: '1',
      title: 'Avvikande armering',
      description: '',
      category: 'konstruktion',
      priority: 'medel',
      status: 'upptäckt',
      location: 'Grund',
      photos: [],
    },
  ],
  tasks: [
    {
      id: '1',
      projectId: '1',
      title: 'Kontrollera brunnfall badrum',
      description: 'Verifiera mot GVK Säkra Våtrum 2026',
      status: 'todo',
      priority: 'hög',
      source: 'manual',
    },
    {
      id: '2',
      projectId: '1',
      title: 'Beställa tätskikt',
      description: '',
      status: 'in_progress',
      priority: 'medel',
      source: 'manual',
    },
  ],
}

let nextId = 100
export const newId = () => String(++nextId)
