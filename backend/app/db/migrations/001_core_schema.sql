-- MedBot Production Schema Migration
-- Run this in the Supabase SQL Editor (Dashboard > SQL Editor > New Query)
-- 
-- Prerequisites: Enable pgvector extension in Supabase Dashboard > Database > Extensions > vector

-- 1. Enable pgvector extension
create extension if not exists vector;

-- 2. Profiles table (already exists in Supabase, but ensure schema)
create table if not exists profiles (
  id uuid primary key,
  full_name text,
  date_of_birth date,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 3. Reports table
create table if not exists reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) not null,
  storage_path text not null default '',
  report_type text,
  report_date date,
  ordering_facility text,
  status text default 'processing',
  parser_used text,
  created_at timestamptz default now()
);

create index if not exists idx_reports_user_id on reports(user_id);

-- 4. Report Chunks table (the core RAG vector store)
create table if not exists report_chunks (
  id uuid primary key default gen_random_uuid(),
  report_id uuid references reports(id) on delete cascade not null,
  parent_chunk_id uuid references report_chunks(id),
  chunk_type text,           -- 'table' | 'narrative_parent' | 'narrative_child' | 'header'
  section text,              -- 'labs' | 'medications' | 'impressions' | null
  page_number int,
  bbox jsonb,
  loinc_code text,
  is_abnormal boolean default false,
  content text not null,
  embedding vector(1024),    -- NVIDIA nv-embedqa-e5-v5 1024-dimensional
  content_tsv tsvector generated always as (to_tsvector('english', content)) stored,
  token_count int,
  created_at timestamptz default now()
);

-- Fast HNSW Cosine Index for dense vector similarity search
create index if not exists idx_report_chunks_embedding
  on report_chunks using hnsw (embedding vector_cosine_ops);

-- GIN Index for sparse full-text keyword search (BM25 equivalent)
create index if not exists idx_report_chunks_tsv
  on report_chunks using gin (content_tsv);

-- Index for filtering by report
create index if not exists idx_report_chunks_report_id
  on report_chunks(report_id);

-- 5. Chats table (already exists, ensure schema)
create table if not exists chats (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) not null,
  report_id uuid references reports(id),
  title text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 6. Messages table (already exists, ensure schema)
-- Note: uses chat_id (not conversation_id) as foreign key
create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  chat_id uuid references chats(id) on delete cascade not null,
  user_id uuid references profiles(id) not null,
  role text not null,
  content text not null,
  token_count int,
  model_used text,
  rag_sources jsonb,
  created_at timestamptz default now()
);

-- 7. Audit Log table
create table if not exists audit_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  action text not null,
  resource_type text,
  resource_id uuid,
  metadata jsonb,
  created_at timestamptz default now()
);
