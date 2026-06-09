"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { ProductGridSkeleton } from "@/components/Skeletons";
import { SlidersHorizontal, Search, RotateCcw, ChevronLeft, ChevronRight } from "lucide-react";
import { Product } from "@/context/CartContext";

function ShopPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Filter States
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState(searchParams.get("q") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "All");
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");
  const [sortBy, setSortBy] = useState(searchParams.get("sortBy") || "new_arrivals");
  const [page, setPage] = useState(parseInt(searchParams.get("page") || "1"));
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Sync state with URL params on load
  useEffect(() => {
    setQ(searchParams.get("q") || "");
    setCategory(searchParams.get("category") || "All");
    setMinPrice(searchParams.get("minPrice") || "");
    setMaxPrice(searchParams.get("maxPrice") || "");
    setSortBy(searchParams.get("sortBy") || "new_arrivals");
    setPage(parseInt(searchParams.get("page") || "1"));
  }, [searchParams]);

  // Fetch products from API
  useEffect(() => {
    const fetchFilteredProducts = async () => {
      setLoading(true);
      try {
        const query = new URLSearchParams();
        if (q) query.set("q", q);
        if (category && category !== "All") query.set("category", category);
        if (minPrice) query.set("minPrice", minPrice);
        if (maxPrice) query.set("maxPrice", maxPrice);
        if (sortBy) query.set("sortBy", sortBy);
        query.set("page", page.toString());
        query.set("limit", "8"); // 8 items per page

        const res = await fetch(`/api/products?${query.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setProducts(data.products || []);
          setTotalPages(data.pagination?.totalPages || 1);
          setTotalCount(data.pagination?.totalCount || 0);
        }
      } catch (err) {
        console.error("Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFilteredProducts();
  }, [q, category, minPrice, maxPrice, sortBy, page]);

  // Update query parameters in URL
  const updateUrlParams = (newParams: Record<string, string | number | null>) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    
    Object.entries(newParams).forEach(([key, value]) => {
      if (value === null || value === "") {
        current.delete(key);
      } else {
        current.set(key, value.toString());
      }
    });

    router.push(`/shop?${current.toString()}`);
  };

  const handleCategorySelect = (cat: string) => {
    setCategory(cat);
    setPage(1);
    updateUrlParams({ category: cat === "All" ? "" : cat, page: 1 });
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSortBy(val);
    updateUrlParams({ sortBy: val });
  };

  const handleResetFilters = () => {
    setQ("");
    setCategory("All");
    setMinPrice("");
    setMaxPrice("");
    setSortBy("new_arrivals");
    setPage(1);
    router.push("/shop");
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      updateUrlParams({ page: newPage });
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const categories = ["All", "Desk Shelves", "Tech Sleeves", "Desk Mats", "Organizers", "Charging Stands"];

  return (
    <>
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-grow select-none">
        {/* Title Bar */}
        <div className="border-b border-border/40 pb-6 mb-8 flex flex-col md:flex-row justify-between items-baseline gap-4">
          <div className="space-y-1">
            <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">MONOLITH ARCHIVE</span>
            <h1 className="font-display text-3xl font-black uppercase tracking-wider text-foreground">Shop Collection</h1>
          </div>
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">
            {loading ? "Searching catalog..." : `${totalCount} Products Available`}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="space-y-6 lg:col-span-1">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <span className="text-xs font-black uppercase tracking-widest text-foreground flex items-center gap-2">
                <SlidersHorizontal className="w-3.5 h-3.5" /> Filters
              </span>
              <button
                onClick={handleResetFilters}
                className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
            </div>

            {/* Search Filter */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Search</label>
              <div className="relative flex items-center border border-border bg-card">
                <input
                  type="text"
                  placeholder="Find accessories..."
                  value={q}
                  onChange={(e) => {
                    setQ(e.target.value);
                    setPage(1);
                    updateUrlParams({ q: e.target.value, page: 1 });
                  }}
                  className="w-full text-xs h-10 px-3 pr-8 bg-transparent focus:outline-none focus:border-foreground"
                />
                <Search className="absolute right-3 w-4 h-4 text-muted-foreground" />
              </div>
            </div>

            {/* Categories Filter */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Category</label>
              <div className="flex flex-col space-y-1 text-xs">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => handleCategorySelect(cat)}
                    className={`text-left h-8 px-3 transition-colors ${
                      category === cat
                        ? "bg-primary text-primary-foreground font-semibold"
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Filter */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Price Range (PKR)</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => {
                    setMinPrice(e.target.value);
                    setPage(1);
                    updateUrlParams({ minPrice: e.target.value, page: 1 });
                  }}
                  className="w-full border border-border bg-card text-xs h-9 px-3 focus:outline-none focus:border-foreground"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => {
                    setMaxPrice(e.target.value);
                    setPage(1);
                    updateUrlParams({ maxPrice: e.target.value, page: 1 });
                  }}
                  className="w-full border border-border bg-card text-xs h-9 px-3 focus:outline-none focus:border-foreground"
                />
              </div>
            </div>
          </div>

          {/* Product Grid Area */}
          <div className="lg:col-span-3 space-y-8">
            {/* Sorting Header */}
            <div className="flex justify-between items-center bg-stone-100 dark:bg-stone-900/50 p-3 border border-border/20">
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
                Catalogue Grid
              </span>
              <div className="flex items-center space-x-2 text-xs">
                <label className="text-muted-foreground uppercase tracking-widest text-[9px] font-bold">Sort By</label>
                <select
                  value={sortBy}
                  onChange={handleSortChange}
                  className="bg-card border border-border px-2.5 py-1 text-xs focus:outline-none focus:border-foreground text-foreground uppercase tracking-widest font-semibold"
                >
                  <option value="new_arrivals">New Arrivals</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="rating_desc">Best Rating</option>
                </select>
              </div>
            </div>

            {/* Loading Grid vs Products */}
            {loading ? (
              <ProductGridSkeleton count={6} />
            ) : products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-24 border border-dashed border-border flex flex-col items-center justify-center space-y-4">
                <SlidersHorizontal className="w-8 h-8 text-muted-foreground animate-pulse" />
                <div className="space-y-1">
                  <h3 className="font-display font-bold uppercase text-sm">No items found</h3>
                  <p className="text-[11px] text-muted-foreground">Try loosening search keywords or clearing price filters.</p>
                </div>
                <button
                  onClick={handleResetFilters}
                  className="bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-widest px-6 h-10 transition-transform active:scale-95"
                >
                  Reset All Filters
                </button>
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && !loading && (
              <div className="flex items-center justify-center gap-4 pt-6 border-t border-border/40">
                <button
                  disabled={page === 1}
                  onClick={() => handlePageChange(page - 1)}
                  className="p-2 border border-border bg-card text-muted-foreground disabled:opacity-40 hover:text-foreground disabled:hover:text-muted-foreground transition-colors"
                  aria-label="Previous Page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs uppercase tracking-widest font-bold">
                  Page {page} of {totalPages}
                </span>
                <button
                  disabled={page === totalPages}
                  onClick={() => handlePageChange(page + 1)}
                  className="p-2 border border-border bg-card text-muted-foreground disabled:opacity-40 hover:text-foreground disabled:hover:text-muted-foreground transition-colors"
                  aria-label="Next Page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}

import { Suspense } from "react";

export default function ShopPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-stone-100 dark:bg-stone-950 text-foreground uppercase tracking-widest text-xs font-bold">
        Loading Collection...
      </div>
    }>
      <ShopPageContent />
    </Suspense>
  );
}
