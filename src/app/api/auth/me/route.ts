import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const session = getAuthenticatedUser(request);
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized access. Invalid or missing token." },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: {
        addresses: true,
        wishlist: {
          include: {
            product: true
          }
        },
        orders: {
          orderBy: {
            createdAt: "desc"
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: "User account not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        points: user.points,
        addresses: user.addresses,
        wishlist: user.wishlist.map(w => w.productId),
        ordersCount: user.orders.length,
        activeOrdersCount: user.orders.filter(o => o.status !== "DELIVERED" && o.status !== "CANCELLED").length,
      }
    });
  } catch (error: any) {
    console.error("❌ Profile retrieval error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve user profile." },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = getAuthenticatedUser(request);
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized access. Invalid or missing token." },
        { status: 401 }
      );
    }

    const { name, email } = await request.json();

    if (!name || !email) {
      return NextResponse.json(
        { error: "Name and email are required fields." },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.userId },
      data: {
        name,
        email: email.toLowerCase(),
      },
    });

    return NextResponse.json({
      message: "Profile updated successfully",
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        points: updatedUser.points,
      }
    });
  } catch (error: any) {
    console.error("❌ Profile update error:", error);
    return NextResponse.json(
      { error: "Failed to update profile." },
      { status: 500 }
    );
  }
}
