"use client";

import { getWhatsAppUrl } from "@/lib/utils";
import { MessageCircle } from "lucide-react";

export default function WhatsAppButton() {
  const url = getWhatsAppUrl(
    "Hi Printora! I'd like to place a custom print order. Can you help me?"
  );

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      id="whatsapp-float-btn"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-[#25D366] rounded-full flex items-center justify-center shadow-lg shadow-[#25D366]/40 hover:scale-110 transition-transform whatsapp-float"
    >
      <MessageCircle className="w-7 h-7 text-white fill-white" />
    </a>
  );
}
