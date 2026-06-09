import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";

// POST /api/addresses
export async function POST(request: Request) {
  try {
    const session = getAuthenticatedUser(request);
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized. Please login to save address." },
        { status: 401 }
      );
    }

    const { name, street, city, province, postalCode, phone, isDefault } = await request.json();

    if (!name || !street || !city || !province || !postalCode || !phone) {
      return NextResponse.json(
        { error: "Recipient name, street, city, province, postal code, and phone number are required." },
        { status: 400 }
      );
    }

    // If isDefault is true, remove default status from user's other addresses first
    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId: session.userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    const newAddress = await prisma.address.create({
      data: {
        name,
        street,
        city,
        province,
        postalCode,
        phone,
        isDefault: !!isDefault,
        userId: session.userId,
      },
    });

    return NextResponse.json({
      message: "Address saved successfully",
      address: newAddress,
    });
  } catch (error: any) {
    console.error("❌ Add address error:", error);
    return NextResponse.json(
      { error: "Failed to save shipping address." },
      { status: 500 }
    );
  }
}
