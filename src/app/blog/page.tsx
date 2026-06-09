import React from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Calendar, User, ArrowRight } from "lucide-react";

export default function BlogPage() {
  const articles = [
    {
      title: "The Ergonomics of Workspace Layouts",
      slug: "ergonomics-workspace-layouts",
      excerpt: "How the physical organization of your desk influences cognitive load, mental focus, and neck fatigue during long coding and design sessions.",
      date: "June 05, 2026",
      author: "Zain Ahmed",
      image: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=400",
      category: "Workspace Design"
    },
    {
      title: "Timber Selection: Solid Walnut vs Oak",
      slug: "timber-selection-solid-walnut-vs-oak",
      excerpt: "Deep diving into wood density, grain patterns, moisture warping resistance, and aesthetic warmth for desktop setups.",
      date: "May 28, 2026",
      author: "Sarah Khan",
      image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&q=80&w=400",
      category: "Material Science"
    },
    {
      title: "The Art of Vegetable-Tanned Leather Patina",
      slug: "vegetable-tanned-leather-patina",
      excerpt: "Understanding how full-grain leather sleeves absorb natural hand oils, wear, and light exposure to form a custom amber sheen.",
      date: "May 15, 2026",
      author: "Adnan Malik",
      image: "https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&q=80&w=400",
      category: "Leather Craft"
    }
  ];

  return (
    <>
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-grow select-none">
        {/* Header */}
        <div className="border-b border-border/40 pb-6 mb-12 flex justify-between items-baseline flex-col sm:flex-row gap-2">
          <div className="space-y-1">
            <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">MONOLITH CHRONICLES</span>
            <h1 className="font-display text-3xl font-black uppercase tracking-wider text-foreground">Artisan Blog</h1>
          </div>
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">Workspace journals</p>
        </div>

        {/* Articles list */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {articles.map((art) => (
            <div key={art.slug} className="group flex flex-col justify-between border border-border/40 bg-card hover:shadow-lg transition-all duration-300">
              <Link href={`/blog/${art.slug}`} className="block overflow-hidden aspect-[16/10] bg-stone-100 dark:bg-stone-900 border-b border-border/40">
                <img
                  src={art.image}
                  alt={art.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103 filter brightness-90 group-hover:brightness-95"
                  loading="lazy"
                />
              </Link>

              <div className="p-6 flex-grow flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    <span>{art.category}</span>
                  </div>

                  <Link href={`/blog/${art.slug}`} className="block">
                    <h3 className="font-display text-base font-bold text-foreground hover:underline leading-snug line-clamp-2">
                      {art.title}
                    </h3>
                  </Link>

                  <p className="text-xs text-muted-foreground font-light leading-relaxed line-clamp-3 pt-1">
                    {art.excerpt}
                  </p>
                </div>

                <div className="border-t border-border/20 pt-4 flex justify-between items-center text-[10px] text-stone-400 font-bold uppercase tracking-wider">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{art.date}</span>
                  </div>
                  <Link href={`/blog/${art.slug}`} className="hover:text-foreground transition-colors flex items-center gap-1">
                    Read Article <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </>
  );
}
