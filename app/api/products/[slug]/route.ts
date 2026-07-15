import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug, isActive: true },
  });
  if (!product) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json({ product });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await auth();
  if ((session?.user as { role?: string } | undefined)?.role !== "ADMIN") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }
  const { slug } = await params;
  const body = await request.json();
  const product = await prisma.product.update({
    where: { slug },
    data: body,
  });
  return Response.json({ product });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await auth();
  if ((session?.user as { role?: string } | undefined)?.role !== "ADMIN") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }
  const { slug } = await params;
  await prisma.product.update({ where: { slug }, data: { isActive: false } });
  return Response.json({ success: true });
}
