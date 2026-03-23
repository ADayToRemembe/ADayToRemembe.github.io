-- Run this in your Supabase SQL editor

create table if not exists comments (
  id uuid default gen_random_uuid() primary key,
  post_slug text not null,
  author_name text not null check (char_length(author_name) <= 60),
  content text not null check (char_length(content) <= 2000),
  created_at timestamptz default now() not null
);

-- Index for fetching comments by post
create index comments_post_slug_idx on comments (post_slug, created_at);

-- Enable Row Level Security
alter table comments enable row level security;

-- Anyone can read comments
create policy "Comments are publicly readable"
  on comments for select
  using (true);

-- Anyone can insert comments (no auth required)
create policy "Anyone can post comments"
  on comments for insert
  with check (true);
