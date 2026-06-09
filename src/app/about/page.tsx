import React from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Compass, Eye, ShieldCheck, Heart } from "lucide-react";

export default function AboutPage() {
  const values = [
    { icon: Compass, title: "Minimalist Focus", desc: "We strip away distractions, focusing on clean geometry and raw textures to create workspace clarity." },
    { icon: ShieldCheck, title: "Artisan Quality", desc: "Each piece is hand-finished, sanded, and inspected through multiple cycles to ensure perfection." },
    { icon: Eye, title: "Sustainable Origin", desc: "We source our timber and hides responsibly, supporting regional Pakistan craftsmen." },
    { icon: Heart, title: "Customer Commitment", desc: "Our products are designed to last a lifetime, backed by our structural warranty policies." }
  ];

  return (
    <>
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-grow select-none">
        {/* Header */}
        <div className="text-center max-w-xl mx-auto space-y-3 mb-16">
          <span className="text-[9px] font-black uppercase tracking-widest text-stone-400">our philosophy</span>
          <h1 className="font-display text-3xl sm:text-4xl font-black uppercase tracking-wider text-foreground">
            Crafting Workspace Clarity
          </h1>
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">
            The story behind Monolith.
          </p>
        </div>

        {/* Section 1: Story */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
          <div className="aspect-[4/3] bg-stone-100 dark:bg-stone-900 border border-border/40 overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800"
              alt="Monolith design desk setup"
              className="w-full h-full object-cover filter brightness-95"
            />
          </div>
          <div className="space-y-6 text-xs sm:text-sm leading-relaxed text-muted-foreground font-light">
            <h2 className="font-display text-xl sm:text-2xl font-black uppercase tracking-wider text-foreground">
              Our Journey & Sourcing
            </h2>
            <p>
              Monolith was founded in Karachi in 2024. We noticed that modern creative desks were cluttered with cheap synthetic materials, distracting from the mental focus needed for deep work.
            </p>
            <p>
              We set out to design a system for the desk. We focused on solid American Walnut wood for warmth and stability, full-grain vegetable-tanned leather for texture, and natural merino wool felt for tactile cushioning.
            </p>
            <p>
              Today, we operate a local woodworking workshop and partner with historical leather guilds, ensuring our products represent regional Pakistan craftsmanship while holding a luxury standard globally.
            </p>
          </div>
        </div>

        {/* Section 2: Values Grid */}
        <div className="border-t border-border/40 pt-16 mb-20 space-y-12">
          <div className="text-center space-y-2 max-w-sm mx-auto">
            <h2 className="font-display text-2xl font-black uppercase tracking-wider">Our Core Values</h2>
            <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">The principles driving our designs</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {values.map((v, idx) => (
              <div key={idx} className="p-6 glass flex gap-6 items-start">
                <v.icon className="w-6 h-6 text-stone-500 shrink-0" />
                <div className="space-y-1 text-xs">
                  <h4 className="font-display font-bold uppercase tracking-wider text-foreground">{v.title}</h4>
                  <p className="text-muted-foreground leading-relaxed font-light">{v.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: Vision & Mission */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          <div className="p-8 bg-stone-100 dark:bg-stone-900 border border-border/40 space-y-4 text-center">
            <h3 className="font-display font-black text-xs uppercase tracking-widest text-foreground">Our Mission</h3>
            <p className="text-xs text-muted-foreground leading-relaxed font-light max-w-md mx-auto">
              To empower remote developers, digital designers, and high-performance workers by providing precise physical tools that foster deep work and elevate workspace aesthetics.
            </p>
          </div>
          <div className="p-8 bg-stone-900 text-stone-100 border border-stone-850 space-y-4 text-center">
            <h3 className="font-display font-black text-xs uppercase tracking-widest text-stone-100">Our Vision</h3>
            <p className="text-xs text-stone-400 leading-relaxed font-light max-w-md mx-auto">
              To build a global designer network and ecosystem of modular furniture and desktop accessories that combine architectural precision with high-grade organic materials.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
