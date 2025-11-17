-- Enable real-time updates for workers table
ALTER TABLE public.workers REPLICA IDENTITY FULL;

-- Add workers table to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE workers;