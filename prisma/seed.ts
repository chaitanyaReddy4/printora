import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import { readFileSync } from "fs";
import { resolve } from "path";

// Load .env.local (tsx doesn't auto-load it)
try {
  const envPath = resolve(process.cwd(), ".env.local");
  const content = readFileSync(envPath, "utf-8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim().replace(/^"|"$/g, "");
    if (!process.env[key]) process.env[key] = val;
  }
} catch { /* rely on actual environment */ }

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding Printora database…");

  // ── Admin user ────────────────────────────────────────────────────────────
  const adminPassword = await bcrypt.hash("admin@printora123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@printora.in" },
    update: {},
    create: {
      name: "Printora Admin",
      email: "admin@printora.in",
      passwordHash: adminPassword,
      role: "ADMIN",
      phone: "+919876543210",
    },
  });
  console.log("✅ Admin user:", admin.email);

  // ── Demo user ──────────────────────────────────────────────────────────────
  const demoPassword = await bcrypt.hash("demo123456", 12);
  const demoUser = await prisma.user.upsert({
    where: { email: "demo@printora.in" },
    update: {},
    create: {
      name: "Demo Customer",
      email: "demo@printora.in",
      passwordHash: demoPassword,
      role: "CUSTOMER",
    },
  });
  console.log("✅ Demo user:", demoUser.email);

  // ── Products ───────────────────────────────────────────────────────────────
  const products = [
    {
      name: "Classic Round-Neck T-Shirt",
      slug: "classic-round-neck-tshirt",
      description: "Premium 180GSM bio-washed cotton round neck tee. Ideal for custom prints — text, logo, photo. Available in 15+ colours.",
      category: "TSHIRT",
      basePrice: 249,
      minQuantity: 1,
      sizes: ["XS", "S", "M", "L", "XL", "XXL", "3XL"],
      colors: [
        { name: "White", hex: "#FFFFFF" }, { name: "Black", hex: "#111827" },
        { name: "Navy Blue", hex: "#1E3A5F" }, { name: "Royal Blue", hex: "#2563EB" },
        { name: "Red", hex: "#DC2626" }, { name: "Forest Green", hex: "#166534" },
        { name: "Maroon", hex: "#7F1D1D" }, { name: "Grey", hex: "#6B7280" },
      ],
      printAreas: ["front", "back"],
      bulkPricing: [
        { minQty: 10, pricePerUnit: 229 }, { minQty: 25, pricePerUnit: 199 },
        { minQty: 50, pricePerUnit: 179 }, { minQty: 100, pricePerUnit: 159 },
      ],
      isFeatured: true,
      images: [],
    },
    {
      name: "Premium Hoodie",
      slug: "premium-hoodie",
      description: "320GSM fleece hoodie with double-stitched seams. Perfect for college merchandise, corporate gifting, and sports teams.",
      category: "HOODIE",
      basePrice: 699,
      minQuantity: 1,
      sizes: ["S", "M", "L", "XL", "XXL"],
      colors: [
        { name: "Black", hex: "#111827" }, { name: "Grey", hex: "#6B7280" },
        { name: "Navy Blue", hex: "#1E3A5F" }, { name: "Maroon", hex: "#7F1D1D" },
      ],
      printAreas: ["front", "back"],
      bulkPricing: [
        { minQty: 10, pricePerUnit: 649 }, { minQty: 25, pricePerUnit: 599 },
        { minQty: 50, pricePerUnit: 549 },
      ],
      isFeatured: true,
      images: [],
    },
    {
      name: "Polo T-Shirt",
      slug: "polo-tshirt",
      description: "Corporate-grade pique cotton polo with custom embroidery or print. Available with collar in matching or contrasting colours.",
      category: "POLO",
      basePrice: 399,
      minQuantity: 1,
      sizes: ["S", "M", "L", "XL", "XXL"],
      colors: [
        { name: "White", hex: "#FFFFFF" }, { name: "Black", hex: "#111827" },
        { name: "Navy Blue", hex: "#1E3A5F" }, { name: "Sky Blue", hex: "#38BDF8" },
      ],
      printAreas: ["front", "left-chest"],
      bulkPricing: [
        { minQty: 10, pricePerUnit: 369 }, { minQty: 25, pricePerUnit: 339 },
        { minQty: 50, pricePerUnit: 299 },
      ],
      isFeatured: false,
      images: [],
    },
    {
      name: "Customised Coffee Mug",
      slug: "customised-coffee-mug",
      description: "High-quality ceramic 330ml coffee mug with permanent sublimation print. Microwave and dishwasher safe.",
      category: "MUG",
      basePrice: 199,
      minQuantity: 1,
      sizes: ["330ml"],
      colors: [
        { name: "White", hex: "#FFFFFF" }, { name: "Black", hex: "#111827" },
        { name: "Magic (Colour Change)", hex: "#6B7280" },
      ],
      printAreas: ["full-wrap"],
      bulkPricing: [
        { minQty: 12, pricePerUnit: 179 }, { minQty: 24, pricePerUnit: 159 },
        { minQty: 50, pricePerUnit: 139 },
      ],
      isFeatured: true,
      images: [],
    },
    {
      name: "Premium Visiting Cards",
      slug: "premium-visiting-cards",
      description: "300GSM matte/gloss laminated visiting cards. Spot UV, foil, rounded corners available. Delivered in 2 days.",
      category: "VISITING_CARD",
      basePrice: 499,
      minQuantity: 100,
      sizes: ["Standard 3.5×2 in", "Square 2.5×2.5 in"],
      colors: [],
      printAreas: ["front", "back"],
      bulkPricing: [
        { minQty: 250, pricePerUnit: 1.8 }, { minQty: 500, pricePerUnit: 1.5 },
        { minQty: 1000, pricePerUnit: 1.2 },
      ],
      isFeatured: true,
      images: [],
    },
    {
      name: "Vinyl Banner",
      slug: "vinyl-banner",
      description: "Durable 440GSM flex vinyl banner with hemming and grommets. UV-resistant inks. Custom size available.",
      category: "BANNER",
      basePrice: 299,
      minQuantity: 1,
      sizes: ["2×3 ft", "3×5 ft", "4×6 ft", "5×8 ft", "Custom"],
      colors: [],
      printAreas: ["front"],
      bulkPricing: [],
      isFeatured: false,
      images: [],
    },
    {
      name: "A4 Flyer / Pamphlet",
      slug: "a4-flyer",
      description: "130GSM glossy or matte single/double-sided flyers. Same-day printing available for urgent orders.",
      category: "FLYER",
      basePrice: 3,
      minQuantity: 100,
      sizes: ["A4", "A5", "DL"],
      colors: [],
      printAreas: ["front", "back"],
      bulkPricing: [
        { minQty: 250, pricePerUnit: 2.5 }, { minQty: 500, pricePerUnit: 2 },
        { minQty: 1000, pricePerUnit: 1.5 },
      ],
      isFeatured: false,
      images: [],
    },
    {
      name: "Customised Notebook",
      slug: "customised-notebook",
      description: "A5 hardcover notebook with custom cover printing. 200 pages, ruled/plain/dotted. Perfect for corporate gifts.",
      category: "NOTEBOOK",
      basePrice: 349,
      minQuantity: 1,
      sizes: ["A5", "A4"],
      colors: [
        { name: "Black", hex: "#111827" }, { name: "Navy Blue", hex: "#1E3A5F" },
        { name: "Maroon", hex: "#7F1D1D" }, { name: "Custom", hex: "#7C3AED" },
      ],
      printAreas: ["front-cover", "back-cover"],
      bulkPricing: [
        { minQty: 25, pricePerUnit: 299 }, { minQty: 50, pricePerUnit: 259 },
        { minQty: 100, pricePerUnit: 229 },
      ],
      isFeatured: false,
      images: [],
    },
    {
      name: "Custom Sticker Pack",
      slug: "custom-sticker-pack",
      description: "Waterproof vinyl stickers with permanent adhesive. Die-cut to any shape. Great for branding, packaging, and events.",
      category: "STICKER",
      basePrice: 49,
      minQuantity: 10,
      sizes: ["3×3 cm", "5×5 cm", "7×7 cm", "10×10 cm", "Custom"],
      colors: [],
      printAreas: ["full"],
      bulkPricing: [
        { minQty: 50, pricePerUnit: 39 }, { minQty: 100, pricePerUnit: 29 },
        { minQty: 500, pricePerUnit: 19 },
      ],
      isFeatured: false,
      images: [],
    },
    {
      name: "Structured Cap / Hat",
      slug: "structured-cap",
      description: "6-panel adjustable baseball cap with embroidery or sublimation print. One-size-fits-all adjustable strap.",
      category: "CAP",
      basePrice: 299,
      minQuantity: 1,
      sizes: ["One Size"],
      colors: [
        { name: "Black", hex: "#111827" }, { name: "White", hex: "#FFFFFF" },
        { name: "Navy Blue", hex: "#1E3A5F" }, { name: "Maroon", hex: "#7F1D1D" },
        { name: "Grey", hex: "#6B7280" },
      ],
      printAreas: ["front", "side"],
      bulkPricing: [
        { minQty: 12, pricePerUnit: 269 }, { minQty: 25, pricePerUnit: 249 },
        { minQty: 50, pricePerUnit: 219 },
      ],
      isFeatured: false,
      images: [],
    },
  ];

  for (const p of products) {
    const { bulkPricing, ...rest } = p;
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      create: {
        ...rest,
        mockupImage: (rest as any).mockupImage ?? "",
        bulkPricing,
        isActive: true,
      } as any,
    });
    console.log("✅ Product:", p.name);
  }

  const promoCodes = [
    { code: "WELCOME10", discountType: "PERCENTAGE" as const, discountValue: 10, minOrderValue: 199, maxUses: 500, isActive: true, expiresAt: new Date("2026-12-31") },
    { code: "BULK50",    discountType: "FLAT"       as const, discountValue: 50, minOrderValue: 999, maxUses: 200, isActive: true, expiresAt: new Date("2026-12-31") },
    { code: "STUDENT15", discountType: "PERCENTAGE" as const, discountValue: 15, minOrderValue: 299, maxUses: 300, isActive: true, expiresAt: new Date("2026-12-31") },
    { code: "FREESHIP",  discountType: "FLAT"       as const, discountValue: 99, minOrderValue: 0,   maxUses: 100, isActive: true, expiresAt: new Date("2026-08-31") },
  ];

  for (const promo of promoCodes) {
    await prisma.promoCode.upsert({
      where: { code: promo.code },
      update: {},
      create: promo,
    });
    console.log("✅ Promo:", promo.code);
  }


  console.log("\n🎉 Database seeded successfully!");
  console.log("─────────────────────────────────");
  console.log("Admin login: admin@printora.in / admin@printora123");
  console.log("Demo login:  demo@printora.in / demo123456");
  console.log("─────────────────────────────────");
}

main()
  .catch(e => { console.error("❌ Seed failed:", e); process.exit(1); })
  .finally(() => prisma.$disconnect());
