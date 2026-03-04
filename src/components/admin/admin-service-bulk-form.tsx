"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, AlertCircle, Upload } from "lucide-react";

export function AdminServiceBulkForm({ locale }: { locale: string }) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError(null);
    setSuccess(null);
    let payload: unknown;
    try {
      payload = JSON.parse(text);
    } catch {
      setError("Invalid JSON. Paste an array of services.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/admin/services/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(
          data.error ??
            "Failed to import services. Check the JSON structure and try again."
        );
        return;
      }
      setSuccess(`Imported ${data.insertedCount ?? 0} services.`);
      setTimeout(() => {
        router.push(`/${locale}/admin/services`);
        router.refresh();
      }, 800);
    } finally {
      setLoading(false);
    }
  };

  const example = `[
  {
    "title": "Portfolio Website Development",
    "description": "A professional portfolio site to showcase your work and attract clients.",
    "features": [
      "Responsive design",
      "Custom UI/UX",
      "SEO optimization"
    ],
    "pricing": { "basic": 4999, "pro": 7999, "premium": 12999 },
    "image": "https://example.com/portfolio.jpg",
    "tieredFeatures": [
      {
        "text": "Up to 3 pages",
        "tiers": ["basic"]
      },
      {
        "text": "Custom design",
        "tiers": ["pro", "premium"]
      },
      {
        "text": "Priority support",
        "tiers": ["premium"]
      }
    ]
  }
]`;

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={() => router.back()}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to services
      </button>

      <h1 className="text-2xl font-bold text-foreground">
        Bulk import services
      </h1>
      <p className="text-sm text-muted-foreground max-w-2xl">
        Paste a JSON array of services. Each item should match the single
        service shape (title, description, features[], pricing.basic/pro/premium,
        optional image, optional tieredFeatures).
      </p>

      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="flex items-start gap-2 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-400">
          <CheckCircle2 className="h-4 w-4 mt-0.5" />
          <span>{success}</span>
        </div>
      )}

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            JSON payload
          </label>
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 text-xs text-muted-foreground hover:bg-muted/40"
            onClick={() => setText(example)}
          >
            <Upload className="h-3 w-3" />
            Load example
          </button>
        </div>
        <textarea
          className="min-h-[260px] w-full rounded-lg border border-border bg-background px-3 py-2 font-mono text-xs text-foreground"
          placeholder={example}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </div>

      <button
        type="button"
        onClick={handleSubmit}
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
      >
        {loading && (
          <span className="h-3 w-3 animate-spin rounded-full border-2 border-background border-t-transparent" />
        )}
        Import services
      </button>
    </div>
  );
}

