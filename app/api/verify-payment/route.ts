import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabaseAdmin, verifyUser, unauthorizedResponse } from '@/lib/supabaseServer';

export async function POST(req: Request) {
  try {
    // Verify authentication
    const verifiedUserId = await verifyUser(req);
    if (!verifiedUserId) return unauthorizedResponse();

    const body = await req.json();
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = body;

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return NextResponse.json({ success: false, error: "Missing required signature verification fields" }, { status: 400 });
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return NextResponse.json({ success: false, error: "Razorpay credentials not configured in .env.local" }, { status: 401 });
    }

    const generated_signature = crypto
      .createHmac('sha256', keySecret)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest('hex');

    if (generated_signature !== razorpay_signature) {
      return NextResponse.json({ success: false, error: "Signature mismatch verification failed" }, { status: 400 });
    }

    // Update profile to Pro in DB using the verified user ID
    const { error } = await supabaseAdmin
      .from('profiles')
      .update({ is_pro: true })
      .eq('id', verifiedUserId);
    
    if (error) {
      console.error('Failed to update pro status in database:', error);
      return NextResponse.json({ success: false, error: 'Database update failed' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Verify payment error:', error);
    return NextResponse.json({ success: false, error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
