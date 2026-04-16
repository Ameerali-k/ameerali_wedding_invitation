import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://izaybtzuinacmprznypq.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'MISSING_ANON_KEY'
);
