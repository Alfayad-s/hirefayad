"use client";

import { useAuthModal } from "@/components/providers/auth-modal-provider";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

type Props = {
  getStartedLabel: string;
  haveAccountLabel: string;
};

export function HeroAuthButtons({ getStartedLabel, haveAccountLabel }: Props) {
  const { open: openAuthModal } = useAuthModal();

  return (
    <>
      <Button
        size="lg"
        onClick={() => openAuthModal("signup")}
        className="group relative overflow-hidden rounded-full bg-yellow-400 px-8 text-black font-bold hover:bg-yellow-300 transition-all duration-300 shadow-[0_0_30px_rgba(245,197,24,0.3)] hover:shadow-[0_0_50px_rgba(245,197,24,0.5)]"
      >
        {getStartedLabel}
        <ArrowRight className="size-4 ml-2 group-hover:translate-x-1 transition-transform" />
      </Button>
      <Button
        size="lg"
        variant="outline"
        onClick={() => openAuthModal("login")}
        className="rounded-full border-border bg-transparent text-foreground hover:bg-muted hover:border-ring px-8 transition-all duration-300"
      >
        {haveAccountLabel}
      </Button>
    </>
  );
}
