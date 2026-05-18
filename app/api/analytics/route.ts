import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabaseServer"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { profile_id, type, link_type, source, country } = body

    if (!profile_id || !type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (type === 'view') {
      const { error } = await supabaseAdmin.from('page_views').insert({ 
        profile_id, 
        source: source || 'direct', 
        country: country || 'unknown' 
      })
      if (error) throw error
    } else if (type === 'click') {
      const { error } = await supabaseAdmin.from('link_clicks').insert({ 
        profile_id, 
        link_type: link_type || 'other' 
      })
      if (error) throw error
    }

    console.log(`[Analytics] Tracked ${type} for profile ${profile_id}`)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Analytics error:', error)
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 })
  }
}
