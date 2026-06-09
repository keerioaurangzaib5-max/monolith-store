import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");

    if (!code) {
      return NextResponse.json(
        { error: "Coupon code is required" },
        { status: 400 }
      );
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!coupon) {
      return NextResponse.json(
        { error: "Coupon code is invalid or does not exist." },
        { status: 404 }
      );
    }

    return NextResponse.json({ coupon });
  } catch (error: any) {
    console.error("❌ Fetch coupon error:", error);
    return NextResponse.json(
      { error: "Failed to fetch coupon details." },
      { status: 500 }
    );
  }
}
