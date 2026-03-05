/**
 * Full-screen confetti burst for coupon applied celebration.
 * Uses canvas-confetti; safe to call only in browser.
 */
export function triggerCouponConfetti() {
  if (typeof window === "undefined") return;
  import("canvas-confetti").then((confetti) => {
    const duration = 3000;
    const end = Date.now() + duration;
    const colors = ["#eab308", "#facc15", "#fde047", "#fef08a", "#fef9c3", "#ffffff"];

    const frame = () => {
      // Left side only
      confetti.default({
        particleCount: 4,
        angle: 60,
        spread: 70,
        origin: { x: 0, y: 0.5 },
        colors,
      });
      // Right side only
      confetti.default({
        particleCount: 4,
        angle: 120,
        spread: 70,
        origin: { x: 1, y: 0.5 },
        colors,
      });
      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  });
}
