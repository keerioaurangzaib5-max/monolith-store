"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, Globe } from "lucide-react";

export function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 5000);
    }
  };

  return (
    <footer className="w-full bg-stone-900 text-stone-300 border-t border-stone-800 select-none">
      {/* Newsletter Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-b border-stone-800">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <h3 className="font-display font-black text-xl tracking-widest text-stone-100 uppercase">
              Join the Monolith.
            </h3>
            <p className="mt-2 text-xs text-stone-400 max-w-sm">
              Subscribe to receive updates on new product collections, artisan stories, and exclusive subscriber offers.
            </p>
          </div>
          <div>
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <input
                type="email"
                required
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-grow bg-stone-950 border border-stone-700 text-xs px-4 h-11 focus:outline-none focus:border-stone-100 text-stone-100"
              />
              <button
                type="submit"
                className="bg-stone-100 text-stone-950 px-6 h-11 hover:bg-stone-200 transition-colors flex items-center justify-center font-bold text-xs uppercase tracking-widest"
              >
                {subscribed ? "Subscribed" : "Subscribe"}
                {!subscribed && <ArrowRight className="ml-2 w-3.5 h-3.5" />}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Navigation Columns */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-1 space-y-4">
            <span className="font-display font-black text-lg tracking-widest text-stone-100 uppercase">
              Monolith.
            </span>
            <p className="text-[11px] text-stone-400 leading-relaxed">
              Precision desk shelves, premium tech sleeves, and desk organization mats. Crafted by hand to define the modern creative workspace.
            </p>
            <div className="flex items-center space-x-2 text-[10px] text-stone-500 uppercase tracking-widest font-semibold pt-2">
              <Globe className="w-3.5 h-3.5" />
              <span>PKR Default (Rs.)</span>
            </div>
          </div>

          {/* Catalog Link Column */}
          <div>
            <h4 className="text-[10px] font-black text-stone-100 uppercase tracking-widest mb-4">
              Collections
            </h4>
            <ul className="space-y-2 text-[11px]">
              <li>
                <Link href="/shop?category=Desk%20Shelves" className="hover:text-stone-100 transition-colors">
                  Desk Shelves
                </Link>
              </li>
              <li>
                <Link href="/shop?category=Tech%20Sleeves" className="hover:text-stone-100 transition-colors">
                  Tech Sleeves
                </Link>
              </li>
              <li>
                <Link href="/shop?category=Desk%20Mats" className="hover:text-stone-100 transition-colors">
                  Merino Desk Mats
                </Link>
              </li>
              <li>
                <Link href="/shop?category=Organizers" className="hover:text-stone-100 transition-colors">
                  Desk Organizers
                </Link>
              </li>
            </ul>
          </div>

          {/* Company & Support Column */}
          <div>
            <h4 className="text-[10px] font-black text-stone-100 uppercase tracking-widest mb-4">
              Support
            </h4>
            <ul className="space-y-2 text-[11px]">
              <li>
                <Link href="/help" className="hover:text-stone-100 transition-colors">
                  FAQ & Help Center
                </Link>
              </li>
              <li>
                <Link href="/help?tab=shipping" className="hover:text-stone-100 transition-colors">
                  Shipping Policy
                </Link>
              </li>
              <li>
                <Link href="/help?tab=returns" className="hover:text-stone-100 transition-colors">
                  Returns & Refunds
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-stone-100 transition-colors">
                  Contact Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Column */}
          <div>
            <h4 className="text-[10px] font-black text-stone-100 uppercase tracking-widest mb-4">
              Legal
            </h4>
            <ul className="space-y-2 text-[11px]">
              <li>
                <Link href="/legal?tab=privacy" className="hover:text-stone-100 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/legal?tab=terms" className="hover:text-stone-100 transition-colors">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="/legal?tab=refund" className="hover:text-stone-100 transition-colors">
                  Refund Policy
                </Link>
              </li>
              <li>
                <Link href="/legal?tab=cookie" className="hover:text-stone-100 transition-colors">
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Copy & Status bar */}
      <div className="bg-stone-950 text-stone-600 text-[10px] uppercase tracking-wider py-6 border-t border-stone-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <span>
            © {new Date().getFullYear()} Monolith. All Rights Reserved. Precision crafted.
          </span>
          <div className="flex gap-4">
            <span className="text-stone-500 font-bold">DEFAULT CURRENCY: PKR (₨)</span>
            <span>•</span>
            <span className="text-stone-500">SECURE CHECKSOCK: AES-256</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
