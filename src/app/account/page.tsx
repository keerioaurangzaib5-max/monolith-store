"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import { useWishlist } from "@/context/WishlistContext";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  User as UserIcon, 
  ShoppingBag, 
  MapPin, 
  Heart, 
  Award, 
  LogOut, 
  Truck, 
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  X
} from "lucide-react";

function AccountPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, token, isAuthenticated, login, logout, updateUser } = useAuth();
  const { wishlist, toggleWishlist } = useWishlist();

  // Navigation tab
  const [activeTab, setActiveTab] = useState("profile"); // profile, orders, addresses, wishlist
  
  // Auth Form States (if not authenticated)
  const [authMode, setAuthMode] = useState<"login" | "register">(
    (searchParams.get("mode") as "login" | "register") || "login"
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  // Profile Edit fields
  const [profileName, setProfileName] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");
  const [profileError, setProfileError] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);

  // Orders list state
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Tracking details state
  const [trackingOrder, setTrackingOrder] = useState<any>(null);
  const [trackingData, setTrackingData] = useState<any>(null);
  const [trackingLoading, setTrackingLoading] = useState(false);

  // Saved Addresses state
  const [addresses, setAddresses] = useState<any[]>([]);
  const [newAddrName, setNewAddrName] = useState("");
  const [newAddrStreet, setNewAddrStreet] = useState("");
  const [newAddrCity, setNewAddrCity] = useState("Karachi");
  const [newAddrProvince, setNewAddrProvince] = useState("Sindh");
  const [newAddrPostal, setNewAddrPostal] = useState("");
  const [newAddrPhone, setNewAddrPhone] = useState("");
  const [addressSuccess, setAddressSuccess] = useState("");
  const [addressError, setAddressError] = useState("");
  const [addressLoading, setAddressLoading] = useState(false);

  // Sync profile edit fields when user loads
  useEffect(() => {
    if (user) {
      setProfileName(user.name);
      setProfileEmail(user.email);
    }
  }, [user]);

  // Load orders and addresses when tab switches
  useEffect(() => {
    if (isAuthenticated && token) {
      if (activeTab === "orders") {
        fetchOrders();
      } else if (activeTab === "addresses") {
        fetchAddresses();
      }
    }
  }, [activeTab, isAuthenticated, token]);

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

  const fetchAddresses = async () => {
    try {
      const res = await fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAddresses(data.user?.addresses || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Auth Submit
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthLoading(true);

    try {
      const endpoint = authMode === "login" ? "/api/auth/login" : "/api/auth/register";
      const payload = authMode === "login" 
        ? { email, password } 
        : { email, password, name };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      setAuthLoading(false);

      if (res.ok) {
        login(data.token, data.user);
      } else {
        setAuthError(data.error || "Authentication check failed.");
      }
    } catch (err) {
      setAuthLoading(false);
      setAuthError("Failed to communicate with authentication gateway.");
    }
  };

  // Update Profile
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSuccess("");
    setProfileError("");
    setProfileLoading(true);

    try {
      const res = await fetch("/api/auth/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name: profileName, email: profileEmail })
      });

      const data = await res.json();
      setProfileLoading(false);

      if (res.ok) {
        updateUser(data.user);
        setProfileSuccess("Profile updated successfully.");
      } else {
        setProfileError(data.error || "Failed to update profile.");
      }
    } catch (err) {
      setProfileLoading(false);
      setProfileError("Communication error.");
    }
  };

  // Add Address
  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddressSuccess("");
    setAddressError("");
    setAddressLoading(true);

    try {
      const res = await fetch("/api/addresses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: newAddrName,
          street: newAddrStreet,
          city: newAddrCity,
          province: newAddrProvince,
          postalCode: newAddrPostal,
          phone: newAddrPhone,
          isDefault: addresses.length === 0
        })
      });

      setAddressLoading(false);
      if (res.ok) {
        setAddressSuccess("Address saved successfully!");
        setNewAddrName("");
        setNewAddrStreet("");
        setNewAddrPostal("");
        setNewAddrPhone("");
        fetchAddresses();
      } else {
        const errData = await res.json();
        setAddressError(errData.error || "Failed to save address.");
      }
    } catch (err) {
      setAddressLoading(false);
      setAddressError("Server communication error.");
    }
  };

  // Track Order check
  const handleTrackOrderClick = async (order: any) => {
    setTrackingOrder(order);
    setTrackingLoading(true);
    setTrackingData(null);

    try {
      const res = await fetch(`/api/shipping?orderId=${order.id}`);
      if (res.ok) {
        const data = await res.json();
        setTrackingData(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setTrackingLoading(false);
    }
  };

  const provinces = ["Sindh", "Punjab", "Khyber Pakhtunkhwa", "Balochistan", "Islamabad Capital Territory", "Gilgit-Baltistan", "Azad Kashmir"];
  const cities = ["Karachi", "Lahore", "Islamabad", "Rawalpindi", "Faisalabad", "Peshawar", "Multan", "Quetta", "Sialkot", "Gujranwala"];

  // Unauthenticated view: Login/Register forms
  if (!isAuthenticated) {
    return (
      <>
        <Navbar />
        <main className="max-w-md mx-auto py-20 px-4 select-none">
          <div className="p-8 glass border border-border/40 space-y-6">
            <div className="text-center space-y-2 border-b border-border/40 pb-4">
              <span className="text-[10px] tracking-widest font-black uppercase text-muted-foreground">MONOLITH LOCK GATE</span>
              <h2 className="font-display text-xl font-black uppercase tracking-wider">
                {authMode === "login" ? "Sign In" : "Register"}
              </h2>
            </div>

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              {authMode === "register" && (
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground block">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Fatima Khan"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full border border-border bg-card text-xs h-10 px-3 focus:outline-none focus:border-foreground"
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground block">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="fatima@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-border bg-card text-xs h-10 px-3 focus:outline-none focus:border-foreground"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground block">Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-border bg-card text-xs h-10 px-3 focus:outline-none focus:border-foreground"
                />
              </div>

              {authError && (
                <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest">{authError}</p>
              )}

              <button
                type="submit"
                disabled={authLoading}
                className="w-full bg-primary text-primary-foreground h-11 text-[10px] font-bold uppercase tracking-widest disabled:opacity-40"
              >
                {authLoading ? "Verifying..." : authMode === "login" ? "Sign In" : "Create Account"}
              </button>
            </form>

            <div className="text-center pt-2 text-[10px] uppercase tracking-widest font-semibold text-muted-foreground">
              {authMode === "login" ? (
                <button onClick={() => setAuthMode("register")} className="underline hover:text-foreground">
                  Create a new account
                </button>
              ) : (
                <button onClick={() => setAuthMode("login")} className="underline hover:text-foreground">
                  Sign in to existing account
                </button>
              )}
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-grow select-none">
        {/* Profile Welcome Title */}
        <div className="border-b border-border/40 pb-6 mb-8 flex flex-col md:flex-row justify-between items-baseline gap-4">
          <div className="space-y-1">
            <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">PERSONAL ARCHIVE</span>
            <h1 className="font-display text-3xl font-black uppercase tracking-wider text-foreground">
              Welcome, {user?.name}
            </h1>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-red-500 transition-colors uppercase tracking-widest"
          >
            <LogOut className="w-4 h-4" /> Log Out
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Tabs */}
          <div className="space-y-1.5 lg:col-span-1 text-xs">
            <button
              onClick={() => setActiveTab("profile")}
              className={`w-full text-left h-10 px-4 uppercase tracking-widest font-bold flex items-center gap-2 ${
                activeTab === "profile" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              }`}
            >
              <UserIcon className="w-4 h-4" /> Profile Details
            </button>
            <button
              onClick={() => setActiveTab("orders")}
              className={`w-full text-left h-10 px-4 uppercase tracking-widest font-bold flex items-center gap-2 ${
                activeTab === "orders" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              }`}
            >
              <ShoppingBag className="w-4 h-4" /> Order History
            </button>
            <button
              onClick={() => setActiveTab("addresses")}
              className={`w-full text-left h-10 px-4 uppercase tracking-widest font-bold flex items-center gap-2 ${
                activeTab === "addresses" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              }`}
            >
              <MapPin className="w-4 h-4" /> Address Book
            </button>
            {user?.role === "ADMIN" && (
              <button
                onClick={() => router.push("/admin")}
                className="w-full text-left h-10 px-4 uppercase tracking-widest font-black text-emerald-600 hover:bg-emerald-500/10 flex items-center gap-2 border border-emerald-500/20 mt-4"
              >
                <ShieldCheck className="w-4 h-4" /> Admin Console
              </button>
            )}
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* TAB: PROFILE */}
            {activeTab === "profile" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left block: profile settings */}
                <div className="md:col-span-2 p-6 glass border border-border/40 space-y-6">
                  <h3 className="font-display font-black text-xs uppercase tracking-widest border-b border-border/40 pb-3">
                    Profile Information
                  </h3>

                  <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Full Name</label>
                      <input
                        type="text"
                        required
                        value={profileName}
                        onChange={(e) => setProfileName(e.target.value)}
                        className="w-full border border-border bg-card text-xs h-10 px-3 focus:outline-none focus:border-foreground"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Email Address</label>
                      <input
                        type="email"
                        required
                        value={profileEmail}
                        onChange={(e) => setProfileEmail(e.target.value)}
                        className="w-full border border-border bg-card text-xs h-10 px-3 focus:outline-none focus:border-foreground"
                      />
                    </div>

                    {profileSuccess && (
                      <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest">{profileSuccess}</p>
                    )}
                    {profileError && (
                      <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest">{profileError}</p>
                    )}

                    <button
                      type="submit"
                      disabled={profileLoading}
                      className="bg-primary text-primary-foreground h-11 text-[10px] font-bold uppercase tracking-widest px-8 disabled:opacity-40"
                    >
                      {profileLoading ? "Saving..." : "Save Changes"}
                    </button>
                  </form>
                </div>

                {/* Right block: loyalty points card */}
                <div className="md:col-span-1 p-6 bg-stone-900 text-stone-100 space-y-6">
                  <h3 className="font-display font-black text-xs uppercase tracking-widest border-b border-stone-850 pb-3 text-stone-100">
                    Monolith Club
                  </h3>

                  <div className="space-y-4 text-center py-4">
                    <Award className="w-12 h-12 text-stone-400 mx-auto animate-pulse" />
                    <div>
                      <span className="text-3xl font-black font-display tracking-tight text-stone-50">
                        {user?.points}
                      </span>
                      <p className="text-[9px] uppercase tracking-widest text-stone-400 mt-1 font-bold">
                        Club Loyalty Points
                      </p>
                    </div>
                  </div>

                  <p className="text-[10px] text-stone-400 leading-relaxed font-light text-center border-t border-stone-850 pt-4">
                    Earn 1 loyalty point for every Rs. 100 spent. Redeem points on checkout for custom discounts.
                  </p>
                </div>
              </div>
            )}

            {/* TAB: ORDERS */}
            {activeTab === "orders" && (
              <div className="space-y-4">
                <h3 className="font-display font-black text-xs uppercase tracking-widest border-b border-border/40 pb-3 mb-2">
                  Order Logs
                </h3>

                {ordersLoading ? (
                  <div className="text-center py-12 text-xs uppercase tracking-widest text-muted-foreground">
                    Fetching orders...
                  </div>
                ) : orders.length > 0 ? (
                  <div className="border border-border/40 divide-y divide-border/20 bg-card">
                    {orders.map((order) => (
                      <div key={order.id} className="p-5 flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center text-xs">
                        <div className="space-y-2">
                          <div className="flex gap-3 items-center">
                            <span className="font-bold text-foreground text-sm uppercase tracking-wide">
                              {order.orderNumber}
                            </span>
                            <span className="text-[9px] uppercase font-bold tracking-widest px-2 py-0.5 bg-stone-100 dark:bg-stone-900 border border-border">
                              {order.status}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-x-4 text-[10px] text-stone-400 font-semibold uppercase tracking-wider">
                            <span>Placed: {new Date(order.createdAt).toLocaleDateString()}</span>
                            <span>Total: Rs. {order.total.toLocaleString()}</span>
                            <span>Method: {order.paymentMethod}</span>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => handleTrackOrderClick(order)}
                            className="bg-primary text-primary-foreground h-9 px-4 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 transition-transform active:scale-95"
                          >
                            <Truck className="w-3.5 h-3.5" /> Track Ship
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 border border-dashed border-border text-muted-foreground text-xs uppercase tracking-widest">
                    No orders placed yet.
                  </div>
                )}
              </div>
            )}

            {/* TAB: ADDRESSES */}
            {activeTab === "addresses" && (
              <div className="space-y-6">
                <h3 className="font-display font-black text-xs uppercase tracking-widest border-b border-border/40 pb-3">
                  Shipping Destinations
                </h3>

                {/* Addresses listing */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {addresses.map((addr) => (
                    <div key={addr.id} className="p-5 border border-border bg-card space-y-2 text-xs relative">
                      <div className="flex justify-between items-baseline mb-2">
                        <span className="font-bold text-foreground">{addr.name}</span>
                        {addr.isDefault && (
                          <span className="text-[8px] bg-stone-100 dark:bg-stone-900 border border-border font-bold uppercase tracking-widest px-2 py-0.5">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">{addr.street}</p>
                      <p className="text-[11px] text-muted-foreground font-semibold">
                        {addr.city}, {addr.province} ({addr.postalCode})
                      </p>
                      <p className="text-[10px] text-stone-400 font-bold tracking-wider pt-2">
                        📞 {addr.phone}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Add new address */}
                <div className="p-6 glass border border-border/40 space-y-4">
                  <h4 className="font-display font-bold text-xs uppercase tracking-wider">
                    Add New Address
                  </h4>

                  <form onSubmit={handleAddAddress} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Recipient Name</label>
                        <input
                          type="text"
                          required
                          placeholder="Fatima Khan"
                          value={newAddrName}
                          onChange={(e) => setNewAddrName(e.target.value)}
                          className="w-full border border-border bg-card text-xs h-10 px-3 focus:outline-none focus:border-foreground"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Phone Number</label>
                        <input
                          type="tel"
                          required
                          placeholder="03001234567"
                          value={newAddrPhone}
                          onChange={(e) => setNewAddrPhone(e.target.value)}
                          className="w-full border border-border bg-card text-xs h-10 px-3 focus:outline-none focus:border-foreground"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Street Address</label>
                      <input
                        type="text"
                        required
                        placeholder="House Number, Street, Sector, DHA"
                        value={newAddrStreet}
                        onChange={(e) => setNewAddrStreet(e.target.value)}
                        className="w-full border border-border bg-card text-xs h-10 px-3 focus:outline-none focus:border-foreground"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">City</label>
                        <select
                          value={newAddrCity}
                          onChange={(e) => setNewAddrCity(e.target.value)}
                          className="w-full border border-border bg-card text-xs h-10 px-2 focus:outline-none focus:border-foreground text-foreground"
                        >
                          {cities.map(c => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Province</label>
                        <select
                          value={newAddrProvince}
                          onChange={(e) => setNewAddrProvince(e.target.value)}
                          className="w-full border border-border bg-card text-xs h-10 px-2 focus:outline-none focus:border-foreground text-foreground"
                        >
                          {provinces.map(p => (
                            <option key={p} value={p}>{p}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Postal Code</label>
                        <input
                          type="text"
                          required
                          placeholder="75500"
                          value={newAddrPostal}
                          onChange={(e) => setNewAddrPostal(e.target.value)}
                          className="w-full border border-border bg-card text-xs h-10 px-3 focus:outline-none focus:border-foreground"
                        />
                      </div>
                    </div>

                    {addressSuccess && (
                      <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest">{addressSuccess}</p>
                    )}
                    {addressError && (
                      <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest">{addressError}</p>
                    )}

                    <button
                      type="submit"
                      disabled={addressLoading}
                      className="bg-primary text-primary-foreground h-11 text-[10px] font-bold uppercase tracking-widest px-8 disabled:opacity-40"
                    >
                      {addressLoading ? "Saving..." : "Save Address"}
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Courier Tracking Modal Dialog */}
      {trackingOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border/40 w-full max-w-lg p-6 space-y-6 relative overflow-hidden">
            <button
              onClick={() => setTrackingOrder(null)}
              className="absolute top-6 right-6 p-1 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-border/40 pb-3">
              <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">COURIER TRACKING CHECKPOINT</span>
              <h3 className="font-display text-lg font-black uppercase tracking-wider mt-1">
                Order {trackingOrder.orderNumber}
              </h3>
            </div>

            {trackingLoading ? (
              <div className="text-center py-12 text-xs uppercase tracking-widest text-muted-foreground">
                Connecting to courier router...
              </div>
            ) : trackingData ? (
              <div className="space-y-6 max-h-96 overflow-y-auto pr-2">
                {/* Meta details */}
                <div className="grid grid-cols-2 gap-2 text-[10px] uppercase tracking-wider font-semibold bg-stone-100 dark:bg-stone-900 p-3 border border-border/20">
                  <span>Logistics Courier:</span><span className="text-foreground text-right">{trackingData.courier}</span>
                  <span>Tracking Code:</span><span className="text-foreground text-right font-mono">{trackingData.trackingNumber}</span>
                </div>

                {/* Timeline milestones */}
                <div className="space-y-6 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-border/60">
                  {trackingData.rawMilestones.map((m: any, idx: number) => (
                    <div key={idx} className="flex gap-4 relative">
                      {/* Checkpoint circle marker */}
                      <div className={`w-6.5 h-6.5 rounded-full shrink-0 z-10 flex items-center justify-center border text-[9px] font-bold ${
                        m.completed 
                          ? "bg-primary text-primary-foreground border-primary" 
                          : "bg-card text-muted-foreground border-border"
                      }`}>
                        {idx + 1}
                      </div>

                      <div className="space-y-1 pt-0.5 text-xs">
                        <div className="flex items-baseline gap-2">
                          <span className={`font-bold uppercase tracking-wide ${m.completed ? "text-foreground" : "text-muted-foreground"}`}>
                            {m.status}
                          </span>
                          {m.completed && (
                            <span className="text-[9px] text-stone-400 font-semibold">{m.timestamp}</span>
                          )}
                        </div>
                        <p className="text-[10px] text-stone-400 uppercase tracking-widest font-semibold">{m.location}</p>
                        <p className="text-[11px] text-muted-foreground font-light leading-relaxed">{m.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-xs text-red-500 font-bold uppercase tracking-widest text-center py-6">
                Failed to load courier tracking data.
              </p>
            )}
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}

import { Suspense } from "react";

export default function AccountPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-stone-100 dark:bg-stone-950 text-foreground uppercase tracking-widest text-xs font-bold">
        Loading Account Profile...
      </div>
    }>
      <AccountPageContent />
    </Suspense>
  );
}
