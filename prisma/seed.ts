import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcrypt from "bcryptjs";

const adapter = new PrismaBetterSqlite3({ url: "file:./dev.db" });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Starting database seeding...");

  // Clean existing tables
  await prisma.wishlistItem.deleteMany();
  await prisma.review.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.address.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();

  // Create Users
  const hashedAdminPassword = await bcrypt.hash("admin123", 10);
  const admin = await prisma.user.create({
    data: {
      email: "admin@monolith.com",
      name: "Monolith Admin",
      password: hashedAdminPassword,
      role: "ADMIN",
    },
  });

  const hashedBuyerPassword = await bcrypt.hash("buyer123", 10);
  const buyer = await prisma.user.create({
    data: {
      email: "buyer@monolith.com",
      name: "Fatima Khan",
      password: hashedBuyerPassword,
      role: "BUYER",
      points: 1500,
    },
  });

  console.log("👥 Users created successfully.");

  // Create Addresses
  const homeAddress = await prisma.address.create({
    data: {
      name: "Fatima Khan (Home)",
      street: "House 12-A, Khayaban-e-Ittehad, Phase 6, DHA",
      city: "Karachi",
      province: "Sindh",
      postalCode: "75500",
      phone: "03001234567",
      isDefault: true,
      userId: buyer.id,
    },
  });

  const officeAddress = await prisma.address.create({
    data: {
      name: "Fatima Khan (Office)",
      street: "Office 404, Building 5C, M.M. Alam Road, Gulberg III",
      city: "Lahore",
      province: "Punjab",
      postalCode: "54660",
      phone: "04235712345",
      isDefault: false,
      userId: buyer.id,
    },
  });

  console.log("📍 Addresses created successfully.");

  // Create Coupons
  await prisma.coupon.createMany({
    data: [
      {
        code: "WELCOME10",
        discountType: "PERCENTAGE",
        discountValue: 10,
        minOrderValue: 2000,
      },
      {
        code: "MONOLITH15",
        discountType: "PERCENTAGE",
        discountValue: 15,
        minOrderValue: 5000,
      },
      {
        code: "PKR500",
        discountType: "FIXED",
        discountValue: 500,
        minOrderValue: 3000,
      },
    ],
  });

  console.log("🎟️ Coupons created successfully.");

  // Create Products
  const productsData = [
    {
      name: "Monolith Walnut Desk Shelf",
      description: "Crafted from solid American Walnut wood and structural-grade anodized aluminum legs. Designed to create dual-level storage and raise your monitor to an ergonomic eye level. Features premium cork undersides to protect your desk surface. Perfect for minimalist setups.",
      price: 18500,
      discount: 1500,
      sku: "MN-DSK-WNL-01",
      category: "Desk Shelves",
      inventory: 15,
      rating: 4.9,
      images: "/images/products/desk-shelf-1.jpg,/images/products/desk-shelf-2.jpg",
      specifications: JSON.stringify({
        materials: ["Solid American Walnut", "Aerospace Anodized Aluminum", "Natural Protective Oil Coat"],
        dimensions: "46\" L x 9\" W x 4.5\" H",
        weight: "3.2 kg",
        colors: ["Walnut & Silver", "Walnut & Charcoal Black"],
        origin: "Handcrafted in Pakistan"
      })
    },
    {
      name: "MacBook Leather Sleeve",
      description: "Tailored to wrap your MacBook in absolute luxury. Made from 100% full-grain vegetable-tanned leather that develops a unique vintage patina over time. Lined with natural grey merino wool felt to prevent scuffs and scratches. Features silent magnetic closures.",
      price: 9800,
      discount: 0,
      sku: "MN-SLV-MCB-14",
      category: "Tech Sleeves",
      inventory: 35,
      rating: 4.8,
      images: "/images/products/sleeve-1.jpg,/images/products/sleeve-2.jpg",
      specifications: JSON.stringify({
        materials: ["Full-Grain Vegetable-Tanned Leather", "Merino Wool Felt Lining", "Rare-Earth Magnets"],
        compatibility: "MacBook Pro 14-inch (2021-2026), MacBook Air 13/15-inch",
        colors: ["Charcoal Black", "Tan Brown", "Forest Green"],
        thickness: "4mm padding"
      })
    },
    {
      name: "Merino Wool Desk Mat",
      description: "Made from natural premium wool felt that offers a soft, textured surface for your hands and tools. Designed to define your desk boundaries while providing optimal mouse gliding. Features an anti-slip natural rubber-cork compound backing.",
      price: 5400,
      discount: 400,
      sku: "MN-MAT-FEL-01",
      category: "Desk Mats",
      inventory: 50,
      rating: 4.7,
      images: "/images/products/deskmat-1.jpg,/images/products/deskmat-2.jpg",
      specifications: JSON.stringify({
        materials: ["100% Merino Wool Felt", "Natural Anti-Slip Cork Backing"],
        dimensions: "31.5\" x 11.8\" x 0.16\"",
        sizes: ["Medium (31.5\" x 11.8\")", "Large (36\" x 18\")"],
        colors: ["Light Ash Grey", "Graphite Charcoal", "Sand Beige"]
      })
    },
    {
      name: "Anodized MagSafe Charging Stand",
      description: "Heavyweight solid metal charger stand compatible with Apple MagSafe. Precision CNC-milled from a block of aerospace-grade aluminum. Weighted base prevents tipping, allowing seamless one-handed attachment and detachment. Features an angled face for optimal StandBy mode viewing.",
      price: 7500,
      discount: 0,
      sku: "MN-STD-MAG-01",
      category: "Charging Stands",
      inventory: 20,
      rating: 4.6,
      images: "/images/products/stand-1.jpg",
      specifications: JSON.stringify({
        materials: ["6000-series Anodized Aluminum", "Micro-suction base padding"],
        weight: "520g (Ultra-weighted)",
        colors: ["Space Grey", "Silver Alloy"],
        features: ["Angled at 65°", "One-handed operation"]
      })
    },
    {
      name: "Walnut & Leather Desk Tray Set",
      description: "A set of three modular desk organizers to tidy up your daily carry. Includes a long pen tray, a smartphone dock with cord slots, and a wider valet tray for keys and coins. Each tray is crafted from solid American walnut wood with premium black leather linings.",
      price: 6800,
      discount: 800,
      sku: "MN-TRY-SET-01",
      category: "Organizers",
      inventory: 12,
      rating: 4.8,
      images: "/images/products/trays-1.jpg,/images/products/trays-2.jpg",
      specifications: JSON.stringify({
        materials: ["Solid American Walnut", "Genuine Leather Inlays"],
        pieces: ["Pen Tray", "Phone Cradle", "Valet Catch-all Tray"],
        dimensions: "Various modular sizes"
      })
    },
    {
      name: "Leather Tech Travel Folio",
      description: "Keep your workspace portable. Features a zippered design that opens flat, with dedicated elastic loops for charging cables, pen slots, and dedicated pockets for power bricks, SSDs, and notebook tools. Bound in our premium full-grain pebble leather.",
      price: 8200,
      discount: 0,
      sku: "MN-ORG-TCH-01",
      category: "Organizers",
      inventory: 25,
      rating: 4.7,
      images: "/images/products/folio-1.jpg,/images/products/folio-2.jpg",
      specifications: JSON.stringify({
        materials: ["Pebble-Grain Genuine Leather", "YKK Excella Metallic Zippers", "Microfiber lining"],
        dimensions: "9.5\" x 6.5\" x 1.5\"",
        colors: ["Charcoal Black", "Saddle Tan"]
      })
    }
  ];

  for (const prod of productsData) {
    const p = await prisma.product.create({
      data: prod,
    });

    // Create a mock review for each product
    await prisma.review.create({
      data: {
        rating: 5,
        comment: `Absolutely premium quality. The craftsmanship on this ${p.name} is outstanding!`,
        userId: buyer.id,
        productId: p.id,
      },
    });
  }

  console.log("📦 Products and reviews created successfully.");
  console.log("🌱 Database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
