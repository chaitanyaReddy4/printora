"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { formatPrice, formatDateTime } from "@/lib/utils";
import { Search, Filter, ChevronDown, ExternalLink, RefreshCcw } from "lucide-react";

const ALL_STATUSES = [
  "ALL","PENDING","CONFIRMED","DESIGN_REVIEW","IN_PRODUCTION",
  "QUALITY_CHECK","DISPATCHED","DELIVERED","CANCELLED",
];

const STATUS_COLORS: Record<string, string> = {
  PENDING:"badge-amber",CONFIRMED:"badge-blue",DESIGN_REVIEW:"badge-purple",
  IN_PRODUCTION:"badge-purple",QUALITY_CHECK:"badge-teal",
  DISPATCHED:"badge-teal",DELIVERED:"badge-green",CANCELLED:"badge-red",
};

interface Order {
  id: string; orderNumber: string; status: string; totalAmount: number;
  paymentStatus: string; createdAt: string; guestEmail?: string;
  user?: { name?: string; email?: string };
  items: { id: string; product: { name: string } }[];
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: page.toString(), limit: "15" });
    if (statusFilter !== "ALL") params.set("status", statusFilter);
    try {
      const res = await fetch(`/api/orders?${params}`);
      const data = await res.json();
      setOrders(data.orders ?? []);
      setTotal(data.total ?? 0);
      setPages(data.pages ?? 1);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const filtered = orders.filter((o) =>
    o.orderNumber.includes(search.toUpperCase()) ||
    o.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
    o.user?.email?.toLowerCase().includes(search.toLowerCase()) ||
    o.guestEmail?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#111827]" style={{ fontFamily: "var(--font-jakarta)" }}>
            Orders
          </h1>
          <p className="text-[#6B7280] text-sm mt-0.5">{total} total orders</p>
        </div>
        <button onClick={fetchOrders} className="btn-ghost btn-sm">
          <RefreshCcw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
          <input
            type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order #, customer name or email…"
            className="input pl-10"
          />
        </div>
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="input pr-8 appearance-none cursor-pointer min-w-[160px]"
          >
            {ALL_STATUSES.map((s) => (
              <option key={s} value={s}>{s === "ALL" ? "All Statuses" : s.replace(/_/g, " ")}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF] pointer-events-none" />
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
                <th className="text-left px-5 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Order</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Customer</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Items</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Payment</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Amount</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3F4F6]">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="px-4 py-3"><div className="skeleton h-4 rounded" /></td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-[#9CA3AF]">No orders found</td>
                </tr>
              ) : filtered.map((order) => (
                <tr key={order.id} className="hover:bg-[#F9FAFB] transition-colors">
                  <td className="px-5 py-3">
                    <p className="font-mono text-xs font-bold text-[#7C3AED]">#{order.orderNumber}</p>
                    <p className="text-xs text-[#9CA3AF]">{formatDateTime(order.createdAt)}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-[#111827] text-xs">{order.user?.name ?? "Guest"}</p>
                    <p className="text-xs text-[#9CA3AF] truncate max-w-[160px]">{order.user?.email ?? order.guestEmail ?? "—"}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-xs text-[#374151] truncate max-w-[160px]">
                      {order.items[0]?.product.name}{order.items.length > 1 ? ` +${order.items.length - 1} more` : ""}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge text-xs ${STATUS_COLORS[order.status] ?? "badge-gray"}`}>
                      {order.status.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium ${order.paymentStatus === "PAID" ? "text-green-600" : "text-amber-600"}`}>
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right font-bold text-[#111827] text-sm">
                    {formatPrice(order.totalAmount)}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <Link href={`/admin/orders/${order.id}`} className="text-[#7C3AED] hover:underline text-xs font-medium inline-flex items-center gap-1">
                      Manage <ExternalLink className="w-3 h-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-[#E5E7EB]">
            <p className="text-xs text-[#6B7280]">Page {page} of {pages}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-ghost btn-sm">Prev</button>
              <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages} className="btn-ghost btn-sm">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
