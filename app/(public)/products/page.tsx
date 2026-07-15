"use client";

import { Suspense, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Search, Filter, ChevronDown, X, SlidersHorizontal, ArrowRight, Loader2
} from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface Product {
  id: string;
  name: string;
  slug: string;
  category: string;
  basePrice: number;
  images: string[];
  colors: { name: string; hex: string }[];
  isFeatured: boolean;
}

const CATEGORIES = [
  { value: "TSHIRT", label: "T-Shirts" },
  { value: "HOODIE", label: "Hoodies" },
  { value: "POLO", label: "Polo Shirts" },
  { value: "CAP", label: "Caps" },
  { value: "MUG", label: "Mugs" },
  { value: "BANNER", label: "Banners" },
  { value: "VISITING_CARD", label: "Visiting Cards" },
  { value: "FLYER", label: "Flyers" },
  { value: "POSTER", label: "Posters" },
  { value: "STICKER", label: "Stickers" },
  { value: "NOTEBOOK", label: "Notebooks" },
  { value: "OTHER", label: "Other" },
];

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
];

function ProductCardSkeleton() {
  return (
    <div className="card overflow-hidden">
      <div className="skeleton aspect-square" />
      <div className="p-4 space-y-2">
        <div className="skeleton h-4 rounded w-16" />
        <div className="skeleton h-5 rounded w-3/4" />
        <div className="skeleton h-4 rounded w-1/3" />
      </div>
    </div>
  );
}

function ProductCard({ product }: { product: Product }) {
  const [hovered, setHovered] = useState(false);
  const colors = product.colors as { name: string; hex: string }[];
  const imageUrl = product.images[0] ?? null;

  return (
    <div
      className="product-card group"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image */}
      <div className="relative aspect-square bg-[#F9FAFB] overflow-hidden">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl">
            {product.category === "TSHIRT" ? "👕"
              : product.category === "MUG" ? "☕"
              : product.category === "VISITING_CARD" ? "📇"
              : product.category === "BANNER" ? "🎌"
              : product.category === "STICKER" ? "🏷️"
              : "🖨️"}
          </div>
        )}
        {product.isFeatured && (
          <div className="absolute top-3 left-3">
            <span className="badge badge-gold text-xs">Featured</span>
          </div>
        )}
        {/* Hover overlay */}
        <div className={`absolute inset-0 bg-black/40 flex items-end p-4 transition-opacity duration-200 ${hovered ? "opacity-100" : "opacity-0"}`}>
          <Link
            href={`/products/${product.slug}`}
            className="btn-primary w-full text-center btn-sm"
          >
            Customize Now <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <span className="badge badge-primary text-xs mb-2">
          {CATEGORIES.find((c) => c.value === product.category)?.label ?? product.category}
        </span>
        <h3 className="font-semibold text-[#111827] text-sm mb-1 line-clamp-1" style={{ fontFamily: "var(--font-jakarta)" }}>
          {product.name}
        </h3>
        <p className="text-[#7C3AED] font-bold text-sm">from {formatPrice(product.basePrice)}</p>

        {/* Color swatches */}
        {colors.length > 0 && (
          <div className="flex gap-1 mt-2 flex-wrap">
            {colors.slice(0, 5).map((c) => (
              <div
                key={c.hex}
                className="w-4 h-4 rounded-full border border-gray-200 cursor-pointer hover:scale-110 transition-transform"
                style={{ background: c.hex }}
                title={c.name}
              />
            ))}
            {colors.length > 5 && (
              <div className="w-4 h-4 rounded-full bg-gray-200 flex items-center justify-center text-[8px] text-gray-600 font-bold">
                +{colors.length - 5}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ProductsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const category = searchParams.get("category") ?? "";
  const search = searchParams.get("search") ?? "";
  const sort = searchParams.get("sort") ?? "newest";
  const page = parseInt(searchParams.get("page") ?? "1", 10);

  const [selectedCategories, setSelectedCategories] = useState<string[]>(category ? [category] : []);
  const [searchInput, setSearchInput] = useState(search);
  const [sortValue, setSortValue] = useState(sort);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategories.length === 1) params.set("category", selectedCategories[0]);
      if (searchInput) params.set("search", searchInput);
      params.set("sort", sortValue);
      params.set("page", page.toString());
      params.set("limit", "12");

      const res = await fetch(`/api/products?${params}`);
      const data = await res.json();
      setProducts(data.products ?? []);
      setTotal(data.total ?? 0);
      setPages(data.pages ?? 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [selectedCategories, searchInput, sortValue, page]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  function updateUrl(overrides: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(overrides).forEach(([k, v]) => {
      if (v) params.set(k, v); else params.delete(k);
    });
    params.delete("page");
    router.push(`/products?${params}`);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    updateUrl({ search: searchInput });
  }

  function toggleCategory(cat: string) {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  }

  function clearFilters() {
    setSelectedCategories([]);
    setSearchInput("");
    setSortValue("newest");
    router.push("/products");
  }

  const hasFilters = selectedCategories.length > 0 || searchInput || sortValue !== "newest";

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      {/* Header */}
      <div className="bg-[#111827] py-12">
        <div className="section-container">
          <nav className="text-sm text-gray-400 mb-4">
            <Link href="/" className="hover:text-white">Home</Link>
            <span className="mx-2">/</span>
            <span className="text-white">Products</span>
          </nav>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3" style={{ fontFamily: "var(--font-jakarta)" }}>
            All Products
          </h1>
          <p className="text-gray-400">
            {total > 0 ? `${total} products available` : "Browse our collection"}
          </p>
        </div>
      </div>

      <div className="section-container py-8">
        {/* Top bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search products…"
              className="input pl-10 pr-4"
            />
          </form>

          {/* Sort */}
          <div className="relative">
            <select
              value={sortValue}
              onChange={(e) => { setSortValue(e.target.value); updateUrl({ sort: e.target.value }); }}
              className="input pr-8 appearance-none cursor-pointer min-w-[160px]"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          {/* Filter toggle (mobile) */}
          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            className="btn-ghost flex items-center gap-2 sm:hidden"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            {hasFilters && <span className="w-5 h-5 bg-[#7C3AED] text-white text-xs rounded-full flex items-center justify-center">{selectedCategories.length || 1}</span>}
          </button>
        </div>

        <div className="flex gap-6">
          {/* Sidebar (desktop) */}
          <aside className="hidden sm:block w-56 flex-shrink-0">
            <div className="card p-5 sticky top-20">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-[#111827] text-sm" style={{ fontFamily: "var(--font-jakarta)" }}>Filters</h3>
                {hasFilters && (
                  <button onClick={clearFilters} className="text-xs text-[#7C3AED] hover:underline flex items-center gap-1">
                    <X className="w-3 h-3" /> Clear
                  </button>
                )}
              </div>

              <div>
                <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-3">Category</p>
                <div className="space-y-2">
                  {CATEGORIES.map((cat) => (
                    <label key={cat.value} className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(cat.value)}
                        onChange={() => toggleCategory(cat.value)}
                        className="w-4 h-4 accent-[#7C3AED]"
                      />
                      <span className="text-sm text-[#374151] group-hover:text-[#7C3AED] transition-colors">
                        {cat.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {hasFilters && (
                <button
                  onClick={fetchProducts}
                  className="btn-primary w-full mt-4 btn-sm"
                >
                  Apply Filters
                </button>
              )}
            </div>
          </aside>

          {/* Mobile filter drawer */}
          {filtersOpen && (
            <>
              <div className="fixed inset-0 bg-black/50 z-40 sm:hidden" onClick={() => setFiltersOpen(false)} />
              <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl z-50 sm:hidden p-6 max-h-[70vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-[#111827]">Filters</h3>
                  <button onClick={() => setFiltersOpen(false)}><X className="w-5 h-5" /></button>
                </div>
                <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-3">Category</p>
                <div className="grid grid-cols-2 gap-2">
                  {CATEGORIES.map((cat) => (
                    <label key={cat.value} className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-[#F9FAFB]">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(cat.value)}
                        onChange={() => toggleCategory(cat.value)}
                        className="w-4 h-4 accent-[#7C3AED]"
                      />
                      <span className="text-sm">{cat.label}</span>
                    </label>
                  ))}
                </div>
                <div className="flex gap-3 mt-4">
                  <button onClick={clearFilters} className="btn-ghost flex-1 btn-sm">Clear</button>
                  <button onClick={() => { fetchProducts(); setFiltersOpen(false); }} className="btn-primary flex-1 btn-sm">Apply</button>
                </div>
              </div>
            </>
          )}

          {/* Product grid */}
          <div className="flex-1">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {Array.from({ length: 9 }).map((_, i) => <ProductCardSkeleton key={i} />)}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-bold text-[#111827] mb-2" style={{ fontFamily: "var(--font-jakarta)" }}>No products found</h3>
                <p className="text-[#6B7280] mb-6">Try adjusting your filters or search terms.</p>
                <button onClick={clearFilters} className="btn-primary">Clear Filters</button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {products.map((p) => <ProductCard key={p.id} product={p} />)}
                </div>

                {/* Pagination */}
                {pages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                      <button
                        key={p}
                        onClick={() => updateUrl({ page: p.toString() })}
                        className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                          p === page
                            ? "bg-[#7C3AED] text-white"
                            : "bg-white border border-[#E5E7EB] text-[#374151] hover:border-[#7C3AED] hover:text-[#7C3AED]"
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-[#7C3AED] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#6B7280]">Loading products…</p>
        </div>
      </div>
    }>
      <ProductsContent />
    </Suspense>
  );
}
