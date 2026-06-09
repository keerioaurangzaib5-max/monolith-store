"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { FileText, Shield, Sparkles, Scale } from "lucide-react";

function LegalPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("privacy"); // privacy, terms, refund, cookie

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    router.push(`/legal?tab=${tab}`);
  };

  return (
    <>
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 py-12 flex-grow select-none">
        {/* Header */}
        <div className="text-center space-y-3 mb-16 max-w-sm mx-auto">
          <span className="text-[9px] font-black uppercase tracking-widest text-stone-400">monolith legal</span>
          <h1 className="font-display text-3xl font-black uppercase tracking-wider text-foreground">
            Legal Policies
          </h1>
        </div>

        {/* Tab Buttons */}
        <div className="flex border-b border-border/40 mb-10 text-xs font-bold uppercase tracking-widest gap-2 overflow-x-auto">
          <button
            onClick={() => handleTabChange("privacy")}
            className={`flex items-center gap-1.5 h-10 px-4 border-b-2 shrink-0 transition-colors ${
              activeTab === "privacy" ? "border-primary text-foreground" : "border-transparent text-stone-400 hover:text-foreground"
            }`}
          >
            <Shield className="w-3.5 h-3.5" /> Privacy Policy
          </button>
          <button
            onClick={() => handleTabChange("terms")}
            className={`flex items-center gap-1.5 h-10 px-4 border-b-2 shrink-0 transition-colors ${
              activeTab === "terms" ? "border-primary text-foreground" : "border-transparent text-stone-400 hover:text-foreground"
            }`}
          >
            <Scale className="w-3.5 h-3.5" /> Terms of Service
          </button>
          <button
            onClick={() => handleTabChange("refund")}
            className={`flex items-center gap-1.5 h-10 px-4 border-b-2 shrink-0 transition-colors ${
              activeTab === "refund" ? "border-primary text-foreground" : "border-transparent text-stone-400 hover:text-foreground"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" /> Refund Policy
          </button>
          <button
            onClick={() => handleTabChange("cookie")}
            className={`flex items-center gap-1.5 h-10 px-4 border-b-2 shrink-0 transition-colors ${
              activeTab === "cookie" ? "border-primary text-foreground" : "border-transparent text-stone-400 hover:text-foreground"
            }`}
          >
            <FileText className="w-3.5 h-3.5" /> Cookie Policy
          </button>
        </div>

        {/* Content Box */}
        <div className="space-y-6 text-xs sm:text-sm text-muted-foreground font-light leading-relaxed mb-20 p-8 glass">
          
          {/* PRIVACY POLICY */}
          {activeTab === "privacy" && (
            <div className="space-y-4">
              <h3 className="font-display font-black text-xs uppercase tracking-widest text-foreground border-b border-border/40 pb-3">
                Privacy & Data Policy
              </h3>
              <p>Last updated: June 09, 2026</p>
              <p>
                At Monolith, accessible from support@monolith.com, one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by Monolith and how we use it.
              </p>
              <h4 className="font-display font-bold uppercase text-xs tracking-wider text-foreground pt-2">Information We Collect</h4>
              <p>
                We collect your name, email address, password hashes, and shipping details when you register or place an order. We use secure JSON Web Tokens (JWT) to authorize session tokens. We never store raw credit card details; payments are processed through secure, PCI-compliant gateway providers (e.g. PayFast Pakistan).
              </p>
            </div>
          )}

          {/* TERMS OF SERVICE */}
          {activeTab === "terms" && (
            <div className="space-y-4">
              <h3 className="font-display font-black text-xs uppercase tracking-widest text-foreground border-b border-border/40 pb-3">
                Terms and Conditions
              </h3>
              <p>Last updated: June 09, 2026</p>
              <p>
                By accessing this website we assume you accept these terms and conditions. Do not continue to use Monolith if you do not agree to take all of the terms and conditions stated on this page.
              </p>
              <h4 className="font-display font-bold uppercase text-xs tracking-wider text-foreground pt-2">Purchases & Checkout</h4>
              <p>
                Orders are processed and subject to stock availability checks. We reserve the right to cancel orders placed under incorrect price calculations or suspicious activity logs. Sales taxes are calculated at a standard General Sales Tax (GST) rate of 18% in Pakistan.
              </p>
            </div>
          )}

          {/* REFUND POLICY */}
          {activeTab === "refund" && (
            <div className="space-y-4">
              <h3 className="font-display font-black text-xs uppercase tracking-widest text-foreground border-b border-border/40 pb-3">
                Refund & Exchange Policy
              </h3>
              <p>Last updated: June 09, 2026</p>
              <p>
                We stand behind our materials. We offer exchanges or refunds on items returned within 30 days of delivery.
              </p>
              <h4 className="font-display font-bold uppercase text-xs tracking-wider text-foreground pt-2">Return Conditions</h4>
              <p>
                All returns require the item to be in original condition and original structural packaging. Refunds are processed to the user's submitted bank account number within 5 to 7 business days following pickup and quality review.
              </p>
            </div>
          )}

          {/* COOKIE POLICY */}
          {activeTab === "cookie" && (
            <div className="space-y-4">
              <h3 className="font-display font-black text-xs uppercase tracking-widest text-foreground border-b border-border/40 pb-3">
                Cookie Policy
              </h3>
              <p>Last updated: June 09, 2026</p>
              <p>
                We use cookies to enhance your browsing experience, store active shopping cart items locally, and recognize your JWT login profile across active tabs. By continuing to browse our shop, you consent to our use of essential session cookies.
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}

import { Suspense } from "react";

export default function LegalPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-stone-100 dark:bg-stone-950 text-foreground uppercase tracking-widest text-xs font-bold">
        Loading Legal Documents...
      </div>
    }>
      <LegalPageContent />
    </Suspense>
  );
}
