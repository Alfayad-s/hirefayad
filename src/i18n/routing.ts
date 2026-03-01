import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "hi", "ar", "ml"],
  defaultLocale: "en",
  localePrefix: "always",
});
