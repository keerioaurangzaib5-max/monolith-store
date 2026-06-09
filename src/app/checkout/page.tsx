"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { 
  Truck, 
  CreditCard, 
  CheckCircle2, 
  ArrowLeft, 
  AlertCircle, 
  Building2, 
  Smartphone, 
  Lock 
} from "lucide-react";

export default function CheckoutPage() {
  const router = useRouter();
  const { cartItems, subtotal, discountAmount, tax, shippingFee, total, clearCart, coupon } = useCart();
  const { user, token, isAuthenticated, login: authLogin } = useAuth();

  // Step state
  const [step, setStep] = useState(1); // 1: Auth/Address, 2: Payment, 3: Success

  // Auth Inline fields (for unauthenticated checkout)
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authName, setAuthName] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  // Address fields
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [showAddressForm, setShowAddressForm] = useState(false);
  
  // New address form fields
  const [name, setName] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("Karachi");
  const [province, setProvince] = useState("Sindh");
  const [postalCode, setPostalCode] = useState("");
  const [phone, setPhone] = useState("");
  const [addressError, setAddressError] = useState("");
  const [addressLoading, setAddressLoading] = useState(false);

  // Payment fields
  const [paymentMethod, setPaymentMethod] = useState("COD"); // COD, BANK_TRANSFER, PAYFAST, JAZZCASH, EASYPAISA
  const [paymentError, setPaymentError] = useState("");
  const [paymentLoading, setPaymentLoading] = useState(false);
  
  // Bank transfer submission fields
  const [bankNameInput, setBankNameInput] = useState("");
  const [accountHolderInput, setAccountHolderInput] = useState("");
  const [transactionRefInput, setTransactionRefInput] = useState("");

  // Placed Order details
  const [placedOrder, setPlacedOrder] = useState<any>(null);

  // Constants
  const provinces = ["Sindh", "Punjab", "Khyber Pakhtunkhwa", "Balochistan", "Islamabad Capital Territory", "Gilgit-Baltistan", "Azad Kashmir"];
  const cities = [
    "Karachi", "Lahore", "Islamabad", "Rawalpindi", "Faisalabad", 
    "Peshawar", "Multan", "Quetta", "Sialkot", "Gujranwala", 
    "Hyderabad", "Sargodha", "Bahawalpur", "Sukkur", "Sahiwal"
  ];

  // Load addresses when authenticated
  useEffect(() => {
    if (isAuthenticated && token) {
      fetchAddresses();
    }
  }, [isAuthenticated, token]);

  const fetchAddresses = async () => {
    try {
      const res = await fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const userAddrs = data.user?.addresses || [];
        setAddresses(userAddrs);
        const defaultAddr = userAddrs.find((a: any) => a.isDefault);
        if (defaultAddr) {
          setSelectedAddressId(defaultAddr.id);
        } else if (userAddrs.length > 0) {
          setSelectedAddressId(userAddrs[0].id);
        }
      }
    } catch (e) {
      console.error("Failed to load user addresses:", e);
    }
  };

  // Inline Authentication Handler
  const handleInlineAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthLoading(true);

    try {
      const endpoint = authMode === "login" ? "/api/auth/login" : "/api/auth/register";
      const payload = authMode === "login" 
        ? { email: authEmail, password: authPassword }
        : { email: authEmail, password: authPassword, name: authName };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      setAuthLoading(false);

      if (res.ok) {
        authLogin(data.token, data.user);
      } else {
        setAuthError(data.error || "Authentication failed.");
      }
    } catch (err) {
      setAuthLoading(false);
      setAuthError("Failed to connect to authentication server.");
    }
  };

  // Add Address Handler
  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddressError("");

    // Validate phone number format matching 03XXXXXXXXX (11 digits) or +923XXXXXXXXX (13 digits)
    const phoneClean = phone.replace(/\s|-/g, "");
    const phoneRegex = /^(03\d{9}|\+923\d{9})$/;
    if (!phoneRegex.test(phoneClean)) {
      setAddressError("Please enter a valid Pakistan phone number format (e.g., 03001234567 or +923001234567).");
      return;
    }

    if (!name || !street || !postalCode) {
      setAddressError("Please fill out all shipping details.");
      return;
    }

    setAddressLoading(true);
    try {
      const res = await fetch("/api/addresses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name,
          street,
          city,
          province,
          postalCode,
          phone: phoneClean,
          isDefault: addresses.length === 0
        })
      });

      setAddressLoading(false);
      if (res.ok) {
        const data = await res.json();
        setName("");
        setStreet("");
        setPostalCode("");
        setPhone("");
        setShowAddressForm(false);
        fetchAddresses();
        setSelectedAddressId(data.address.id);
      } else {
        const errData = await res.json();
        setAddressError(errData.error || "Failed to add address.");
      }
    } catch (err) {
      setAddressLoading(false);
      setAddressError("Server communication error.");
    }
  };

  // Order Placement Handler
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentError("");

    if (!selectedAddressId) {
      setPaymentError("Please select a shipping address.");
      return;
    }

    // Cash on Delivery Checks
    const selectedAddress = addresses.find(a => a.id === selectedAddressId);
    if (paymentMethod === "COD") {
      if (total > 50000) {
        setPaymentError("Cash on Delivery is only available for orders below Rs. 50,000. Please pay via Bank Transfer or online methods.");
        return;
      }
      
      const allowedCities = cities.map(c => c.toLowerCase());
      if (selectedAddress && !allowedCities.includes(selectedAddress.city.toLowerCase().trim())) {
        setPaymentError(`Cash on Delivery is not available for ${selectedAddress.city}. Please select Bank Transfer or Card payment.`);
        return;
      }
    }

    // Manual Bank Transfer Checks
    if (paymentMethod === "BANK_TRANSFER") {
      if (!bankNameInput || !accountHolderInput || !transactionRefInput) {
        setPaymentError("Please submit your transaction reference ID and bank details to confirm transfer.");
        return;
      }
    }

    setPaymentLoading(true);
    try {
      // 1. Create order
      const orderRes = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          items: cartItems.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            selectedSize: item.selectedSize,
            selectedColor: item.selectedColor
          })),
          addressId: selectedAddressId,
          paymentMethod,
          couponCode: coupon?.code || null,
          notes: ""
        })
      });

      const orderData = await orderRes.json();

      if (!orderRes.ok) {
        setPaymentLoading(false);
        setPaymentError(orderData.error || "Failed to place order.");
        return;
      }

      const order = orderData.order;

      // 2. Submit/Verify payment details
      const payRes = await fetch("/api/payments/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          orderId: order.id,
          paymentMethod,
          transactionRef: transactionRefInput || null,
          bankName: bankNameInput || null,
          accountHolder: accountHolderInput || null
        })
      });

      const payData = await payRes.json();
      setPaymentLoading(false);

      if (payRes.ok) {
        setPlacedOrder({
          ...order,
          paymentStatus: payData.order?.paymentStatus || order.paymentStatus,
          status: payData.order?.status || order.status
        });
        clearCart();
        setStep(3); // Go to Success Screen
      } else {
        setPaymentError(payData.error || "Failed to finalize payment.");
      }
    } catch (err) {
      setPaymentLoading(false);
      setPaymentError("A server error occurred during checkout processing.");
    }
  };

  if (cartItems.length === 0 && step !== 3) {
    return (
      <>
        <Navbar />
        <main className="max-w-md mx-auto py-24 px-4 text-center space-y-6">
          <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto animate-pulse" />
          <h3 className="font-display font-bold uppercase text-sm">Checkout unavailable</h3>
          <p className="text-[11px] text-muted-foreground">Your cart is empty. Add items to checkout.</p>
          <button onClick={() => router.push("/shop")} className="bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-widest px-8 h-11">
            Return to Shop
          </button>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-grow select-none">
        {step < 3 && (
          <div className="border-b border-border/40 pb-6 mb-8 flex items-baseline justify-between">
            <div className="space-y-1">
              <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">SECURE LEDGER CHECKOUT</span>
              <h1 className="font-display text-3xl font-black uppercase tracking-wider text-foreground">Checkout</h1>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-semibold uppercase tracking-widest">
              <Lock className="w-3.5 h-3.5" /> Secure SSL
            </div>
          </div>
        )}

        {/* Step 1: Inline Auth and Address Select */}
        {step === 1 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Address Selection */}
            <div className="lg:col-span-8 space-y-6">
              {!isAuthenticated ? (
                // Inline Auth Gateway
                <div className="p-6 glass border border-border/40 space-y-6">
                  <div className="border-b border-border/40 pb-3 flex justify-between items-baseline">
                    <h3 className="font-display font-black text-xs uppercase tracking-widest">
                      {authMode === "login" ? "Account Sign In" : "Create Account"}
                    </h3>
                    <button
                      onClick={() => setAuthMode(authMode === "login" ? "register" : "login")}
                      className="text-[10px] font-bold uppercase tracking-widest underline hover:text-muted-foreground"
                    >
                      {authMode === "login" ? "Create Account" : "Sign In instead"}
                    </button>
                  </div>

                  <form onSubmit={handleInlineAuth} className="space-y-4">
                    {authMode === "register" && (
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Full Name</label>
                        <input
                          type="text"
                          required
                          placeholder="Fatima Khan"
                          value={authName}
                          onChange={(e) => setAuthName(e.target.value)}
                          className="w-full border border-border bg-card text-xs h-10 px-3 focus:outline-none focus:border-foreground"
                        />
                      </div>
                    )}
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Email Address</label>
                      <input
                        type="email"
                        required
                        placeholder="fatima@example.com"
                        value={authEmail}
                        onChange={(e) => setAuthEmail(e.target.value)}
                        className="w-full border border-border bg-card text-xs h-10 px-3 focus:outline-none focus:border-foreground"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Password</label>
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        value={authPassword}
                        onChange={(e) => setAuthPassword(e.target.value)}
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
                      {authLoading ? "Authorizing..." : authMode === "login" ? "Sign In" : "Register"}
                    </button>
                  </form>
                </div>
              ) : (
                // Addresses list
                <div className="space-y-6">
                  <div className="flex justify-between items-center border-b border-border/40 pb-3">
                    <h3 className="font-display font-black text-xs uppercase tracking-widest">
                      Shipping Destination
                    </h3>
                    <button
                      onClick={() => setShowAddressForm(!showAddressForm)}
                      className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground underline"
                    >
                      {showAddressForm ? "Select Saved" : "Add New Address"}
                    </button>
                  </div>

                  {showAddressForm ? (
                    // Address creation form
                    <form onSubmit={handleAddAddress} className="p-6 glass border border-border/40 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Recipient Name</label>
                          <input
                            type="text"
                            required
                            placeholder="Fatima Khan"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full border border-border bg-card text-xs h-10 px-3 focus:outline-none focus:border-foreground"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Phone Number</label>
                          <input
                            type="tel"
                            required
                            placeholder="03001234567"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full border border-border bg-card text-xs h-10 px-3 focus:outline-none focus:border-foreground"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Street Address</label>
                        <input
                          type="text"
                          required
                          placeholder="House Number, Street, Sector, DHA"
                          value={street}
                          onChange={(e) => setStreet(e.target.value)}
                          className="w-full border border-border bg-card text-xs h-10 px-3 focus:outline-none focus:border-foreground"
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2 col-span-1">
                          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">City</label>
                          <select
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            className="w-full border border-border bg-card text-xs h-10 px-2 focus:outline-none focus:border-foreground text-foreground"
                          >
                            {cities.map(c => (
                              <option key={c} value={c}>{c}</option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-2 col-span-1">
                          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Province</label>
                          <select
                            value={province}
                            onChange={(e) => setProvince(e.target.value)}
                            className="w-full border border-border bg-card text-xs h-10 px-2 focus:outline-none focus:border-foreground text-foreground"
                          >
                            {provinces.map(p => (
                              <option key={p} value={p}>{p}</option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-2 col-span-1">
                          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Postal Code</label>
                          <input
                            type="text"
                            required
                            placeholder="75500"
                            value={postalCode}
                            onChange={(e) => setPostalCode(e.target.value)}
                            className="w-full border border-border bg-card text-xs h-10 px-3 focus:outline-none focus:border-foreground"
                          />
                        </div>
                      </div>

                      {addressError && (
                        <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest">{addressError}</p>
                      )}

                      <button
                        type="submit"
                        disabled={addressLoading}
                        className="w-full bg-primary text-primary-foreground h-11 text-[10px] font-bold uppercase tracking-widest disabled:opacity-40"
                      >
                        {addressLoading ? "Saving Address..." : "Save and Ship Here"}
                      </button>
                    </form>
                  ) : (
                    // Saved Address Selection list
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {addresses.length > 0 ? (
                        addresses.map((addr) => (
                          <div
                            key={addr.id}
                            onClick={() => setSelectedAddressId(addr.id)}
                            className={`p-5 border cursor-pointer bg-card transition-all ${
                              selectedAddressId === addr.id
                                ? "border-primary ring-1 ring-primary shadow-sm"
                                : "border-border hover:border-foreground"
                            }`}
                          >
                            <div className="flex justify-between items-start text-xs mb-3">
                              <span className="font-bold text-foreground">{addr.name}</span>
                              {addr.isDefault && (
                                <span className="text-[8px] bg-stone-100 dark:bg-stone-900 border border-border font-bold uppercase tracking-widest px-2 py-0.5">
                                  Default
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-muted-foreground leading-relaxed">{addr.street}</p>
                            <p className="text-[11px] text-muted-foreground font-semibold mt-1">
                              {addr.city}, {addr.province} ({addr.postalCode})
                            </p>
                            <p className="text-[10px] text-stone-400 font-bold tracking-wider mt-3">
                              📞 {addr.phone}
                            </p>
                          </div>
                        ))
                      ) : (
                        <div className="col-span-2 text-center py-12 border border-dashed border-border text-muted-foreground text-xs uppercase tracking-widest">
                          <p>No shipping addresses saved yet.</p>
                          <button
                            onClick={() => setShowAddressForm(true)}
                            className="mt-3 bg-primary text-primary-foreground font-bold px-6 h-10 tracking-widest text-[9px]"
                          >
                            Add Shipping Address
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Proceed button to step 2 */}
                  {addresses.length > 0 && !showAddressForm && (
                    <div className="pt-4">
                      <button
                        onClick={() => setStep(2)}
                        className="bg-primary text-primary-foreground h-12 text-xs font-bold uppercase tracking-widest px-8 transition-transform active:scale-95"
                      >
                        Continue to Payment
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right Column: Mini Cart Summary */}
            <div className="lg:col-span-4">
              <div className="p-6 glass border border-border/40 space-y-6">
                <h3 className="font-display font-black text-xs uppercase tracking-widest border-b border-border/40 pb-3">
                  In Your Cart
                </h3>

                <div className="divide-y divide-border/20 max-h-60 overflow-y-auto pr-2">
                  {cartItems.map((item) => (
                    <div key={item.id} className="py-3 flex justify-between text-xs font-semibold uppercase tracking-wider">
                      <span className="line-clamp-1 max-w-[200px] text-muted-foreground">{item.product.name} x{item.quantity}</span>
                      <span className="text-foreground">Rs. {((item.product.price - item.product.discount) * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-border/40 pt-4 space-y-3 text-xs font-semibold uppercase tracking-wider">
                  <div className="flex justify-between">
                    <span className="text-stone-400">Subtotal</span>
                    <span className="text-foreground">Rs. {subtotal.toLocaleString()}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-bold">
                      <span>Discount</span>
                      <span>- Rs. {discountAmount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-stone-400">GST Tax (18%)</span>
                    <span className="text-foreground">Rs. {tax.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between border-b border-border/40 pb-4">
                    <span className="text-stone-400">Shipping</span>
                    <span className="text-foreground">{shippingFee === 0 ? "FREE" : `Rs. ${shippingFee}`}</span>
                  </div>
                  <div className="flex justify-between text-sm font-black pt-2">
                    <span className="text-foreground">Grand Total</span>
                    <span className="text-foreground text-base">Rs. {total.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Payment options */}
        {step === 2 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Payment selector and review */}
            <div className="lg:col-span-8 space-y-6">
              <button
                onClick={() => setStep(1)}
                className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Shipping
              </button>

              <div className="space-y-6">
                <h3 className="font-display font-black text-xs uppercase tracking-widest border-b border-border/40 pb-3">
                  Payment Method
                </h3>

                <form onSubmit={handlePlaceOrder} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* COD Choice */}
                    <div
                      onClick={() => setPaymentMethod("COD")}
                      className={`p-5 border cursor-pointer bg-card flex gap-4 items-start transition-all ${
                        paymentMethod === "COD" ? "border-primary ring-1 ring-primary shadow-xs" : "border-border hover:border-foreground"
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === "COD"}
                        readOnly
                        className="mt-0.5"
                      />
                      <div className="text-xs space-y-1">
                        <span className="font-bold text-foreground block">Cash on Delivery (COD)</span>
                        <p className="text-[10px] text-muted-foreground font-light leading-relaxed">
                          Pay in cash upon delivery to your doorstep. Max limit Rs. 50,000. Active in major cities only.
                        </p>
                      </div>
                    </div>

                    {/* Bank Transfer Choice */}
                    <div
                      onClick={() => setPaymentMethod("BANK_TRANSFER")}
                      className={`p-5 border cursor-pointer bg-card flex gap-4 items-start transition-all ${
                        paymentMethod === "BANK_TRANSFER" ? "border-primary ring-1 ring-primary shadow-xs" : "border-border hover:border-foreground"
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === "BANK_TRANSFER"}
                        readOnly
                        className="mt-0.5"
                      />
                      <div className="text-xs space-y-1">
                        <span className="font-bold text-foreground block">Bank Transfer (PKR)</span>
                        <p className="text-[10px] text-muted-foreground font-light leading-relaxed">
                          Transfer directly to our corporate bank account. Orders processed upon verification.
                        </p>
                      </div>
                    </div>

                    {/* JazzCash Choice */}
                    <div
                      onClick={() => setPaymentMethod("JAZZCASH")}
                      className={`p-5 border cursor-pointer bg-card flex gap-4 items-start transition-all ${
                        paymentMethod === "JAZZCASH" ? "border-primary ring-1 ring-primary shadow-xs" : "border-border hover:border-foreground"
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === "JAZZCASH"}
                        readOnly
                        className="mt-0.5"
                      />
                      <div className="text-xs space-y-1">
                        <span className="font-bold text-foreground block">JazzCash Wallet</span>
                        <p className="text-[10px] text-muted-foreground font-light leading-relaxed">
                          Pay instantly using your JazzCash account. Sandbox instant confirmation enabled.
                        </p>
                      </div>
                    </div>

                    {/* Easypaisa Choice */}
                    <div
                      onClick={() => setPaymentMethod("EASYPAISA")}
                      className={`p-5 border cursor-pointer bg-card flex gap-4 items-start transition-all ${
                        paymentMethod === "EASYPAISA" ? "border-primary ring-1 ring-primary shadow-xs" : "border-border hover:border-foreground"
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === "EASYPAISA"}
                        readOnly
                        className="mt-0.5"
                      />
                      <div className="text-xs space-y-1">
                        <span className="font-bold text-foreground block">Easypaisa Wallet</span>
                        <p className="text-[10px] text-muted-foreground font-light leading-relaxed">
                          Fast mobile payments with Easypaisa wallet checkout sandbox.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Manual Bank Details form (conditionally rendered) */}
                  {paymentMethod === "BANK_TRANSFER" && (
                    <div className="p-6 bg-stone-100 dark:bg-stone-900 border border-border/40 space-y-4 text-xs">
                      <div className="space-y-1 bg-background p-4 border border-border/30">
                        <h4 className="font-bold font-display uppercase tracking-wide flex items-center gap-1">
                          <Building2 className="w-4 h-4 text-stone-500" /> Monolith Bank Details
                        </h4>
                        <div className="grid grid-cols-2 gap-2 text-[10px] uppercase tracking-wider font-semibold text-muted-foreground pt-2">
                          <span>Bank Name:</span><span className="text-foreground">Bank Alfalah Ltd</span>
                          <span>Account Title:</span><span className="text-foreground">Monolith Desk Tech</span>
                          <span>Account Number:</span><span className="text-foreground">1002-345678-001</span>
                          <span>IBAN:</span><span className="text-foreground font-mono">PK63ALFH1002345678001</span>
                        </div>
                      </div>

                      <div className="border-t border-border/30 pt-4 space-y-3">
                        <h5 className="font-bold uppercase tracking-wider text-[10px] text-muted-foreground">
                          Submit Transfer Proof
                        </h5>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <input
                            type="text"
                            required
                            placeholder="Sender Bank Name"
                            value={bankNameInput}
                            onChange={(e) => setBankNameInput(e.target.value)}
                            className="bg-background border border-border text-[11px] h-9 px-3 focus:outline-none focus:border-foreground"
                          />
                          <input
                            type="text"
                            required
                            placeholder="Account Holder Name"
                            value={accountHolderInput}
                            onChange={(e) => setAccountHolderInput(e.target.value)}
                            className="bg-background border border-border text-[11px] h-9 px-3 focus:outline-none focus:border-foreground"
                          />
                          <input
                            type="text"
                            required
                            placeholder="Transaction ID / Ref"
                            value={transactionRefInput}
                            onChange={(e) => setTransactionRefInput(e.target.value)}
                            className="bg-background border border-border text-[11px] h-9 px-3 focus:outline-none focus:border-foreground font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Gateway sandbox notifications */}
                  {(paymentMethod === "JAZZCASH" || paymentMethod === "EASYPAISA") && (
                    <div className="p-4 bg-emerald-50/10 border border-emerald-500/20 text-[10px] uppercase tracking-wider font-bold text-emerald-600 flex items-center gap-2">
                      <Smartphone className="w-4 h-4" />
                      Instant sandbox authorization is active. Submitting will simulate verification.
                    </div>
                  )}

                  {paymentError && (
                    <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest">{paymentError}</p>
                  )}

                  <button
                    type="submit"
                    disabled={paymentLoading}
                    className="w-full bg-primary text-primary-foreground h-12 text-xs font-bold uppercase tracking-widest disabled:opacity-40"
                  >
                    {paymentLoading ? "Processing checkout..." : "Authorize and Place Order"}
                  </button>
                </form>
              </div>
            </div>

            {/* Right Column: Mini Cart Summary */}
            <div className="lg:col-span-4">
              <div className="p-6 glass border border-border/40 space-y-6">
                <h3 className="font-display font-black text-xs uppercase tracking-widest border-b border-border/40 pb-3">
                  In Your Cart
                </h3>

                <div className="divide-y divide-border/20 max-h-60 overflow-y-auto pr-2">
                  {cartItems.map((item) => (
                    <div key={item.id} className="py-3 flex justify-between text-xs font-semibold uppercase tracking-wider">
                      <span className="line-clamp-1 max-w-[200px] text-muted-foreground">{item.product.name} x{item.quantity}</span>
                      <span className="text-foreground">Rs. {((item.product.price - item.product.discount) * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-border/40 pt-4 space-y-3 text-xs font-semibold uppercase tracking-wider">
                  <div className="flex justify-between">
                    <span className="text-stone-400">Subtotal</span>
                    <span className="text-foreground">Rs. {subtotal.toLocaleString()}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-bold">
                      <span>Discount</span>
                      <span>- Rs. {discountAmount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-stone-400">GST Tax (18%)</span>
                    <span className="text-foreground">Rs. {tax.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between border-b border-border/40 pb-4">
                    <span className="text-stone-400">Shipping</span>
                    <span className="text-foreground">{shippingFee === 0 ? "FREE" : `Rs. ${shippingFee}`}</span>
                  </div>
                  <div className="flex justify-between text-sm font-black pt-2">
                    <span className="text-foreground">Grand Total</span>
                    <span className="text-foreground text-base">Rs. {total.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Success Screen */}
        {step === 3 && placedOrder && (
          <div className="max-w-xl mx-auto py-16 px-4 text-center space-y-8 select-none">
            <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto" />
            
            <div className="space-y-2">
              <span className="text-[10px] tracking-widest font-black uppercase text-emerald-600 block">
                ORDER FINALIZED SUCCESSFULLY
              </span>
              <h1 className="font-display text-2xl font-black uppercase tracking-wider">
                Thank You For Your Order
              </h1>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto font-light leading-relaxed">
                Your order is currently being processed by our packaging team. An email notification and SMS tracking details will be sent shortly.
              </p>
            </div>

            {/* Order Ledger Overview */}
            <div className="p-6 glass border border-border/40 text-left text-xs uppercase tracking-wider space-y-3 font-semibold">
              <div className="flex justify-between text-stone-400 text-[10px] border-b border-border/20 pb-2">
                <span>Order Number:</span>
                <span className="text-foreground font-bold">{placedOrder.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Amount paid:</span>
                <span className="text-foreground">Rs. {placedOrder.total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Payment Method:</span>
                <span className="text-foreground font-mono">{placedOrder.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span>Payment Status:</span>
                <span className="text-emerald-600 font-bold">{placedOrder.paymentStatus}</span>
              </div>
              <div className="flex justify-between border-t border-border/20 pt-2 text-[10px] text-stone-400">
                <span>Shipping via:</span>
                <span className="text-foreground">{placedOrder.shippingMethod || "TCS"} Courier</span>
              </div>
            </div>

            <div className="flex gap-4 max-w-xs mx-auto">
              <button
                onClick={() => router.push("/account")}
                className="flex-1 border border-border bg-card hover:border-foreground text-foreground h-11 text-[10px] font-bold uppercase tracking-widest transition-colors"
              >
                Track Orders
              </button>
              <button
                onClick={() => router.push("/shop")}
                className="flex-grow bg-primary text-primary-foreground h-11 text-[10px] font-bold uppercase tracking-widest"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </>
  );
}
