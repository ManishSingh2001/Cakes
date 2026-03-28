import { cookies } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  MapPin,
  CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatPrice, formatDate } from "@/lib/utils";

interface OrderItem {
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

interface Order {
  _id: string;
  orderId: string;
  createdAt: string;
  orderStatus: string;
  totalAmount: number;
  deliveryCharge: number;
  items: OrderItem[];
  deliveryAddress: {
    fullName: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    landmark?: string;
  };
  deliveryDate: string;
  deliverySlot: string;
  payment: {
    method: string;
    status: string;
    transactionId?: string;
  };
  specialInstructions?: string;
}

const ORDER_STATUSES = [
  { key: "placed", label: "Placed" },
  { key: "confirmed", label: "Confirmed" },
  { key: "preparing", label: "Preparing" },
  { key: "out_for_delivery", label: "Out for Delivery" },
  { key: "delivered", label: "Delivered" },
];

async function getOrder(id: string): Promise<Order | null> {
  const cookieStore = await cookies();
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/user/orders/${id}`,
    {
      headers: {
        Cookie: cookieStore.toString(),
      },
      cache: "no-store",
    }
  );

  if (!res.ok) return null;
  const data = await res.json();
  return data.order ?? data ?? null;
}

function StatusTimeline({ currentStatus }: { currentStatus: string }) {
  const currentIndex = ORDER_STATUSES.findIndex(
    (s) => s.key === currentStatus
  );
  const isCancelled = currentStatus === "cancelled";

  return (
    <div className="flex items-center justify-between">
      {ORDER_STATUSES.map((status, index) => {
        const isCompleted = !isCancelled && index <= currentIndex;
        const isCurrent = !isCancelled && index === currentIndex;

        return (
          <div key={status.key} className="flex flex-col items-center flex-1">
            <div className="flex items-center w-full">
              {index > 0 && (
                <div
                  className={`h-0.5 flex-1 ${
                    isCompleted ? "bg-green-500" : "bg-muted"
                  }`}
                />
              )}
              <div
                className={`shrink-0 rounded-full ${
                  isCurrent
                    ? "ring-2 ring-green-500 ring-offset-2"
                    : ""
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="h-6 w-6 text-green-500" />
                ) : (
                  <Circle className="h-6 w-6 text-muted-foreground" />
                )}
              </div>
              {index < ORDER_STATUSES.length - 1 && (
                <div
                  className={`h-0.5 flex-1 ${
                    !isCancelled && index < currentIndex
                      ? "bg-green-500"
                      : "bg-muted"
                  }`}
                />
              )}
            </div>
            <span
              className={`mt-2 text-xs text-center ${
                isCompleted
                  ? "font-medium text-foreground"
                  : "text-muted-foreground"
              }`}
            >
              {status.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getOrder(id);

  if (!order) {
    notFound();
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <Button
        variant="ghost"
        size="sm"
        className="mb-4"
        nativeButton={false}
        render={<Link href="/orders" />}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Orders
      </Button>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-3xl font-bold">Order Details</h1>
          <p className="text-muted-foreground font-mono">{order.orderId}</p>
        </div>
        <Badge
          variant={
            order.orderStatus === "cancelled"
              ? "destructive"
              : order.orderStatus === "delivered"
              ? "default"
              : "secondary"
          }
        >
          {order.orderStatus === "cancelled"
            ? "Cancelled"
            : ORDER_STATUSES.find((s) => s.key === order.orderStatus)?.label ??
              order.orderStatus}
        </Badge>
      </div>

      <div className="space-y-6">
        {/* Status Timeline */}
        {order.orderStatus !== "cancelled" && (
          <Card>
            <CardHeader>
              <CardTitle>Order Status</CardTitle>
            </CardHeader>
            <CardContent>
              <StatusTimeline currentStatus={order.orderStatus} />
            </CardContent>
          </Card>
        )}

        {order.orderStatus === "cancelled" && (
          <Card>
            <CardContent className="py-6 text-center">
              <Badge variant="destructive" className="text-base px-4 py-1">
                Order Cancelled
              </Badge>
            </CardContent>
          </Card>
        )}

        {/* Order Items */}
        <Card>
          <CardHeader>
            <CardTitle>
              Items ({order.items.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {order.items.map((item) => {
              const addonsTotal = item.addons.reduce(
                (sum, a) => sum + a.price,
                0
              );
              const itemTotal = (item.price + addonsTotal) * item.quantity;

              return (
                <div key={item._id} className="flex gap-4">
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-muted">
                    {item.cake.images[0] ? (
                      <Image
                        src={item.cake.images[0].url}
                        alt={item.cake.images[0].alt || item.cake.name}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                        No Image
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold">{item.cake.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {item.weight} kg x {item.quantity} @ {formatPrice(item.price)}
                    </p>
                    {item.cakeMessage && (
                      <p className="text-xs text-muted-foreground">
                        Message: &quot;{item.cakeMessage}&quot;
                      </p>
                    )}
                    {item.addons.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {item.addons.map((addon, i) => (
                          <Badge key={i} variant="secondary">
                            {addon.name} (+{formatPrice(addon.price)})
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <span className="font-semibold shrink-0">
                    {formatPrice(itemTotal)}
                  </span>
                </div>
              );
            })}

            <Separator />

            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>
                  {formatPrice(order.totalAmount - (order.deliveryCharge ?? 0))}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Delivery</span>
                <span>
                  {order.deliveryCharge === 0 ? (
                    <span className="text-green-600">FREE</span>
                  ) : (
                    formatPrice(order.deliveryCharge)
                  )}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>{formatPrice(order.totalAmount)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Delivery Address */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Delivery Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p className="font-medium">{order.deliveryAddress.fullName}</p>
            <p>{order.deliveryAddress.street}</p>
            <p>
              {order.deliveryAddress.city}, {order.deliveryAddress.state}{" "}
              {order.deliveryAddress.zipCode}
            </p>
            {order.deliveryAddress.landmark && (
              <p className="text-muted-foreground">
                Landmark: {order.deliveryAddress.landmark}
              </p>
            )}
            <p>Phone: {order.deliveryAddress.phone}</p>
            <Separator />
            <div className="flex gap-6">
              <div>
                <span className="text-muted-foreground">Delivery Date: </span>
                <span className="font-medium">
                  {formatDate(order.deliveryDate)}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Slot: </span>
                <span className="font-medium">{order.deliverySlot}</span>
              </div>
            </div>
            {order.specialInstructions && (
              <>
                <Separator />
                <div>
                  <span className="text-muted-foreground">
                    Special Instructions:{" "}
                  </span>
                  <span>{order.specialInstructions}</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Payment Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Information
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Method</span>
              <span className="capitalize font-medium">
                {order.payment.method}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status</span>
              <Badge
                variant={
                  order.payment.status === "completed"
                    ? "default"
                    : order.payment.status === "failed"
                    ? "destructive"
                    : "secondary"
                }
              >
                {order.payment.status}
              </Badge>
            </div>
            {order.payment.transactionId && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Transaction ID</span>
                <span className="font-mono text-xs">
                  {order.payment.transactionId}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Amount</span>
              <span className="font-bold">{formatPrice(order.totalAmount)}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
