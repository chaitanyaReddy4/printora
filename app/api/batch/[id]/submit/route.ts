import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { cloudinary } from "@/lib/cloudinary";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const batch = await prisma.batchOrder.findUnique({
    where: { batchCode: id },
    include: {
      submissions: { orderBy: { submittedAt: "asc" } },
      organizer: { select: { name: true } },
    },
  });
  if (!batch) return Response.json({ error: "Batch not found" }, { status: 404 });
  return Response.json({ batch });
}

const submitSchema = z.object({
  name: z.string().min(1).max(80),
  rollNumber: z.string().optional(),
  photoUrl: z.string().url(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const batch = await prisma.batchOrder.findUnique({ where: { batchCode: id } });
  if (!batch) return Response.json({ error: "Batch not found" }, { status: 404 });

  if (batch.status !== "COLLECTING") {
    return Response.json({ error: "Submissions are closed for this batch" }, { status: 400 });
  }

  if (new Date() > batch.deadline) {
    return Response.json({ error: "Submission deadline has passed" }, { status: 400 });
  }

  const body = await request.json();
  const parsed = submitSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  }

  const submission = await prisma.batchSubmission.create({
    data: {
      batchId: batch.id,
      name: parsed.data.name,
      rollNumber: parsed.data.rollNumber,
      photoUrl: parsed.data.photoUrl,
    },
  });

  return Response.json({ submission }, { status: 201 });
}
