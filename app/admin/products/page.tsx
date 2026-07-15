"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Edit2, Eye, EyeOff, Search, RefreshCcw } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import Image from "next/image";

interface Product {
  id: string; name: string; slug: string; category: string;
  basePrice: number; images: string[]; isActive: boolean; isFeatured: boolean;
}

const CATEGORY_LABELS: Record<string, string> = {
  TSHIRT:"T-Shirt", HOODIE:"Hoodie", POLO:"Polo", CAP:"Cap", MUG:"Mug",
  BANNER:"Banner", VISITING_CARD:"Visiting Card", FLYER:"Flyer",
  POSTER:"Poster", STICKER:"Sticker", NOTEBOOK:"Notebook", OTHER:"Other",
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [total, setTotal] = useState(0);

  const fetchProducts = async () => {
    setLoading(true);
    const res = await fetch("/api/products?limit=100");
    const data = await res.json();
    setProducts(data.products ?? []);
    setTotal(data.total ?? 0);
    setLoading(false);
  };

  useEffect(() => { fetchProducts(); }, []);

  async function toggleActive(slug: string, current: boolean) {
    await fetch(`/api/products/${slug}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !current }),
    });
    fetchProducts();
  }

  async function toggleFeatured(slug: string, current: boolean) {
    await fetch(`/api/products/${slug}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isFeatured: !current }),
    });
    fetchProducts();
  }

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#111827]" style={{ fontFamily: "var(--font-jakarta)" }}>Products</h1>
          <p className="text-[#6B7280] text-sm mt-0.5">{total} products</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchProducts} className="btn-ghost btn-sm"><RefreshCcw className="w-4 h-4" /></button>
          <Link href="/admin/products/new" className="btn-primary btn-sm">
            <Plus className="w-4 h-4" /> Add Product
          </Link>
        </div>
      </div>

      <div className="relative mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products…" className="input pl-10" />
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
                <th className="text-left px-5 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Product</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Category</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Base Price</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Status</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Featured</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3F4F6]">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>{Array.from({length:6}).map((_,j)=>(<td key={j} className="px-4 py-3"><div className="skeleton h-4 rounded" /></td>))}</tr>
                ))
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-[#9CA3AF]">No products found</td></tr>
              ) : filtered.map(product => (
                <tr key={product.id} className="hover:bg-[#F9FAFB] transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#F9FAFB] border border-[#E5E7EB] overflow-hidden flex-shrink-0 relative">
                        {product.images?.[0]
                          ? <Image src={product.images[0]} alt={product.name} fill className="object-cover" />
                          : <div className="w-full h-full flex items-center justify-center text-lg">🖨️</div>}
                      </div>
                      <div>
                        <p className="font-semibold text-[#111827] text-sm">{product.name}</p>
                        <p className="text-xs text-[#9CA3AF] font-mono">{product.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="badge badge-primary text-xs">{CATEGORY_LABELS[product.category] ?? product.category}</span>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-[#111827] text-sm">{formatPrice(product.basePrice)}</td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => toggleActive(product.slug, product.isActive)}
                      className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full transition-colors ${product.isActive ? "bg-[#D1FAE5] text-green-700 hover:bg-red-50 hover:text-red-600" : "bg-[#FEE2E2] text-red-600 hover:bg-[#D1FAE5] hover:text-green-700"}`}
                    >
                      {product.isActive ? <><Eye className="w-3 h-3" /> Active</> : <><EyeOff className="w-3 h-3" /> Inactive</>}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => toggleFeatured(product.slug, product.isFeatured)}
                      className={`text-xs font-medium px-2.5 py-1 rounded-full transition-colors ${product.isFeatured ? "bg-[#FEF3C7] text-amber-700" : "bg-[#F3F4F6] text-[#6B7280] hover:bg-[#FEF3C7] hover:text-amber-700"}`}
                    >
                      {product.isFeatured ? "★ Featured" : "☆ Feature"}
                    </button>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <Link href={`/admin/products/${product.slug}`} className="text-[#7C3AED] hover:underline text-xs font-medium inline-flex items-center gap-1">
                      <Edit2 className="w-3 h-3" /> Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
