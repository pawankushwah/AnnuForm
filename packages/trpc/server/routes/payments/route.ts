import { z } from "zod";
import { authedProcedure, router } from "../../trpc";
import { generatePath } from "../../utils/path-generator";
import { db } from "@repo/database";
import { usersTable } from "@repo/database/schema";
import { eq } from "drizzle-orm";
import Razorpay from "razorpay";
import crypto from "crypto";

const TAGS = ["Payments"];
const getPath = generatePath("/payments");

// Initialize Razorpay
// We check if keys exist so it doesn't crash if they are missing
const razorpay = process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET 
  ? new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    })
  : null;

export const paymentsRouter = router({
  createOrder: authedProcedure
    .meta({ openapi: { method: "POST", path: getPath("/order"), tags: TAGS } })
    .input(z.object({
      plan: z.enum(["monthly", "yearly"]),
      currency: z.enum(["USD", "INR"]),
    }))
    .output(z.any())
    .mutation(async ({ input, ctx }) => {
      if (!razorpay) {
        throw new Error("Razorpay is not configured on the server.");
      }

      // Calculate amount based on plan and currency
      // Pro Monthly: $1 or ₹100
      // Pro Yearly: $10 or ₹1000
      let amount = 0;
      if (input.currency === "INR") {
        amount = input.plan === "yearly" ? 1000 * 100 : 100 * 100; // in paise
      } else {
        amount = input.plan === "yearly" ? 10 * 100 : 1 * 100; // in cents
      }

      const options = {
        amount,
        currency: input.currency,
        receipt: `rcpt_${ctx.user.id.substring(0, 10)}_${Date.now()}`,
        notes: {
          userId: ctx.user.id,
          plan: input.plan,
        }
      };

      try {
        const order = await razorpay.orders.create(options);
        return order;
      } catch (error: any) {
        throw new Error(error.message || "Failed to create Razorpay order");
      }
    }),

  verifyPayment: authedProcedure
    .meta({ openapi: { method: "POST", path: getPath("/verify"), tags: TAGS } })
    .input(z.object({
      razorpay_order_id: z.string(),
      razorpay_payment_id: z.string(),
      razorpay_signature: z.string(),
      plan: z.enum(["monthly", "yearly"]),
    }))
    .output(z.any())
    .mutation(async ({ input, ctx }) => {
      if (!process.env.RAZORPAY_KEY_SECRET) {
        throw new Error("Razorpay is not configured.");
      }

      const body = input.razorpay_order_id + "|" + input.razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest("hex");

      const isAuthentic = expectedSignature === input.razorpay_signature;

      if (!isAuthentic) {
        throw new Error("Invalid payment signature.");
      }

      // Update user plan to PRO
      const duration = input.plan === "yearly" ? 365 : 30;
      const endsAt = new Date();
      endsAt.setDate(endsAt.getDate() + duration);

      await db.update(usersTable)
        .set({
          plan: "pro",
          planEndsAt: endsAt,
        })
        .where(eq(usersTable.id, ctx.user.id));

      return { success: true, message: "Payment verified successfully. You are now a Pro user!" };
    })
});
