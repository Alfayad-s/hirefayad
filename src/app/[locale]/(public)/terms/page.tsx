import { setRequestLocale } from "next-intl/server";
import { auth } from "@/auth";
import { PublicHeader } from "@/components/layout/public-header";
import { PublicFooter } from "@/components/layout/public-footer";
import { getServerT } from "@/lib/server-translations";

type Props = { params: Promise<{ locale: string }> };

export default async function TermsPage({ params }: Props) {
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
            {t("termsTitle")}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Last updated: March 5, 2025
          </p>

          <div className="mt-10 space-y-8 text-muted-foreground">
            <section>
              <h2 className="text-xl font-semibold text-foreground">1. Agreement to Terms</h2>
              <p className="mt-2 leading-relaxed">
                By accessing or using ServiceFunnel (&quot;the Service&quot;), you agree to be bound by these Terms and Conditions. If you do not agree, do not use the Service. We reserve the right to modify these terms at any time; continued use after changes constitutes acceptance.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">2. Description of Service</h2>
              <p className="mt-2 leading-relaxed">
                ServiceFunnel provides web development services, including but not limited to website and web application design, development, and related offerings. Quotes are provided for information and are subject to the final agreement between you and the service provider. Use of coupons and discounts is subject to their specific terms and validity.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">3. Account and Registration</h2>
              <p className="mt-2 leading-relaxed">
                You may need to create an account to request quotes, apply coupons, or access certain features. You are responsible for maintaining the confidentiality of your credentials and for all activity under your account. You must provide accurate information and notify us of any unauthorized use.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">4. Quote Requests and Orders</h2>
              <p className="mt-2 leading-relaxed">
                Submitting a quote request does not create a binding contract. A formal agreement is formed only when both parties agree in writing (e.g., accepted quotation or order confirmation). We aim to respond to quote requests in a timely manner but do not guarantee a specific response time. Prices and scope may change until an order is confirmed.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">5. Payment and Refunds</h2>
              <p className="mt-2 leading-relaxed">
                Payment terms will be specified in your quotation or order confirmation. Failure to pay according to agreed terms may result in suspension of work or cancellation. Refund policies, if any, will be communicated at the time of engagement and may vary by project.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">6. Intellectual Property</h2>
              <p className="mt-2 leading-relaxed">
                Unless otherwise agreed in writing, upon full payment you receive the agreed deliverables and a license to use them for the purposes set out in the project. Pre-existing materials, tools, and generic code remain the property of the service provider. Custom work created for your project is transferred according to the terms of your specific agreement.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">7. Prohibited Conduct</h2>
              <p className="mt-2 leading-relaxed">
                You may not use the Service for any illegal purpose, to distribute malware, to impersonate others, or to attempt to gain unauthorized access to our systems or other accounts. You may not abuse coupons, create multiple accounts to circumvent restrictions, or use the Service in a way that harms us or other users.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">8. Disclaimer of Warranties</h2>
              <p className="mt-2 leading-relaxed">
                The Service is provided &quot;as is&quot; and &quot;as available&quot; without warranties of any kind, express or implied. We do not warrant that the Service will be uninterrupted, error-free, or free of harmful components. Any reliance on the Service is at your own risk.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">9. Limitation of Liability</h2>
              <p className="mt-2 leading-relaxed">
                To the fullest extent permitted by law, ServiceFunnel and its operators shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or for loss of profits, data, or goodwill, arising from your use of the Service or any project conducted through it. Liability for direct damages shall be limited to the amount you paid for the specific service in question, where applicable.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">10. Termination</h2>
              <p className="mt-2 leading-relaxed">
                We may suspend or terminate your access to the Service at any time for breach of these terms or for any other reason. You may stop using the Service at any time. Provisions that by their nature should survive (e.g., liability, intellectual property) will survive termination.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">11. Governing Law</h2>
              <p className="mt-2 leading-relaxed">
                These terms are governed by the laws of the jurisdiction in which the service provider operates, without regard to conflict of law principles. Any disputes shall be resolved in the courts of that jurisdiction, unless otherwise required by applicable law.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">12. Contact</h2>
              <p className="mt-2 leading-relaxed">
                For questions about these Terms and Conditions, contact us at hirefayad@gmail.com.
              </p>
            </section>
          </div>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
