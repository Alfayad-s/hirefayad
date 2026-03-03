"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Pencil,
  Trash2,
  Ticket,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Clock,
  PercentCircle,
  Search,
  Plus,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Zap,
} from "lucide-react";
import type { Coupon } from "@/types";
import { useState } from "react";

type CouponRow = Coupon & { _id: string };
type SortKey = "code" | "discountPercentage" | "usedCount" | "expiryDate";
type SortDir = "asc" | "desc";

function getStatus(c: CouponRow) {
  const expiry = new Date(c.expiryDate as string | Date);
  if (!c.isActive) return "inactive";
  if (expiry < new Date()) return "expired";
  return "active";
}

const STATUS_CONFIG = {
  active: {
    label: "Active",
    icon: CheckCircle2,
    color: "#10b981",
    bg: "rgba(16,185,129,0.1)",
    border: "rgba(16,185,129,0.25)",
  },
  expired: {
    label: "Expired",
    icon: Clock,
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.1)",
    border: "rgba(245,158,11,0.25)",
  },
  inactive: {
    label: "Inactive",
    icon: XCircle,
    color: "rgba(255,255,255,0.3)",
    bg: "rgba(255,255,255,0.04)",
    border: "rgba(255,255,255,0.08)",
  },
};

function UsageBar({ used, limit }: { used: number; limit: number }) {
  const pct = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;
  const color = pct >= 90 ? "#ef4444" : pct >= 60 ? "#f59e0b" : "#6366f1";
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 90 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 12.5, color: "rgba(255,255,255,0.75)", fontWeight: 500 }}>
          {used}
          <span style={{ color: "rgba(255,255,255,0.3)", fontWeight: 400 }}> / {limit}</span>
        </span>
        <span style={{ fontSize: 11, color, fontWeight: 600 }}>{pct}%</span>
      </div>
      <div style={{
        height: 4,
        background: "rgba(255,255,255,0.06)",
        borderRadius: 99,
        overflow: "hidden",
      }}>
        <div style={{
          height: "100%",
          width: `${pct}%`,
          background: color,
          borderRadius: 99,
          transition: "width 0.4s ease",
          boxShadow: `0 0 6px ${color}80`,
        }} />
      </div>
    </div>
  );
}

export function AdminCouponsTable({
  locale,
  coupons,
}: {
  locale: string;
  coupons: CouponRow[];
}) {
  const router = useRouter();
  const base = `/${locale}/admin/coupons`;

  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("expiryDate");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  };

  async function handleDelete(id: string) {
    if (!confirm("Delete this coupon?")) return;
    setDeletingId(id);
    const res = await fetch(`/api/admin/coupons/${id}`, { method: "DELETE" });
    setDeletingId(null);
    if (res.ok) router.refresh();
    else alert("Failed to delete");
  }

  const filtered = coupons
    .filter((c) =>
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      String(c.discountPercentage).includes(search)
    )
    .sort((a, b) => {
      let av = "";
      let bv = "";
      if (sortKey === "expiryDate") {
        av = new Date(a.expiryDate as string | Date).toISOString();
        bv = new Date(b.expiryDate as string | Date).toISOString();
      } else if (sortKey === "discountPercentage" || sortKey === "usedCount") {
        return sortDir === "asc"
          ? (a[sortKey] as number) - (b[sortKey] as number)
          : (b[sortKey] as number) - (a[sortKey] as number);
      } else {
        av = String(a[sortKey]).toLowerCase();
        bv = String(b[sortKey]).toLowerCase();
      }
      return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
    });

  const activeCount = coupons.filter((c) => getStatus(c) === "active").length;
  const expiredCount = coupons.filter((c) => getStatus(c) === "expired").length;
  const totalUsed = coupons.reduce((s, c) => s + (c.usedCount || 0), 0);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');

        .act-wrap * { font-family: 'DM Sans', sans-serif; }

        .act-wrap {
          --bg: #0f0f11;
          --surface: #16161a;
          --surface2: #1c1c21;
          --border: rgba(255,255,255,0.07);
          --border2: rgba(255,255,255,0.04);
          --text: rgba(255,255,255,0.88);
          --text-muted: rgba(255,255,255,0.35);
          --text-sub: rgba(255,255,255,0.55);
          --accent: #6366f1;
          --accent-glow: rgba(99,102,241,0.25);
          --accent-subtle: rgba(99,102,241,0.12);
          --row-hover: rgba(255,255,255,0.02);
        }

        .act-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
          margin-bottom: 20px;
        }

        .act-stat {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 14px 16px;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .act-stat-icon {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .act-stat-val {
          font-size: 22px;
          font-weight: 600;
          color: var(--text);
          letter-spacing: -0.04em;
          line-height: 1;
        }

        .act-stat-label {
          font-size: 11.5px;
          color: var(--text-muted);
          margin-top: 2px;
          font-weight: 400;
        }

        .act-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 14px;
        }

        .act-search-wrap {
          position: relative;
          flex: 1;
          max-width: 300px;
        }

        .act-search-icon {
          position: absolute;
          left: 11px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
          pointer-events: none;
        }

        .act-search {
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

        .act-search::placeholder { color: var(--text-muted); }

        .act-search:focus {
          border-color: rgba(99,102,241,0.5);
          box-shadow: 0 0 0 3px var(--accent-glow);
        }

        .act-new-btn {
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
          box-shadow: 0 0 0 0 var(--accent-glow);
          white-space: nowrap;
        }

        .act-new-btn:hover {
          opacity: 0.88;
          box-shadow: 0 0 16px var(--accent-glow);
        }

        .act-table-wrap {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 14px;
          overflow: hidden;
        }

        .act-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }

        .act-thead tr {
          border-bottom: 1px solid var(--border);
          background: var(--surface2);
        }

        .act-th {
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

        .act-th:hover { color: var(--text-sub); }
        .act-th.active { color: var(--accent); }
        .act-th.no-sort { cursor: default; }

        .act-th-inner {
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .act-sort-icon { opacity: 0.5; }
        .act-th.active .act-sort-icon { opacity: 1; }

        .act-row {
          border-bottom: 1px solid var(--border2);
          transition: background 0.12s;
        }

        .act-row:last-child { border-bottom: none; }
        .act-row:hover { background: var(--row-hover); }
        .act-row.deleting { opacity: 0.4; pointer-events: none; }

        .act-td {
          padding: 13px 14px;
          font-size: 13.5px;
          vertical-align: middle;
        }

        .act-code {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          font-family: 'SF Mono', 'Fira Code', 'Fira Mono', monospace;
          font-size: 13px;
          font-weight: 600;
          color: rgba(255,255,255,0.85);
          background: rgba(99,102,241,0.08);
          border: 1px solid rgba(99,102,241,0.18);
          padding: 4px 10px;
          border-radius: 6px;
          letter-spacing: 0.05em;
        }

        .act-discount {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 15px;
          font-weight: 600;
          color: #a5b4fc;
          letter-spacing: -0.03em;
        }

        .act-discount-sub {
          font-size: 11px;
          color: var(--text-muted);
          font-weight: 400;
          letter-spacing: 0;
        }

        .act-date {
          font-size: 13px;
          color: var(--text-sub);
          display: flex;
          flex-direction: column;
          gap: 1px;
        }

        .act-date-day {
          font-weight: 500;
          color: var(--text);
          font-size: 13px;
        }

        .act-date-rel {
          font-size: 11px;
          color: var(--text-muted);
        }

        .act-action-btn {
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
        }

        .act-action-btn:hover {
          background: rgba(255,255,255,0.06);
          color: var(--text);
          border-color: rgba(255,255,255,0.12);
        }

        .act-action-btn.danger:hover {
          background: rgba(239,68,68,0.1);
          color: #f87171;
          border-color: rgba(239,68,68,0.25);
        }

        .act-empty {
          padding: 60px 24px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
        }

        .act-empty-icon {
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

        .act-count {
          font-size: 12.5px;
          color: var(--text-muted);
          white-space: nowrap;
          letter-spacing: -0.01em;
        }

        .act-count strong { color: var(--text-sub); font-weight: 500; }

        .act-no-results {
          padding: 40px;
          text-align: center;
          color: var(--text-muted);
          font-size: 13.5px;
        }
      `}</style>

      <div className="act-wrap">
        {/* Stats */}
        <div className="act-stats">
          <div className="act-stat">
            <div className="act-stat-icon" style={{ background: "rgba(99,102,241,0.12)" }}>
              <Ticket size={17} color="#818cf8" strokeWidth={1.75} />
            </div>
            <div>
              <div className="act-stat-val">{coupons.length}</div>
              <div className="act-stat-label">Total coupons</div>
            </div>
          </div>
          <div className="act-stat">
            <div className="act-stat-icon" style={{ background: "rgba(16,185,129,0.1)" }}>
              <CheckCircle2 size={17} color="#34d399" strokeWidth={1.75} />
            </div>
            <div>
              <div className="act-stat-val">{activeCount}</div>
              <div className="act-stat-label">Active</div>
            </div>
          </div>
          <div className="act-stat">
            <div className="act-stat-icon" style={{ background: "rgba(245,158,11,0.1)" }}>
              <Clock size={17} color="#fbbf24" strokeWidth={1.75} />
            </div>
            <div>
              <div className="act-stat-val">{expiredCount}</div>
              <div className="act-stat-label">Expired</div>
            </div>
          </div>
          <div className="act-stat">
            <div className="act-stat-icon" style={{ background: "rgba(236,72,153,0.1)" }}>
              <TrendingUp size={17} color="#f472b6" strokeWidth={1.75} />
            </div>
            <div>
              <div className="act-stat-val">{totalUsed}</div>
              <div className="act-stat-label">Total uses</div>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="act-toolbar">
          <div className="act-search-wrap">
            <Search size={14} className="act-search-icon" strokeWidth={2} />
            <input
              className="act-search"
              placeholder="Search by code or discount…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div className="act-count">
              <strong>{filtered.length}</strong> of <strong>{coupons.length}</strong>
            </div>
            <Link href={`${base}/new`} className="act-new-btn">
              <Plus size={14} strokeWidth={2.5} />
              New coupon
            </Link>
          </div>
        </div>

        {/* Table */}
        {coupons.length === 0 ? (
          <div className="act-table-wrap">
            <div className="act-empty">
              <div className="act-empty-icon">
                <Ticket size={24} strokeWidth={1.5} />
              </div>
              <div>
                <div style={{ fontWeight: 500, color: "rgba(255,255,255,0.5)", marginBottom: 4, fontSize: 14 }}>
                  No coupons yet
                </div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.28)" }}>
                  Create your first coupon to offer discounts.
                </div>
              </div>
              <Link href={`${base}/new`} className="act-new-btn" style={{ marginTop: 8 }}>
                <Plus size={14} strokeWidth={2.5} />
                Add coupon
              </Link>
            </div>
          </div>
        ) : (
          <div className="act-table-wrap">
            <div style={{ overflowX: "auto" }}>
              <table className="act-table">
                <thead className="act-thead">
                  <tr>
                    {(
                      [
                        { key: "code", label: "Code" },
                        { key: "discountPercentage", label: "Discount" },
                        { key: "usedCount", label: "Usage" },
                        { key: "expiryDate", label: "Expires" },
                        { key: "status", label: "Status", noSort: true },
                        { key: "actions", label: "", noSort: true },
                      ] as { key: string; label: string; noSort?: boolean }[]
                    ).map(({ key, label, noSort }) => {
                      const isActive = sortKey === key;
                      const Icon = !isActive
                        ? ChevronsUpDown
                        : sortDir === "asc"
                        ? ChevronUp
                        : ChevronDown;
                      return (
                        <th
                          key={key}
                          className={`act-th ${isActive ? "active" : ""} ${noSort ? "no-sort" : ""}`}
                          onClick={() => !noSort && handleSort(key as SortKey)}
                          style={key === "actions" ? { width: 80 } : undefined}
                        >
                          <div className="act-th-inner">
                            {label}
                            {!noSort && <Icon size={12} strokeWidth={2.2} className="act-sort-icon" />}
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="act-no-results">
                        No coupons match your search.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((c) => {
                      const status = getStatus(c);
                      const cfg = STATUS_CONFIG[status];
                      const StatusIcon = cfg.icon;
                      const expiry = new Date(c.expiryDate as string | Date);
                      const daysLeft = Math.ceil((expiry.getTime() - Date.now()) / 86400000);

                      return (
                        <tr
                          key={c._id}
                          className={`act-row ${deletingId === c._id ? "deleting" : ""}`}
                        >
                          {/* Code */}
                          <td className="act-td">
                            <span className="act-code">
                              <Zap size={11} color="#818cf8" strokeWidth={2.5} />
                              {c.code}
                            </span>
                          </td>

                          {/* Discount */}
                          <td className="act-td">
                            <div className="act-discount">
                              <PercentCircle size={15} strokeWidth={2} />
                              {c.discountPercentage}
                              <span className="act-discount-sub">% off</span>
                            </div>
                          </td>

                          {/* Usage */}
                          <td className="act-td" style={{ minWidth: 130 }}>
                            <UsageBar used={c.usedCount} limit={c.usageLimit} />
                          </td>

                          {/* Expires */}
                          <td className="act-td">
                            <div className="act-date">
                              <span className="act-date-day">
                                {expiry.toLocaleDateString("en-GB", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                })}
                              </span>
                              <span
                                className="act-date-rel"
                                style={{
                                  color:
                                    status === "active" && daysLeft <= 7
                                      ? "#f59e0b"
                                      : status === "expired"
                                      ? "rgba(239,68,68,0.6)"
                                      : undefined,
                                }}
                              >
                                {status === "expired"
                                  ? `${Math.abs(daysLeft)}d ago`
                                  : daysLeft === 0
                                  ? "Today"
                                  : `${daysLeft}d left`}
                              </span>
                            </div>
                          </td>

                          {/* Status */}
                          <td className="act-td">
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 5,
                                fontSize: 12,
                                fontWeight: 500,
                                color: cfg.color,
                                background: cfg.bg,
                                border: `1px solid ${cfg.border}`,
                                padding: "3px 9px 3px 6px",
                                borderRadius: 20,
                                whiteSpace: "nowrap",
                              }}
                            >
                              <StatusIcon size={12} strokeWidth={2} />
                              {cfg.label}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="act-td">
                            <div style={{ display: "flex", gap: 6 }}>
                              <Link
                                href={`${base}/${c._id}/edit`}
                                className="act-action-btn"
                                title="Edit coupon"
                              >
                                <Pencil size={13} strokeWidth={2} />
                              </Link>
                              <button
                                className="act-action-btn danger"
                                title="Delete coupon"
                                onClick={() => handleDelete(c._id)}
                              >
                                <Trash2 size={13} strokeWidth={2} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
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