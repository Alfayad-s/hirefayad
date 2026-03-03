"use client";

import type { User } from "@/types";
import { useState } from "react";
import { Search, ChevronUp, ChevronDown, ChevronsUpDown, Shield, User as UserIcon, Mail, Calendar, Users } from "lucide-react";

type UserRow = Omit<User, "password"> & { _id: string };

function formatDate(val: string | Date) {
  return new Date(val).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

const AVATAR_COLORS = [
  ["#6366f1", "#818cf8"],
  ["#8b5cf6", "#a78bfa"],
  ["#06b6d4", "#22d3ee"],
  ["#10b981", "#34d399"],
  ["#f59e0b", "#fbbf24"],
  ["#ef4444", "#f87171"],
  ["#ec4899", "#f472b6"],
];

function avatarColor(name: string) {
  const idx = name.charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
}

type SortKey = "name" | "email" | "role" | "createdAt";
type SortDir = "asc" | "desc";

export function AdminUsersTable({ users }: { users: UserRow[] }) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  };

  const filtered = users
    .filter((u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.role.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      let av: string = "";
      let bv: string = "";
      if (sortKey === "createdAt") {
        av = new Date(a.createdAt as string | Date).toISOString();
        bv = new Date(b.createdAt as string | Date).toISOString();
      } else {
        av = String(a[sortKey]).toLowerCase();
        bv = String(b[sortKey]).toLowerCase();
      }
      return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
    });

  const adminCount = users.filter((u) => u.role === "admin").length;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600&display=swap');

        .aut-wrap * { font-family: 'DM Sans', sans-serif; }

        .aut-wrap {
          --bg: #0f0f11;
          --surface: #16161a;
          --surface2: #1c1c21;
          --border: rgba(255,255,255,0.07);
          --border2: rgba(255,255,255,0.04);
          --text: rgba(255,255,255,0.88);
          --text-muted: rgba(255,255,255,0.38);
          --text-sub: rgba(255,255,255,0.55);
          --accent: #6366f1;
          --accent-glow: rgba(99,102,241,0.25);
          --accent-subtle: rgba(99,102,241,0.12);
          --green: #10b981;
          --green-subtle: rgba(16,185,129,0.12);
          --row-hover: rgba(255,255,255,0.025);
          --radius: 14px;
        }

        .aut-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
          margin-bottom: 20px;
        }

        .aut-stat {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 14px 16px;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .aut-stat-icon {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .aut-stat-val {
          font-size: 22px;
          font-weight: 600;
          color: var(--text);
          letter-spacing: -0.04em;
          line-height: 1;
        }

        .aut-stat-label {
          font-size: 11.5px;
          color: var(--text-muted);
          margin-top: 2px;
          font-weight: 400;
          letter-spacing: 0.01em;
        }

        .aut-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 14px;
        }

        .aut-search-wrap {
          position: relative;
          flex: 1;
          max-width: 320px;
        }

        .aut-search-icon {
          position: absolute;
          left: 11px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
          pointer-events: none;
        }

        .aut-search {
          width: 100%;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 8px 12px 8px 34px;
          font-size: 13px;
          color: var(--text);
          outline: none;
          transition: border-color 0.18s;
          font-family: 'DM Sans', sans-serif;
        }

        .aut-search::placeholder { color: var(--text-muted); }

        .aut-search:focus {
          border-color: rgba(99,102,241,0.5);
          box-shadow: 0 0 0 3px var(--accent-glow);
        }

        .aut-count {
          font-size: 12.5px;
          color: var(--text-muted);
          white-space: nowrap;
          letter-spacing: -0.01em;
        }

        .aut-count strong {
          color: var(--text-sub);
          font-weight: 500;
        }

        .aut-table-wrap {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          overflow: hidden;
        }

        .aut-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }

        .aut-thead tr {
          border-bottom: 1px solid var(--border);
          background: var(--surface2);
        }

        .aut-th {
          padding: 11px 14px;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          color: var(--text-muted);
          white-space: nowrap;
          cursor: pointer;
          user-select: none;
          transition: color 0.15s;
        }

        .aut-th:hover { color: var(--text-sub); }
        .aut-th.active { color: var(--accent); }

        .aut-th-inner {
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .aut-sort-icon { opacity: 0.5; }
        .aut-th.active .aut-sort-icon { opacity: 1; }

        .aut-row {
          border-bottom: 1px solid var(--border2);
          transition: background 0.13s;
        }

        .aut-row:last-child { border-bottom: none; }
        .aut-row:hover { background: var(--row-hover); }

        .aut-td {
          padding: 12px 14px;
          font-size: 13.5px;
          vertical-align: middle;
        }

        .aut-user-cell {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .aut-avatar {
          width: 34px;
          height: 34px;
          border-radius: 8px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 600;
          color: white;
          letter-spacing: -0.02em;
          position: relative;
        }

        .aut-name {
          font-weight: 500;
          color: var(--text);
          font-size: 13.5px;
          letter-spacing: -0.01em;
        }

        .aut-id {
          font-size: 10.5px;
          color: var(--text-muted);
          letter-spacing: 0.01em;
          font-family: 'SF Mono', 'Fira Code', monospace;
          margin-top: 1px;
        }

        .aut-email {
          color: var(--text-sub);
          font-size: 13px;
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .aut-role-admin {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 12px;
          font-weight: 500;
          color: #a5b4fc;
          background: var(--accent-subtle);
          border: 1px solid rgba(99,102,241,0.25);
          padding: 3px 9px 3px 6px;
          border-radius: 20px;
          letter-spacing: 0.01em;
        }

        .aut-role-user {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 12px;
          font-weight: 400;
          color: var(--text-muted);
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.07);
          padding: 3px 9px 3px 6px;
          border-radius: 20px;
        }

        .aut-date {
          color: var(--text-sub);
          font-size: 13px;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .aut-empty {
          padding: 64px 24px;
          text-align: center;
          color: var(--text-muted);
          font-size: 14px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }

        .aut-empty-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: rgba(255,255,255,0.04);
          border: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-muted);
          margin-bottom: 4px;
        }

        .aut-no-results {
          padding: 40px 24px;
          text-align: center;
          color: var(--text-muted);
          font-size: 13.5px;
        }
      `}</style>

      <div className="aut-wrap">
        {/* Stats */}
        <div className="aut-stats">
          <div className="aut-stat">
            <div className="aut-stat-icon" style={{ background: "rgba(99,102,241,0.12)" }}>
              <Users size={17} color="#818cf8" strokeWidth={1.75} />
            </div>
            <div>
              <div className="aut-stat-val">{users.length}</div>
              <div className="aut-stat-label">Total users</div>
            </div>
          </div>
          <div className="aut-stat">
            <div className="aut-stat-icon" style={{ background: "rgba(16,185,129,0.1)" }}>
              <Shield size={17} color="#34d399" strokeWidth={1.75} />
            </div>
            <div>
              <div className="aut-stat-val">{adminCount}</div>
              <div className="aut-stat-label">Admins</div>
            </div>
          </div>
          <div className="aut-stat">
            <div className="aut-stat-icon" style={{ background: "rgba(251,191,36,0.1)" }}>
              <UserIcon size={17} color="#fbbf24" strokeWidth={1.75} />
            </div>
            <div>
              <div className="aut-stat-val">{users.length - adminCount}</div>
              <div className="aut-stat-label">Regular users</div>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="aut-toolbar">
          <div className="aut-search-wrap">
            <Search size={14} className="aut-search-icon" strokeWidth={2} />
            <input
              className="aut-search"
              placeholder="Search by name, email or role…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="aut-count">
            Showing <strong>{filtered.length}</strong> of <strong>{users.length}</strong> users
          </div>
        </div>

        {/* Table */}
        {users.length === 0 ? (
          <div className="aut-table-wrap">
            <div className="aut-empty">
              <div className="aut-empty-icon">
                <Users size={22} strokeWidth={1.5} />
              </div>
              <div>
                <div style={{ fontWeight: 500, color: "rgba(255,255,255,0.5)", marginBottom: 4 }}>No users yet</div>
                <div style={{ fontSize: 12.5 }}>Users will appear here once they sign up.</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="aut-table-wrap">
            <div style={{ overflowX: "auto" }}>
              <table className="aut-table">
                <thead className="aut-thead">
                  <tr>
                    {(
                      [
                        { key: "name", label: "User" },
                        { key: "email", label: "Email" },
                        { key: "role", label: "Role" },
                        { key: "createdAt", label: "Signed up" },
                      ] as { key: SortKey; label: string }[]
                    ).map(({ key, label }) => {
                      const isActive = sortKey === key;
                      const Icon =
                        !isActive
                          ? ChevronsUpDown
                          : sortDir === "asc"
                          ? ChevronUp
                          : ChevronDown;
                      return (
                        <th
                          key={key}
                          className={`aut-th ${isActive ? "active" : ""}`}
                          onClick={() => handleSort(key)}
                        >
                          <div className="aut-th-inner">
                            {label}
                            <Icon size={12} strokeWidth={2.2} className="aut-sort-icon" />
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="aut-no-results">
                        No users match your search.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((u) => {
                      const [c1, c2] = avatarColor(u.name);
                      return (
                        <tr key={u._id} className="aut-row">
                          {/* Name */}
                          <td className="aut-td">
                            <div className="aut-user-cell">
                              <div
                                className="aut-avatar"
                                style={{ background: `linear-gradient(135deg, ${c1}, ${c2})` }}
                              >
                                {getInitials(u.name)}
                              </div>
                              <div>
                                <div className="aut-name">{u.name}</div>
                                <div className="aut-id">#{u._id.slice(-6)}</div>
                              </div>
                            </div>
                          </td>

                          {/* Email */}
                          <td className="aut-td">
                            <div className="aut-email">
                              <Mail size={13} strokeWidth={1.75} style={{ color: "rgba(255,255,255,0.2)", flexShrink: 0 }} />
                              {u.email}
                            </div>
                          </td>

                          {/* Role */}
                          <td className="aut-td">
                            {u.role === "admin" ? (
                              <span className="aut-role-admin">
                                <Shield size={12} strokeWidth={2} />
                                Admin
                              </span>
                            ) : (
                              <span className="aut-role-user">
                                <UserIcon size={12} strokeWidth={1.75} />
                                {u.role}
                              </span>
                            )}
                          </td>

                          {/* Date */}
                          <td className="aut-td">
                            <div className="aut-date">
                              <Calendar size={13} strokeWidth={1.75} style={{ color: "rgba(255,255,255,0.2)", flexShrink: 0 }} />
                              {formatDate(u.createdAt as string | Date)}
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