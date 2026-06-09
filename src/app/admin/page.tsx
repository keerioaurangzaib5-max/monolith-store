"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { 
  BarChart3, 
  Package, 
  ShoppingBag, 
  MessageSquare, 
  Percent, 
  Plus, 
  Trash2, 
  Check, 
  X, 
  SlidersHorizontal,
  ChevronRight,
  TrendingUp,
  AlertTriangle
} from "lucide-react";
import { Product } from "@/context/CartContext";

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, token, isAuthenticated, isAdmin, loading: authLoading } = useAuth();

  // Active view tab
  const [activeTab, setActiveTab] = useState("overview"); // overview, products, orders, reviews, coupons

  // Overview states
  const [analytics, setAnalytics] = useState<any>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  // Products states
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Product form fields
  const [prodName, setProdName] = useState("");
  const [prodDesc, setProdDesc] = useState("");
  const [prodPrice, setProdPrice] = useState("");
  const [prodDiscount, setProdDiscount] = useState("0");
  const [prodSku, setProdSku] = useState("");
  const [prodCategory, setProdCategory] = useState("Desk Shelves");
  const [prodInventory, setProdInventory] = useState("");
  const [prodImages, setProdImages] = useState("");
  const [prodSpecs, setProdSpecs] = useState("");
  const [prodError, setProdError] = useState("");
  const [prodSuccess, setProdSuccess] = useState("");

  // Orders states
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const [newPayStatus, setNewPayStatus] = useState("");
  const [trackingNo, setTrackingNo] = useState("");

  // Reviews states
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  // Coupons states
  const [coupons, setCoupons] = useState<any[]>([]);
  const [couponsLoading, setCouponsLoading] = useState(false);
  const [showCouponForm, setShowCouponForm] = useState(false);
  
  // Coupon form fields
  const [cpCode, setCpCode] = useState("");
  const [cpType, setCpType] = useState("PERCENTAGE");
  const [cpVal, setCpVal] = useState("");
  const [cpMinOrder, setCpMinOrder] = useState("0");
  const [cpError, setCpError] = useState("");
  const [cpSuccess, setCpSuccess] = useState("");

  // Route security checks
  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push("/account?mode=login");
      } else if (!isAdmin) {
        // Redirect non-admins out
        router.push("/account");
      }
    }
  }, [isAuthenticated, isAdmin, authLoading, router]);

  // Load active tab data
  useEffect(() => {
    if (isAuthenticated && isAdmin && token) {
      if (activeTab === "overview") fetchAnalytics();
      if (activeTab === "products") fetchProducts();
      if (activeTab === "orders") fetchOrders();
      if (activeTab === "reviews") fetchReviews();
      if (activeTab === "coupons") fetchCoupons();
    }
  }, [activeTab, isAuthenticated, isAdmin, token]);

  const fetchAnalytics = async () => {
    setAnalyticsLoading(true);
    try {
      const res = await fetch("/api/admin/analytics", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const fetchProducts = async () => {
    setProductsLoading(true);
    try {
      const res = await fetch("/api/products?limit=100");
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setProductsLoading(false);
    }
  };

  const fetchOrders = async () => {
    setOrdersLoading(true);
    try {
      const res = await fetch("/api/orders", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setOrdersLoading(false);
    }
  };

  const fetchReviews = async () => {
    setReviewsLoading(true);
    try {
      const res = await fetch("/api/reviews", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setReviews(data.reviews || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setReviewsLoading(false);
    }
  };

  const fetchCoupons = async () => {
    setCouponsLoading(true);
    try {
      const res = await fetch("/api/admin/coupons", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCoupons(data.coupons || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setCouponsLoading(false);
    }
  };

  // Product submission
  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProdError("");
    setProdSuccess("");

    if (!prodName || !prodDesc || !prodPrice || !prodSku || !prodInventory) {
      setProdError("Please fill out all product details.");
      return;
    }

    const payload = {
      name: prodName,
      description: prodDesc,
      price: parseFloat(prodPrice),
      discount: parseFloat(prodDiscount || "0"),
      sku: prodSku,
      category: prodCategory,
      inventory: parseInt(prodInventory),
      images: prodImages,
      specifications: prodSpecs ? JSON.parse(prodSpecs) : {
        materials: ["Solid Walnut Wood", "Anodized Aluminum"],
        origin: "Handcrafted in Pakistan"
      }
    };

    try {
      const method = editingProduct ? "PUT" : "POST";
      const url = editingProduct ? `/api/products/${editingProduct.id}` : "/api/products";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setProdSuccess(editingProduct ? "Product updated successfully!" : "Product created successfully!");
        setProdName("");
        setProdDesc("");
        setProdPrice("");
        setProdDiscount("0");
        setProdSku("");
        setProdInventory("");
        setProdImages("");
        setProdSpecs("");
        setEditingProduct(null);
        setShowProductForm(false);
        fetchProducts();
      } else {
        const errData = await res.json();
        setProdError(errData.error || "Failed to process product details.");
      }
    } catch (err) {
      setProdError("Failed to communicate with catalog server.");
    }
  };

  const handleEditProductClick = (p: Product) => {
    setEditingProduct(p);
    setProdName(p.name);
    setProdDesc(p.description);
    setProdPrice(p.price.toString());
    setProdDiscount(p.discount.toString());
    setProdSku(p.sku);
    setProdCategory(p.category);
    setProdInventory(p.inventory.toString());
    setProdImages(p.images);
    setProdSpecs(JSON.stringify(p.specifications || {}));
    setShowProductForm(true);
  };

  const handleDeleteProduct = async (prodId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      const res = await fetch(`/api/products/${prodId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        fetchProducts();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Order status update
  const handleUpdateOrder = async (orderId: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          status: newStatus || undefined,
          paymentStatus: newPayStatus || undefined,
          trackingNumber: trackingNo || undefined
        })
      });

      if (res.ok) {
        setUpdatingOrderId("");
        setNewStatus("");
        setNewPayStatus("");
        setTrackingNo("");
        fetchOrders();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Review moderation
  const handleModerateReview = async (revId: string, approve: boolean) => {
    try {
      const res = await fetch(`/api/reviews/${revId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ isApproved: approve })
      });
      if (res.ok) {
        fetchReviews();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteReview = async (revId: string) => {
    if (!confirm("Are you sure you want to delete this review?")) return;
    try {
      const res = await fetch(`/api/reviews/${revId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        fetchReviews();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Coupon submission
  const handleCouponSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCpError("");
    setCpSuccess("");

    if (!cpCode || !cpVal) {
      setCpError("Please fill out all coupon details.");
      return;
    }

    try {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          code: cpCode,
          discountType: cpType,
          discountValue: parseFloat(cpVal),
          minOrderValue: parseFloat(cpMinOrder || "0")
        })
      });

      if (res.ok) {
        setCpSuccess("Coupon created successfully!");
        setCpCode("");
        setCpVal("");
        setCpMinOrder("0");
        setShowCouponForm(false);
        fetchCoupons();
      } else {
        const errData = await res.json();
        setCpError(errData.error || "Failed to create coupon.");
      }
    } catch (err) {
      setCpError("Server communication error.");
    }
  };

  if (authLoading || !isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-900 text-stone-100 uppercase tracking-widest text-xs font-bold">
        Verifying administrator authorization gates...
      </div>
    );
  }

  return (
    <>
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-grow select-none">
        {/* Title Bar */}
        <div className="border-b border-border/40 pb-6 mb-8 flex flex-col sm:flex-row justify-between items-baseline gap-4">
          <div className="space-y-1">
            <span className="text-[9px] font-black uppercase tracking-widest text-stone-400">ADMIN CONTROL CENTER</span>
            <h1 className="font-display text-3xl font-black uppercase tracking-wider text-foreground">
              Dashboard Console
            </h1>
          </div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-600 px-3 py-1 bg-emerald-50/10 border border-emerald-500/20">
            System Online • Secure
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Admin Sidebar Navigation */}
          <div className="space-y-1.5 lg:col-span-2 text-xs">
            <button
              onClick={() => setActiveTab("overview")}
              className={`w-full text-left h-10 px-4 uppercase tracking-widest font-bold flex items-center gap-2 ${
                activeTab === "overview" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              }`}
            >
              <BarChart3 className="w-4 h-4" /> Overview
            </button>
            <button
              onClick={() => setActiveTab("products")}
              className={`w-full text-left h-10 px-4 uppercase tracking-widest font-bold flex items-center gap-2 ${
                activeTab === "products" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              }`}
            >
              <Package className="w-4 h-4" /> Products
            </button>
            <button
              onClick={() => setActiveTab("orders")}
              className={`w-full text-left h-10 px-4 uppercase tracking-widest font-bold flex items-center gap-2 ${
                activeTab === "orders" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              }`}
            >
              <ShoppingBag className="w-4 h-4" /> Customer Orders
            </button>
            <button
              onClick={() => setActiveTab("reviews")}
              className={`w-full text-left h-10 px-4 uppercase tracking-widest font-bold flex items-center gap-2 ${
                activeTab === "reviews" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              }`}
            >
              <MessageSquare className="w-4 h-4" /> Reviews
            </button>
            <button
              onClick={() => setActiveTab("coupons")}
              className={`w-full text-left h-10 px-4 uppercase tracking-widest font-bold flex items-center gap-2 ${
                activeTab === "coupons" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              }`}
            >
              <Percent className="w-4 h-4" /> Coupons
            </button>
          </div>

          {/* Admin Main content viewport */}
          <div className="lg:col-span-10 space-y-6">
            
            {/* VIEW: OVERVIEW / ANALYTICS */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                {analyticsLoading ? (
                  <div className="text-center py-12 text-xs uppercase tracking-widest text-stone-400">
                    Loading financial statistics...
                  </div>
                ) : analytics ? (
                  <>
                    {/* Metrics Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="p-5 glass border border-border/40 space-y-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">TOTAL SALES</span>
                        <p className="text-2xl font-black font-display text-foreground">Rs. {analytics.metrics.totalSales.toLocaleString()}</p>
                        <span className="text-[9px] font-bold text-emerald-600 uppercase flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" /> Growth stable
                        </span>
                      </div>
                      <div className="p-5 glass border border-border/40 space-y-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">ACTIVE ORDERS</span>
                        <p className="text-2xl font-black font-display text-foreground">{analytics.metrics.activeOrdersCount}</p>
                        <span className="text-[9px] font-bold text-stone-400 uppercase">Pending packing</span>
                      </div>
                      <div className="p-5 glass border border-border/40 space-y-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">REGISTERED BUYERS</span>
                        <p className="text-2xl font-black font-display text-foreground">{analytics.metrics.totalUsers}</p>
                        <span className="text-[9px] font-bold text-stone-400 uppercase">Loyal club members</span>
                      </div>
                      <div className="p-5 glass border border-border/40 space-y-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">STOCK WARNINGS</span>
                        <p className="text-2xl font-black font-display text-foreground">{analytics.metrics.lowStockCount}</p>
                        {analytics.metrics.lowStockCount > 0 ? (
                          <span className="text-[9px] font-bold text-red-500 uppercase flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5 animate-bounce" /> Low inventory alert
                          </span>
                        ) : (
                          <span className="text-[9px] font-bold text-emerald-600 uppercase">Inventory optimal</span>
                        )}
                      </div>
                    </div>

                    {/* Simple charts placeholders */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                      <div className="p-6 glass border border-border/40 space-y-4">
                        <h3 className="font-display font-black text-xs uppercase tracking-widest border-b border-border/40 pb-3">Weekly Sales Revenue</h3>
                        <div className="flex justify-between items-end h-40 pt-4">
                          {analytics.charts.revenueByDay.map((d: any, idx: number) => (
                            <div key={idx} className="flex flex-col items-center gap-2 flex-1">
                              {/* Animated chart columns bar */}
                              <div 
                                style={{ height: `${Math.max(10, Math.min(100, (d.sales / analytics.metrics.totalSales) * 300))}%` }} 
                                className="w-6 bg-primary dark:bg-stone-500 rounded-none transition-all duration-500 hover:opacity-80"
                              ></div>
                              <span className="text-[9px] font-bold text-stone-400">{d.day}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="p-6 glass border border-border/40 space-y-4">
                        <h3 className="font-display font-black text-xs uppercase tracking-widest border-b border-border/40 pb-3">Category Distribution</h3>
                        <div className="space-y-3 font-semibold uppercase tracking-wider">
                          {analytics.charts.categoryBreakdown.map((cat: any, idx: number) => (
                            <div key={idx} className="space-y-1.5">
                              <div className="flex justify-between text-[10px]">
                                <span>{cat.name}</span>
                                <span>{cat.count} items</span>
                              </div>
                              <div className="w-full h-2 bg-stone-100 dark:bg-stone-900 border border-border/10">
                                <div 
                                  style={{ width: `${(cat.count / analytics.metrics.totalProducts) * 100}%` }} 
                                  className="h-full bg-primary"
                                ></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-xs text-red-500 font-bold uppercase tracking-widest">Failed to retrieve admin logs.</p>
                )}
              </div>
            )}

            {/* VIEW: PRODUCTS MANAGEMENT */}
            {activeTab === "products" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-border/40 pb-3">
                  <h3 className="font-display font-black text-xs uppercase tracking-widest">Product Catalog</h3>
                  <button
                    onClick={() => {
                      setEditingProduct(null);
                      setShowProductForm(!showProductForm);
                    }}
                    className="bg-primary text-primary-foreground h-9 px-4 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Product
                  </button>
                </div>

                {/* Add/Edit product form overlay */}
                {showProductForm && (
                  <form onSubmit={handleProductSubmit} className="p-6 glass border border-border/40 space-y-4 text-xs font-semibold uppercase tracking-wider">
                    <h4 className="font-display font-black text-xs tracking-widest border-b border-border/20 pb-2">
                      {editingProduct ? `Edit SKU ${editingProduct.sku}` : "Add New Product"}
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-stone-400">Product Name</label>
                        <input
                          type="text"
                          required
                          value={prodName}
                          onChange={(e) => setProdName(e.target.value)}
                          placeholder="Monolith Desk shelf"
                          className="w-full border border-border bg-card text-xs h-10 px-3 focus:outline-none focus:border-foreground"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-stone-400">SKU Code (Unique)</label>
                        <input
                          type="text"
                          required
                          value={prodSku}
                          onChange={(e) => setProdSku(e.target.value)}
                          placeholder="MN-DSK-01"
                          className="w-full border border-border bg-card text-xs h-10 px-3 focus:outline-none focus:border-foreground"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-stone-400">Product Description</label>
                      <textarea
                        required
                        rows={4}
                        value={prodDesc}
                        onChange={(e) => setProdDesc(e.target.value)}
                        placeholder="Detail materials, dimensions, features..."
                        className="w-full border border-border bg-card text-xs p-3 focus:outline-none focus:border-foreground"
                      />
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-stone-400">Price (PKR)</label>
                        <input
                          type="number"
                          required
                          value={prodPrice}
                          onChange={(e) => setProdPrice(e.target.value)}
                          placeholder="15000"
                          className="w-full border border-border bg-card text-xs h-10 px-3 focus:outline-none focus:border-foreground"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-stone-400">Discount Surcharge</label>
                        <input
                          type="number"
                          value={prodDiscount}
                          onChange={(e) => setProdDiscount(e.target.value)}
                          placeholder="0"
                          className="w-full border border-border bg-card text-xs h-10 px-3 focus:outline-none focus:border-foreground"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-stone-400">Inventory Stock</label>
                        <input
                          type="number"
                          required
                          value={prodInventory}
                          onChange={(e) => setProdInventory(e.target.value)}
                          placeholder="25"
                          className="w-full border border-border bg-card text-xs h-10 px-3 focus:outline-none focus:border-foreground"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-stone-400">Category</label>
                        <select
                          value={prodCategory}
                          onChange={(e) => setProdCategory(e.target.value)}
                          className="w-full border border-border bg-card text-xs h-10 px-2 focus:outline-none focus:border-foreground text-foreground"
                        >
                          <option value="Desk Shelves">Desk Shelves</option>
                          <option value="Tech Sleeves">Tech Sleeves</option>
                          <option value="Desk Mats">Desk Mats</option>
                          <option value="Organizers">Organizers</option>
                          <option value="Charging Stands">Charging Stands</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-stone-400">Image Paths (Comma separated)</label>
                      <input
                        type="text"
                        value={prodImages}
                        onChange={(e) => setProdImages(e.target.value)}
                        placeholder="/images/products/item-1.jpg,/images/products/item-2.jpg"
                        className="w-full border border-border bg-card text-xs h-10 px-3 focus:outline-none focus:border-foreground font-mono"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-stone-400">Custom Specs JSON</label>
                      <input
                        type="text"
                        value={prodSpecs}
                        onChange={(e) => setProdSpecs(e.target.value)}
                        placeholder='{"materials":["Solid Walnut"],"dimensions":"46\" L"}'
                        className="w-full border border-border bg-card text-xs h-10 px-3 focus:outline-none focus:border-foreground font-mono"
                      />
                    </div>

                    {prodError && (
                      <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest">{prodError}</p>
                    )}
                    {prodSuccess && (
                      <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest">{prodSuccess}</p>
                    )}

                    <div className="flex gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingProduct(null);
                          setShowProductForm(false);
                        }}
                        className="flex-1 border border-border bg-card h-10 text-[9px] font-bold"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex-1 bg-primary text-primary-foreground h-10 text-[9px] font-bold"
                      >
                        {editingProduct ? "Save Changes" : "Create Product"}
                      </button>
                    </div>
                  </form>
                )}

                {/* Products Table list */}
                {productsLoading ? (
                  <p className="text-center py-6 text-xs uppercase text-stone-400">Loading catalog...</p>
                ) : (
                  <div className="overflow-x-auto border border-border/40 bg-card text-xs">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-stone-100 dark:bg-stone-900 border-b border-border/40 font-bold uppercase text-[9px] text-muted-foreground tracking-widest">
                          <th className="p-3">SKU</th>
                          <th className="p-3">Name</th>
                          <th className="p-3">Category</th>
                          <th className="p-3">Price</th>
                          <th className="p-3">Stock</th>
                          <th className="p-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/20 font-semibold uppercase tracking-wider">
                        {products.map((p) => (
                          <tr key={p.id} className="hover:bg-muted/10">
                            <td className="p-3 font-mono font-bold text-[10px]">{p.sku}</td>
                            <td className="p-3 text-foreground font-display font-bold leading-tight">{p.name}</td>
                            <td className="p-3 text-muted-foreground">{p.category}</td>
                            <td className="p-3 font-black text-foreground">Rs. {p.price.toLocaleString()}</td>
                            <td className={`p-3 font-bold ${p.inventory <= 5 ? "text-red-500" : "text-foreground"}`}>
                              {p.inventory} units
                            </td>
                            <td className="p-3 text-right space-x-2 shrink-0">
                              <button
                                onClick={() => handleEditProductClick(p)}
                                className="text-[10px] hover:underline hover:text-foreground text-muted-foreground"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(p.id)}
                                className="text-[10px] text-red-500 hover:underline hover:text-red-600 font-bold"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* VIEW: ORDER TERMINAL */}
            {activeTab === "orders" && (
              <div className="space-y-6">
                <h3 className="font-display font-black text-xs uppercase tracking-widest border-b border-border/40 pb-3">
                  System Order Logs
                </h3>

                {ordersLoading ? (
                  <p className="text-center py-6 text-xs uppercase text-stone-400">Loading orders...</p>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => {
                      const isUpdating = updatingOrderId === order.id;
                      let paymentData: any = {};
                      try {
                        paymentData = order.paymentDetails ? JSON.parse(order.paymentDetails) : {};
                      } catch (e) {}

                      return (
                        <div key={order.id} className="p-5 glass border border-border/40 text-xs space-y-4">
                          <div className="flex flex-col sm:flex-row justify-between gap-2 border-b border-border/20 pb-3 items-start sm:items-baseline uppercase">
                            <div className="space-y-1">
                              <div className="flex gap-2 items-center">
                                <span className="font-bold text-sm tracking-wide text-foreground">{order.orderNumber}</span>
                                <span className="text-[9px] font-bold text-stone-400">By {order.user?.name}</span>
                              </div>
                              <p className="text-[10px] text-stone-400 font-semibold tracking-wider">
                                Placed: {new Date(order.createdAt).toLocaleString()}
                              </p>
                            </div>

                            <div className="space-y-1 text-right">
                              <span className="font-black text-foreground text-sm block">Rs. {order.total.toLocaleString()}</span>
                              <span className="text-[9px] text-stone-400 block font-bold">GST Tax: Rs. {order.tax.toLocaleString()}</span>
                            </div>
                          </div>

                          {/* Shipment details and Address */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-semibold uppercase tracking-wider text-[11px]">
                            {/* Address details */}
                            <div className="space-y-1.5 col-span-1">
                              <span className="text-[9px] font-black text-stone-400 block tracking-widest">SHIPPING ADDRESS</span>
                              <p className="text-foreground">{order.address?.name}</p>
                              <p className="text-muted-foreground font-light leading-relaxed">{order.address?.street}</p>
                              <p className="text-muted-foreground">{order.address?.city}, {order.address?.province}</p>
                              <p className="text-stone-400 font-mono text-[10px]">📞 {order.address?.phone}</p>
                            </div>

                            {/* Payment details */}
                            <div className="space-y-1.5 col-span-1">
                              <span className="text-[9px] font-black text-stone-400 block tracking-widest">PAYMENT LEDGER</span>
                              <div className="grid grid-cols-2 gap-1 text-[10px]">
                                <span className="text-stone-400">Method:</span><span className="text-foreground">{order.paymentMethod}</span>
                                <span className="text-stone-400">Pay Status:</span>
                                <span className={`font-bold ${order.paymentStatus === "PAID" ? "text-emerald-600" : "text-red-500"}`}>
                                  {order.paymentStatus}
                                </span>
                              </div>

                              {/* Render manual bank transfer details if pending verification */}
                              {order.paymentMethod === "BANK_TRANSFER" && paymentData.transactionRef && (
                                <div className="mt-2 bg-stone-100 dark:bg-stone-900/50 p-2.5 border border-border/20 text-[9px] uppercase tracking-wider font-semibold space-y-1 text-muted-foreground">
                                  <span className="text-foreground font-bold block">Submitted bank proof:</span>
                                  <div>Bank: <span className="text-foreground">{paymentData.bankName}</span></div>
                                  <div>Holder: <span className="text-foreground">{paymentData.accountHolder}</span></div>
                                  <div>Ref ID: <span className="text-foreground font-mono">{paymentData.transactionRef}</span></div>
                                </div>
                              )}
                            </div>

                            {/* Courier Milestones */}
                            <div className="space-y-1.5 col-span-1">
                              <span className="text-[9px] font-black text-stone-400 block tracking-widest">COURIER TRACKING</span>
                              <div className="grid grid-cols-2 gap-1 text-[10px]">
                                <span className="text-stone-400">Status:</span><span className="text-foreground">{order.status}</span>
                                <span className="text-stone-400">Courier:</span><span className="text-foreground">{order.shippingMethod}</span>
                                <span className="text-stone-400">Track Code:</span>
                                <span className="text-foreground font-mono">{order.trackingNumber || "None"}</span>
                              </div>
                            </div>
                          </div>

                          {/* Order items lists */}
                          <div className="border-t border-border/20 pt-4 text-[10px] uppercase tracking-wider font-semibold space-y-2">
                            <span className="text-[9px] font-black text-stone-400 block tracking-widest mb-1">Items ordered</span>
                            {order.items?.map((item: any, idx: number) => (
                              <div key={idx} className="flex justify-between items-center text-muted-foreground">
                                <span className="text-foreground font-bold">{item.product?.name} x{item.quantity}</span>
                                <span className="font-bold">Rs. {(item.price * item.quantity).toLocaleString()}</span>
                              </div>
                            ))}
                          </div>

                          {/* Quick Edit options */}
                          <div className="border-t border-border/20 pt-4 flex gap-2 justify-end">
                            {isUpdating ? (
                              <div className="flex flex-wrap gap-3 items-end text-xs w-full justify-between">
                                <div className="flex flex-wrap gap-2 text-[10px]">
                                  {/* Update order status */}
                                  <div className="space-y-1">
                                    <label className="text-[9px] text-stone-400 font-bold block uppercase tracking-widest">Status</label>
                                    <select
                                      value={newStatus}
                                      onChange={(e) => setNewStatus(e.target.value)}
                                      className="bg-card border border-border px-2 py-1 focus:outline-none text-foreground uppercase tracking-widest text-[9px] font-semibold"
                                    >
                                      <option value="">No change</option>
                                      <option value="PENDING">PENDING</option>
                                      <option value="PROCESSING">PROCESSING</option>
                                      <option value="SHIPPED">SHIPPED</option>
                                      <option value="DELIVERED">DELIVERED</option>
                                      <option value="CANCELLED">CANCELLED</option>
                                    </select>
                                  </div>

                                  {/* Update payment status */}
                                  <div className="space-y-1">
                                    <label className="text-[9px] text-stone-400 font-bold block uppercase tracking-widest">Payment</label>
                                    <select
                                      value={newPayStatus}
                                      onChange={(e) => setNewPayStatus(e.target.value)}
                                      className="bg-card border border-border px-2 py-1 focus:outline-none text-foreground uppercase tracking-widest text-[9px] font-semibold"
                                    >
                                      <option value="">No change</option>
                                      <option value="PENDING">PENDING</option>
                                      <option value="PENDING_VERIFICATION">PENDING VERIFICATION</option>
                                      <option value="PAID">PAID</option>
                                      <option value="FAILED">FAILED</option>
                                      <option value="REFUNDED">REFUNDED</option>
                                    </select>
                                  </div>

                                  {/* Add Tracking number */}
                                  <div className="space-y-1">
                                    <label className="text-[9px] text-stone-400 font-bold block uppercase tracking-widest">Tracking No</label>
                                    <input
                                      type="text"
                                      placeholder="TCS123456"
                                      value={trackingNo}
                                      onChange={(e) => setTrackingNo(e.target.value)}
                                      className="bg-card border border-border px-2 py-0.5 focus:outline-none text-foreground font-mono text-[10px] w-24 h-6 uppercase"
                                    />
                                  </div>
                                </div>

                                <div className="flex gap-2">
                                  <button
                                    onClick={() => setUpdatingOrderId("")}
                                    className="border border-border bg-card px-4 h-8 text-[9px] font-bold uppercase tracking-widest"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    onClick={() => handleUpdateOrder(order.id)}
                                    className="bg-primary text-primary-foreground px-4 h-8 text-[9px] font-bold uppercase tracking-widest"
                                  >
                                    Save Changes
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <button
                                onClick={() => {
                                  setUpdatingOrderId(order.id);
                                  setNewStatus(order.status);
                                  setNewPayStatus(order.paymentStatus);
                                  setTrackingNo(order.trackingNumber || "");
                                }}
                                className="bg-primary text-primary-foreground px-4 h-9 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 transition-transform active:scale-95"
                              >
                                Edit status log
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* VIEW: REVIEWS MODERATION */}
            {activeTab === "reviews" && (
              <div className="space-y-6">
                <h3 className="font-display font-black text-xs uppercase tracking-widest border-b border-border/40 pb-3">
                  Customer Review Moderation
                </h3>

                {reviewsLoading ? (
                  <p className="text-center py-6 text-xs uppercase text-stone-400">Loading reviews...</p>
                ) : (
                  <div className="overflow-x-auto border border-border/40 bg-card text-xs">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-stone-100 dark:bg-stone-900 border-b border-border/40 font-bold uppercase text-[9px] text-muted-foreground tracking-widest">
                          <th className="p-3">Product</th>
                          <th className="p-3">Author</th>
                          <th className="p-3">Rating</th>
                          <th className="p-3">Comment</th>
                          <th className="p-3">Status</th>
                          <th className="p-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/20 font-semibold uppercase tracking-wider text-[11px]">
                        {reviews.map((rev) => (
                          <tr key={rev.id} className="hover:bg-muted/10">
                            <td className="p-3 font-bold text-foreground max-w-[150px] line-clamp-1">{rev.product?.name}</td>
                            <td className="p-3">{rev.user?.name}</td>
                            <td className="p-3 font-bold text-amber-500">{rev.rating} ★</td>
                            <td className="p-3 text-muted-foreground font-light max-w-[200px] line-clamp-2">{rev.comment}</td>
                            <td className="p-3 font-bold">
                              {rev.isApproved ? (
                                <span className="text-emerald-600">Approved</span>
                              ) : (
                                <span className="text-red-500">Hidden</span>
                              )}
                            </td>
                            <td className="p-3 text-right space-x-2 shrink-0">
                              <button
                                onClick={() => handleModerateReview(rev.id, !rev.isApproved)}
                                className="text-[10px] text-foreground hover:underline font-bold"
                              >
                                {rev.isApproved ? "Hide" : "Approve"}
                              </button>
                              <button
                                onClick={() => handleDeleteReview(rev.id)}
                                className="text-[10px] text-red-500 hover:underline hover:text-red-650"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* VIEW: COUPONS MANAGEMENT */}
            {activeTab === "coupons" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-border/40 pb-3">
                  <h3 className="font-display font-black text-xs uppercase tracking-widest">Active Coupons</h3>
                  <button
                    onClick={() => setShowCouponForm(!showCouponForm)}
                    className="bg-primary text-primary-foreground h-9 px-4 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Coupon
                  </button>
                </div>

                {/* Create Coupon form */}
                {showCouponForm && (
                  <form onSubmit={handleCouponSubmit} className="p-6 glass border border-border/40 space-y-4 text-xs font-semibold uppercase tracking-wider">
                    <h4 className="font-display font-black text-xs tracking-widest border-b border-border/20 pb-2">
                      Create Coupon Code
                    </h4>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-stone-400">Coupon Code</label>
                        <input
                          type="text"
                          required
                          value={cpCode}
                          onChange={(e) => setCpCode(e.target.value)}
                          placeholder="MONOLITH15"
                          className="w-full border border-border bg-card text-xs h-10 px-3 focus:outline-none focus:border-foreground uppercase"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-stone-400">Discount Type</label>
                        <select
                          value={cpType}
                          onChange={(e) => setCpType(e.target.value)}
                          className="w-full border border-border bg-card text-xs h-10 px-2 focus:outline-none focus:border-foreground text-foreground"
                        >
                          <option value="PERCENTAGE">PERCENTAGE (%)</option>
                          <option value="FIXED">FIXED AMOUNT (PKR)</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-stone-400">Discount Value</label>
                        <input
                          type="number"
                          required
                          value={cpVal}
                          onChange={(e) => setCpVal(e.target.value)}
                          placeholder="15"
                          className="w-full border border-border bg-card text-xs h-10 px-3 focus:outline-none focus:border-foreground"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-stone-400">Min Order Value (PKR)</label>
                        <input
                          type="number"
                          value={cpMinOrder}
                          onChange={(e) => setCpMinOrder(e.target.value)}
                          placeholder="5000"
                          className="w-full border border-border bg-card text-xs h-10 px-3 focus:outline-none focus:border-foreground"
                        />
                      </div>
                    </div>

                    {cpError && (
                      <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest">{cpError}</p>
                    )}
                    {cpSuccess && (
                      <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest">{cpSuccess}</p>
                    )}

                    <div className="flex gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowCouponForm(false)}
                        className="flex-1 border border-border bg-card h-10 text-[9px] font-bold"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex-1 bg-primary text-primary-foreground h-10 text-[9px] font-bold"
                      >
                        Create Coupon
                      </button>
                    </div>
                  </form>
                )}

                {/* Coupons table */}
                {couponsLoading ? (
                  <p className="text-center py-6 text-xs uppercase text-stone-400">Loading coupons...</p>
                ) : (
                  <div className="overflow-x-auto border border-border/40 bg-card text-xs">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-stone-100 dark:bg-stone-900 border-b border-border/40 font-bold uppercase text-[9px] text-muted-foreground tracking-widest">
                          <th className="p-3">Code</th>
                          <th className="p-3">Discount Type</th>
                          <th className="p-3">Value</th>
                          <th className="p-3">Min Order</th>
                          <th className="p-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/20 font-semibold uppercase tracking-wider text-[11px]">
                        {coupons.map((c) => (
                          <tr key={c.id} className="hover:bg-muted/10">
                            <td className="p-3 font-mono font-bold text-foreground">{c.code}</td>
                            <td className="p-3 text-muted-foreground">{c.discountType}</td>
                            <td className="p-3 font-black text-foreground">
                              {c.discountType === "PERCENTAGE" ? `${c.discountValue}%` : `Rs. ${c.discountValue.toLocaleString()}`}
                            </td>
                            <td className="p-3">Rs. {c.minOrderValue.toLocaleString()}</td>
                            <td className="p-3 font-bold">
                              {c.active ? (
                                <span className="text-emerald-600">Active</span>
                              ) : (
                                <span className="text-red-500">Expired</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
