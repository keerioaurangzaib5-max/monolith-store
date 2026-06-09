"use client";

import React from "react";
import Link from "next/link";
import { useWishlist } from "@/context/WishlistContext";
import { useCart, Product } from "@/context/CartContext";
import { Heart, ShoppingCart } from "lucide-react";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToCart } = useCart();

  const isLiked = isInWishlist(product.id);
  const activePrice = product.price - product.discount;
  const isOutOfStock = product.inventory <= 0;

  // Split images safely
  const imageList = Array.isArray(product.images)
    ? product.images
    : (typeof product.images === "string" ? product.images.split(",") : []);
  const primaryImage = imageList[0] || "/images/placeholder.jpg";

  // Parse specifications
  let specifications: any = {};
  try {
    specifications = typeof product.specifications === "string"
      ? JSON.parse(product.specifications)
      : (product.specifications || {});
  } catch (e) {}

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isOutOfStock) {
      // Pick first size and color if available
      const defaultSize = specifications.sizes?.[0] || null;
      const defaultColor = specifications.colors?.[0] || null;
      addToCart(product, 1, defaultSize, defaultColor);
    }
  };

  const handleLikeToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  return (
    <div className="group relative bg-card border border-border/40 overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col justify-between select-none">
      {/* Product Image Area */}
      <Link href={`/shop/${product.id}`} className="block relative overflow-hidden aspect-[4/5] bg-muted/20">
        {/* Out of Stock Label */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-background/60 backdrop-blur-xs z-10 flex items-center justify-center">
            <span className="bg-stone-900 text-stone-100 text-[10px] font-black uppercase tracking-widest px-4 py-2">
              SOLD OUT
            </span>
          </div>
        )}

        {/* Promo Discount Badge */}
        {product.discount > 0 && !isOutOfStock && (
          <div className="absolute top-4 left-4 z-10 bg-primary text-primary-foreground text-[8px] font-black uppercase tracking-widest px-2.5 py-1">
            SAVE Rs. {product.discount.toLocaleString()}
          </div>
        )}

        {/* Wishlist Heart Toggle */}
        <button
          onClick={handleLikeToggle}
          className="absolute top-4 right-4 z-10 p-2.5 glass rounded-full hover:scale-105 transition-transform"
          aria-label="Add to Wishlist"
        >
          <Heart
            className={`w-3.5 h-3.5 transition-colors ${
              isLiked 
                ? "fill-red-500 text-red-500" 
                : "text-muted-foreground hover:text-foreground"
            }`}
          />
        </button>

        {/* Image Zoom */}
        <div className="w-full h-full hover-zoom flex items-center justify-center bg-stone-100 dark:bg-stone-900">
          {/* We use standard img element. We can fallback to unsplash placeholders for sandbox visualization */}
          <img
            src={primaryImage.startsWith("/") && !primaryImage.includes("placeholder")
                 ? `https://images.unsplash.com/photo-${primaryImage.includes("shelf") ? "1544244015-0df4b3ffc6b0" : primaryImage.includes("sleeve") ? "1618220179428-22790b461013" : primaryImage.includes("deskmat") ? "1616440347437-b1c73416efc2" : "1586023492125-27b2c045efd7"}?auto=format&fit=crop&q=80&w=400`
                 : primaryImage.includes("unsplash.com") ? primaryImage : "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=400"
            }
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500"
            loading="lazy"
          />
        </div>

        {/* Quick Add overlay */}
        {!isOutOfStock && (
          <button
            onClick={handleQuickAdd}
            className="absolute bottom-4 left-4 right-4 bg-primary text-primary-foreground h-11 text-[10px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            Quick Add
          </button>
        )}
      </Link>

      {/* Product Details Area */}
      <div className="p-4 flex-grow flex flex-col justify-between space-y-2">
        <div className="space-y-1">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
            {product.category}
          </p>
          <Link href={`/shop/${product.id}`} className="block">
            <h3 className="font-display text-sm font-bold text-foreground hover:underline line-clamp-1">
              {product.name}
            </h3>
          </Link>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-xs font-black text-foreground">
            Rs. {activePrice.toLocaleString()}
          </span>
          {product.discount > 0 && (
            <span className="text-[10px] text-muted-foreground line-through">
              Rs. {product.price.toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
