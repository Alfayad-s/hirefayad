"use client";

import { signOut } from "next-auth/react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
import { LogIn, UserPlus, LogOut, Menu, X, Zap, ChevronDown, Sun, Moon, CircleDollarSign, Globe, MoreVertical, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";
import { useCurrency } from "@/components/providers/currency-provider";
import { useTheme } from "@/components/providers/theme-provider";
import { useAuthModal } from "@/components/providers/auth-modal-provider";
import { SUPPORTED_CURRENCIES } from "@/lib/currency";
import type { Session } from "next-auth";

type PublicHeaderProps = {
  showBack?: boolean;
  session?: Session | null;
};

const SCROLL_THRESHOLD = 120;

export function PublicHeader({ showBack = false, session = null }: PublicHeaderProps) {
  const t = useTranslations("Header");
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const { open: openAuthModal } = useAuthModal();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [headerVisible, setHeaderVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    let scrollTarget: HTMLElement | Window | null = null;

    function attachListener() {
      const el = document.querySelector("main.overflow-y-auto") as HTMLElement | null;
      const nextTarget = el ?? window;
      if (scrollTarget === nextTarget) return;
      if (scrollTarget) {
        (scrollTarget as HTMLElement).removeEventListener?.("scroll", onScroll);
        window.removeEventListener?.("scroll", onScroll);
      }
      scrollTarget = nextTarget;
      scrollTarget.addEventListener("scroll", onScroll, { passive: true });
      // Run once to sync state with current scroll position
      onScroll();
    }

    function onScroll() {
      const el = document.querySelector("main.overflow-y-auto") as HTMLElement | null;
      const top = el ? el.scrollTop : window.scrollY;
      setScrolled(top > 20);

      // At hero (near top): always show header. Past hero: hide on scroll-down, show on scroll-up.
      if (top <= SCROLL_THRESHOLD) {
        setHeaderVisible(true);
      } else if (top > lastScrollY.current) {
        setHeaderVisible(false);
      } else {
        setHeaderVisible(true);
      }
      lastScrollY.current = top;
    }

    attachListener();
    const id = setInterval(attachListener, 200);
    return () => {
      clearInterval(id);
      if (scrollTarget) {
        (scrollTarget as HTMLElement).removeEventListener?.("scroll", onScroll);
        window.removeEventListener?.("scroll", onScroll);
      }
    };
  }, []);

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <>
      <div
        className={`fixed left-1/2 top-4 z-50 w-full max-w-4xl -translate-x-1/2 px-2 transition-transform duration-300 ease-out sm:top-6 sm:px-4 ${headerVisible ? "translate-y-0" : "-translate-y-full"}`}
      >
        <header
          className="rounded-full transition-all duration-500 border backdrop-blur-xl"
          style={{
            background: scrolled
              ? "var(--header-bg-scrolled)"
              : "var(--header-bg)",
            borderColor: scrolled ? "var(--header-border-scrolled)" : "var(--header-border)",
            boxShadow: scrolled ? "var(--header-shadow-scrolled)" : "var(--header-shadow)",
          }}
        >
          <div className="flex h-12 min-w-0 items-center justify-between gap-4 px-4 sm:h-14 sm:px-5 md:px-6 lg:px-8">
            {/* Logo - left aligned */}
            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
              {showBack && (
              <Link
                href="/"
                className="hidden shrink-0 items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors sm:flex"
              >
                <span className="text-yellow-500 dark:text-yellow-400">←</span> Back
              </Link>
            )}
            <Link href="/" className="flex shrink-0 items-center gap-1.5 sm:gap-2 group">
              {/* Icon mark */}
              <div className="flex size-6 shrink-0 items-center justify-center rounded-lg bg-yellow-400 shadow-[0_0_12px_rgba(245,197,24,0.4)] group-hover:shadow-[0_0_20px_rgba(245,197,24,0.6)] transition-all duration-300 sm:size-7">
                <Zap className="size-3.5 text-black fill-black sm:size-4" />
              </div>
              <span
                className={`truncate text-sm font-black tracking-tight text-foreground sm:text-base ${session?.user ? "hidden sm:inline" : "inline"}`}
                style={{ letterSpacing: "-0.02em" }}
              >
                Service<span className="text-yellow-500 dark:text-yellow-400">Funnel</span>
              </span>
            </Link>
            </div>

            {/* Desktop nav - right aligned, consistent spacing and alignment */}
            <nav className="hidden md:flex md:h-9 md:shrink-0 md:items-center md:gap-4 lg:gap-5">
              <div className="flex h-9 items-center">
                <CurrencySelector />
              </div>
              <div className="flex h-9 items-center">
                <LocaleSwitcher />
              </div>
              <div className="h-4 w-px shrink-0 self-center bg-border" aria-hidden />
              {session?.user ? (
                <UserMenu
                  pathname={pathname}
                  onSignOut={() => {
                    try {
                      localStorage.removeItem("serviceFunnel_userName");
                    } catch {
                      /* ignore */
                    }
                    signOut({ callbackUrl: pathname || "/" });
                  }}
                  t={t}
                />
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => openAuthModal("login")}
                    className="flex h-9 items-center justify-center gap-2 rounded-full px-4 text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 dark:text-zinc-400 dark:hover:text-white"
                  >
                    <LogIn className="size-3.5 shrink-0" />
                    {t("signIn")}
                  </button>
                  <button
                    type="button"
                    onClick={() => openAuthModal("signup")}
                    className="flex h-9 items-center justify-center gap-2 rounded-full bg-yellow-400 px-4 text-sm font-bold text-black hover:bg-yellow-300 shadow-[0_0_16px_rgba(245,197,24,0.25)] hover:shadow-[0_0_24px_rgba(245,197,24,0.4)] transition-all duration-300"
                  >
                    <UserPlus className="size-3.5 shrink-0" />
                    {t("signUp")}
                  </button>
                </>
              )}
              <div className="h-4 w-px shrink-0 self-center bg-border" aria-hidden />
              <div className="flex h-9 items-center justify-center">
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="flex size-9 items-center justify-center rounded-full border border-border bg-secondary/80 text-muted-foreground hover:text-foreground transition-all duration-200 dark:border-zinc-700 dark:bg-zinc-900/50 dark:text-zinc-400 dark:hover:text-white"
                  aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
                >
                  {theme === "dark" ? <Sun className="size-4 shrink-0" /> : <Moon className="size-4 shrink-0" />}
                </button>
              </div>
            </nav>

            {/* Mobile: currency + locale + hamburger + theme */}
            <div className="flex shrink-0 items-center gap-1.5 md:hidden sm:gap-2">
              <CurrencySelector />
              <LocaleSwitcher />
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="flex size-8 shrink-0 items-center justify-center rounded-full border border-border bg-secondary text-foreground hover:bg-muted transition-all dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-zinc-500 dark:hover:text-white sm:size-9"
                aria-label="Toggle menu"
              >
                {menuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
              </button>
              <button
                type="button"
                onClick={toggleTheme}
                className="flex size-8 shrink-0 items-center justify-center rounded-full border border-border bg-secondary/80 text-muted-foreground hover:text-foreground transition-all dark:border-zinc-700 dark:bg-zinc-900/50 dark:hover:text-white sm:size-9"
                aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              >
                {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
              </button>
            </div>
          </div>
        </header>
      </div>

      {/* Mobile menu */}
      <div
        className="fixed inset-x-0 top-14 z-40 md:hidden transition-all duration-300 ease-in-out sm:top-20"
        style={{
          opacity: menuOpen ? 1 : 0,
          pointerEvents: menuOpen ? "auto" : "none",
          transform: menuOpen ? "translateY(0)" : "translateY(-8px)",
        }}
      >
        <div className="mx-4 mt-2 overflow-hidden rounded-2xl border border-border bg-card/95 shadow-lg backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-900/95 dark:shadow-black/40">
          {/* Yellow top bar */}
          <div className="h-0.5 w-full bg-gradient-to-r from-yellow-500 via-yellow-400 to-transparent dark:from-yellow-400 dark:via-yellow-300" />

          <div className="p-4">
            {session?.user ? (
              <div className="flex flex-col gap-3">
                <Link
                  href="/orders"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-foreground hover:bg-muted transition-colors dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  <FileText className="size-4" />
                  {t("quotes")}
                </Link>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    try {
                      localStorage.removeItem("serviceFunnel_userName");
                    } catch {
                      /* ignore */
                    }
                    signOut({ callbackUrl: pathname || "/" });
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors dark:text-zinc-400 dark:hover:text-white"
                >
                  <LogOut className="size-4" />
                  {t("signOut")}
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    openAuthModal("login");
                  }}
                  className="flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors dark:text-zinc-400 dark:hover:text-white"
                >
                  <LogIn className="size-4" />
                  {t("signIn")}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    openAuthModal("signup");
                  }}
                  className="flex items-center justify-center gap-2 rounded-xl bg-yellow-400 px-4 py-3 text-sm font-bold text-black hover:bg-yellow-300 shadow-[0_0_20px_rgba(245,197,24,0.2)] transition-all"
                >
                  <UserPlus className="size-4" />
                  {t("signUp")}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Backdrop tap to close */}
        <div
          className="fixed inset-0 -z-10"
          onClick={() => setMenuOpen(false)}
        />
      </div>
    </>
  );
}

function UserMenu({
  pathname,
  onSignOut,
  t,
}: {
  pathname: string;
  onSignOut: () => void;
  t: (key: string) => string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex size-9 items-center justify-center rounded-full border border-border bg-secondary/80 text-muted-foreground hover:text-foreground transition-colors dark:border-zinc-700 dark:bg-zinc-900/50 dark:text-zinc-400 dark:hover:text-white"
        aria-label="User menu"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <MoreVertical className="size-4" />
      </button>
      {open && (
        <div
          className="absolute right-0 top-full z-50 mt-1.5 min-w-[10rem] overflow-hidden rounded-xl border border-border bg-card shadow-xl dark:border-zinc-700 dark:bg-zinc-900"
          role="menu"
        >
          <Link
            href="/orders"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors dark:text-zinc-300 dark:hover:bg-zinc-800"
            role="menuitem"
          >
            <FileText className="size-4 shrink-0" />
            {t("quotes")}
          </Link>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onSignOut();
            }}
            className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
            role="menuitem"
          >
            <LogOut className="size-4 shrink-0" />
            {t("signOut")}
          </button>
        </div>
      )}
    </div>
  );
}

function CurrencySelector() {
  const { currency, setCurrency } = useCurrency();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open]);

  return (
    <div ref={ref} className="relative min-w-0 shrink">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-8 min-w-0 items-center justify-between gap-2 rounded-full border border-border bg-secondary px-3 py-1.5 text-left text-xs font-medium text-foreground transition-colors hover:bg-muted dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-zinc-600 dark:hover:text-white sm:min-w-[4.5rem] sm:px-3.5 sm:py-2 md:h-9 md:min-w-[5rem] md:px-4 md:py-2.5"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label="Select currency"
      >
        <span className="flex min-w-0 items-center gap-1.5 sm:gap-2">
          <CircleDollarSign className="size-3.5 shrink-0 text-muted-foreground sm:size-4" />
          <span className="truncate">{currency}</span>
        </span>
        <ChevronDown
          className={`size-3.5 shrink-0 transition-transform sm:size-4 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div
          className="absolute right-0 top-full z-50 mt-1.5 min-w-full overflow-hidden rounded-xl border border-border bg-card shadow-xl dark:border-zinc-700 dark:bg-zinc-900"
          role="listbox"
        >
          {SUPPORTED_CURRENCIES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => {
                setCurrency(c);
                setOpen(false);
              }}
              className={`block w-full px-4 py-2.5 text-left text-sm transition-colors ${
                currency === c
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:bg-muted dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
              }`}
              role="option"
              aria-selected={currency === c}
            >
              {c}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const LOCALES = [
  { code: "en" as const, label: "English" },
  { code: "hi" as const, label: "हिन्दी" },
  { code: "ar" as const, label: "العربية" },
  { code: "ml" as const, label: "മലയാളം" },
] as const;

function LocaleSwitcher() {
  const pathname = usePathname();
  const currentLocale = useLocale();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open]);

  const current = LOCALES.find((l) => l.code === currentLocale) ?? LOCALES[0];

  return (
    <div ref={ref} className="relative min-w-0 shrink sm:min-w-[5rem] md:min-w-[7rem]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-8 min-w-0 max-w-[5.5rem] items-center justify-between gap-2 rounded-full border border-border bg-secondary px-3 py-1.5 text-left text-xs font-medium text-foreground transition-colors hover:bg-muted dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-zinc-600 dark:hover:text-white sm:max-w-none sm:min-w-0 sm:px-3.5 sm:py-2 md:h-9 md:max-w-none md:min-w-[6.5rem] md:px-4 md:py-2.5"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label="Select language"
      >
        <span className="flex min-w-0 items-center gap-1.5 sm:gap-2">
          <Globe className="size-3.5 shrink-0 text-muted-foreground sm:size-4" />
          <span className="truncate">{current.label}</span>
        </span>
        <ChevronDown
          className={`size-3.5 shrink-0 transition-transform sm:size-4 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div
          className="absolute right-0 top-full z-50 mt-1.5 min-w-full overflow-hidden rounded-xl border border-border bg-card shadow-xl dark:border-zinc-700 dark:bg-zinc-900"
          role="listbox"
        >
          {LOCALES.map((loc) => (
            <Link
              key={loc.code}
              href={pathname}
              locale={loc.code}
              onClick={() => setOpen(false)}
              className={`block px-4 py-2.5 text-sm transition-colors ${
                currentLocale === loc.code
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:bg-muted dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
              }`}
              role="option"
              aria-selected={currentLocale === loc.code}
            >
              {loc.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}