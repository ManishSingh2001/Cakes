# Order Email Notifications — Implementation Plan

## Overview

Send email notifications on order events to both customer and admin. Fully configurable from the admin Settings page.

---

## Flow Diagram

```
Customer places order
        |
        v
Payment verified / COD confirmed
        |
        v
Order created with status "placed" / "confirmed"
        |
        +--> Send Order Confirmation Email --> Customer
        |
        +--> Send New Order Alert Email -----> Admin(s)
        |
        v
Admin changes order status (e.g. "preparing", "out_for_delivery", "delivered")
        |
        +--> Send Order Status Update Email --> Customer
```

---

## What Changes Where

### 1. SiteSettings Model (`lib/models/SiteSettings.ts`)

Add new `emailNotifications` field:

```
emailNotifications: {
  enabled: boolean               // Master toggle
  adminEmail: string             // Admin receives order alerts here
  orderConfirmation: {
    enabled: boolean             // Send confirmation to customer
    subject: string              // e.g. "Your order {{orderId}} is confirmed!"
  }
  adminOrderAlert: {
    enabled: boolean             // Send alert to admin on new order
    subject: string              // e.g. "New order received: {{orderId}}"
  }
  orderStatusUpdate: {
    enabled: boolean             // Send status change to customer
    subject: string              // e.g. "Order {{orderId}} update: {{status}}"
  }
}
```

### 2. Validation Schema (`lib/validations/content.schema.ts`)

Add `emailNotifications` to `siteSettingsSchema` with defaults:
- `enabled`: false
- `adminEmail`: ""
- `orderConfirmation.enabled`: true, subject: "Your order {{orderId}} has been confirmed!"
- `adminOrderAlert.enabled`: true, subject: "New order received: {{orderId}}"
- `orderStatusUpdate.enabled`: true, subject: "Your order {{orderId}} status update"

### 3. Email Templates (`lib/emails/`)

Create reusable HTML email templates:

| Template | Recipient | Trigger |
|----------|-----------|---------|
| `order-confirmation.ts` | Customer | After payment verified / order placed |
| `admin-order-alert.ts` | Admin | After new order created |
| `order-status-update.ts` | Customer | After admin changes order status |

Template data includes:
- Order ID, items list, quantities, prices
- Delivery address, date, slot
- Payment method, total amount
- Order status
- Shop branding (name, logo from SiteSettings)

### 4. Mailer Module (`lib/mailer.ts`)

Extend existing `sendOtpEmail` with new functions:
- `sendOrderConfirmationEmail(order, customerEmail)`
- `sendAdminOrderAlertEmail(order, adminEmail)`
- `sendOrderStatusUpdateEmail(order, customerEmail, newStatus)`

All functions check `emailNotifications.enabled` + individual toggle before sending.

### 5. API Changes

| File | Change |
|------|--------|
| `api/user/payment/verify/route.ts` | After order confirmed → send customer confirmation + admin alert |
| `api/user/payment/create/route.ts` | For COD/Bank Transfer (no verify step) → send emails after order created |
| `api/admin/orders/route.ts` (PUT) | After status update → send status update email to customer |

### 6. Admin Settings Page (`app/(admin)/admin/settings/page.tsx`)

Add new "Email Notifications" card with:
- Master enable/disable toggle
- Admin email input
- Per-notification toggles (order confirmation, admin alert, status update)
- Custom subject line inputs for each
- Info text: supports `{{orderId}}` and `{{status}}` placeholders

---

## Implementation Order

1. **Model + Schema** — Add `emailNotifications` to SiteSettings model and Zod schema
2. **Email Templates** — Create `lib/emails/` with 3 branded HTML templates
3. **Mailer Functions** — Add send functions to `lib/mailer.ts`
4. **Admin Settings UI** — Add Email Notifications card to settings page
5. **Hook into Order Flow** — Add email calls to payment verify, payment create (COD), and order status update APIs

---

## Template Variables

| Variable | Available In | Example |
|----------|-------------|---------|
| `{{orderId}}` | All templates | ORD20260411001 |
| `{{customerName}}` | All templates | Manish Singh |
| `{{items}}` | Confirmation, Admin Alert | List of ordered items |
| `{{totalAmount}}` | Confirmation, Admin Alert | 2,192 |
| `{{paymentMethod}}` | Confirmation, Admin Alert | Razorpay |
| `{{deliveryDate}}` | Confirmation, Admin Alert | 15 Apr 2026 |
| `{{deliverySlot}}` | Confirmation, Admin Alert | 10AM-12PM |
| `{{deliveryAddress}}` | Confirmation, Admin Alert | Full address string |
| `{{status}}` | Status Update | Preparing |
| `{{shopName}}` | All templates | Sweet Delights Bakery |

---

## Email Design

All emails follow the existing OTP email branding:
- Header: Shop name with brown (#8B4513) background
- Body: Clean white card layout
- Accent: Gold (#D4A574) for highlights
- Footer: Shop info + "Do not reply" notice
