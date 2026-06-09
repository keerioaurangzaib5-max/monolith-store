"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useCart, Product } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { ProductDetailSkeleton } from "@/components/Skeletons";
import { Heart, ShoppingBag, Truck, Shield, RotateCcw, Star, ArrowLeft } from "lucide-react";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mainImage, setMainImage] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  
  // Review form states
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  // Related products
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);

  // Fetch product data
  useEffect(() => {
    if (!id) return;
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/products/${id}`);
        if (res.ok) {
          const data = await res.json();
          setProduct(data.product);
          setReviews(data.product?.reviews || []);
          
           const images = Array.isArray(data.product?.images)
             ? data.product.images
             : (typeof data.product?.images === "string" ? data.product.images.split(",") : []);
           setMainImage(images[0] || "/images/placeholder.jpg");
 
           // Parse specs to set default variant selections
           try {
             const specs = typeof data.product?.specifications === "string"
               ? JSON.parse(data.product.specifications)
               : (data.product?.specifications || {});
             if (specs.sizes && specs.sizes.length > 0) setSelectedSize(specs.sizes[0]);
             if (specs.colors && specs.colors.length > 0) setSelectedColor(specs.colors[0]);
           } catch (e) {}

          // Fetch related products (same category)
          if (data.product?.category) {
            const relRes = await fetch(`/api/products?category=${encodeURIComponent(data.product.category)}&limit=4`);
            if (relRes.ok) {
              const relData = await relRes.json();
              setRelatedProducts(relData.products.filter((p: any) => p.id !== id));
            }
          }
        } else {
          router.push("/shop");
        }
      } catch (err) {
        console.error("Error loading product details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, router]);

  if (loading) {
    return (
      <>
        <Navbar />
        <ProductDetailSkeleton />
        <Footer />
      </>
    );
  }

  if (!product) return null;

  const isLiked = isInWishlist(product.id);
  const activePrice = product.price - product.discount;
  const isOutOfStock = product.inventory <= 0;
  const images = Array.isArray(product.images)
    ? product.images
    : (typeof product.images === "string" ? product.images.split(",") : []);
 
  let specs: any = {};
  try {
    specs = typeof product.specifications === "string"
      ? JSON.parse(product.specifications)
      : (product.specifications || {});
  } catch (e) {}

  const handleAddToCartClick = () => {
    if (!isOutOfStock) {
      addToCart(product, quantity, selectedSize, selectedColor);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("mn_token");
    if (!token) {
      router.push("/account?mode=login");
      return;
    }

    setSubmittingReview(true);
    try {
      const res = await fetch(`/api/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId: product.id,
          rating,
          comment,
        }),
      });

      if (res.ok) {
        setReviewSuccess(true);
        setComment("");
        
        // Refresh reviews locally
        const freshRes = await fetch(`/api/products/${id}`);
        if (freshRes.ok) {
          const freshData = await freshRes.json();
          setReviews(freshData.product?.reviews || []);
        }
        setTimeout(() => setReviewSuccess(false), 5000);
      }
    } catch (err) {
      console.error("Failed to submit review:", err);
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <>
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-grow select-none">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-xs uppercase tracking-widest font-bold text-muted-foreground hover:text-foreground mb-8"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Shop
        </button>

        {/* Product Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
          {/* Product Images Gallery */}
          <div className="space-y-4">
            <div className="aspect-[4/5] bg-stone-100 dark:bg-stone-900 border border-border/40 overflow-hidden relative flex items-center justify-center">
              {/* Promo Badge */}
              {product.discount > 0 && (
                <div className="absolute top-4 left-4 z-10 bg-primary text-primary-foreground text-[8px] font-black uppercase tracking-widest px-2.5 py-1">
                  SAVE Rs. {product.discount.toLocaleString()}
                </div>
              )}
              
              <img
                src={mainImage.startsWith("/") && !mainImage.includes("placeholder")
                     ? `https://images.unsplash.com/photo-${mainImage.includes("shelf") ? "1544244015-0df4b3ffc6b0" : mainImage.includes("sleeve") ? "1618220179428-22790b461013" : mainImage.includes("deskmat") ? "1616440347437-b1c73416efc2" : "1586023492125-27b2c045efd7"}?auto=format&fit=crop&q=80&w=800`
                     : mainImage
                }
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Gallery Thumbnails */}
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setMainImage(img)}
                    className={`aspect-square border overflow-hidden bg-stone-100 dark:bg-stone-900 ${
                      mainImage === img ? "border-primary" : "border-border/40"
                    }`}
                  >
                    <img
                      src={img.startsWith("/") && !img.includes("placeholder")
                           ? `https://images.unsplash.com/photo-${img.includes("shelf") ? "1544244015-0df4b3ffc6b0" : img.includes("sleeve") ? "1618220179428-22790b461013" : img.includes("deskmat") ? "1616440347437-b1c73416efc2" : "1586023492125-27b2c045efd7"}?auto=format&fit=crop&q=80&w=150`
                           : img
                      }
                      alt={`${product.name} gallery ${idx}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Configurations Info */}
          <div className="space-y-8">
            <div className="space-y-2 border-b border-border/40 pb-6">
              <span className="text-[10px] tracking-widest font-black uppercase text-muted-foreground">
                {product.category}
              </span>
              <h1 className="font-display text-3xl font-black uppercase tracking-wider">
                {product.name}
              </h1>
              
              <div className="flex items-center gap-4 pt-1">
                <div className="flex items-center gap-1.5 text-xs font-semibold">
                  <Star className="w-3.5 h-3.5 fill-foreground text-foreground" />
                  <span>{product.rating ? product.rating.toFixed(1) : "0.0"}</span>
                  <span className="text-muted-foreground">({reviews.length} reviews)</span>
                </div>
                <span className="text-stone-300 dark:text-stone-750">•</span>
                <span className="text-xs uppercase tracking-widest text-muted-foreground font-bold">
                  SKU: {product.sku}
                </span>
              </div>
            </div>

            {/* Pricing */}
            <div className="flex items-baseline gap-4">
              <span className="text-2xl font-black text-foreground">
                Rs. {activePrice.toLocaleString()}
              </span>
              {product.discount > 0 && (
                <span className="text-sm text-muted-foreground line-through">
                  Rs. {product.price.toLocaleString()}
                </span>
              )}
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed font-light">
              {product.description}
            </p>

            {/* Variation: Size Selection */}
            {specs.sizes && specs.sizes.length > 0 && (
              <div className="space-y-2.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Select Size</label>
                <div className="flex flex-wrap gap-2">
                  {specs.sizes.map((sz: string) => (
                    <button
                      key={sz}
                      onClick={() => setSelectedSize(sz)}
                      className={`text-[10px] uppercase font-bold tracking-wider px-4 py-2.5 border ${
                        selectedSize === sz
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-border hover:border-foreground text-foreground bg-card"
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Variation: Color Selection */}
            {specs.colors && specs.colors.length > 0 && (
              <div className="space-y-2.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Select Color</label>
                <div className="flex flex-wrap gap-2">
                  {specs.colors.map((col: string) => (
                    <button
                      key={col}
                      onClick={() => setSelectedColor(col)}
                      className={`text-[10px] uppercase font-bold tracking-wider px-4 py-2.5 border ${
                        selectedColor === col
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-border hover:border-foreground text-foreground bg-card"
                      }`}
                    >
                      {col}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector & Actions */}
            <div className="space-y-4 pt-4 border-t border-border/40">
              <div className="flex gap-4">
                <div className="flex items-center border border-border bg-card">
                  <button
                    disabled={quantity <= 1}
                    onClick={() => setQuantity(quantity - 1)}
                    className="px-3 h-12 text-sm hover:bg-muted text-foreground disabled:opacity-40"
                  >
                    -
                  </button>
                  <span className="w-10 text-center text-xs font-bold text-foreground">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 h-12 text-sm hover:bg-muted text-foreground"
                  >
                    +
                  </button>
                </div>

                <button
                  disabled={isOutOfStock}
                  onClick={handleAddToCartClick}
                  className="flex-grow bg-primary text-primary-foreground h-12 text-xs font-bold uppercase tracking-widest transition-transform active:scale-98 flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4" />
                  {isOutOfStock ? "SOLD OUT" : "ADD TO CART"}
                </button>

                <button
                  onClick={() => toggleWishlist(product.id)}
                  className="p-3 border border-border hover:border-foreground bg-card transition-colors flex items-center justify-center h-12 w-12"
                  aria-label="Toggle Wishlist"
                >
                  <Heart className={`w-4 h-4 ${isLiked ? "fill-red-500 text-red-500" : "text-foreground"}`} />
                </button>
              </div>

              {/* Delivery info block */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-border/20 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-stone-500" />
                  <span>Free delivery Rs.10k+</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-stone-500" />
                  <span>Lifetime warranty</span>
                </div>
                <div className="flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-stone-500" />
                  <span>30-Day returns</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Specifications Tab Table */}
        <div className="border-t border-border/40 pt-12 mb-20 space-y-6">
          <h3 className="font-display text-lg font-black uppercase tracking-wider">Specifications</h3>
          <div className="border border-border/40 bg-stone-50/50 dark:bg-stone-900/10">
            {Object.entries(specs).map(([key, val]: any, idx) => (
              <div
                key={key}
                className={`grid grid-cols-3 p-4 text-xs ${
                  idx % 2 === 0 ? "bg-stone-100/50 dark:bg-stone-900/20" : ""
                }`}
              >
                <span className="font-bold uppercase tracking-widest text-muted-foreground col-span-1">{key}</span>
                <span className="col-span-2 text-foreground">
                  {Array.isArray(val) ? val.join(", ") : val}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Reviews Section */}
        <div className="border-t border-border/40 pt-12 mb-20 space-y-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Reviews list */}
            <div className="lg:col-span-2 space-y-6">
              <h3 className="font-display text-lg font-black uppercase tracking-wider">
                Customer Reviews ({reviews.length})
              </h3>
              
              {reviews.length > 0 ? (
                <div className="space-y-6">
                  {reviews.map((rev: any, idx) => (
                    <div key={idx} className="p-5 glass space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="font-bold text-foreground">{rev.user?.name || "Verified Customer"}</span>
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(rev.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex text-amber-500">
                        {Array.from({ length: rev.rating }).map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-current" />
                        ))}
                      </div>
                      <p className="text-muted-foreground leading-relaxed font-light">{rev.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs uppercase tracking-widest text-muted-foreground py-6 border border-dashed border-border text-center">
                  No reviews submitted yet for this product.
                </p>
              )}
            </div>

            {/* Write a Review */}
            <div className="space-y-6 lg:col-span-1">
              <h3 className="font-display text-lg font-black uppercase tracking-wider">
                Write a Review
              </h3>
              <form onSubmit={handleReviewSubmit} className="space-y-4 p-6 glass">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Rating</label>
                  <div className="flex gap-2.5">
                    {[1, 2, 3, 4, 5].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setRating(val)}
                        className={`p-1.5 rounded-none border text-xs font-bold w-10 h-10 ${
                          rating >= val
                            ? "bg-primary text-primary-foreground border-primary"
                            : "border-border hover:border-foreground"
                        }`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Comment</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Share your thoughts about this product..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full border border-border bg-card text-xs p-3 focus:outline-none focus:border-foreground"
                  />
                </div>

                {reviewSuccess && (
                  <p className="text-[10px] uppercase tracking-widest text-emerald-600 font-bold">
                    Review submitted successfully!
                  </p>
                )}

                <button
                  type="submit"
                  disabled={submittingReview}
                  className="w-full bg-primary text-primary-foreground h-11 text-[10px] font-bold uppercase tracking-widest disabled:opacity-40"
                >
                  {submittingReview ? "Submitting..." : "Submit Review"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
