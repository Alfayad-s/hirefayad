"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { couponSchema, type CouponInput } from "@/lib/validations/admin";
import type { Coupon } from "@/types";
import {
  ArrowLeft,
  Ticket,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Hash,
  Percent,
  Calendar,
  Users,
  ToggleLeft,
  ToggleRight,
  Sparkles,
  Plus,
  RefreshCw,
  Lock,
  Zap,
} from "lucide-react";

type CouponForForm = Omit<Coupon, "usedCount" | "createdAt"> & {
  expiryDate: string;
  _id?: string;
};

type Props = {
  locale: string;
  coupon?: CouponForForm;
};

const QUICK_DISCOUNTS = [5, 10, 15, 20, 25, 30, 50];

function generateCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

export function AdminCouponForm({ locale, coupon }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const isEdit = !!coupon;

  const toDatetimeLocal = (d: Date | string) => {
    const date = typeof d === "string" ? new Date(d) : d;
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  };

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
  } = useForm<CouponInput & { expiryDate: string }>({
    resolver: zodResolver(couponSchema),
    defaultValues: coupon
      ? {
          code: coupon.code,
          discountPercentage: coupon.discountPercentage,
          expiryDate: coupon.expiryDate.slice(0, 16),
          usageLimit: coupon.usageLimit,
          isActive: coupon.isActive,
        }
      : {
          code: "",
          discountPercentage: 20,
          expiryDate: toDatetimeLocal(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)),
          usageLimit: 100,
          isActive: true,
        },
  });

  const isActive = watch("isActive");
  const watchedDiscount = watch("discountPercentage");
  const watchedCode = watch("code");
  const watchedLimit = watch("usageLimit");
  const watchedExpiry = watch("expiryDate");

  const daysUntilExpiry = watchedExpiry
    ? Math.ceil((new Date(watchedExpiry).getTime() - Date.now()) / 86400000)
    : null;

  async function onSubmit(data: CouponInput & { expiryDate: string }) {
    setError(null);
    const payload = { ...data, expiryDate: new Date(data.expiryDate).toISOString() };
    const url = isEdit ? `/api/admin/coupons/${coupon!._id}` : "/api/admin/coupons";
    const method = isEdit ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) { setError(json.error ?? "Something went wrong"); return; }
    setSuccess(true);
    setTimeout(() => { router.push(`/${locale}/admin/coupons`); router.refresh(); }, 800);
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');

        .acf-wrap * { font-family: 'DM Sans', sans-serif; box-sizing: border-box; }

        .acf-wrap {
          --surface: #16161a;
          --surface2: #1c1c21;
          --border: rgba(255,255,255,0.08);
          --border-focus: rgba(99,102,241,0.6);
          --text: rgba(255,255,255,0.9);
          --text-muted: rgba(255,255,255,0.38);
          --text-sub: rgba(255,255,255,0.58);
          --accent: #6366f1;
          --accent-glow: rgba(99,102,241,0.25);
          --error: #f87171;
          --error-bg: rgba(248,113,113,0.08);
          --error-border: rgba(248,113,113,0.2);
          --success: #34d399;
          --success-bg: rgba(52,211,153,0.08);
          --success-border: rgba(52,211,153,0.2);
        }

        .acf-back {
          display: inline-flex; align-items: center; gap: 7px;
          font-size: 13px; color: var(--text-muted); text-decoration: none;
          padding: 6px 10px 6px 6px; border-radius: 7px; border: 1px solid transparent;
          transition: all 0.15s; margin-bottom: 24px; cursor: pointer; background: transparent;
        }
        .acf-back:hover { color: var(--text-sub); background: rgba(255,255,255,0.04); border-color: var(--border); }

        .acf-page-header { display: flex; align-items: center; gap: 14px; margin-bottom: 28px; }

        .acf-page-icon {
          width: 44px; height: 44px; border-radius: 12px;
          background: rgba(99,102,241,0.12); border: 1px solid rgba(99,102,241,0.2);
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }

        .acf-page-title { font-size: 22px; font-weight: 600; color: var(--text); letter-spacing: -0.04em; line-height: 1.1; }
        .acf-page-sub { font-size: 13px; color: var(--text-muted); margin-top: 2px; }

        /* Preview card */
        .acf-preview {
          background: linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(167,139,250,0.08) 100%);
          border: 1px solid rgba(99,102,241,0.25);
          border-radius: 14px;
          padding: 20px;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 18px;
          position: relative;
          overflow: hidden;
        }

        .acf-preview::before {
          content: '';
          position: absolute;
          right: -20px; top: -20px;
          width: 120px; height: 120px;
          background: radial-gradient(circle, rgba(99,102,241,0.15), transparent 70%);
          pointer-events: none;
        }

        .acf-preview-code {
          font-family: 'SF Mono', 'Fira Code', monospace;
          font-size: 26px;
          font-weight: 700;
          color: white;
          letter-spacing: 0.06em;
          line-height: 1;
        }

        .acf-preview-code-empty {
          font-size: 18px;
          font-weight: 500;
          color: rgba(255,255,255,0.2);
          letter-spacing: 0.04em;
        }

        .acf-preview-discount {
          display: flex;
          align-items: baseline;
          gap: 2px;
        }

        .acf-preview-pct {
          font-size: 40px;
          font-weight: 700;
          color: #a5b4fc;
          letter-spacing: -0.06em;
          line-height: 1;
        }

        .acf-preview-off {
          font-size: 13px;
          color: rgba(255,255,255,0.4);
          font-weight: 400;
          margin-left: 2px;
        }

        .acf-preview-meta {
          display: flex;
          flex-direction: column;
          gap: 4px;
          margin-left: auto;
          align-items: flex-end;
        }

        .acf-preview-pill {
          font-size: 11px;
          font-weight: 500;
          padding: 3px 9px;
          border-radius: 20px;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          white-space: nowrap;
        }

        .acf-preview-divider {
          width: 1px;
          height: 50px;
          background: rgba(255,255,255,0.1);
          flex-shrink: 0;
        }

        /* Sections */
        .acf-section { background: var(--surface); border: 1px solid var(--border); border-radius: 14px; overflow: hidden; margin-bottom: 14px; }

        .acf-section-header {
          display: flex; align-items: center; gap: 10px;
          padding: 13px 18px; border-bottom: 1px solid var(--border); background: var(--surface2);
        }

        .acf-section-icon {
          width: 28px; height: 28px; border-radius: 7px;
          background: rgba(99,102,241,0.1);
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }

        .acf-section-title { font-size: 13px; font-weight: 600; color: var(--text-sub); letter-spacing: -0.01em; }
        .acf-section-body { padding: 18px; }

        .acf-label { display: block; font-size: 12px; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase; color: var(--text-muted); margin-bottom: 7px; }
        .acf-sublabel { font-size: 11.5px; color: var(--text-muted); margin-top: 5px; }

        .acf-input {
          width: 100%; background: var(--surface2); border: 1px solid var(--border);
          border-radius: 9px; padding: 10px 14px; font-size: 14px; color: var(--text);
          outline: none; transition: border-color 0.18s, box-shadow 0.18s; font-family: 'DM Sans', sans-serif;
        }
        .acf-input::placeholder { color: var(--text-muted); }
        .acf-input:focus { border-color: var(--border-focus); box-shadow: 0 0 0 3px var(--accent-glow); }
        .acf-input.mono { font-family: 'SF Mono', 'Fira Code', monospace; letter-spacing: 0.05em; font-size: 15px; font-weight: 600; text-transform: uppercase; }
        .acf-input.error { border-color: var(--error-border); }
        .acf-input:read-only { opacity: 0.6; cursor: not-allowed; }

        .acf-input-wrap { position: relative; }
        .acf-input-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--text-muted); pointer-events: none; }
        .acf-input-with-icon { padding-left: 36px !important; }
        .acf-input-suffix { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); font-size: 12px; font-weight: 600; color: var(--text-muted); pointer-events: none; }

        .acf-field-error { font-size: 12px; color: var(--error); margin-top: 5px; display: flex; align-items: center; gap: 4px; }

        /* Quick discount pills */
        .acf-quick-pills { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 10px; }

        .acf-quick-pill {
          font-size: 12px; font-weight: 600; padding: 4px 11px; border-radius: 20px;
          border: 1px solid var(--border); background: var(--surface2); color: var(--text-muted);
          cursor: pointer; transition: all 0.15s; font-family: 'DM Sans', sans-serif;
        }
        .acf-quick-pill:hover { border-color: rgba(99,102,241,0.4); color: #a5b4fc; background: rgba(99,102,241,0.08); }
        .acf-quick-pill.active { border-color: rgba(99,102,241,0.5); color: #a5b4fc; background: rgba(99,102,241,0.12); }

        /* Discount slider */
        .acf-discount-display {
          display: flex;
          align-items: center;
          gap: 12px;
          background: var(--surface2);
          border: 1px solid var(--border);
          border-radius: 9px;
          padding: 12px 16px;
        }

        .acf-discount-big {
          font-size: 36px;
          font-weight: 700;
          color: #a5b4fc;
          letter-spacing: -0.05em;
          line-height: 1;
          min-width: 70px;
        }

        .acf-discount-bar-wrap {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .acf-discount-bar-track {
          height: 6px;
          background: rgba(255,255,255,0.06);
          border-radius: 99px;
          overflow: hidden;
        }

        .acf-discount-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, #6366f1, #a78bfa);
          border-radius: 99px;
          transition: width 0.2s ease;
          box-shadow: 0 0 8px rgba(99,102,241,0.4);
        }

        .acf-range {
          width: 100%;
          -webkit-appearance: none;
          appearance: none;
          height: 4px;
          background: transparent;
          outline: none;
          cursor: pointer;
        }
        .acf-range::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 18px; height: 18px;
          border-radius: 50%;
          background: #6366f1;
          border: 2px solid white;
          box-shadow: 0 0 8px rgba(99,102,241,0.5);
          cursor: pointer;
        }

        /* Generate code button */
        .acf-gen-btn {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 12px; font-weight: 500; color: var(--accent);
          background: rgba(99,102,241,0.08); border: 1px solid rgba(99,102,241,0.2);
          border-radius: 7px; padding: 6px 11px; cursor: pointer; transition: all 0.15s;
          font-family: 'DM Sans', sans-serif; white-space: nowrap;
        }
        .acf-gen-btn:hover { background: rgba(99,102,241,0.15); border-color: rgba(99,102,241,0.4); }

        /* Toggle */
        .acf-toggle-row {
          display: flex; align-items: center; justify-content: space-between;
          padding: 14px 18px;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 12px;
          cursor: pointer;
          transition: background 0.15s;
        }
        .acf-toggle-row:hover { background: rgba(255,255,255,0.02); }

        .acf-toggle-info { display: flex; flex-direction: column; gap: 2px; }
        .acf-toggle-title { font-size: 14px; font-weight: 500; color: var(--text); letter-spacing: -0.01em; }
        .acf-toggle-desc { font-size: 12px; color: var(--text-muted); }

        /* Alert */
        .acf-alert { display: flex; align-items: flex-start; gap: 10px; padding: 12px 14px; border-radius: 10px; font-size: 13.5px; margin-bottom: 14px; }
        .acf-alert.error { background: var(--error-bg); border: 1px solid var(--error-border); color: var(--error); }
        .acf-alert.success { background: var(--success-bg); border: 1px solid var(--success-border); color: var(--success); }

        /* Footer */
        .acf-footer { display: flex; align-items: center; gap: 10px; padding-top: 6px; }

        .acf-submit-btn {
          display: inline-flex; align-items: center; gap: 7px;
          background: var(--accent); color: white; border: none; border-radius: 9px;
          padding: 10px 20px; font-size: 14px; font-weight: 500;
          font-family: 'DM Sans', sans-serif; cursor: pointer;
          transition: opacity 0.15s, box-shadow 0.15s; letter-spacing: -0.01em;
        }
        .acf-submit-btn:hover:not(:disabled) { opacity: 0.88; box-shadow: 0 0 20px var(--accent-glow); }
        .acf-submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .acf-submit-btn.success-state { background: #10b981; }

        .acf-cancel-btn {
          display: inline-flex; align-items: center; gap: 6px;
          background: transparent; color: var(--text-muted); border: 1px solid var(--border);
          border-radius: 9px; padding: 10px 18px; font-size: 14px;
          font-family: 'DM Sans', sans-serif; cursor: pointer; transition: all 0.15s;
        }
        .acf-cancel-btn:hover { background: rgba(255,255,255,0.04); color: var(--text-sub); }

        .acf-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }

        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @media (max-width: 560px) { .acf-grid-2 { grid-template-columns: 1fr; } }
      `}</style>

      <div className="acf-wrap" style={{ maxWidth: 600 }}>
        {/* Back */}
        <button className="acf-back" onClick={() => router.back()}>
          <ArrowLeft size={14} strokeWidth={2.5} />
          Back to coupons
        </button>

        {/* Page header */}
        <div className="acf-page-header">
          <div className="acf-page-icon">
            <Ticket size={20} color="#818cf8" strokeWidth={1.75} />
          </div>
          <div>
            <div className="acf-page-title">
              {isEdit ? `Edit "${coupon!.code}"` : "New Coupon"}
            </div>
            <div className="acf-page-sub">
              {isEdit ? "Update this coupon's discount, limits, and expiry." : "Configure a discount code for your customers."}
            </div>
          </div>
        </div>

        {/* Live Preview Card */}
        <div className="acf-preview">
          <div>
            {watchedCode ? (
              <div className="acf-preview-code">{watchedCode.toUpperCase()}</div>
            ) : (
              <div className="acf-preview-code-empty">YOUR CODE</div>
            )}
            <div style={{ fontSize: 11.5, color: "rgba(255,255,255,0.3)", marginTop: 4, letterSpacing: "0.02em" }}>
              Coupon code
            </div>
          </div>

          <div className="acf-preview-divider" />

          <div className="acf-preview-discount">
            <span className="acf-preview-pct">{watchedDiscount || 0}</span>
            <span className="acf-preview-off">% OFF</span>
          </div>

          <div className="acf-preview-meta">
            <span
              className="acf-preview-pill"
              style={
                isActive
                  ? { background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.25)", color: "#34d399" }
                  : { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.3)" }
              }
            >
              <Zap size={10} strokeWidth={2.5} />
              {isActive ? "Active" : "Inactive"}
            </span>

            {watchedLimit > 0 && (
              <span className="acf-preview-pill" style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)", color: "#a5b4fc" }}>
                <Users size={10} strokeWidth={2} />
                {watchedLimit} uses
              </span>
            )}

            {daysUntilExpiry !== null && (
              <span
                className="acf-preview-pill"
                style={{
                  background: daysUntilExpiry < 0 ? "rgba(239,68,68,0.1)" : "rgba(255,255,255,0.05)",
                  border: `1px solid ${daysUntilExpiry < 0 ? "rgba(239,68,68,0.25)" : "rgba(255,255,255,0.08)"}`,
                  color: daysUntilExpiry < 0 ? "#f87171" : "rgba(255,255,255,0.35)",
                }}
              >
                <Calendar size={10} strokeWidth={2} />
                {daysUntilExpiry < 0 ? `Expired ${Math.abs(daysUntilExpiry)}d ago` : `${daysUntilExpiry}d left`}
              </span>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Alerts */}
          {error && (
            <div className="acf-alert error">
              <AlertCircle size={16} strokeWidth={2} style={{ flexShrink: 0, marginTop: 1 }} />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="acf-alert success">
              <CheckCircle2 size={16} strokeWidth={2} style={{ flexShrink: 0, marginTop: 1 }} />
              <span>{isEdit ? "Coupon updated!" : "Coupon created!"} Redirecting…</span>
            </div>
          )}

          {/* Code */}
          <div className="acf-section">
            <div className="acf-section-header">
              <div className="acf-section-icon">
                <Hash size={14} color="#818cf8" strokeWidth={2} />
              </div>
              <span className="acf-section-title">Coupon Code</span>
              {isEdit && (
                <span style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 5, fontSize: 11.5, color: "rgba(255,255,255,0.25)" }}>
                  <Lock size={11} strokeWidth={2} />
                  Code is locked after creation
                </span>
              )}
            </div>
            <div className="acf-section-body">
              <div style={{ display: "flex", gap: 8 }}>
                <div className="acf-input-wrap" style={{ flex: 1 }}>
                  <input
                    className={`acf-input mono ${errors.code ? "error" : ""}`}
                    placeholder="e.g. SAVE20"
                    readOnly={isEdit}
                    {...register("code")}
                    onChange={(e) => {
                      e.target.value = e.target.value.toUpperCase();
                      register("code").onChange(e);
                    }}
                  />
                </div>
                {!isEdit && (
                  <button
                    type="button"
                    className="acf-gen-btn"
                    onClick={() => setValue("code", generateCode())}
                  >
                    <RefreshCw size={13} strokeWidth={2.5} />
                    Generate
                  </button>
                )}
              </div>
              {errors.code && (
                <div className="acf-field-error">
                  <AlertCircle size={11} strokeWidth={2} />
                  {errors.code.message}
                </div>
              )}
              <div className="acf-sublabel">Customers will enter this code at checkout.</div>
            </div>
          </div>

          {/* Discount */}
          <div className="acf-section">
            <div className="acf-section-header">
              <div className="acf-section-icon">
                <Percent size={14} color="#818cf8" strokeWidth={2} />
              </div>
              <span className="acf-section-title">Discount Amount</span>
            </div>
            <div className="acf-section-body">
              <div className="acf-discount-display">
                <div className="acf-discount-big">{watchedDiscount || 0}<span style={{ fontSize: 20, color: "rgba(255,255,255,0.3)" }}>%</span></div>
                <div className="acf-discount-bar-wrap">
                  <div className="acf-discount-bar-track">
                    <div className="acf-discount-bar-fill" style={{ width: `${Math.min(100, watchedDiscount || 0)}%` }} />
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={100}
                    className="acf-range"
                    value={watchedDiscount || 0}
                    onChange={(e) => setValue("discountPercentage", Number(e.target.value))}
                  />
                  <input type="hidden" {...register("discountPercentage", { valueAsNumber: true })} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    className="acf-input"
                    style={{ width: 68, textAlign: "center", padding: "8px 10px", fontSize: 16, fontWeight: 600 }}
                    value={watchedDiscount || ""}
                    onChange={(e) => setValue("discountPercentage", Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="acf-quick-pills">
                {QUICK_DISCOUNTS.map((d) => (
                  <button
                    key={d}
                    type="button"
                    className={`acf-quick-pill ${watchedDiscount === d ? "active" : ""}`}
                    onClick={() => setValue("discountPercentage", d)}
                  >
                    {d}%
                  </button>
                ))}
              </div>

              {errors.discountPercentage && (
                <div className="acf-field-error" style={{ marginTop: 8 }}>
                  <AlertCircle size={11} strokeWidth={2} />
                  {errors.discountPercentage.message}
                </div>
              )}
            </div>
          </div>

          {/* Limits & Expiry */}
          <div className="acf-section">
            <div className="acf-section-header">
              <div className="acf-section-icon">
                <Calendar size={14} color="#818cf8" strokeWidth={2} />
              </div>
              <span className="acf-section-title">Limits & Expiry</span>
            </div>
            <div className="acf-section-body">
              <div className="acf-grid-2">
                <div>
                  <label className="acf-label">Usage limit</label>
                  <div className="acf-input-wrap">
                    <Users size={14} className="acf-input-icon" />
                    <input
                      type="number"
                      min={0}
                      className={`acf-input acf-input-with-icon ${errors.usageLimit ? "error" : ""}`}
                      placeholder="100"
                      {...register("usageLimit", { valueAsNumber: true })}
                    />
                  </div>
                  {errors.usageLimit ? (
                    <div className="acf-field-error">
                      <AlertCircle size={11} strokeWidth={2} />
                      {errors.usageLimit.message}
                    </div>
                  ) : (
                    <div className="acf-sublabel">Max redemptions. 0 = unlimited.</div>
                  )}
                </div>

                <div>
                  <label className="acf-label">Expiry date</label>
                  <div className="acf-input-wrap">
                    <Calendar size={14} className="acf-input-icon" />
                    <input
                      type="datetime-local"
                      className={`acf-input acf-input-with-icon ${errors.expiryDate ? "error" : ""}`}
                      {...register("expiryDate")}
                    />
                  </div>
                  {errors.expiryDate ? (
                    <div className="acf-field-error">
                      <AlertCircle size={11} strokeWidth={2} />
                      {errors.expiryDate.message as string}
                    </div>
                  ) : daysUntilExpiry !== null ? (
                    <div
                      className="acf-sublabel"
                      style={{ color: daysUntilExpiry < 7 && daysUntilExpiry >= 0 ? "#f59e0b" : daysUntilExpiry < 0 ? "#f87171" : undefined }}
                    >
                      {daysUntilExpiry < 0
                        ? `Expired ${Math.abs(daysUntilExpiry)} day${Math.abs(daysUntilExpiry) !== 1 ? "s" : ""} ago`
                        : daysUntilExpiry === 0
                        ? "Expires today"
                        : `Expires in ${daysUntilExpiry} day${daysUntilExpiry !== 1 ? "s" : ""}`}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          {/* Status toggle */}
          <div
            className="acf-toggle-row"
            onClick={() => setValue("isActive", !isActive)}
            style={{ marginBottom: 20 }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 9,
                background: isActive ? "rgba(16,185,129,0.12)" : "rgba(255,255,255,0.05)",
                border: `1px solid ${isActive ? "rgba(16,185,129,0.25)" : "rgba(255,255,255,0.08)"}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.2s", flexShrink: 0,
              }}>
                <Sparkles size={16} strokeWidth={1.75} color={isActive ? "#34d399" : "rgba(255,255,255,0.3)"} />
              </div>
              <div className="acf-toggle-info">
                <span className="acf-toggle-title">Coupon status</span>
                <span className="acf-toggle-desc">
                  {isActive ? "This coupon is active and can be redeemed." : "This coupon is disabled and cannot be used."}
                </span>
              </div>
            </div>
            <div>
              <input type="checkbox" style={{ display: "none" }} {...register("isActive")} />
              {isActive
                ? <ToggleRight size={32} color="#10b981" strokeWidth={1.75} />
                : <ToggleLeft size={32} color="rgba(255,255,255,0.2)" strokeWidth={1.75} />
              }
            </div>
          </div>

          {/* Footer */}
          <div className="acf-footer">
            <button
              type="submit"
              className={`acf-submit-btn ${success ? "success-state" : ""}`}
              disabled={isSubmitting || success}
            >
              {success ? (
                <><CheckCircle2 size={15} strokeWidth={2.5} />{isEdit ? "Updated!" : "Created!"}</>
              ) : isSubmitting ? (
                <><Loader2 size={15} strokeWidth={2.5} style={{ animation: "spin 1s linear infinite" }} />Saving…</>
              ) : isEdit ? (
                <><Sparkles size={15} strokeWidth={2.5} />Update coupon</>
              ) : (
                <><Plus size={15} strokeWidth={2.5} />Create coupon</>
              )}
            </button>
            <button type="button" className="acf-cancel-btn" onClick={() => router.back()}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </>
  );
}