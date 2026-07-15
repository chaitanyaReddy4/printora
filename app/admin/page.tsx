import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { Package, ShoppingBag, Users, TrendingUp, Clock, CheckCircle2, Truck } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

async function getStats() {
  const [
    totalOrders, totalRevenue, pendingOrders, dispatchedOrders,
    totalProducts, totalUsers, recentOrders
  ] = await Promise.all([
    prisma.order.count(),
    prisma.order.aggregate({ _sum: { totalAmount: true }, where: { paymentStatus: "PAID" } }),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.order.count({ where: { status: "DISPATCHED" } }),
    prisma.product.count({ where: { isActive: true } }),
    prisma.user.count(),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      include: {
        items: { include: { product: { select: { name: true } } } },
        user: { select: { name: true, email: true } },
      },
    }),
  ]);
  return { totalOrders, totalRevenue: totalRevenue._sum.totalAmount ?? 0, pendingOrders, dispatchedOrders, totalProducts, totalUsers, recentOrders };
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: "badge-amber", CONFIRMED: "badge-blue", DESIGN_REVIEW: "badge-purple",
  IN_PRODUCTION: "badge-purple", QUALITY_CHECK: "badge-teal",
  DISPATCHED: "badge-teal", DELIVERED: "badge-green", CANCELLED: "badge-red",
};

export default async function AdminDashboardPage() {
  const stats = await getStats();

  const statCards = [
    { label: "Total Revenue", value: formatPrice(stats.totalRevenue), icon: TrendingUp, color: "bg-[#EDE9FE]", iconColor: "text-[#7C3AED]" },
    { label: "Total Orders", value: stats.totalOrders, icon: Package, color: "bg-[#DBEAFE]", iconColor: "text-blue-600" },
    { label: "Pending Orders", value: stats.pendingOrders, icon: Clock, color: "bg-[#FEF3C7]", iconColor: "text-amber-600", href: "/admin/orders?status=PENDING" },
    { label: "Dispatched", value: stats.dispatchedOrders, icon: Truck, color: "bg-[#D1FAE5]", iconColor: "text-green-600", href: "/admin/orders?status=DISPATCHED" },
    { label: "Active Products", value: stats.totalProducts, icon: ShoppingBag, color: "bg-[#FEE2E2]", iconColor: "text-red-600", href: "/admin/products" },
    { label: "Total Users", value: stats.totalUsers, icon: Users, color: "bg-[#F3F4F6]", iconColor: "text-gray-600" },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#111827]" style={{ fontFamily: "var(--font-jakarta)" }}>
          Admin Dashboard
        </h1>
        <p className="text-[#6B7280] text-sm mt-1">Overview of Printora operations</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {statCards.map(({ label, value, icon: Icon, color, iconColor, href }) => {
          const card = (
            <div className={`card p-5 ${href ? "hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer" : ""}`}>
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${iconColor}`} />
                </div>
              </div>
              <p className="text-2xl font-bold text-[#111827]">{value}</p>
              <p className="text-xs text-[#6B7280] mt-0.5">{label}</p>
            </div>
          );
          return href ? <Link key={label} href={href}>{card}</Link> : <div key={label}>{card}</div>;
        })}
      </div>

      {/* Recent orders */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-[#E5E7EB]">
          <h2 className="font-bold text-[#111827]" style={{ fontFamily: "var(--font-jakarta)" }}>Recent Orders</h2>
          <Link href="/admin/orders" className="text-sm text-[#7C3AED] hover:underline font-medium">View all →</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#F9FAFB]">
                <th className="text-left px-5 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Order</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Customer</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Status</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3F4F6]">
              {stats.recentOrders.map((order: { id: string; orderNumber: string; status: string; totalAmount: number; guestEmail?: string | null; user?: { name?: string | null; email?: string | null } | null; items: { product: { name: string } }[] }) => (
                <tr key={order.id} className="hover:bg-[#F9FAFB] transition-colors">
                  <td className="px-5 py-3">
                    <Link href={`/admin/orders/${order.id}`} className="font-mono text-xs font-bold text-[#7C3AED] hover:underline">
                      #{order.orderNumber}
                    </Link>
                    <p className="text-xs text-[#9CA3AF] truncate max-w-[140px]">
                      {order.items[0]?.product.name}{order.items.length > 1 ? ` +${order.items.length - 1}` : ""}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-[#111827] text-xs">{order.user?.name ?? "Guest"}</p>
                    <p className="text-xs text-[#9CA3AF] truncate max-w-[140px]">{order.user?.email ?? order.guestEmail ?? ""}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge text-xs ${STATUS_COLORS[order.status] ?? "badge-gray"}`}>
                      {order.status.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right font-bold text-[#111827] text-sm">
                    {formatPrice(order.totalAmount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
