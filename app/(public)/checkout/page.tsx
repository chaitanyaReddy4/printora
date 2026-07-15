"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useCartStore } from "@/stores/cartStore";
import { formatPrice } from "@/lib/utils";
import { Check, Loader2, MapPin, Package, CreditCard, ChevronRight } from "lucide-react";
import Link from "next/link";
import Script from "next/script";

type Step = 1 | 2 | 3;

interface Address {
  fullName: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  pincode: string;
}

const INDIAN_STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat","Haryana",
  "Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh","Maharashtra","Manipur",
  "Meghalaya","Mizoram","Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana",
  "Tripura","Uttar Pradesh","Uttarakhand","West Bengal","Delhi","Jammu & Kashmir","Ladakh",
];

/**
 * Dynamically loads the Razorpay Checkout JS if not already present.
 * Safe to call multiple times — it checks for an existing script/window.Razorpay first.
 */
function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    // Already loaded
    if (typeof window !== "undefined" && typeof window.Razorpay === "function") {
      resolve(true);
      return;
    }
    // Avoid duplicate script tags
    const existing = document.querySelector(
      'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
    );
    if (existing) {
      existing.addEventListener("load", () => resolve(true));
      existing.addEventListener("error", () => resolve(false));
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

function StepIndicator({ current }: { current: Step }) {
  const steps = [
    { n: 1, label: "Address", icon: MapPin },
    { n: 2, label: "Review", icon: Package },
    { n: 3, label: "Payment", icon: CreditCard },
  ];
  return (
    <div className="flex items-center justify-center mb-8">
      {steps.map((s, i) => (
        <div key={s.n} className="flex items-center">
          <div className="flex flex-col items-center gap-1">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${
              current > s.n ? "bg-green-500 text-white" :
              current === s.n ? "bg-[#7C3AED] text-white pulse-ring" :
              "bg-[#F3F4F6] text-[#9CA3AF]"
            }`}>
              {current > s.n ? <Check className="w-5 h-5" /> : s.n}
            </div>
            <span className={`text-xs font-medium ${current >= s.n ? "text-[#111827]" : "text-[#9CA3AF]"}`}>
              {s.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className={`h-0.5 w-16 mx-2 mb-5 transition-colors ${current > s.n + 0 ? "bg-green-500" : "bg-[#E5E7EB]"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { items, getSubtotal, discountAmount, promoCode, clearCart } = useCartStore();
  const [step, setStep] = useState<Step>(1);
  const [address, setAddress] = useState<Address>({
    fullName: session?.user?.name ?? "",
    phone: "",
    line1: "",
    line2: "",
    city: "",
    state: "Andhra Pradesh",
    pincode: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("razorpay");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const subtotal = getSubtotal();
  const shipping = subtotal >= 1000 ? 0 : 99;
  const cod = paymentMethod === "cod" ? 49 : 0;
  const grand = subtotal - discountAmount + shipping + cod;

  const setField = (f: keyof Address) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setAddress((a) => ({ ...a, [f]: e.target.value }));

  function validateAddress() {
    if (!address.fullName || !address.phone || !address.line1 || !address.city || !address.state || !address.pincode) {
      setError("Please fill in all required fields.");
      return false;
    }
    if (!/^\d{6}$/.test(address.pincode)) {
      setError("Please enter a valid 6-digit pincode.");
      return false;
    }
    if (!/^\d{10}$/.test(address.phone.replace(/\D/g, ""))) {
      setError("Please enter a valid 10-digit phone number.");
      return false;
    }
    setError("");
    return true;
  }

  async function handlePlaceOrder() {
    setLoading(true);
    setError("");

    try {
      // ── Cash on Delivery ────────────────────────────────────────────────────
      if (paymentMethod === "cod") {
        const res = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items: items.map((i) => ({
              productId: i.productId,
              quantity: i.quantity,
              size: i.size,
              color: i.color,
              designUrl: i.designUrl,
              previewUrl: i.previewUrl,
              designData: i.designData ? JSON.parse(i.designData) : undefined,
              printSide: i.printSide,
              customText: i.customText,
              unitPrice: i.unitPrice,
            })),
            shippingAddress: address,
            guestEmail: session?.user?.email ?? undefined,
            promoCode: promoCode || undefined,
            notes: "COD order. Extra fee: ₹49",
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? "Order failed. Please try again.");
          return;
        }
        clearCart();
        router.push(`/dashboard/orders/${data.order.id}`);
        return;
      }

      // ── Razorpay Online Payment ─────────────────────────────────────────────

      // Step 1: Ensure the Razorpay Checkout JS script is loaded
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded || typeof window.Razorpay !== "function") {
        setError("Payment gateway failed to load. Please refresh and try again.");
        return;
      }

      // Step 2: Create a Razorpay order on our server
      const createRes = await fetch("/api/payment/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: grand }),
      });

      if (!createRes.ok) {
        const err = await createRes.json();
        setError(err.error ?? "Failed to initiate payment. Please try again.");
        return;
      }

      const { orderId, amount, currency, keyId } = await createRes.json();

      if (!orderId || !keyId) {
        setError("Invalid response from payment server. Please try again.");
        return;
      }

      // Step 3: Open Razorpay Checkout modal
      // loading stays true until modal opens; turns false on dismiss or after verify
      const rzp = new window.Razorpay({
        key: keyId,
        amount: Number(amount),
        currency: currency ?? "INR",
        name: "Printora",
        description: "Custom print order",
        order_id: orderId,
        prefill: {
          name: address.fullName,
          contact: address.phone,
          email: session?.user?.email ?? "",
        },
        theme: { color: "#7C3AED" },

        // Step 4: On payment success — verify signature on server
        handler: async (response: RazorpayPaymentResponse) => {
          setLoading(true);
          try {
            const verRes = await fetch("/api/payment/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                cartItems: items.map((i) => ({
                  productId: i.productId,
                  quantity: i.quantity,
                  size: i.size,
                  color: i.color,
                  designUrl: i.designUrl,
                  previewUrl: i.previewUrl,
                  printSide: i.printSide,
                  customText: i.customText,
                  unitPrice: i.unitPrice,
                })),
                shippingAddress: address,
                totalAmount: grand,
                guestEmail: session?.user?.email ?? undefined,
                promoCode: promoCode || undefined,
                discountAmount,
              }),
            });

            const verData = await verRes.json();
            if (verData.success) {
              clearCart();
              router.push(`/dashboard/orders/${verData.orderId}`);
            } else {
              setError(
                verData.error ?? "Payment verification failed. Please contact support with your payment ID: " +
                response.razorpay_payment_id
              );
            }
          } catch {
            setError(
              "Payment was received but verification failed. Please contact support with payment ID: " +
              response.razorpay_payment_id
            );
          } finally {
            setLoading(false);
          }
        },

        modal: {
          // Re-enable the Pay button if user closes the modal
          ondismiss: () => {
            setLoading(false);
            setError("");
          },
          confirm_close: true,
        },
      });

      rzp.open();
      // Keep loading=true while modal is open (will be reset by handler or ondismiss)

    } catch (e) {
      console.error("[checkout] handlePlaceOrder error:", e);
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="section-container py-20 text-center">
        <p className="text-[#6B7280] mb-4">Your cart is empty.</p>
        <Link href="/products" className="btn-primary">Browse Products</Link>
      </div>
    );
  }

  return (
    <>
      {/*
        Load Razorpay Checkout JS via next/script.
        strategy="afterInteractive" loads it after hydration — the user
        has to fill address + review before reaching the Pay button, so
        the script is guaranteed to be available in time.
        The loadRazorpayScript() fallback in handlePlaceOrder covers any edge cases.
      */}
      <Script
        id="razorpay-checkout-js"
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="afterInteractive"
      />

      <div className="bg-[#F9FAFB] min-h-screen py-8">
        <div className="section-container max-w-4xl">
          <h1 className="text-2xl font-bold text-[#111827] mb-6 text-center" style={{ fontFamily: "var(--font-jakarta)" }}>
            Checkout
          </h1>
          <StepIndicator current={step} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {/* Step 1: Address */}
              {step === 1 && (
                <div className="card p-6">
                  <h2 className="font-bold text-[#111827] text-lg mb-5" style={{ fontFamily: "var(--font-jakarta)" }}>
                    Delivery Address
                  </h2>
                  {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-4 text-sm">{error}</div>}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="label" htmlFor="co-name">Full Name *</label>
                      <input id="co-name" type="text" value={address.fullName} onChange={setField("fullName")} className="input" placeholder="Arjun Sharma" required />
                    </div>
                    <div>
                      <label className="label" htmlFor="co-phone">Phone Number *</label>
                      <input id="co-phone" type="tel" value={address.phone} onChange={setField("phone")} className="input" placeholder="9876543210" required />
                    </div>
                    <div>
                      <label className="label" htmlFor="co-pincode">Pincode *</label>
                      <input id="co-pincode" type="text" value={address.pincode} onChange={setField("pincode")} className="input" placeholder="520001" maxLength={6} required />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="label" htmlFor="co-line1">Address Line 1 *</label>
                      <input id="co-line1" type="text" value={address.line1} onChange={setField("line1")} className="input" placeholder="House/Flat No., Street" required />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="label" htmlFor="co-line2">Address Line 2 <span className="font-normal text-[#9CA3AF]">(optional)</span></label>
                      <input id="co-line2" type="text" value={address.line2} onChange={setField("line2")} className="input" placeholder="Landmark, Colony" />
                    </div>
                    <div>
                      <label className="label" htmlFor="co-city">City *</label>
                      <input id="co-city" type="text" value={address.city} onChange={setField("city")} className="input" placeholder="Vijayawada" required />
                    </div>
                    <div>
                      <label className="label" htmlFor="co-state">State *</label>
                      <select id="co-state" value={address.state} onChange={setField("state")} className="input">
                        {INDIAN_STATES.map((s) => <option key={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>
                  <button onClick={() => { if (validateAddress()) setStep(2); }} className="btn-primary w-full mt-6">
                    Continue to Review <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Step 2: Review */}
              {step === 2 && (
                <div className="card p-6">
                  <h2 className="font-bold text-[#111827] text-lg mb-5" style={{ fontFamily: "var(--font-jakarta)" }}>
                    Review Order
                  </h2>
                  <div className="space-y-3 mb-6">
                    {items.map((item) => (
                      <div key={item.id} className="flex items-center gap-3 p-3 bg-[#F9FAFB] rounded-xl">
                        <div className="w-12 h-12 bg-[#EDE9FE] rounded-lg flex items-center justify-center text-xl flex-shrink-0">🖨️</div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-[#111827] truncate">{item.productName}</p>
                          <p className="text-xs text-[#6B7280]">{[item.color, item.size, item.printSide].filter(Boolean).join(" · ")}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-xs text-[#6B7280]">×{item.quantity}</p>
                          <p className="font-bold text-sm text-[#111827]">{formatPrice(item.unitPrice * item.quantity)}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Address preview */}
                  <div className="bg-[#EDE9FE] rounded-xl p-4 mb-6">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-[#7C3AED] mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-[#111827] text-sm">{address.fullName}</p>
                        <p className="text-xs text-[#6B7280]">{address.line1}{address.line2 ? `, ${address.line2}` : ""}</p>
                        <p className="text-xs text-[#6B7280]">{address.city}, {address.state} - {address.pincode}</p>
                        <p className="text-xs text-[#6B7280]">{address.phone}</p>
                      </div>
                      <button onClick={() => setStep(1)} className="text-xs text-[#7C3AED] ml-auto hover:underline">Edit</button>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button onClick={() => setStep(1)} className="btn-ghost flex-1">Back</button>
                    <button onClick={() => setStep(3)} className="btn-primary flex-1">
                      Confirm & Pay <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Payment */}
              {step === 3 && (
                <div className="card p-6">
                  <h2 className="font-bold text-[#111827] text-lg mb-5" style={{ fontFamily: "var(--font-jakarta)" }}>
                    Payment Method
                  </h2>
                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-4 text-sm">
                      {error}
                    </div>
                  )}

                  <div className="space-y-3 mb-6">
                    {[
                      { value: "razorpay", label: "UPI / Card / Net Banking", sub: "Secure payment via Razorpay", badge: "Recommended", emoji: "💳" },
                      { value: "cod", label: "Cash on Delivery", sub: `+₹49 COD handling fee`, emoji: "💵" },
                    ].map((opt) => (
                      <label key={opt.value} className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                        paymentMethod === opt.value ? "border-[#7C3AED] bg-[#EDE9FE]" : "border-[#E5E7EB] bg-white hover:border-[#7C3AED]/50"
                      }`}>
                        <input type="radio" name="payment" value={opt.value} checked={paymentMethod === opt.value} onChange={() => setPaymentMethod(opt.value)} className="accent-[#7C3AED]" />
                        <span className="text-xl">{opt.emoji}</span>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm text-[#111827]">{opt.label}</span>
                            {opt.badge && <span className="badge badge-primary text-xs">{opt.badge}</span>}
                          </div>
                          <p className="text-xs text-[#6B7280]">{opt.sub}</p>
                        </div>
                      </label>
                    ))}
                  </div>

                  <div className="flex gap-3">
                    <button onClick={() => setStep(2)} disabled={loading} className="btn-ghost flex-1">Back</button>
                    <button
                      id="place-order-btn"
                      onClick={handlePlaceOrder}
                      disabled={loading}
                      className="btn-primary flex-1"
                    >
                      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                      {loading ? "Processing…" : `Pay ${formatPrice(grand)}`}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Summary sidebar */}
            <div>
              <div className="card p-5 sticky top-20">
                <h3 className="font-bold text-[#111827] mb-4 text-sm" style={{ fontFamily: "var(--font-jakarta)" }}>Order Summary</h3>
                <div className="space-y-2 text-sm mb-4">
                  <div className="flex justify-between text-[#374151]"><span>Subtotal ({items.length} items)</span><span>{formatPrice(subtotal)}</span></div>
                  {discountAmount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>−{formatPrice(discountAmount)}</span></div>}
                  <div className="flex justify-between text-[#374151]"><span>Shipping</span><span>{shipping === 0 ? "Free" : formatPrice(shipping)}</span></div>
                  {cod > 0 && <div className="flex justify-between text-[#374151]"><span>COD fee</span><span>{formatPrice(cod)}</span></div>}
                  <div className="flex justify-between font-bold text-[#111827] text-base border-t border-[#E5E7EB] pt-2"><span>Total</span><span>{formatPrice(grand)}</span></div>
                </div>
                <div className="space-y-1.5">
                  {["🔒 Secure & encrypted", "📞 24/7 WhatsApp support", "✅ 100% satisfaction guarantee"].map((t) => (
                    <p key={t} className="text-xs text-[#6B7280]">{t}</p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
