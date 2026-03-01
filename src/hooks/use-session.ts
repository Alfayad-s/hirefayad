"use client";

import { useSession as useNextAuthSession } from "next-auth/react";

export function useSession() {
  return useNextAuthSession();
}

export function useIsAdmin() {
  const { data: session, status } = useNextAuthSession();
  return { isAdmin: session?.user?.role === "admin", session, status };
}
