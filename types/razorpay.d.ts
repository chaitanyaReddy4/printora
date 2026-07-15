// Global TypeScript types for Razorpay Checkout JS (browser SDK)
// Loaded from https://checkout.razorpay.com/v1/checkout.js

interface RazorpayOptions {
  /** Your Razorpay Key ID (NEXT_PUBLIC_RAZORPAY_KEY_ID) */
  key: string;
  /** Amount in paise (e.g., 50000 = ₹500) */
  amount: number;
  currency: string;
  name: string;
  description?: string;
  image?: string;
  /** Razorpay Order ID from /api/payment/create */
  order_id: string;
  /** Called after successful payment */
  handler: (response: RazorpayPaymentResponse) => void;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  theme?: {
    color?: string;
    backdrop_color?: string;
    hide_topbar?: boolean;
  };
  modal?: {
    /** Called when user closes the modal without paying */
    ondismiss?: () => void;
    confirm_close?: boolean;
    escape?: boolean;
    animation?: boolean;
  };
  config?: {
    display?: {
      blocks?: Record<string, unknown>;
      sequence?: string[];
      preferences?: { show_default_blocks?: boolean };
    };
  };
}

interface RazorpayPaymentResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayInstance {
  open(): void;
  close(): void;
}

interface Window {
  Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
}
