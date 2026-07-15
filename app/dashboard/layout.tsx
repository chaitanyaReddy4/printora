import Providers from "@/components/Providers";
import Navbar from "@/components/layout/Navbar";
import Link from "next/link";
import { Package, User, Users, LogOut } from "lucide-react";

const dashLinks = [
  { href: "/dashboard", label: "My Orders", icon: Package },
  { href: "/dashboard/batches", label: "Batch Orders", icon: Users },
  { href: "/dashboard/profile", label: "Profile", icon: User },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <Navbar />
      <div className="bg-[#F9FAFB] min-h-screen">
        <div className="section-container py-8">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Sidebar */}
            <aside className="w-full md:w-56 flex-shrink-0">
              <nav className="card p-3 space-y-1 sticky top-20">
                {dashLinks.map(({ href, label, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#374151] hover:bg-[#EDE9FE] hover:text-[#7C3AED] transition-colors group"
                  >
                    <Icon className="w-4 h-4 text-[#9CA3AF] group-hover:text-[#7C3AED]" />
                    {label}
                  </Link>
                ))}
              </nav>
            </aside>

            {/* Content */}
            <main className="flex-1 min-w-0">{children}</main>
          </div>
        </div>
      </div>
    </Providers>
  );
}
