import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { generateOrderNumber } from "@/lib/utils";
import { sendOrderConfirmation } from "@/lib/email";
import { z } from "zod";

const orderSchema = z.object({
  items: z.array(z.object({
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
    notes: z.string().optional(),
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
  guestEmail: z.string().email().optional(),
  guestPhone: z.string().optional(),
  promoCode: z.string().optional(),
  notes: z.string().optional(),
  paymentId: z.string().optional(),
  paymentStatus: z.enum(["UNPAID", "PAID"]).optional(),
});

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = (session.user as { id: string }).id;
  const isAdmin = (session.user as { role?: string }).role === "ADMIN";

  const { searchParams } = request.nextUrl;
  const page = parseInt(searchParams.get("page") ?? "1", 10);
  const limit = parseInt(searchParams.get("limit") ?? "10", 10);
  const status = searchParams.get("status");

  const where: Record<string, unknown> = isAdmin ? {} : { userId };
  if (status) where.status = status;

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        items: { include: { product: { select: { name: true, images: true } } } },
        timeline: { orderBy: { createdAt: "asc" } },
      },
    }),
    prisma.order.count({ where }),
  ]);

  return Response.json({ orders, total, page, pages: Math.ceil(total / limit) });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  try {
    const body = await request.json();
    const parsed = orderSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
    }

    const { items, shippingAddress, guestEmail, guestPhone, promoCode, notes, paymentId, paymentStatus } = parsed.data;

    const totalAmount = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
    const orderNumber = generateOrderNumber();
    const userId = session?.user ? (session.user as { id: string }).id : undefined;

    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId,
        guestEmail,
        guestPhone,
        totalAmount,
        shippingAddress,
        promoCode,
        notes,
        paymentId,
        paymentStatus: paymentStatus ?? "UNPAID",
        status: paymentId ? "CONFIRMED" : "PENDING",
        items: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          create: items.map((item) => ({
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
            notes: item.notes,
          })) as any,
        },
        timeline: {
          create: {
            status: paymentId ? "CONFIRMED" : "PENDING",
            message: paymentId ? "Payment received. Order confirmed!" : "Order placed. Awaiting payment.",
          },
        },
      },
      include: {
        items: { include: { product: { select: { name: true, images: true } } } },
      },
    });

    // Send confirmation email
    const email = session?.user?.email ?? guestEmail;
    if (email) {
      await sendOrderConfirmation(email, {
        orderNumber: order.orderNumber,
        customerName: session?.user?.name ?? "Customer",
        items: order.items.map((i: { quantity: number; unitPrice: number; product: { name: string } }) => ({
          name: i.product.name,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
        })),
        totalAmount: order.totalAmount,
        shippingAddress: `${(shippingAddress as { fullName: string }).fullName}, ${(shippingAddress as { city: string }).city}`,
      }).catch(console.error);
    }

    return Response.json({ order }, { status: 201 });
  } catch (err) {
    console.error("[orders POST]", err);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}

