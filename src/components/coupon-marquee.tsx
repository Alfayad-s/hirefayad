"use client";

import { useState, useEffect } from "react";

type MarqueeCoupon = { code: string; discountPercentage: number };

export function CouponMarquee() {
  const [coupons, setCoupons] = useState<MarqueeCoupon[]>([]);

  useEffect(() => {
    fetch("/api/coupons/marquee")
      .then((res) => res.json())
      .then((data) => setCoupons(data.coupons ?? []))
      .catch(() => setCoupons([]));
  }, []);

  if (coupons.length === 0) return null;

  const items = [...coupons, ...coupons, ...coupons]; // triple for seamless loop

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Syne:wght@700;800&display=swap');

        .marquee-track {
          display: flex;
          width: max-content;
          animation: marquee-scroll 28s linear infinite;
        }

        .marquee-track:hover {
          animation-play-state: paused;
        }

        @keyframes marquee-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }

        .marquee-fade-left {
          background: linear-gradient(to right, #0a0a0a 0%, transparent 100%);
        }

        .marquee-fade-right {
          background: linear-gradient(to left, #0a0a0a 0%, transparent 100%);
        }

        .coupon-pill {
          position: relative;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 4px 16px 4px 6px;
          border-radius: 999px;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.04);
          transition: border-color 0.2s, background 0.2s;
          cursor: default;
        }

        .coupon-pill:hover {
          border-color: rgba(250,204,21,0.5);
          background: rgba(250,204,21,0.06);
        }

        .coupon-pill:hover .coupon-code {
          color: #fde047;
        }

        .coupon-code {
          font-family: 'DM Mono', monospace;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.12em;
          color: #e5e5e5;
          transition: color 0.2s;
          background: rgba(255,255,255,0.06);
          padding: 3px 8px;
          border-radius: 999px;
        }

        .coupon-label {
          font-family: 'Syne', sans-serif;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.04em;
          color: #fbbf24;
        }

        .coupon-badge {
          font-family: 'DM Mono', monospace;
          font-size: 10px;
          font-weight: 500;
          background: #fbbf24;
          color: #000;
          padding: 2px 7px;
          border-radius: 999px;
          letter-spacing: 0.06em;
        }

        .separator {
          width: 3px;
          height: 3px;
          border-radius: 50%;
          background: rgba(255,255,255,0.2);
          flex-shrink: 0;
          margin: 0 20px;
        }

        .marquee-wrapper {
          position: relative;
          display: flex;
          width: 100%;
          overflow: hidden;
          background: #0a0a0a;
          border-bottom: 1px solid rgba(255,255,255,0.07);
          padding: 10px 0;
          align-items: center;
        }

        .live-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #4ade80;
          box-shadow: 0 0 6px #4ade80;
          animation: pulse-dot 2s ease-in-out infinite;
          flex-shrink: 0;
        }

        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.5; transform: scale(0.75); }
        }

        .promo-label {
          font-family: 'DM Mono', monospace;
          font-size: 9px;
          font-weight: 500;
          letter-spacing: 0.18em;
          color: rgba(255,255,255,0.35);
          text-transform: uppercase;
          white-space: nowrap;
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 0 20px;
          border-right: 1px solid rgba(255,255,255,0.08);
          flex-shrink: 0;
        }
      `}</style>

      <div className="marquee-wrapper" role="region" aria-label="Active promotions">
        {/* Left label */}
        <div className="promo-label">
          <span className="live-dot" aria-hidden="true" />
          Offers
        </div>

        {/* Fade edges */}
        <div className="marquee-fade-left" style={{ position: "absolute", left: 88, top: 0, bottom: 0, width: 40, zIndex: 2, pointerEvents: "none" }} />
        <div className="marquee-fade-right" style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: 60, zIndex: 2, pointerEvents: "none" }} />

        {/* Scrolling track */}
        <div style={{ overflow: "hidden", flex: 1 }} aria-live="polite">
          <div className="marquee-track">
            {items.map((c, i) => (
              <span key={i} style={{ display: "inline-flex", alignItems: "center" }}>
                <span className="coupon-pill" title={`Use code ${c.code} for ${c.discountPercentage}% off`}>
                  <span className="coupon-code">{c.code}</span>
                  <span className="coupon-label">{c.discountPercentage}% OFF</span>
                </span>
                <span className="separator" aria-hidden="true" />
              </span>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}