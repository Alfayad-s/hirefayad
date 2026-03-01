import type { AbstractIntlMessages } from "next-intl";

const LOCALE_FILES: Record<string, () => Promise<{ default: AbstractIntlMessages }>> = {
  en: () => import("../../messages/en.json"),
  hi: () => import("../../messages/hi.json"),
  ar: () => import("../../messages/ar.json"),
  ml: () => import("../../messages/ml.json"),
};

export async function getMessagesForLocale(
  locale: string
): Promise<AbstractIntlMessages> {
  const loader = LOCALE_FILES[locale] ?? LOCALE_FILES.en;
  const mod = await loader();
  return mod.default as AbstractIntlMessages;
}
