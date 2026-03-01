"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { useRouter } from "@/i18n/navigation";
import { X, Zap } from "lucide-react";
import { AuthModal } from "@/components/auth/auth-modal";

export type AuthModalVariant = "login" | "signup";

type AuthModalContextValue = {
  open: (variant: AuthModalVariant) => void;
  close: () => void;
};

const AuthModalContext = createContext<AuthModalContextValue | null>(null);

export function useAuthModal() {
  const ctx = useContext(AuthModalContext);
  if (!ctx) {
    throw new Error("useAuthModal must be used within AuthModalProvider");
  }
  return ctx;
}

export function AuthModalProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [variant, setVariant] = useState<AuthModalVariant>("login");

  const openModal = useCallback((v: AuthModalVariant) => {
    setVariant(v);
    setOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setOpen(false);
  }, []);

  const handleSuccess = useCallback(() => {
    setOpen(false);
    router.refresh();
  }, [router]);

  const value: AuthModalContextValue = {
    open: openModal,
    close: closeModal,
  };

  return (
    <AuthModalContext.Provider value={value}>
      {children}
      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <AuthModal
            variant={variant}
            onClose={closeModal}
            onSuccess={handleSuccess}
            onSwitchVariant={setVariant}
          />,
          document.body
        )}
    </AuthModalContext.Provider>
  );
}
