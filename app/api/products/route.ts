import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

const CATEGORIES = [
  "TSHIRT","HOODIE","POLO","CAP","MUG","BANNER",
  "VISITING_CARD","FLYER","POSTER","STICKER","NOTEBOOK","OTHER",
] as const;
type Category = typeof CATEGORIES[number];

export const revalidate = 60;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const category = searchParams.get("category") as Category | null;
    const search = searchParams.get("search");
    const featured = searchParams.get("featured");
    const page = parseInt(searchParams.get("page") ?? "1", 10);
    const limit = parseInt(searchParams.get("limit") ?? "12", 10);
    const sort = searchParams.get("sort") ?? "newest";

    const where: Record<string, unknown> = { isActive: true };
    if (category && (CATEGORIES as readonly string[]).includes(category)) {
      where.category = category;
    }
    if (search) {
      where.name = { contains: search, mode: "insensitive" };
    }
    if (featured === "true") {
      where.isFeatured = true;
    }

    let orderBy: Record<string, string> = { createdAt: "desc" };
    if (sort === "price-asc") orderBy = { basePrice: "asc" };
    else if (sort === "price-desc") orderBy = { basePrice: "desc" };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          name: true,
          slug: true,
          category: true,
          basePrice: true,
          images: true,
          mockupImage: true,
          colors: true,
          sizes: true,
          isFeatured: true,
          minQuantity: true,
          bulkPricing: true,
        },
      }),
      prisma.product.count({ where }),
    ]);

    return Response.json({ products, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    console.error("[products GET]", err);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}

const createSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  description: z.string().min(10),
  category: z.enum(CATEGORIES),
  basePrice: z.number().positive(),
  images: z.array(z.string()).min(1),
  mockupImage: z.string(),
  sizes: z.array(z.string()),
  colors: z.array(z.object({ name: z.string(), hex: z.string() })),
  printAreas: z.array(z.string()),
  minQuantity: z.number().int().positive().optional(),
  bulkPricing: z.array(z.object({ minQty: z.number(), pricePerUnit: z.number() })).optional(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
});

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }
  try {
    const body = await request.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
    }
    const product = await prisma.product.create({ data: parsed.data as Parameters<typeof prisma.product.create>[0]["data"] });
    return Response.json({ product }, { status: 201 });
  } catch (err) {
    console.error("[products POST]", err);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}

