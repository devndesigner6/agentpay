import { Pool } from 'pg'

const url = process.env.DATABASE_URL
export const db = url ? new Pool({ connectionString: url, max: 5 }) : null

export async function initializeDatabase() {
  if (!db) return false
  await db.query(`create table if not exists agents (id uuid primary key, name text not null, description text, preference text not null default 'cheapest', max_price numeric not null default .03, created_at timestamptz not null default now())`)
  await db.query(`create table if not exists api_keys (id uuid primary key, agent_id uuid not null references agents(id) on delete cascade, key_hash text not null unique, key_prefix text not null, created_at timestamptz not null default now(), revoked_at timestamptz)`)
  return true
}
