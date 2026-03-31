import nodemailer from "nodemailer";

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
