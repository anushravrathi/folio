import Link from "next/link";
import { ArrowLeft, Shield, Mail, Globe, Lock } from "lucide-react";

export const metadata = {
  title: "Privacy Policy | Folio",
  description: "Learn how Folio collects, uses, and protects your information.",
};

export default function PrivacyPage() {
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
            <Shield className="w-3.5 h-3.5" />
            Legal Notice
          </div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight sm:text-5xl">
            Privacy Policy
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
              1. Overview
            </h2>
            <p>
              Welcome to Folio, operated at <strong>tryfolio.online</strong>. We value your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, and safeguard your information when you use our website, application, and portfolio creation services.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              2. Information We Collect
            </h2>
            <p>
              To provide a comprehensive portfolio creation service, we collect the following types of information:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-sm">
              <li><strong>Account Credentials:</strong> Email addresses and login metadata authenticated securely via Supabase.</li>
              <li><strong>Profile Information:</strong> Your name, username, biography, location, social links (GitHub, LinkedIn, Twitter, LeetCode), professional experience, skills, projects, and educational history that you choose to display publicly.</li>
              <li><strong>Assets:</strong> CV documents, profile pictures, and other media assets uploaded directly to our cloud storage.</li>
              <li><strong>Usage & Interaction Analytics:</strong> Anonymous visitor view counts, geographic distribution of visitors, and click-through rates on your custom links, which are tracked to compile your dashboard analytics.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              3. How We Use Your Information
            </h2>
            <p>
              We process your personal information to fulfill our service commitments:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-sm">
              <li>To build, host, and display your public personal portfolio page.</li>
              <li>To offer real-time interaction stats (views, clicks) on your dashboard.</li>
              <li>To process transaction orders for Pro plans securely.</li>
              <li>To manage routing for custom domains connected to your account.</li>
              <li>To send you important system updates, security alerts, and administrative messages.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              4. Cookies and Local Storage
            </h2>
            <p>
              We use secure, essential session tokens and cookies provided by Supabase to maintain your login session. We do not use third-party tracking or advertising cookies.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              5. Data Storage and Retention
            </h2>
            <p>
              All personal and profile information is stored on secure, production-grade servers managed by Supabase. You have full ownership of your data. You may edit, update, or completely delete your account at any time via the Settings panel, which triggers the permanent, irreversible destruction of your database entries.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              6. Security
            </h2>
            <p>
              We implement state-of-the-art administrative, technical, and physical security measures. Our databases use Row-Level Security (RLS) policies to ensure that your private files can only be accessed or modified by you.
            </p>
          </section>

          <section className="space-y-4 pt-4 border-t border-white/5">
            <div className="p-4 rounded-xl bg-accent/5 border border-accent/10 flex items-start gap-4">
              <Lock className="w-5 h-5 text-accent shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white">Contact Our Privacy Team</h4>
                <p className="text-xs text-secondary leading-relaxed">
                  If you have any questions, requests, or concerns regarding your personal data and data protection rights, please contact us at:
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
