/**
 * Server-side translations without relying on next-intl plugin config.
 * Use this instead of getTranslations() from next-intl/server to avoid
 * "Couldn't find next-intl config file" with Turbopack/Next 16.
 */

import { getMessagesForLocale } from "./get-messages";

type Messages = Record<string, Record<string, string>>;

export async function getServerT(locale: string, namespace: string) {
  const messages = (await getMessagesForLocale(locale)) as Messages;
  const ns = messages[namespace];
  if (!ns) return (key: string) => key;

  return function t(key: string, values?: Record<string, string>): string {
    let value = ns[key] ?? key;
    if (values) {
      value = value.replace(/\{(\w+)\}/g, (_, k) => values[k] ?? `{${k}}`);
    }
    return value;
  };
}
