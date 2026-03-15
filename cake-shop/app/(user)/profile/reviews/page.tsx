"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { Star, Pencil, Trash2, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatDate } from "@/lib/utils";

interface Review {
  _id: string;
  cake: {
    _id: string;
    name: string;
  };
  rating: number;
  comment: string;
  createdAt: string;
}

function StarRating({
  rating,
  onRate,
  interactive = false,
}: {
  rating: number;
  onRate?: (r: number) => void;
  interactive?: boolean;
}) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${
            star <= rating
              ? "fill-yellow-400 text-yellow-400"
              : "text-muted-foreground"
          } ${interactive ? "cursor-pointer hover:text-yellow-400" : ""}`}
          onClick={() => interactive && onRate?.(star)}
        />
      ))}
    </div>
  );
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRating, setEditRating] = useState(0);
  const [editComment, setEditComment] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchReviews = useCallback(async () => {
    try {
      const res = await fetch("/api/user/reviews");
      if (!res.ok) throw new Error("Failed to fetch reviews");
      const data = await res.json();
      setReviews(data.reviews ?? data ?? []);
    } catch {
      toast.error("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const startEdit = (review: Review) => {
    setEditingId(review._id);
    setEditRating(review.rating);
    setEditComment(review.comment);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditRating(0);
    setEditComment("");
  };

  const saveEdit = async (reviewId: string) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/user/reviews/${reviewId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating: editRating, comment: editComment }),
      });
      if (!res.ok) throw new Error("Failed to update review");
      setReviews((prev) =>
        prev.map((r) =>
          r._id === reviewId
            ? { ...r, rating: editRating, comment: editComment }
            : r
        )
      );
      setEditingId(null);
      toast.success("Review updated successfully");
    } catch {
      toast.error("Failed to update review");
    } finally {
      setSaving(false);
    }
  };

  const deleteReview = async (reviewId: string) => {
    setDeleting(reviewId);
    try {
      const res = await fetch(`/api/user/reviews/${reviewId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete review");
      setReviews((prev) => prev.filter((r) => r._id !== reviewId));
      toast.success("Review deleted");
    } catch {
      toast.error("Failed to delete review");
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-8">
        <h1 className="font-heading text-3xl font-bold mb-6">My Reviews</h1>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-28 animate-pulse rounded-xl bg-muted"
            />
          ))}
        </div>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-16 text-center">
        <MessageSquare className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
        <h1 className="font-heading text-3xl font-bold mb-2">
          No Reviews Yet
        </h1>
        <p className="text-muted-foreground">
          You haven&apos;t reviewed any cakes yet. Order a cake and share your
          experience!
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <h1 className="font-heading text-3xl font-bold mb-6 flex items-center gap-2">
        <MessageSquare className="h-8 w-8" />
        My Reviews ({reviews.length})
      </h1>

      <div className="space-y-4">
        {reviews.map((review) => (
          <Card key={review._id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{review.cake.name}</CardTitle>
                <span className="text-sm text-muted-foreground">
                  {formatDate(review.createdAt)}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              {editingId === review._id ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Rating</Label>
                    <StarRating
                      rating={editRating}
                      onRate={setEditRating}
                      interactive
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`comment-${review._id}`}>Comment</Label>
                    <Textarea
                      id={`comment-${review._id}`}
                      value={editComment}
                      onChange={(e) => setEditComment(e.target.value)}
                      rows={3}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      disabled={saving}
                      onClick={() => saveEdit(review._id)}
                    >
                      {saving ? "Saving..." : "Save"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={cancelEdit}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <StarRating rating={review.rating} />
                  <p className="mt-2 text-sm">{review.comment}</p>
                  <Separator className="my-3" />
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => startEdit(review)}
                    >
                      <Pencil className="mr-1 h-3 w-3" />
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      disabled={deleting === review._id}
                      onClick={() => deleteReview(review._id)}
                    >
                      <Trash2 className="mr-1 h-3 w-3" />
                      {deleting === review._id ? "Deleting..." : "Delete"}
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
