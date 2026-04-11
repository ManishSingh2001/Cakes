"use client";

import { useEffect, useState, useCallback } from "react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { toast } from "sonner";
import {
  User,
  Save,
  Loader2,
  LogOut,
  Heart,
  Star,
  ShoppingBag,
  Plus,
  Trash2,
  MapPin,
  Pencil,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Address {
  _id?: string;
  label: string;
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  landmark: string;
  isDefault: boolean;
}

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
  addresses: Address[];
}

const EMPTY_ADDRESS: Address = {
  label: "Home",
  fullName: "",
  phone: "",
  street: "",
  city: "",
  state: "",
  zipCode: "",
  landmark: "",
  isDefault: false,
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Address dialog
  const [addressDialogOpen, setAddressDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address>(EMPTY_ADDRESS);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch("/api/user/profile");
      if (!res.ok) throw new Error("Failed to fetch profile");
      const data = await res.json();
      setProfile({
        ...data.user,
        addresses: data.user.addresses || [],
      });
    } catch {
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleSubmitProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!profile) return;

    setSaving(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profile.name,
          phone: profile.phone,
        }),
      });

      if (!res.ok) throw new Error("Failed to update profile");
      const data = await res.json();
      setProfile({ ...profile, ...data.user, addresses: data.user.addresses || profile.addresses });
      toast.success("Profile updated");
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const openNewAddress = () => {
    setEditingAddress({
      ...EMPTY_ADDRESS,
      fullName: profile?.name || "",
      phone: profile?.phone || "",
    });
    setEditingIndex(null);
    setAddressDialogOpen(true);
  };

  const openEditAddress = (index: number) => {
    if (!profile) return;
    setEditingAddress({ ...profile.addresses[index] });
    setEditingIndex(index);
    setAddressDialogOpen(true);
  };

  const saveAddress = async () => {
    if (!profile) return;
    if (!editingAddress.fullName || !editingAddress.phone || !editingAddress.street || !editingAddress.city || !editingAddress.state || !editingAddress.zipCode) {
      toast.error("Please fill all required fields");
      return;
    }

    const addresses = [...profile.addresses];

    // If setting as default, unset others
    if (editingAddress.isDefault) {
      addresses.forEach((a) => (a.isDefault = false));
    }

    if (editingIndex !== null) {
      addresses[editingIndex] = editingAddress;
    } else {
      // First address is default
      if (addresses.length === 0) {
        editingAddress.isDefault = true;
      }
      addresses.push(editingAddress);
    }

    setSaving(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ addresses }),
      });
      const data = await res.json();
      if (!res.ok) {
        const errMsg = data.errors
          ? Object.entries(data.errors).map(([k, v]) => `${k}: ${v}`).join(", ")
          : data.message || "Failed to save address";
        toast.error(errMsg);
        return;
      }
      setProfile({ ...profile, ...data.user, addresses: data.user.addresses || [] });
      setAddressDialogOpen(false);
      toast.success(editingIndex !== null ? "Address updated" : "Address added");
    } catch {
      toast.error("Failed to save address");
    } finally {
      setSaving(false);
    }
  };

  const deleteAddress = async (index: number) => {
    if (!profile || !confirm("Delete this address?")) return;
    const addresses = profile.addresses.filter((_, i) => i !== index);
    // If deleted address was default, make first one default
    if (profile.addresses[index].isDefault && addresses.length > 0) {
      addresses[0].isDefault = true;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ addresses }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setProfile({ ...profile, ...data.user, addresses: data.user.addresses || [] });
      toast.success("Address deleted");
    } catch {
      toast.error("Failed to delete address");
    } finally {
      setSaving(false);
    }
  };

  const setDefaultAddress = async (index: number) => {
    if (!profile) return;
    const addresses = profile.addresses.map((a, i) => ({
      ...a,
      isDefault: i === index,
    }));

    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ addresses }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setProfile({ ...profile, ...data.user, addresses: data.user.addresses || [] });
      toast.success("Default address updated");
    } catch {
      toast.error("Failed to update");
    }
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

      {/* Personal Info */}
      <form onSubmit={handleSubmitProfile}>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={profile.email} disabled />
              <p className="text-xs text-muted-foreground">Email cannot be changed</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={profile.phone || ""}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                placeholder="9876543210"
              />
            </div>
            <Button type="submit" disabled={saving}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save Changes
            </Button>
          </CardContent>
        </Card>
      </form>

      {/* Saved Addresses */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Saved Addresses
          </CardTitle>
          <Button variant="outline" size="sm" onClick={openNewAddress}>
            <Plus className="mr-1 h-4 w-4" />
            Add Address
          </Button>
        </CardHeader>
        <CardContent>
          {profile.addresses.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <MapPin className="mx-auto mb-2 h-8 w-8" />
              <p>No saved addresses yet</p>
              <p className="text-sm">Add an address for faster checkout</p>
            </div>
          ) : (
            <div className="space-y-3">
              {profile.addresses.map((addr, index) => (
                <div
                  key={addr._id || index}
                  className="flex items-start gap-3 rounded-lg border p-4"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold">{addr.label}</span>
                      {addr.isDefault && (
                        <Badge variant="secondary" className="text-xs">Default</Badge>
                      )}
                    </div>
                    <p className="text-sm font-medium">{addr.fullName}</p>
                    <p className="text-sm text-muted-foreground">
                      {addr.street}, {addr.city}, {addr.state} - {addr.zipCode}
                    </p>
                    {addr.landmark && (
                      <p className="text-sm text-muted-foreground">Landmark: {addr.landmark}</p>
                    )}
                    <p className="text-sm text-muted-foreground">Phone: {addr.phone}</p>
                  </div>
                  <div className="flex flex-col gap-1">
                    {!addr.isDefault && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        title="Set as default"
                        onClick={() => setDefaultAddress(index)}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => openEditAddress(index)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => deleteAddress(index)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Address Dialog */}
      <Dialog open={addressDialogOpen} onOpenChange={setAddressDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingIndex !== null ? "Edit Address" : "Add New Address"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Label</Label>
                <Input
                  value={editingAddress.label}
                  onChange={(e) => setEditingAddress({ ...editingAddress, label: e.target.value })}
                  placeholder="Home, Office, etc."
                />
              </div>
              <div className="flex items-end gap-2">
                <label className="flex items-center gap-2 cursor-pointer text-sm">
                  <input
                    type="checkbox"
                    checked={editingAddress.isDefault}
                    onChange={(e) => setEditingAddress({ ...editingAddress, isDefault: e.target.checked })}
                    className="rounded"
                  />
                  Set as default
                </label>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Full Name *</Label>
                <Input
                  value={editingAddress.fullName}
                  onChange={(e) => setEditingAddress({ ...editingAddress, fullName: e.target.value })}
                  placeholder="John Doe"
                />
              </div>
              <div>
                <Label>Phone *</Label>
                <Input
                  value={editingAddress.phone}
                  onChange={(e) => setEditingAddress({ ...editingAddress, phone: e.target.value })}
                  placeholder="9876543210"
                />
              </div>
            </div>
            <div>
              <Label>Street Address *</Label>
              <Input
                value={editingAddress.street}
                onChange={(e) => setEditingAddress({ ...editingAddress, street: e.target.value })}
                placeholder="123 Baker Street"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <Label>City *</Label>
                <Input
                  value={editingAddress.city}
                  onChange={(e) => setEditingAddress({ ...editingAddress, city: e.target.value })}
                  placeholder="Mumbai"
                />
              </div>
              <div>
                <Label>State *</Label>
                <Input
                  value={editingAddress.state}
                  onChange={(e) => setEditingAddress({ ...editingAddress, state: e.target.value })}
                  placeholder="Maharashtra"
                />
              </div>
              <div>
                <Label>Zip Code *</Label>
                <Input
                  value={editingAddress.zipCode}
                  onChange={(e) => setEditingAddress({ ...editingAddress, zipCode: e.target.value })}
                  placeholder="400001"
                />
              </div>
            </div>
            <div>
              <Label>Landmark</Label>
              <Input
                value={editingAddress.landmark}
                onChange={(e) => setEditingAddress({ ...editingAddress, landmark: e.target.value })}
                placeholder="Near Central Park"
              />
            </div>
            <Button onClick={saveAddress} className="w-full" disabled={saving}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              {editingIndex !== null ? "Update Address" : "Save Address"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
