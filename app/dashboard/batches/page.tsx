"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Users, Copy, CheckCircle2, Clock, ChevronRight, Plus } from "lucide-react";
import { formatDateTime } from "@/lib/utils";

interface Batch {
  id: string; batchCode: string; title: string; productType: string;
  status: string; expectedCount: number; deadline: string;
  _count: { submissions: number };
}

export default function DashboardBatchesPage() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/batch")
      .then(r => r.json())
      .then(d => setBatches(d.batches ?? []))
      .finally(() => setLoading(false));
  }, []);

  function copyLink(code: string) {
    navigator.clipboard.writeText(`${window.location.origin}/batch/${code}`);
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  }

  const STATUS_COLOR: Record<string, string> = {
    COLLECTING: "badge-green", CLOSED: "badge-gray", ORDERED: "badge-blue",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#111827]" style={{ fontFamily: "var(--font-jakarta)" }}>
          Batch Orders
        </h1>
        <Link href="/batch/create" className="btn-primary btn-sm">
          <Plus className="w-4 h-4" /> New Batch
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="card p-5 skeleton h-24" />)}
        </div>
      ) : batches.length === 0 ? (
        <div className="card p-12 text-center">
          <Users className="w-12 h-12 text-[#E5E7EB] mx-auto mb-4" />
          <h3 className="font-bold text-[#111827] mb-2" style={{ fontFamily: "var(--font-jakarta)" }}>No batch orders yet</h3>
          <p className="text-[#6B7280] text-sm mb-5">Collect group photos from your team and place one big order.</p>
          <Link href="/batch/create" className="btn-primary btn-sm">Create First Batch</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {batches.map(batch => {
            const expired = new Date() > new Date(batch.deadline);
            const progress = Math.min(100, Math.round((batch._count.submissions / batch.expectedCount) * 100));
            return (
              <div key={batch.id} className="card p-5">
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 bg-[#EDE9FE] rounded-xl flex items-center justify-center flex-shrink-0">
                    <Users className="w-5 h-5 text-[#7C3AED]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-semibold text-[#111827] text-sm" style={{ fontFamily: "var(--font-jakarta)" }}>
                        {batch.title}
                      </h3>
                      <span className={`badge text-xs ${STATUS_COLOR[batch.status] ?? "badge-gray"}`}>{batch.status}</span>
                      {expired && batch.status === "COLLECTING" && (
                        <span className="badge badge-red text-xs">Expired</span>
                      )}
                    </div>
                    <p className="text-xs text-[#6B7280] mb-2">{batch.productType} · Code: <span className="font-mono font-bold text-[#7C3AED]">{batch.batchCode}</span></p>

                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex-1 h-1.5 bg-[#E5E7EB] rounded-full overflow-hidden">
                        <div className="h-full bg-[#7C3AED] rounded-full transition-all" style={{ width: `${progress}%` }} />
                      </div>
                      <span className="text-xs text-[#6B7280] flex-shrink-0">
                        {batch._count.submissions}/{batch.expectedCount}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-[#9CA3AF]">
                      <Clock className="w-3 h-3" />
                      <span>Deadline: {formatDateTime(batch.deadline)}</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 flex-shrink-0">
                    <button
                      onClick={() => copyLink(batch.batchCode)}
                      className="btn-ghost btn-sm"
                    >
                      {copied === batch.batchCode ? <CheckCircle2 className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                      {copied === batch.batchCode ? "Copied!" : "Copy Link"}
                    </button>
                    <Link href={`/batch/${batch.batchCode}`} className="btn-ghost btn-sm justify-center">
                      View <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
