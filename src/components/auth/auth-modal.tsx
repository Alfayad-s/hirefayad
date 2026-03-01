"use client";

import { useRef, useEffect } from "react";
import { X, Zap } from "lucide-react";
import { LoginForm } from "@/components/auth/LoginForm";
import { SignupForm } from "@/components/auth/SignupForm";
import type { AuthModalVariant } from "@/components/providers/auth-modal-provider";

type AuthModalProps = {
  variant: AuthModalVariant;
  onClose: () => void;
  onSuccess: () => void;
  onSwitchVariant: (v: AuthModalVariant) => void;
};

export function AuthModal({
  variant,
  onClose,
  onSuccess,
  onSwitchVariant,
}: AuthModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[9998] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      {/* Blur backdrop - hero-style overlay */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-md transition-opacity"
        onClick={onClose}
        aria-hidden
      />

      {/* Panel: glass style over hero, yellow accent only */}
      <div
        ref={panelRef}
        className="relative w-full max-w-md rounded-2xl border-2 border-yellow-500/30 bg-white/90 p-6 shadow-2xl shadow-yellow-500/10 dark:bg-zinc-900/95 dark:border-yellow-500/40 dark:backdrop-blur-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-foreground/70 hover:bg-yellow-400/20 hover:text-foreground transition-colors"
          aria-label="Close"
        >
          <X className="size-5" />
        </button>

        <div className="mb-6 flex items-center gap-2">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-yellow-400 shadow-[0_0_12px_rgba(245,197,24,0.4)]">
            <Zap className="size-5 text-black fill-black" />
          </div>
          <span
            id="auth-modal-title"
            className="text-lg font-bold tracking-tight text-foreground"
            style={{ letterSpacing: "-0.02em" }}
          >
            Service<span className="text-yellow-500 dark:text-yellow-400">Funnel</span>
          </span>
        </div>

        {variant === "login" ? (
          <LoginForm
            embedded
            onSuccess={onSuccess}
            onSwitchToSignup={() => onSwitchVariant("signup")}
          />
        ) : (
          <SignupForm
            embedded
            onSuccess={onSuccess}
            onSwitchToLogin={() => onSwitchVariant("login")}
          />
        )}
      </div>
    </div>
  );
}
