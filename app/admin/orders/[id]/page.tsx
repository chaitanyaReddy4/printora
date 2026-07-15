"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, Save, Check, Truck, MapPin, Package } from "lucide-react";
import { formatPrice, formatDateTime } from "@/lib/utils";
import Image from "next/image";

const ALL_STATUSES = [
  "PENDING","CONFIRMED","DESIGN_REVIEW","IN_PRODUCTION",
  "QUALITY_CHECK","DISPATCHED","DELIVERED","CANCELLED",
];

const STATUS_COLORS: Record<string, string> = {
  PENDING:"badge-amber",CONFIRMED:"badge-blue",DESIGN_REVIEW:"badge-purple",
  IN_PRODUCTION:"badge-purple",QUALITY_CHECK:"badge-teal",
  DISPATCHED:"badge-teal",DELIVERED:"badge-green",CANCELLED:"badge-red",
};

interface Order {
  id: string; orderNumber: string; status: string; totalAmount: number;
  discountAmount: number; paymentStatus: string; paymentId?: string;
  trackingNumber?: string; courierName?: string; estimatedDelivery?: string;
  notes?: string; createdAt: string; guestEmail?: string;
  shippingAddress: { fullName: string; phone: string; line1: string; line2?: string; city: string; state: string; pincode: string };
  user?: { name: string; email: string; phone?: string };
  items: { id: string; quantity: number; unitPrice: number; size?: string; color?: string; designUrl?: string; printSide?: string; customText?: string; product: { name: string; images: string[]; slug: string } }[];
  timeline: { status: string; message: string; createdAt: string }[];
}

export default function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [newStatus, setNewStatus] = useState("");
  const [message, setMessage] = useState("");
  const [tracking, setTracking] = useState("");
  const [courier, setCourier] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch(`/api/orders/${id}`)
      .then(r => r.json())
      .then(d => {
        if (d.order) {
          setOrder(d.order);
          setNewStatus(d.order.status);
          setTracking(d.order.trackingNumber ?? "");
          setCourier(d.order.courierName ?? "");
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  async function handleSave() {
    if (!order) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus !== order.status ? newStatus : undefined,
          message: message || undefined,
          trackingNumber: tracking || undefined,
          courierName: courier || undefined,
        }),
      });
      const data = await res.json();
      if (data.order) {
        setOrder(data.order);
        setSaved(true);
        setMessage("");
        setTimeout(() => setSaved(false), 2000);
      }
    } finally {
      setSaving(false);
    }
  }

  if (loading) return (
    <div className="space-y-4 animate-pulse">
      <div className="skeleton h-8 rounded w-56" />
      <div className="skeleton h-48 rounded-xl" />
    </div>
  );

  if (!order) return (
    <div className="text-center py-12">
      <p className="text-[#6B7280] mb-4">Order not found.</p>
      <Link href="/admin/orders" className="btn-primary btn-sm">Back to Orders</Link>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 flex-wrap">
        <Link href="/admin/orders" className="text-gray-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-xl font-bold text-[#111827]" style={{ fontFamily: "var(--font-jakarta)" }}>
          Order #{order.orderNumber}
        </h1>
        <span className={`badge ${STATUS_COLORS[order.status] ?? "badge-gray"}`}>
          {order.status.replace(/_/g, " ")}
        </span>
        <span className={`badge ${order.paymentStatus === "PAID" ? "badge-green" : "badge-amber"}`}>
          {order.paymentStatus}
        </span>
        <span className="text-sm text-[#6B7280] ml-auto">{formatDateTime(order.createdAt)}</span>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left column: update + items */}
        <div className="xl:col-span-2 space-y-5">
          {/* Status update card */}
          <div className="card p-5">
            <h2 className="font-bold text-[#111827] mb-4" style={{ fontFamily: "var(--font-jakarta)" }}>
              Update Order Status
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="label" htmlFor="admin-status">New Status</label>
                <select id="admin-status" value={newStatus} onChange={e => setNewStatus(e.target.value)} className="input">
                  {ALL_STATUSES.map(s => (
                    <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label" htmlFor="admin-message">Status Message <span className="font-normal text-[#9CA3AF]">(optional)</span></label>
                <input id="admin-message" type="text" value={message} onChange={e => setMessage(e.target.value)} className="input" placeholder="Message to customer…" />
              </div>
              <div>
                <label className="label" htmlFor="admin-courier">Courier Name</label>
                <input id="admin-courier" type="text" value={courier} onChange={e => setCourier(e.target.value)} className="input" placeholder="e.g. DTDC, Blue Dart" />
              </div>
              <div>
                <label className="label" htmlFor="admin-tracking">Tracking Number</label>
                <input id="admin-tracking" type="text" value={tracking} onChange={e => setTracking(e.target.value)} className="input" placeholder="AWB number" />
              </div>
            </div>
            <button onClick={handleSave} disabled={saving} className="btn-primary">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              {saved ? "Saved!" : saving ? "Saving…" : "Save Changes"}
            </button>
          </div>

          {/* Items */}
          <div className="card p-5">
            <h2 className="font-bold text-[#111827] mb-4" style={{ fontFamily: "var(--font-jakarta)" }}>Order Items</h2>
            <div className="space-y-4">
              {order.items.map(item => (
                <div key={item.id} className="flex gap-4 pb-4 border-b border-[#F3F4F6] last:border-0 last:pb-0">
                  <div className="w-14 h-14 rounded-lg bg-[#F9FAFB] border border-[#E5E7EB] flex-shrink-0 relative overflow-hidden">
                    {item.product.images?.[0]
                      ? <Image src={item.product.images[0]} alt={item.product.name} fill className="object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-xl">🖨️</div>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-[#111827]">{item.product.name}</p>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {item.color && <span className="badge badge-gray text-xs">{item.color}</span>}
                      {item.size && <span className="badge badge-gray text-xs">{item.size}</span>}
                      {item.printSide && <span className="badge badge-primary text-xs">{item.printSide}</span>}
                    </div>
                    {item.customText && <p className="text-xs text-[#6B7280] mt-1">Text: {item.customText}</p>}
                    {item.designUrl && (
                      <a href={item.designUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-[#7C3AED] hover:underline mt-1 inline-block">
                        View design ↗
                      </a>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-[#6B7280]">×{item.quantity}</p>
                    <p className="text-xs text-[#6B7280]">{formatPrice(item.unitPrice)} ea</p>
                    <p className="font-bold text-sm text-[#111827]">{formatPrice(item.unitPrice * item.quantity)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Timeline */}
          <div className="card p-5">
            <h2 className="font-bold text-[#111827] mb-4" style={{ fontFamily: "var(--font-jakarta)" }}>Status Timeline</h2>
            <div className="space-y-3">
              {order.timeline.slice().reverse().map((entry, i) => (
                <div key={i} className="flex gap-3 text-sm">
                  <div className="w-2 h-2 rounded-full bg-[#7C3AED] flex-shrink-0 mt-1.5" />
                  <div>
                    <p className="font-semibold text-[#111827]">{entry.status.replace(/_/g, " ")}</p>
                    <p className="text-[#6B7280] text-xs">{entry.message}</p>
                    <p className="text-xs text-[#9CA3AF]">{formatDateTime(entry.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column: customer + address + summary */}
        <div className="space-y-5">
          {/* Customer */}
          <div className="card p-5">
            <h2 className="font-bold text-[#111827] mb-3" style={{ fontFamily: "var(--font-jakarta)" }}>Customer</h2>
            {order.user ? (
              <>
                <p className="font-semibold text-sm text-[#111827]">{order.user.name}</p>
                <p className="text-xs text-[#6B7280]">{order.user.email}</p>
                {order.user.phone && <p className="text-xs text-[#6B7280]">{order.user.phone}</p>}
              </>
            ) : (
              <>
                <p className="text-sm font-medium text-[#374151]">Guest Order</p>
                <p className="text-xs text-[#6B7280]">{order.guestEmail}</p>
              </>
            )}
            {order.paymentId && (
              <div className="mt-3 p-2 bg-[#F9FAFB] rounded-lg">
                <p className="text-xs text-[#6B7280]">Payment ID</p>
                <p className="text-xs font-mono text-[#374151] truncate">{order.paymentId}</p>
              </div>
            )}
          </div>

          {/* Address */}
          <div className="card p-5">
            <h2 className="font-bold text-[#111827] mb-3 flex items-center gap-2" style={{ fontFamily: "var(--font-jakarta)" }}>
              <MapPin className="w-4 h-4 text-[#7C3AED]" /> Delivery Address
            </h2>
            <p className="text-sm font-semibold text-[#111827]">{order.shippingAddress.fullName}</p>
            <p className="text-sm text-[#6B7280]">{order.shippingAddress.line1}</p>
            {order.shippingAddress.line2 && <p className="text-sm text-[#6B7280]">{order.shippingAddress.line2}</p>}
            <p className="text-sm text-[#6B7280]">{order.shippingAddress.city}, {order.shippingAddress.state}</p>
            <p className="text-sm text-[#6B7280]">PIN: {order.shippingAddress.pincode}</p>
            <p className="text-sm text-[#6B7280]">{order.shippingAddress.phone}</p>
          </div>

          {/* Summary */}
          <div className="card p-5">
            <h2 className="font-bold text-[#111827] mb-3" style={{ fontFamily: "var(--font-jakarta)" }}>Price Summary</h2>
            <div className="space-y-2 text-sm">
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span><span>−{formatPrice(order.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-[#111827] border-t border-[#E5E7EB] pt-2">
                <span>Total</span><span>{formatPrice(order.totalAmount)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
