import Link from "next/link";
import { Printer } from "lucide-react";
import Providers from "@/components/Providers";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <div className="min-h-screen bg-[#F9FAFB] flex flex-col">
        {/* Top bar */}
        <div className="bg-[#111827] py-4 px-6">
          <Link href="/" className="flex items-center gap-2.5 w-fit">
            <div className="w-8 h-8 bg-[#7C3AED] rounded-xl flex items-center justify-center">
              <Printer className="w-4 h-4 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-white font-bold text-lg" style={{ fontFamily: "var(--font-jakarta)" }}>
              Printora
            </span>
          </Link>
        </div>
        {/* Content */}
        <div className="flex-1 flex items-center justify-center p-4">{children}</div>
      </div>
    </Providers>
  );
}
