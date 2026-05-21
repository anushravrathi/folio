import { NextResponse } from 'next/server';
import { verifyUser, unauthorizedResponse } from '@/lib/supabaseServer';
import { cleanDomain } from '@/lib/utils';
import dns from 'dns/promises';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    // 1. Verify user authentication
    const verifiedUserId = await verifyUser(req);
    if (!verifiedUserId) return unauthorizedResponse();

    // 2. Parse query parameters
    const { searchParams } = new URL(req.url);
    const rawDomain = searchParams.get('domain');

    if (!rawDomain) {
      return NextResponse.json({ success: false, error: 'Domain parameter is required' }, { status: 400 });
    }

    const domain = cleanDomain(rawDomain);
    if (!domain) {
      return NextResponse.json({ success: false, error: 'Invalid domain name format' }, { status: 400 });
    }

    let aRecords: string[] = [];
    let cnameRecords: string[] = [];
    let aLookupError = '';
    let cnameLookupError = '';

    // 3. Resolve A Records
    try {
      aRecords = await dns.resolve4(domain);
    } catch (err: any) {
      aLookupError = err.code || err.message || 'Error';
    }

    // 4. Resolve CNAME Records
    try {
      cnameRecords = await dns.resolveCname(domain);
    } catch (err: any) {
      cnameLookupError = err.code || err.message || 'Error';
    }

    // 5. Clean up domains in CNAME records (strip trailing dots returned by DNS resolver)
    const normalizedCnames = cnameRecords.map(cname => cname.toLowerCase().replace(/\.$/, ''));

    // 6. Validate expected configurations
    // Vercel's standard global IP is 76.76.21.21
    const isAPointing = aRecords.includes('76.76.21.21');
    const isCNAMEPointing = normalizedCnames.includes('cname.vercel-dns.com');

    const verified = isAPointing || isCNAMEPointing;

    return NextResponse.json({
      success: true,
      verified,
      domain,
      records: {
        A: aRecords,
        CNAME: normalizedCnames,
      },
      expected: {
        A: '76.76.21.21',
        CNAME: 'cname.vercel-dns.com',
      },
      debug: {
        aError: aLookupError,
        cnameError: cnameLookupError,
      }
    });

  } catch (error: any) {
    console.error('DNS verification API error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal server error' }, { status: 500 });
  }
}
