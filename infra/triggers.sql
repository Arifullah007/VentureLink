-- Function to create a profile for a new user
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email, role)
  values (new.id, new.raw_user_meta_data->>'full_name', new.email, new.raw_user_meta_data->>'role');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to call the function when a new user signs up
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Function to check for contact info in an idea's summary
create or replace function public.check_idea_summary_for_contact_info()
returns trigger as $$
declare
  contact_regex text := '(\w+@\w+\.\w+)|(\+?\d[\d -]{8,12}\d)|(https?:\/\/[^\s]+)';
begin
  if NEW.anonymized_summary ~* contact_regex then
    -- Insert a report for the violation
    insert into public.reports (report_type, description, related_idea_id, related_user_id)
    values ('contact_info_in_summary', 'Contact information detected in idea summary.', NEW.id, NEW.entrepreneur_id);
    
    -- Prevent the insertion/update
    raise exception 'Idea summary cannot contain contact information like emails, phone numbers, or links.';
  end if;
  return NEW;
end;
$$ language plpgsql;

-- Trigger to check idea summary on insert
drop trigger if exists before_idea_insert_check_summary on public.ideas;
create trigger before_idea_insert_check_summary
  before insert on public.ideas
  for each row
  execute procedure public.check_idea_summary_for_contact_info();

-- Trigger to check idea summary on update
drop trigger if exists before_idea_update_check_summary on public.ideas;
create trigger before_idea_update_check_summary
  before update of anonymized_summary on public.ideas
  for each row
  when (OLD.anonymized_summary is distinct from NEW.anonymized_summary)
  execute procedure public.check_idea_summary_for_contact_info();


-- Function to automatically call the process-upload-webhook when a file is inserted
create or replace function public.request_file_processing()
returns trigger as $$
begin
  perform net.http_post(
    url:='https://<YOUR_PROJECT_REF>.functions.supabase.co/process-upload-webhook',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer <YOUR_SUPABASE_ANON_KEY>"}'::jsonb,
    body:=jsonb_build_object('record', NEW)
  );
  return NEW;
end;
$$ language plpgsql;

-- Trigger to process a new file upload for an idea
drop trigger if exists on_new_idea_file_created on public.idea_files;
create trigger on_new_idea_file_created
    after insert on public.idea_files
    for each row
    execute procedure public.request_file_processing();
