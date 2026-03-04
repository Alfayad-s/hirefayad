"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { serviceSchema, type ServiceInput } from "@/lib/validations/admin";
import type { Service } from "@/types";
import {
  Zap,
  Sparkles,
  Crown,
  Plus,
  Trash2,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Package,
  FileText,
  List,
  DollarSign,
  Loader2,
  GripVertical,
  Eye,
  Check,
  Layers,
  Image as ImageIcon,
  Upload,
  Link2,
  Rows,
} from "lucide-react";

type Props = {
  locale: string;
  service?: Service & { _id: string };
};

const TIER_CONFIG = {
  basic: {
    label: "Basic",
    icon: Zap,
    color: "#60a5fa",
    bg: "rgba(96,165,250,0.07)",
    border: "rgba(96,165,250,0.18)",
    badge: "Starter",
    badgeBg: "rgba(96,165,250,0.12)",
  },
  pro: {
    label: "Pro",
    icon: Sparkles,
    color: "#a78bfa",
    bg: "rgba(167,139,250,0.07)",
    border: "rgba(167,139,250,0.22)",
    badge: "Popular",
    badgeBg: "rgba(167,139,250,0.15)",
  },
  premium: {
    label: "Premium",
    icon: Crown,
    color: "#fbbf24",
    bg: "rgba(251,191,36,0.07)",
    border: "rgba(251,191,36,0.18)",
    badge: "Best Value",
    badgeBg: "rgba(251,191,36,0.12)",
  },
};

export function AdminServiceForm({ locale, service }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [activePreviewTier, setActivePreviewTier] = useState<keyof typeof TIER_CONFIG>("pro");
  const [imageMode, setImageMode] = useState<"url" | "upload">("url");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageUploadError, setImageUploadError] = useState<string | null>(null);
  const [showBulkFeatures, setShowBulkFeatures] = useState(false);
  const [bulkFeaturesText, setBulkFeaturesText] = useState("");
  const isEdit = !!service;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<ServiceInput>({
    resolver: zodResolver(serviceSchema),
    defaultValues: service
      ? {
          title: service.title,
          description: service.description,
          features: service.features.length ? service.features : [""],
          pricing: service.pricing,
          tieredFeatures: service.tieredFeatures ?? [],
          image: service.image ?? "",
          shortTagline: service.shortTagline ?? "",
          currency: service.currency ?? "INR",
          deliveryTime: service.deliveryTime ?? {
            basic: "",
            pro: "",
            premium: "",
          },
          technologies: service.technologies ?? [],
        }
      : {
          title: "",
          description: "",
          features: [""],
          pricing: { basic: 0, pro: 0, premium: 0 },
          tieredFeatures: [],
          image: "",
          shortTagline: "",
          currency: "INR",
          deliveryTime: {
            basic: "",
            pro: "",
            premium: "",
          },
          technologies: [],
        },
  });

  const features = watch("features");
  const tieredFeatures = watch("tieredFeatures") ?? [];
  const watchedPricing = watch("pricing");
  const watchedTitle = watch("title");
  const watchedDescription = watch("description");
  const watchedImage = watch("image");
  const watchedCurrency = watch("currency");
  const watchedDelivery = watch("deliveryTime");
  const watchedTechnologies = watch("technologies") ?? [];

  const handleApplyBulkFeatures = () => {
    const lines = bulkFeaturesText
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);
    if (!lines.length) return;
    setValue("features", lines, { shouldDirty: true, shouldValidate: true });
    setBulkFeaturesText("");
    setShowBulkFeatures(false);
  };

  async function handleImageFile(file: File | null) {
    if (!file) return;
    setImageUploadError(null);
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/admin/upload-image", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        setImageUploadError(data.error ?? "Failed to upload image");
        return;
      }
      setValue("image", data.url, { shouldDirty: true });
    } catch {
      setImageUploadError("Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
  }

  async function onSubmit(data: ServiceInput) {
    setError(null);

    const cleanFeatures = data.features.filter((f) => f.trim().length > 0);
    if (cleanFeatures.length === 0) {
      setError("Add at least one feature.");
      return;
    }

    const cleanTiered =
      (data.tieredFeatures ?? [])
        .map((f) => ({
          text: f.text.trim(),
          tiers: Array.from(new Set(f.tiers)),
        }))
        .filter((f) => f.text.length > 0 && f.tiers.length > 0);

    const payload: ServiceInput = {
      ...data,
      features: cleanFeatures,
      tieredFeatures: cleanTiered.length > 0 ? cleanTiered : undefined,
      technologies:
        (data.technologies ?? []).map((t) => t.trim()).filter((t) => t.length > 0) ||
        undefined,
    };
    const url = isEdit ? `/api/admin/services/${service!._id}` : "/api/admin/services";
    const method = isEdit ? "PUT" : "POST";
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) { setError(json.error ?? "Something went wrong"); return; }
    setSuccess(true);
    setTimeout(() => { router.push(`/${locale}/admin/services`); router.refresh(); }, 800);
  }

  const previewCfg = TIER_CONFIG[activePreviewTier];
  const PreviewIcon = previewCfg.icon;
  const previewPrice = watchedPricing?.[activePreviewTier] || 0;
  const cleanFeatures = features.filter((f) => f.trim().length > 0);
  const cleanTieredForActive = (tieredFeatures ?? [])
    .filter(
      (f) =>
        typeof f?.text === "string" &&
        f.text.trim().length > 0 &&
        Array.isArray(f.tiers) &&
        f.tiers.includes(activePreviewTier)
    )
    .map((f) => f.text.trim());
  // Show common features for the service + any extra plan‑specific ones for the active tier
  const previewFeatures = [
    ...cleanFeatures,
    ...cleanTieredForActive.filter((text) => !cleanFeatures.includes(text)),
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');

        .asf-root * { font-family: 'DM Sans', sans-serif; box-sizing: border-box; }

        .asf-root {
          --surface: #16161a;
          --surface2: #1c1c21;
          --border: rgba(255,255,255,0.08);
          --border-focus: rgba(99,102,241,0.6);
          --text: rgba(255,255,255,0.9);
          --text-muted: rgba(255,255,255,0.35);
          --text-sub: rgba(255,255,255,0.55);
          --accent: #6366f1;
          --accent-glow: rgba(99,102,241,0.25);
          --error: #f87171;
          --error-bg: rgba(248,113,113,0.08);
          --error-border: rgba(248,113,113,0.2);
          --success: #34d399;
          --success-bg: rgba(52,211,153,0.08);
          --success-border: rgba(52,211,153,0.2);
        }

        .asf-layout {
          display: grid;
          grid-template-columns: 1fr 320px;
          gap: 24px;
          align-items: start;
          max-width: 1080px;
        }

        .asf-left { min-width: 0; }

        .asf-right {
          position: sticky;
          top: 24px;
        }

        .asf-back {
          display: inline-flex; align-items: center; gap: 7px; font-size: 13px;
          color: var(--text-muted); padding: 6px 10px 6px 6px; border-radius: 7px;
          border: 1px solid transparent; transition: all 0.15s; margin-bottom: 24px;
          cursor: pointer; background: transparent;
        }
        .asf-back:hover { color: var(--text-sub); background: rgba(255,255,255,0.04); border-color: var(--border); }

        .asf-page-header { display: flex; align-items: center; gap: 14px; margin-bottom: 28px; }
        .asf-page-icon {
          width: 44px; height: 44px; border-radius: 12px;
          background: rgba(99,102,241,0.12); border: 1px solid rgba(99,102,241,0.2);
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .asf-page-title { font-size: 22px; font-weight: 600; color: var(--text); letter-spacing: -0.04em; line-height: 1.1; }
        .asf-page-sub { font-size: 13px; color: var(--text-muted); margin-top: 2px; }

        .asf-section { background: var(--surface); border: 1px solid var(--border); border-radius: 14px; overflow: hidden; margin-bottom: 14px; }
        .asf-section-header {
          display: flex; align-items: center; gap: 10px;
          padding: 13px 18px; border-bottom: 1px solid var(--border); background: var(--surface2);
        }
        .asf-section-icon {
          width: 28px; height: 28px; border-radius: 7px; background: rgba(99,102,241,0.1);
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .asf-section-title { font-size: 13px; font-weight: 600; color: var(--text-sub); letter-spacing: -0.01em; }
        .asf-section-body { padding: 18px; }

        .asf-label { display: block; font-size: 11.5px; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase; color: var(--text-muted); margin-bottom: 7px; }

        .asf-input {
          width: 100%; background: var(--surface2); border: 1px solid var(--border);
          border-radius: 9px; padding: 10px 14px; font-size: 14px; color: var(--text);
          outline: none; transition: border-color 0.18s, box-shadow 0.18s; font-family: 'DM Sans', sans-serif;
        }
        .asf-input::placeholder { color: var(--text-muted); }
        .asf-input:focus { border-color: var(--border-focus); box-shadow: 0 0 0 3px var(--accent-glow); }
        .asf-input.err { border-color: var(--error-border); }

        .asf-textarea {
          width: 100%; background: var(--surface2); border: 1px solid var(--border);
          border-radius: 9px; padding: 10px 14px; font-size: 14px; color: var(--text);
          outline: none; transition: border-color 0.18s, box-shadow 0.18s;
          font-family: 'DM Sans', sans-serif; resize: vertical; min-height: 90px; line-height: 1.6;
        }
        .asf-textarea::placeholder { color: var(--text-muted); }
        .asf-textarea:focus { border-color: var(--border-focus); box-shadow: 0 0 0 3px var(--accent-glow); }

        .asf-field-error { font-size: 12px; color: var(--error); margin-top: 5px; display: flex; align-items: center; gap: 4px; }

        .asf-feature-row { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
        .asf-grip { color: var(--text-muted); flex-shrink: 0; cursor: grab; opacity: 0.35; }
        .asf-feat-wrap { flex: 1; position: relative; }
        .asf-feat-idx {
          position: absolute; left: 11px; top: 50%; transform: translateY(-50%);
          font-size: 10px; font-weight: 700; color: var(--text-muted); pointer-events: none;
          font-family: 'SF Mono', monospace;
        }
        .asf-feat-input {
          width: 100%; background: var(--surface2); border: 1px solid var(--border);
          border-radius: 9px; padding: 9px 12px 9px 28px; font-size: 13.5px; color: var(--text);
          outline: none; transition: border-color 0.18s, box-shadow 0.18s; font-family: 'DM Sans', sans-serif;
        }
        .asf-feat-input::placeholder { color: var(--text-muted); }
        .asf-feat-input:focus { border-color: var(--border-focus); box-shadow: 0 0 0 3px var(--accent-glow); }

        .asf-remove-btn {
          width: 32px; height: 32px; flex-shrink: 0; border-radius: 8px;
          border: 1px solid var(--border); background: transparent;
          display: flex; align-items: center; justify-content: center;
          color: var(--text-muted); cursor: pointer; transition: all 0.15s;
        }
        .asf-remove-btn:hover { background: rgba(248,113,113,0.1); border-color: rgba(248,113,113,0.25); color: #f87171; }

        .asf-add-feat {
          display: flex; align-items: center; justify-content: center; gap: 6px;
          font-size: 13px; font-weight: 500; color: var(--accent);
          background: rgba(99,102,241,0.07); border: 1px dashed rgba(99,102,241,0.3);
          border-radius: 8px; padding: 8px 14px; cursor: pointer; transition: all 0.15s;
          font-family: 'DM Sans', sans-serif; width: 100%; margin-top: 4px;
        }
        .asf-add-feat:hover { background: rgba(99,102,241,0.12); border-color: rgba(99,102,241,0.5); }

        .asf-pricing-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }

        .asf-price-card { border-radius: 11px; border: 1px solid; overflow: hidden; }
        .asf-price-header { padding: 10px 13px 9px; display: flex; align-items: center; gap: 6px; border-bottom: 1px solid; }
        .asf-price-label { font-size: 12px; font-weight: 600; }
        .asf-price-input-area { padding: 10px 13px 13px; display: flex; align-items: baseline; gap: 4px; }
        .asf-currency-sym { font-size: 16px; font-weight: 600; opacity: 0.45; flex-shrink: 0; }
        .asf-price-num {
          flex: 1; background: transparent; border: none; outline: none;
          font-size: 24px; font-weight: 700; letter-spacing: -0.05em;
          font-family: 'DM Sans', sans-serif; padding: 0; min-width: 0;
        }
        .asf-price-num::-webkit-inner-spin-button,
        .asf-price-num::-webkit-outer-spin-button { -webkit-appearance: none; }

        .asf-alert { display: flex; align-items: flex-start; gap: 10px; padding: 12px 14px; border-radius: 10px; font-size: 13.5px; margin-bottom: 14px; }
        .asf-alert.error { background: var(--error-bg); border: 1px solid var(--error-border); color: var(--error); }
        .asf-alert.success { background: var(--success-bg); border: 1px solid var(--success-border); color: var(--success); }

        .asf-footer { display: flex; align-items: center; gap: 10px; padding-top: 6px; }

        .asf-submit {
          display: inline-flex; align-items: center; gap: 7px;
          background: var(--accent); color: white; border: none; border-radius: 9px;
          padding: 10px 20px; font-size: 14px; font-weight: 500; font-family: 'DM Sans', sans-serif;
          cursor: pointer; transition: opacity 0.15s, box-shadow 0.15s; letter-spacing: -0.01em;
        }
        .asf-submit:hover:not(:disabled) { opacity: 0.88; box-shadow: 0 0 20px var(--accent-glow); }
        .asf-submit:disabled { opacity: 0.5; cursor: not-allowed; }
        .asf-submit.done { background: #10b981; }

        .asf-cancel {
          display: inline-flex; align-items: center; gap: 6px;
          background: transparent; color: var(--text-muted); border: 1px solid var(--border);
          border-radius: 9px; padding: 10px 18px; font-size: 14px;
          font-family: 'DM Sans', sans-serif; cursor: pointer; transition: all 0.15s;
        }
        .asf-cancel:hover { background: rgba(255,255,255,0.04); color: var(--text-sub); }

        /* ═══════════ PREVIEW PANEL ═══════════ */
        .asf-preview-panel {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 16px;
          overflow: hidden;
        }

        .asf-preview-bar {
          display: flex; align-items: center; gap: 8px;
          padding: 11px 16px;
          border-bottom: 1px solid var(--border);
          background: var(--surface2);
        }

        .asf-preview-bar-label { font-size: 11px; font-weight: 600; color: var(--text-muted); letter-spacing: 0.07em; text-transform: uppercase; }

        .asf-mac-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }

        .asf-tier-tabs { display: flex; gap: 4px; padding: 12px 14px 0; }
        .asf-tier-tab {
          flex: 1; display: flex; align-items: center; justify-content: center; gap: 5px;
          padding: 7px 6px; border-radius: 8px; border: 1px solid transparent;
          font-size: 12px; font-weight: 500; cursor: pointer; transition: all 0.18s;
          background: transparent; color: var(--text-muted); font-family: 'DM Sans', sans-serif;
        }
        .asf-tier-tab.active { border-color: currentColor; }
        .asf-tier-tab:not(.active):hover { background: rgba(255,255,255,0.04); color: var(--text-sub); }

        .asf-card-inner { padding: 16px; }

        /* Glow strip at top of card */
        .asf-card-glow {
          height: 2px;
          border-radius: 0;
          transition: background 0.3s;
          margin: 0 -16px 16px;
        }

        .asf-card-badge {
          display: inline-flex; align-items: center; gap: 5px;
          font-size: 11px; font-weight: 600; padding: 3px 10px 3px 7px;
          border-radius: 20px; margin-bottom: 12px; letter-spacing: 0.02em;
        }

        .asf-card-name { font-size: 18px; font-weight: 600; color: var(--text); letter-spacing: -0.03em; margin-bottom: 5px; min-height: 26px; }
        .asf-card-name.empty { color: rgba(255,255,255,0.2); font-style: italic; font-weight: 400; }

        .asf-card-desc { font-size: 12.5px; color: var(--text-muted); line-height: 1.55; margin-bottom: 18px; min-height: 38px; }

        .asf-card-price-block { margin-bottom: 16px; }

        .asf-card-price-row { display: flex; align-items: flex-end; gap: 5px; }
        .asf-card-cur { font-size: 20px; font-weight: 500; margin-bottom: 6px; opacity: 0.55; }
        .asf-card-amount { font-size: 52px; font-weight: 800; letter-spacing: -0.07em; line-height: 1; transition: color 0.25s; }
        .asf-card-per { font-size: 13px; color: var(--text-muted); margin-bottom: 8px; }

        .asf-card-divider { height: 1px; background: rgba(255,255,255,0.06); margin-bottom: 14px; }

        .asf-card-features { display: flex; flex-direction: column; gap: 10px; margin-bottom: 18px; min-height: 40px; }

        .asf-card-feat { display: flex; align-items: flex-start; gap: 9px; font-size: 13px; color: rgba(255,255,255,0.62); line-height: 1.4; }

        .asf-feat-bullet {
          width: 18px; height: 18px; border-radius: 50%; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center; margin-top: 1px;
        }

        .asf-card-feat-empty { font-size: 12px; color: rgba(255,255,255,0.18); font-style: italic; text-align: center; padding: 6px 0; }

        .asf-card-cta {
          width: 100%; padding: 11px 16px; border-radius: 10px; border: none;
          font-size: 14px; font-weight: 600; font-family: 'DM Sans', sans-serif;
          cursor: default; display: flex; align-items: center; justify-content: center; gap: 7px;
          color: white; letter-spacing: -0.01em;
        }

        /* Compare strip */
        .asf-compare {
          display: flex; border-top: 1px solid var(--border);
        }
        .asf-compare-cell {
          flex: 1; padding: 10px 6px; text-align: center; cursor: pointer;
          border-right: 1px solid var(--border); transition: background 0.15s;
        }
        .asf-compare-cell:last-child { border-right: none; }
        .asf-compare-cell:hover { background: rgba(255,255,255,0.02); }
        .asf-compare-cell.sel { background: rgba(255,255,255,0.03); }
        .asf-compare-tier { font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; opacity: 0.55; margin-bottom: 2px; }
        .asf-compare-price { font-size: 14px; font-weight: 700; letter-spacing: -0.04em; }

        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

        @media (max-width: 900px) {
          .asf-layout { grid-template-columns: 1fr; }
          .asf-right { position: static; }
        }
        @media (max-width: 560px) {
          .asf-pricing-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="asf-root">
        <button className="asf-back" onClick={() => router.back()}>
          <ArrowLeft size={14} strokeWidth={2.5} /> Back to services
        </button>

        <div className="asf-page-header">
          <div className="asf-page-icon"><Package size={20} color="#818cf8" strokeWidth={1.75} /></div>
          <div>
            <div className="asf-page-title">{isEdit ? `Edit "${service!.title}"` : "New Service"}</div>
            <div className="asf-page-sub">{isEdit ? "Update service details, features, and pricing." : "Fill in the details to create a new service listing."}</div>
          </div>
        </div>

        <div className="asf-layout">
          {/* ── FORM ── */}
          <div className="asf-left">
            <form onSubmit={handleSubmit(onSubmit)}>
              {error && (
                <div className="asf-alert error">
                  <AlertCircle size={16} strokeWidth={2} style={{ flexShrink: 0, marginTop: 1 }} />
                  <span>{error}</span>
                </div>
              )}
              {success && (
                <div className="asf-alert success">
                  <CheckCircle2 size={16} strokeWidth={2} style={{ flexShrink: 0, marginTop: 1 }} />
                  <span>{isEdit ? "Service updated!" : "Service created!"} Redirecting…</span>
                </div>
              )}

              {/* Basic info */}
              <div className="asf-section">
                <div className="asf-section-header">
                  <div className="asf-section-icon"><FileText size={14} color="#818cf8" strokeWidth={2} /></div>
                  <span className="asf-section-title">Basic Information</span>
                </div>
                <div className="asf-section-body" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div>
                    <label className="asf-label">Service title</label>
                    <input className={`asf-input ${errors.title ? "err" : ""}`} placeholder="e.g. Portfolio Website" {...register("title")} />
                    {errors.title && <div className="asf-field-error"><AlertCircle size={11} strokeWidth={2} />{errors.title.message}</div>}
                  </div>
                  <div>
                    <label className="asf-label">Description</label>
                    <textarea className="asf-textarea" placeholder="Describe what this service includes…" {...register("description")} />
                    {errors.description && <div className="asf-field-error"><AlertCircle size={11} strokeWidth={2} />{errors.description.message}</div>}
                  </div>
                  <div>
                    <label className="asf-label">Short tagline (optional)</label>
                    <input
                      className="asf-input"
                      placeholder="Turn your work into a powerful personal brand"
                      {...register("shortTagline")}
                    />
                  </div>
                </div>
              </div>

              {/* Service image */}
              <div className="asf-section">
                <div className="asf-section-header">
                  <div className="asf-section-icon"><ImageIcon size={14} color="#818cf8" strokeWidth={2} /></div>
                  <span className="asf-section-title">Service image</span>
                </div>
                <div className="asf-section-body" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div style={{ display: "flex", gap: 8, marginBottom: 4 }}>
                    <button
                      type="button"
                      onClick={() => setImageMode("url")}
                      style={{
                        flex: 1,
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 6,
                        padding: "7px 10px",
                        borderRadius: 999,
                        border: "1px solid",
                        borderColor:
                          imageMode === "url" ? "rgba(129,140,248,0.8)" : "rgba(255,255,255,0.12)",
                        background:
                          imageMode === "url" ? "rgba(79,70,229,0.12)" : "transparent",
                        color:
                          imageMode === "url" ? "#e5e7eb" : "rgba(229,231,235,0.7)",
                        fontSize: 11.5,
                        cursor: "pointer",
                      }}
                    >
                      <Link2 size={12} />
                      URL
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageMode("upload")}
                      style={{
                        flex: 1,
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 6,
                        padding: "7px 10px",
                        borderRadius: 999,
                        border: "1px solid",
                        borderColor:
                          imageMode === "upload" ? "rgba(129,140,248,0.8)" : "rgba(255,255,255,0.12)",
                        background:
                          imageMode === "upload" ? "rgba(79,70,229,0.12)" : "transparent",
                        color:
                          imageMode === "upload" ? "#e5e7eb" : "rgba(229,231,235,0.7)",
                        fontSize: 11.5,
                        cursor: "pointer",
                      }}
                    >
                      <Upload size={12} />
                      Upload
                    </button>
                  </div>

                  {imageMode === "url" ? (
                    <div>
                      <label className="asf-label">Image URL</label>
                      <input
                        className="asf-input"
                        placeholder="https://…"
                        {...register("image")}
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="asf-label">Upload image (Cloudinary)</label>
                      <label
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 6,
                          borderRadius: 12,
                          border: "1px dashed rgba(255,255,255,0.25)",
                          padding: 16,
                          cursor: "pointer",
                          background: "rgba(15,23,42,0.7)",
                        }}
                      >
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: "none" }}
                          onChange={(e) => handleImageFile(e.target.files?.[0] ?? null)}
                        />
                        <Upload size={18} />
                        <span style={{ fontSize: 12, color: "rgba(229,231,235,0.8)" }}>
                          {uploadingImage ? "Uploading…" : "Click to choose an image file"}
                        </span>
                      </label>
                      {imageUploadError && (
                        <div className="asf-field-error" style={{ marginTop: 6 }}>
                          <AlertCircle size={11} strokeWidth={2} />
                          {imageUploadError}
                        </div>
                      )}
                    </div>
                  )}

                  {watchedImage && (
                    <div
                      style={{
                        marginTop: 8,
                        borderRadius: 12,
                        border: "1px solid rgba(255,255,255,0.12)",
                        overflow: "hidden",
                        background: "rgba(15,23,42,0.9)",
                      }}
                    >
                      <img
                        src={watchedImage}
                        alt=""
                        style={{
                          width: "100%",
                          maxHeight: 200,
                          objectFit: "cover",
                          display: "block",
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Features */}
              <div className="asf-section">
                <div className="asf-section-header">
                  <div className="asf-section-icon"><List size={14} color="#818cf8" strokeWidth={2} /></div>
                  <span className="asf-section-title">Features</span>
                  <span style={{ marginLeft: "auto", fontSize: 11.5, color: "rgba(255,255,255,0.22)" }}>{cleanFeatures.length} added</span>
                </div>
                <div className="asf-section-body">
                  {features.map((_, i) => (
                    <div key={i} className="asf-feature-row">
                      <GripVertical size={14} className="asf-grip" strokeWidth={2} />
                      <div className="asf-feat-wrap">
                        <span className="asf-feat-idx">{String(i + 1).padStart(2, "0")}</span>
                        <input className="asf-feat-input" placeholder={`Feature ${i + 1}…`} {...register(`features.${i}`)} />
                      </div>
                      <button type="button" className="asf-remove-btn" onClick={() => setValue("features", features.filter((_, j) => j !== i))}>
                        <Trash2 size={13} strokeWidth={2} />
                      </button>
                    </div>
                  ))}
                  <button type="button" className="asf-add-feat" onClick={() => setValue("features", [...features, ""])}>
                    <Plus size={14} strokeWidth={2.5} /> Add feature
                  </button>
                  <button
                    type="button"
                    className="asf-add-feat"
                    style={{
                      marginTop: 6,
                      borderStyle: "dashed",
                      background: "transparent",
                      borderColor: "rgba(129,140,248,0.4)",
                    }}
                    onClick={() => setShowBulkFeatures((v) => !v)}
                  >
                    <Rows size={14} strokeWidth={2.4} />
                    {showBulkFeatures ? "Hide bulk add" : "Bulk add from text"}
                  </button>
                  {showBulkFeatures && (
                    <div style={{ marginTop: 10 }}>
                      <label className="asf-label">Paste features (one per line)</label>
                      <textarea
                        className="asf-textarea"
                        rows={4}
                        placeholder={`Homepage\nAbout page\nContact form`}
                        value={bulkFeaturesText}
                        onChange={(e) => setBulkFeaturesText(e.target.value)}
                      />
                      <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
                        <button
                          type="button"
                          className="asf-submit"
                          style={{ padding: "6px 14px", fontSize: 13 }}
                          onClick={handleApplyBulkFeatures}
                        >
                          Apply features
                        </button>
                        <button
                          type="button"
                          className="asf-cancel"
                          style={{ padding: "6px 14px", fontSize: 13 }}
                          onClick={() => {
                            setShowBulkFeatures(false);
                            setBulkFeaturesText("");
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                  {errors.features && <div className="asf-field-error" style={{ marginTop: 8 }}><AlertCircle size={11} strokeWidth={2} />{errors.features.message as string}</div>}
                </div>
              </div>

              {/* Plan-specific features (optional) */}
              <div className="asf-section">
                <div className="asf-section-header">
                  <div className="asf-section-icon"><Layers size={14} color="#818cf8" strokeWidth={2} /></div>
                  <span className="asf-section-title">Plan-specific features (optional)</span>
                </div>
                <div className="asf-section-body" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {tieredFeatures.map((feat, i) => (
                    <div key={i} style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 4 }}>
                      <div className="asf-feature-row" style={{ marginBottom: 0 }}>
                        <div className="asf-feat-wrap">
                          <span className="asf-feat-idx">{String(i + 1).padStart(2, "0")}</span>
                          <input
                            className="asf-feat-input"
                            placeholder={`Feature ${i + 1}…`}
                            {...register(`tieredFeatures.${i}.text` as const)}
                          />
                        </div>
                        <button
                          type="button"
                          className="asf-remove-btn"
                          onClick={() =>
                            setValue(
                              "tieredFeatures",
                              tieredFeatures.filter((_, j) => j !== i)
                            )
                          }
                        >
                          <Trash2 size={13} strokeWidth={2} />
                        </button>
                      </div>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", paddingLeft: 28 }}>
                        {(["basic", "pro", "premium"] as const).map((tierKey) => {
                          const tierCfg = TIER_CONFIG[tierKey];
                          const selected = feat.tiers?.includes(tierKey);
                          const Icon = tierCfg.icon;
                          return (
                            <button
                              key={tierKey}
                              type="button"
                              onClick={() => {
                                const current = tieredFeatures[i]?.tiers ?? [];
                                const next = selected
                                  ? current.filter((t) => t !== tierKey)
                                  : [...current, tierKey];
                                const updated = tieredFeatures.map((f, idx) =>
                                  idx === i ? { ...f, tiers: next } : f
                                );
                                setValue("tieredFeatures", updated, { shouldDirty: true });
                              }}
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 6,
                                padding: "4px 10px",
                                borderRadius: 999,
                                border: "1px solid",
                                borderColor: selected ? tierCfg.border : "rgba(255,255,255,0.14)",
                                background: selected ? tierCfg.bg : "transparent",
                                color: selected ? tierCfg.color : "rgba(255,255,255,0.6)",
                                fontSize: 11.5,
                                cursor: "pointer",
                              }}
                            >
                              <Icon size={11} strokeWidth={2.4} />
                              {tierCfg.label}
                              {selected && <Check size={11} strokeWidth={2.5} />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="asf-add-feat"
                    onClick={() =>
                      setValue("tieredFeatures", [
                        ...tieredFeatures,
                        { text: "", tiers: ["basic"] },
                      ])
                    }
                  >
                    <Plus size={14} strokeWidth={2.5} /> Add plan feature
                  </button>
                </div>
              </div>

              {/* Technologies (optional) */}
              <div className="asf-section">
                <div className="asf-section-header">
                  <div className="asf-section-icon"><Layers size={14} color="#818cf8" strokeWidth={2} /></div>
                  <span className="asf-section-title">Technologies (optional)</span>
                </div>
                <div className="asf-section-body">
                  <label className="asf-label">Tech stack</label>
                  <textarea
                    className="asf-textarea"
                    rows={3}
                    placeholder="One technology per line, e.g.&#10;React / Next.js&#10;Tailwind CSS&#10;Node.js API"
                    value={watchedTechnologies.join("\n")}
                    onChange={(e) =>
                      setValue(
                        "technologies",
                        e.target.value
                          .split(/\r?\n/)
                          .map((x) => x.trim())
                          .filter((x) => x.length > 0),
                        { shouldDirty: true }
                      )
                    }
                  />
                </div>
              </div>

              {/* Pricing */}
              <div className="asf-section">
                <div className="asf-section-header">
                  <div className="asf-section-icon"><DollarSign size={14} color="#818cf8" strokeWidth={2} /></div>
                  <span className="asf-section-title">Pricing & delivery</span>
                </div>
                <div className="asf-section-body">
                  <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8, gap: 8 }}>
                    <span className="asf-label" style={{ marginBottom: 0 }}>Currency</span>
                    <input
                      className="asf-input"
                      style={{ maxWidth: 90, paddingInline: 10, textTransform: "uppercase" }}
                      {...register("currency")}
                    />
                  </div>
                  <div className="asf-pricing-grid">
                    {(Object.entries(TIER_CONFIG) as [keyof typeof TIER_CONFIG, typeof TIER_CONFIG[keyof typeof TIER_CONFIG]][]).map(([key, cfg]) => {
                      const TierIcon = cfg.icon;
                      const hasError = errors.pricing?.[key];
                      return (
                        <div key={key} className="asf-price-card" style={{ background: cfg.bg, borderColor: hasError ? "rgba(248,113,113,0.4)" : cfg.border }}>
                          <div className="asf-price-header" style={{ borderBottomColor: cfg.border }}>
                            <TierIcon size={12} strokeWidth={2.5} color={cfg.color} />
                            <span className="asf-price-label" style={{ color: cfg.color }}>{cfg.label}</span>
                          </div>
                          <div className="asf-price-input-area">
                            <span className="asf-currency-sym" style={{ color: cfg.color }}>₹</span>
                            <input type="number" min={0} className="asf-price-num" style={{ color: cfg.color }}
                              {...register(`pricing.${key}`, { valueAsNumber: true })} />
                          </div>
                          <div style={{ padding: "0 13px 12px", fontSize: 11, color: "rgba(255,255,255,0.6)" }}>
                            <span style={{ opacity: 0.7 }}>Delivery:</span>{" "}
                            <input
                              className="asf-input"
                              style={{ marginTop: 4, fontSize: 11, paddingBlock: 6 }}
                              placeholder="e.g. 7-10 working days"
                              {...register(`deliveryTime.${key}` as const)}
                            />
                          </div>
                          {hasError && <div className="asf-field-error" style={{ padding: "0 13px 10px" }}><AlertCircle size={11} strokeWidth={2} />{hasError.message}</div>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="asf-footer">
                <button type="submit" className={`asf-submit ${success ? "done" : ""}`} disabled={isSubmitting || success}>
                  {success ? (<><CheckCircle2 size={15} strokeWidth={2.5} />{isEdit ? "Updated!" : "Created!"}</>)
                    : isSubmitting ? (<><Loader2 size={15} strokeWidth={2.5} style={{ animation: "spin 1s linear infinite" }} />Saving…</>)
                    : isEdit ? (<><Sparkles size={15} strokeWidth={2.5} />Update service</>)
                    : (<><Plus size={15} strokeWidth={2.5} />Create service</>)}
                </button>
                <button type="button" className="asf-cancel" onClick={() => router.back()}>Cancel</button>
              </div>
            </form>
          </div>

          {/* ── LIVE PREVIEW ── */}
          <div className="asf-right">
            <div className="asf-preview-panel">
              {/* macOS-style bar */}
              <div className="asf-preview-bar">
                <div className="asf-mac-dot" style={{ background: "#ef4444", opacity: 0.7 }} />
                <div className="asf-mac-dot" style={{ background: "#f59e0b", opacity: 0.7 }} />
                <div className="asf-mac-dot" style={{ background: "#22c55e", opacity: 0.7 }} />
                <Eye size={12} color="rgba(255,255,255,0.25)" strokeWidth={2} style={{ marginLeft: 6 }} />
                <span className="asf-preview-bar-label">Live preview</span>
              </div>

              {/* Tier selector */}
              <div className="asf-tier-tabs">
                {(Object.entries(TIER_CONFIG) as [keyof typeof TIER_CONFIG, typeof TIER_CONFIG[keyof typeof TIER_CONFIG]][]).map(([key, cfg]) => {
                  const TabIcon = cfg.icon;
                  const isActive = activePreviewTier === key;
                  return (
                    <button key={key} type="button"
                      className={`asf-tier-tab ${isActive ? "active" : ""}`}
                      style={{
                        color: isActive ? cfg.color : undefined,
                        borderColor: isActive ? cfg.border : "transparent",
                        background: isActive ? cfg.bg : undefined,
                      }}
                      onClick={() => setActivePreviewTier(key)}
                    >
                      <TabIcon size={11} strokeWidth={2.5} />
                      {cfg.label}
                    </button>
                  );
                })}
              </div>

              {/* Card content */}
              <div className="asf-card-inner">
                {/* Top color strip */}
                <div className="asf-card-glow" style={{ background: `linear-gradient(90deg, ${previewCfg.color}80, transparent)` }} />

                {/* Badge */}
                <div className="asf-card-badge" style={{ background: previewCfg.badgeBg, border: `1px solid ${previewCfg.border}`, color: previewCfg.color }}>
                  <PreviewIcon size={11} strokeWidth={2.5} />
                  {previewCfg.badge}
                </div>

                {/* Name */}
                <div className={`asf-card-name ${!watchedTitle ? "empty" : ""}`}>
                  {watchedTitle || "Service name…"}
                </div>

                {/* Description */}
                <div className="asf-card-desc">
                  {watchedDescription || <span style={{ color: "rgba(255,255,255,0.18)", fontStyle: "italic" }}>No description added yet…</span>}
                </div>

                {/* Price */}
                <div className="asf-card-price-block">
                  <div className="asf-card-price-row">
                    <span className="asf-card-cur" style={{ color: previewCfg.color }}>₹</span>
                    <span className="asf-card-amount" style={{ color: previewCfg.color }}>
                      {previewPrice.toLocaleString("en-IN")}
                    </span>
                    <span className="asf-card-per">/ project</span>
                  </div>
                </div>

                <div className="asf-card-divider" />

                {/* Features */}
                <div className="asf-card-features">
                  {previewFeatures.length > 0 ? (
                    previewFeatures.map((feat, i) => (
                      <div key={i} className="asf-card-feat">
                        <div className="asf-feat-bullet" style={{ background: previewCfg.bg, border: `1px solid ${previewCfg.border}` }}>
                          <Check size={10} strokeWidth={3} color={previewCfg.color} />
                        </div>
                        <span>{feat}</span>
                      </div>
                    ))
                  ) : (
                    <div className="asf-card-feat-empty">Add features to see them here</div>
                  )}
                </div>

                {/* CTA */}
                <button type="button" className="asf-card-cta"
                  style={{ background: `linear-gradient(135deg, ${previewCfg.color}cc, ${previewCfg.color}88)`, boxShadow: `0 4px 20px ${previewCfg.color}30` }}
                >
                  <PreviewIcon size={14} strokeWidth={2.5} />
                  Get {previewCfg.label} Plan
                </button>
              </div>

              {/* Price compare strip */}
              <div className="asf-compare">
                {(Object.entries(TIER_CONFIG) as [keyof typeof TIER_CONFIG, typeof TIER_CONFIG[keyof typeof TIER_CONFIG]][]).map(([key, cfg]) => (
                  <div key={key}
                    className={`asf-compare-cell ${activePreviewTier === key ? "sel" : ""}`}
                    onClick={() => setActivePreviewTier(key)}
                  >
                    <div className="asf-compare-tier" style={{ color: cfg.color }}>{cfg.label}</div>
                    <div className="asf-compare-price" style={{ color: activePreviewTier === key ? cfg.color : "rgba(255,255,255,0.45)" }}>
                      {watchedPricing?.[key] ? `₹${Number(watchedPricing[key]).toLocaleString("en-IN")}` : "—"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}