-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Users table (managed by Supabase Auth)
-- This references auth.users automatically

-- Projects/Tasks table
create table if not exists tasks (
  id uuid default uuid_generate_v4() primary key,
  task_id text not null unique default 'EMT-' || substr(md5(random()::text), 1, 6),
  title text not null,
  status text not null default 'PENDING' check (status in ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED')),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  user_id uuid references auth.users not null,
  content text, -- Stores the conversation/task details
  model text not null default 'claude-3-sonnet', -- AI model used
  tokens_used integer default 0,
  is_public boolean default false
);

-- Chat Messages table
create table if not exists messages (
  id uuid default uuid_generate_v4() primary key,
  task_id uuid references tasks on delete cascade not null,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  created_at timestamptz default now(),
  tokens integer default 0
);

-- Templates table
create table if not exists templates (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  icon text,
  category text not null check (category in ('AI Apps', 'Digital Sidekicks', 'Landing', 'Hack & Play')),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  is_featured boolean default false
);

-- Enable Row Level Security
alter table tasks enable row level security;
alter table messages enable row level security;
alter table templates enable row level security;

-- RLS Policies
create policy "Users can view their own tasks"
  on tasks for select
  using (auth.uid() = user_id);

create policy "Users can create their own tasks"
  on tasks for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own tasks"
  on tasks for update
  using (auth.uid() = user_id);

create policy "Users can delete their own tasks"
  on tasks for delete
  using (auth.uid() = user_id);

create policy "Users can view messages for their tasks"
  on messages for select
  using (
    exists (
      select 1 from tasks
      where tasks.id = messages.task_id
      and tasks.user_id = auth.uid()
    )
  );

create policy "Users can create messages for their tasks"
  on messages for insert
  with check (
    exists (
      select 1 from tasks
      where tasks.id = messages.task_id
      and tasks.user_id = auth.uid()
    )
  );

-- Templates are readable by all
create policy "Templates are viewable by everyone"
  on templates for select
  using (true);

-- Functions
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Triggers
create trigger tasks_updated_at
  before update on tasks
  for each row
  execute procedure update_updated_at();

create trigger templates_updated_at
  before update on templates
  for each row
  execute procedure update_updated_at(); 