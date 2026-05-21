import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function middleware(request: NextRequest) {
  const url = request.nextUrl.clone()
  const host = request.headers.get('host') || ''

  // 1. Skip system paths, APIs, static files, and dashboard assets
  if (
    url.pathname.startsWith('/_next') ||
    url.pathname.startsWith('/api') ||
    url.pathname.startsWith('/static') ||
    url.pathname.startsWith('/dashboard') ||
    url.pathname.startsWith('/login') ||
    url.pathname.startsWith('/signup') ||
    url.pathname.startsWith('/onboarding') ||
    url.pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // 2. Identify system domains that should not be mapped
  const systemDomains = ['localhost:3000', 'folio.in', 'www.folio.in', 'tryfolio.online', 'www.tryfolio.online']
  const isSystemDomain = systemDomains.some(
    (domain) => host === domain || host.includes(domain)
  )

  // 3. For custom domains, check matches in the database
  if (!isSystemDomain) {
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
      
      if (supabaseUrl && supabaseAnonKey) {
        const supabase = createClient(supabaseUrl, supabaseAnonKey)

        // Construct search list for both naked and www. variants of the host
        const domainsToSearch = [host]
        if (host.startsWith('www.')) {
          domainsToSearch.push(host.substring(4))
        } else {
          domainsToSearch.push('www.' + host)
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('username')
          .in('custom_domain', domainsToSearch)
          .maybeSingle()

        if (profile && profile.username) {
          // Transparently rewrite /path to /[username]/path
          const rewritePath = `/${profile.username}${url.pathname}`
          return NextResponse.rewrite(new URL(rewritePath, request.url))
        }
      }
    } catch (err) {
      console.error('Next.js Middleware custom domain lookup failure:', err)
    }
  }

  return NextResponse.next()
}
