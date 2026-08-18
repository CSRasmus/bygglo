import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: 'http://localhost:5173',
    credentials: true,
  },
});

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running!' });
});

const USERS = {
  rasmus: { id: 'user-rasmus', email: 'rasmus.nilsson9931@gmail.com', name: 'Rasmus Nilsson', role: 'admin' },
  admin: { id: 'user-1', email: 'admin@bygglo.se', name: 'Admin', role: 'projectManager' },
};

const WHITELIST_PASSWORD = process.env.WHITELIST_PASSWORD || 'Byggos2026!';

function authenticateLogin(email, password) {
  const normalized = (email || '').toLowerCase().trim();
  if (normalized === 'rasmus.nilsson9931@gmail.com' && password === WHITELIST_PASSWORD) {
    return USERS.rasmus;
  }
  if (normalized === 'admin@bygglo.se' && password === 'demo1234') {
    return USERS.admin;
  }
  return null;
}

// Auth routes
app.post('/api/auth/login', (req, res) => {
  const user = authenticateLogin(req.body?.email, req.body?.password);
  if (!user) {
    return res.status(401).json({ error: 'Felaktig e-post eller lösenord' });
  }
  res.json({ token: `demo-token-${user.id}`, user });
});

app.post('/api/auth/register', (req, res) => {
  res.json({ token: 'demo-token', user: { id: 'user-1', email: req.body.email || 'test@example.com', name: req.body.name || 'Test User', role: 'projectManager' } });
});

app.post('/api/auth/logout', (req, res) => {
  res.json({ message: 'Logout successful' });
});

app.get('/api/auth/me', (req, res) => {
  const auth = req.headers.authorization || '';
  if (auth.includes('user-rasmus')) return res.json(USERS.rasmus);
  res.json(USERS.admin);
});

// In-memory store for mutations
const db = {
  projects: [
    { id: '1', name: 'Boligprosjekt A', number: 'P-2024-001', customer: 'Kundenavn AS', address: 'Bygata 1, 0100 Oslo', startDate: '2024-01-01', endDate: '2024-12-31', budget: 5000000, status: 'produktion' },
    { id: '2', name: 'Kontorbygg B', number: 'P-2024-002', customer: 'Bygge AS', address: 'Kontorgata 2, 0102 Oslo', startDate: '2024-02-01', endDate: '2025-06-30', budget: 8000000, status: 'planering' },
  ],
  deviations: [
    { id: '1', projectId: '1', title: 'Feilaktig armering', description: '', category: 'kvalitet', priority: 'hög', status: 'tilldelad', location: 'Plan 2', photos: [] },
    { id: '2', projectId: '1', title: 'Missingfeil i søyle', description: '', category: 'konstruksjon', priority: 'medel', status: 'upptäckt', location: 'Grunnmur', photos: [] },
  ],
  tasks: [
    { id: '1', projectId: '1', title: 'Kontrollere armering', description: '', status: 'todo', priority: 'hög', source: 'manual' },
    { id: '2', projectId: '1', title: 'Bestille materialer', description: '', status: 'in_progress', priority: 'medel', source: 'manual' },
  ],
};

let nextId = 100;
const newId = () => String(++nextId);

// Projects
app.get('/api/projects', (_req, res) => res.json(db.projects));
app.get('/api/projects/:id', (req, res) => res.json(db.projects.find(p => p.id === req.params.id) || {}));
app.post('/api/projects', (req, res) => {
  const p = { ...req.body, id: newId() };
  db.projects.push(p);
  res.json(p);
});
app.put('/api/projects/:id', (req, res) => {
  const i = db.projects.findIndex(p => p.id === req.params.id);
  if (i >= 0) db.projects[i] = { ...db.projects[i], ...req.body };
  res.json(db.projects[i] || {});
});
app.delete('/api/projects/:id', (req, res) => {
  db.projects = db.projects.filter(p => p.id !== req.params.id);
  res.json({ ok: true });
});

// Activities
app.get('/api/activities', (_req, res) => res.json([
  { id: '1', projectId: '1', name: 'Grunnarbeid', progress: 100, status: 'klar' },
  { id: '2', projectId: '1', name: 'Betongarbeider', progress: 65, status: 'pågår' },
  { id: '3', projectId: '1', name: 'Snickeri', progress: 0, status: 'ej_redo' },
]));

// Deviations
app.get('/api/deviations', (_req, res) => res.json(db.deviations));
app.post('/api/deviations', (req, res) => {
  const d = { ...req.body, id: newId(), photos: [], status: 'upptäckt' };
  db.deviations.push(d);
  res.json(d);
});
app.put('/api/deviations/:id', (req, res) => {
  const i = db.deviations.findIndex(d => d.id === req.params.id);
  if (i >= 0) db.deviations[i] = { ...db.deviations[i], ...req.body };
  res.json(db.deviations[i] || {});
});

// Drawings
app.get('/api/drawings', (_req, res) => res.json([
  { id: '1', projectId: '1', name: 'Plantegning 1. etasje', version: 3, folder: 'plantegninger' },
  { id: '2', projectId: '1', name: 'Fasade', version: 2, folder: 'fasader' },
]));

// Tasks
app.get('/api/tasks', (_req, res) => res.json(db.tasks));
app.post('/api/tasks', (req, res) => {
  const t = { ...req.body, id: newId(), source: 'manual' };
  db.tasks.push(t);
  res.json(t);
});
app.put('/api/tasks/:id', (req, res) => {
  const i = db.tasks.findIndex(t => t.id === req.params.id);
  if (i >= 0) db.tasks[i] = { ...db.tasks[i], ...req.body };
  res.json(db.tasks[i] || {});
});
app.delete('/api/tasks/:id', (req, res) => {
  db.tasks = db.tasks.filter(t => t.id !== req.params.id);
  res.json({ ok: true });
});

// Meetings
app.get('/api/meetings', (_req, res) => res.json([
  { id: '1', projectId: '1', title: 'Bausmøte uke 10', date: '2024-03-08', attendees: 5 },
]));

// Safety rounds
app.get('/api/safety-rounds', (_req, res) => res.json([
  { id: '1', projectId: '1', date: '2024-03-15', category: 'fallskydd', findings: 2 },
]));

// Daily logs
app.get('/api/daily-logs', (_req, res) => res.json([
  { id: '1', projectId: '1', date: '2024-03-20', weather: 'Klart', personnel: { own: 8, subcontractors: 4 } },
]));

// Change orders
app.get('/api/change-orders', (_req, res) => res.json([
  { id: '1', projectId: '1', title: 'Tillegg rorbinding', amount: 45000, status: 'godkänd' },
]));

// Users
app.get('/api/users', (_req, res) => res.json([
  { id: '1', email: 'admin@bygglo.se', name: 'Admin', role: 'projectManager' },
]));

// WebSocket
io.on('connection', (socket) => {
  console.log('🔌 Client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('🔌 Client disconnected:', socket.id);
  });

  socket.on('projectUpdate', (data) => {
    io.emit('projectUpdated', data);
  });
});

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════╗
║  🚀 Platsledning.ai Backend       ║
║  Running on port ${PORT}              ║
╚════════════════════════════════════╝

📍 Health Check: http://localhost:${PORT}/health
🌐 CORS enabled for: http://localhost:5173
  `);
});

export { app, io };
