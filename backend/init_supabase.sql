-- Supabase Initialization Script for Lancera

-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'student' CHECK (role IN ('student', 'surgeon', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create sessions table
CREATE TABLE IF NOT EXISTS public.sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    start_time TIMESTAMP WITH TIME ZONE DEFAULT now(),
    end_time TIMESTAMP WITH TIME ZONE,
    current_step INTEGER DEFAULT 0,
    completed_steps INTEGER[] DEFAULT '{}',
    grafts_placed JSONB DEFAULT '[]',
    vitals_log JSONB DEFAULT '[]',
    score NUMERIC DEFAULT 0,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused'))
);

-- Create surgery_logs table
CREATE TABLE IF NOT EXISTS public.surgery_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID REFERENCES public.sessions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    step_index INTEGER NOT NULL,
    step_name TEXT NOT NULL,
    action TEXT NOT NULL,
    ai_response TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT now(),
    duration INTEGER
);

-- Set up Row Level Security (RLS) - Basic enabling, but allowing full access for now since the Node server handles auth
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.surgery_logs ENABLE ROW LEVEL SECURITY;

-- Allow all operations for authenticated users (or the service role/anon key used by backend)
CREATE POLICY "Allow full access to users" ON public.users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access to sessions" ON public.sessions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access to surgery_logs" ON public.surgery_logs FOR ALL USING (true) WITH CHECK (true);
