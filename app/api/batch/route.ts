import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { generateBatchCode } from "@/lib/utils";
import { z } from "zod";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as { id: string }).id;
  const isAdmin = (session.user as { role?: string }).role === "ADMIN";

  const where = isAdmin ? {} : { userId };
  const batches = await prisma.batchOrder.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { submissions: true } },
      organizer: { select: { name: true, email: true } },
    },
  });
  return Response.json({ batches });
}

const createSchema = z.object({
  title: z.string().min(3).max(120),
  description: z.string().optional(),
  productType: z.string(),
  expectedCount: z.number().int().positive(),
  deadline: z.string(),
  organizerName: z.string().optional(),
  organizerEmail: z.string().email().optional(),
  organizerPhone: z.string().optional(),
  layoutId: z.string().optional(),
});

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as { id: string }).id;

  const body = await request.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  }

  const { title, description, productType, expectedCount, deadline, layoutId } = parsed.data;

  // Generate unique batch code
  let batchCode = generateBatchCode();
  let exists = await prisma.batchOrder.findUnique({ where: { batchCode } });
  while (exists) {
    batchCode = generateBatchCode();
    exists = await prisma.batchOrder.findUnique({ where: { batchCode } });
  }

  const batch = await prisma.batchOrder.create({
    data: {
      batchCode,
      title,
      description,
      productType,
      expectedCount,
      deadline: new Date(deadline),
      layoutId: layoutId ?? "grid-4x4",
      userId,
    },
  });

  return Response.json({ batch }, { status: 201 });
}

