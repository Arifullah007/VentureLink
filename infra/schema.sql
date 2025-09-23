-- VentureLink DB Schema
-- This script is idempotent and can be run multiple times safely.

-- 1. Create Profiles Table
-- This table stores public user data.
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('investor', 'entrepreneur')),
  full_name text,
  bio text,
  website_url text,
  linkedin_url text,
  avatar_url text,
  updated_at timestamp with time zone
);
alter table profiles enable row level security;

-- Policy: Allow users to read their own profile
create policy "Allow users to read their own profile" on profiles
  for select using (auth.uid() = id);

-- Policy: Allow users to update their own profile
create policy "Allow users to update their own profile" on profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- Policy: Allow authenticated users to read public profile data
create policy "Allow authenticated users to read public profile data" on profiles
  for select to authenticated using (true);
  
comment on table profiles is 'Stores public user data and links to auth.users.';


-- 2. Create Ideas Table
-- This table stores the core startup ideas submitted by entrepreneurs.
create table if not exists ideas (
    id uuid primary key default uuid_generate_v4(),
    entrepreneur_id uuid not null references auth.users(id) on delete cascade,
    idea_title text not null,
    anonymized_summary text not null,
    full_text text, -- For NDA-unlocked view
    sector text,
    investment_required text,
    estimated_returns text,
    views integer default 0,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);
alter table ideas enable row level security;

-- Policy: Entrepreneurs can manage their own ideas
create policy "Entrepreneurs can manage their own ideas" on ideas
    for all using (auth.uid() = entrepreneur_id)
    with check (auth.uid() = entrepreneur_id);

-- Policy: Authenticated users can view ideas
create policy "Authenticated users can view ideas" on ideas
    for select to authenticated using (true);

comment on table ideas is 'Stores the core startup ideas submitted by entrepreneurs.';


-- 3. Create Idea Files Table
-- This table tracks files associated with ideas, like prototypes or business plans.
create table if not exists idea_files (
  id uuid primary key default uuid_generate_v4(),
  idea_id uuid not null references ideas(id) on delete cascade,
  file_path text not null,
  file_name text,
  created_at timestamp with time zone default now(),
  processed_at timestamp with time zone,
  watermarked_url text
);
alter table idea_files enable row level security;

-- Policy: Owners can view their own idea files.
create policy "Owners can read their own files" on idea_files
    for select using (
        exists (
            select 1 from ideas where ideas.id = idea_files.idea_id and ideas.entrepreneur_id = auth.uid()
        )
    );

-- Policy: Allow insert for idea owners.
create policy "Owners can insert their own files" on idea_files
    for insert with check (
        exists (
            select 1 from ideas where ideas.id = idea_files.idea_id and ideas.entrepreneur_id = auth.uid()
        )
    );

comment on table idea_files is 'Tracks files associated with ideas for processing and storage.';


-- 4. Create Triggers for Profile Management
-- Function to create a profile entry when a new user signs up in Supabase Auth.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, role, full_name, updated_at)
  values (
    new.id,
    new.raw_user_meta_data->>'role',
    new.raw_user_meta_data->>'full_name',
    now()
  );
  return new;
end;
$$;

-- Trigger to execute the function after a new user is created.
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

comment on function handle_new_user is 'Automatically creates a user profile upon new user registration.';


-- 5. Helper Function for SQL Execution
-- This function allows the seed script to run arbitrary SQL.
create or replace function execute_sql(sql text)
returns void as $$
begin
    execute sql;
end;
$$ language plpgsql;

comment on function execute_sql is 'Executes arbitrary SQL, used by the seeding script.';


-- 6. Storage Bucket for Prototypes
-- Creates the 'prototypes' bucket if it doesn't already exist.
insert into storage.buckets (id, name, public)
values ('prototypes', 'prototypes', false)
on conflict (id) do nothing;

comment on table storage.buckets is 'Using ON CONFLICT to prevent errors if the bucket already exists.';


-- 7. Storage Policies
-- Define who can do what within the 'prototypes' bucket.

-- Policy: Allow authenticated users to view files in the 'prototypes' bucket.
-- (More specific access will be controlled by your application logic, e.g., after an NDA is signed).
create policy "Allow authenticated read access"
    on storage.objects for select
    to authenticated
    using (bucket_id = 'prototypes');

-- Allow idea owner to upload to their folder
create policy "Allow idea owner to upload to their folder"
  for insert on storage.objects with check (
    bucket_id = 'prototypes' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow idea owner to update their own files
create policy "Allow idea owner to update their files"
    on storage.objects for update
    using (
        bucket_id = 'prototypes' and
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- Allow idea owner to delete their own files
create policy "Allow idea owner to delete their files"
    on storage.objects for delete
    using (
        bucket_id = 'prototypes' and
        auth.uid()::text = (storage.foldername(name))[1]
    );


-- 8. Edge Function for Signed Upload URL
-- This function is invoked by the client to get a secure URL for uploading files.
-- This part is now handled via the Supabase Edge Function definition, but we need a placeholder
-- and will ensure security via policies.

-- The actual Edge Function code lives in `supabase/functions/get-signed-upload-url/index.ts`
-- The schema only needs to be aware of its existence if it were to be invoked from SQL,
-- but here we are just documenting its role.

-- 9. Seeding Data (Optional but recommended for demo)
-- This section is now handled by the `scripts/seed_demo.ts` file,
-- which runs automatically with `npm run dev`.

-- End of Schema
