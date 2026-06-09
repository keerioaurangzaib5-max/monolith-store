import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/shipping?orderId=...
// Retrieve tracking checkpoints from selected courier (TCS, Leopards, Trax, etc.)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get("orderId");

    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID query parameter is required." },
        { status: 400 }
      );
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { address: true }
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found." },
        { status: 404 }
      );
    }

    const courier = order.shippingMethod || "TCS";
    const trackingNo = order.trackingNumber || `MN-TRK-${Math.floor(100000 + Math.random() * 900000)}`;

    // Generate dynamic tracking milestones based on order created date
    const orderDate = new Date(order.createdAt);
    const milestones: any[] = [];

    // Always have "Order Confirmed"
    milestones.push({
      status: "Order Confirmed",
      location: "Monolith Warehouse",
      timestamp: orderDate.toLocaleString(),
      description: "Your order details have been processed and confirmed.",
      completed: true
    });

    const now = new Date();
    const diffMs = now.getTime() - orderDate.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    // Milestones added sequentially based on elapsed time since order placement
    milestones.push({
      status: "Package Prepared",
      location: "Monolith Hub",
      timestamp: new Date(orderDate.getTime() + 2 * 60 * 60 * 1000).toLocaleString(),
      description: "Items packed securely and labelled for courier handover.",
      completed: diffHours >= 2
    });

    milestones.push({
      status: "Picked up by Courier",
      location: `Karachi ${courier} Sorting Office`,
      timestamp: new Date(orderDate.getTime() + 6 * 60 * 60 * 1000).toLocaleString(),
      description: `Shipment picked up by ${courier} agent.`,
      completed: diffHours >= 6
    });

    milestones.push({
      status: "In Transit",
      location: `${order.address.city} Distribution Center`,
      timestamp: new Date(orderDate.getTime() + 18 * 60 * 60 * 1000).toLocaleString(),
      description: "Shipment is in transit to the destination station.",
      completed: diffHours >= 18
    });

    milestones.push({
      status: "Out for Delivery",
      location: `${order.address.city} Hub`,
      timestamp: new Date(orderDate.getTime() + 24 * 60 * 60 * 1000).toLocaleString(),
      description: `Courier rider is out for delivery to ${order.address.name}.`,
      completed: diffHours >= 24
    });

    milestones.push({
      status: "Delivered",
      location: order.address.street,
      timestamp: new Date(orderDate.getTime() + 26 * 60 * 60 * 1000).toLocaleString(),
      description: "Package delivered. Signed by recipient.",
      completed: diffHours >= 26 && order.status === "DELIVERED"
    });

    return NextResponse.json({
      courier,
      trackingNumber: trackingNo,
      milestones: milestones.filter(m => m.completed || milestones.indexOf(m) === milestones.findIndex(x => !x.completed)),
      rawMilestones: milestones
    });
  } catch (error: any) {
    console.error("❌ Fetch shipping error:", error);
    return NextResponse.json(
      { error: "Failed to fetch shipping tracking data." },
      { status: 500 }
    );
  }
}

// POST /api/shipping
// Calculate shipping rate and estimates for checkout
export async function POST(request: Request) {
  try {
    const { city, weightGrams, courier } = await request.json();

    if (!city) {
      return NextResponse.json(
        { error: "Destination city is required for rate calculation." },
        { status: 400 }
      );
    }

    const selectedCourier = courier || "TCS";
    const weight = weightGrams || 1000; // default 1kg

    // Mock calculations based on courier provider
    let baseRate = 200;
    let weightSurcharge = Math.ceil(weight / 500) * 50; // 50 PKR per 500g
    let citySurcharge = 0;

    // Check if city is local to Karachi hub or remote
    const localHubCities = ["karachi"];
    const majorTransitCities = ["lahore", "islamabad", "rawalpindi", "faisalabad"];
    
    const dest = city.toLowerCase().trim();
    if (!localHubCities.includes(dest)) {
      if (majorTransitCities.includes(dest)) {
        citySurcharge = 100;
      } else {
        citySurcharge = 250; // Remote remote regions
      }
    }

    let courierMultiplier = 1.0;
    let estimateDays = "1-2 Business Days";

    switch (selectedCourier) {
      case "TCS":
        courierMultiplier = 1.2;
        estimateDays = "1-2 Business Days";
        break;
      case "LEOPARD":
        courierMultiplier = 1.0;
        estimateDays = "2-3 Business Days";
        break;
      case "TRAX":
        courierMultiplier = 0.95;
        estimateDays = "2-4 Business Days";
        break;
      case "M&P":
        courierMultiplier = 1.05;
        estimateDays = "2-3 Business Days";
        break;
      case "PAKISTAN_POST":
        courierMultiplier = 0.4;
        estimateDays = "5-8 Business Days";
        break;
    }

    const calculatedCost = Math.round((baseRate + weightSurcharge + citySurcharge) * courierMultiplier);

    return NextResponse.json({
      courier: selectedCourier,
      cost: calculatedCost,
      estimate: estimateDays,
    });
  } catch (error: any) {
    console.error("❌ Shipping calculator error:", error);
    return NextResponse.json(
      { error: "Failed to calculate shipping rate." },
      { status: 500 }
    );
  }
}
