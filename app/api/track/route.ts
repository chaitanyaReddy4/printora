import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const orderNumber = searchParams.get("orderNumber");
  const email = searchParams.get("email");
  const session = await auth();

  if (!orderNumber) {
    return Response.json({ error: "Order number required" }, { status: 400 });
  }

  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: {
      items: { include: { product: { select: { name: true, images: true } } } },
      timeline: { orderBy: { createdAt: "asc" } },
      user: { select: { email: true, name: true } },
    },
  });

  if (!order) return Response.json({ error: "Order not found" }, { status: 404 });

  // Auth check: owner, guest email match, or admin
  const userId = session?.user ? (session.user as { id: string }).id : null;
  const isAdmin = (session?.user as { role?: string } | undefined)?.role === "ADMIN";
  const isOwner = order.userId && order.userId === userId;
  const isGuestMatch = email && (order.guestEmail === email || order.user?.email === email);

  if (!isAdmin && !isOwner && !isGuestMatch) {
    return Response.json({ error: "Not authorized to view this order" }, { status: 403 });
  }

  return Response.json({ order });
}

