import Link from "next/link";
import { ArrowLeft, Scale, Mail, FileText, CheckCircle2 } from "lucide-react";

export const metadata = {
  title: "Terms of Service | Folio",
  description: "Read the terms and conditions for using the Folio platform.",
};

export default function TermsPage() {
  const lastUpdated = "May 22, 2026";

  return (
    <div className="min-h-screen bg-page text-primary relative overflow-hidden bg-grid-pattern selection:bg-accent/20">
      {/* Background radial fade for grid */}
      <div className="absolute inset-0 bg-page bg-grid-fade pointer-events-none z-0" />

      {/* Decorative Blur Blob */}
      <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-accent/10 blur-3xl opacity-40 pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-[#34C77B]/5 blur-3xl opacity-30 pointer-events-none" />

      <header className="relative z-10 max-w-4xl mx-auto px-6 pt-8 pb-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <img src="/folio-icon.svg" alt="Folio Logo" className="w-8 h-8 transition-transform group-hover:scale-105" />
          <span className="text-[18px] font-bold text-white tracking-tight">Folio</span>
        </Link>
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-xs font-semibold text-secondary hover:text-white bg-surface/50 border border-border-subtle hover:border-white/20 px-3.5 py-2 rounded-xl transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Home
        </Link>
      </header>

      <main className="relative z-10 max-w-3xl mx-auto px-6 py-12">
        <div className="space-y-6 mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-semibold uppercase tracking-wider">
            <Scale className="w-3.5 h-3.5" />
            Terms & Conditions
          </div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight sm:text-5xl">
            Terms of Service
          </h1>
          <p className="text-secondary text-sm font-medium">
            Last updated: {lastUpdated}
          </p>
        </div>

        {/* Content Box */}
        <div className="p-6 sm:p-10 rounded-2xl border border-white/5 bg-[#0C0C0C]/40 backdrop-blur-md space-y-8 shadow-2xl text-secondary text-[15px] leading-relaxed">
          
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing and using Folio (hosted at <strong>tryfolio.online</strong>), you agree to be bound by these Terms of Service. If you do not agree to all terms, you must immediately terminate use of our services.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              2. Description of Service
            </h2>
            <p>
              Folio is a portfolio-builder SaaS platform that allows users to design, deploy, and analyze their digital professional profiles. Users can connect custom domains, add projects and experiences, customize aesthetics, and trace links clicked on their portfolios.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              3. User Accounts & Responsibilities
            </h2>
            <p>
              To claim a URL and save custom portfolio data, you must register an account:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-sm">
              <li>You are solely responsible for maintaining the confidentiality of your account credentials.</li>
              <li>You are responsible for all content published on your custom portfolio page. Content must not contain illegal, offensive, harassing, or trademark-infringing elements.</li>
              <li>We reserve the right to suspend or reclaim usernames or accounts that violate these guidelines or remain inactive for extended durations.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              4. Pro Subscription & Domain Mapping
            </h2>
            <p>
              Folio offers a premium one-time Pro upgrade that enables watermark removal and custom domain hosting options:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-sm">
              <li>Payments are processed securely via third-party billing providers. All pricing is clearly listed and charged transparently.</li>
              <li>Custom domains must be registered separately by the user at a domain registrar. Real-time DNS lookups are verified by the platform before connecting.</li>
              <li>Abuse of domain mappings or pointing system domains is prohibited.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              5. Intellectual Property
            </h2>
            <p>
              You retain all ownership rights to the content, media assets, and text that you upload to the platform. Folio does not claim intellectual property rights over user content.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              6. Limitation of Liability
            </h2>
            <p>
              Folio is provided "as is" and "as available". We do not warrant that service will be completely uninterrupted, secure, or free from minor software bugs. We disclaim all liability for any indirect, special, incidental, or consequential damages resulting from portfolio use.
            </p>
          </section>

          <section className="space-y-4 pt-4 border-t border-white/5">
            <div className="p-4 rounded-xl bg-accent/5 border border-accent/10 flex items-start gap-4">
              <FileText className="w-5 h-5 text-accent shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white">Need Clarification?</h4>
                <p className="text-xs text-secondary leading-relaxed">
                  If you have any questions or require legal clarification regarding our Terms of Service, please contact our support team at:
                </p>
                <div className="pt-2 flex items-center gap-2">
                  <a href="mailto:support@tryfolio.online" className="text-xs font-semibold text-accent hover:underline flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5" />
                    support@tryfolio.online
                  </a>
                </div>
              </div>
            </div>
          </section>

        </div>
      </main>

      <footer className="border-t border-white/5 py-8 mt-12 bg-[#070707] text-tertiary text-xs relative z-10 text-center">
        <p>© 2026 Folio App. All rights reserved.</p>
      </footer>
    </div>
  );
}
