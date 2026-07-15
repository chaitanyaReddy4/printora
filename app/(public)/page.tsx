import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Truck,
  Clock,
  Palette,
  Star,
  Shield,
  Headphones,
  Zap,
  Users,
  Camera,
  CheckCircle2,
  Package,
  Sparkles,
  ChevronRight,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Printora — Print anything. Perfectly.",
  description:
    "Custom printing in Vijayawada. T-shirts, hoodies, mugs, visiting cards, banners & more. Design online, 48hr turnaround, pan-India delivery.",
  openGraph: {
    title: "Printora — Print anything. Perfectly.",
    description:
      "Vijayawada's premier custom printing store. Design online, batch orders, 48hr turnaround.",
  },
};

// ─── Section: Hero ───────────────────────────────────────────────────────────
function HeroSection() {
  return (
    <section className="hero-gradient relative overflow-hidden min-h-[90vh] flex items-center">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-[#7C3AED]/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-[#F59E0B]/5 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-[#7C3AED]/5 blur-3xl" />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <div className="section-container relative z-10 py-20">
        <div className="max-w-4xl mx-auto text-center">
          {/* Pill badge */}
          <div className="inline-flex items-center gap-2 bg-[#7C3AED]/20 border border-[#7C3AED]/30 rounded-full px-4 py-2 mb-8">
            <Sparkles className="w-4 h-4 text-[#A78BFA]" />
            <span className="text-[#A78BFA] text-sm font-medium">
              Vijayawada&apos;s #1 Custom Printing Store
            </span>
          </div>

          <h1
            className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight tracking-tight mb-6"
            style={{ fontFamily: "var(--font-jakarta)" }}
          >
            Print anything.{" "}
            <span className="gradient-text">Perfectly.</span>
          </h1>

          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Your idea. Our craft. Every time. — Custom T-shirts, hoodies,
            visiting cards, banners, mugs & more. Design online in minutes.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
            <Link href="/products" className="btn-primary btn-lg group">
              Start Designing
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/products" className="btn-ghost-white btn-lg">
              View Products
            </Link>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
            {[
              { icon: Clock, text: "48hr Turnaround" },
              { icon: Palette, text: "Free Design Help" },
              { icon: Truck, text: "Pan-India Delivery" },
              { icon: Star, text: "500+ Happy Customers" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2 text-gray-400">
                <Icon className="w-4 h-4 text-[#F59E0B]" />
                <span className="text-sm font-medium">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Section: How It Works ────────────────────────────────────────────────────
function HowItWorksSection() {
  const steps = [
    {
      n: "01",
      icon: Package,
      title: "Choose a product",
      desc: "Browse 13+ product categories from apparel to print media.",
    },
    {
      n: "02",
      icon: Palette,
      title: "Design it",
      desc: "Upload your artwork or use our drag-and-drop design tool.",
    },
    {
      n: "03",
      icon: Zap,
      title: "We print & pack",
      desc: "Premium quality printing with 48-hour express turnaround.",
    },
    {
      n: "04",
      icon: Truck,
      title: "Delivered to you",
      desc: "Fast pan-India shipping with real-time order tracking.",
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="section-container">
        <div className="text-center mb-14">
          <p className="text-[#7C3AED] font-semibold text-sm uppercase tracking-widest mb-3">
            Simple Process
          </p>
          <h2
            className="text-3xl md:text-4xl font-bold text-[#111827]"
            style={{ fontFamily: "var(--font-jakarta)" }}
          >
            From idea to doorstep in 4 steps
          </h2>
        </div>

        <div className="relative">
          {/* Connector line (desktop) */}
          <div className="hidden md:block absolute top-10 left-[12.5%] right-[12.5%] h-0.5 border-t-2 border-dashed border-[#E5E7EB]" />

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {steps.map(({ n, icon: Icon, title, desc }) => (
              <div key={n} className="flex flex-col items-center text-center relative">
                <div className="relative mb-5">
                  <div className="w-20 h-20 bg-[#EDE9FE] rounded-2xl flex items-center justify-center">
                    <Icon className="w-8 h-8 text-[#7C3AED]" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-7 h-7 bg-[#7C3AED] rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">{n.slice(1)}</span>
                  </div>
                </div>
                <h3
                  className="font-bold text-[#111827] text-lg mb-2"
                  style={{ fontFamily: "var(--font-jakarta)" }}
                >
                  {title}
                </h3>
                <p className="text-[#6B7280] text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Section: Category Grid ───────────────────────────────────────────────────
const categories = [
  { name: "T-Shirts", slug: "TSHIRT", emoji: "👕", from: 299 },
  { name: "Hoodies", slug: "HOODIE", emoji: "🧥", from: 899 },
  { name: "Visiting Cards", slug: "VISITING_CARD", emoji: "📇", from: 499 },
  { name: "Banners", slug: "BANNER", emoji: "🎌", from: 799 },
  { name: "Mugs", slug: "MUG", emoji: "☕", from: 249 },
  { name: "Stickers", slug: "STICKER", emoji: "🏷️", from: 199 },
  { name: "Posters", slug: "POSTER", emoji: "🖼️", from: 149 },
  { name: "Flyers", slug: "FLYER", emoji: "📄", from: 399 },
  { name: "Caps", slug: "CAP", emoji: "🧢", from: 349 },
  { name: "Notebooks", slug: "NOTEBOOK", emoji: "📓", from: 349 },
];

function CategoryGridSection() {
  return (
    <section className="py-20 bg-[#F9FAFB]">
      <div className="section-container">
        <div className="text-center mb-12">
          <p className="text-[#7C3AED] font-semibold text-sm uppercase tracking-widest mb-3">
            13+ Product Categories
          </p>
          <h2
            className="text-3xl md:text-4xl font-bold text-[#111827] mb-4"
            style={{ fontFamily: "var(--font-jakarta)" }}
          >
            What do you want to print?
          </h2>
          <p className="text-[#6B7280] max-w-xl mx-auto">
            From apparel to print media — we handle it all with premium quality
            and lightning-fast turnaround.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.map(({ name, slug, emoji, from }) => (
            <Link
              key={slug}
              href={`/products?category=${slug}`}
              className="group bg-white rounded-xl border border-[#E5E7EB] p-5 flex flex-col items-center text-center hover:border-[#7C3AED] hover:shadow-lg hover:shadow-[#7C3AED]/10 hover:-translate-y-1 transition-all duration-200"
            >
              <span className="text-4xl mb-3">{emoji}</span>
              <h3
                className="font-bold text-[#111827] text-sm mb-1 group-hover:text-[#7C3AED] transition-colors"
                style={{ fontFamily: "var(--font-jakarta)" }}
              >
                {name}
              </h3>
              <p className="text-[#6B7280] text-xs mb-3">from ₹{from}</p>
              <span className="text-[#7C3AED] text-xs font-semibold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                Shop Now <ChevronRight className="w-3 h-3" />
              </span>
            </Link>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link href="/products" className="btn-primary">
            View All Products
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

// ─── Section: Design Tool Callout ─────────────────────────────────────────────
function DesignToolSection() {
  const features = [
    "Add text with 100+ fonts",
    "Upload your own artwork (PNG, JPG, PDF, AI)",
    "50+ clipart shapes and icons",
    "Real-time product mockup preview",
  ];

  return (
    <section className="py-20 bg-white overflow-hidden">
      <div className="section-container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: Mock UI */}
          <div className="relative order-2 lg:order-1">
            <div className="relative bg-[#111827] rounded-2xl p-6 shadow-2xl">
              {/* Toolbar mock */}
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <div className="ml-4 flex-1 h-6 bg-white/10 rounded-md flex items-center px-3">
                  <span className="text-gray-400 text-xs">Design Tool — Classic T-Shirt</span>
                </div>
              </div>

              <div className="flex gap-3">
                {/* Left sidebar */}
                <div className="w-12 bg-white/5 rounded-lg p-2 flex flex-col gap-2">
                  {["T", "🖼", "⬛", "★", "🎨"].map((icon, i) => (
                    <div
                      key={i}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs cursor-pointer ${
                        i === 0 ? "bg-[#7C3AED] text-white" : "bg-white/10 text-gray-400 hover:bg-white/20"
                      }`}
                    >
                      {icon}
                    </div>
                  ))}
                </div>

                {/* Canvas */}
                <div className="flex-1 bg-white/5 rounded-xl aspect-square relative flex items-center justify-center">
                  <div className="w-32 h-40 relative">
                    {/* T-shirt silhouette */}
                    <div className="w-full h-full bg-white/20 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-[#7C3AED]" style={{ fontFamily: "var(--font-jakarta)" }}>
                          PRINTORA
                        </div>
                        <div className="text-xs text-white/60 mt-1">Your Design Here</div>
                      </div>
                    </div>
                    {/* Dashed border */}
                    <div className="absolute inset-2 border-2 border-dashed border-[#7C3AED]/40 rounded pointer-events-none" />
                  </div>
                </div>

                {/* Right sidebar */}
                <div className="w-24 bg-white/5 rounded-lg p-3">
                  <p className="text-gray-400 text-xs mb-2">Font</p>
                  <div className="bg-white/10 rounded p-1.5 mb-2">
                    <span className="text-white text-xs">Jakarta Sans</span>
                  </div>
                  <p className="text-gray-400 text-xs mb-2">Size</p>
                  <div className="bg-white/10 rounded p-1.5 mb-2">
                    <span className="text-white text-xs">32px</span>
                  </div>
                  <p className="text-gray-400 text-xs mb-2">Color</p>
                  <div className="flex gap-1 flex-wrap">
                    {["#7C3AED", "#111827", "#F59E0B", "#EF4444"].map((c) => (
                      <div
                        key={c}
                        className="w-5 h-5 rounded-full border-2 border-white/20 cursor-pointer"
                        style={{ background: c }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom bar */}
              <div className="flex items-center justify-between mt-4">
                <div className="flex gap-2">
                  <div className="px-3 py-1.5 bg-white/10 rounded-lg text-gray-400 text-xs">↩ Undo</div>
                  <div className="px-3 py-1.5 bg-white/10 rounded-lg text-gray-400 text-xs">↪ Redo</div>
                </div>
                <div className="px-4 py-1.5 bg-[#7C3AED] rounded-lg text-white text-xs font-semibold">
                  Add to Cart
                </div>
              </div>
            </div>

            {/* Floating badges */}
            <div className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-lg px-4 py-3 border border-[#E5E7EB]">
              <p className="text-xs font-semibold text-[#111827]">✓ Design saved!</p>
              <p className="text-xs text-[#6B7280]">Auto-saved to Cloudinary</p>
            </div>
            <div className="absolute -top-4 -right-4 bg-[#7C3AED] rounded-xl shadow-lg px-4 py-3 text-white">
              <p className="text-xs font-bold">50+ Clipart</p>
              <p className="text-xs text-[#EDE9FE]">shapes & icons</p>
            </div>
          </div>

          {/* Right: Content */}
          <div className="order-1 lg:order-2">
            <p className="text-[#7C3AED] font-semibold text-sm uppercase tracking-widest mb-4">
              Online Design Tool
            </p>
            <h2
              className="text-3xl md:text-4xl font-bold text-[#111827] mb-5 leading-tight"
              style={{ fontFamily: "var(--font-jakarta)" }}
            >
              Design it yourself —{" "}
              <span className="text-[#7C3AED]">live</span>
            </h2>
            <p className="text-[#6B7280] text-lg mb-8 leading-relaxed">
              Our powerful Fabric.js canvas lets you design directly on product
              mockups. No Photoshop needed — drag, drop, and print.
            </p>

            <ul className="space-y-4 mb-8">
              {features.map((f) => (
                <li key={f} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#7C3AED] flex-shrink-0 mt-0.5" />
                  <span className="text-[#374151]">{f}</span>
                </li>
              ))}
            </ul>

            <Link href="/products" className="btn-primary btn-lg">
              Try the Design Tool
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Section: Batch Orders ────────────────────────────────────────────────────
function BatchOrdersSection() {
  const steps = [
    { icon: "📋", label: "Create batch" },
    { icon: "🔗", label: "Share link" },
    { icon: "📸", label: "Group uploads" },
    { icon: "🎨", label: "We design" },
    { icon: "🛒", label: "You order" },
  ];

  const useCases = [
    { emoji: "🎓", label: "Graduation" },
    { emoji: "🏢", label: "Office Teams" },
    { emoji: "⚽", label: "Sports Clubs" },
    { emoji: "🎪", label: "College Fests" },
  ];

  return (
    <section className="py-20 bg-[#111827] relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#7C3AED]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#F59E0B]/5 rounded-full blur-3xl" />
      </div>

      <div className="section-container relative z-10">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-[#F59E0B]/10 border border-[#F59E0B]/20 rounded-full px-4 py-2 mb-6">
            <Users className="w-4 h-4 text-[#F59E0B]" />
            <span className="text-[#F59E0B] text-sm font-medium">Batch Orders</span>
          </div>
          <h2
            className="text-3xl md:text-4xl font-bold text-white mb-4"
            style={{ fontFamily: "var(--font-jakarta)" }}
          >
            Group orders, made effortless.
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            Share a link. Everyone submits their photo. We design a beautiful
            mosaic layout. You order in one click.
          </p>
        </div>

        {/* Flow steps */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
          {steps.map((step, i) => (
            <div key={step.label} className="flex items-center gap-3">
              <div className="flex flex-col items-center gap-2">
                <div className="w-14 h-14 bg-white/5 rounded-xl flex items-center justify-center text-2xl border border-white/10">
                  {step.icon}
                </div>
                <span className="text-gray-400 text-xs font-medium">{step.label}</span>
              </div>
              {i < steps.length - 1 && (
                <ArrowRight className="w-5 h-5 text-gray-600 hidden sm:block" />
              )}
            </div>
          ))}
        </div>

        {/* Use cases */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
          {useCases.map(({ emoji, label }) => (
            <div
              key={label}
              className="glass-card px-5 py-3 flex items-center gap-2"
            >
              <span className="text-xl">{emoji}</span>
              <span className="text-white font-medium text-sm">{label}</span>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Link href="/batch/create" className="btn-gold btn-lg">
            <Camera className="w-5 h-5" />
            Create a Batch Order
          </Link>
        </div>
      </div>
    </section>
  );
}

// ─── Section: Why Printora ────────────────────────────────────────────────────
function WhyPrintoraSection() {
  const reasons = [
    {
      icon: Palette,
      title: "Free Design Assistance",
      desc: "Our designers help you perfect your artwork at no extra cost.",
      color: "#7C3AED",
      bg: "#EDE9FE",
    },
    {
      icon: Zap,
      title: "48-Hour Express Printing",
      desc: "Urgent orders delivered in as little as 48 hours.",
      color: "#F59E0B",
      bg: "#FEF3C7",
    },
    {
      icon: Package,
      title: "Live Order Tracking",
      desc: "7-stage visual tracker so you know exactly where your order is.",
      color: "#10B981",
      bg: "#D1FAE5",
    },
    {
      icon: Shield,
      title: "100% Satisfaction Guarantee",
      desc: "Not happy? We reprint or refund. No questions asked.",
      color: "#3B82F6",
      bg: "#DBEAFE",
    },
    {
      icon: Truck,
      title: "Pan-India Shipping",
      desc: "Fast, reliable delivery to every corner of India.",
      color: "#EF4444",
      bg: "#FEE2E2",
    },
    {
      icon: Headphones,
      title: "WhatsApp Support 24/7",
      desc: "Chat with us on WhatsApp — instant replies, human support.",
      color: "#25D366",
      bg: "#DCFCE7",
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="section-container">
        <div className="text-center mb-14">
          <p className="text-[#7C3AED] font-semibold text-sm uppercase tracking-widest mb-3">
            Why Choose Us
          </p>
          <h2
            className="text-3xl md:text-4xl font-bold text-[#111827]"
            style={{ fontFamily: "var(--font-jakarta)" }}
          >
            Printora vs. the rest
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reasons.map(({ icon: Icon, title, desc, color, bg }) => (
            <div
              key={title}
              className="card card-hover p-6 group"
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                style={{ background: bg }}
              >
                <Icon className="w-6 h-6" style={{ color }} />
              </div>
              <h3
                className="font-bold text-[#111827] text-lg mb-2"
                style={{ fontFamily: "var(--font-jakarta)" }}
              >
                {title}
              </h3>
              <p className="text-[#6B7280] text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Section: Testimonials ────────────────────────────────────────────────────
function TestimonialsSection() {
  const testimonials = [
    {
      name: "Arjun Sharma",
      city: "Vijayawada",
      text: "Ordered 50 t-shirts for our college fest. Printora delivered in 36 hours with perfect quality. The online design tool is incredibly easy to use!",
      rating: 5,
      role: "Event Coordinator",
    },
    {
      name: "Priya Reddy",
      city: "Hyderabad",
      text: "The batch order feature is genius! I shared the link with my entire team, they uploaded their photos, and Printora handled everything. 10/10.",
      rating: 5,
      role: "HR Manager",
    },
    {
      name: "Karthik Nair",
      city: "Vijayawada",
      text: "Got 500 visiting cards printed with a complex design. The print quality was exceptional and delivery was super fast. Will definitely order again.",
      rating: 5,
      role: "Entrepreneur",
    },
  ];

  return (
    <section className="py-20 bg-[#EDE9FE]">
      <div className="section-container">
        <div className="text-center mb-12">
          <p className="text-[#7C3AED] font-semibold text-sm uppercase tracking-widest mb-3">
            Customer Stories
          </p>
          <h2
            className="text-3xl md:text-4xl font-bold text-[#111827]"
            style={{ fontFamily: "var(--font-jakarta)" }}
          >
            500+ happy customers
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map(({ name, city, text, rating, role }) => (
            <div key={name} className="bg-white rounded-2xl p-7 shadow-sm border border-[#E5E7EB] flex flex-col">
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: rating }).map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-[#F59E0B] text-[#F59E0B]" />
                ))}
              </div>
              <p className="text-[#374151] leading-relaxed mb-6 flex-1">
                &quot;{text}&quot;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#7C3AED] rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {name[0]}
                </div>
                <div>
                  <p className="font-semibold text-[#111827] text-sm">{name}</p>
                  <p className="text-[#6B7280] text-xs">{role} · {city}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Section: Gallery ─────────────────────────────────────────────────────────
function GallerySection() {
  const items = [
    { label: "Custom T-Shirts", emoji: "👕", bg: "#EDE9FE", accent: "#7C3AED" },
    { label: "Visiting Cards", emoji: "📇", bg: "#FEF3C7", accent: "#D97706" },
    { label: "Group Hoodies", emoji: "🧥", bg: "#D1FAE5", accent: "#059669" },
    { label: "Ceramic Mugs", emoji: "☕", bg: "#DBEAFE", accent: "#2563EB" },
    { label: "Vinyl Banners", emoji: "🎌", bg: "#FEE2E2", accent: "#DC2626" },
    { label: "Glossy Stickers", emoji: "🏷️", bg: "#FCE7F3", accent: "#BE185D" },
    { label: "Event Caps", emoji: "🧢", bg: "#ECFDF5", accent: "#047857" },
    { label: "A3 Posters", emoji: "🖼️", bg: "#F3F4F6", accent: "#374151" },
    { label: "Spiral Notebooks", emoji: "📓", bg: "#EDE9FE", accent: "#7C3AED" },
  ];

  return (
    <section className="py-20 bg-[#F9FAFB]">
      <div className="section-container">
        <div className="text-center mb-12">
          <p className="text-[#7C3AED] font-semibold text-sm uppercase tracking-widest mb-3">
            Our Work
          </p>
          <h2
            className="text-3xl md:text-4xl font-bold text-[#111827]"
            style={{ fontFamily: "var(--font-jakarta)" }}
          >
            Our recent prints
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {items.map(({ label, emoji, bg, accent }, i) => (
            <div
              key={label}
              className={`relative group rounded-2xl overflow-hidden cursor-pointer ${i === 0 || i === 8 ? "md:row-span-1" : ""}`}
              style={{ background: bg, aspectRatio: i % 3 === 0 ? "4/3" : "1/1" }}
            >
              <div className="w-full h-full flex items-center justify-center p-8 min-h-[180px]">
                <span className="text-7xl group-hover:scale-110 transition-transform duration-300">
                  {emoji}
                </span>
              </div>
              {/* Overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors duration-300 flex items-end p-5">
                <div className="transform translate-y-full group-hover:translate-y-0 transition-transform duration-300 w-full">
                  <p className="text-white font-bold text-sm mb-2" style={{ fontFamily: "var(--font-jakarta)" }}>
                    {label}
                  </p>
                  <Link
                    href="/products"
                    className="inline-flex items-center gap-1.5 bg-white text-[#111827] text-xs font-semibold px-4 py-2 rounded-full"
                    style={{ color: accent }}
                  >
                    Order Similar <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function HomePage() {
  return (
    <>
      <HeroSection />
      <HowItWorksSection />
      <CategoryGridSection />
      <DesignToolSection />
      <BatchOrdersSection />
      <WhyPrintoraSection />
      <TestimonialsSection />
      <GallerySection />
    </>
  );
}
