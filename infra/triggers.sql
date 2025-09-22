-- Database Triggers for VentureLink

-- This function checks for contact information (email, phone, URL) in a given text body.
-- If found, it creates a report and prevents the operation from completing.
create or replace function public.block_contact_info()
returns trigger as $$
declare
  v_contains_contact_info boolean;
  v_regex text := '(\w+@\w+\.\w+)|(\+?\d[\d -]{8,12}\d)|(https?:\/\/[^\s]+)';
begin
  -- Check if the body of the new row contains contact info
  v_contains_contact_info := (NEW.body ~* v_regex) or (NEW.full_text ~* v_regex);

  if v_contains_contact_info then
    -- If contact info is found, insert a report
    insert into public.reports (reporter_id, report_type, description, related_pitch_id, related_message_id)
    values (
      auth.uid(),
      'contact_info_blocked',
      'Attempted to insert content with contact information.',
      (case when TG_TABLE_NAME = 'pitches' then NEW.id else null end),
      (case when TG_TABLE_NAME = 'messages' then NEW.id else null end)
    );

    -- Block the insert/update operation
    raise exception 'Content cannot contain contact information (email, phone, URL). This attempt has been logged.';
    return null;
  end if;

  -- If no contact info is found, allow the operation
  return NEW;
end;
$$ language plpgsql security definer;

-- Drop existing triggers to avoid conflicts
drop trigger if exists on_message_block_contact_info on public.messages;
drop trigger if exists on_pitch_block_contact_info on public.pitches;

-- Create the trigger for the 'messages' table
create trigger on_message_block_contact_info
before insert or update on public.messages
for each row execute procedure public.block_contact_info();

-- Create the trigger for the 'pitches' table (checking the full_text column)
create trigger on_pitch_block_contact_info
before insert or update on public.pitches
for each row execute procedure public.block_contact_info();

comment on function public.block_contact_info() is 'A trigger function that blocks insertions or updates containing contact information and logs a report.';
