import "server-only";
import Razorpay from "razorpay";
import crypto from "crypto";

/**
 * Server-side Razorpay SDK instance.
 * ONLY import this in API routes — never in React components or client code.
 */
export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

/**
 * Create a Razorpay order (server-side only).
 * @param amount - Amount in INR (rupees, NOT paise)
 * @param receipt - Unique receipt identifier
 */
export async function createRazorpayOrder(amount: number, receipt: string) {
  return razorpay.orders.create({
    amount: Math.round(amount * 100), // convert to paise
    currency: "INR",
    receipt,
  });
}

/**
 * Verify Razorpay payment signature (server-side only).
 * Prevents tampered/fake payment responses from being accepted.
 */
export function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  const body = `${orderId}|${paymentId}`;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(body)
    .digest("hex");
  return expectedSignature === signature;
}
