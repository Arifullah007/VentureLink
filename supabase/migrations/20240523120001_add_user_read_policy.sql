-- Allow authenticated users to read user profiles
create policy "Allow authenticated users to read user profiles" on auth.users for
select using (auth.role() = 'authenticated');