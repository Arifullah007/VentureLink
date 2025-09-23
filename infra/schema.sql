-- VentureLink DB Schema

-- Drop existing tables and types if they exist to ensure a clean slate
drop table if exists public.ideas cascade;
drop table if exists public.profiles cascade;
drop table if exists public.notifications cascade;
drop type if exists public.user_role cascade;
drop extension if exists "uuid-ossp" cascade;

-- Extensions
create extension if not exists "uuid-ossp" with schema public;

-- Create a custom type for user roles
create type public.user_role as enum ('entrepreneur', 'investor');

-- Create a table for public profiles
create table public.profiles (
  id uuid references auth.users not null primary key,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone,
  full_name text,
  avatar_url text,
  website_url text,
  linkedin_url text,
  role user_role, -- This will be 'entrepreneur' or 'investor'
  
  -- Investor-specific fields
  bio text,
  preferred_sector text,
  investment_range text,
  expected_returns text
);

-- Create a table for startup ideas
create table public.ideas (
    id uuid primary key default uuid_generate_v4(),
    entrepreneur_id uuid references public.profiles(id) not null,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone,
    idea_title text not null,
    anonymized_summary text not null,
    full_text text, -- Revealed after NDA
    sector text,
    investment_required text,
    estimated_returns text,
    prototype_url text,
    views integer default 0
);

-- Create a table for notifications
create table public.notifications (
    id uuid primary key default uuid_generate_v4(),
    recipient_id uuid references public.profiles(id) not null,
    sender_id uuid references public.profiles(id) not null,
    idea_id uuid references public.ideas(id),
    type text not null, -- e.g., 'APPROACH', 'NDA_REQUEST', 'MESSAGE'
    content text not null,
    is_read boolean default false,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone
);

-- Set up Row Level Security (RLS)

-- Allow public access to profiles, but with restrictions
alter table public.profiles enable row level security;
create policy "Public profiles are viewable by everyone." on public.profiles for select using (true);
create policy "Users can insert their own profile." on public.profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile." on public.profiles for update using (auth.uid() = id);

-- Allow authenticated users to see ideas, but with restrictions
alter table public.ideas enable row level security;
create policy "Ideas are viewable by authenticated users." on public.ideas for select using (auth.role() = 'authenticated');
create policy "Entrepreneurs can insert their own ideas." on public.ideas for insert with check (
    auth.uid() = entrepreneur_id and 
    (select role from public.profiles where id = auth.uid()) = 'entrepreneur'
);
create policy "Entrepreneurs can update their own ideas." on public.ideas for update using (
    auth.uid() = entrepreneur_id and
    (select role from public.profiles where id = auth.uid()) = 'entrepreneur'
);
create policy "Users can delete their own ideas." on public.ideas for delete using (auth.uid() = entrepreneur_id);

-- Secure notifications table
alter table public.notifications enable row level security;
create policy "Users can see their own notifications." on public.notifications for select using (auth.uid() = recipient_id);
create policy "Users can send notifications." on public.notifications for insert with check (auth.uid() = sender_id);
create policy "Users can update their own notifications (e.g., mark as read)." on public.notifications for update using (auth.uid() = recipient_id);


-- This trigger automatically creates a profile entry when a new user signs up.
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, role, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', (new.raw_user_meta_data->>'role')::user_role, new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

-- Drop trigger if it exists, then create it
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- Storage policies
-- Create a bucket for idea prototypes
insert into storage.buckets (id, name, public)
values ('idea_prototypes', 'idea_prototypes', false)
on conflict (id) do nothing;

-- Policies for idea_prototypes bucket
-- 1. Allow authenticated users to view files
create policy "Authenticated users can see prototypes" on storage.objects for select
using ( bucket_id = 'idea_prototypes' and auth.role() = 'authenticated' );

-- 2. Allow entrepreneurs to upload files into their own folder
create policy "Entrepreneurs can upload to their folder" on storage.objects for insert
with check ( bucket_id = 'idea_prototypes' and auth.uid()::text = (storage.foldername(name))[1] );

-- 3. Allow entrepreneurs to update files in their own folder
create policy "Entrepreneurs can update their own files" on storage.objects for update
using ( bucket_id = 'idea_prototypes' and auth.uid()::text = (storage.foldername(name))[1] );

-- 4. Allow entrepreneurs to delete files from their own folder
create policy "Entrepreneurs can delete their own files" on storage.objects for delete
using ( bucket_id = 'idea_prototypes' and auth.uid()::text = (storage.foldername(name))[1] );

-- Enable real-time updates on the 'ideas' table
begin;
  drop publication if exists supabase_realtime;
  create publication supabase_realtime;
commit;

alter publication supabase_realtime add table public.ideas;
alter publication supabase_realtime add table public.notifications;
