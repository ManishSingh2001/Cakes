● Here's the overview for your review:

  ---
  Payment Gateway Configuration — Overview                                                                              
  Admin Settings UI (new "Payment Gateways" card)                                                                       
  Four configurable gateways, each with an enable/disable toggle:

  ┌───────────────┬───────────────────────────────────────────────┐
  │    Gateway    │                 Config Fields                 │
  ├───────────────┼───────────────────────────────────────────────┤
  │ Razorpay      │ Key ID, Key Secret                            │
  ├───────────────┼───────────────────────────────────────────────┤
  │ Stripe        │ Publishable Key, Secret Key, Webhook Secret   │
  ├───────────────┼───────────────────────────────────────────────┤
  │ COD           │ Instructions text (e.g. "Pay when delivered") │
  ├───────────────┼───────────────────────────────────────────────┤
  │ Bank Transfer │ Instructions text, Account details            │
  └───────────────┴───────────────────────────────────────────────┘

  - Fields only show when that gateway is enabled
  - Each gateway has a custom "Display Name" (e.g. rename "COD" to "Pay on Delivery")
  - API secrets stored in DB (admin-only access), never exposed to public

  Checkout Page Changes

  - New "Payment Method" selection card with radio buttons
  - Only shows gateways the admin has enabled
  - Button text changes: "Pay 500" for Razorpay/Stripe, "Place Order" for COD, "Confirm Order" for Bank Transfer
  - COD/Bank Transfer skip payment modal entirely — order goes straight to "placed" status

  Database Changes

  - SiteSettings model gets a paymentGateways object with config for each gateway
  - Order model's payment.method expands to: razorpay | stripe | cod | bank_transfer

  API Changes

  ┌────────────────────────────────────┬────────────────────────────────────────────────────────────────────────┐
  │               Route                │                                 Change                                 │
  ├────────────────────────────────────┼────────────────────────────────────────────────────────────────────────┤
  │ PUT /api/admin/settings            │ Accepts new paymentGateways field (no structural change needed)        │
  ├────────────────────────────────────┼────────────────────────────────────────────────────────────────────────┤
  │ POST /api/user/payment/create      │ Branches logic by selected gateway (Razorpay/Stripe/COD/Bank Transfer) │
  ├────────────────────────────────────┼────────────────────────────────────────────────────────────────────────┤
  │ POST /api/user/payment/verify      │ Branches verification by gateway                                       │
  ├────────────────────────────────────┼────────────────────────────────────────────────────────────────────────┤
  │ NEW GET /api/user/payment/gateways │ Returns enabled gateways (names + instructions, no secrets)            │
  ├────────────────────────────────────┼────────────────────────────────────────────────────────────────────────┤
  │ NEW POST /api/webhooks/stripe      │ Stripe webhook for payment confirmation                                │
  └────────────────────────────────────┴────────────────────────────────────────────────────────────────────────┘

  Payment Flow Per Gateway

  - Razorpay: Current flow (create order → open modal → verify signature)
  - Stripe: Create PaymentIntent → redirect to Stripe Checkout → webhook confirms
  - COD: No payment call — order created with status "pending", redirect to success
  - Bank Transfer: Order created with status "pending", show bank details, redirect to success

  Implementation Order

  1. Schema/model changes
  2. Admin settings UI
  3. Gateway query endpoint
  4. COD flow (simplest, no external API)
  5. Checkout page UI with method selection
  6. Stripe integration
  7. Bank Transfer flow

  ---
  Want me to proceed with implementation, or would you like to change anything in this plan?