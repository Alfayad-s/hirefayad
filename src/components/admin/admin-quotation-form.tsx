"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Send, Loader2, ExternalLink, FileText, Percent, ImagePlus, PenLine, Building2, X, Save, Upload, Plus, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Order, OrderStatus } from "@/types";

type OrderWithUser = Order & { userName?: string; userEmail?: string };

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

function ImageDropZone({
  label,
  value,
  onChange,
  accept = "image/png,image/jpeg,image/jpg,image/webp",
}: {
  label: string;
  value: string;
  onChange: (dataUrl: string) => void;
  accept?: string;
}) {
  const [drag, setDrag] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File | null) => {
    if (!file || !file.type.startsWith("image/")) return;
    try {
      const dataUrl = await readFileAsDataUrl(file);
      onChange(dataUrl);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="space-y-1">
      <span className="text-sm font-medium">{label}</span>
      <div
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); handleFile(e.dataTransfer.files[0] ?? null); }}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors ${
          drag ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground/40 hover:bg-muted/30"
        } ${value ? "border-solid border-primary/50 bg-primary/5" : ""}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
        />
        {value ? (
          <div className="relative inline-block">
            <img src={value} alt="" className="max-h-24 max-w-full object-contain rounded" />
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onChange(""); }}
              className="absolute -top-2 -right-2 size-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center"
              aria-label="Remove"
            >
              <X className="size-3" />
            </button>
          </div>
        ) : (
          <>
            <ImagePlus className="size-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">Drop image or click to upload</p>
          </>
        )}
      </div>
    </div>
  );
}

const STATUS_LABELS: Record<OrderStatus, string> = {
  draft: "Draft",
  quoted: "Quoted",
  pending_acceptance: "Pending acceptance",
  accepted: "Accepted",
  rejected: "Rejected",
  in_progress: "In progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

function formatCurrency(inr: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(inr);
}

const QUOTATION_BRANDING_STORAGE_KEY = "quotation-branding";

export function AdminQuotationForm({
  locale,
  orderId,
}: {
  locale: string;
  orderId: string;
}) {
  const router = useRouter();
  const base = `/${locale}/admin`;
  const [order, setOrder] = useState<OrderWithUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");
  const [status, setStatus] = useState<OrderStatus>("quoted");
  const [quotationMode, setQuotationMode] = useState<"view_only" | "confirm_via_admin">("confirm_via_admin");
  const [quotationAdvancePercentage, setQuotationAdvancePercentage] = useState<number | "">("");
  const [quotationIntro, setQuotationIntro] = useState("");
  const [quotationPaymentTerms, setQuotationPaymentTerms] = useState("");
  const [quotationValidity, setQuotationValidity] = useState("");
  const [quotationTerms, setQuotationTerms] = useState("");
  const [quotationOtherSections, setQuotationOtherSections] = useState<{ heading: string; content: string }[]>([]);
  const [quotationLogo, setQuotationLogo] = useState("");
  const [quotationSignature, setQuotationSignature] = useState("");
  const [quotationCompanyName, setQuotationCompanyName] = useState("");
  const [quotationCompanyAddress, setQuotationCompanyAddress] = useState("");
  const [quotationCompanyEmail, setQuotationCompanyEmail] = useState("");
  const [quotationCompanyPhone, setQuotationCompanyPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [brandingSaved, setBrandingSaved] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [previewBlobUrl, setPreviewBlobUrl] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const previewTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetch(`/api/admin/orders/${orderId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data._id) {
          setOrder(data);
          setAdminNotes(data.adminNotes ?? "");
          setStatus(data.status);
          setQuotationMode(data.quotationMode ?? "confirm_via_admin");
          setQuotationAdvancePercentage(data.quotationAdvancePercentage ?? "");
          setQuotationIntro(data.quotationIntro ?? "");
          setQuotationPaymentTerms(data.quotationPaymentTerms ?? "");
          setQuotationValidity(data.quotationValidity ?? "");
          setQuotationTerms(data.quotationTerms ?? "");
          if (Array.isArray(data.quotationOtherSections) && data.quotationOtherSections.length > 0) {
            setQuotationOtherSections(
              data.quotationOtherSections.map((s: { heading?: string; content?: string }) => ({
                heading: s.heading ?? "",
                content: s.content ?? "",
              }))
            );
          } else if (data.quotationOtherHeading != null || data.quotationOtherContent != null) {
            setQuotationOtherSections([
              {
                heading: data.quotationOtherHeading ?? "",
                content: data.quotationOtherContent ?? "",
              },
            ]);
          } else {
            setQuotationOtherSections([]);
          }
          setQuotationLogo(data.quotationLogo ?? "");
          setQuotationSignature(data.quotationSignature ?? "");
          setQuotationCompanyName(data.quotationCompanyName ?? "");
          setQuotationCompanyAddress(data.quotationCompanyAddress ?? "");
          setQuotationCompanyEmail(data.quotationCompanyEmail ?? "");
          setQuotationCompanyPhone(data.quotationCompanyPhone ?? "");
          const hasOrderBranding = !!(data.quotationCompanyName || data.quotationLogo || data.quotationSignature);
          if (!hasOrderBranding && typeof window !== "undefined") {
            try {
              const raw = window.localStorage.getItem(QUOTATION_BRANDING_STORAGE_KEY);
              if (raw) {
                const saved = JSON.parse(raw) as Record<string, string>;
                if (saved.quotationCompanyName !== undefined) setQuotationCompanyName(saved.quotationCompanyName);
                if (saved.quotationCompanyAddress !== undefined) setQuotationCompanyAddress(saved.quotationCompanyAddress);
                if (saved.quotationCompanyEmail !== undefined) setQuotationCompanyEmail(saved.quotationCompanyEmail);
                if (saved.quotationCompanyPhone !== undefined) setQuotationCompanyPhone(saved.quotationCompanyPhone);
                if (saved.quotationLogo !== undefined) setQuotationLogo(saved.quotationLogo);
                if (saved.quotationSignature !== undefined) setQuotationSignature(saved.quotationSignature);
              }
            } catch {
              /* ignore */
            }
          }
        }
      })
      .finally(() => setLoading(false));
  }, [orderId]);

  useEffect(() => {
    if (!order) return;
    if (previewTimeoutRef.current) clearTimeout(previewTimeoutRef.current);
    previewTimeoutRef.current = setTimeout(async () => {
      setPreviewLoading(true);
      setPreviewBlobUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
      try {
        const payload = {
          quotationAdvancePercentage: quotationAdvancePercentage === "" ? undefined : Number(quotationAdvancePercentage),
          quotationIntro: quotationIntro.trim() || undefined,
          quotationPaymentTerms: quotationPaymentTerms.trim() || undefined,
          quotationValidity: quotationValidity.trim() || undefined,
          quotationTerms: quotationTerms.trim() || undefined,
          quotationOtherSections: quotationOtherSections.length > 0 ? quotationOtherSections : undefined,
          quotationLogo: quotationLogo || undefined,
          quotationSignature: quotationSignature || undefined,
          quotationCompanyName: quotationCompanyName.trim() || undefined,
          quotationCompanyAddress: quotationCompanyAddress.trim() || undefined,
          quotationCompanyEmail: quotationCompanyEmail.trim() || undefined,
          quotationCompanyPhone: quotationCompanyPhone.trim() || undefined,
        };
        const res = await fetch(`/api/admin/orders/${orderId}/pdf/preview`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) return;
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        setPreviewBlobUrl(url);
      } finally {
        setPreviewLoading(false);
      }
    }, 600);
    return () => {
      if (previewTimeoutRef.current) clearTimeout(previewTimeoutRef.current);
    };
  }, [order, orderId, quotationAdvancePercentage, quotationIntro, quotationPaymentTerms, quotationValidity, quotationTerms, quotationOtherSections, quotationLogo, quotationSignature, quotationCompanyName, quotationCompanyAddress, quotationCompanyEmail, quotationCompanyPhone]);

  useEffect(() => {
    return () => {
      if (previewBlobUrl) URL.revokeObjectURL(previewBlobUrl);
    };
  }, [previewBlobUrl]);

  const handleSave = async () => {
    setError(null);
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          adminNotes,
          quotationMode: quotationMode || undefined,
          quotationAdvancePercentage: quotationAdvancePercentage === "" ? undefined : Number(quotationAdvancePercentage),
          quotationIntro: quotationIntro.trim() || undefined,
          quotationPaymentTerms: quotationPaymentTerms.trim() || undefined,
          quotationValidity: quotationValidity.trim() || undefined,
          quotationTerms: quotationTerms.trim() || undefined,
          quotationOtherSections: quotationOtherSections.length > 0 ? quotationOtherSections : undefined,
          quotationLogo: quotationLogo || undefined,
          quotationSignature: quotationSignature || undefined,
          quotationCompanyName: quotationCompanyName.trim() || undefined,
          quotationCompanyAddress: quotationCompanyAddress.trim() || undefined,
          quotationCompanyEmail: quotationCompanyEmail.trim() || undefined,
          quotationCompanyPhone: quotationCompanyPhone.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to save");
        return;
      }
      setOrder(data);
      setMessage("Saved.");
      setTimeout(() => setMessage(null), 2000);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveBrandingToLocal = () => {
    if (typeof window === "undefined") return;
    try {
      const payload = {
        quotationCompanyName: quotationCompanyName.trim(),
        quotationCompanyAddress: quotationCompanyAddress.trim(),
        quotationCompanyEmail: quotationCompanyEmail.trim(),
        quotationCompanyPhone: quotationCompanyPhone.trim(),
        quotationLogo,
        quotationSignature,
      };
      window.localStorage.setItem(QUOTATION_BRANDING_STORAGE_KEY, JSON.stringify(payload));
      setBrandingSaved(true);
      setTimeout(() => setBrandingSaved(false), 2000);
    } catch {
      /* ignore */
    }
  };

  const handleLoadBrandingFromLocal = () => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(QUOTATION_BRANDING_STORAGE_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw) as Record<string, string>;
      if (saved.quotationCompanyName !== undefined) setQuotationCompanyName(saved.quotationCompanyName);
      if (saved.quotationCompanyAddress !== undefined) setQuotationCompanyAddress(saved.quotationCompanyAddress);
      if (saved.quotationCompanyEmail !== undefined) setQuotationCompanyEmail(saved.quotationCompanyEmail);
      if (saved.quotationCompanyPhone !== undefined) setQuotationCompanyPhone(saved.quotationCompanyPhone);
      if (saved.quotationLogo !== undefined) setQuotationLogo(saved.quotationLogo);
      if (saved.quotationSignature !== undefined) setQuotationSignature(saved.quotationSignature);
    } catch {
      /* ignore */
    }
  };

  const handleSendQuotation = async () => {
    setError(null);
    setSending(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/send-quotation`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to send");
        return;
      }
      setMessage("Quotation sent to customer.");
      router.refresh();
      if (order) setOrder({ ...order, status: "pending_acceptance", quotationSentAt: new Date() });
    } finally {
      setSending(false);
    }
  };

  const handleAcceptQuotation = async () => {
    setError(null);
    setAccepting(true);
    try {
      const res = await fetch(`/api/orders/${orderId}/accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to accept quotation");
        return;
      }
      setMessage("Quotation accepted. Customer can now view and download the PDF.");
      router.refresh();
      if (order) setOrder({ ...order, status: "accepted", acceptedAt: new Date() });
    } finally {
      setAccepting(false);
    }
  };

  if (loading || !order) {
    return (
      <div className="rounded-xl border border-border p-12 text-center text-muted-foreground">
        {loading ? "Loading…" : "Order not found."}
      </div>
    );
  }

  const total = order.totalAmountInr;
  const advancePct = quotationAdvancePercentage === "" ? 0 : Number(quotationAdvancePercentage) || 0;
  const advanceAmt = advancePct > 0 && advancePct <= 100 ? Math.round((total * advancePct) / 100) : 0;
  const balanceAmt = total - advanceAmt;

  const viewToken = order.viewToken;
  const viewLink = viewToken
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/${locale}/quote/view/${viewToken}`
    : null;

  return (
    <div className="space-y-6">
      <Link
        href={`${base}/orders`}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to orders
      </Link>

      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}
      {message && (
        <div className="rounded-lg border border-primary/50 bg-primary/10 px-4 py-3 text-sm text-primary">
          {message}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_400px] xl:grid-cols-[1fr_480px]">
        {/* Left: Editor */}
        <div className="space-y-6 min-w-0">
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-lg font-semibold">Customer</h2>
            <p className="mt-1 font-medium">{order.userName}</p>
            <p className="text-sm text-muted-foreground">{order.userEmail}</p>
          </div>

          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-lg font-semibold">Before quoting the customer</h2>
            <p className="mt-1 text-sm text-muted-foreground">Choose how the customer will use this quotation.</p>
            <div className="mt-4 space-y-3">
              <label className="flex items-start gap-3 rounded-lg border border-border p-4 cursor-pointer hover:bg-muted/30 has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                <input
                  type="radio"
                  name="quotationMode"
                  checked={quotationMode === "view_only"}
                  onChange={() => setQuotationMode("view_only")}
                  className="mt-1 size-4"
                />
                <div>
                  <span className="font-medium">Just look at the quotation</span>
                  <p className="text-sm text-muted-foreground mt-0.5">Customer can view and download the PDF as soon as you send the link. No booking confirmation step.</p>
                </div>
              </label>
              <label className="flex items-start gap-3 rounded-lg border border-border p-4 cursor-pointer hover:bg-muted/30 has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                <input
                  type="radio"
                  name="quotationMode"
                  checked={quotationMode === "confirm_via_admin"}
                  onChange={() => setQuotationMode("confirm_via_admin")}
                  className="mt-1 size-4"
                />
                <div>
                  <span className="font-medium">Accept & confirm order from admin</span>
                  <p className="text-sm text-muted-foreground mt-0.5">Customer can see the PDF and download only after you accept the quotation and confirm the booking.</p>
                </div>
              </label>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-lg font-semibold">Items</h2>
            <table className="mt-3 w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="pb-2 font-medium">Service</th>
                  <th className="pb-2 font-medium">Tier</th>
                  <th className="pb-2 font-medium">Qty</th>
                  <th className="pb-2 text-right font-medium">Amount</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item, i) => (
                  <tr key={i} className="border-b border-border">
                    <td className="py-2">{item.serviceTitle}</td>
                    <td className="py-2">{item.tier}</td>
                    <td className="py-2">{item.quantity}</td>
                    <td className="py-2 text-right">{formatCurrency(item.unitPriceInr * item.quantity)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-3 flex justify-between border-t border-border pt-3">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatCurrency(order.subtotalInr)}</span>
            </div>
            {order.discountAmountInr > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Discount</span>
                <span>-{formatCurrency(order.discountAmountInr)}</span>
              </div>
            )}
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>{formatCurrency(order.totalAmountInr)}</span>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <Building2 className="size-5" />
              Company & branding (PDF)
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">Shown on quotation PDF. Logo and company details.</p>

            <label className="mt-4 block text-sm font-medium">Company name</label>
            <input
              type="text"
              value={quotationCompanyName}
              onChange={(e) => setQuotationCompanyName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
              placeholder="e.g. ServiceFunnel"
            />
            <label className="mt-3 block text-sm font-medium">Address</label>
            <textarea
              value={quotationCompanyAddress}
              onChange={(e) => setQuotationCompanyAddress(e.target.value)}
              rows={2}
              className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
              placeholder="Street, City, State, PIN"
            />
            <label className="mt-3 block text-sm font-medium">Email</label>
            <input
              type="text"
              value={quotationCompanyEmail}
              onChange={(e) => setQuotationCompanyEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
              placeholder="contact@example.com"
            />
            <label className="mt-3 block text-sm font-medium">Phone</label>
            <input
              type="text"
              value={quotationCompanyPhone}
              onChange={(e) => setQuotationCompanyPhone(e.target.value)}
              className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
              placeholder="+91 98765 43210"
            />

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <ImageDropZone
                label="Company logo"
                value={quotationLogo}
                onChange={setQuotationLogo}
              />
              <ImageDropZone
                label="Signature (authorized signatory)"
                value={quotationSignature}
                onChange={setQuotationSignature}
              />
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleSaveBrandingToLocal}
                className="cursor-pointer"
              >
                <Save className="size-4 mr-1.5" />
                Save data to browser
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleLoadBrandingFromLocal}
                className="cursor-pointer"
              >
                <Upload className="size-4 mr-1.5" />
                Load saved data
              </Button>
              {brandingSaved && (
                <span className="text-sm text-muted-foreground">Saved to this device (no expiry)</span>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <FileText className="size-5" />
              Quotation content (PDF)
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">Optional sections. Shown on the downloaded/sent PDF.</p>

            <div className="mt-4">
              <label className="flex items-center gap-2 text-sm font-medium">
                <Percent className="size-4" />
                Advance payment %
              </label>
              <input
                type="number"
                min={0}
                max={100}
                value={quotationAdvancePercentage === "" ? "" : quotationAdvancePercentage}
                onChange={(e) => setQuotationAdvancePercentage(e.target.value === "" ? "" : Number(e.target.value))}
                className="mt-1 w-24 rounded-lg border border-input bg-background px-3 py-2 text-sm"
                placeholder="e.g. 50"
              />
              {advancePct > 0 && advancePct <= 100 && (
                <div className="mt-2 text-sm text-muted-foreground">
                  Advance: {formatCurrency(advanceAmt)} · Balance: {formatCurrency(balanceAmt)}
                </div>
              )}
            </div>

            <label className="mt-4 block text-sm font-medium">Intro (before Bill to)</label>
            <textarea
              value={quotationIntro}
              onChange={(e) => setQuotationIntro(e.target.value)}
              rows={2}
              className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
              placeholder="e.g. Thank you for your interest. Please find our quotation below."
            />

            <label className="mt-4 block text-sm font-medium">Payment terms</label>
            <textarea
              value={quotationPaymentTerms}
              onChange={(e) => setQuotationPaymentTerms(e.target.value)}
              rows={2}
              className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
              placeholder="e.g. 50% advance to start, 50% on delivery."
            />

            <label className="mt-4 block text-sm font-medium">Validity</label>
            <input
              type="text"
              value={quotationValidity}
              onChange={(e) => setQuotationValidity(e.target.value)}
              className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
              placeholder="e.g. Valid for 15 days from date of issue"
            />

            <label className="mt-4 block text-sm font-medium">Terms & conditions</label>
            <textarea
              value={quotationTerms}
              onChange={(e) => setQuotationTerms(e.target.value)}
              rows={4}
              className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
              placeholder="Optional T&C (one per line or paragraph)"
            />

            <label className="mt-4 block text-sm font-medium">Other sections (optional)</label>
            <p className="mt-0.5 text-xs text-muted-foreground">Add one or more custom heading + content blocks on the PDF.</p>
            {quotationOtherSections.map((section, idx) => (
              <div key={idx} className="mt-4 rounded-lg border border-border bg-muted/20 p-4">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-medium text-muted-foreground">Section {idx + 1}</span>
                  <button
                    type="button"
                    onClick={() =>
                      setQuotationOtherSections((prev) => prev.filter((_, i) => i !== idx))
                    }
                    className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive cursor-pointer"
                    aria-label="Remove section"
                  >
                    <X className="size-4" />
                  </button>
                </div>
                <input
                  type="text"
                  value={section.heading}
                  onChange={(e) =>
                    setQuotationOtherSections((prev) =>
                      prev.map((s, i) => (i === idx ? { ...s, heading: e.target.value } : s))
                    )
                  }
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm mb-2"
                  placeholder="e.g. Notes, Warranty, Scope"
                />
                <textarea
                  value={section.content}
                  onChange={(e) =>
                    setQuotationOtherSections((prev) =>
                      prev.map((s, i) => (i === idx ? { ...s, content: e.target.value } : s))
                    )
                  }
                  rows={3}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                  placeholder="Content for this section…"
                />
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-3 cursor-pointer"
              onClick={() => setQuotationOtherSections((prev) => [...prev, { heading: "", content: "" }])}
            >
              <Plus className="size-4 mr-1.5" />
              Add section
            </Button>
          </div>

          <div className="rounded-xl border border-border bg-card p-6">
            <label className="block text-sm font-medium">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as OrderStatus)}
              className="mt-1 rounded-lg border border-input bg-background px-3 py-2 text-sm"
            >
              {(Object.keys(STATUS_LABELS) as OrderStatus[]).map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABELS[s]}
                </option>
              ))}
            </select>
            <label className="mt-4 block text-sm font-medium">Admin notes (internal, not on PDF)</label>
            <textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              rows={3}
              className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
              placeholder="Optional notes…"
            />
            <Button onClick={handleSave} disabled={saving} className="mt-4 gap-1.5">
              {saving ? <Loader2 className="size-4 animate-spin" /> : null}
              Save
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              onClick={handleSendQuotation}
              disabled={sending || !order.userEmail}
              className="gap-1.5 bg-yellow-500 text-black hover:bg-yellow-400"
            >
              {sending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
              Send quotation to customer
            </Button>
            {(status === "quoted" || status === "pending_acceptance") && quotationMode === "confirm_via_admin" && (
              <Button
                onClick={handleAcceptQuotation}
                disabled={accepting}
                variant="default"
                className="gap-1.5 bg-green-600 text-white hover:bg-green-500"
              >
                {accepting ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
                Accept quotation (confirm booking)
              </Button>
            )}
            <Button variant="outline" size="sm" asChild>
              <a href={`/api/admin/orders/${orderId}/pdf`} target="_blank" rel="noopener noreferrer" className="gap-1.5">
                Download PDF
              </a>
            </Button>
            {viewLink && (
              <a
                href={viewLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
              >
                <ExternalLink className="size-4" />
                View as customer
              </a>
            )}
          </div>
        </div>

        {/* Right: Live PDF preview */}
        <div className="lg:sticky lg:top-4 lg:self-start">
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="flex items-center justify-between border-b border-border bg-muted/30 px-4 py-2">
              <span className="text-sm font-medium">Live PDF preview</span>
              {previewLoading && (
                <Loader2 className="size-4 animate-spin text-muted-foreground" />
              )}
            </div>
            <div className="bg-muted/20 min-h-[420px] flex items-center justify-center">
              {previewBlobUrl ? (
                <iframe
                  src={previewBlobUrl}
                  title="Quotation PDF preview"
                  className="w-full h-[calc(100vh-12rem)] min-h-[520px] max-h-[720px] border-0"
                />
              ) : previewLoading ? (
                <p className="text-sm text-muted-foreground">Generating…</p>
              ) : (
                <p className="text-sm text-muted-foreground">Preview will appear here</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
