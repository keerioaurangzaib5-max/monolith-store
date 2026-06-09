"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useCart } from "@/context/CartContext";
import { Trash2, ShoppingBag, ArrowRight, Tag, X } from "lucide-react";

export default function CartPage() {
  const router = useRouter();
  const {
    cartItems,
    updateQuantity,
    removeFromCart,
    coupon,
    applyCoupon,
    removeCoupon,
    subtotal,
    discountAmount,
    tax,
    shippingFee,
    total,
  } = useCart();

  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState("");
  const [loadingCoupon, setLoadingCoupon] = useState(false);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError("");
    setCouponSuccess("");
    if (!couponInput.trim()) return;

    setLoadingCoupon(true);
    const result = await applyCoupon(couponInput);
    setLoadingCoupon(false);

    if (result.success) {
      setCouponSuccess(result.message);
      setCouponInput("");
    } else {
      setCouponError(result.message);
    }
  };

  const handleCheckoutRedirect = () => {
    router.push("/checkout");
  };

  return (
    <>
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-grow select-none">
        {/* Page Title */}
        <div className="border-b border-border/40 pb-6 mb-8">
          <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">LEdger review</span>
          <h1 className="font-display text-3xl font-black uppercase tracking-wider text-foreground">Shopping Cart</h1>
        </div>

        {cartItems.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Cart Items List */}
            <div className="lg:col-span-8 space-y-4">
              <div className="border border-border/40 divide-y divide-border/30 bg-card">
                {cartItems.map((item) => {
                  const images = Array.isArray(item.product.images)
                    ? item.product.images
                    : (typeof item.product.images === "string" ? item.product.images.split(",") : []);
                  const primaryImage = images[0] || "/images/placeholder.jpg";
                  const itemPrice = item.product.price - item.product.discount;

                  return (
                    <div key={item.id} className="p-4 sm:p-6 flex gap-4 sm:gap-6 items-center">
                      {/* Product Thumbnail */}
                      <Link href={`/shop/${item.product.id}`} className="w-16 sm:w-20 aspect-[4/5] overflow-hidden bg-stone-100 dark:bg-stone-900 border border-border/40 shrink-0">
                        <img
                          src={primaryImage.startsWith("/") && !primaryImage.includes("placeholder")
                               ? `https://images.unsplash.com/photo-${primaryImage.includes("shelf") ? "1544244015-0df4b3ffc6b0" : primaryImage.includes("sleeve") ? "1618220179428-22790b461013" : primaryImage.includes("deskmat") ? "1616440347437-b1c73416efc2" : "1586023492125-27b2c045efd7"}?auto=format&fit=crop&q=80&w=150`
                               : primaryImage
                          }
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      </Link>

                      {/* Product Details */}
                      <div className="flex-grow space-y-1.5 text-xs">
                        <div className="flex justify-between items-start">
                          <Link href={`/shop/${item.product.id}`} className="hover:underline">
                            <h3 className="font-display font-bold text-foreground text-sm uppercase tracking-wide leading-tight sm:line-clamp-1">
                              {item.product.name}
                            </h3>
                          </Link>
                          <span className="font-black text-foreground sm:hidden">
                            Rs. {(itemPrice * item.quantity).toLocaleString()}
                          </span>
                        </div>
                        
                        <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                          {item.selectedSize && <span>Size: {item.selectedSize}</span>}
                          {item.selectedColor && <span>Color: {item.selectedColor}</span>}
                          <span>SKU: {item.product.sku}</span>
                        </div>

                        {/* Quantity controls */}
                        <div className="flex items-center space-x-3 pt-2">
                          <div className="flex items-center border border-border bg-background text-[11px]">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="px-2 h-7 hover:bg-muted text-foreground"
                            >
                              -
                            </button>
                            <span className="w-8 text-center font-bold text-foreground">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="px-2 h-7 hover:bg-muted text-foreground"
                            >
                              +
                            </button>
                          </div>
                          
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-50/10 transition-colors"
                            aria-label="Remove item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Line Item Total Price */}
                      <div className="hidden sm:block text-right shrink-0">
                        <span className="text-sm font-black text-foreground">
                          Rs. {(itemPrice * item.quantity).toLocaleString()}
                        </span>
                        <p className="text-[10px] text-muted-foreground mt-0.5 font-semibold">
                          Rs. {itemPrice.toLocaleString()} each
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Cart Summary & Coupon Panel */}
            <div className="lg:col-span-4 space-y-6">
              {/* Order Ledger summary card */}
              <div className="p-6 glass border border-border/40 space-y-6">
                <h3 className="font-display font-black text-xs uppercase tracking-widest border-b border-border/40 pb-3">
                  Order Summary
                </h3>

                <div className="space-y-4 text-xs font-semibold uppercase tracking-wider">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="text-foreground">Rs. {subtotal.toLocaleString()}</span>
                  </div>

                  {coupon && (
                    <div className="flex justify-between text-emerald-600 font-bold">
                      <span className="flex items-center gap-1">
                        <Tag className="w-3.5 h-3.5" /> Coupon ({coupon.code})
                      </span>
                      <span>- Rs. {discountAmount.toLocaleString()}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span className="text-muted-foreground">GST (18% Sales Tax)</span>
                    <span className="text-foreground">Rs. {tax.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between border-b border-border/40 pb-4">
                    <span className="text-muted-foreground">Shipping Fee</span>
                    <span className="text-foreground">
                      {shippingFee === 0 ? "FREE" : `Rs. ${shippingFee.toLocaleString()}`}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm font-black pt-2">
                    <span className="text-foreground">Grand Total</span>
                    <span className="text-foreground text-base">Rs. {total.toLocaleString()}</span>
                  </div>
                </div>

                <button
                  onClick={handleCheckoutRedirect}
                  className="w-full bg-primary text-primary-foreground h-12 text-xs font-bold uppercase tracking-widest transition-transform active:scale-98 flex items-center justify-center gap-2"
                >
                  Proceed to Checkout
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Coupon input form card */}
              <div className="p-6 glass border border-border/40 space-y-4">
                <h4 className="font-display font-bold text-[10px] uppercase tracking-widest text-muted-foreground">
                  Promotional Coupon
                </h4>

                {coupon ? (
                  <div className="flex items-center justify-between bg-stone-100 dark:bg-stone-900 px-3 py-2 text-xs border border-border/30">
                    <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-emerald-600">
                      <Tag className="w-3.5 h-3.5" /> {coupon.code} Applied
                    </span>
                    <button
                      onClick={removeCoupon}
                      className="p-1 hover:text-red-500 rounded-full"
                      aria-label="Remove coupon"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="WELCOME10"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      className="flex-grow bg-card border border-border text-xs px-3 h-10 uppercase tracking-widest focus:outline-none focus:border-foreground"
                    />
                    <button
                      type="submit"
                      disabled={loadingCoupon}
                      className="bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-widest px-4 h-10 hover:bg-neutral-800 disabled:opacity-40"
                    >
                      Apply
                    </button>
                  </form>
                )}

                {couponError && (
                  <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest">{couponError}</p>
                )}
                {couponSuccess && (
                  <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest">{couponSuccess}</p>
                )}
                <p className="text-[9px] text-muted-foreground uppercase tracking-wider leading-relaxed">
                  Try "WELCOME10" (10% off above Rs.2,000) or "MONOLITH15" (15% off above Rs.5,000).
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-24 border border-dashed border-border flex flex-col items-center justify-center space-y-6">
            <ShoppingBag className="w-10 h-10 text-muted-foreground animate-pulse" />
            <div className="space-y-1">
              <h3 className="font-display font-bold uppercase text-sm">Your cart is empty</h3>
              <p className="text-[11px] text-muted-foreground">Select one of our premium products to start defining your workspace.</p>
            </div>
            <Link
              href="/shop"
              className="bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-widest px-8 h-12 flex items-center justify-center transition-transform active:scale-95"
            >
              Browse Catalogue
            </Link>
          </div>
        )}
      </main>

      <Footer />
    </>
  );
}
