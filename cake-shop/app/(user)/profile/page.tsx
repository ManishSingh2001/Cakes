"use client";

import { useEffect, useState, useCallback } from "react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { toast } from "sonner";
import { User, Save, Loader2, LogOut, Heart, Star, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface Profile {
  name: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    landmark: string;
  };
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch("/api/user/profile");
      if (!res.ok) throw new Error("Failed to fetch profile");
      const data = await res.json();
      setProfile(data);
    } catch {
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!profile) return;

    setSaving(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });

      if (!res.ok) throw new Error("Failed to update profile");

      const data = await res.json();
      setProfile(data);
      toast.success("Profile updated successfully");
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setProfile((prev) => {
      if (!prev) return prev;
      if (field.startsWith("address.")) {
        const addressField = field.replace("address.", "");
        return {
          ...prev,
          address: { ...prev.address, [addressField]: value },
        };
      }
      return { ...prev, [field]: value };
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-8">
        <h1 className="font-heading text-3xl font-bold mb-6">My Profile</h1>
        <div className="h-96 animate-pulse rounded-xl bg-muted" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-16 text-center">
        <p className="text-muted-foreground">Failed to load profile.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-3xl font-bold flex items-center gap-2">
          <User className="h-8 w-8" />
          My Profile
        </h1>
        <Button
          variant="outline"
          onClick={() => signOut({ callbackUrl: "/" })}
          className="text-destructive hover:text-destructive"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>

      {/* Quick Links */}
      <div className="flex flex-wrap gap-3 mb-6">
        <Link href="/orders">
          <Button variant="outline" size="sm">
            <ShoppingBag className="mr-2 h-4 w-4" />
            My Orders
          </Button>
        </Link>
        <Link href="/profile/wishlist">
          <Button variant="outline" size="sm">
            <Heart className="mr-2 h-4 w-4" />
            Wishlist
          </Button>
        </Link>
        <Link href="/profile/reviews">
          <Button variant="outline" size="sm">
            <Star className="mr-2 h-4 w-4" />
            My Reviews
          </Button>
        </Link>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {/* Personal Info */}
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={profile.name}
                  onChange={(e) => updateField("name", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={profile.email} disabled />
                <p className="text-xs text-muted-foreground">
                  Email cannot be changed
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={profile.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                  placeholder="9876543210"
                />
              </div>
            </CardContent>
          </Card>

          {/* Address */}
          <Card>
            <CardHeader>
              <CardTitle>Address</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="street">Street Address</Label>
                <Input
                  id="street"
                  value={profile.address?.street ?? ""}
                  onChange={(e) => updateField("address.street", e.target.value)}
                  placeholder="123 Baker Street"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={profile.address?.city ?? ""}
                    onChange={(e) =>
                      updateField("address.city", e.target.value)
                    }
                    placeholder="Mumbai"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={profile.address?.state ?? ""}
                    onChange={(e) =>
                      updateField("address.state", e.target.value)
                    }
                    placeholder="Maharashtra"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zipCode">Zip Code</Label>
                  <Input
                    id="zipCode"
                    value={profile.address?.zipCode ?? ""}
                    onChange={(e) =>
                      updateField("address.zipCode", e.target.value)
                    }
                    placeholder="400001"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="landmark">Landmark</Label>
                <Input
                  id="landmark"
                  value={profile.address?.landmark ?? ""}
                  onChange={(e) =>
                    updateField("address.landmark", e.target.value)
                  }
                  placeholder="Near Central Park"
                />
              </div>
            </CardContent>
          </Card>

          <Separator />

          <Button type="submit" size="lg" className="w-full" disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
