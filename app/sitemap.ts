import { MetadataRoute } from 'next'
import { supabaseAdmin } from '@/lib/supabaseServer'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://tryfolio.online'

  // Fetch all registered usernames from Supabase
  const { data: profiles } = await supabaseAdmin
    .from('profiles')
    .select('username, created_at')

  const profileUrls = (profiles || []).map((profile) => ({
    url: `${baseUrl}/${profile.username}`,
    lastModified: new Date(profile.created_at || Date.now()),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    ...profileUrls,
  ]
}
