"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  MapPin,
  Calendar,
  Clock,
  FileText,
  CreditCard,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";
import {
  checkoutSchema,
  type CheckoutInput,
} from "@/lib/validations/order.schema";

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Razorpay: any;
  }
}

interface CartItem {
  _id: string;
  cake: {
    _id: string;
    name: string;
    images: { url: string; alt: string }[];
  };
  weight: number;
  price: number;
  quantity: number;
  cakeMessage?: string;
  addons: { name: string; price: number }[];
}

interface Cart {
  items: CartItem[];
}

const DELIVERY_SLOTS = [
  { value: "10AM-12PM", label: "10:00 AM - 12:00 PM" },
  { value: "12PM-3PM", label: "12:00 PM - 3:00 PM" },
  { value: "3PM-6PM", label: "3:00 PM - 6:00 PM" },
  { value: "6PM-9PM", label: "6:00 PM - 9:00 PM" },
] as const;

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutInput>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      deliveryAddress: {
        fullName: "",
        phone: "",
        street: "",
        city: "",
        state: "",
        zipCode: "",
        landmark: "",
      },
      deliveryDate: "",
      deliverySlot: "10AM-12PM",
      specialInstructions: "",
    },
  });

  const fetchCart = useCallback(async () => {
    try {
      const res = await fetch("/api/user/cart");
      if (!res.ok) throw new Error("Failed to fetch cart");
      const data = await res.json();
      setCart(data);
    } catch {
      toast.error("Failed to load cart");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const getItemSubtotal = (item: CartItem) => {
    const addonsTotal = item.addons.reduce((sum, a) => sum + a.price, 0);
    return (item.price + addonsTotal) * item.quantity;
  };

  const subtotal = cart
    ? cart.items.reduce((sum, item) => sum + getItemSubtotal(item), 0)
    : 0;
  const deliveryCharge = subtotal >= 500 ? 0 : 50;
  const grandTotal = subtotal + deliveryCharge;

  const onSubmit = async (formData: CheckoutInput) => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/user/payment/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to create payment");

      const { razorpayOrderId, amount, currency, key, orderId } =
        await res.json();

      const options = {
        key,
        amount,
        currency,
        name: "Sweet Delights Bakery",
        description: "Cake Order Payment",
        order_id: razorpayOrderId,
        handler: async (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) => {
          try {
            const verifyRes = await fetch("/api/user/payment/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                orderId,
              }),
            });

            if (!verifyRes.ok) throw new Error("Payment verification failed");

            toast.success("Payment successful!");
            router.push(`/order-success?orderId=${orderId}`);
          } catch {
            toast.error("Payment verification failed. Please contact support.");
          }
        },
        prefill: {
          name: formData.deliveryAddress.fullName,
          contact: formData.deliveryAddress.phone,
        },
        theme: {
          color: "#8B4513",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on(
        "payment.failed",
        (response: { error: { description: string } }) => {
          toast.error(response.error.description || "Payment failed");
        }
      );
      rzp.open();
    } catch {
      toast.error("Failed to initiate payment. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto max-w-5xl px-4 py-8">
        <h1 className="font-heading text-3xl font-bold mb-6">Checkout</h1>
        <div className="h-96 animate-pulse rounded-xl bg-muted" />
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container mx-auto max-w-5xl px-4 py-16 text-center">
        <h1 className="font-heading text-3xl font-bold mb-2">
          Cart is Empty
        </h1>
        <p className="text-muted-foreground">
          Add items to your cart before checking out.
        </p>
      </div>
    );
  }

  // Minimum delivery date is tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      <h1 className="font-heading text-3xl font-bold mb-6">Checkout</h1>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Form Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Delivery Address
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      placeholder="John Doe"
                      {...register("deliveryAddress.fullName")}
                    />
                    {errors.deliveryAddress?.fullName && (
                      <p className="text-xs text-destructive">
                        {errors.deliveryAddress.fullName.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      placeholder="9876543210"
                      {...register("deliveryAddress.phone")}
                    />
                    {errors.deliveryAddress?.phone && (
                      <p className="text-xs text-destructive">
                        {errors.deliveryAddress.phone.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="street">Street Address</Label>
                  <Input
                    id="street"
                    placeholder="123 Baker Street"
                    {...register("deliveryAddress.street")}
                  />
                  {errors.deliveryAddress?.street && (
                    <p className="text-xs text-destructive">
                      {errors.deliveryAddress.street.message}
                    </p>
                  )}
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      placeholder="Mumbai"
                      {...register("deliveryAddress.city")}
                    />
                    {errors.deliveryAddress?.city && (
                      <p className="text-xs text-destructive">
                        {errors.deliveryAddress.city.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      placeholder="Maharashtra"
                      {...register("deliveryAddress.state")}
                    />
                    {errors.deliveryAddress?.state && (
                      <p className="text-xs text-destructive">
                        {errors.deliveryAddress.state.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zipCode">Zip Code</Label>
                    <Input
                      id="zipCode"
                      placeholder="400001"
                      {...register("deliveryAddress.zipCode")}
                    />
                    {errors.deliveryAddress?.zipCode && (
                      <p className="text-xs text-destructive">
                        {errors.deliveryAddress.zipCode.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="landmark">Landmark (Optional)</Label>
                  <Input
                    id="landmark"
                    placeholder="Near Central Park"
                    {...register("deliveryAddress.landmark")}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Delivery Schedule */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Delivery Schedule
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="deliveryDate">Delivery Date</Label>
                    <Input
                      id="deliveryDate"
                      type="date"
                      min={minDate}
                      {...register("deliveryDate")}
                    />
                    {errors.deliveryDate && (
                      <p className="text-xs text-destructive">
                        {errors.deliveryDate.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="deliverySlot" className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Delivery Slot
                    </Label>
                    <select
                      id="deliverySlot"
                      className="flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                      {...register("deliverySlot")}
                    >
                      {DELIVERY_SLOTS.map((slot) => (
                        <option key={slot.value} value={slot.value}>
                          {slot.label}
                        </option>
                      ))}
                    </select>
                    {errors.deliverySlot && (
                      <p className="text-xs text-destructive">
                        {errors.deliverySlot.message}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Special Instructions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Special Instructions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Any special instructions for your order..."
                  rows={3}
                  {...register("specialInstructions")}
                />
              </CardContent>
            </Card>
          </div>

          {/* Order Summary Sidebar */}
          <div>
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {cart.items.map((item) => (
                  <div key={item._id} className="flex gap-3">
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md bg-muted">
                      {item.cake.images[0] ? (
                        <Image
                          src={item.cake.images[0].url}
                          alt={item.cake.name}
                          fill
                          className="object-cover"
                          sizes="56px"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-[10px] text-muted-foreground">
                          No Image
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium line-clamp-1">
                        {item.cake.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.weight} kg x {item.quantity}
                      </p>
                    </div>
                    <span className="text-sm font-medium">
                      {formatPrice(getItemSubtotal(item))}
                    </span>
                  </div>
                ))}

                <Separator />

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery</span>
                    <span>
                      {deliveryCharge === 0 ? (
                        <span className="text-green-600">FREE</span>
                      ) : (
                        formatPrice(deliveryCharge)
                      )}
                    </span>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>{formatPrice(grandTotal)}</span>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-4 w-4" />
                      Pay {formatPrice(grandTotal)}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
