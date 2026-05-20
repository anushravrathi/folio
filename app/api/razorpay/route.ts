import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { action } = body

    // Environment variables for Razorpay (will be set when ready to ship)
    const keyId = process.env.RAZORPAY_KEY_ID
    const keySecret = process.env.RAZORPAY_KEY_SECRET

    if (action === "create_order") {
      if (keyId && keySecret) {
        // TODO: Real Razorpay integration
        // const Razorpay = require('razorpay')
        // const instance = new Razorpay({ key_id: keyId, key_secret: keySecret })
        // const order = await instance.orders.create({
        //   amount: 49900, // ₹499 in paise
        //   currency: "INR",
        //   receipt: `receipt_${Date.now()}`,
        // })
        // return NextResponse.json(order)
      }

      // Mock order for development
      const order = { 
        id: `order_mock_${Date.now()}`, 
        amount: 49900, 
        currency: "INR",
        key_id: keyId || "rzp_test_mock" 
      }
      return NextResponse.json(order)
    }

    if (action === "verify") {
      const { razorpay_payment_id, razorpay_order_id, razorpay_signature, userId } = body
      
      if (!razorpay_payment_id) {
        return NextResponse.json({ success: false, error: "Missing payment ID" }, { status: 400 })
      }

      if (keyId && keySecret) {
        // TODO: Real signature verification
        // const crypto = require('crypto')
        // const generated_signature = crypto
        //   .createHmac('sha256', keySecret)
        //   .update(razorpay_order_id + "|" + razorpay_payment_id)
        //   .digest('hex')
        // if (generated_signature !== razorpay_signature) {
        //   return NextResponse.json({ success: false, error: "Invalid signature" }, { status: 400 })
        // }
      }
      
      // Update profile to Pro
      if (userId) {
        const { supabaseAdmin } = await import('@/lib/supabaseServer')
        const { error } = await supabaseAdmin
          .from('profiles')
          .update({ is_pro: true })
          .eq('id', userId)
        
        if (error) {
          console.error('Failed to update pro status:', error)
          return NextResponse.json({ success: false, error: 'Failed to update subscription' }, { status: 500 })
        }
      }

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error('Razorpay error:', error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
