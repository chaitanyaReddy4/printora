"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { formatPrice, formatDateTime } from "@/lib/utils";
import { Package, ExternalLink, Search, ChevronRight } from "lucide-react";

interface Order {
  id: string; orderNumber: string; status: string;
  totalAmount: number; createdAt: string;
  items: { id: string; product: { name: string; images: string[] }; quantity: number }[];
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: "badge-amber", CONFIRMED: "badge-blue", DESIGN_REVIEW: "badge-purple",
  IN_PRODUCTION: "badge-purple", QUALITY_CHECK: "badge-teal",
  DISPATCHED: "badge-teal", DELIVERED: "badge-green", CANCELLED: "badge-red",
};

export default function DashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/orders?limit=50")
      .then((r) => r.json())
      .then((d) => setOrders(d.orders ?? []))
      .finally(() => setLoading(false));
  }, []);

  const filtered = orders.filter(
    (o) => o.orderNumber.includes(search.toUpperCase()) ||
      o.items.some((i) => i.product.name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#111827]" style={{ fontFamily: "var(--font-jakarta)" }}>
          My Orders
        </h1>
        <Link href="/track" className="btn-ghost btn-sm">
          Track by number
        </Link>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
        <input
          type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search orders…" className="input pl-10"
        />
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card p-5">
              <div className="skeleton h-5 rounded w-40 mb-3" />
              <div className="skeleton h-4 rounded w-60" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <Package className="w-14 h-14 text-[#E5E7EB] mx-auto mb-4" />
          <h3 className="font-bold text-[#111827] mb-2" style={{ fontFamily: "var(--font-jakarta)" }}>
            {search ? "No matching orders" : "No orders yet"}
          </h3>
          <p className="text-[#6B7280] text-sm mb-5">
            {search ? "Try a different search term" : "Place your first custom print order!"}
          </p>
          {!search && <Link href="/products" className="btn-primary btn-sm">Browse Products</Link>}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((order) => (
            <Link
              key={order.id}
              href={`/dashboard/orders/${order.id}`}
              className="card p-5 flex items-center gap-4 hover:border-[#7C3AED]/30 hover:shadow-md transition-all group"
            >
              {/* Icon */}
              <div className="w-12 h-12 bg-[#EDE9FE] rounded-xl flex items-center justify-center flex-shrink-0">
                <Package className="w-6 h-6 text-[#7C3AED]" />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="font-mono font-bold text-[#7C3AED] text-sm">#{order.orderNumber}</span>
                  <span className={`badge text-xs ${STATUS_COLORS[order.status] ?? "badge-gray"}`}>
                    {order.status.replace(/_/g, " ")}
                  </span>
                </div>
                <p className="text-sm text-[#374151] truncate">
                  {order.items.map((i) => `${i.product.name} ×${i.quantity}`).join(", ")}
                </p>
                <p className="text-xs text-[#9CA3AF] mt-0.5">{formatDateTime(order.createdAt)}</p>
              </div>

              {/* Amount + arrow */}
              <div className="text-right flex-shrink-0">
                <p className="font-bold text-[#111827]">{formatPrice(order.totalAmount)}</p>
                <ChevronRight className="w-4 h-4 text-[#9CA3AF] ml-auto mt-1 group-hover:text-[#7C3AED] transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
