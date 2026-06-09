"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2 } from "lucide-react";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    
    // Simulate API contact request
    setTimeout(() => {
      setSending(false);
      setSuccess(true);
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
      setTimeout(() => setSuccess(false), 5000);
    }, 1500);
  };

  const contactInfo = [
    { icon: Phone, label: "Phone support", val: "+92 (21) 3456-7890", desc: "Mon-Fri: 9am - 6pm (PKT)" },
    { icon: Mail, label: "Email support", val: "support@monolith.com", desc: "We reply within 24 hours" },
    { icon: MapPin, label: "Karachi HQ Office", val: "Suite 302, Main Shahrah-e-Faisal", desc: "Karachi, Pakistan (75400)" },
    { icon: Clock, label: "Business Hours", val: "09:00 AM - 06:00 PM", desc: "Closed on Weekends & Holidays" }
  ];

  return (
    <>
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-grow select-none">
        {/* Title */}
        <div className="text-center max-w-xl mx-auto space-y-3 mb-16">
          <span className="text-[9px] font-black uppercase tracking-widest text-stone-400">reach out</span>
          <h1 className="font-display text-3xl sm:text-4xl font-black uppercase tracking-wider text-foreground">
            Contact Monolith
          </h1>
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">
            We are here to support your workspace query.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-20">
          {/* Left: Contact Info */}
          <div className="lg:col-span-5 space-y-6">
            <h3 className="font-display font-black text-xs uppercase tracking-widest border-b border-border/40 pb-3">
              Corporate Desk
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
              {contactInfo.map((info, idx) => (
                <div key={idx} className="p-5 glass flex gap-4 items-start text-xs">
                  <info.icon className="w-5 h-5 text-stone-500 shrink-0" />
                  <div className="space-y-1">
                    <span className="font-bold text-foreground block">{info.label}</span>
                    <span className="text-muted-foreground font-semibold block">{info.val}</span>
                    <span className="text-[10px] text-stone-400 block font-light">{info.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Contact Form */}
          <div className="lg:col-span-7 space-y-6">
            <h3 className="font-display font-black text-xs uppercase tracking-widest border-b border-border/40 pb-3">
              Submit Inquiries
            </h3>

            <form onSubmit={handleSubmit} className="p-6 sm:p-8 glass space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5 col-span-2 sm:col-span-1">
                  <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter name"
                    className="w-full border border-border bg-card text-xs h-10 px-3 focus:outline-none focus:border-foreground"
                  />
                </div>
                <div className="space-y-1.5 col-span-2 sm:col-span-1">
                  <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter email"
                    className="w-full border border-border bg-card text-xs h-10 px-3 focus:outline-none focus:border-foreground"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Subject</label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Order query, custom size, wholesale, etc."
                  className="w-full border border-border bg-card text-xs h-10 px-3 focus:outline-none focus:border-foreground"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Message</label>
                <textarea
                  required
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us how we can help..."
                  className="w-full border border-border bg-card text-xs p-3 focus:outline-none focus:border-foreground"
                />
              </div>

              {success && (
                <div className="p-3 bg-emerald-50/10 border border-emerald-500/20 text-[10px] uppercase tracking-wider font-bold text-emerald-600 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  Your message has been sent successfully. We will respond shortly!
                </div>
              )}

              <button
                type="submit"
                disabled={sending}
                className="w-full bg-primary text-primary-foreground h-11 text-[10px] font-bold uppercase tracking-widest disabled:opacity-40 flex items-center justify-center gap-2"
              >
                <Send className="w-3.5 h-3.5" />
                {sending ? "Sending..." : "Submit Inquiry"}
              </button>
            </form>
          </div>
        </div>

        {/* Map Placeholder */}
        <div className="border-t border-border/40 pt-12">
          <h3 className="font-display font-black text-xs uppercase tracking-widest mb-6">HQ Map Location</h3>
          <div className="w-full h-80 bg-stone-100 dark:bg-stone-900 border border-border/40 flex flex-col items-center justify-center space-y-2 relative overflow-hidden select-none">
            {/* Styled visual grids representing Map */}
            <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#1f2937_1px,transparent_1px)] [background-size:16px_16px] opacity-60"></div>
            <div className="relative z-10 text-center space-y-2">
              <MapPin className="w-8 h-8 text-stone-500 mx-auto animate-bounce" />
              <h4 className="font-display font-bold uppercase text-xs">Monolith Creative HQ</h4>
              <p className="text-[10px] text-muted-foreground">Shahrah-e-Faisal, Karachi, Pakistan</p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
