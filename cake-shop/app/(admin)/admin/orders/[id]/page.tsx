import { connectDB } from "@/lib/db";
import { Order } from "@/lib/models/Order";
import { formatPrice, formatDate, formatDateTime } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { notFound } from "next/navigation";
import { OrderStatusUpdater } from "./status-updater";
import { PaymentUpdater } from "./payment-updater";

export const dynamic = "force-dynamic";

async function getOrder(id: string) {
  await connectDB();
  const order = await Order.findById(id)
    .populate("userId", "name email phone")
    .lean();
  if (!order) return null;
  return JSON.parse(JSON.stringify(order));
}

const statusColors: Record<string, string> = {
  placed: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  confirmed: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300",
  preparing: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  out_for_delivery: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  delivered: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
};

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getOrder(id);

  if (!order) notFound();

  const deliveryAddress = order.deliveryAddress as Record<string, string>;
  const payment = order.payment as Record<string, string>;
  const items = order.items as Record<string, unknown>[];
  const statusHistory = order.statusHistory as Record<string, unknown>[];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-2xl font-bold">
            Order {order.orderId}
          </h2>
          <p className="text-muted-foreground">
            Placed on {formatDateTime(order.createdAt)}
          </p>
        </div>
        <Badge
          variant="secondary"
          className={`text-sm ${statusColors[order.orderStatus] || ""}`}
        >
          {(order.orderStatus as string).replace(/_/g, " ")}
        </Badge>
      </div>

      {/* Status Update */}
      <OrderStatusUpdater orderId={id} currentStatus={order.orderStatus} />

      <div className="grid gap-6 md:grid-cols-2">
        {/* Items */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Order Items</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Weight</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{item.name as string}</p>
                        {Boolean(item.cakeMessage) && (
                          <p className="text-sm text-muted-foreground">
                            Message: {item.cakeMessage as string}
                          </p>
                        )}
                        {(item.addons as Record<string, unknown>[])?.length > 0 && (
                          <p className="text-sm text-muted-foreground">
                            Addons:{" "}
                            {(item.addons as Record<string, string>[])
                              .map((a) => a.name)
                              .join(", ")}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {(item.priceOption as Record<string, number>)?.weight} kg
                    </TableCell>
                    <TableCell>{item.quantity as number}</TableCell>
                    <TableCell className="text-right">
                      {formatPrice(item.itemTotal as number)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <Separator className="my-4" />

            <div className="space-y-1 text-right">
              <p className="text-sm">
                Subtotal: {formatPrice(order.subtotal)}
              </p>
              <p className="text-sm">
                Delivery: {formatPrice(order.deliveryCharge)}
              </p>
              {order.discount > 0 && (
                <p className="text-sm text-green-600">
                  Discount: -{formatPrice(order.discount)}
                </p>
              )}
              <p className="text-lg font-bold">
                Total: {formatPrice(order.totalAmount)}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Delivery Address */}
        <Card>
          <CardHeader>
            <CardTitle>Delivery Address</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <p className="font-medium">{deliveryAddress.fullName}</p>
            <p>{deliveryAddress.street}</p>
            <p>
              {deliveryAddress.city}, {deliveryAddress.state}{" "}
              {deliveryAddress.zipCode}
            </p>
            <p>Phone: {deliveryAddress.phone}</p>
            {deliveryAddress.landmark && (
              <p>Landmark: {deliveryAddress.landmark}</p>
            )}
            <Separator className="my-2" />
            <p>
              Delivery: {formatDate(order.deliveryDate)} - {order.deliverySlot}
            </p>
          </CardContent>
        </Card>

        {/* Payment */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Method</span>
              <span className="font-medium uppercase">{payment.method}</span>
            </div>
            <PaymentUpdater
              orderId={id}
              method={payment.method}
              currentStatus={payment.status}
            />
            {payment.razorpayPaymentId && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Payment ID</span>
                <span className="font-mono text-xs">{payment.razorpayPaymentId}</span>
              </div>
            )}
            {payment.paidAt && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Paid at</span>
                <span>{formatDateTime(payment.paidAt)}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Status History */}
      <Card>
        <CardHeader>
          <CardTitle>Status History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative ml-4 border-l-2 pl-6 space-y-4">
            {statusHistory.map((entry, i) => (
              <div key={i} className="relative">
                <div className="absolute -left-[31px] h-4 w-4 rounded-full border-2 border-primary bg-background" />
                <p className="font-medium capitalize">
                  {(entry.status as string).replace(/_/g, " ")}
                </p>
                <p className="text-sm text-muted-foreground">
                  {formatDateTime(entry.changedAt as string)}
                </p>
                {Boolean(entry.note) && (
                  <p className="text-sm">{entry.note as string}</p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {order.specialInstructions && (
        <Card>
          <CardHeader>
            <CardTitle>Special Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{order.specialInstructions}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
