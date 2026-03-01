"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { LogIn, UserPlus, X } from "lucide-react";
import { useAuthModal } from "@/components/providers/auth-modal-provider";

const STORAGE_KEY = "serviceFunnel_welcomeModalSeen";
const DELAY_MS = 5000;

type Props = { showForGuests: boolean };

export function WelcomeModal({ showForGuests }: Props) {
  const t = useTranslations("WelcomeModal");
  const { open: openAuthModal } = useAuthModal();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!showForGuests || !mounted) return;
    try {
      if (sessionStorage.getItem(STORAGE_KEY) === "1") return;
    } catch {
      /* ignore */
    }
    const timer = setTimeout(() => setOpen(true), DELAY_MS);
    return () => clearTimeout(timer);
  }, [showForGuests, mounted]);

  function handleClose() {
    setOpen(false);
    try {
      sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
  }

  if (!open || !mounted) return null;

  const modal = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-modal-title"
    >
      {/* Backdrop */}
      <button
        type="button"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
        aria-label="Close"
      />

      {/* Panel */}
      <div className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl dark:border-zinc-700">
        <button
          type="button"
          onClick={handleClose}
          className="absolute right-4 top-4 rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          aria-label="Close"
        >
          <X className="size-5" />
        </button>

        <h2 id="welcome-modal-title" className="pr-10 text-xl font-bold text-foreground md:text-2xl">
          {t("title")}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {t("description")}
        </p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button
            variant="outline"
            size="lg"
            className="rounded-full"
            onClick={() => {
              handleClose();
              openAuthModal("login");
            }}
          >
            <LogIn className="size-4" />
            {t("login")}
          </Button>
          <Button
            size="lg"
            className="rounded-full bg-yellow-400 font-bold text-black hover:bg-yellow-300"
            onClick={() => {
              handleClose();
              openAuthModal("signup");
            }}
          >
            <UserPlus className="size-4" />
            {t("signup")}
          </Button>
        </div>
      </div>
    </div>
  );

  return typeof document !== "undefined" ? createPortal(modal, document.body) : null;
}
