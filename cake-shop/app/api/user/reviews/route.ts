import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Cake } from "@/lib/models/Cake";

async function recalculateCakeRating(cakeId: string) {
  const cake = await Cake.findById(cakeId);
  if (!cake) return;

  const reviews = cake.reviews || [];
  const totalReviews = reviews.length;
  const averageRating =
    totalReviews > 0
      ? reviews.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / totalReviews
      : 0;

  cake.averageRating = Math.round(averageRating * 10) / 10;
  cake.totalReviews = totalReviews;
  await cake.save();
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    const cakes = await Cake.find({
      "reviews.user": session.user.id,
    }).select("name images reviews");

    const reviews = cakes.flatMap((cake) =>
      (cake.reviews || [])
        .filter((r: { user: { toString: () => string } }) => r.user.toString() === session.user!.id)
        .map((r: { _id: unknown; rating: number; comment: string; createdAt: Date }) => ({
          _id: r._id,
          rating: r.rating,
          comment: r.comment,
          createdAt: r.createdAt,
          cake: {
            _id: cake._id,
            name: cake.name,
            images: cake.images,
          },
        }))
    );

    reviews.sort(
      (a: { createdAt: Date }, b: { createdAt: Date }) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json({ success: true, reviews });
  } catch (error) {
    console.error("Get reviews error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    const { cakeId, rating, comment } = await request.json();

    if (!cakeId || !rating) {
      return NextResponse.json(
        { success: false, message: "Cake ID and rating are required" },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, message: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    const cake = await Cake.findById(cakeId);
    if (!cake) {
      return NextResponse.json(
        { success: false, message: "Cake not found" },
        { status: 404 }
      );
    }

    const existingReview = (cake.reviews || []).find(
      (r: { user: { toString: () => string } }) => r.user.toString() === session.user!.id
    );

    if (existingReview) {
      return NextResponse.json(
        { success: false, message: "You have already reviewed this cake" },
        { status: 400 }
      );
    }

    cake.reviews.push({
      user: session.user.id,
      rating,
      comment: comment || "",
    });

    await cake.save();
    await recalculateCakeRating(cakeId);

    const review = cake.reviews[cake.reviews.length - 1];

    return NextResponse.json(
      { success: true, message: "Review created successfully", review },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create review error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    const { reviewId, cakeId, rating, comment } = await request.json();

    if (!reviewId || !cakeId || !rating) {
      return NextResponse.json(
        {
          success: false,
          message: "Review ID, cake ID, and rating are required",
        },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, message: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    const cake = await Cake.findById(cakeId);
    if (!cake) {
      return NextResponse.json(
        { success: false, message: "Cake not found" },
        { status: 404 }
      );
    }

    const review = cake.reviews.id(reviewId);
    if (!review || review.user.toString() !== session.user.id) {
      return NextResponse.json(
        { success: false, message: "Review not found" },
        { status: 404 }
      );
    }

    review.rating = rating;
    review.comment = comment || "";

    await cake.save();
    await recalculateCakeRating(cakeId);

    return NextResponse.json({
      success: true,
      message: "Review updated successfully",
      review,
    });
  } catch (error) {
    console.error("Update review error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    const { reviewId, cakeId } = await request.json();

    if (!reviewId || !cakeId) {
      return NextResponse.json(
        { success: false, message: "Review ID and cake ID are required" },
        { status: 400 }
      );
    }

    const cake = await Cake.findById(cakeId);
    if (!cake) {
      return NextResponse.json(
        { success: false, message: "Cake not found" },
        { status: 404 }
      );
    }

    const review = cake.reviews.id(reviewId);
    if (!review || review.user.toString() !== session.user.id) {
      return NextResponse.json(
        { success: false, message: "Review not found" },
        { status: 404 }
      );
    }

    cake.reviews.pull({ _id: reviewId });
    await cake.save();
    await recalculateCakeRating(cakeId);

    return NextResponse.json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    console.error("Delete review error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
