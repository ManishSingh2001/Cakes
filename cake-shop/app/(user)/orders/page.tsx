import Link from "next/link";
import { cookies } from "next/headers";
import { Package, ArrowRight } from "lucide-react";
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

interface Order {
  _id: string;
  orderId: string;
  createdAt: string;
  orderStatus: string;
  totalAmount: number;
  items: { _id: string }[];
}

const STATUS_COLORS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  placed: "secondary",
  confirmed: "default",
  preparing: "default",
  out_for_delivery: "default",
  delivered: "default",
  cancelled: "destructive",
};

const STATUS_LABELS: Record<string, string> = {
  placed: "Placed",
  confirmed: "Confirmed",
  preparing: "Preparing",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

async function getOrders(): Promise<Order[]> {
  const cookieStore = await cookies();
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/user/orders`, {
    headers: {
      Cookie: cookieStore.toString(),
    },
    cache: "no-store",
  });

  if (!res.ok) return [];
  const data = await res.json();
  return data.orders ?? data ?? [];
}

export default async function OrdersPage() {
  const orders = await getOrders();

  if (orders.length === 0) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-16 text-center">
        <Package className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
        <h1 className="font-heading text-3xl font-bold mb-2">No Orders Yet</h1>
        <p className="text-muted-foreground mb-6">
          You haven&apos;t placed any orders yet. Start exploring our delicious
          cakes!
        </p>
        <Button render={<Link href="/" />}>Browse Cakes</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <h1 className="font-heading text-3xl font-bold mb-6">My Orders</h1>

      <div className="space-y-4">
        {orders.map((order) => (
          <Link key={order._id} href={`/orders/${order._id}`}>
            <Card className="transition-shadow hover:shadow-md">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="font-mono text-sm">
                    {order.orderId}
                  </CardTitle>
                  <Badge variant={STATUS_COLORS[order.orderStatus] ?? "outline"}>
                    {STATUS_LABELS[order.orderStatus] ?? order.orderStatus}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>{formatDate(order.createdAt)}</span>
                  <span>
                    {order.items.length}{" "}
                    {order.items.length === 1 ? "item" : "items"}
                  </span>
                </div>
                <Separator className="my-3" />
                <div className="flex items-center justify-between">
                  <span className="font-bold text-lg">
                    {formatPrice(order.totalAmount)}
                  </span>
                  <span className="flex items-center gap-1 text-sm text-primary">
                    View Details <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
