import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";

// PUT /api/reviews/[id]
// Approve/Moderates a review
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

    const { isApproved } = await request.json();

    const review = await prisma.review.findUnique({
      where: { id },
    });

    if (!review) {
      return NextResponse.json(
        { error: "Review not found" },
        { status: 404 }
      );
    }

    const updatedReview = await prisma.review.update({
      where: { id },
      data: { isApproved: !!isApproved },
    });

    return NextResponse.json({
      message: "Review moderation status updated successfully",
      review: updatedReview,
    });
  } catch (error: any) {
    console.error("❌ Moderation review error:", error);
    return NextResponse.json(
      { error: "Failed to moderate review." },
      { status: 500 }
    );
  }
}

// DELETE /api/reviews/[id]
// Delete a review
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

    const review = await prisma.review.findUnique({
      where: { id },
    });

    if (!review) {
      return NextResponse.json(
        { error: "Review not found" },
        { status: 404 }
      );
    }

    await prisma.review.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "Review deleted successfully",
    });
  } catch (error: any) {
    console.error("❌ Delete review error:", error);
    return NextResponse.json(
      { error: "Failed to delete review." },
      { status: 500 }
    );
  }
}
