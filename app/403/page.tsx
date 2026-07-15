import Link from "next/link";
import { ShieldX } from "lucide-react";

export default function ForbiddenPage() {
  return (
    <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center p-4">
      <div className="text-center max-w-sm">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShieldX className="w-10 h-10 text-red-600" />
        </div>
        <h1 className="text-5xl font-bold text-[#111827] mb-3" style={{ fontFamily: "var(--font-jakarta)" }}>403</h1>
        <h2 className="text-xl font-semibold text-[#374151] mb-3">Access Denied</h2>
        <p className="text-[#6B7280] mb-8">You don&apos;t have permission to view this page.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/" className="btn-primary">Go Home</Link>
          <Link href="/dashboard" className="btn-ghost">My Dashboard</Link>
        </div>
      </div>
    </div>
  );
}
