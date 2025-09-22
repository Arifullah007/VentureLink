-- Function to create a profile for a new user
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, new.raw_user_meta_data->>'full_name', new.email);
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to call the function when a new user signs up
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Function to automatically generate a report when a pitch summary contains contact info
CREATE OR REPLACE FUNCTION public.check_pitch_summary_for_contact_info()
RETURNS TRIGGER AS $$
BEGIN
    -- Check for email address or phone number in anonymized_summary
    IF NEW.anonymized_summary ~* '\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b' OR
       NEW.anonymized_summary ~* '\+?[0-9]{10,15}' THEN
        
        -- Insert a report into the reports table
        INSERT INTO public.reports (report_type, description, related_user_id, related_pitch_id)
        VALUES ('contact_info_in_summary', 'Contact information detected in pitch summary.', NEW.entrepreneur_id, NEW.id);
        
        -- Prevent the insert/update by raising an exception
        RAISE EXCEPTION 'Pitch summary cannot contain contact information like emails or phone numbers.';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to call the check function before inserting or updating a pitch
CREATE OR REPLACE TRIGGER before_pitch_insert_or_update
BEFORE INSERT OR UPDATE ON public.pitches
FOR EACH ROW
EXECUTE FUNCTION public.check_pitch_summary_for_contact_info();

-- Webhook on new file upload to trigger processing
CREATE OR REPLACE TRIGGER on_file_upload
AFTER INSERT ON public.pitch_files
FOR EACH ROW
EXECUTE FUNCTION supabase_functions.http_request(
    'https://zjecfmaemqjnyxgjmjgp.supabase.co/functions/v1/process-upload-webhook',
    'POST',
    '{"Content-type":"application/json"}',
    '{}',
    1000
);
