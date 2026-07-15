"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Users, Calendar, Hash, FileText, ArrowRight, Loader2, CheckCircle2, Copy } from "lucide-react";

const PRODUCT_TYPES = [
  "T-Shirts", "Hoodies", "Polo Shirts", "Mugs", "Visiting Cards", "Caps", "Notebooks", "Other"
];

export default function CreateBatchPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [form, setForm] = useState({
    title: "",
    description: "",
    productType: "T-Shirts",
    expectedCount: 10,
    deadline: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [created, setCreated] = useState<{ batchCode: string; id: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const set = (f: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [f]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!session?.user) { router.push("/login?callbackUrl=/batch/create"); return; }
    if (!form.deadline) { setError("Please set a submission deadline."); return; }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, expectedCount: Number(form.expectedCount) }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Failed to create batch."); return; }
      setCreated({ batchCode: data.batch.batchCode, id: data.batch.id });
    } catch { setError("Something went wrong."); }
    finally { setLoading(false); }
  }

  function copyLink() {
    if (!created) return;
    const url = `${window.location.origin}/batch/${created.batchCode}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (created) {
    const shareUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/batch/${created.batchCode}`;
    return (
      <div className="section-container max-w-lg py-20 text-center">
        <div className="card p-10">
          <div className="w-16 h-16 bg-[#D1FAE5] rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="w-9 h-9 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-[#111827] mb-2" style={{ fontFamily: "var(--font-jakarta)" }}>
            Batch Created! 🎉
          </h2>
          <p className="text-[#6B7280] mb-6">Share this link with your group to collect photos</p>

          <div className="bg-[#EDE9FE] rounded-xl p-4 mb-4">
            <p className="text-xs text-[#6B7280] mb-1">Batch Code</p>
            <p className="text-3xl font-mono font-bold text-[#7C3AED] tracking-widest">{created.batchCode}</p>
          </div>

          <div className="flex items-center gap-2 bg-[#F9FAFB] rounded-xl p-3 mb-5 text-left">
            <p className="text-xs text-[#374151] flex-1 truncate font-mono">{shareUrl}</p>
            <button onClick={copyLink} className="btn-ghost btn-sm flex-shrink-0">
              {copied ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>

          <div className="flex flex-col gap-3">
            <Link href={`/batch/${created.batchCode}`} className="btn-primary w-full justify-center">
              View Batch Page <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/dashboard/batches" className="btn-ghost w-full justify-center">
              My Batches
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F9FAFB] min-h-screen">
      {/* Header */}
      <div className="bg-[#111827] py-12">
        <div className="section-container max-w-2xl">
          <h1 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: "var(--font-jakarta)" }}>
            Create a Batch Order 📸
          </h1>
          <p className="text-gray-400">
            Share a link — everyone submits their photo. We design & you order in one click.
          </p>
        </div>
      </div>

      <div className="section-container max-w-2xl py-10">
        <div className="card p-7">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-5 text-sm">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label" htmlFor="batch-title">Batch Title *</label>
              <input
                id="batch-title" type="text" value={form.title} onChange={set("title")}
                className="input" placeholder="e.g. Class of 2025 Graduation Hoodies" required maxLength={120}
              />
            </div>

            <div>
              <label className="label" htmlFor="batch-desc">Description <span className="font-normal text-[#9CA3AF]">(optional)</span></label>
              <textarea
                id="batch-desc" value={form.description} onChange={set("description")}
                className="input resize-none" rows={3}
                placeholder="Tell participants what to submit and any specific requirements…"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label" htmlFor="batch-product">Product Type *</label>
                <select id="batch-product" value={form.productType} onChange={set("productType")} className="input">
                  {PRODUCT_TYPES.map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="label" htmlFor="batch-count">Expected Participants *</label>
                <input
                  id="batch-count" type="number" value={form.expectedCount} onChange={set("expectedCount")}
                  className="input" min={2} max={500} required
                />
              </div>
            </div>

            <div>
              <label className="label" htmlFor="batch-deadline">Submission Deadline *</label>
              <input
                id="batch-deadline" type="datetime-local" value={form.deadline} onChange={set("deadline")}
                className="input" required min={new Date().toISOString().slice(0, 16)}
              />
            </div>

            {/* How it works */}
            <div className="bg-[#EDE9FE] rounded-xl p-5">
              <p className="font-semibold text-[#7C3AED] text-sm mb-3">How Batch Orders Work</p>
              <div className="space-y-2">
                {[
                  "Create your batch and get a unique shareable link",
                  "Share the link — each person submits their name & photo",
                  "Our team designs a beautiful mosaic/collage layout",
                  "Review and place your order with bulk pricing",
                ].map((step, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-[#374151]">
                    <div className="w-5 h-5 rounded-full bg-[#7C3AED] text-white text-xs flex items-center justify-center font-bold flex-shrink-0">
                      {i + 1}
                    </div>
                    {step}
                  </div>
                ))}
              </div>
            </div>

            <button
              id="create-batch-btn" type="submit" disabled={loading}
              className="btn-primary w-full btn-lg"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Users className="w-5 h-5" />}
              {loading ? "Creating Batch…" : "Create Batch & Get Link"}
            </button>

            {!session?.user && (
              <p className="text-center text-sm text-[#6B7280]">
                You&apos;ll be asked to sign in before creating.
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
