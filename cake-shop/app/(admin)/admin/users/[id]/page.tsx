import { connectDB } from "@/lib/db";
import { User } from "@/lib/models/User";
import { Order } from "@/lib/models/Order";
import { formatDate, formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { notFound } from "next/navigation";
import Link from "next/link";
import { UserActiveToggle } from "./active-toggle";

export const dynamic = "force-dynamic";

async function getUserData(id: string) {
  await connectDB();
  const user = await User.findById(id).select("-password").lean();
  if (!user) return null;

  const orders = await Order.find({ userId: id })
    .sort({ createdAt: -1 })
    .lean();

  return {
    user: JSON.parse(JSON.stringify(user)),
    orders: JSON.parse(JSON.stringify(orders)),
  };
}

export default async function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getUserData(id);

  if (!data) notFound();

  const { user, orders } = data;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h2 className="font-heading text-2xl font-bold">{user.name}</h2>
        <p className="text-muted-foreground">{user.email}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Role</span>
              <Badge variant="secondary" className="capitalize">
                {user.role}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Phone</span>
              <span>{user.phone || "N/A"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Joined</span>
              <span>{formatDate(user.createdAt)}</span>
            </div>
            {user.lastLogin && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last Login</span>
                <span>{formatDate(user.lastLogin)}</span>
              </div>
            )}
            {user.address && (
              <div className="pt-2">
                <span className="text-muted-foreground">Address</span>
                <p className="mt-1">
                  {[
                    user.address.street,
                    user.address.city,
                    user.address.state,
                    user.address.zipCode,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account Status</CardTitle>
          </CardHeader>
          <CardContent>
            <UserActiveToggle userId={id} isActive={user.isActive} />
          </CardContent>
        </Card>
      </div>

      {/* Order History */}
      <Card>
        <CardHeader>
          <CardTitle>Order History</CardTitle>
          <CardDescription>{orders.length} orders total</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Date</TableHead>
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
                  <TableCell>{formatDate(order.createdAt as string)}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="capitalize">
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
                  <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                    No orders yet
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
