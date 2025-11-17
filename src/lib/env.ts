export const env = {
  SUPABASE_URL: process.env.SUPABASE_URL || '',
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || '',
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  SITE_URL: process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || '',
}

export function assertServerEnv() {
  if (!env.SUPABASE_URL || (!env.SUPABASE_ANON_KEY && !env.SUPABASE_SERVICE_ROLE_KEY)) {
    throw new Error('server_env_missing')
  }
}



export function getSiteUrl() {
  let v = env.SITE_URL
  if (v && !/^https?:\/\//i.test(v)) v = `https://${v}`
  return v
}
