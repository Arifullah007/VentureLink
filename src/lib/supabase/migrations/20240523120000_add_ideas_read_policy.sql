
-- Enable Row Level Security for the ideas table
ALTER TABLE public.ideas ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows read access to everyone
CREATE POLICY "Allow read access to all users"
ON public.ideas
FOR SELECT
USING (true);
