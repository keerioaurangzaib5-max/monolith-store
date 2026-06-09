import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";

// GET /api/admin/coupons
export async function GET(request: Request) {
  try {
    const session = getAuthenticatedUser(request);
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden. Admin access required." },
        { status: 403 }
      );
    }

    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({ coupons });
  } catch (error: any) {
    console.error("❌ Fetch coupons error:", error);
    return NextResponse.json(
      { error: "Failed to fetch coupons list." },
      { status: 500 }
    );
  }
}

// POST /api/admin/coupons
// Create a new coupon code
export async function POST(request: Request) {
  try {
    const session = getAuthenticatedUser(request);
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden. Admin access required." },
        { status: 403 }
      );
    }

    const { code, discountType, discountValue, minOrderValue, expiresAt } = await request.json();

    if (!code || !discountType || discountValue === undefined) {
      return NextResponse.json(
        { error: "Code, discount type, and value are required." },
        { status: 400 }
      );
    }

    const existingCoupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() }
    });

    if (existingCoupon) {
      return NextResponse.json(
        { error: "A coupon with this code already exists." },
        { status: 400 }
      );
    }

    const newCoupon = await prisma.coupon.create({
      data: {
        code: code.toUpperCase().trim(),
        discountType,
        discountValue: parseFloat(discountValue),
        minOrderValue: parseFloat(minOrderValue || "0"),
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        active: true,
      }
    });

    return NextResponse.json({
      message: "Coupon created successfully",
      coupon: newCoupon
    });
  } catch (error: any) {
    console.error("❌ Create coupon error:", error);
    return NextResponse.json(
      { error: "Failed to create coupon code." },
      { status: 500 }
    );
  }
}
