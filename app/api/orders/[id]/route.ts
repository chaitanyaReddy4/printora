import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { sendStatusUpdate } from "@/lib/email";
import { z } from "zod";


export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: { include: { product: true } },
      timeline: { orderBy: { createdAt: "asc" } },
      user: { select: { name: true, email: true, phone: true } },
    },
  });

  if (!order) return Response.json({ error: "Order not found" }, { status: 404 });

  const userId = session?.user ? (session.user as { id: string }).id : null;
  const isAdmin = (session?.user as { role?: string } | undefined)?.role === "ADMIN";
  if (!isAdmin && order.userId !== userId) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  return Response.json({ order });
}

const updateSchema = z.object({
  status: z.enum([
    "PENDING","CONFIRMED","DESIGN_REVIEW","IN_PRODUCTION",
    "QUALITY_CHECK","DISPATCHED","DELIVERED","CANCELLED",
  ]).optional(),
  message: z.string().optional(),
  trackingNumber: z.string().optional(),
  courierName: z.string().optional(),
  estimatedDelivery: z.string().optional(),
  notes: z.string().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  const isAdmin = (session?.user as { role?: string } | undefined)?.role === "ADMIN";
  if (!isAdmin) return Response.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  }

  const { status, message, trackingNumber, courierName, estimatedDelivery, notes } = parsed.data;

  const updateData: Record<string, unknown> = {};
  if (trackingNumber) updateData.trackingNumber = trackingNumber;
  if (courierName) updateData.courierName = courierName;
  if (estimatedDelivery) updateData.estimatedDelivery = new Date(estimatedDelivery);
  if (notes !== undefined) updateData.notes = notes;
  if (status) updateData.status = status;

  const order = await prisma.order.update({
    where: { id },
    data: {
      ...updateData,
      ...(status
        ? {
            timeline: {
              create: {
                status,
                message: message ?? `Order status updated to ${status.replace(/_/g, " ")}`,
              },
            },
          }
        : {}),
    },
    include: {
      user: { select: { email: true, name: true } },
      items: { include: { product: { select: { name: true } } } },
    },
  });

  // Send email notification on status update
  if (status && order.user?.email) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    await sendStatusUpdate(order.user.email, {
      orderNumber: order.orderNumber,
      customerName: order.user.name ?? "Customer",
      status: status.replace(/_/g, " "),
      message: message ?? `Your order is now ${status.replace(/_/g, " ").toLowerCase()}.`,
      trackingUrl: `${appUrl}/track?order=${order.orderNumber}`,
    }).catch(console.error);
  }

  return Response.json({ order });
}
