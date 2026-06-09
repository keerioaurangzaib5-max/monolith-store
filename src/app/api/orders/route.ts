import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";

// GET /api/orders
// User fetches their order history, Admin fetches all orders
export async function GET(request: Request) {
  try {
    const session = getAuthenticatedUser(request);
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized. Invalid or missing token." },
        { status: 401 }
      );
    }

    let orders;
    if (session.role === "ADMIN") {
      orders = await prisma.order.findMany({
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          address: true,
          items: {
            include: {
              product: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    } else {
      orders = await prisma.order.findMany({
        where: { userId: session.userId },
        include: {
          address: true,
          items: {
            include: {
              product: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    }

    return NextResponse.json({ orders });
  } catch (error: any) {
    console.error("❌ Fetch orders error:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders." },
      { status: 500 }
    );
  }
}

// POST /api/orders
// Place a new order
export async function POST(request: Request) {
  try {
    const session = getAuthenticatedUser(request);
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized. Please login to place an order." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { items, addressId, paymentMethod, couponCode, notes } = body;

    // Validation
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Cart is empty. Please add items before checking out." },
        { status: 400 }
      );
    }

    if (!addressId) {
      return NextResponse.json(
        { error: "Shipping address is required." },
        { status: 400 }
      );
    }

    if (!paymentMethod) {
      return NextResponse.json(
        { error: "Payment method is required." },
        { status: 400 }
      );
    }

    // Fetch shipping address
    const address = await prisma.address.findUnique({
      where: { id: addressId },
    });

    if (!address || address.userId !== session.userId) {
      return NextResponse.json(
        { error: "Invalid shipping address." },
        { status: 400 }
      );
    }

    // Calculate Cart Totals
    let subtotal = 0;
    const itemsWithDetails: any[] = [];

    // Verify inventory and prices
    for (const item of items) {
      const dbProduct = await prisma.product.findUnique({
        where: { id: item.productId },
      });

      if (!dbProduct) {
        return NextResponse.json(
          { error: `Product not found.` },
          { status: 400 }
        );
      }

      if (dbProduct.inventory < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for: ${dbProduct.name}. Only ${dbProduct.inventory} left.` },
          { status: 400 }
        );
      }

      const activePrice = dbProduct.price - dbProduct.discount;
      subtotal += activePrice * item.quantity;

      itemsWithDetails.push({
        productId: dbProduct.id,
        quantity: item.quantity,
        price: activePrice,
        selectedSize: item.selectedSize || null,
        selectedColor: item.selectedColor || null,
        dbProduct,
      });
    }

    // Handle Coupon Discount
    let discountAmount = 0;
    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: couponCode.toUpperCase() },
      });

      if (coupon && coupon.active) {
        if (subtotal >= coupon.minOrderValue) {
          if (coupon.discountType === "PERCENTAGE") {
            discountAmount = subtotal * (coupon.discountValue / 100);
          } else {
            discountAmount = coupon.discountValue;
          }
          // Ensure discount is not greater than subtotal
          discountAmount = Math.min(discountAmount, subtotal);
        }
      }
    }

    const afterDiscount = subtotal - discountAmount;

    // GST (Sales Tax) Calculation - Default 18% in Pakistan
    const gstRateStr = process.env.GST_RATE || "18";
    const gstRate = parseFloat(gstRateStr) / 100;
    const tax = afterDiscount * gstRate;

    // Shipping Fee
    // Free shipping above 10,000 PKR, else 300 PKR flat
    const shippingFee = afterDiscount >= 10000 ? 0 : 300;

    const total = afterDiscount + tax + shippingFee;

    // Cash on Delivery checks
    if (paymentMethod === "COD") {
      // Rule 1: Max COD limit is 50,000 PKR
      if (total > 50000) {
        return NextResponse.json(
          { error: "Cash on Delivery (COD) is only available for orders below Rs. 50,000. Please select another payment method." },
          { status: 400 }
        );
      }

      // Rule 2: City validation
      const activeCities = [
        "karachi", "lahore", "islamabad", "rawalpindi", "faisalabad",
        "peshawar", "multan", "quetta", "sialkot", "gujranwala",
        "hyderabad", "sargodha", "bahawalpur", "sukkur", "sahiwal"
      ];
      if (!activeCities.includes(address.city.toLowerCase().trim())) {
        return NextResponse.json(
          { error: `Cash on Delivery (COD) is currently not available for ${address.city}. We only deliver COD to major cities. Please pay via Bank Transfer or Cards.` },
          { status: 400 }
        );
      }
    }

    // Transactional database creation: Deduct stock & create order
    const orderNumber = `MN-${Math.floor(100000 + Math.random() * 900000)}`;

    const order = await prisma.$transaction(async (tx) => {
      // 1. Create the order
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          subtotal,
          discountAmount,
          couponCode: couponCode || null,
          tax,
          shippingFee,
          total,
          paymentMethod,
          paymentStatus: paymentMethod === "COD" ? "PENDING" : "PENDING", // pending confirmation
          status: "PENDING",
          shippingMethod: "TCS", // Default courier
          notes: notes || "",
          userId: session.userId,
          addressId: address.id,
        },
      });

      // 2. Create order items and decrement product inventory
      for (const item of itemsWithDetails) {
        await tx.orderItem.create({
          data: {
            orderId: newOrder.id,
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            selectedSize: item.selectedSize,
            selectedColor: item.selectedColor,
          },
        });

        await tx.product.update({
          where: { id: item.productId },
          data: {
            inventory: {
              decrement: item.quantity,
            },
          },
        });
      }

      // 3. Award customer loyalty points (1 point for every 100 PKR spent)
      const pointsToAward = Math.floor(total / 100);
      await tx.user.update({
        where: { id: session.userId },
        data: {
          points: {
            increment: pointsToAward,
          },
        },
      });

      return newOrder;
    });

    return NextResponse.json(
      {
        message: "Order placed successfully",
        order,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("❌ Place order error:", error);
    return NextResponse.json(
      { error: "Failed to process order. Please try again." },
      { status: 500 }
    );
  }
}
