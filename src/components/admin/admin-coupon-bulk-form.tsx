"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileJson, Loader2, CheckCircle2, AlertCircle, ChevronDown, ChevronRight } from "lucide-react";

const EXAMPLE_JSON = `[
  {
    "code": "SAVE10",
    "discountPercentage": 10,
    "expiryDate": "2025-12-31T23:59:59.000Z",
    "usageLimit": 100,
    "isActive": true
  },
  {
    "code": "WELCOME20",
    "discountPercentage": 20,
    "expiryDate": "2025-06-30T23:59:59.000Z",
    "usageLimit": 50,
    "isActive": true
  }
]`;

type BulkResult = {
  created?: number;
  createdIds?: string[];
  skipped?: number;
  skippedCodes?: string[];
  validationErrors?: { index: number; code?: string; message: string }[];
  error?: string;
};

export function AdminCouponBulkForm() {
  const router = useRouter();
  const [json, setJson] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<BulkResult | null>(null);
  const [expanded, setExpanded] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setResult(null);
    let parsed: unknown;
    try {
      parsed = JSON.parse(json.trim());
    } catch {
      setResult({ error: "Invalid JSON. Paste a valid JSON array of coupon objects." });
      return;
    }
    if (!Array.isArray(parsed)) {
      setResult({ error: "JSON must be an array of coupon objects (e.g. [{ \"code\": \"SAVE10\", ... }, ...])." });
      return;
    }
    setSubmitting(true);
    const res = await fetch("/api/admin/coupons/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ coupons: parsed }),
    });
    const data = await res.json().catch(() => ({}));
    setSubmitting(false);
    if (!res.ok) {
      setResult({
        error: data.error ?? "Request failed",
        validationErrors: data.validationErrors,
      });
      return;
    }
    setResult({
      created: data.created,
      createdIds: data.createdIds,
      skipped: data.skipped,
      skippedCodes: data.skippedCodes,
      validationErrors: data.validationErrors,
    });
    if (data.created > 0) router.refresh();
  }

  return (
    <div className="mb-6 rounded-xl border border-border bg-card/50 overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded((x) => !x)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm font-medium text-foreground hover:bg-muted/50 transition-colors"
      >
        {expanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
        <FileJson size={18} className="text-muted-foreground" />
        Bulk add coupons (JSON)
      </button>
      {expanded && (
        <form onSubmit={handleSubmit} className="border-t border-border p-4 space-y-4">
          <p className="text-xs text-muted-foreground">
            Paste a JSON array of coupon objects. Each object must include:{" "}
            <code className="bg-muted px-1 rounded">code</code>,{" "}
            <code className="bg-muted px-1 rounded">discountPercentage</code>,{" "}
            <code className="bg-muted px-1 rounded">expiryDate</code>,{" "}
            <code className="bg-muted px-1 rounded">usageLimit</code>,{" "}
            <code className="bg-muted px-1 rounded">isActive</code>.
          </p>
          <textarea
            value={json}
            onChange={(e) => setJson(e.target.value)}
            placeholder={EXAMPLE_JSON}
            className="w-full min-h-[180px] rounded-lg border border-input bg-background px-3 py-2 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            spellCheck={false}
          />
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={submitting || !json.trim()}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:pointer-events-none"
            >
              {submitting ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <FileJson size={16} />
              )}
              {submitting ? "Adding…" : "Add coupons"}
            </button>
            <button
              type="button"
              onClick={() => setJson(EXAMPLE_JSON)}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Insert example
            </button>
          </div>

          {result && (
            <div
              className={`rounded-lg border p-3 text-sm ${
                result.error
                  ? "border-destructive/50 bg-destructive/10 text-destructive"
                  : "border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-400"
              }`}
            >
              {result.error ? (
                <div className="flex items-start gap-2">
                  <AlertCircle size={18} className="shrink-0 mt-0.5" />
                  <div>
                    <p>{result.error}</p>
                    {result.validationErrors && result.validationErrors.length > 0 && (
                      <ul className="mt-2 list-disc list-inside space-y-1 opacity-90">
                        {result.validationErrors.map((e, i) => (
                          <li key={i}>
                            Item {e.index}
                            {e.code ? ` (${e.code})` : ""}: {e.message}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-2">
                  <CheckCircle2 size={18} className="shrink-0 mt-0.5" />
                  <div>
                    <p>
                      Created <strong>{result.created ?? 0}</strong> coupon
                      {(result.created ?? 0) !== 1 ? "s" : ""}.
                      {(result.skipped ?? 0) > 0 && (
                        <> Skipped <strong>{result.skipped}</strong> (code already exists).</>
                      )}
                    </p>
                    {result.skippedCodes && result.skippedCodes.length > 0 && (
                      <p className="mt-1 text-muted-foreground">
                        Skipped codes: {result.skippedCodes.join(", ")}
                      </p>
                    )}
                    {result.validationErrors && result.validationErrors.length > 0 && (
                      <ul className="mt-2 list-disc list-inside space-y-1 text-amber-600 dark:text-amber-400">
                        {result.validationErrors.map((e, i) => (
                          <li key={i}>
                            Item {e.index}
                            {e.code ? ` (${e.code})` : ""}: {e.message}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </form>
      )}
    </div>
  );
}
