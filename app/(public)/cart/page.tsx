"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ShoppingCart, Trash2, Plus, Minus, Tag, ArrowRight, Package, X } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { formatPrice } from "@/lib/utils";

export default function CartPage() {
  const router = useRouter();
  const { items, removeItem, updateQuantity, applyPromo, removePromo, getSubtotal, promoCode, discountAmount } = useCartStore();
  const [promoInput, setPromoInput] = useState("");
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState("");
  const [promoSuccess, setPromoSuccess] = useState("");

  const subtotal = getSubtotal();
  const shipping = subtotal > 0 ? (subtotal >= 1000 ? 0 : 99) : 0;
  const grandTotal = subtotal - discountAmount + shipping;

  async function handleApplyPromo() {
    if (!promoInput.trim()) return;
    setPromoLoading(true);
    setPromoError("");
    setPromoSuccess("");
    try {
      const res = await fetch("/api/promo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: promoInput.trim(), subtotal }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPromoError(data.error ?? "Invalid promo code");
      } else {
        applyPromo(data.code, data.discount);
        setPromoSuccess(`✓ ${formatPrice(data.discount)} discount applied!`);
        setPromoInput("");
      }
    } finally {
      setPromoLoading(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="section-container py-24 text-center">
        <div className="max-w-sm mx-auto">
          <div className="w-24 h-24 bg-[#EDE9FE] rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingCart className="w-12 h-12 text-[#7C3AED]" />
          </div>
          <h1 className="text-2xl font-bold text-[#111827] mb-3" style={{ fontFamily: "var(--font-jakarta)" }}>
            Your cart is empty
          </h1>
          <p className="text-[#6B7280] mb-8">
            Looks like you haven&apos;t added any products yet. Start designing!
          </p>
          <Link href="/products" className="btn-primary">
            Browse Products <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F9FAFB] min-h-screen">
      <div className="section-container py-8">
        <h1 className="text-2xl md:text-3xl font-bold text-[#111827] mb-8" style={{ fontFamily: "var(--font-jakarta)" }}>
          Your Cart ({items.length} {items.length === 1 ? "item" : "items"})
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items list */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={item.id} className="card p-5 flex gap-4">
                {/* Thumb */}
                <div className="w-20 h-20 rounded-xl bg-[#F9FAFB] flex-shrink-0 overflow-hidden border border-[#E5E7EB] relative">
                  {item.image ? (
                    <Image src={item.image} alt={item.productName} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">🖨️</div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <Link href={`/products/${item.productSlug}`} className="font-semibold text-[#111827] text-sm hover:text-[#7C3AED] transition-colors line-clamp-1" style={{ fontFamily: "var(--font-jakarta)" }}>
                        {item.productName}
                      </Link>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {item.color && <span className="badge badge-gray text-xs">{item.color}</span>}
                        {item.size && <span className="badge badge-gray text-xs">{item.size}</span>}
                        {item.printSide && <span className="badge badge-primary text-xs">{item.printSide}</span>}
                      </div>
                    </div>
                    <button onClick={() => removeItem(item.id)} className="text-[#9CA3AF] hover:text-red-500 transition-colors flex-shrink-0">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {item.designUrl && (
                    <p className="text-xs text-[#7C3AED] mt-1">✓ Design attached</p>
                  )}

                  <div className="flex items-center justify-between mt-3">
                    {/* Qty stepper */}
                    <div className="flex items-center border border-[#E5E7EB] rounded-lg overflow-hidden">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center text-[#374151] hover:bg-[#F9FAFB] transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-10 text-center text-sm font-semibold">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center text-[#374151] hover:bg-[#F9FAFB] transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="text-right">
                      <p className="text-xs text-[#6B7280]">{formatPrice(item.unitPrice)} each</p>
                      <p className="font-bold text-[#111827]">{formatPrice(item.unitPrice * item.quantity)}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order summary */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-20">
              <h2 className="font-bold text-[#111827] text-lg mb-5" style={{ fontFamily: "var(--font-jakarta)" }}>
                Order Summary
              </h2>

              {/* Promo */}
              <div className="mb-5">
                {promoCode ? (
                  <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-3 py-2">
                    <Tag className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-green-700 font-medium flex-1">{promoCode}</span>
                    <button onClick={() => { removePromo(); setPromoSuccess(""); }} className="text-green-600 hover:text-red-500">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
                      <input
                        type="text"
                        value={promoInput}
                        onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                        placeholder="PROMO CODE"
                        className="input pl-10 text-xs font-mono uppercase"
                        onKeyDown={(e) => e.key === "Enter" && handleApplyPromo()}
                      />
                    </div>
                    <button
                      onClick={handleApplyPromo}
                      disabled={promoLoading || !promoInput}
                      className="btn-ghost btn-sm flex-shrink-0"
                    >
                      Apply
                    </button>
                  </div>
                )}
                {promoError && <p className="text-xs text-red-600 mt-1">{promoError}</p>}
                {promoSuccess && <p className="text-xs text-green-600 mt-1 font-medium">{promoSuccess}</p>}
              </div>

              {/* Breakdown */}
              <div className="space-y-3 text-sm mb-5">
                <div className="flex justify-between text-[#374151]">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Promo discount</span>
                    <span>−{formatPrice(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-[#374151]">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? <span className="text-green-600 font-medium">Free</span> : formatPrice(shipping)}</span>
                </div>
                {subtotal > 0 && subtotal < 1000 && (
                  <p className="text-xs text-[#6B7280]">
                    Add {formatPrice(1000 - subtotal)} more for free shipping
                  </p>
                )}
                <div className="flex justify-between font-bold text-[#111827] text-base border-t border-[#E5E7EB] pt-3">
                  <span>Total</span>
                  <span>{formatPrice(Math.max(0, grandTotal))}</span>
                </div>
              </div>

              <button
                id="checkout-btn"
                onClick={() => router.push("/checkout")}
                className="btn-primary w-full btn-lg"
              >
                Proceed to Checkout <ArrowRight className="w-4 h-4" />
              </button>

              <Link href="/products" className="block text-center text-sm text-[#7C3AED] hover:underline mt-4">
                ← Continue Shopping
              </Link>

              {/* Trust badges */}
              <div className="mt-5 pt-4 border-t border-[#E5E7EB] space-y-2">
                {["🔒 Secure checkout", "📦 Free shipping on ₹1000+", "✅ 100% satisfaction guaranteed"].map((t) => (
                  <p key={t} className="text-xs text-[#6B7280] text-center">{t}</p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
