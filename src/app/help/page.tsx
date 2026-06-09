"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { HelpCircle, Truck, RefreshCw, ShieldCheck } from "lucide-react";

function HelpCenterPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState("faq"); // faq, shipping, returns, warranty

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    router.push(`/help?tab=${tab}`);
  };

  const faqItems = [
    { q: "Is cash on delivery available across all of Pakistan?", a: "Yes, Cash on Delivery (COD) is available for orders under Rs. 50,000 in major cities (Karachi, Lahore, Islamabad, Faisalabad, Peshawar, Multan, Quetta, Sialkot, Hyderabad, etc.). For smaller towns or remote regions, or orders exceeding Rs. 50,000, please pay via Direct Bank Transfer or Credit Cards." },
    { q: "What is your default currency?", a: "Our default currency is the Pakistani Rupee (PKR, ₨). All invoice ledgers, checkout totals, and sales tax breakdowns are denominated in PKR. Multi-currency translation architecture is integrated for future expansion." },
    { q: "Do you offer custom dimensions for the monitor desk shelves?", a: "We periodically release custom dimensions. Please reach out to us at custom@monolith.com with your desk measurements and wood preference (Walnut, Oak, etc.) and our woodworking guild will review feasibility." },
    { q: "How do I care for my merino wool desk mat?", a: "Lint is normal initially. Use a lint shaver or dry vacuum once a week. Avoid washing. Blot liquid spills immediately with a clean dry microfiber cloth. Avoid strong detergents." }
  ];

  return (
    <>
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 py-12 flex-grow select-none">
        {/* Title */}
        <div className="text-center space-y-3 mb-16 max-w-sm mx-auto">
          <span className="text-[9px] font-black uppercase tracking-widest text-stone-400">help center</span>
          <h1 className="font-display text-3xl font-black uppercase tracking-wider text-foreground">
            Support & Policies
          </h1>
        </div>

        {/* Tab Buttons */}
        <div className="flex border-b border-border/40 mb-10 text-xs font-bold uppercase tracking-widest gap-2">
          <button
            onClick={() => handleTabChange("faq")}
            className={`flex items-center gap-1.5 h-10 px-4 border-b-2 transition-colors ${
              activeTab === "faq" ? "border-primary text-foreground" : "border-transparent text-stone-400 hover:text-foreground"
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" /> FAQs
          </button>
          <button
            onClick={() => handleTabChange("shipping")}
            className={`flex items-center gap-1.5 h-10 px-4 border-b-2 transition-colors ${
              activeTab === "shipping" ? "border-primary text-foreground" : "border-transparent text-stone-400 hover:text-foreground"
            }`}
          >
            <Truck className="w-3.5 h-3.5" /> Shipping Policy
          </button>
          <button
            onClick={() => handleTabChange("returns")}
            className={`flex items-center gap-1.5 h-10 px-4 border-b-2 transition-colors ${
              activeTab === "returns" ? "border-primary text-foreground" : "border-transparent text-stone-400 hover:text-foreground"
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5" /> Returns Policy
          </button>
        </div>

        {/* Tab Content */}
        <div className="space-y-6 text-xs sm:text-sm text-muted-foreground font-light leading-relaxed mb-20">
          
          {/* TAB: FAQ */}
          {activeTab === "faq" && (
            <div className="space-y-6">
              {faqItems.map((faq, idx) => (
                <div key={idx} className="p-6 glass space-y-2">
                  <h4 className="font-display font-bold uppercase text-xs tracking-wider text-foreground">
                    Q: {faq.q}
                  </h4>
                  <p className="font-light leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          )}

          {/* TAB: SHIPPING */}
          {activeTab === "shipping" && (
            <div className="p-8 glass space-y-6">
              <h3 className="font-display font-black text-xs uppercase tracking-widest text-foreground border-b border-border/40 pb-3">
                Shipping & Delivery Rates
              </h3>
              
              <div className="space-y-4">
                <p>
                  We dispatch shipments from our logistics warehouse in Karachi. We work with leading courier providers including <strong>TCS</strong>, <strong>Leopards Courier</strong>, and <strong>Trax</strong> to ensure reliable and fast deliveries.
                </p>
                
                <h4 className="font-display font-bold uppercase text-xs tracking-wider text-foreground pt-2">Rates & Thresholds</h4>
                <ul className="list-disc pl-5 space-y-2">
                  <li><strong>Orders under Rs. 10,000:</strong> Flat Rs. 300 shipping surcharge applies.</li>
                  <li><strong>Orders of Rs. 10,000 or more:</strong> Free delivery anywhere in Pakistan.</li>
                </ul>

                <h4 className="font-display font-bold uppercase text-xs tracking-wider text-foreground pt-2">Estimated Transit Times</h4>
                <ul className="list-disc pl-5 space-y-2">
                  <li><strong>Karachi:</strong> 1-2 business days.</li>
                  <li><strong>Lahore, Islamabad, Rawalpindi:</strong> 2-3 business days.</li>
                  <li><strong>Other major cities:</strong> 3-4 business days.</li>
                  <li><strong>Remote regions:</strong> 4-7 business days via Pakistan Post.</li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB: RETURNS */}
          {activeTab === "returns" && (
            <div className="p-8 glass space-y-6">
              <h3 className="font-display font-black text-xs uppercase tracking-widest text-foreground border-b border-border/40 pb-3">
                Returns & Exchanges
              </h3>
              
              <div className="space-y-4">
                <p>
                  We take pride in our precision craftsmanship. If a product does not meet your expectations, we offer a **30-day money-back guarantee** starting from the date of package delivery.
                </p>

                <h4 className="font-display font-bold uppercase text-xs tracking-wider text-foreground pt-2">Return Conditions</h4>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Items must be returned in their original packaging, including protective foam, boxes, and product tags.</li>
                  <li>Wood surfaces must be free from coffee rings, cup marks, or structural scuffs.</li>
                  <li>Leather/wool felt mats must be rolled correctly to prevent creasing.</li>
                </ul>

                <h4 className="font-display font-bold uppercase text-xs tracking-wider text-foreground pt-2">Process</h4>
                <p>
                  To request a return, contact support@monolith.com with your order number. Once approved, we will book a return pickup request with TCS at your address, or instruct you to drop the package at your local Leopards station. Refunds are processed to your bank account within 5-7 business days.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}

import { Suspense } from "react";

export default function HelpCenterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-stone-100 dark:bg-stone-950 text-foreground uppercase tracking-widest text-xs font-bold">
        Loading Help Center...
      </div>
    }>
      <HelpCenterPageContent />
    </Suspense>
  );
}
