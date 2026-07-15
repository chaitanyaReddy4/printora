"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Plus, X, Loader2, Save, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { slugify } from "@/lib/utils";

const CATEGORIES = [
  "TSHIRT","HOODIE","POLO","CAP","MUG","BANNER",
  "VISITING_CARD","FLYER","POSTER","STICKER","NOTEBOOK","OTHER",
];

const PRINT_AREAS = ["front","back","left-chest","right-chest","full-wrap","full","sleeve","custom"];

export default function AdminNewProductPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("TSHIRT");
  const [basePrice, setBasePrice] = useState("");
  const [minQuantity, setMinQuantity] = useState("1");
  const [isFeatured, setIsFeatured] = useState(false);
  const [imageUrls, setImageUrls] = useState<string[]>([""]);
  const [sizes, setSizes] = useState("S,M,L,XL,XXL");
  const [selectedPrintAreas, setSelectedPrintAreas] = useState<string[]>(["front"]);
  const [colors, setColors] = useState<{ name: string; hex: string }[]>([
    { name: "White", hex: "#FFFFFF" }, { name: "Black", hex: "#111827" }
  ]);
  const [bulkPricing, setBulkPricing] = useState<{ minQty: string; pricePerUnit: string }[]>([]);
  const [uploading, setUploading] = useState<number | null>(null);

  function autoSlug(n: string) {
    setName(n);
    setSlug(slugify(n));
  }

  async function uploadImage(index: number, file: File) {
    setUploading(index);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "printora/products");
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.url) {
        setImageUrls(prev => prev.map((u, i) => i === index ? data.url : u));
      }
    } finally { setUploading(null); }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !slug || !basePrice) { setError("Name, slug and base price are required."); return; }
    setSaving(true); setError("");
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name, slug, description, category,
          basePrice: parseFloat(basePrice),
          minQuantity: parseInt(minQuantity),
          isFeatured,
          images: imageUrls.filter(Boolean),
          sizes: sizes.split(",").map(s => s.trim()).filter(Boolean),
          colors,
          printAreas: selectedPrintAreas,
          bulkPricing: bulkPricing
            .filter(t => t.minQty && t.pricePerUnit)
            .map(t => ({ minQty: parseInt(t.minQty), pricePerUnit: parseFloat(t.pricePerUnit) })),
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Failed to create product."); return; }
      router.push("/admin/products");
    } catch { setError("Something went wrong."); }
    finally { setSaving(false); }
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/products" className="text-gray-400 hover:text-[#111827] transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-[#111827]" style={{ fontFamily: "var(--font-jakarta)" }}>
          Add New Product
        </h1>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-6 text-sm">{error}</div>}

      <form onSubmit={handleSave}>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left: main info */}
          <div className="xl:col-span-2 space-y-5">
            <div className="card p-6 space-y-4">
              <h2 className="font-bold text-[#111827]" style={{ fontFamily: "var(--font-jakarta)" }}>Basic Information</h2>
              <div>
                <label className="label" htmlFor="p-name">Product Name *</label>
                <input id="p-name" type="text" value={name} onChange={e => autoSlug(e.target.value)} className="input" required />
              </div>
              <div>
                <label className="label" htmlFor="p-slug">Slug (URL) *</label>
                <input id="p-slug" type="text" value={slug} onChange={e => setSlug(e.target.value)} className="input font-mono" required />
              </div>
              <div>
                <label className="label" htmlFor="p-desc">Description</label>
                <textarea id="p-desc" value={description} onChange={e => setDescription(e.target.value)} className="input resize-none" rows={4} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label" htmlFor="p-cat">Category *</label>
                  <select id="p-cat" value={category} onChange={e => setCategory(e.target.value)} className="input">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c.replace(/_/g, " ")}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label" htmlFor="p-price">Base Price (₹) *</label>
                  <input id="p-price" type="number" value={basePrice} onChange={e => setBasePrice(e.target.value)} className="input" step="0.01" min="0" required />
                </div>
                <div>
                  <label className="label" htmlFor="p-minqty">Min Quantity</label>
                  <input id="p-minqty" type="number" value={minQuantity} onChange={e => setMinQuantity(e.target.value)} className="input" min="1" />
                </div>
                <div>
                  <label className="label" htmlFor="p-sizes">Sizes (comma-separated)</label>
                  <input id="p-sizes" type="text" value={sizes} onChange={e => setSizes(e.target.value)} className="input" placeholder="S,M,L,XL" />
                </div>
              </div>
            </div>

            {/* Images */}
            <div className="card p-6 space-y-4">
              <h2 className="font-bold text-[#111827]" style={{ fontFamily: "var(--font-jakarta)" }}>Product Images</h2>
              {imageUrls.map((url, i) => (
                <div key={i} className="flex gap-2">
                  {url ? (
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-[#E5E7EB] flex-shrink-0">
                      <img src={url} alt="" className="w-full h-full object-cover" />
                    </div>
                  ) : null}
                  <div className="flex-1">
                    <input
                      type="text" value={url}
                      onChange={e => setImageUrls(prev => prev.map((u, j) => j === i ? e.target.value : u))}
                      className="input text-sm mb-1" placeholder="Image URL or upload below"
                    />
                    <label className="text-xs text-[#7C3AED] hover:underline cursor-pointer">
                      <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && uploadImage(i, e.target.files[0])} />
                      {uploading === i ? "Uploading…" : "Upload image"}
                    </label>
                  </div>
                  <button type="button" onClick={() => setImageUrls(prev => prev.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-600 flex-shrink-0">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button type="button" onClick={() => setImageUrls(prev => [...prev, ""])} className="btn-ghost btn-sm">
                <Plus className="w-4 h-4" /> Add Image
              </button>
            </div>

            {/* Bulk pricing */}
            <div className="card p-6 space-y-4">
              <h2 className="font-bold text-[#111827]" style={{ fontFamily: "var(--font-jakarta)" }}>Bulk Pricing Tiers</h2>
              {bulkPricing.map((tier, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <div className="flex-1">
                    <input type="number" value={tier.minQty} onChange={e => setBulkPricing(p => p.map((t, j) => j === i ? { ...t, minQty: e.target.value } : t))} className="input text-sm" placeholder="Min qty" />
                  </div>
                  <span className="text-[#6B7280] text-sm flex-shrink-0">+ units at ₹</span>
                  <div className="flex-1">
                    <input type="number" value={tier.pricePerUnit} onChange={e => setBulkPricing(p => p.map((t, j) => j === i ? { ...t, pricePerUnit: e.target.value } : t))} className="input text-sm" placeholder="Price/unit" step="0.01" />
                  </div>
                  <button type="button" onClick={() => setBulkPricing(p => p.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-600 flex-shrink-0">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button type="button" onClick={() => setBulkPricing(p => [...p, { minQty: "", pricePerUnit: "" }])} className="btn-ghost btn-sm">
                <Plus className="w-4 h-4" /> Add Tier
              </button>
            </div>
          </div>

          {/* Right: options */}
          <div className="space-y-5">
            {/* Colors */}
            <div className="card p-5 space-y-3">
              <h2 className="font-bold text-[#111827] text-sm" style={{ fontFamily: "var(--font-jakarta)" }}>Colors</h2>
              {colors.map((c, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input type="color" value={c.hex} onChange={e => setColors(p => p.map((col, j) => j === i ? { ...col, hex: e.target.value } : col))} className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent" />
                  <input type="text" value={c.name} onChange={e => setColors(p => p.map((col, j) => j === i ? { ...col, name: e.target.value } : col))} className="input text-sm flex-1" placeholder="Color name" />
                  <button type="button" onClick={() => setColors(p => p.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-600">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              <button type="button" onClick={() => setColors(p => [...p, { name: "", hex: "#000000" }])} className="btn-ghost btn-sm w-full">
                <Plus className="w-4 h-4" /> Add Color
              </button>
            </div>

            {/* Print areas */}
            <div className="card p-5 space-y-3">
              <h2 className="font-bold text-[#111827] text-sm" style={{ fontFamily: "var(--font-jakarta)" }}>Print Areas</h2>
              <div className="grid grid-cols-2 gap-2">
                {PRINT_AREAS.map(area => (
                  <label key={area} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={selectedPrintAreas.includes(area)} onChange={e => setSelectedPrintAreas(p => e.target.checked ? [...p, area] : p.filter(a => a !== area))} className="w-4 h-4 accent-[#7C3AED]" />
                    <span className="text-sm text-[#374151] capitalize">{area.replace(/-/g, " ")}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Visibility */}
            <div className="card p-5 space-y-3">
              <h2 className="font-bold text-[#111827] text-sm" style={{ fontFamily: "var(--font-jakarta)" }}>Visibility</h2>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={isFeatured} onChange={e => setIsFeatured(e.target.checked)} className="w-4 h-4 accent-[#7C3AED]" />
                <div>
                  <p className="text-sm font-medium text-[#111827]">Featured Product</p>
                  <p className="text-xs text-[#6B7280]">Show on homepage and top of catalog</p>
                </div>
              </label>
            </div>

            <button id="save-product-btn" type="submit" disabled={saving} className="btn-primary w-full">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? "Saving…" : "Save Product"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
