import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";

// GET /api/products/[id]
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        reviews: {
          where: { isApproved: true },
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      product: {
        ...product,
        images: product.images ? product.images.split(",") : [],
        specifications: product.specifications ? JSON.parse(product.specifications) : {},
      },
    });
  } catch (error: any) {
    console.error("❌ Fetch product details error:", error);
    return NextResponse.json(
      { error: "Failed to fetch product details" },
      { status: 500 }
    );
  }
}

// PUT /api/products/[id]
// Update a product (Admin only)
export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const session = getAuthenticatedUser(request);
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden. Admin access required." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, description, price, discount, sku, category, inventory, images, specifications } = body;

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    const dataToUpdate: any = {};
    if (name !== undefined) dataToUpdate.name = name;
    if (description !== undefined) dataToUpdate.description = description;
    if (price !== undefined) dataToUpdate.price = parseFloat(price);
    if (discount !== undefined) dataToUpdate.discount = parseFloat(discount);
    if (sku !== undefined) dataToUpdate.sku = sku;
    if (category !== undefined) dataToUpdate.category = category;
    if (inventory !== undefined) dataToUpdate.inventory = parseInt(inventory);

    if (images !== undefined) {
      dataToUpdate.images = Array.isArray(images) ? images.join(",") : images;
    }
    if (specifications !== undefined) {
      dataToUpdate.specifications = typeof specifications === "object" ? JSON.stringify(specifications) : specifications;
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: dataToUpdate,
    });

    return NextResponse.json({
      message: "Product updated successfully",
      product: {
        ...updatedProduct,
        images: updatedProduct.images ? updatedProduct.images.split(",") : [],
        specifications: updatedProduct.specifications ? JSON.parse(updatedProduct.specifications) : {},
      },
    });
  } catch (error: any) {
    console.error("❌ Update product error:", error);
    return NextResponse.json(
      { error: "Failed to update product." },
      { status: 500 }
    );
  }
}

// DELETE /api/products/[id]
// Delete a product (Admin only)
export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const session = getAuthenticatedUser(request);
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden. Admin access required." },
        { status: 403 }
      );
    }

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "Product deleted successfully",
    });
  } catch (error: any) {
    console.error("❌ Delete product error:", error);
    return NextResponse.json(
      { error: "Failed to delete product." },
      { status: 500 }
    );
  }
}
