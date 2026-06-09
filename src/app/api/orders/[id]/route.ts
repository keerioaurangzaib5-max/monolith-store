import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";

// GET /api/orders/[id]
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const session = getAuthenticatedUser(request);
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized. Invalid or missing token." },
        { status: 401 }
      );
    }

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        address: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    // Buyers can only view their own orders; Admins can view any order
    if (session.role !== "ADMIN" && order.userId !== session.userId) {
      return NextResponse.json(
        { error: "Forbidden. Access denied." },
        { status: 403 }
      );
    }

    return NextResponse.json({ order });
  } catch (error: any) {
    console.error("❌ Fetch order detail error:", error);
    return NextResponse.json(
      { error: "Failed to fetch order details." },
      { status: 500 }
    );
  }
}

// PUT /api/orders/[id]
// Update order status, payment status, tracking number (Admin only)
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
    const { status, paymentStatus, trackingNumber, shippingMethod } = body;

    const order = await prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    const dataToUpdate: any = {};
    if (status !== undefined) dataToUpdate.status = status;
    if (paymentStatus !== undefined) dataToUpdate.paymentStatus = paymentStatus;
    if (trackingNumber !== undefined) dataToUpdate.trackingNumber = trackingNumber;
    if (shippingMethod !== undefined) dataToUpdate.shippingMethod = shippingMethod;

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: dataToUpdate,
      include: {
        address: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: "Order updated successfully",
      order: updatedOrder,
    });
  } catch (error: any) {
    console.error("❌ Update order error:", error);
    return NextResponse.json(
      { error: "Failed to update order details." },
      { status: 500 }
    );
  }
}
