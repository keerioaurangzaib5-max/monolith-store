"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { 
  ShoppingBag, 
  User, 
  Menu, 
  X, 
  Sun, 
  Moon, 
  Search, 
  SlidersHorizontal 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export function Navbar() {
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();
  const { cartItems } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Sync dark mode state
  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark") || 
                   localStorage.getItem("theme") === "dark";
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleDarkMode = () => {
    const nextDark = !darkMode;
    setDarkMode(nextDark);
    if (nextDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  const navLinks = [
    { name: "Shop", href: "/shop" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
    { name: "Blog", href: "/blog" },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full glass border-b border-border/40 select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="font-display font-black text-xl tracking-widest text-foreground uppercase select-none">
              Monolith.
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex space-x-8">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-xs uppercase tracking-widest font-semibold transition-colors duration-200 ${
                    isActive 
                      ? "text-primary font-bold border-b border-primary pb-0.5" 
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Action Icons */}
          <div className="flex items-center space-x-4">
            {/* Search Icon */}
            <button
              onClick={() => setSearchOpen(true)}
              className="p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted/50 transition-colors"
              aria-label="Search"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted/50 transition-colors"
              aria-label="Toggle theme"
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* User Account */}
            <Link
              href={isAuthenticated ? "/account" : "/account?mode=login"}
              className="p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted/50 transition-colors"
              aria-label="User Account"
            >
              <User className="w-4 h-4" />
            </Link>

            {/* Cart Icon */}
            <Link
              href="/cart"
              className="p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted/50 transition-colors relative"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="w-4 h-4" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 bg-primary text-primary-foreground text-[8px] font-bold rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 md:hidden text-muted-foreground hover:text-foreground rounded-full hover:bg-muted/50 transition-colors"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="md:hidden fixed top-16 left-0 right-0 z-30 glass border-b border-border shadow-lg"
          >
            <div className="px-4 pt-2 pb-6 space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-xs uppercase tracking-widest font-semibold text-muted-foreground hover:text-foreground py-2 border-b border-border/20"
                >
                  {link.name}
                </Link>
              ))}
              {user?.role === "ADMIN" && (
                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-xs uppercase tracking-widest font-bold text-emerald-600 hover:text-emerald-700 py-2"
                >
                  Admin Panel
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Overlay */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/90 backdrop-blur-md flex items-center justify-center p-4"
          >
            <button
              onClick={() => setSearchOpen(false)}
              className="absolute top-6 right-6 p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="w-full max-w-xl text-center space-y-4">
              <h3 className="font-display text-lg uppercase tracking-widest font-black">Search Monolith</h3>
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  if (searchQuery.trim()) {
                    window.location.href = `/shop?q=${encodeURIComponent(searchQuery)}`;
                  }
                }}
                className="relative flex items-center border-b-2 border-foreground/30 focus-within:border-foreground py-2"
              >
                <input
                  type="text"
                  placeholder="Type to search..."
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent text-xl font-medium focus:outline-none placeholder-muted-foreground"
                />
                <button type="submit" className="p-2 hover:text-muted-foreground">
                  <Search className="w-5 h-5" />
                </button>
              </form>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Press Enter to search. Try "Walnut", "MacBook", "Merino", or "Leather".
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
