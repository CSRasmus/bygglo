<!-- Platsledning.ai - VS Code Copilot Instructions -->

This is a comprehensive fullstack construction project management application.

## Project Overview

- **Frontend**: React + TypeScript + Vite + Tailwind CSS + shadcn/ui
- **Backend**: Node.js + Express + PostgreSQL
- **Auth**: Supabase/JWT
- **Real-time**: WebSockets (Socket.io)
- **AI**: Anthropic Claude 3.5 Sonnet

## Key Technologies

- React Query for data fetching
- Zustand for state management
- PDF.js for drawing visualization
- Recharts for data visualization
- Socket.io for real-time updates
- Winston for logging
- Zod for validation

## Important Conventions

### File Structure
- Frontend components in `client/src/components/`
- Pages in `client/src/pages/`
- API utilities in `client/src/lib/`
- Types in `client/src/types/`
- Backend routes in `server/src/routes/`
- Controllers in `server/src/controllers/`
- Models/Database in `server/src/models/`

### Environment Variables
- Check `.env.example` files for required variables
- Never commit `.env` files
- Database: PostgreSQL (local or Supabase)
- File storage: S3/Cloudflare R2

### API Routes
- All protected routes require JWT token in Authorization header
- Base URL: `/api`
- Error handling consistent across all endpoints

### Database
- Migrations stored in `server/migrations/`
- Use PostgreSQL with proper schema
- Foreign key constraints enforced

## Development Workflow

1. Start PostgreSQL database
2. Run server migrations: `npm run migrate` (in server dir)
3. Start backend: `npm run dev` (in server dir, runs on :3001)
4. Start frontend: `npm run dev` (in client dir, runs on :5173)

## Code Style

- TypeScript strict mode enabled
- ESLint configuration in place
- Tailwind CSS for styling
- Component-based architecture
- Functional components with hooks

## Next Steps After Setup

1. Configure PostgreSQL connection in `.env`
2. Implement authentication endpoints
3. Create database models for all entities
4. Build core UI components from 15 modules
5. Implement WebSocket connections
6. Add AI integration with Claude API

---

Last updated: March 21, 2026
