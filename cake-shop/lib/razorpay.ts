import Razorpay from "razorpay";

export function createRazorpayClient(keyId?: string, keySecret?: string) {
  return new Razorpay({
    key_id: keyId || process.env.RAZORPAY_KEY_ID!,
    key_secret: keySecret || process.env.RAZORPAY_KEY_SECRET!,
  });
}

export const razorpay = createRazorpayClient();
