import { NextResponse } from 'next/server'
import { supabaseAdmin, verifyUser, unauthorizedResponse, forbiddenResponse } from '@/lib/supabaseServer'

export async function POST(req: Request) {
  try {
    // Verify authentication
    const verifiedUserId = await verifyUser(req)
    if (!verifiedUserId) return unauthorizedResponse()

    const formData = await req.formData()
    const file = formData.get('file') as File
    const bucket = formData.get('bucket') as string // 'avatars' or 'resumes'
    const userId = formData.get('userId') as string

    if (!file || !bucket || !userId) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
    }

    // Ensure user can only upload to their own profile
    if (verifiedUserId !== userId) return forbiddenResponse()

    // 1. Enforce strict validation rules for launch security
    if (bucket === 'avatars') {
      if (!file.type.startsWith('image/')) {
        return NextResponse.json({ error: 'Avatar uploads must be images' }, { status: 400 })
      }
    } else if (bucket === 'resumes') {
      if (file.type !== 'application/pdf') {
        return NextResponse.json({ error: 'Resume uploads must be a PDF file' }, { status: 400 })
      }
    } else {
      return NextResponse.json({ error: 'Invalid target bucket' }, { status: 400 })
    }

    // 2. Format a safe, unique filename
    const fileExt = file.name.split('.').pop() || (bucket === 'avatars' ? 'png' : 'pdf')
    const fileName = `${userId}_${Date.now()}.${fileExt}`

    // 3. Upload binary array buffer directly to Supabase Storage
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    let { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: true,
      })

    // If the bucket does not exist, automatically create it as a public bucket and retry
    if (error && error.message?.includes('Bucket not found')) {
      console.warn(`Bucket '${bucket}' not found in Supabase Storage. Programmatically creating it...`)
      const { error: createError } = await supabaseAdmin.storage.createBucket(bucket, {
        public: true,
        allowedMimeTypes: bucket === 'avatars' ? ['image/*'] : ['application/pdf'],
      })
      if (!createError) {
        console.log(`Successfully created bucket '${bucket}'. Retrying file upload...`)
        const retryResult = await supabaseAdmin.storage
          .from(bucket)
          .upload(fileName, buffer, {
            contentType: file.type,
            upsert: true,
          })
        data = retryResult.data
        error = retryResult.error
      } else {
        console.error(`Failed to programmatically create bucket '${bucket}':`, createError)
      }
    }

    if (error) {
      console.error('Supabase Storage SDK Error:', error)
      return NextResponse.json({ error: 'Storage upload operation failed' }, { status: 500 })
    }

    // 4. Retrieve the secure public link
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from(bucket)
      .getPublicUrl(fileName)

    return NextResponse.json({ success: true, url: publicUrl })
  } catch (error: any) {
    console.error('CDN Upload API failed:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
