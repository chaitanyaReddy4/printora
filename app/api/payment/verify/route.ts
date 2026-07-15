import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateOrderNumber } from "@/lib/utils";
import { sendOrderConfirmation } from "@/lib/email";
import crypto from "crypto";
import { z } from "zod";

const verifySchema = z.object({
  razorpay_order_id: z.string(),
  razorpay_payment_id: z.string(),
  razorpay_signature: z.string(),
  // Order details to create in DB
  cartItems: z.array(z.object({
    productId: z.string(),
    quantity: z.number().int().positive(),
    size: z.string().optional(),
    color: z.string().optional(),
    designUrl: z.string().optional(),
    previewUrl: z.string().optional(),
    designData: z.record(z.string(), z.unknown()).optional(),
    printSide: z.string().optional(),
    customText: z.string().optional(),
    unitPrice: z.number().positive(),
  })),
  shippingAddress: z.object({
    fullName: z.string(),
    phone: z.string(),
    line1: z.string(),
    line2: z.string().optional(),
    city: z.string(),
    state: z.string(),
    pincode: z.string(),
  }),
  totalAmount: z.number().positive(),
  guestEmail: z.string().email().optional(),
  promoCode: z.string().optional(),
  discountAmount: z.number().optional(),
});

export async function POST(request: NextRequest) {
  const session = await auth();
  const body = await request.json();
  const parsed = verifySchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Invalid payload" }, { status: 400 });
  }

  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    cartItems,
    shippingAddress,
    totalAmount,
    guestEmail,
    promoCode,
    discountAmount,
  } = parsed.data;

  // Verify HMAC-SHA256 signature
  const expectedSig = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (expectedSig !== razorpay_signature) {
    return Response.json({ error: "Payment signature verification failed" }, { status: 400 });
  }

  try {
    const userId = session?.user ? (session.user as { id: string }).id : undefined;
    const orderNumber = generateOrderNumber();

    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId,
        guestEmail,
        totalAmount,
        discountAmount: discountAmount ?? 0,
        shippingAddress,
        promoCode,
        paymentId: razorpay_payment_id,
        paymentStatus: "PAID",
        status: "CONFIRMED",
        items: {
          create: cartItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            size: item.size,
            color: item.color,
            designUrl: item.designUrl,
            previewUrl: item.previewUrl,
            designData: item.designData,
            printSide: item.printSide,
            customText: item.customText,
            unitPrice: item.unitPrice,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          })) as any,
        },
        timeline: {
          create: {
            status: "CONFIRMED",
            message: "Payment received! Your order is confirmed and being processed.",
          },
        },
      },
      include: {
        items: { include: { product: { select: { name: true, images: true } } } },
        user: { select: { name: true, email: true } },
      },
    });

    // Send confirmation email
    const email = order.user?.email ?? guestEmail;
    if (email) {
      await sendOrderConfirmation(email, {
        orderNumber: order.orderNumber,
        customerName: order.user?.name ?? "Customer",
        items: order.items.map((i: { quantity: number; unitPrice: number; product: { name: string } }) => ({
          name: i.product.name,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
        })),
        totalAmount: order.totalAmount,
        shippingAddress: `${(shippingAddress as { fullName: string }).fullName}, ${(shippingAddress as { city: string }).city}`,
      }).catch(console.error);
    }

    return Response.json({ success: true, orderId: order.id, orderNumber: order.orderNumber });
  } catch (err) {
    console.error("[payment/verify]", err);
    return Response.json({ error: "Failed to create order" }, { status: 500 });
  }
}

