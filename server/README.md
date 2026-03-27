# Platsledning.ai - Backend

Node.js + Express + PostgreSQL

## Environment Variables

Create a `.env` file with:

```
PORT=3001
NODE_ENV=development

# Database
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432
DB_NAME=platsledning_ai

# JWT
JWT_SECRET=your_secret_key_here

# Supabase (optional)
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key

# File Storage (S3/R2)
S3_BUCKET=your_bucket
S3_REGION=your_region
S3_ACCESS_KEY=your_access_key
S3_SECRET_KEY=your_secret_key

# AI
ANTHROPIC_API_KEY=your_anthropic_key

# Frontend URL
FRONTEND_URL=http://localhost:5173

# Logging
LOG_LEVEL=info
```

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

## Migrations

```bash
npm run migrate
```

## Seed Database

```bash
npm run seed
```
