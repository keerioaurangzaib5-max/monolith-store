# Monolith SEO Setup Guide

This document describes how to optimize **Monolith** for search engines, including search indexes, Open Graph metadata, XML sitemaps, and Structured Data (Schema markup).

---

## 1. Title Tags and Meta Descriptions
Dynamic meta titles and descriptions are configured inside `src/app/layout.tsx`.

- **Home Page**:
  - *Title*: `Monolith | Premium Minimalist Tech Carry & Desk Accessories`
  - *Description*: `Precision crafted from solid walnut wood, full-grain leather, and aerospace-grade aluminum. Discover our luxury desk shelves and tech sleeves.`
- **Dynamic Product Pages**:
  - Titles and descriptions are dynamically pulled from the product records in the database. Ensure product listings have descriptive descriptions.

---

## 2. Open Graph & Social Cards
Monolith is configured to support Open Graph (OG) tags:
- `og:title`: Custom branding title.
- `og:description`: Brand summaries.
- `og:type`: `website` (for home) or `product` (for dynamic shop details).
- `twitter:card`: `summary_large_image` to render high-contrast image previews on Twitter.

---

## 3. Structured Data (JSON-LD Schema)
To display product ratings, prices, and stock statuses directly in search results, inject the following JSON-LD schema inside `src/app/shop/[id]/page.tsx` or layouts:

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org/",
  "@type": "Product",
  "name": "Monolith Walnut Desk Shelf",
  "image": "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0",
  "description": "Solid walnut monitor stand and desk shelf.",
  "sku": "MN-DSK-WNL-01",
  "offers": {
    "@type": "Offer",
    "url": "http://localhost:3000/shop/monolith-desk-shelf",
    "priceCurrency": "PKR",
    "price": "18500",
    "availability": "https://schema.org/InStock"
  }
}
</script>
```

---

## 4. Robots.txt and Sitemaps
In Next.js App Router, you can easily generate static sitemaps and robots.txt files:

### Create `src/app/robots.ts`
```typescript
import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/account/", "/cart/", "/checkout/"],
    },
    sitemap: "https://yourdomain.com/sitemap.xml",
  };
}
```

### Create `src/app/sitemap.ts`
```typescript
import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://yourdomain.com";

  // Dynamic products
  const products = await prisma.product.findMany({ select: { id: true, updatedAt: true } });
  const productEntries = products.map((p) => ({
    url: `${baseUrl}/shop/${p.id}`,
    lastModified: p.updatedAt,
  }));

  return [
    { url: baseUrl, lastModified: new Date() },
    { url: `${baseUrl}/shop`, lastModified: new Date() },
    { url: `${baseUrl}/about`, lastModified: new Date() },
    { url: `${baseUrl}/contact`, lastModified: new Date() },
    { url: `${baseUrl}/blog`, lastModified: new Date() },
    { url: `${baseUrl}/help`, lastModified: new Date() },
    ...productEntries,
  ];
}
```
Vercel handles routing these endpoints automatically as `/robots.txt` and `/sitemap.xml`!
