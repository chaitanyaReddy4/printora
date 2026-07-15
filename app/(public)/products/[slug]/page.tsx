"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Upload, Palette, ChevronDown, ChevronUp, Plus, Minus,
  ShoppingCart, Zap, ArrowRight, Check, Info, MessageCircle,
  RotateCcw, X
} from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { formatPrice, calculateBulkPrice, getWhatsAppUrl } from "@/lib/utils";

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  basePrice: number;
  images: string[];
  mockupImage: string;
  sizes: string[];
  colors: { name: string; hex: string }[];
  printAreas: string[];
  minQuantity: number;
  bulkPricing: { minQty: number; pricePerUnit: number }[] | null;
}

export default function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedColor, setSelectedColor] = useState<{ name: string; hex: string } | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [printSide, setPrintSide] = useState("front");
  const [customText, setCustomText] = useState("");
  const [notes, setNotes] = useState("");
  const [designUrl, setDesignUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [activeImg, setActiveImg] = useState(0);
  const [activeTab, setActiveTab] = useState("overview");
  const [added, setAdded] = useState(false);
  const [designAccordion, setDesignAccordion] = useState(true);
  const [shareDesignLater, setShareDesignLater] = useState(false);

  useEffect(() => {
    fetch(`/api/products/${slug}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.product) {
          setProduct(d.product);
          if (d.product.colors?.[0]) setSelectedColor(d.product.colors[0]);
          if (d.product.sizes?.[0]) setSelectedSize(d.product.sizes[0]);
          setQuantity(d.product.minQuantity ?? 1);
        }
      })
      .finally(() => setLoading(false));
  }, [slug]);

  const unitPrice = product
    ? calculateBulkPrice(product.basePrice, quantity, product.bulkPricing ?? null)
    : 0;
  const total = unitPrice * quantity;

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !product) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "printora/designs");
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.url) setDesignUrl(data.url);
    } finally {
      setUploading(false);
    }
  }

  function handleAddToCart() {
    if (!product) return;
    addItem({
      productId: product.id,
      productName: product.name,
      productSlug: product.slug,
      image: product.images[0] ?? "",
      size: selectedSize || undefined,
      color: selectedColor?.name,
      quantity,
      unitPrice,
      designUrl: designUrl || undefined,
      printSide,
      customText: customText || undefined,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  function handleBuyNow() {
    handleAddToCart();
    router.push("/checkout");
  }

  if (loading) {
    return (
      <div className="section-container py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="skeleton aspect-square rounded-2xl" />
          <div className="space-y-4">
            <div className="skeleton h-6 rounded w-24" />
            <div className="skeleton h-10 rounded w-3/4" />
            <div className="skeleton h-4 rounded w-full" />
            <div className="skeleton h-4 rounded w-2/3" />
            <div className="skeleton h-12 rounded-full w-full mt-8" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="section-container py-20 text-center">
        <div className="text-6xl mb-4">😕</div>
        <h2 className="text-2xl font-bold mb-3" style={{ fontFamily: "var(--font-jakarta)" }}>Product not found</h2>
        <Link href="/products" className="btn-primary">Back to Products</Link>
      </div>
    );
  }

  const hasBulk = product.bulkPricing && product.bulkPricing.length > 0;
  const imgUrl = product.images[activeImg] ?? product.mockupImage;

  return (
    <div className="bg-[#F9FAFB] min-h-screen">
      <div className="section-container py-8">
        {/* Breadcrumb */}
        <nav className="text-sm text-[#6B7280] mb-6 flex items-center gap-2">
          <Link href="/" className="hover:text-[#7C3AED]">Home</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-[#7C3AED]">Products</Link>
          <span>/</span>
          <span className="text-[#111827] font-medium truncate">{product.name}</span>
        </nav>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-12">
          {/* LEFT: Image */}
          <div>
            <div className="card overflow-hidden aspect-square relative mb-3">
              {imgUrl ? (
                <Image src={imgUrl} alt={product.name} fill className="object-cover" sizes="(max-width:1024px) 100vw, 50vw" priority />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-8xl bg-[#EDE9FE]">
                  {product.category === "TSHIRT" ? "👕" : product.category === "MUG" ? "☕" : "🖨️"}
                </div>
              )}
              {/* Print side toggle */}
              <div className="absolute bottom-3 left-3 flex gap-2">
                {["front", "back"].map((side) => (
                  <button
                    key={side}
                    onClick={() => setPrintSide(side)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                      printSide === side ? "bg-[#7C3AED] text-white" : "bg-white/90 text-[#374151] border border-gray-200"
                    }`}
                  >
                    {side.charAt(0).toUpperCase() + side.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                      i === activeImg ? "border-[#7C3AED]" : "border-transparent"
                    }`}
                  >
                    <Image src={img} alt={`${product.name} ${i + 1}`} width={64} height={64} className="object-cover w-full h-full" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: Config */}
          <div className="space-y-5">
            {/* Title & price */}
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-[#111827] mb-2" style={{ fontFamily: "var(--font-jakarta)" }}>
                {product.name}
              </h1>
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-[#7C3AED]">{formatPrice(unitPrice)}</span>
                {quantity > 1 && (
                  <span className="text-sm text-[#6B7280]">per unit · Total: {formatPrice(total)}</span>
                )}
              </div>
              {hasBulk && (
                <p className="text-xs text-green-600 font-medium mt-1">
                  💡 Bulk discounts available — order more, save more!
                </p>
              )}
            </div>

            {/* Color selector */}
            {product.colors.length > 0 && (
              <div>
                <p className="label">Color <span className="font-normal text-[#6B7280]">— {selectedColor?.name}</span></p>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((c) => (
                    <button
                      key={c.hex}
                      onClick={() => setSelectedColor(c)}
                      title={c.name}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        selectedColor?.hex === c.hex ? "border-[#7C3AED] scale-110 shadow-md" : "border-transparent hover:scale-105"
                      }`}
                      style={{ background: c.hex, outline: selectedColor?.hex === c.hex ? "2px solid #7C3AED" : "none", outlineOffset: "2px" }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Size selector */}
            {product.sizes.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="label mb-0">Size</p>
                  <button className="text-xs text-[#7C3AED] hover:underline flex items-center gap-1">
                    <Info className="w-3 h-3" /> Size Chart
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-3 py-2 rounded-lg border text-sm font-medium transition-colors min-w-[44px] ${
                        selectedSize === size
                          ? "bg-[#7C3AED] text-white border-[#7C3AED]"
                          : "bg-white text-[#374151] border-[#E5E7EB] hover:border-[#7C3AED] hover:text-[#7C3AED]"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div>
              <p className="label">Quantity {product.minQuantity > 1 && <span className="font-normal text-[#6B7280]">(min {product.minQuantity})</span>}</p>
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-[#E5E7EB] rounded-xl overflow-hidden">
                  <button
                    onClick={() => setQuantity((q) => Math.max(product.minQuantity, q - 1))}
                    className="w-11 h-11 flex items-center justify-center text-[#374151] hover:bg-[#F9FAFB] transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-14 text-center font-semibold text-[#111827]">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="w-11 h-11 flex items-center justify-center text-[#374151] hover:bg-[#F9FAFB] transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                {hasBulk && (
                  <div className="text-xs text-[#6B7280]">
                    {product.bulkPricing!.map((t) => (
                      <span key={t.minQty} className="mr-2">{t.minQty}+: {formatPrice(t.pricePerUnit)}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Design section */}
            <div className="border border-[#E5E7EB] rounded-xl overflow-hidden">
              <button
                onClick={() => setDesignAccordion(!designAccordion)}
                className="w-full flex items-center justify-between p-4 text-left bg-white hover:bg-[#F9FAFB] transition-colors"
              >
                <span className="font-semibold text-[#111827] text-sm flex items-center gap-2">
                  <Palette className="w-4 h-4 text-[#7C3AED]" /> Design Options
                </span>
                {designAccordion ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {designAccordion && (
                <div className="p-4 bg-white border-t border-[#E5E7EB] space-y-4">
                  {/* Upload */}
                  <div>
                    <p className="text-sm font-medium text-[#374151] mb-2">Option A: Upload your design</p>
                    {designUrl ? (
                      <div className="flex items-center gap-3 p-3 bg-[#EDE9FE] rounded-xl">
                        <Check className="w-5 h-5 text-[#7C3AED] flex-shrink-0" />
                        <span className="text-sm text-[#7C3AED] font-medium flex-1 truncate">Design uploaded!</span>
                        <button onClick={() => setDesignUrl("")} className="text-[#6B7280] hover:text-red-500">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex items-center justify-center gap-2 border-2 border-dashed border-[#E5E7EB] rounded-xl p-5 cursor-pointer hover:border-[#7C3AED] hover:bg-[#EDE9FE]/30 transition-colors group">
                        <input type="file" accept=".png,.jpg,.jpeg,.pdf,.ai,.cdr" onChange={handleUpload} className="hidden" />
                        {uploading ? (
                          <div className="flex items-center gap-2 text-[#7C3AED]">
                            <RotateCcw className="w-4 h-4 animate-spin" />
                            <span className="text-sm">Uploading…</span>
                          </div>
                        ) : (
                          <>
                            <Upload className="w-5 h-5 text-[#9CA3AF] group-hover:text-[#7C3AED]" />
                            <div className="text-center">
                              <p className="text-sm text-[#374151] font-medium">Click to upload</p>
                              <p className="text-xs text-[#9CA3AF]">PNG, JPG, PDF, AI, CDR · max 20MB</p>
                            </div>
                          </>
                        )}
                      </label>
                    )}
                  </div>

                  {/* Design tool link */}
                  <div className="flex items-center gap-3 bg-[#EDE9FE] rounded-xl p-3">
                    <Palette className="w-5 h-5 text-[#7C3AED] flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-[#111827]">Option B: Use our design tool</p>
                      <p className="text-xs text-[#6B7280]">Drag & drop canvas with text, clipart & more</p>
                    </div>
                    <Link href={`/products/${slug}/design`} className="btn-primary btn-sm flex-shrink-0">
                      Open <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                  {/* Share later */}
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={shareDesignLater}
                      onChange={(e) => setShareDesignLater(e.target.checked)}
                      className="w-4 h-4 accent-[#7C3AED]"
                    />
                    <span className="text-sm text-[#374151]">I&apos;ll share my design later via WhatsApp</span>
                  </label>
                </div>
              )}
            </div>

            {/* Custom text */}
            <div>
              <label className="label" htmlFor="custom-text">Custom text <span className="font-normal text-[#6B7280]">(optional)</span></label>
              <input
                id="custom-text"
                type="text"
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                placeholder="e.g. Your name or slogan"
                className="input"
                maxLength={100}
              />
            </div>

            {/* Notes */}
            <div>
              <label className="label" htmlFor="product-notes">Special instructions <span className="font-normal text-[#6B7280]">(optional)</span></label>
              <textarea
                id="product-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any special printing instructions…"
                className="input resize-none"
                rows={2}
              />
            </div>

            {/* Price summary */}
            <div className="bg-[#EDE9FE] rounded-xl p-4">
              <div className="flex justify-between text-sm text-[#374151] mb-1">
                <span>{formatPrice(unitPrice)} × {quantity} units</span>
                <span className="font-semibold">{formatPrice(total)}</span>
              </div>
              <div className="flex justify-between text-sm text-[#6B7280]">
                <span>Shipping</span>
                <span>Calculated at checkout</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                id="add-to-cart-btn"
                onClick={handleAddToCart}
                className={`btn-primary flex-1 ${added ? "!bg-green-600" : ""}`}
              >
                {added ? <Check className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
                {added ? "Added!" : "Add to Cart"}
              </button>
              <button
                id="buy-now-btn"
                onClick={handleBuyNow}
                className="btn-dark flex-1"
              >
                <Zap className="w-4 h-4" /> Buy Now
              </button>
            </div>

            {/* WhatsApp */}
            <a
              href={getWhatsAppUrl(`Hi! I want to order ${product.name} — can you help?`)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 text-sm text-[#25D366] hover:underline"
            >
              <MessageCircle className="w-4 h-4 fill-[#25D366]" />
              Need help? Chat on WhatsApp
            </a>
          </div>
        </div>

        {/* Tabs */}
        <div className="card">
          <div className="flex border-b border-[#E5E7EB] overflow-x-auto">
            {["overview", "specifications", "delivery"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-3 text-sm font-medium capitalize flex-shrink-0 border-b-2 transition-colors ${
                  activeTab === tab ? "border-[#7C3AED] text-[#7C3AED]" : "border-transparent text-[#6B7280] hover:text-[#374151]"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="p-6">
            {activeTab === "overview" && (
              <div className="prose-brand max-w-2xl">
                <p>{product.description}</p>
              </div>
            )}
            {activeTab === "specifications" && (
              <div className="space-y-3 text-sm">
                {product.sizes.length > 0 && (
                  <div className="flex gap-4">
                    <span className="font-semibold text-[#374151] w-32">Sizes</span>
                    <span className="text-[#6B7280]">{product.sizes.join(", ")}</span>
                  </div>
                )}
                <div className="flex gap-4">
                  <span className="font-semibold text-[#374151] w-32">Print Areas</span>
                  <span className="text-[#6B7280]">{(product.printAreas as string[]).join(", ")}</span>
                </div>
                <div className="flex gap-4">
                  <span className="font-semibold text-[#374151] w-32">Min. Quantity</span>
                  <span className="text-[#6B7280]">{product.minQuantity}</span>
                </div>
                {hasBulk && (
                  <div className="flex gap-4">
                    <span className="font-semibold text-[#374151] w-32">Bulk Pricing</span>
                    <span className="text-[#6B7280]">
                      {product.bulkPricing!.map((t) => `${t.minQty}+ units: ${formatPrice(t.pricePerUnit)}/pc`).join(" · ")}
                    </span>
                  </div>
                )}
              </div>
            )}
            {activeTab === "delivery" && (
              <div className="space-y-3 text-sm text-[#6B7280]">
                <p>🚀 <strong className="text-[#374151]">Express (48hr):</strong> Available for most products in Vijayawada & nearby cities.</p>
                <p>📦 <strong className="text-[#374151]">Standard:</strong> 4–7 business days for pan-India delivery.</p>
                <p>✅ <strong className="text-[#374151]">Tracking:</strong> Live order tracking via our 7-stage dashboard.</p>
                <p>💬 <strong className="text-[#374151]">Support:</strong> WhatsApp us anytime for delivery updates.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
