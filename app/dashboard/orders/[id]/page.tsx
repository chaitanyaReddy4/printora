"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import {
  Package, CheckCircle2, Eye, Hammer, ShieldCheck, Truck, Star,
  MapPin, ArrowLeft, ExternalLink, MessageCircle
} from "lucide-react";
import { formatPrice, formatDateTime, getWhatsAppUrl } from "@/lib/utils";
import Image from "next/image";

type OrderStatus = "PENDING"|"CONFIRMED"|"DESIGN_REVIEW"|"IN_PRODUCTION"|"QUALITY_CHECK"|"DISPATCHED"|"DELIVERED"|"CANCELLED";
interface TimelineEntry { status: OrderStatus; message: string; createdAt: string; }
interface OrderItem {
  id: string; quantity: number; unitPrice: number; size?: string; color?: string;
  printSide?: string; customText?: string; designUrl?: string;
  product: { name: string; images: string[]; slug: string; };
}
interface Order {
  id: string; orderNumber: string; status: OrderStatus; totalAmount: number;
  discountAmount: number; paymentStatus: string; paymentId?: string;
  trackingNumber?: string; courierName?: string; estimatedDelivery?: string;
  shippingAddress: { fullName: string; phone: string; line1: string; line2?: string; city: string; state: string; pincode: string; };
  createdAt: string; notes?: string;
  items: OrderItem[];
  timeline: TimelineEntry[];
}

const STATUS_STEPS = [
  { status: "PENDING", label: "Order Placed", icon: Package },
  { status: "CONFIRMED", label: "Confirmed", icon: CheckCircle2 },
  { status: "DESIGN_REVIEW", label: "Design Review", icon: Eye },
  { status: "IN_PRODUCTION", label: "In Production", icon: Hammer },
  { status: "QUALITY_CHECK", label: "Quality Check", icon: ShieldCheck },
  { status: "DISPATCHED", label: "Dispatched", icon: Truck },
  { status: "DELIVERED", label: "Delivered", icon: Star },
];

const STATUS_COLORS: Record<string, string> = {
  PENDING:"badge-amber",CONFIRMED:"badge-blue",DESIGN_REVIEW:"badge-purple",
  IN_PRODUCTION:"badge-purple",QUALITY_CHECK:"badge-teal",
  DISPATCHED:"badge-teal",DELIVERED:"badge-green",CANCELLED:"badge-red",
};

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/orders/${id}`)
      .then((r) => r.json())
      .then((d) => setOrder(d.order ?? null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="skeleton h-8 rounded w-48" />
        <div className="card p-6 space-y-3">
          <div className="skeleton h-6 rounded w-64" />
          <div className="skeleton h-4 rounded w-full" />
          <div className="skeleton h-4 rounded w-3/4" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="card p-12 text-center">
        <p className="text-[#6B7280] mb-4">Order not found.</p>
        <Link href="/dashboard" className="btn-primary btn-sm">Back to Orders</Link>
      </div>
    );
  }

  const currentStep = STATUS_STEPS.findIndex((s) => s.status === order.status);
  const shipping = order.totalAmount > 1000 ? 0 : 99;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard" className="text-[#6B7280] hover:text-[#111827] transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-xl font-bold text-[#111827]" style={{ fontFamily: "var(--font-jakarta)" }}>
          Order #{order.orderNumber}
        </h1>
        <span className={`badge ${STATUS_COLORS[order.status] ?? "badge-gray"}`}>
          {order.status.replace(/_/g, " ")}
        </span>
      </div>

      {/* Stepper */}
      {order.status !== "CANCELLED" && (
        <div className="card p-5 overflow-x-auto">
          <div className="flex items-start min-w-[640px]">
            {STATUS_STEPS.map((step, i) => {
              const done = i < currentStep;
              const active = i === currentStep;
              const Icon = step.icon;
              return (
                <div key={step.status} className="flex-1 flex flex-col items-center gap-2 relative">
                  {i < STATUS_STEPS.length - 1 && (
                    <div className={`absolute top-5 left-1/2 w-full h-0.5 ${done ? "bg-[#7C3AED]" : "bg-[#E5E7EB]"}`} />
                  )}
                  <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                    done ? "bg-[#7C3AED] border-[#7C3AED] text-white" :
                    active ? "bg-white border-[#7C3AED] text-[#7C3AED] pulse-ring" :
                    "bg-white border-[#E5E7EB] text-[#9CA3AF]"
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <p className={`text-xs font-medium text-center leading-tight ${i > currentStep ? "text-[#9CA3AF]" : "text-[#111827]"}`}>
                    {step.label}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tracking info */}
      {order.trackingNumber && (
        <div className="card p-5 bg-[#EDE9FE] border-[#7C3AED]/20">
          <div className="flex items-center gap-2 mb-2">
            <Truck className="w-5 h-5 text-[#7C3AED]" />
            <h3 className="font-bold text-[#111827]">Shipment Tracking</h3>
          </div>
          <p className="text-sm text-[#374151]"><strong>Courier:</strong> {order.courierName}</p>
          <p className="text-sm text-[#374151] font-mono"><strong>AWB #:</strong> {order.trackingNumber}</p>
          {order.estimatedDelivery && (
            <p className="text-sm text-[#374151]"><strong>Est. Delivery:</strong> {formatDateTime(order.estimatedDelivery)}</p>
          )}
        </div>
      )}

      {/* Items */}
      <div className="card p-5">
        <h2 className="font-bold text-[#111827] mb-4" style={{ fontFamily: "var(--font-jakarta)" }}>Items Ordered</h2>
        <div className="space-y-4">
          {order.items.map((item) => (
            <div key={item.id} className="flex gap-4 pb-4 border-b border-[#F3F4F6] last:border-0 last:pb-0">
              <div className="w-16 h-16 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB] overflow-hidden flex-shrink-0 relative">
                {item.product.images?.[0] ? (
                  <Image src={item.product.images[0]} alt={item.product.name} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl">🖨️</div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <Link href={`/products/${item.product.slug}`} className="font-semibold text-sm text-[#111827] hover:text-[#7C3AED] line-clamp-1">
                  {item.product.name}
                </Link>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {item.color && <span className="badge badge-gray text-xs">{item.color}</span>}
                  {item.size && <span className="badge badge-gray text-xs">{item.size}</span>}
                  {item.printSide && <span className="badge badge-primary text-xs">{item.printSide}</span>}
                </div>
                {item.designUrl && (
                  <a href={item.designUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-[#7C3AED] mt-1 hover:underline">
                    <ExternalLink className="w-3 h-3" /> View design file
                  </a>
                )}
                {item.customText && <p className="text-xs text-[#6B7280] mt-1">Text: {item.customText}</p>}
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-xs text-[#6B7280]">×{item.quantity} @ {formatPrice(item.unitPrice)}</p>
                <p className="font-bold text-[#111827] text-sm">{formatPrice(item.unitPrice * item.quantity)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Address */}
        <div className="card p-5">
          <h2 className="font-bold text-[#111827] mb-3 flex items-center gap-2" style={{ fontFamily: "var(--font-jakarta)" }}>
            <MapPin className="w-4 h-4 text-[#7C3AED]" /> Delivery Address
          </h2>
          <p className="text-sm font-semibold text-[#111827]">{order.shippingAddress.fullName}</p>
          <p className="text-sm text-[#6B7280]">{order.shippingAddress.line1}</p>
          {order.shippingAddress.line2 && <p className="text-sm text-[#6B7280]">{order.shippingAddress.line2}</p>}
          <p className="text-sm text-[#6B7280]">{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode}</p>
          <p className="text-sm text-[#6B7280]">{order.shippingAddress.phone}</p>
        </div>

        {/* Price breakdown */}
        <div className="card p-5">
          <h2 className="font-bold text-[#111827] mb-3" style={{ fontFamily: "var(--font-jakarta)" }}>Price Breakdown</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-[#374151]">
              <span>Items Total</span>
              <span>{formatPrice(order.totalAmount + order.discountAmount - shipping)}</span>
            </div>
            {order.discountAmount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount</span><span>−{formatPrice(order.discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-[#374151]">
              <span>Shipping</span><span>{shipping === 0 ? "Free" : formatPrice(shipping)}</span>
            </div>
            <div className="flex justify-between font-bold text-[#111827] border-t border-[#E5E7EB] pt-2">
              <span>Total</span><span>{formatPrice(order.totalAmount)}</span>
            </div>
            <div className={`flex justify-between text-xs font-medium ${order.paymentStatus === "PAID" ? "text-green-600" : "text-amber-600"}`}>
              <span>Payment</span>
              <span>{order.paymentStatus === "PAID" ? "✓ Paid" : "⏳ Pending"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="card p-5">
        <h2 className="font-bold text-[#111827] mb-4" style={{ fontFamily: "var(--font-jakarta)" }}>Status History</h2>
        <div className="space-y-3">
          {order.timeline.slice().reverse().map((entry, i) => (
            <div key={i} className="flex gap-3">
              <div className="w-2 h-2 rounded-full bg-[#7C3AED] flex-shrink-0 mt-1.5" />
              <div>
                <p className="text-sm font-semibold text-[#111827]">{entry.status.replace(/_/g, " ")}</p>
                <p className="text-sm text-[#6B7280]">{entry.message}</p>
                <p className="text-xs text-[#9CA3AF]">{formatDateTime(entry.createdAt)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* WhatsApp */}
      <a
        href={getWhatsAppUrl(`Hi! I have a question about my order #${order.orderNumber}`)}
        target="_blank" rel="noopener noreferrer"
        className="btn-primary w-full justify-center"
      >
        <MessageCircle className="w-4 h-4 fill-white" /> Need help? Chat on WhatsApp
      </a>
    </div>
  );
}
