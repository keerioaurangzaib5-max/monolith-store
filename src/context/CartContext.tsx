"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  discount: number;
  sku: string;
  category: string;
  inventory: number;
  rating: number;
  images: string;
  specifications: string;
}

export interface CartItem {
  id: string; // unique cart entry ID: product-size-color
  productId: string;
  product: Product;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
}

interface Coupon {
  code: string;
  discountType: string;
  discountValue: number;
  minOrderValue: number;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product, quantity?: number, size?: string, color?: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  coupon: Coupon | null;
  applyCoupon: (code: string) => Promise<{ success: boolean; message: string }>;
  removeCoupon: () => void;
  subtotal: number;
  discountAmount: number;
  tax: number;
  shippingFee: number;
  total: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const storedCart = localStorage.getItem("mn_cart");
    const storedCoupon = localStorage.getItem("mn_coupon");
    if (storedCart) {
      try {
        setCartItems(JSON.parse(storedCart));
      } catch (e) {}
    }
    if (storedCoupon) {
      try {
        setCoupon(JSON.parse(storedCoupon));
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("mn_cart", JSON.stringify(cartItems));
    }
  }, [cartItems, isMounted]);

  useEffect(() => {
    if (isMounted) {
      if (coupon) {
        localStorage.setItem("mn_coupon", JSON.stringify(coupon));
      } else {
        localStorage.removeItem("mn_coupon");
      }
    }
  }, [coupon, isMounted]);

  const addToCart = (product: Product, quantity = 1, size?: string, color?: string) => {
    setCartItems((prev) => {
      const itemId = `${product.id}-${size || "default"}-${color || "default"}`;
      const existingIdx = prev.findIndex((item) => item.id === itemId);

      if (existingIdx > -1) {
        const updated = [...prev];
        updated[existingIdx].quantity += quantity;
        return updated;
      } else {
        return [
          ...prev,
          {
            id: itemId,
            productId: product.id,
            product,
            quantity,
            selectedSize: size,
            selectedColor: color,
          },
        ];
      }
    });
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, quantity } : item))
    );
  };

  const removeFromCart = (itemId: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  const clearCart = () => {
    setCartItems([]);
    setCoupon(null);
  };

  const applyCoupon = async (code: string) => {
    try {
      // Fetch coupon status from database (simulate API or fetch locally)
      const res = await fetch(`/api/coupons?code=${code.toUpperCase()}`);
      if (!res.ok) {
        const errData = await res.json();
        return { success: false, message: errData.error || "Invalid coupon code." };
      }

      const data = await res.json();
      if (!data.coupon || !data.coupon.active) {
        return { success: false, message: "This coupon is inactive or expired." };
      }

      const c: Coupon = data.coupon;
      if (subtotal < c.minOrderValue) {
        return {
          success: false,
          message: `Minimum order value of Rs. ${c.minOrderValue.toLocaleString()} required to use this coupon.`,
        };
      }

      setCoupon(c);
      return { success: true, message: "Coupon applied successfully!" };
    } catch (err) {
      // Fallback local coupon check for development sandbox robustness
      const cleanCode = code.toUpperCase().trim();
      const localCoupons: Record<string, Coupon> = {
        WELCOME10: { code: "WELCOME10", discountType: "PERCENTAGE", discountValue: 10, minOrderValue: 2000 },
        MONOLITH15: { code: "MONOLITH15", discountType: "PERCENTAGE", discountValue: 15, minOrderValue: 5000 },
        PKR500: { code: "PKR500", discountType: "FIXED", discountValue: 500, minOrderValue: 3000 },
      };

      const found = localCoupons[cleanCode];
      if (found) {
        if (subtotal < found.minOrderValue) {
          return {
            success: false,
            message: `Minimum order value of Rs. ${found.minOrderValue.toLocaleString()} required to use this coupon.`,
          };
        }
        setCoupon(found);
        return { success: true, message: "Coupon applied successfully (Sandbox Mode)!" };
      }

      return { success: false, message: "Failed to verify coupon code. Please try again." };
    }
  };

  const removeCoupon = () => {
    setCoupon(null);
  };

  // Calculations
  const subtotal = cartItems.reduce((acc, item) => {
    const activePrice = item.product.price - item.product.discount;
    return acc + activePrice * item.quantity;
  }, 0);

  let discountAmount = 0;
  if (coupon) {
    if (coupon.discountType === "PERCENTAGE") {
      discountAmount = subtotal * (coupon.discountValue / 100);
    } else {
      discountAmount = coupon.discountValue;
    }
    // Cannot exceed subtotal
    discountAmount = Math.min(discountAmount, subtotal);
  }

  const afterDiscount = subtotal - discountAmount;

  // Pakistan GST is 18%
  const gstRate = 0.18;
  const tax = Math.round(afterDiscount * gstRate);

  // Flat PKR 300 shipping, free above PKR 10,000
  const shippingFee = afterDiscount >= 10000 || afterDiscount === 0 ? 0 : 300;

  const total = afterDiscount + tax + shippingFee;

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        coupon,
        applyCoupon,
        removeCoupon,
        subtotal,
        discountAmount,
        tax,
        shippingFee,
        total,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
