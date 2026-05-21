import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { verifyUser, unauthorizedResponse } from '@/lib/supabaseServer';

export async function POST(req: Request) {
  try {
    // Verify authentication
    const verifiedUserId = await verifyUser(req);
    if (!verifiedUserId) return unauthorizedResponse();
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return NextResponse.json({ error: "Razorpay credentials are not configured in .env.local" }, { status: 500 });
    }

    const body = await req.json().catch(() => ({}));
    const amount = body.amount || 49900; // Default to ₹499 in paise (₹499.00) if not specified

    if (amount < 100) {
      return NextResponse.json({ error: "Amount must be at least 100 paise (₹1)" }, { status: 400 });
    }

    const instance = new Razorpay({ key_id: keyId, key_secret: keySecret });
    const order = await instance.orders.create({
      amount: amount,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    });

    return NextResponse.json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      key_id: keyId,
    });
  } catch (error: any) {
    console.error('Create order error:', error);
    const isAuthFailure = error.statusCode === 401 || 
                          (error.error && error.error.description === "Authentication failed");
    if (isAuthFailure) {
      return NextResponse.json({ 
        error: "Razorpay authentication failed! The API Key ID or Secret configured in .env.local is invalid or has expired." 
      }, { status: 401 });
    }
    return NextResponse.json({ 
      error: error.message || "Internal Server Error"
    }, { status: 500 });
  }
}
