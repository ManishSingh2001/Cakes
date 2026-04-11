interface OrderItem {
  name: string;
  priceOption: { weight: number; sellPrice: number };
  quantity: number;
  cakeMessage?: string;
  addons?: { name: string; price: number; quantity: number }[];
  itemTotal: number;
}

interface AdminOrderAlertData {
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: OrderItem[];
  totalAmount: number;
  paymentMethod: string;
  deliveryAddress: {
    fullName: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  deliveryDate: string;
  deliverySlot: string;
  specialInstructions?: string;
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

export function buildAdminOrderAlertHtml(data: AdminOrderAlertData): string {
  const itemsHtml = data.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd;">${item.name}</td>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${item.priceOption.weight} kg</td>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${item.quantity}</td>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">${formatCurrency(item.itemTotal)}</td>
        <td style="padding: 8px; border: 1px solid #ddd; font-size: 12px;">${item.cakeMessage || "-"}${item.addons?.length ? `<br/>Add-ons: ${item.addons.map((a) => a.name).join(", ")}` : ""}</td>
      </tr>`
    )
    .join("");

  return `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 650px; margin: auto; border: 1px solid #e5e5e5; border-radius: 12px; overflow: hidden;">
      <div style="background: #8B4513; padding: 24px; text-align: center;">
        <h1 style="color: #fff; margin: 0; font-size: 22px;">New Order Received!</h1>
      </div>
      <div style="padding: 32px;">
        <div style="background: #FFF8F0; border: 1px solid #D4A574; border-radius: 8px; padding: 16px; margin-bottom: 20px; display: flex; justify-content: space-between;">
          <div>
            <p style="margin: 0; font-size: 14px; color: #888;">Order ID</p>
            <p style="margin: 4px 0 0; font-size: 20px; font-weight: bold; color: #8B4513;">${data.orderId}</p>
          </div>
          <div style="text-align: right;">
            <p style="margin: 0; font-size: 14px; color: #888;">Total</p>
            <p style="margin: 4px 0 0; font-size: 20px; font-weight: bold; color: #8B4513;">${formatCurrency(data.totalAmount)}</p>
          </div>
        </div>

        <h3 style="color: #8B4513; margin-bottom: 8px;">Customer Details</h3>
        <table style="width: 100%; margin-bottom: 20px;">
          <tr>
            <td style="color: #888; padding: 4px 0; width: 120px;">Name</td>
            <td style="color: #333;">${data.customerName}</td>
          </tr>
          <tr>
            <td style="color: #888; padding: 4px 0;">Email</td>
            <td style="color: #333;">${data.customerEmail}</td>
          </tr>
          <tr>
            <td style="color: #888; padding: 4px 0;">Phone</td>
            <td style="color: #333;">${data.customerPhone}</td>
          </tr>
        </table>

        <h3 style="color: #8B4513; margin-bottom: 8px;">Order Items</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <thead>
            <tr style="background: #f5f5f5;">
              <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Item</th>
              <th style="padding: 8px; border: 1px solid #ddd;">Weight</th>
              <th style="padding: 8px; border: 1px solid #ddd;">Qty</th>
              <th style="padding: 8px; border: 1px solid #ddd; text-align: right;">Amount</th>
              <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Notes</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <h3 style="color: #8B4513; margin-bottom: 8px;">Delivery Details</h3>
        <div style="background: #f9f9f9; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
          <p style="margin: 4px 0; color: #555; font-size: 14px;">${data.deliveryAddress.fullName} — ${data.deliveryAddress.phone}</p>
          <p style="margin: 4px 0; color: #555; font-size: 14px;">${data.deliveryAddress.street}, ${data.deliveryAddress.city}, ${data.deliveryAddress.state} - ${data.deliveryAddress.zipCode}</p>
          <p style="margin: 8px 0 4px; color: #555; font-size: 14px;"><strong>Date:</strong> ${data.deliveryDate} | <strong>Slot:</strong> ${data.deliverySlot}</p>
          <p style="margin: 4px 0; color: #555; font-size: 14px;"><strong>Payment:</strong> ${formatPaymentMethod(data.paymentMethod)}</p>
          ${data.specialInstructions ? `<p style="margin: 8px 0 0; color: #D4A574; font-size: 14px;"><strong>Instructions:</strong> ${data.specialInstructions}</p>` : ""}
        </div>
      </div>
      <div style="background: #f5f5f5; padding: 16px; text-align: center;">
        <p style="color: #999; font-size: 12px; margin: 0;">${data.shopName} — Admin Order Notification</p>
      </div>
    </div>
  `;
}
