"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Ticket,
  Users,
  ChevronRight,
  Zap,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCallback, useEffect, useRef, useState } from "react";

type NavItem = { href: string; label: string; icon: React.ReactNode; badge?: string };

const MIN_WIDTH = 64;
const MAX_WIDTH = 280;
const COLLAPSE_THRESHOLD = 120;
const DEFAULT_WIDTH = 220;

export function AdminSidebar({ locale }: { locale: string }) {
  const pathname = usePathname();
  const base = `/${locale}/admin`;

  const [width, setWidth] = useState(DEFAULT_WIDTH);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const dragStartX = useRef(0);
  const dragStartWidth = useRef(DEFAULT_WIDTH);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const nav: NavItem[] = [
    { href: base, label: "Dashboard", icon: <LayoutDashboard strokeWidth={1.5} className="size-[18px] shrink-0" /> },
    { href: `${base}/services`, label: "Services", icon: <Package strokeWidth={1.5} className="size-[18px] shrink-0" />, badge: "12" },
    { href: `${base}/coupons`, label: "Coupons", icon: <Ticket strokeWidth={1.5} className="size-[18px] shrink-0" />, badge: "3" },
    { href: `${base}/orders`, label: "Orders", icon: <FileText strokeWidth={1.5} className="size-[18px] shrink-0" /> },
    { href: `${base}/users`, label: "Users", icon: <Users strokeWidth={1.5} className="size-[18px] shrink-0" /> },
  ];

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    dragStartX.current = e.clientX;
    dragStartWidth.current = isCollapsed ? MIN_WIDTH : width;
    setIsDragging(true);
  }, [isCollapsed, width]);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const delta = e.clientX - dragStartX.current;
      const newWidth = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, dragStartWidth.current + delta));
      setWidth(newWidth);
      setIsCollapsed(newWidth < COLLAPSE_THRESHOLD);
    };

    const handleMouseUp = (e: MouseEvent) => {
      setIsDragging(false);
      const delta = e.clientX - dragStartX.current;
      const newWidth = dragStartWidth.current + delta;

      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 350);

      if (newWidth < COLLAPSE_THRESHOLD) {
        setWidth(MIN_WIDTH);
        setIsCollapsed(true);
      } else {
        const snapped = Math.max(COLLAPSE_THRESHOLD, Math.min(MAX_WIDTH, newWidth));
        setWidth(snapped);
        setIsCollapsed(false);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  const toggleCollapse = () => {
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 350);
    if (isCollapsed) {
      setWidth(DEFAULT_WIDTH);
      setIsCollapsed(false);
    } else {
      setWidth(MIN_WIDTH);
      setIsCollapsed(true);
    }
  };

  const currentWidth = isCollapsed ? MIN_WIDTH : width;

  return (
    <>
      {/* Global Styles */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&display=swap');

        .admin-sidebar * {
          font-family: 'DM Sans', sans-serif;
        }

        .admin-sidebar {
          --sidebar-bg: #0f0f11;
          --sidebar-border: rgba(255,255,255,0.06);
          --sidebar-surface: rgba(255,255,255,0.04);
          --sidebar-surface-hover: rgba(255,255,255,0.07);
          --sidebar-active-bg: rgba(250, 204, 21, 0.15);
          --sidebar-active-border: rgba(250, 204, 21, 0.6);
          --sidebar-active-text: #fde047;
          --sidebar-text: rgba(255,255,255,0.45);
          --sidebar-text-hover: rgba(255,255,255,0.85);
          --sidebar-accent: #eab308;
          --sidebar-accent-glow: rgba(250, 204, 21, 0.4);
          --sidebar-drag: rgba(250, 204, 21, 0.8);
          --resize-handle: rgba(255,255,255,0.08);
          --resize-handle-hover: var(--sidebar-accent);
        }

        .admin-sidebar {
          background: var(--sidebar-bg);
          border-right: 1px solid var(--sidebar-border);
          position: relative;
          display: flex;
          flex-direction: column;
          height: 100vh;
          height: 100dvh;
          overflow: hidden;
          flex-shrink: 0;
          transition: ${isAnimating ? "width 0.32s cubic-bezier(0.4, 0, 0.2, 1)" : "none"};
        }

        .sidebar-logo-mark {
          width: 32px;
          height: 32px;
          background: linear-gradient(135deg, var(--sidebar-accent), #facc15);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 0 20px var(--sidebar-accent-glow);
        }

        .sidebar-nav-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 9px 10px;
          border-radius: 8px;
          text-decoration: none;
          color: var(--sidebar-text);
          transition: all 0.18s ease;
          position: relative;
          overflow: hidden;
          white-space: nowrap;
          border: 1px solid transparent;
          font-size: 13.5px;
          font-weight: 450;
          letter-spacing: -0.01em;
        }

        .sidebar-nav-item:hover {
          color: var(--sidebar-text-hover);
          background: var(--sidebar-surface-hover);
        }

        .sidebar-nav-item.active {
          color: var(--sidebar-active-text);
          background: var(--sidebar-active-bg);
          border-color: var(--sidebar-active-border);
        }

        .sidebar-nav-item.active::before {
          content: '';
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 3px;
          height: 60%;
          background: var(--sidebar-accent);
          border-radius: 0 2px 2px 0;
          box-shadow: 0 0 8px var(--sidebar-accent-glow);
        }

        .nav-label {
          opacity: ${isCollapsed ? 0 : 1};
          transform: ${isCollapsed ? "translateX(-6px)" : "translateX(0)"};
          transition: opacity 0.2s ease, transform 0.2s ease;
          overflow: hidden;
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 6px;
        }

        .nav-badge {
          font-size: 10.5px;
          font-weight: 600;
          letter-spacing: 0.02em;
          background: rgba(250, 204, 21, 0.2);
          color: #fde047;
          border: 1px solid rgba(250, 204, 21, 0.4);
          padding: 1px 6px;
          border-radius: 20px;
          flex-shrink: 0;
        }

        .resize-handle {
          position: absolute;
          right: -5px;
          top: 0;
          bottom: 0;
          width: 10px;
          cursor: col-resize;
          z-index: 50;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .resize-handle::after {
          content: '';
          width: 2px;
          height: 40px;
          background: var(--resize-handle);
          border-radius: 2px;
          transition: all 0.2s ease;
        }

        .resize-handle:hover::after,
        .resize-handle.dragging::after {
          height: 80px;
          background: var(--resize-handle-hover);
          box-shadow: 0 0 12px var(--sidebar-accent-glow);
          width: 2px;
        }

        .sidebar-section-title {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.2);
          padding: 0 10px;
          margin-bottom: 4px;
          margin-top: 16px;
          white-space: nowrap;
          overflow: hidden;
          opacity: ${isCollapsed ? 0 : 1};
          transition: opacity 0.2s ease;
        }

        .collapse-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          border-radius: 6px;
          background: var(--sidebar-surface);
          border: 1px solid var(--sidebar-border);
          color: rgba(255,255,255,0.35);
          cursor: pointer;
          transition: all 0.18s ease;
          flex-shrink: 0;
        }

        .collapse-btn:hover {
          background: var(--sidebar-active-bg);
          border-color: var(--sidebar-active-border);
          color: var(--sidebar-active-text);
        }

        .collapse-icon {
          transition: transform 0.32s cubic-bezier(0.4, 0, 0.2, 1);
          transform: ${isCollapsed ? "rotate(0deg)" : "rotate(180deg)"};
        }

        .sidebar-footer {
          padding: 12px 10px;
          border-top: 1px solid var(--sidebar-border);
          display: flex;
          align-items: center;
          gap: 10px;
          overflow: hidden;
        }

        .avatar {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: linear-gradient(135deg, #eab308 0%, #facc15 100%);
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 600;
          color: #0c0a09;
          letter-spacing: -0.02em;
        }

        .footer-text {
          opacity: ${isCollapsed ? 0 : 1};
          transform: ${isCollapsed ? "translateX(-6px)" : "translateX(0)"};
          transition: opacity 0.2s ease, transform 0.2s ease;
          overflow: hidden;
          min-width: 0;
        }

        .footer-name {
          font-size: 13px;
          font-weight: 500;
          color: rgba(255,255,255,0.8);
          letter-spacing: -0.02em;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .footer-role {
          font-size: 11px;
          color: rgba(255,255,255,0.3);
          letter-spacing: 0.01em;
          white-space: nowrap;
        }

        ${isDragging ? "* { user-select: none; cursor: col-resize !important; }" : ""}
      `}</style>

      <div
        ref={sidebarRef}
        className="admin-sidebar"
        style={{ width: currentWidth }}
      >
        {/* Header */}
        <div style={{
          padding: "16px 10px 12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          overflow: "hidden",
        }}>
          <Link
            href={base}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              textDecoration: "none",
              overflow: "hidden",
              minWidth: 0,
              flex: 1,
            }}
          >
            <div className="sidebar-logo-mark">
              <Zap strokeWidth={2} size={16} color="white" />
            </div>
            <div style={{
              opacity: isCollapsed ? 0 : 1,
              transform: isCollapsed ? "translateX(-6px)" : "translateX(0)",
              transition: "opacity 0.2s ease, transform 0.2s ease",
              overflow: "hidden",
            }}>
              <div style={{
                fontSize: 15,
                fontWeight: 600,
                color: "rgba(255,255,255,0.9)",
                letterSpacing: "-0.03em",
                lineHeight: 1.1,
                whiteSpace: "nowrap",
              }}>
                Nexus
              </div>
              <div style={{
                fontSize: 10.5,
                color: "rgba(255,255,255,0.3)",
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                fontWeight: 500,
              }}>
                Admin
              </div>
            </div>
          </Link>

          <button className="collapse-btn" onClick={toggleCollapse} title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}>
            <ChevronRight size={13} strokeWidth={2.5} className="collapse-icon" />
          </button>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "8px 10px", overflow: "hidden", display: "flex", flexDirection: "column", gap: 1 }}>
          <div className="sidebar-section-title">Navigation</div>
          {nav.map((item) => {
            const isActive = pathname === item.href || (item.href !== base && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn("sidebar-nav-item", isActive && "active")}
                title={isCollapsed ? item.label : undefined}
              >
                {item.icon}
                <span className="nav-label">
                  <span>{item.label}</span>
                  {item.badge && !isCollapsed && (
                    <span className="nav-badge">{item.badge}</span>
                  )}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <div className="avatar">JD</div>
          <div className="footer-text">
            <div className="footer-name">John Doe</div>
            <div className="footer-role">Super Admin</div>
          </div>
        </div>

        {/* Drag-to-resize handle */}
        <div
          className={cn("resize-handle", isDragging && "dragging")}
          onMouseDown={handleMouseDown}
          title="Drag to resize"
        />
      </div>
    </>
  );
}