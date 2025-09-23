-- =================================================================
--  User Profile Creation & Pitch Content Safeguards
-- =================================================================

-- Function to create a public profile for a new user
CREATE OR REPLACE FUNCTION public.create_user_profile()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create a profile when a new user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.create_user_profile();


-- Function to check for contact info in an idea summary
CREATE OR REPLACE FUNCTION public.check_idea_summary_for_contact_info()
RETURNS trigger AS $$
DECLARE
  contact_regex text := '(\w+@\w+\.\w+)|(\+?\d[\d -]{8,12}\d)|(https?:\/\/[^\s]+)';
BEGIN
  IF NEW.anonymized_summary ~* contact_regex THEN
    INSERT INTO public.reports (report_type, description, related_idea_id, related_user_id)
    VALUES ('contact_info_in_summary', 'Contact information detected in idea summary.', NEW.id, NEW.entrepreneur_id);
    RAISE EXCEPTION 'Idea summary cannot contain contact information like emails, phone numbers, or links.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to run the check BEFORE a new idea is inserted.
DROP TRIGGER IF EXISTS before_idea_insert_check_summary ON public.ideas;
CREATE TRIGGER before_idea_insert_check_summary
  BEFORE INSERT ON public.ideas
  FOR EACH ROW
  EXECUTE FUNCTION public.check_idea_summary_for_contact_info();

-- Trigger to run the check BEFORE an existing idea is updated.
DROP TRIGGER IF EXISTS before_idea_update_check_summary ON public.ideas;
CREATE TRIGGER before_idea_update_check_summary
  BEFORE UPDATE ON public.ideas
  FOR EACH ROW
  WHEN (OLD.anonymized_summary IS DISTINCT FROM NEW.anonymized_summary)
  EXECUTE FUNCTION public.check_idea_summary_for_contact_info();


-- Function to trigger a webhook when a new file is added to an idea
CREATE OR REPLACE FUNCTION public.request_file_processing()
RETURNS trigger AS $$
BEGIN
  PERFORM net.http_post(
    url:='https://<YOUR-PROJECT-REF>.functions.supabase.co/process-upload-webhook',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer <YOUR-SERVICE-ROLE-KEY>"}'::jsonb,
    body:=json_build_object('record', NEW)::jsonb
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to call the webhook when a new file record is created
DROP TRIGGER IF EXISTS on_new_idea_file ON public.idea_files;
CREATE TRIGGER on_new_idea_file
  AFTER INSERT ON public.idea_files
  FOR EACH ROW
  EXECUTE FUNCTION public.request_file_processing();
