import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import "./globals.css";

const sans = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const display = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Monolith | Premium Minimalist Tech Carry & Desk Accessories",
  description: "Precision crafted from solid walnut wood, full-grain leather, and aerospace-grade aluminum. Discover our curated collection of luxury desk shelves, tech sleeves, and desk organizers.",
  metadataBase: new URL("http://localhost:3000"),
  openGraph: {
    title: "Monolith | Premium Minimalist Tech Carry & Desk Accessories",
    description: "Precision crafted from solid walnut wood, full-grain leather, and aerospace-grade aluminum.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Monolith | Premium Minimalist Desk Essentials",
    description: "Precision crafted from solid walnut wood, full-grain leather, and aerospace-grade aluminum.",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${sans.variable} ${display.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              {children}
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
