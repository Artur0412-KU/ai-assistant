import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const supabase = createClient(
  'https://ubopdowtqrjnfoqlxnxa.supabase.co',
  'sb_publishable_CrHpkp-nvJwvbz6yKNhq6g_yrhLH7--',
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);
