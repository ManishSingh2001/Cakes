import { connectDB } from "@/lib/db";
import { Cake } from "@/lib/models/Cake";
import { Order } from "@/lib/models/Order";
import { User } from "@/lib/models/User";
import { Media } from "@/lib/models/Media";
import { Update } from "@/lib/models/Update";
import { CustomPage } from "@/lib/models/CustomPage";
import { formatPrice, formatDate } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  Cake as CakeIcon,
  ShoppingBag,
  Users,
  ImageIcon,
  FileText,
  File,
} from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

async function getDashboardData() {
  await connectDB();

  const [cakeCount, orderCount, userCount, mediaCount, updateCount, pageCount, recentOrders] =
    await Promise.all([
      Cake.countDocuments(),
      Order.countDocuments(),
      User.countDocuments(),
      Media.countDocuments(),
      Update.countDocuments(),
      CustomPage.countDocuments(),
      Order.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("userId", "name email")
        .lean(),
    ]);

  return {
    cakeCount,
    orderCount,
    userCount,
    mediaCount,
    updateCount,
    pageCount,
    recentOrders: JSON.parse(JSON.stringify(recentOrders)),
  };
}

const statusColors: Record<string, string> = {
  placed: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  confirmed: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300",
  preparing: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  out_for_delivery: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  delivered: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
};

export default async function AdminDashboard() {
  const data = await getDashboardData();

  const stats = [
    { label: "Total Cakes", value: data.cakeCount, icon: CakeIcon, href: "/admin/cakes" },
    { label: "Orders", value: data.orderCount, icon: ShoppingBag, href: "/admin/orders" },
    { label: "Users", value: data.userCount, icon: Users, href: "/admin/users" },
    { label: "Media", value: data.mediaCount, icon: ImageIcon, href: "/admin/media" },
    { label: "Updates", value: data.updateCount, icon: FileText, href: "/admin/updates" },
    { label: "Pages", value: data.pageCount, icon: File, href: "/admin/pages" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-heading text-2xl font-bold">Dashboard</h2>
        <p className="text-muted-foreground">Overview of your cake shop</p>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link key={stat.label} href={stat.href}>
              <Card className="transition-shadow hover:shadow-md">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.label}
                  </CardTitle>
                  <Icon className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stat.value}</div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Recent orders */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
          <CardDescription>Latest 5 orders placed</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.recentOrders.map((order: Record<string, unknown>) => (
                <TableRow key={order.orderId as string}>
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
                  <TableCell>{formatDate(order.createdAt as string)}</TableCell>
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
              {data.recentOrders.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
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
