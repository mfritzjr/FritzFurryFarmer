import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = 'https://wtlkqxydepzicwiiyelg.supabase.co';
const SUPABASE_KEY = 'sb_publishable_epM12zev_LwICr_IHCir0w_Acd9XxAA';

export const supabase = createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);