-- This script contains triggers and functions that must be manually applied
-- to your Supabase project in the SQL Editor.

-- Function to check for contact information in idea summaries.
CREATE OR REPLACE FUNCTION public.check_idea_summary_for_contact_info()
RETURNS trigger AS $$
DECLARE
  contact_regex TEXT := '(\w+@\w+\.\w+)|(\+?\d[\d -]{8,12}\d)|(https?:\/\/[^\s]+)';
BEGIN
  -- Check if the new anonymized summary contains contact info
  IF NEW.anonymized_summary ~* contact_regex THEN
    -- Insert a report about the violation
    INSERT INTO public.reports(report_type, description, related_idea_id, related_user_id)
    VALUES ('contact_info_in_summary', 'Contact information detected in idea summary.', NEW.id, NEW.entrepreneur_id);

    -- Prevent the operation from completing
    RAISE EXCEPTION 'Idea summary cannot contain contact information like emails, phone numbers, or links.';
  END IF;

  -- If no contact info is found, allow the operation
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Trigger to run the check BEFORE a new idea is inserted.
DROP TRIGGER IF EXISTS before_idea_insert_check_summary ON public.ideas;
CREATE TRIGGER before_idea_insert_check_summary
BEFORE INSERT ON public.ideas
FOR EACH ROW
EXECUTE FUNCTION public.check_idea_summary_for_contact_info();


-- Trigger to run the check BEFORE an existing idea is updated.
DROP TRIGGER IF EXISTS before_idea_update_check_summary ON public.ideas;
CREATE TRIGGER before_idea_update_check_summary
BEFORE UPDATE OF anonymized_summary ON public.ideas
FOR EACH ROW
WHEN (OLD.anonymized_summary IS DISTINCT FROM NEW.anonymized_summary)
EXECUTE FUNCTION public.check_idea_summary_for_contact_info();


-- Function to automatically create a user profile when a new user signs up in Auth.
CREATE OR REPLACE FUNCTION public.create_user_profile()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.raw_user_meta_data ->> 'role'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create a profile when a user is created.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.create_user_profile();


-- Function to trigger the file processing webhook when a file record is inserted.
CREATE OR REPLACE FUNCTION request_file_processing()
RETURNS trigger AS $$
DECLARE
  function_url TEXT := 'https://<YOUR_PROJECT_REF>.supabase.co/functions/v1/process-upload-webhook';
BEGIN
  -- We need to replace <YOUR_PROJECT_REF> with the actual project reference.
  -- This is a bit of a hack as we can't get it dynamically here easily.
  -- A better approach is to store the full URL in a config table.
  -- For now, this demonstrates the concept. The user must replace this manually
  -- or we must handle it in the deployment script.

  -- This trigger is now primarily for logging and potential future use.
  -- The core logic is handled by the Edge Function listening to table inserts.
  RAISE NOTICE 'File record inserted for idea_id: %, file_path: %', NEW.idea_id, NEW.file_path;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the webhook function (for logging purposes).
DROP TRIGGER IF EXISTS on_file_upload ON public.idea_files;
CREATE TRIGGER on_file_upload
AFTER INSERT ON public.idea_files
FOR EACH ROW
EXECUTE FUNCTION request_file_processing();
