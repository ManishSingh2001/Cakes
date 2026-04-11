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
  Wallet,
  Banknote,
  Building2,
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
import { cn } from "@/lib/utils";

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Razorpay: any;
  }
}

interface CartItem {
  _id: string;
  cakeId: string;
  name: string;
  image: string;
  priceOption: { weight: number; sellPrice: number };
  quantity: number;
  cakeMessage?: string;
  addons: { addonId: string; name: string; price: number; quantity: number }[];
}

interface Cart {
  items: CartItem[];
  totalAmount: number;
}

interface Gateway {
  id: string;
  displayName: string;
  instructions?: string;
  accountDetails?: string;
}

const GATEWAY_ICONS: Record<string, typeof CreditCard> = {
  razorpay: Wallet,
  stripe: CreditCard,
  cod: Banknote,
  bank_transfer: Building2,
};

const DELIVERY_SLOTS = [
  { value: "10AM-12PM", label: "10:00 AM - 12:00 PM" },
  { value: "12PM-3PM", label: "12:00 PM - 3:00 PM" },
  { value: "3PM-6PM", label: "3:00 PM - 6:00 PM" },
  { value: "6PM-9PM", label: "6:00 PM - 9:00 PM" },
] as const;

interface SavedAddress {
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

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [gateways, setGateways] = useState<Gateway[]>([]);
  const [selectedGateway, setSelectedGateway] = useState("");
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("new");

  const {
    register,
    handleSubmit,
    setValue,
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
      paymentMethod: "razorpay",
    },
  });

  const fetchCart = useCallback(async () => {
    try {
      const res = await fetch("/api/user/cart");
      if (!res.ok) throw new Error("Failed to fetch cart");
      const data = await res.json();
      setCart(data.cart || { items: [], totalAmount: 0 });
    } catch {
      toast.error("Failed to load cart");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchGateways = useCallback(async () => {
    try {
      const res = await fetch("/api/user/payment/gateways");
      const data = await res.json();
      if (data.success && data.gateways?.length > 0) {
        setGateways(data.gateways);
        setSelectedGateway(data.gateways[0].id);
      }
    } catch {
      setGateways([{ id: "razorpay", displayName: "Razorpay" }]);
      setSelectedGateway("razorpay");
    }
  }, []);

  const fetchAddresses = useCallback(async () => {
    try {
      const res = await fetch("/api/user/profile");
      if (!res.ok) return;
      const data = await res.json();
      const addresses = data.user?.addresses || [];
      setSavedAddresses(addresses);
      // Auto-select default address
      const defaultAddr = addresses.find((a: SavedAddress) => a.isDefault) || addresses[0];
      if (defaultAddr) {
        setSelectedAddressId(defaultAddr._id || "0");
        fillAddress(defaultAddr);
      }
    } catch {
      // ignore
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fillAddress = (addr: SavedAddress) => {
    setValue("deliveryAddress.fullName", addr.fullName);
    setValue("deliveryAddress.phone", addr.phone);
    setValue("deliveryAddress.street", addr.street);
    setValue("deliveryAddress.city", addr.city);
    setValue("deliveryAddress.state", addr.state);
    setValue("deliveryAddress.zipCode", addr.zipCode);
    setValue("deliveryAddress.landmark", addr.landmark || "");
  };

  const handleAddressSelect = (value: string) => {
    setSelectedAddressId(value);
    if (value === "new") {
      setValue("deliveryAddress.fullName", "");
      setValue("deliveryAddress.phone", "");
      setValue("deliveryAddress.street", "");
      setValue("deliveryAddress.city", "");
      setValue("deliveryAddress.state", "");
      setValue("deliveryAddress.zipCode", "");
      setValue("deliveryAddress.landmark", "");
    } else {
      const addr = savedAddresses.find((a) => a._id === value) || savedAddresses[parseInt(value)];
      if (addr) fillAddress(addr);
    }
  };

  useEffect(() => {
    fetchCart();
    fetchGateways();
    fetchAddresses();
  }, [fetchCart, fetchGateways, fetchAddresses]);

  // Load Razorpay script if needed
  useEffect(() => {
    if (gateways.some((g) => g.id === "razorpay")) {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      document.body.appendChild(script);
      return () => {
        document.body.removeChild(script);
      };
    }
  }, [gateways]);

  const getItemSubtotal = (item: CartItem) => {
    const addonsTotal = (item.addons || []).reduce(
      (sum, a) => sum + a.price * a.quantity,
      0
    );
    return item.priceOption.sellPrice * item.quantity + addonsTotal;
  };

  const subtotal = cart
    ? cart.items.reduce((sum, item) => sum + getItemSubtotal(item), 0)
    : 0;
  const deliveryCharge = subtotal >= 500 ? 0 : 50;
  const grandTotal = subtotal + deliveryCharge;

  const onSubmit = async (formData: CheckoutInput) => {
    if (!selectedGateway) {
      toast.error("Please select a payment method");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/user/payment/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          paymentMethod: selectedGateway,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        toast.error(err?.message || "Failed to create payment");
        return;
      }

      const result = await res.json();

      // --- RAZORPAY ---
      if (result.gateway === "razorpay") {
        const options = {
          key: result.key,
          amount: result.amount,
          currency: result.currency,
          name: "Sweet Delights Bakery",
          description: "Cake Order Payment",
          order_id: result.razorpayOrderId,
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
                  gateway: "razorpay",
                  orderId: result.orderId,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_signature: response.razorpay_signature,
                }),
              });
              if (!verifyRes.ok) throw new Error("Verification failed");
              toast.success("Payment successful!");
              router.push(`/order-success?orderId=${result.orderId}&orderNumber=${result.orderNumber}`);
            } catch {
              toast.error("Payment verification failed. Contact support.");
            }
          },
          prefill: {
            name: formData.deliveryAddress.fullName,
            contact: formData.deliveryAddress.phone,
          },
          theme: { color: "#8B4513" },
        };

        const rzp = new window.Razorpay(options);
        rzp.on(
          "payment.failed",
          (response: { error: { description: string } }) => {
            toast.error(response.error.description || "Payment failed");
          }
        );
        rzp.open();
        return;
      }

      // --- STRIPE ---
      if (result.gateway === "stripe") {
        // For Stripe Elements integration, you'd use @stripe/stripe-js
        // For now, show a message that Stripe is being processed
        toast.info("Redirecting to Stripe...");
        // In production, use Stripe.js with result.clientSecret
        router.push(`/order-success?orderId=${result.orderId}&orderNumber=${result.orderNumber}`);
        return;
      }

      // --- COD / BANK TRANSFER ---
      if (result.gateway === "cod" || result.gateway === "bank_transfer") {
        toast.success(result.message);
        router.push(`/order-success?orderId=${result.orderId}&orderNumber=${result.orderNumber}`);
        return;
      }
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
        <h1 className="font-heading text-3xl font-bold mb-2">Cart is Empty</h1>
        <p className="text-muted-foreground">
          Add items to your cart before checking out.
        </p>
      </div>
    );
  }

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];

  const selectedGatewayData = gateways.find((g) => g.id === selectedGateway);
  const isOnlinePayment =
    selectedGateway === "razorpay" || selectedGateway === "stripe";

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      <h1 className="font-heading text-3xl font-bold mb-6">Checkout</h1>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-6 lg:grid-cols-3">
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
                {savedAddresses.length > 0 && (
                  <div className="space-y-2">
                    <Label>Saved Addresses</Label>
                    <select
                      value={selectedAddressId}
                      onChange={(e) => handleAddressSelect(e.target.value)}
                      className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                    >
                      {savedAddresses.map((addr, idx) => (
                        <option key={addr._id || idx} value={addr._id || String(idx)}>
                          {addr.label} — {addr.street}, {addr.city}{addr.isDefault ? " (Default)" : ""}
                        </option>
                      ))}
                      <option value="new">+ Enter new address</option>
                    </select>
                  </div>
                )}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input id="fullName" placeholder="John Doe" {...register("deliveryAddress.fullName")} />
                    {errors.deliveryAddress?.fullName && <p className="text-xs text-destructive">{errors.deliveryAddress.fullName.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" placeholder="9876543210" {...register("deliveryAddress.phone")} />
                    {errors.deliveryAddress?.phone && <p className="text-xs text-destructive">{errors.deliveryAddress.phone.message}</p>}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="street">Street Address</Label>
                  <Input id="street" placeholder="123 Baker Street" {...register("deliveryAddress.street")} />
                  {errors.deliveryAddress?.street && <p className="text-xs text-destructive">{errors.deliveryAddress.street.message}</p>}
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input id="city" placeholder="Mumbai" {...register("deliveryAddress.city")} />
                    {errors.deliveryAddress?.city && <p className="text-xs text-destructive">{errors.deliveryAddress.city.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input id="state" placeholder="Maharashtra" {...register("deliveryAddress.state")} />
                    {errors.deliveryAddress?.state && <p className="text-xs text-destructive">{errors.deliveryAddress.state.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zipCode">Zip Code</Label>
                    <Input id="zipCode" placeholder="400001" {...register("deliveryAddress.zipCode")} />
                    {errors.deliveryAddress?.zipCode && <p className="text-xs text-destructive">{errors.deliveryAddress.zipCode.message}</p>}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="landmark">Landmark (Optional)</Label>
                  <Input id="landmark" placeholder="Near Central Park" {...register("deliveryAddress.landmark")} />
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
                    <Input id="deliveryDate" type="date" min={minDate} {...register("deliveryDate")} />
                    {errors.deliveryDate && <p className="text-xs text-destructive">{errors.deliveryDate.message}</p>}
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
                        <option key={slot.value} value={slot.value}>{slot.label}</option>
                      ))}
                    </select>
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
                <Textarea placeholder="Any special instructions for your order..." rows={3} {...register("specialInstructions")} />
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {gateways.map((gw) => {
                  const Icon = GATEWAY_ICONS[gw.id] || CreditCard;
                  const isSelected = selectedGateway === gw.id;

                  return (
                    <div
                      key={gw.id}
                      onClick={() => setSelectedGateway(gw.id)}
                      className={cn(
                        "flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors",
                        isSelected
                          ? "border-primary bg-primary/5 ring-1 ring-primary"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <div className={cn(
                        "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2",
                        isSelected ? "border-primary" : "border-muted-foreground/40"
                      )}>
                        {isSelected && <div className="h-2.5 w-2.5 rounded-full bg-primary" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          <span className="font-medium">{gw.displayName}</span>
                        </div>
                        {gw.instructions && isSelected && (
                          <p className="mt-1 text-sm text-muted-foreground">
                            {gw.instructions}
                          </p>
                        )}
                        {gw.accountDetails && isSelected && (
                          <pre className="mt-2 whitespace-pre-wrap rounded bg-muted p-2 text-xs">
                            {gw.accountDetails}
                          </pre>
                        )}
                      </div>
                    </div>
                  );
                })}
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
                {cart.items.map((item, index) => (
                  <div key={item._id || index} className="flex gap-3">
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md bg-muted">
                      {item.image ? (
                        <Image src={item.image} alt={item.name} fill className="object-cover" sizes="56px" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-[10px] text-muted-foreground">No Image</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium line-clamp-1">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.priceOption.weight} kg x {item.quantity}</p>
                    </div>
                    <span className="text-sm font-medium">{formatPrice(getItemSubtotal(item))}</span>
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
                    <span>{deliveryCharge === 0 ? <span className="text-green-600">FREE</span> : formatPrice(deliveryCharge)}</span>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>{formatPrice(grandTotal)}</span>
                </div>

                <Button type="submit" className="w-full" size="lg" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : isOnlinePayment ? (
                    <>
                      <CreditCard className="mr-2 h-4 w-4" />
                      Pay {formatPrice(grandTotal)}
                    </>
                  ) : (
                    <>
                      {selectedGateway === "cod" ? (
                        <Banknote className="mr-2 h-4 w-4" />
                      ) : (
                        <Building2 className="mr-2 h-4 w-4" />
                      )}
                      Place Order
                    </>
                  )}
                </Button>

                {selectedGatewayData && !isOnlinePayment && (
                  <p className="text-xs text-center text-muted-foreground">
                    {selectedGateway === "cod"
                      ? "You will pay when your order is delivered"
                      : "Complete the bank transfer after placing the order"}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
