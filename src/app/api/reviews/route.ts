import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";

// GET /api/reviews
// Fetches all reviews (for Admin moderation)
export async function GET(request: Request) {
  try {
    const session = getAuthenticatedUser(request);
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden. Admin access required." },
        { status: 403 }
      );
    }

    const reviews = await prisma.review.findMany({
      include: {
        product: {
          select: { id: true, name: true, sku: true }
        },
        user: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({ reviews });
  } catch (error: any) {
    console.error("❌ Fetch reviews error:", error);
    return NextResponse.json(
      { error: "Failed to fetch reviews." },
      { status: 500 }
    );
  }
}

// POST /api/reviews
// Submit a review
export async function POST(request: Request) {
  try {
    const session = getAuthenticatedUser(request);
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized. Please login to submit a review." },
        { status: 401 }
      );
    }

    const { productId, rating, comment } = await request.json();

    if (!productId || rating === undefined || !comment) {
      return NextResponse.json(
        { error: "Product ID, rating, and comment are required." },
        { status: 400 }
      );
    }

    // Verify rating value
    const ratingInt = parseInt(rating);
    if (ratingInt < 1 || ratingInt > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5." },
        { status: 400 }
      );
    }

    const review = await prisma.review.create({
      data: {
        productId,
        rating: ratingInt,
        comment,
        userId: session.userId,
        isApproved: true, // auto-approve in sandbox mode
      },
    });

    // Update product rating average
    const productReviews = await prisma.review.findMany({
      where: { productId, isApproved: true },
      select: { rating: true },
    });

    const totalRating = productReviews.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = totalRating / productReviews.length;

    await prisma.product.update({
      where: { id: productId },
      data: { rating: averageRating },
    });

    return NextResponse.json({
      message: "Review submitted successfully",
      review,
    });
  } catch (error: any) {
    console.error("❌ Submit review error:", error);
    return NextResponse.json(
      { error: "Failed to submit review." },
      { status: 500 }
    );
  }
}
