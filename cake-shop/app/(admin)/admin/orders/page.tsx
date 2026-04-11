import { connectDB } from "@/lib/db";
import { Order } from "@/lib/models/Order";
import { formatPrice, formatDateTime } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";

export const dynamic = "force-dynamic";

const statusColors: Record<string, string> = {
  placed: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  confirmed: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300",
  preparing: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  out_for_delivery: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  delivered: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
};

const STATUSES = [
  "all",
  "placed",
  "confirmed",
  "preparing",
  "out_for_delivery",
  "delivered",
  "cancelled",
];

async function getOrders(status?: string) {
  await connectDB();
  const filter = status && status !== "all" ? { orderStatus: status } : {};
  const orders = await Order.find(filter)
    .sort({ createdAt: -1 })
    .populate("userId", "name email")
    .lean();
  return JSON.parse(JSON.stringify(orders));
}

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const params = await searchParams;
  const status = params.status || "all";
  const orders = await getOrders(status);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-2xl font-bold">Orders</h2>
        <p className="text-muted-foreground">Manage customer orders</p>
      </div>

      {/* Status filter */}
      <div className="flex flex-wrap gap-2">
        {STATUSES.map((s) => (
          <Link
            key={s}
            href={s === "all" ? "/admin/orders" : `/admin/orders?status=${s}`}
          >
            <Badge
              variant={status === s ? "default" : "secondary"}
              className="cursor-pointer capitalize"
            >
              {s.replace(/_/g, " ")}
            </Badge>
          </Link>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order: Record<string, unknown>) => (
                <TableRow key={order._id as string}>
                  <TableCell>
                    <Link
                      href={`/admin/orders/${order._id}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {order.orderId as string}
                    </Link>
                  </TableCell>
                  <TableCell>
                    {(order.userId as Record<string, string>)?.name || "N/A"}
                  </TableCell>
                  <TableCell>{formatDateTime(order.createdAt as string)}</TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={statusColors[order.orderStatus as string] || ""}
                    >
                      {(order.orderStatus as string).replace(/_/g, " ")}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {formatPrice(order.totalAmount as number)}
                  </TableCell>
                </TableRow>
              ))}
              {orders.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    No orders found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
