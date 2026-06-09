import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { ArrowRight, Box, Compass, Hammer, ShieldCheck } from "lucide-react";

export const revalidate = 60; // Revalidate home page cache every minute

export default async function HomePage() {
  let featuredProducts: any[] = [];
  try {
    const dbProducts = await prisma.product.findMany({
      take: 4,
      orderBy: { rating: "desc" },
    });
    featuredProducts = dbProducts.map((p) => ({
      ...p,
      images: p.images ? p.images.split(",") : [],
      specifications: p.specifications ? JSON.parse(p.specifications) : {},
    }));
  } catch (error) {
    console.error("Failed to load featured products for home page:", error);
  }

  const statistics = [
    { value: "3", label: "Premium Materials", desc: "Walnut, full-grain leather, merino wool" },
    { value: "100%", label: "Handcrafted", desc: "Crafted locally with precision engineering" },
    { value: "Rs. 10k+", label: "Free Shipping", desc: "Across Pakistan (Karachi, Lahore, etc.)" },
  ];

  const categories = [
    { name: "Desk Shelves", count: 2, image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&q=80&w=400", href: "/shop?category=Desk%20Shelves" },
    { name: "Tech Sleeves", count: 3, image: "https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&q=80&w=400", href: "/shop?category=Tech%20Sleeves" },
    { name: "Desk Mats", count: 1, image: "https://images.unsplash.com/photo-1616440347437-b1c73416efc2?auto=format&fit=crop&q=80&w=400", href: "/shop?category=Desk%20Mats" },
    { name: "Organizers", count: 2, image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=400", href: "/shop?category=Organizers" },
  ];

  return (
    <>
      <Navbar />
      
      {/* 1. Large Animated Hero Section */}
      <section className="relative bg-[#121212] text-stone-100 overflow-hidden h-[90vh] flex items-center select-none">
        {/* Decorative Grid Line Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#242424_1px,transparent_1px),linear-gradient(to_bottom,#242424_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="text-[10px] tracking-[0.3em] font-black uppercase text-stone-400 block">
              DESIGN SYSTEM FOR THE DESK
            </span>
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-none text-stone-50">
              Define Your <br />
              <span className="text-stone-400">Creative Workspace.</span>
            </h1>
            <p className="text-sm sm:text-base text-stone-400 max-w-md font-light leading-relaxed">
              Precision crafted desk accessories utilizing premium American Walnut, vegetable-tanned full-grain leather, and natural merino wool. 
            </p>
            <div className="flex gap-4 pt-4">
              <Link 
                href="/shop" 
                className="bg-stone-100 hover:bg-stone-200 text-stone-950 px-8 h-12 flex items-center justify-center font-bold text-xs uppercase tracking-widest transition-colors duration-200"
              >
                Shop Collection
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
              <Link 
                href="/about" 
                className="border border-stone-700 hover:border-stone-500 text-stone-100 px-8 h-12 flex items-center justify-center font-bold text-xs uppercase tracking-widest transition-colors duration-200"
              >
                Our Story
              </Link>
            </div>
          </div>
          
          {/* Hero Image / Graphic */}
          <div className="hidden lg:block relative aspect-square w-full max-w-md mx-auto bg-stone-900 border border-stone-800 p-8 glass-premium">
            <img 
              src="https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&q=80&w=600" 
              alt="Monolith Walnut Desk Shelf Setup" 
              className="w-full h-full object-cover shadow-2xl filter brightness-95"
            />
            <div className="absolute -bottom-6 -left-6 bg-stone-100 text-stone-950 p-4 border border-stone-200 shadow-xl max-w-[200px]">
              <p className="text-[9px] uppercase tracking-widest font-black text-stone-400">FEATURED PRODUCT</p>
              <p className="text-xs font-bold font-display uppercase tracking-wider mt-1">Walnut Desk Shelf</p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Statistics Section */}
      <section className="bg-stone-100 dark:bg-stone-950 py-16 border-b border-border/40 select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {statistics.map((stat, idx) => (
              <div key={idx} className="space-y-2 p-6 glass rounded-none border-none">
                <span className="font-display text-3xl sm:text-4xl font-black text-foreground block">
                  {stat.value}
                </span>
                <span className="text-xs font-bold uppercase tracking-widest text-foreground block">
                  {stat.label}
                </span>
                <span className="text-[11px] text-muted-foreground block font-light">
                  {stat.desc}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Categories Showcase */}
      <section className="py-20 select-none bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-md mx-auto space-y-2">
            <h2 className="font-display text-2xl sm:text-3xl font-black uppercase tracking-wider">
              Browse Categories
            </h2>
            <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">
              Explore desk organization systems
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((cat, idx) => (
              <Link 
                key={idx} 
                href={cat.href} 
                className="group relative aspect-square overflow-hidden bg-stone-100 dark:bg-stone-900 border border-border/40"
              >
                <img 
                  src={cat.image} 
                  alt={cat.name} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 filter brightness-90 group-hover:brightness-95"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6">
                  <h3 className="font-display text-sm font-bold uppercase tracking-widest text-stone-100">
                    {cat.name}
                  </h3>
                  <p className="text-[9px] uppercase tracking-wider text-stone-400 mt-1">
                    {cat.count} Products
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Featured Products (Best Sellers) */}
      <section className="py-20 bg-stone-50 dark:bg-stone-900/30 border-y border-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="flex flex-col sm:flex-row justify-between items-baseline gap-4">
            <div className="space-y-1">
              <h2 className="font-display text-2xl sm:text-3xl font-black uppercase tracking-wider">
                Best Sellers
              </h2>
              <p className="text-xs text-muted-foreground uppercase tracking-widest">
                Our most coveted minimalist designs
              </p>
            </div>
            <Link 
              href="/shop" 
              className="text-xs uppercase tracking-widest font-bold text-foreground hover:underline flex items-center gap-1.5"
            >
              View All Shop
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 glass border-dashed">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">
                No products found in the catalog. Run seeds to populate.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* 5. Brand Story Section */}
      <section className="py-24 bg-stone-100 dark:bg-stone-950 select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 space-y-6">
            <span className="text-[10px] tracking-[0.3em] font-black uppercase text-stone-400 block">
              OUR CRAFT & PHILOSOPHY
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-black uppercase tracking-wider text-foreground">
              Built to Last. Designed to Focus.
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground font-light leading-relaxed">
              Monolith was born out of a desire for workspace clarity. We believe that physical structures influence mental focus. By stripping away clutter and using raw, honest, premium materials, we create tools that define a workspace built for high-performance creative execution.
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground font-light leading-relaxed">
              Every solid walnut shelf is hand-finished, and every tech folio is stitched locally using premium full-grain leather. Our default operations are based in Pakistan, supporting domestic craftsman, while maintaining a luxury standard globally.
            </p>
            <div className="pt-4">
              <Link 
                href="/about" 
                className="text-xs uppercase tracking-widest font-bold border-b border-foreground pb-1 text-foreground hover:text-muted-foreground hover:border-muted-foreground transition-colors"
              >
                Learn More About Us
              </Link>
            </div>
          </div>
          
          <div className="lg:col-span-7 grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <img 
                src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=400" 
                alt="Minimal office desk" 
                className="w-full aspect-[4/5] object-cover border border-border/40"
              />
              <div className="p-4 bg-background border border-border/40">
                <h4 className="text-xs font-bold uppercase tracking-wider font-display">Walnut Sourcing</h4>
                <p className="text-[10px] text-muted-foreground mt-1">Sustainably harvested walnut logs.</p>
              </div>
            </div>
            <div className="space-y-4 pt-12">
              <img 
                src="https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=400" 
                alt="Leather craftwork details" 
                className="w-full aspect-[4/5] object-cover border border-border/40"
              />
              <div className="p-4 bg-background border border-border/40">
                <h4 className="text-xs font-bold uppercase tracking-wider font-display">Artisan Assembly</h4>
                <p className="text-[10px] text-muted-foreground mt-1">Stitched by hand in local leather workshops.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Brand Values Accordion */}
      <section className="py-20 bg-background select-none border-t border-border/40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-2">
            <h2 className="font-display text-2xl font-black uppercase tracking-wider">Why Monolith?</h2>
            <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">Craftsmanship standards</p>
          </div>
          <div className="space-y-6">
            <div className="p-6 glass flex gap-6 items-start">
              <ShieldCheck className="w-6 h-6 text-stone-500 shrink-0" />
              <div className="space-y-1">
                <h4 className="font-display font-bold uppercase text-xs tracking-wider">Premium Durability Guarantee</h4>
                <p className="text-[11px] text-muted-foreground font-light">We offer a lifetime warranty on stitching and structural failures. If your leather sleeve splits or walnut shelf warps, we replace it.</p>
              </div>
            </div>
            <div className="p-6 glass flex gap-6 items-start">
              <Hammer className="w-6 h-6 text-stone-500 shrink-0" />
              <div className="space-y-1">
                <h4 className="font-display font-bold uppercase text-xs tracking-wider">Artisan Manufacturing</h4>
                <p className="text-[11px] text-muted-foreground font-light">Each piece undergoes multi-stage inspections, sanding, and hand-oil finishes to guarantee that no two products are identical.</p>
              </div>
            </div>
            <div className="p-6 glass flex gap-6 items-start">
              <Compass className="w-6 h-6 text-stone-500 shrink-0" />
              <div className="space-y-1">
                <h4 className="font-display font-bold uppercase text-xs tracking-wider">Local Workspace Commitment</h4>
                <p className="text-[11px] text-muted-foreground font-light">We pay our craftsmen fair liveable wages, supporting historical leather and woodworking guilds in Pakistan while utilizing global standard quality controllers.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
