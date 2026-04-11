import nodemailer from "nodemailer";
import { connectDB } from "@/lib/db";
import { SiteSettings } from "@/lib/models/SiteSettings";
import { buildOrderConfirmationHtml } from "@/lib/emails/order-confirmation";
import { buildAdminOrderAlertHtml } from "@/lib/emails/admin-order-alert";
import { buildOrderStatusUpdateHtml } from "@/lib/emails/order-status-update";

const transporter = nodemailer.createTransport({
  service: process.env.SMPT_SERVICE,
  host: process.env.SMPT_HOST,
  port: Number(process.env.SMPT_PORT),
  secure: true,
  auth: {
    user: process.env.SMPT_MAIL,
    pass: process.env.SMPT_PASSWORD,
  },
});

async function getEmailSettings() {
  await connectDB();
  const settings = await SiteSettings.findOne().lean();
  return {
    emailNotifications: settings?.emailNotifications || { enabled: false },
    shopName: settings?.siteName || "Sweet Delights Bakery",
  };
}

function replaceSubjectVars(subject: string, vars: Record<string, string>) {
  let result = subject;
  for (const [key, value] of Object.entries(vars)) {
    result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), value);
  }
  return result;
}

function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export async function sendOtpEmail(to: string, otp: string) {
  await transporter.sendMail({
    from: `"Sweet Delights Bakery" <${process.env.SMPT_MAIL}>`,
    to,
    subject: "Your Verification Code - Sweet Delights Bakery",
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 480px; margin: auto; padding: 32px; border: 1px solid #e5e5e5; border-radius: 12px;">
        <h2 style="color: #8B4513; margin-bottom: 8px;">Sweet Delights Bakery</h2>
        <p style="color: #555; font-size: 15px;">Use the code below to verify your email address:</p>
        <div style="background: #FFF8F0; border: 2px dashed #D4A574; border-radius: 8px; padding: 20px; text-align: center; margin: 24px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #8B4513;">${otp}</span>
        </div>
        <p style="color: #888; font-size: 13px;">This code expires in <strong>5 minutes</strong>.</p>
        <p style="color: #888; font-size: 13px;">If you didn't request this, please ignore this email.</p>
      </div>
    `,
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function sendOrderConfirmationEmail(order: any, customerEmail: string) {
  try {
    const { emailNotifications, shopName } = await getEmailSettings();
    if (!emailNotifications?.enabled || !emailNotifications?.orderConfirmation?.enabled) return;

    const subject = replaceSubjectVars(
      emailNotifications.orderConfirmation.subject || "Your order {{orderId}} has been confirmed!",
      { orderId: order.orderId }
    );

    const html = buildOrderConfirmationHtml({
      orderId: order.orderId,
      customerName: order.deliveryAddress.fullName,
      items: order.items,
      subtotal: order.subtotal,
      deliveryCharge: order.deliveryCharge,
      discount: order.discount || 0,
      totalAmount: order.totalAmount,
      paymentMethod: order.payment.method,
      deliveryAddress: order.deliveryAddress,
      deliveryDate: formatDate(order.deliveryDate),
      deliverySlot: order.deliverySlot,
      shopName,
    });

    await transporter.sendMail({
      from: `"${shopName}" <${process.env.SMPT_MAIL}>`,
      to: customerEmail,
      subject,
      html,
    });
  } catch (error) {
    console.error("Failed to send order confirmation email:", error);
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function sendAdminOrderAlertEmail(order: any, customerEmail: string) {
  try {
    const { emailNotifications, shopName } = await getEmailSettings();
    if (!emailNotifications?.enabled || !emailNotifications?.adminOrderAlert?.enabled) return;
    if (!emailNotifications.adminEmail) return;

    const subject = replaceSubjectVars(
      emailNotifications.adminOrderAlert.subject || "New order received: {{orderId}}",
      { orderId: order.orderId }
    );

    const html = buildAdminOrderAlertHtml({
      orderId: order.orderId,
      customerName: order.deliveryAddress.fullName,
      customerEmail,
      customerPhone: order.deliveryAddress.phone,
      items: order.items,
      totalAmount: order.totalAmount,
      paymentMethod: order.payment.method,
      deliveryAddress: order.deliveryAddress,
      deliveryDate: formatDate(order.deliveryDate),
      deliverySlot: order.deliverySlot,
      specialInstructions: order.specialInstructions,
      shopName,
    });

    await transporter.sendMail({
      from: `"${shopName}" <${process.env.SMPT_MAIL}>`,
      to: emailNotifications.adminEmail,
      subject,
      html,
    });
  } catch (error) {
    console.error("Failed to send admin order alert email:", error);
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function sendOrderStatusUpdateEmail(order: any, customerEmail: string, newStatus: string, note?: string) {
  try {
    const { emailNotifications, shopName } = await getEmailSettings();
    if (!emailNotifications?.enabled || !emailNotifications?.orderStatusUpdate?.enabled) return;

    const statusLabel = newStatus.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    const subject = replaceSubjectVars(
      emailNotifications.orderStatusUpdate.subject || "Your order {{orderId}} status update",
      { orderId: order.orderId, status: statusLabel }
    );

    const html = buildOrderStatusUpdateHtml({
      orderId: order.orderId,
      customerName: order.deliveryAddress.fullName,
      newStatus,
      note,
      shopName,
    });

    await transporter.sendMail({
      from: `"${shopName}" <${process.env.SMPT_MAIL}>`,
      to: customerEmail,
      subject,
      html,
    });
  } catch (error) {
    console.error("Failed to send order status update email:", error);
  }
}
