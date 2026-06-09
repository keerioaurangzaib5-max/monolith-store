import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";

// GET /api/products
// Fetch catalog with filtering, sorting, and search
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || "";
    const category = searchParams.get("category") || "";
    const minPrice = parseFloat(searchParams.get("minPrice") || "0");
    const maxPrice = parseFloat(searchParams.get("maxPrice") || "1000000");
    const minRating = parseFloat(searchParams.get("minRating") || "0");
    const sortBy = searchParams.get("sortBy") || "new_arrivals"; // price_asc, price_desc, rating_desc, new_arrivals
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");

    const skip = (page - 1) * limit;

    // Build Prisma query filters
    const whereClause: any = {
      price: {
        gte: minPrice,
        lte: maxPrice,
      },
      rating: {
        gte: minRating,
      },
    };

    if (q) {
      whereClause.OR = [
        { name: { contains: q } },
        { description: { contains: q } },
        { sku: { contains: q } },
      ];
    }

    if (category && category.toLowerCase() !== "all") {
      whereClause.category = {
        equals: category,
      };
    }

    // Determine sorting
    let orderByClause: any = { createdAt: "desc" };
    if (sortBy === "price_asc") {
      orderByClause = { price: "asc" };
    } else if (sortBy === "price_desc") {
      orderByClause = { price: "desc" };
    } else if (sortBy === "rating_desc") {
      orderByClause = { rating: "desc" };
    }

    // Fetch products and total count
    const [products, totalCount] = await prisma.$transaction([
      prisma.product.findMany({
        where: whereClause,
        orderBy: orderByClause,
        skip,
        take: limit,
      }),
      prisma.product.count({ where: whereClause }),
    ]);

    // Format products specs and images
    const formattedProducts = products.map((p) => ({
      ...p,
      images: p.images ? p.images.split(",") : [],
      specifications: p.specifications ? JSON.parse(p.specifications) : {},
    }));

    return NextResponse.json({
      products: formattedProducts,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error: any) {
    console.error("❌ Fetch products error:", error);
    return NextResponse.json(
      { error: "Failed to fetch products catalogue." },
      { status: 500 }
    );
  }
}

// POST /api/products
// Create a new product (Admin only)
export async function POST(request: Request) {
  try {
    const session = getAuthenticatedUser(request);
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden. Admin access required." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, description, price, discount, sku, category, inventory, images, specifications } = body;

    if (!name || !description || price === undefined || !sku || !category) {
      return NextResponse.json(
        { error: "Name, description, price, SKU, and category are required fields." },
        { status: 400 }
      );
    }

    // Check unique SKU
    const existingSku = await prisma.product.findUnique({
      where: { sku },
    });

    if (existingSku) {
      return NextResponse.json(
        { error: "A product with this SKU already exists." },
        { status: 400 }
      );
    }

    const imagesString = Array.isArray(images) ? images.join(",") : (images || "");
    const specsString = typeof specifications === "object" ? JSON.stringify(specifications) : (specifications || "{}");

    const newProduct = await prisma.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        discount: parseFloat(discount || "0"),
        sku,
        category,
        inventory: parseInt(inventory || "0"),
        images: imagesString,
        specifications: specsString,
        rating: 0.0,
      },
    });

    return NextResponse.json(
      {
        message: "Product created successfully",
        product: {
          ...newProduct,
          images: newProduct.images ? newProduct.images.split(",") : [],
          specifications: JSON.parse(newProduct.specifications),
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("❌ Create product error:", error);
    return NextResponse.json(
      { error: "Failed to create product." },
      { status: 500 }
    );
  }
}
