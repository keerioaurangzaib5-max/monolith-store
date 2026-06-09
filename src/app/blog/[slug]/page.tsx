"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ArrowLeft, Calendar, User, Clock } from "lucide-react";

export default function BlogDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const articlesData: Record<string, {
    title: string;
    category: string;
    date: string;
    author: string;
    readTime: string;
    image: string;
    content: React.ReactNode;
  }> = {
    "ergonomics-workspace-layouts": {
      title: "The Ergonomics of Workspace Layouts",
      category: "Workspace Design",
      date: "June 05, 2026",
      author: "Zain Ahmed",
      readTime: "5 min read",
      image: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800",
      content: (
        <>
          <p>
            The arrangement of your desk is more than a matter of clean visual style. It directly dictates your neck posture, wrist angles, and cognitive load during deep work. In this journal entry, we analyze key spacing layouts to prevent physical strain.
          </p>
          <h2>1. The Monitor Height Rule</h2>
          <p>
            Ideally, your gaze should align directly with the top third of your screen. If your monitor sits too low, your neck naturally tilts down, overloading the cervical spine. Using a monitor desk shelf elevates the screen to an ergonomic level, while creating secondary desk storage for pens and SSDs.
          </p>
          <blockquote>
            "Physical workspace clarity fosters mental focus. Elevating your gaze lifts your posture."
          </blockquote>
          <h2>2. The Desk Boundary</h2>
          <p>
            Define your active zone. Place your keyboard and mouse on a cushioned workspace mat like natural wool felt. Wool felt provides thermal insulation, preventing your wrists from absorbing cold desk surface temperatures, and offers soft cushioning for long typing sessions.
          </p>
        </>
      )
    },
    "timber-selection-solid-walnut-vs-oak": {
      title: "Timber Selection: Solid Walnut vs Oak",
      category: "Material Science",
      date: "May 28, 2026",
      author: "Sarah Khan",
      readTime: "4 min read",
      image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&q=80&w=800",
      content: (
        <>
          <p>
            When selecting desktop accessories, wood choice dictates durability and texture. Here we explore why American Walnut remains the premium choice for design professionals.
          </p>
          <h2>Solid American Walnut</h2>
          <p>
            American Walnut is renowned for its dark, chocolate-brown tones and rich wavy grain lines. It holds natural oils beautifully, creating a silky luster. It has excellent dimensional stability, meaning it is highly resistant to warping or cracking under temperature and humidity shifts.
          </p>
          <h2>White Oak Comparisons</h2>
          <p>
            While White Oak is exceptionally hard and dense, its lighter, honey-wheat shades fit a Scandinavian aesthetic but lack the dark contrast and premium architectural weight of Walnut. At Monolith, we exclusively sand and hand-finish solid Walnut to define high-contrast spaces.
          </p>
        </>
      )
    },
    "vegetable-tanned-leather-patina": {
      title: "The Art of Vegetable-Tanned Leather Patina",
      category: "Leather Craft",
      date: "May 15, 2026",
      author: "Adnan Malik",
      readTime: "6 min read",
      image: "https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&q=80&w=800",
      content: (
        <>
          <p>
            Unlike synthetic polyurethane leathers or chrome-tanned skins, vegetable-tanned hides are an organic, breathing material. Over months of typing, carrying, and light exposure, they undergo a beautiful mutation: the patina.
          </p>
          <h2>The Patina Process</h2>
          <p>
            Vegetable tanning uses natural tree barks and plant tannins to preserve the hide. As your hands interact with the sleeve, it absorbs natural oils. Sunshine speeds up oxidation, gradually darkening the skin from a sandy beige to a deep, caramelized amber brown.
          </p>
          <blockquote>
            "A patina is the visual record of your hard work, forming a custom gloss unique to you."
          </blockquote>
          <h2>Caring for Leather</h2>
          <p>
            Avoid soaking. Clean with a dry microfiber cloth and occasionally apply organic beeswax or leather balm to preserve flexibility and prevent drying out.
          </p>
        </>
      )
    }
  };

  const article = articlesData[slug];

  if (!article) {
    return (
      <>
        <Navbar />
        <main className="max-w-md mx-auto py-24 px-4 text-center space-y-4">
          <h3 className="font-display text-sm font-bold uppercase tracking-wider">Article not found</h3>
          <button onClick={() => router.push("/blog")} className="bg-primary text-primary-foreground text-[10px] font-bold px-6 h-10 uppercase tracking-widest">
            Return to Blog
          </button>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 py-10 flex-grow select-none">
        {/* Back link */}
        <button
          onClick={() => router.push("/blog")}
          className="flex items-center gap-1.5 text-xs uppercase tracking-widest font-bold text-stone-400 hover:text-foreground mb-8"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Blog
        </button>

        {/* Article Header */}
        <div className="space-y-4 border-b border-border/40 pb-6 mb-8">
          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
            {article.category}
          </span>
          <h1 className="font-display text-3xl sm:text-4xl font-black uppercase tracking-wider text-foreground leading-tight">
            {article.title}
          </h1>

          <div className="flex flex-wrap gap-4 text-[10px] uppercase tracking-wider text-stone-400 font-bold">
            <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" /> By {article.author}</span>
            <span>•</span>
            <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {article.date}</span>
            <span>•</span>
            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {article.readTime}</span>
          </div>
        </div>

        {/* Feature Image */}
        <div className="w-full aspect-[16/9] bg-stone-100 dark:bg-stone-900 border border-border/40 overflow-hidden mb-10">
          <img
            src={article.image}
            alt={article.title}
            className="w-full h-full object-cover filter brightness-95"
          />
        </div>

        {/* Editorial Body */}
        <article className="prose dark:prose-invert max-w-none text-xs sm:text-sm leading-relaxed text-muted-foreground font-light space-y-6">
          {article.content}
        </article>
      </main>

      <Footer />
    </>
  );
}
