import { setRequestLocale } from "next-intl/server";
import { auth } from "@/auth";
import { PublicHeader } from "@/components/layout/public-header";
import { PublicFooter } from "@/components/layout/public-footer";
import { getServerT } from "@/lib/server-translations";

type Props = { params: Promise<{ locale: string }> };

export default async function PrivacyPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const session = await auth();
  const t = await getServerT(locale, "Legal");

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PublicHeader session={session} />
      <main className="flex-1 px-4 py-12 md:py-16 pt-24 sm:pt-28 md:pt-32 scroll-mt-24">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-4xl font-black tracking-tight text-foreground md:text-5xl">
            {t("privacyTitle")}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Last updated: March 5, 2025
          </p>

          <div className="mt-10 space-y-8 text-muted-foreground">
            <section>
              <h2 className="text-xl font-semibold text-foreground">1. Introduction</h2>
              <p className="mt-2 leading-relaxed">
                Hire Fayad (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) respects your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website and services, including quote requests, account registration, and communications.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">2. Information We Collect</h2>
              <p className="mt-2 leading-relaxed">
                We may collect personal information you provide directly, such as your name, email address, and any details you submit in quote requests or contact forms. When you create an account, we store your account credentials and profile information. We may also collect usage data (e.g., pages visited, device type) to improve our services.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">3. How We Use Your Information</h2>
              <p className="mt-2 leading-relaxed">
                We use your information to process quote requests, send quotations and order updates by email, manage your account and coupons, respond to inquiries, and improve our website and services. We may use your email to send transactional messages and, with your consent, marketing communications.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">4. Sharing and Disclosure</h2>
              <p className="mt-2 leading-relaxed">
                We do not sell your personal information. We may share data with service providers (e.g., hosting, email delivery) who assist in operating our services under strict confidentiality. We may disclose information if required by law or to protect our rights and safety.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">5. Data Security</h2>
              <p className="mt-2 leading-relaxed">
                We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, or loss. Communication with our site uses industry-standard encryption where applicable.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">6. Your Rights</h2>
              <p className="mt-2 leading-relaxed">
                Depending on your location, you may have the right to access, correct, or delete your personal data, object to processing, or request data portability. To exercise these rights or ask questions about your data, contact us at the email address provided on our website.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">7. Cookies and Similar Technologies</h2>
              <p className="mt-2 leading-relaxed">
                We may use cookies and similar technologies for authentication, preferences, and analytics. You can adjust your browser settings to refuse or limit cookies; some features may not work correctly if cookies are disabled.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">8. Changes to This Policy</h2>
              <p className="mt-2 leading-relaxed">
                We may update this Privacy Policy from time to time. The &quot;Last updated&quot; date at the top will reflect changes. Continued use of our services after updates constitutes acceptance of the revised policy.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">9. Contact</h2>
              <p className="mt-2 leading-relaxed">
                For privacy-related questions or requests, contact us at hirefayad@gmail.com.
              </p>
            </section>
          </div>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
