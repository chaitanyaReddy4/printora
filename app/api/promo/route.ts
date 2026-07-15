import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const { code, subtotal } = await request.json();
  if (!code) return Response.json({ error: "No code provided" }, { status: 400 });

  const promo = await prisma.promoCode.findUnique({
    where: { code: code.toUpperCase() },
  });

  if (!promo || !promo.isActive) {
    return Response.json({ error: "Invalid or expired promo code." }, { status: 404 });
  }
  if (promo.expiresAt && new Date() > promo.expiresAt) {
    return Response.json({ error: "This promo code has expired." }, { status: 400 });
  }
  if (promo.maxUses && promo.usedCount >= promo.maxUses) {
    return Response.json({ error: "This promo code has reached its usage limit." }, { status: 400 });
  }
  if (subtotal < promo.minOrderValue) {
    return Response.json({
      error: `Minimum order value ₹${promo.minOrderValue} required for this code.`,
    }, { status: 400 });
  }

  const discount =
    promo.discountType === "PERCENTAGE"
      ? Math.min((subtotal * promo.discountValue) / 100, subtotal)
      : Math.min(promo.discountValue, subtotal);

  return Response.json({ discount: Math.round(discount), code: promo.code });
}

