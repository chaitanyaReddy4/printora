"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { formatDateTime, getWhatsAppUrl } from "@/lib/utils";
import {
  Search, Package, CheckCircle2, Truck, Star, ShieldCheck,
  Hammer, Eye, ExternalLink, MessageCircle, Loader2
} from "lucide-react";

type OrderStatus =
  | "PENDING" | "CONFIRMED" | "DESIGN_REVIEW"
  | "IN_PRODUCTION" | "QUALITY_CHECK" | "DISPATCHED" | "DELIVERED" | "CANCELLED";

interface TimelineEntry { status: OrderStatus; message: string; createdAt: string; }
interface Order {
  id: string; orderNumber: string; status: OrderStatus; totalAmount: number;
  trackingNumber?: string; courierName?: string; estimatedDelivery?: string;
  shippingAddress: { fullName: string; city: string; state: string };
  timeline: TimelineEntry[];
  items: { id: string; product: { name: string }; quantity: number }[];
}

const STATUS_STEPS: { status: OrderStatus; label: string; icon: React.ElementType; desc: string }[] = [
  { status: "PENDING", label: "Order Placed", icon: Package, desc: "We received your order" },
  { status: "CONFIRMED", label: "Confirmed", icon: CheckCircle2, desc: "Payment verified, order confirmed" },
  { status: "DESIGN_REVIEW", label: "Design Review", icon: Eye, desc: "Our team is reviewing your design" },
  { status: "IN_PRODUCTION", label: "In Production", icon: Hammer, desc: "Your items are being printed" },
  { status: "QUALITY_CHECK", label: "Quality Check", icon: ShieldCheck, desc: "Checking print quality" },
  { status: "DISPATCHED", label: "Dispatched", icon: Truck, desc: "On its way to you!" },
  { status: "DELIVERED", label: "Delivered", icon: Star, desc: "Delivered successfully" },
];

function getStepIndex(status: OrderStatus) {
  return STATUS_STEPS.findIndex((s) => s.status === status);
}

export default function TrackPage() {
  const { data: session } = useSession();
  const [orderNumber, setOrderNumber] = useState("");
  const [email, setEmail] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const params = new URLSearchParams({ orderNumber });
      if (!session?.user) params.set("email", email);
      const res = await fetch(`/api/track?${params}`);
      const data = await res.json();
      if (!res.ok || !data.order) {
        setError("Order not found. Please check your order number and email.");
      } else {
        setOrder(data.order);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const currentStep = order ? getStepIndex(order.status) : -1;

  return (
    <div className="bg-[#F9FAFB] min-h-screen py-12">
      <div className="section-container max-w-3xl">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-[#111827] mb-2" style={{ fontFamily: "var(--font-jakarta)" }}>
            Track Your Order
          </h1>
          <p className="text-[#6B7280]">Enter your order number to see real-time status updates</p>
        </div>

        {/* Search form */}
        <div className="card p-6 mb-8">
          <form onSubmit={handleSearch} className="space-y-4">
            <div>
              <label className="label" htmlFor="track-order-num">Order Number</label>
              <input
                id="track-order-num"
                type="text"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value.toUpperCase())}
                placeholder="e.g. PRT-XXXXXX-XXX"
                className="input font-mono"
                required
              />
            </div>
            {!session?.user && (
              <div>
                <label className="label" htmlFor="track-email">Email Address</label>
                <input
                  id="track-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email used during order"
                  className="input"
                  required
                />
              </div>
            )}
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              {loading ? "Searching…" : "Track Order"}
            </button>
          </form>
        </div>

        {/* Tracker */}
        {order && (
          <div className="space-y-6 fade-in-up">
            {/* Order card */}
            <div className="card p-6">
              <div className="flex items-start justify-between flex-wrap gap-3 mb-5">
                <div>
                  <p className="text-xs text-[#6B7280] mb-1">Order Number</p>
                  <p className="font-mono font-bold text-[#7C3AED] text-lg">#{order.orderNumber}</p>
                </div>
                <span className={`badge text-sm status-${order.status.toLowerCase()}`}>
                  {order.status.replace(/_/g, " ")}
                </span>
              </div>

              {/* Visual stepper */}
              <div className="relative">
                {/* Desktop: horizontal */}
                <div className="hidden md:flex items-start justify-between relative mb-2">
                  {STATUS_STEPS.map((step, i) => {
                    const done = i < currentStep;
                    const active = i === currentStep;
                    const upcoming = i > currentStep;
                    const Icon = step.icon;
                    return (
                      <div key={step.status} className="flex flex-col items-center gap-2 flex-1 relative">
                        {i < STATUS_STEPS.length - 1 && (
                          <div className={`absolute top-5 left-1/2 w-full h-0.5 tracker-step-connector ${done ? "bg-[#7C3AED]" : "bg-[#E5E7EB]"}`} />
                        )}
                        <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                          done ? "bg-[#7C3AED] border-[#7C3AED] text-white" :
                          active ? "bg-white border-[#7C3AED] text-[#7C3AED] pulse-ring" :
                          "bg-white border-[#E5E7EB] text-[#9CA3AF]"
                        }`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <p className={`text-xs font-medium text-center px-1 leading-tight ${upcoming ? "text-[#9CA3AF]" : "text-[#111827]"}`}>
                          {step.label}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {/* Mobile: vertical */}
                <div className="md:hidden space-y-0">
                  {STATUS_STEPS.map((step, i) => {
                    const done = i < currentStep;
                    const active = i === currentStep;
                    const Icon = step.icon;
                    const entry = order.timeline.find((t) => t.status === step.status);
                    return (
                      <div key={step.status} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 flex-shrink-0 ${
                            done ? "bg-[#7C3AED] border-[#7C3AED] text-white" :
                            active ? "bg-white border-[#7C3AED] text-[#7C3AED] pulse-ring" :
                            "bg-white border-[#E5E7EB] text-[#9CA3AF]"
                          }`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          {i < STATUS_STEPS.length - 1 && (
                            <div className={`w-0.5 flex-1 min-h-[24px] ${done ? "bg-[#7C3AED]" : "bg-[#E5E7EB]"}`} />
                          )}
                        </div>
                        <div className="pb-6 flex-1 min-w-0">
                          <p className={`font-semibold text-sm ${done || active ? "text-[#111827]" : "text-[#9CA3AF]"}`}>
                            {step.label}
                          </p>
                          {entry && (
                            <>
                              <p className="text-xs text-[#6B7280] mt-0.5">{entry.message}</p>
                              <p className="text-xs text-[#9CA3AF]">{formatDateTime(entry.createdAt)}</p>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Timeline (desktop) */}
            <div className="card p-6 hidden md:block">
              <h3 className="font-bold text-[#111827] mb-4" style={{ fontFamily: "var(--font-jakarta)" }}>Status Timeline</h3>
              <div className="space-y-3">
                {order.timeline.slice().reverse().map((entry) => (
                  <div key={entry.createdAt} className="flex gap-3 text-sm">
                    <div className="w-2 h-2 rounded-full bg-[#7C3AED] flex-shrink-0 mt-1.5" />
                    <div>
                      <p className="font-semibold text-[#111827]">{entry.status.replace(/_/g, " ")}</p>
                      <p className="text-[#6B7280]">{entry.message}</p>
                      <p className="text-xs text-[#9CA3AF]">{formatDateTime(entry.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tracking info (if dispatched) */}
            {order.trackingNumber && (
              <div className="card p-5 bg-[#EDE9FE] border-[#7C3AED]/20">
                <div className="flex items-center gap-2 mb-2">
                  <Truck className="w-5 h-5 text-[#7C3AED]" />
                  <h3 className="font-bold text-[#111827]">Shipment Tracking</h3>
                </div>
                <p className="text-sm text-[#374151]">
                  <strong>Courier:</strong> {order.courierName}
                </p>
                <p className="text-sm text-[#374151] font-mono">
                  <strong>Tracking #:</strong> {order.trackingNumber}
                </p>
                {order.estimatedDelivery && (
                  <p className="text-sm text-[#374151]">
                    <strong>Est. Delivery:</strong> {formatDateTime(order.estimatedDelivery)}
                  </p>
                )}
                <a
                  href="#"
                  className="inline-flex items-center gap-1 text-sm text-[#7C3AED] hover:underline mt-2 font-medium"
                >
                  Track on courier website <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}

            {/* Delivery address */}
            <div className="card p-5">
              <p className="text-xs text-[#6B7280] mb-1">Delivering to</p>
              <p className="font-semibold text-[#111827]">{order.shippingAddress.fullName}</p>
              <p className="text-sm text-[#6B7280]">{order.shippingAddress.city}, {order.shippingAddress.state}</p>
            </div>

            {/* WhatsApp CTA */}
            <div className="text-center">
              <a
                href={getWhatsAppUrl(`Hi! I need help with my order #${order.orderNumber}`)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                Chat on WhatsApp for updates
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
