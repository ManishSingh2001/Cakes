interface OrderItem {
  name: string;
  priceOption: { weight: number; sellPrice: number };
  quantity: number;
  cakeMessage?: string;
  addons?: { name: string; price: number; quantity: number }[];
  itemTotal: number;
}

interface OrderConfirmationData {
  orderId: string;
  customerName: string;
  items: OrderItem[];
  subtotal: number;
  deliveryCharge: number;
  discount: number;
  totalAmount: number;
  paymentMethod: string;
  deliveryAddress: {
    fullName: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  deliveryDate: string;
  deliverySlot: string;
  shopName: string;
}

function formatCurrency(amount: number) {
  return `₹${amount.toLocaleString("en-IN")}`;
}

function formatPaymentMethod(method: string) {
  const map: Record<string, string> = {
    razorpay: "Razorpay",
    stripe: "Stripe",
    cod: "Cash on Delivery",
    bank_transfer: "Bank Transfer",
  };
  return map[method] || method;
}

export function buildOrderConfirmationHtml(data: OrderConfirmationData): string {
  const itemsHtml = data.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 10px 0; border-bottom: 1px solid #eee;">
          <strong>${item.name}</strong><br/>
          <span style="color: #888; font-size: 13px;">${item.priceOption.weight} kg × ${item.quantity}</span>
          ${item.cakeMessage ? `<br/><span style="color: #888; font-size: 13px;">Message: "${item.cakeMessage}"</span>` : ""}
          ${item.addons?.length ? `<br/><span style="color: #888; font-size: 13px;">Add-ons: ${item.addons.map((a) => a.name).join(", ")}</span>` : ""}
        </td>
        <td style="padding: 10px 0; border-bottom: 1px solid #eee; text-align: right; vertical-align: top;">
          ${formatCurrency(item.itemTotal)}
        </td>
      </tr>`
    )
    .join("");

  return `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e5e5e5; border-radius: 12px; overflow: hidden;">
      <div style="background: #8B4513; padding: 24px; text-align: center;">
        <h1 style="color: #fff; margin: 0; font-size: 22px;">${data.shopName}</h1>
      </div>
      <div style="padding: 32px;">
        <h2 style="color: #8B4513; margin-top: 0;">Order Confirmed!</h2>
        <p style="color: #555;">Hi ${data.customerName},</p>
        <p style="color: #555;">Thank you for your order. Here are your order details:</p>

        <div style="background: #FFF8F0; border: 1px solid #D4A574; border-radius: 8px; padding: 16px; margin: 20px 0;">
          <p style="margin: 0; font-size: 14px; color: #888;">Order ID</p>
          <p style="margin: 4px 0 0; font-size: 20px; font-weight: bold; color: #8B4513;">${data.orderId}</p>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <thead>
            <tr>
              <th style="text-align: left; padding-bottom: 8px; border-bottom: 2px solid #D4A574; color: #8B4513;">Item</th>
              <th style="text-align: right; padding-bottom: 8px; border-bottom: 2px solid #D4A574; color: #8B4513;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <table style="width: 100%; margin: 16px 0;">
          <tr>
            <td style="color: #555; padding: 4px 0;">Subtotal</td>
            <td style="text-align: right; color: #555;">${formatCurrency(data.subtotal)}</td>
          </tr>
          <tr>
            <td style="color: #555; padding: 4px 0;">Delivery</td>
            <td style="text-align: right; color: ${data.deliveryCharge === 0 ? "#22c55e" : "#555"};">${data.deliveryCharge === 0 ? "FREE" : formatCurrency(data.deliveryCharge)}</td>
          </tr>
          ${data.discount > 0 ? `<tr><td style="color: #22c55e; padding: 4px 0;">Discount</td><td style="text-align: right; color: #22c55e;">-${formatCurrency(data.discount)}</td></tr>` : ""}
          <tr>
            <td style="font-weight: bold; font-size: 18px; color: #8B4513; padding-top: 8px; border-top: 2px solid #D4A574;">Total</td>
            <td style="text-align: right; font-weight: bold; font-size: 18px; color: #8B4513; padding-top: 8px; border-top: 2px solid #D4A574;">${formatCurrency(data.totalAmount)}</td>
          </tr>
        </table>

        <div style="background: #f9f9f9; border-radius: 8px; padding: 16px; margin: 20px 0;">
          <h3 style="color: #8B4513; margin-top: 0; font-size: 15px;">Delivery Details</h3>
          <p style="margin: 4px 0; color: #555; font-size: 14px;">${data.deliveryAddress.fullName}</p>
          <p style="margin: 4px 0; color: #555; font-size: 14px;">${data.deliveryAddress.street}, ${data.deliveryAddress.city}</p>
          <p style="margin: 4px 0; color: #555; font-size: 14px;">${data.deliveryAddress.state} - ${data.deliveryAddress.zipCode}</p>
          <p style="margin: 12px 0 4px; color: #555; font-size: 14px;"><strong>Date:</strong> ${data.deliveryDate}</p>
          <p style="margin: 4px 0; color: #555; font-size: 14px;"><strong>Slot:</strong> ${data.deliverySlot}</p>
          <p style="margin: 4px 0; color: #555; font-size: 14px;"><strong>Payment:</strong> ${formatPaymentMethod(data.paymentMethod)}</p>
        </div>

        <p style="color: #888; font-size: 13px; margin-top: 24px;">If you have any questions, feel free to contact us.</p>
      </div>
      <div style="background: #f5f5f5; padding: 16px; text-align: center;">
        <p style="color: #999; font-size: 12px; margin: 0;">${data.shopName} — This is an automated email, please do not reply.</p>
      </div>
    </div>
  `;
}
