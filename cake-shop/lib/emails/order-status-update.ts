interface OrderStatusUpdateData {
  orderId: string;
  customerName: string;
  newStatus: string;
  note?: string;
  shopName: string;
}

const statusLabels: Record<string, string> = {
  placed: "Order Placed",
  confirmed: "Order Confirmed",
  preparing: "Preparing Your Order",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Order Cancelled",
};

const statusColors: Record<string, string> = {
  placed: "#D4A574",
  confirmed: "#22c55e",
  preparing: "#f59e0b",
  out_for_delivery: "#3b82f6",
  delivered: "#22c55e",
  cancelled: "#ef4444",
};

const statusMessages: Record<string, string> = {
  placed: "Your order has been placed successfully.",
  confirmed: "Your order has been confirmed and will be prepared soon.",
  preparing: "Our bakers are preparing your order with love!",
  out_for_delivery: "Your order is on its way to you!",
  delivered: "Your order has been delivered. Enjoy!",
  cancelled: "Your order has been cancelled.",
};

export function buildOrderStatusUpdateHtml(data: OrderStatusUpdateData): string {
  const label = statusLabels[data.newStatus] || data.newStatus;
  const color = statusColors[data.newStatus] || "#D4A574";
  const message = statusMessages[data.newStatus] || "Your order status has been updated.";

  return `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 520px; margin: auto; border: 1px solid #e5e5e5; border-radius: 12px; overflow: hidden;">
      <div style="background: #8B4513; padding: 24px; text-align: center;">
        <h1 style="color: #fff; margin: 0; font-size: 22px;">${data.shopName}</h1>
      </div>
      <div style="padding: 32px; text-align: center;">
        <h2 style="color: #8B4513; margin-top: 0;">Order Status Update</h2>

        <div style="background: #FFF8F0; border: 1px solid #D4A574; border-radius: 8px; padding: 16px; margin: 20px 0;">
          <p style="margin: 0; font-size: 14px; color: #888;">Order ID</p>
          <p style="margin: 4px 0 0; font-size: 18px; font-weight: bold; color: #8B4513;">${data.orderId}</p>
        </div>

        <div style="margin: 24px 0;">
          <span style="display: inline-block; background: ${color}; color: #fff; padding: 10px 28px; border-radius: 24px; font-size: 16px; font-weight: bold;">
            ${label}
          </span>
        </div>

        <p style="color: #555; font-size: 15px;">${message}</p>

        ${data.note ? `<div style="background: #f9f9f9; border-radius: 8px; padding: 12px; margin: 16px 0; text-align: left;"><p style="margin: 0; color: #555; font-size: 14px;"><strong>Note:</strong> ${data.note}</p></div>` : ""}

        <p style="color: #888; font-size: 13px; margin-top: 24px;">If you have any questions about your order, please contact us.</p>
      </div>
      <div style="background: #f5f5f5; padding: 16px; text-align: center;">
        <p style="color: #999; font-size: 12px; margin: 0;">${data.shopName} — This is an automated email, please do not reply.</p>
      </div>
    </div>
  `;
}
