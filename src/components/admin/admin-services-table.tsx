"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Service } from "@/types";
import { useState } from "react";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Package,
  TrendingUp,
  Layers,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Sparkles,
  Zap,
  Crown,
} from "lucide-react";

type ServiceRow = Service & { _id: string };
type SortKey = "title" | "basic" | "pro" | "premium";
type SortDir = "asc" | "desc";

const TIER_CONFIG = {
  basic: {
    label: "Basic",
    icon: Zap,
    color: "#60a5fa",
    bg: "rgba(96,165,250,0.08)",
    border: "rgba(96,165,250,0.18)",
    glow: "rgba(96,165,250,0.3)",
  },
  pro: {
    label: "Pro",
    icon: Sparkles,
    color: "#a78bfa",
    bg: "rgba(167,139,250,0.08)",
    border: "rgba(167,139,250,0.18)",
    glow: "rgba(167,139,250,0.3)",
  },
  premium: {
    label: "Premium",
    icon: Crown,
    color: "#fbbf24",
    bg: "rgba(251,191,36,0.08)",
    border: "rgba(251,191,36,0.18)",
    glow: "rgba(251,191,36,0.3)",
  },
};

function PriceCell({ amount, tier }: { amount: number; tier: keyof typeof TIER_CONFIG }) {
  const cfg = TIER_CONFIG[tier];
  const TierIcon = cfg.icon;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <div style={{
        display: "inline-flex",
        alignItems: "baseline",
        gap: 2,
      }}>
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", fontWeight: 400 }}>₹</span>
        <span style={{
          fontSize: 16,
          fontWeight: 600,
          color: cfg.color,
          letterSpacing: "-0.04em",
          lineHeight: 1,
        }}>
          {amount.toLocaleString()}
        </span>
      </div>
      <div style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        fontSize: 11,
        color: cfg.color,
        background: cfg.bg,
        border: `1px solid ${cfg.border}`,
        padding: "2px 7px 2px 5px",
        borderRadius: 20,
        width: "fit-content",
        fontWeight: 500,
        opacity: 0.85,
      }}>
        <TierIcon size={10} strokeWidth={2.5} />
        {cfg.label}
      </div>
    </div>
  );
}

function ServiceIcon({ title }: { title: string }) {
  const GRADIENTS = [
    ["#6366f1", "#818cf8"],
    ["#8b5cf6", "#a78bfa"],
    ["#06b6d4", "#22d3ee"],
    ["#10b981", "#34d399"],
    ["#f59e0b", "#fbbf24"],
    ["#ef4444", "#f87171"],
    ["#ec4899", "#f472b6"],
    ["#14b8a6", "#2dd4bf"],
  ];
  const idx = title.charCodeAt(0) % GRADIENTS.length;
  const [c1, c2] = GRADIENTS[idx];
  const letter = title[0].toUpperCase();
  return (
    <div style={{
      width: 36,
      height: 36,
      borderRadius: 9,
      background: `linear-gradient(135deg, ${c1}, ${c2})`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
      fontSize: 14,
      fontWeight: 700,
      color: "white",
      letterSpacing: "-0.02em",
      boxShadow: `0 4px 12px ${c1}40`,
    }}>
      {letter}
    </div>
  );
}

export function AdminServicesTable({
  locale,
  services,
}: {
  locale: string;
  services: ServiceRow[];
}) {
  const router = useRouter();
  const base = `/${locale}/admin/services`;

  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("title");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  };

  async function handleDelete(id: string) {
    if (!confirm("Delete this service?")) return;
    setDeletingId(id);
    const res = await fetch(`/api/admin/services/${id}`, { method: "DELETE" });
    setDeletingId(null);
    if (res.ok) router.refresh();
    else alert("Failed to delete");
  }

  const filtered = services
    .filter((s) => s.title.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortKey === "title") {
        return sortDir === "asc"
          ? a.title.localeCompare(b.title)
          : b.title.localeCompare(a.title);
      }
      const av = a.pricing[sortKey] as number;
      const bv = b.pricing[sortKey] as number;
      return sortDir === "asc" ? av - bv : bv - av;
    });

  const avgBasic = services.length
    ? Math.round(services.reduce((s, x) => s + x.pricing.basic, 0) / services.length)
    : 0;
  const avgPremium = services.length
    ? Math.round(services.reduce((s, x) => s + x.pricing.premium, 0) / services.length)
    : 0;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');

        .ast-wrap * { font-family: 'DM Sans', sans-serif; }

        .ast-wrap {
          --surface: #16161a;
          --surface2: #1c1c21;
          --border: rgba(255,255,255,0.07);
          --border2: rgba(255,255,255,0.04);
          --text: rgba(255,255,255,0.88);
          --text-muted: rgba(255,255,255,0.35);
          --text-sub: rgba(255,255,255,0.55);
          --accent: #6366f1;
          --accent-glow: rgba(99,102,241,0.25);
          --row-hover: rgba(255,255,255,0.02);
        }

        .ast-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
          margin-bottom: 20px;
        }

        .ast-stat {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 14px 16px;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .ast-stat-icon {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .ast-stat-val {
          font-size: 20px;
          font-weight: 600;
          color: var(--text);
          letter-spacing: -0.04em;
          line-height: 1;
        }

        .ast-stat-label {
          font-size: 11.5px;
          color: var(--text-muted);
          margin-top: 2px;
        }

        .ast-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 14px;
        }

        .ast-search-wrap {
          position: relative;
          flex: 1;
          max-width: 300px;
        }

        .ast-search-icon {
          position: absolute;
          left: 11px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
          pointer-events: none;
        }

        .ast-search {
          width: 100%;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 8px 12px 8px 34px;
          font-size: 13px;
          color: var(--text);
          outline: none;
          transition: border-color 0.18s, box-shadow 0.18s;
          font-family: 'DM Sans', sans-serif;
        }

        .ast-search::placeholder { color: var(--text-muted); }
        .ast-search:focus {
          border-color: rgba(99,102,241,0.5);
          box-shadow: 0 0 0 3px var(--accent-glow);
        }

        .ast-new-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: var(--accent);
          color: white;
          border: none;
          border-radius: 8px;
          padding: 8px 14px;
          font-size: 13px;
          font-weight: 500;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          text-decoration: none;
          transition: opacity 0.15s, box-shadow 0.15s;
          letter-spacing: -0.01em;
          white-space: nowrap;
        }

        .ast-new-btn:hover {
          opacity: 0.88;
          box-shadow: 0 0 16px var(--accent-glow);
        }

        .ast-table-wrap {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 14px;
          overflow: hidden;
        }

        .ast-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }

        .ast-thead tr {
          border-bottom: 1px solid var(--border);
          background: var(--surface2);
        }

        .ast-th {
          padding: 11px 14px;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          color: var(--text-muted);
          cursor: pointer;
          user-select: none;
          white-space: nowrap;
          transition: color 0.15s;
        }

        .ast-th:hover { color: var(--text-sub); }
        .ast-th.active { color: var(--accent); }

        .ast-th-inner {
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .ast-sort-icon { opacity: 0.5; }
        .ast-th.active .ast-sort-icon { opacity: 1; }

        .ast-row {
          border-bottom: 1px solid var(--border2);
          transition: background 0.12s;
        }

        .ast-row:last-child { border-bottom: none; }
        .ast-row:hover { background: var(--row-hover); }
        .ast-row.deleting { opacity: 0.4; pointer-events: none; }

        .ast-td {
          padding: 14px 14px;
          vertical-align: middle;
        }

        .ast-service-cell {
          display: flex;
          align-items: center;
          gap: 11px;
        }

        .ast-service-name {
          font-size: 14px;
          font-weight: 500;
          color: var(--text);
          letter-spacing: -0.02em;
        }

        .ast-service-id {
          font-size: 10.5px;
          color: var(--text-muted);
          font-family: 'SF Mono', 'Fira Code', monospace;
          margin-top: 2px;
        }

        .ast-action-btn {
          width: 30px;
          height: 30px;
          border-radius: 7px;
          border: 1px solid var(--border);
          background: transparent;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.15s;
          color: var(--text-muted);
          text-decoration: none;
          flex-shrink: 0;
        }

        .ast-action-btn:hover {
          background: rgba(255,255,255,0.06);
          color: var(--text);
          border-color: rgba(255,255,255,0.12);
        }

        .ast-action-btn.danger:hover {
          background: rgba(239,68,68,0.1);
          color: #f87171;
          border-color: rgba(239,68,68,0.25);
        }

        .ast-divider {
          width: 1px;
          height: 18px;
          background: var(--border);
          flex-shrink: 0;
        }

        .ast-empty {
          padding: 60px 24px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
        }

        .ast-empty-icon {
          width: 52px;
          height: 52px;
          border-radius: 14px;
          background: rgba(255,255,255,0.04);
          border: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-muted);
          margin-bottom: 4px;
        }

        .ast-no-results {
          padding: 40px;
          text-align: center;
          color: var(--text-muted);
          font-size: 13.5px;
        }

        .ast-count {
          font-size: 12.5px;
          color: var(--text-muted);
          white-space: nowrap;
        }

        .ast-count strong { color: var(--text-sub); font-weight: 500; }

        /* Tier header pills */
        .ast-tier-header {
          display: inline-flex;
          align-items: center;
          gap: 5px;
        }
      `}</style>

      <div className="ast-wrap">
        {/* Stats */}
        <div className="ast-stats">
          <div className="ast-stat">
            <div className="ast-stat-icon" style={{ background: "rgba(99,102,241,0.12)" }}>
              <Package size={17} color="#818cf8" strokeWidth={1.75} />
            </div>
            <div>
              <div className="ast-stat-val">{services.length}</div>
              <div className="ast-stat-label">Total services</div>
            </div>
          </div>
          <div className="ast-stat">
            <div className="ast-stat-icon" style={{ background: "rgba(96,165,250,0.1)" }}>
              <Zap size={17} color="#60a5fa" strokeWidth={1.75} />
            </div>
            <div>
              <div className="ast-stat-val">₹{avgBasic.toLocaleString()}</div>
              <div className="ast-stat-label">Avg. Basic price</div>
            </div>
          </div>
          <div className="ast-stat">
            <div className="ast-stat-icon" style={{ background: "rgba(167,139,250,0.1)" }}>
              <Sparkles size={17} color="#a78bfa" strokeWidth={1.75} />
            </div>
            <div>
              <div className="ast-stat-val">₹{avgPremium.toLocaleString()}</div>
              <div className="ast-stat-label">Avg. Premium price</div>
            </div>
          </div>
          <div className="ast-stat">
            <div className="ast-stat-icon" style={{ background: "rgba(16,185,129,0.1)" }}>
              <TrendingUp size={17} color="#34d399" strokeWidth={1.75} />
            </div>
            <div>
              <div className="ast-stat-val">
                {services.length > 0
                  ? `${Math.round(
                      ((services.reduce((s, x) => s + x.pricing.premium, 0) /
                        services.reduce((s, x) => s + x.pricing.basic, 0)) -
                        1) * 100
                    )}%`
                  : "—"}
              </div>
              <div className="ast-stat-label">Basic → Premium lift</div>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="ast-toolbar">
          <div className="ast-search-wrap">
            <Search size={14} className="ast-search-icon" strokeWidth={2} />
            <input
              className="ast-search"
              placeholder="Search services…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div className="ast-count">
              <strong>{filtered.length}</strong> of <strong>{services.length}</strong>
            </div>
            <Link href={`${base}/new`} className="ast-new-btn">
              <Plus size={14} strokeWidth={2.5} />
              New service
            </Link>
          </div>
        </div>

        {/* Table */}
        {services.length === 0 ? (
          <div className="ast-table-wrap">
            <div className="ast-empty">
              <div className="ast-empty-icon">
                <Package size={24} strokeWidth={1.5} />
              </div>
              <div>
                <div style={{ fontWeight: 500, color: "rgba(255,255,255,0.5)", marginBottom: 4, fontSize: 14 }}>
                  No services yet
                </div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.28)" }}>
                  Add your first service to start selling.
                </div>
              </div>
              <Link href={`${base}/new`} className="ast-new-btn" style={{ marginTop: 8 }}>
                <Plus size={14} strokeWidth={2.5} />
                Add service
              </Link>
            </div>
          </div>
        ) : (
          <div className="ast-table-wrap">
            <div style={{ overflowX: "auto" }}>
              <table className="ast-table">
                <thead className="ast-thead">
                  <tr>
                    {(
                      [
                        { key: "title", label: "Service" },
                        { key: "basic", label: "Basic", tier: "basic" },
                        { key: "pro", label: "Pro", tier: "pro" },
                        { key: "premium", label: "Premium", tier: "premium" },
                        { key: "actions", label: "", noSort: true },
                      ] as { key: string; label: string; tier?: keyof typeof TIER_CONFIG; noSort?: boolean }[]
                    ).map(({ key, label, tier, noSort }) => {
                      const isActive = sortKey === key;
                      const Icon = !isActive
                        ? ChevronsUpDown
                        : sortDir === "asc"
                        ? ChevronUp
                        : ChevronDown;
                      const cfg = tier ? TIER_CONFIG[tier] : null;
                      const TierIcon = cfg?.icon;
                      return (
                        <th
                          key={key}
                          className={`ast-th ${isActive ? "active" : ""}`}
                          onClick={() => !noSort && handleSort(key as SortKey)}
                          style={{
                            cursor: noSort ? "default" : "pointer",
                            width: key === "actions" ? 80 : undefined,
                          }}
                        >
                          <div className="ast-th-inner">
                            {cfg && TierIcon && (
                              <TierIcon size={11} strokeWidth={2.5} color={cfg.color} style={{ opacity: 0.7 }} />
                            )}
                            {label}
                            {!noSort && <Icon size={12} strokeWidth={2.2} className="ast-sort-icon" />}
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="ast-no-results">
                        No services match your search.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((s) => (
                      <tr
                        key={s._id}
                        className={`ast-row ${deletingId === s._id ? "deleting" : ""}`}
                      >
                        {/* Service */}
                        <td className="ast-td">
                          <div className="ast-service-cell">
                            <ServiceIcon title={s.title} />
                            <div>
                              <div className="ast-service-name">{s.title}</div>
                              <div className="ast-service-id">#{s._id.slice(-6)}</div>
                            </div>
                          </div>
                        </td>

                        {/* Prices */}
                        {(["basic", "pro", "premium"] as const).map((tier) => (
                          <td key={tier} className="ast-td">
                            <PriceCell amount={s.pricing[tier]} tier={tier} />
                          </td>
                        ))}

                        {/* Actions */}
                        <td className="ast-td">
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <Link
                              href={`${base}/${s._id}/edit`}
                              className="ast-action-btn"
                              title="Edit service"
                            >
                              <Pencil size={13} strokeWidth={2} />
                            </Link>
                            <div className="ast-divider" />
                            <button
                              className="ast-action-btn danger"
                              title="Delete service"
                              onClick={() => handleDelete(s._id)}
                            >
                              <Trash2 size={13} strokeWidth={2} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </>
  );
}