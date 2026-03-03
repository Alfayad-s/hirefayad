"use client";

import { useState, useEffect, useRef } from "react";
import { useTheme } from "@/components/providers/theme-provider";

const GRID_SIZE = 60;
const SPOT_RADIUS = 200;
const LERP = 0.12; // 0–1: lower = smoother/slower follow

export function GridBackground() {
  const { theme } = useTheme();
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const targetRef = useRef<{ x: number; y: number } | null>(null);
  const currentRef = useRef<{ x: number; y: number } | null>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Use document so the spotlight follows the cursor across the whole page,
    // even when GridBackground is inside a narrow container (e.g. quote page).
    const target = document;

    function handleMove(e: Event) {
      const me = e as MouseEvent;
      const rect = el!.getBoundingClientRect();
      const x = me.clientX - rect.left;
      const y = me.clientY - rect.top;
      targetRef.current = { x, y };
      if (!currentRef.current) {
        currentRef.current = { x, y };
        setPos({ x, y });
      }
    }

    function handleLeave(e: Event) {
      const ev = e as MouseEvent;
      // Clear when cursor leaves the viewport (e.g. to browser chrome or another screen)
      if (ev.relatedTarget == null || !document.contains(ev.relatedTarget as Node)) {
        targetRef.current = null;
      }
    }

    function tick() {
      const target = targetRef.current;
      const current = currentRef.current;

      if (!target) {
        if (current) {
          currentRef.current = null;
          setPos(null);
        }
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      if (!current) {
        currentRef.current = { ...target };
        setPos({ ...target });
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      const nx = current.x + (target.x - current.x) * LERP;
      const ny = current.y + (target.y - current.y) * LERP;
      const dx = Math.abs(target.x - nx);
      const dy = Math.abs(target.y - ny);
      if (dx < 0.5 && dy < 0.5) {
        currentRef.current = { x: target.x, y: target.y };
        setPos({ x: target.x, y: target.y });
      } else {
        currentRef.current = { x: nx, y: ny };
        setPos({ x: nx, y: ny });
      }

      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    target.addEventListener("mousemove", handleMove, { passive: true });
    target.addEventListener("mouseout", handleLeave);

    return () => {
      cancelAnimationFrame(rafRef.current);
      target.removeEventListener("mousemove", handleMove);
      target.removeEventListener("mouseout", handleLeave);
    };
  }, []);

  const gridStyles = {
    backgroundImage:
      theme === "light"
        ? "linear-gradient(rgba(0,0,0,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.06) 1px, transparent 1px)"
        : "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
    backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`,
  };

  const spotGridStyles = {
    backgroundImage:
      theme === "light"
        ? "linear-gradient(rgba(0,0,0,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.2) 1px, transparent 1px)"
        : "linear-gradient(rgba(245,197,24,0.35) 1px, transparent 1px), linear-gradient(90deg, rgba(245,197,24,0.35) 1px, transparent 1px)",
    backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`,
  };

  return (
    <div
      ref={ref}
      className="pointer-events-none fixed inset-0 top-16"
      aria-hidden
    >
      {/* Base grid */}
      <div className="absolute inset-0" style={gridStyles} />

      {/* Hover grid spot - black in light mode, yellow in dark */}
      {pos !== null && (
        <div
          className="absolute inset-0"
          style={{
            ...spotGridStyles,
            maskImage: `radial-gradient(circle ${SPOT_RADIUS}px at ${pos.x}px ${pos.y}px, black 0%, rgba(0,0,0,0.4) 70%, transparent 100%)`,
            WebkitMaskImage: `radial-gradient(circle ${SPOT_RADIUS}px at ${pos.x}px ${pos.y}px, black 0%, rgba(0,0,0,0.4) 70%, transparent 100%)`,
          }}
        />
      )}
    </div>
  );
}
