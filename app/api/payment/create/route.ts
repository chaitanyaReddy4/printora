import { NextRequest } from "next/server";
import { razorpay } from "@/lib/razorpay";
import { z } from "zod";

const createSchema = z.object({
  amount: z.number().positive(),
  currency: z.string().default("INR"),
  receipt: z.string().optional(),
});

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Invalid amount" }, { status: 400 });
  }

  // Validate server-side key is configured
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    console.error("[payment/create] Razorpay keys not configured");
    return Response.json({ error: "Payment gateway not configured" }, { status: 500 });
  }

  try {
    const order = await razorpay.orders.create({
      amount: Math.round(parsed.data.amount * 100), // rupees → paise
      currency: parsed.data.currency,
      receipt: parsed.data.receipt ?? `rcpt_${Date.now()}`,
    });

    // keyId is NEXT_PUBLIC_ safe — it's the publishable key, not the secret
    return Response.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error("[payment/create]", err);
    return Response.json({ error: "Failed to create payment order" }, { status: 500 });
  }
}
