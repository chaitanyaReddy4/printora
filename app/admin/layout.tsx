import Providers from "@/components/Providers";
import Navbar from "@/components/layout/Navbar";
import Link from "next/link";
import {
  LayoutDashboard, Package, ShoppingBag, Users, Tag, Settings
} from "lucide-react";

const adminLinks = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Orders", icon: Package },
  { href: "/admin/products", label: "Products", icon: ShoppingBag },
  { href: "/admin/batches", label: "Batch Orders", icon: Users },
  { href: "/admin/promo", label: "Promo Codes", icon: Tag },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <Navbar />
      <div className="flex min-h-screen bg-[#F9FAFB]">
        {/* Sidebar */}
        <aside className="hidden md:flex flex-col w-56 bg-[#111827] min-h-screen flex-shrink-0">
          <div className="p-4 border-b border-white/10">
            <span className="text-white text-xs font-semibold uppercase tracking-widest">Admin Panel</span>
          </div>
          <nav className="p-3 space-y-1 flex-1">
            {adminLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:bg-white/5 hover:text-white transition-colors group"
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
          </nav>
          <div className="p-4 border-t border-white/10">
            <span className="badge badge-purple text-xs">Admin Mode</span>
          </div>
        </aside>

        {/* Mobile nav */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#111827] border-t border-white/10 z-40 flex">
          {adminLinks.slice(0, 5).map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} className="flex-1 flex flex-col items-center gap-1 py-2 text-gray-400 hover:text-white transition-colors">
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          ))}
        </div>

        {/* Content */}
        <main className="flex-1 p-6 md:p-8 pb-20 md:pb-8 min-w-0">{children}</main>
      </div>
    </Providers>
  );
}
