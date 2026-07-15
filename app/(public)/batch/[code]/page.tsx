"use client";

import { use, useEffect, useState } from "react";
import { Upload, CheckCircle2, Loader2, Clock, Users, X } from "lucide-react";
import { formatDateTime } from "@/lib/utils";

interface BatchSubmission { id: string; name: string; rollNumber?: string; photoUrl: string; submittedAt: string; }
interface Batch {
  id: string; batchCode: string; title: string; description?: string;
  productType: string; expectedCount: number; deadline: string; status: string;
  organizer?: { name?: string };
  submissions: BatchSubmission[];
}

export default function BatchPublicPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  const [batch, setBatch] = useState<Batch | null>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetch(`/api/batch/${code}/submit`)
      .then(r => r.json())
      .then(d => setBatch(d.batch ?? null))
      .finally(() => setLoading(false));
  }, [code]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { setError("Please enter your name."); return; }
    if (!photoFile) { setError("Please upload your photo."); return; }
    setError("");
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", photoFile);
      fd.append("folder", `printora/batch/${code}`);
      const upRes = await fetch("/api/upload", { method: "POST", body: fd });
      const upData = await upRes.json();
      if (!upRes.ok || !upData.url) { setError("Photo upload failed. Please try again."); return; }
      setUploading(false);
      setSubmitting(true);
      const subRes = await fetch(`/api/batch/${code}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), rollNumber: rollNumber.trim() || undefined, photoUrl: upData.url }),
      });
      const subData = await subRes.json();
      if (!subRes.ok) { setError(subData.error ?? "Submission failed."); return; }
      setSubmitted(true);
    } catch { setError("Something went wrong. Please try again."); }
    finally { setUploading(false); setSubmitting(false); }
  }

  if (loading) {
    return (
      <div className="section-container py-20 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#7C3AED] mx-auto" />
      </div>
    );
  }

  if (!batch) {
    return (
      <div className="section-container py-20 text-center">
        <div className="text-5xl mb-4">😕</div>
        <h2 className="text-2xl font-bold text-[#111827] mb-2" style={{ fontFamily: "var(--font-jakarta)" }}>Batch not found</h2>
        <p className="text-[#6B7280]">Check the link and try again.</p>
      </div>
    );
  }

  const deadline = new Date(batch.deadline);
  const isExpired = new Date() > deadline;
  const isClosed = batch.status !== "COLLECTING" || isExpired;
  const submissionCount = batch.submissions.length;
  const progress = Math.min(100, Math.round((submissionCount / batch.expectedCount) * 100));

  if (submitted) {
    return (
      <div className="section-container max-w-md py-20 text-center">
        <div className="card p-10">
          <div className="w-16 h-16 bg-[#D1FAE5] rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="w-9 h-9 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-[#111827] mb-2" style={{ fontFamily: "var(--font-jakarta)" }}>Submitted! 🎉</h2>
          <p className="text-[#6B7280]">
            Your photo has been added to <strong>{batch.title}</strong>. You&apos;ll be notified when the order is placed.
          </p>
          <p className="text-sm text-[#9CA3AF] mt-4">{submissionCount + 1} of {batch.expectedCount} submitted</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F9FAFB] min-h-screen">
      {/* Header */}
      <div className="bg-[#111827] py-10">
        <div className="section-container max-w-xl text-center">
          <div className="inline-flex items-center gap-2 bg-[#7C3AED]/20 border border-[#7C3AED]/30 rounded-full px-4 py-1.5 mb-4">
            <span className="font-mono font-bold text-[#A78BFA] text-sm">{batch.batchCode}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2" style={{ fontFamily: "var(--font-jakarta)" }}>
            {batch.title}
          </h1>
          {batch.description && <p className="text-gray-400 text-sm">{batch.description}</p>}
          {batch.organizer?.name && <p className="text-gray-500 text-xs mt-2">Organised by {batch.organizer.name}</p>}
        </div>
      </div>

      <div className="section-container max-w-xl py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="card p-4 text-center">
            <Users className="w-5 h-5 text-[#7C3AED] mx-auto mb-1" />
            <p className="text-2xl font-bold text-[#111827]">{submissionCount}<span className="text-sm text-[#6B7280] font-normal">/{batch.expectedCount}</span></p>
            <p className="text-xs text-[#6B7280]">Submitted</p>
            <div className="w-full bg-[#E5E7EB] rounded-full h-1.5 mt-2">
              <div className="bg-[#7C3AED] h-1.5 rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>
          <div className="card p-4 text-center">
            <Clock className="w-5 h-5 text-[#F59E0B] mx-auto mb-1" />
            <p className="text-sm font-bold text-[#111827]">{isExpired ? "Closed" : formatDateTime(batch.deadline)}</p>
            <p className="text-xs text-[#6B7280]">{isExpired ? "Deadline passed" : "Deadline"}</p>
          </div>
        </div>

        {/* Submission form */}
        {isClosed ? (
          <div className="card p-8 text-center">
            <p className="text-4xl mb-3">🔒</p>
            <h3 className="font-bold text-[#111827] text-lg mb-2" style={{ fontFamily: "var(--font-jakarta)" }}>Submissions Closed</h3>
            <p className="text-[#6B7280] text-sm">
              {isExpired ? "The submission deadline has passed." : "This batch is no longer accepting submissions."}
            </p>
          </div>
        ) : (
          <div className="card p-6">
            <h2 className="font-bold text-[#111827] mb-5" style={{ fontFamily: "var(--font-jakarta)" }}>
              Submit Your Photo for {batch.productType}
            </h2>

            {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-4 text-sm">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label" htmlFor="sub-name">Your Name *</label>
                <input id="sub-name" type="text" value={name} onChange={e => setName(e.target.value)} className="input" placeholder="Arjun Sharma" required />
              </div>
              <div>
                <label className="label" htmlFor="sub-roll">Roll Number / ID <span className="font-normal text-[#9CA3AF]">(optional)</span></label>
                <input id="sub-roll" type="text" value={rollNumber} onChange={e => setRollNumber(e.target.value)} className="input" placeholder="e.g. 22CS001" />
              </div>
              <div>
                <label className="label">Your Photo *</label>
                {photoPreview ? (
                  <div className="relative">
                    <img src={photoPreview} alt="Preview" className="w-full h-48 object-cover rounded-xl border border-[#E5E7EB]" />
                    <button
                      type="button"
                      onClick={() => { setPhotoFile(null); setPhotoPreview(null); }}
                      className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center border-2 border-dashed border-[#E5E7EB] rounded-xl p-8 cursor-pointer hover:border-[#7C3AED] hover:bg-[#EDE9FE]/20 transition-colors">
                    <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" required />
                    <Upload className="w-8 h-8 text-[#9CA3AF] mb-2" />
                    <p className="text-sm font-medium text-[#374151]">Click to upload photo</p>
                    <p className="text-xs text-[#9CA3AF] mt-1">JPG, PNG — clear face photo preferred</p>
                  </label>
                )}
              </div>

              <button type="submit" disabled={uploading || submitting} className="btn-primary w-full">
                {(uploading || submitting) && <Loader2 className="w-4 h-4 animate-spin" />}
                {uploading ? "Uploading photo…" : submitting ? "Submitting…" : "Submit My Photo"}
              </button>
            </form>
          </div>
        )}

        {/* Submitted photos grid */}
        {batch.submissions.length > 0 && (
          <div className="card p-5 mt-5">
            <h3 className="font-bold text-[#111827] mb-4 text-sm" style={{ fontFamily: "var(--font-jakarta)" }}>
              Submitted Photos ({batch.submissions.length})
            </h3>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {batch.submissions.map(sub => (
                <div key={sub.id} className="relative group">
                  <img src={sub.photoUrl} alt={sub.name} className="w-full aspect-square object-cover rounded-lg border border-[#E5E7EB]" />
                  <div className="absolute inset-0 bg-black/60 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-1">
                    <p className="text-white text-[10px] font-medium truncate w-full">{sub.name}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
