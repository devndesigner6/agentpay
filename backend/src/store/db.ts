import { Pool } from 'pg'

const url = process.env.DATABASE_URL
export const db = url ? new Pool({ connectionString: url, max: 5 }) : null

export async function initializeDatabase() {
  if (!db) return false
  await db.query(`create table if not exists agents (id uuid primary key, name text not null, description text, preference text not null default 'cheapest', max_price numeric not null default .03, created_at timestamptz not null default now())`)
  await db.query('alter table agents add column if not exists daily_budget numeric not null default 5')
  await db.query(`create table if not exists api_keys (id uuid primary key, agent_id uuid not null references agents(id) on delete cascade, key_hash text not null unique, key_prefix text not null, created_at timestamptz not null default now(), revoked_at timestamptz)`)
  await db.query(`create table if not exists routing_transactions (
    id uuid primary key,
    created_at timestamptz not null default now(),
    status text not null check (status in ('success', 'failed')),
    provider_id text,
    provider_name text,
    preference text,
    prompt_preview text,
    inbound_payment_reference text,
    downstream_payment_tx text,
    provider_cost numeric,
    latency_ms integer,
    error text
  )`)
  await db.query('alter table routing_transactions add column if not exists agent_id uuid references agents(id) on delete set null')
  await db.query('create index if not exists routing_transactions_created_at_idx on routing_transactions (created_at desc)')
  return true
}
