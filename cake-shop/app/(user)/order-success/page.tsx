import Link from "next/link";
import { CheckCircle2, ArrowRight, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface OrderSuccessPageProps {
  searchParams: Promise<{ orderId?: string; orderNumber?: string }>;
}

export default async function OrderSuccessPage({
  searchParams,
}: OrderSuccessPageProps) {
  const { orderId, orderNumber } = await searchParams;

  return (
    <div className="container mx-auto max-w-lg px-4 py-16">
      <Card>
        <CardContent className="flex flex-col items-center text-center py-8 space-y-4">
          <CheckCircle2 className="h-16 w-16 text-green-500" />
          <h1 className="font-heading text-3xl font-bold">
            Order Placed Successfully!
          </h1>
          <p className="text-muted-foreground">
            Thank you for your order. We&apos;ll start preparing your delicious
            cake right away!
          </p>

          {(orderNumber || orderId) && (
            <div className="rounded-lg bg-muted px-4 py-3">
              <p className="text-sm text-muted-foreground">Order ID</p>
              <p className="font-mono font-bold text-lg">{orderNumber || orderId}</p>
            </div>
          )}

          <div className="flex flex-col gap-3 w-full pt-4">
            {orderId && (
              <Button
                size="lg"
                className="w-full"
                nativeButton={false}
                render={<Link href={`/orders/${orderId}`} />}
              >
                <Package className="mr-2 h-4 w-4" />
                View Order Details
              </Button>
            )}
            <Button
              variant="outline"
              size="lg"
              className="w-full"
              nativeButton={false}
              render={<Link href="/" />}
            >
              Continue Shopping
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
