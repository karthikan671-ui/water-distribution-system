import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Area {
  id: string;
  name: string;
  location: string;
  created_at: string;
  updated_at: string;
}

export interface DistributionUser {
  id: string;
  name: string;
  phone: string;
  area_id: string;
  created_at: string;
  updated_at: string;
}

export interface WaterSchedule {
  id: string;
  area_id: string;
  start_time: string;
  end_time: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SmsLog {
  id: string;
  user_id: string | null;
  message: string;
  status: 'sent' | 'failed';
  area_name: string;
  phone: string;
  sent_at: string;
}
