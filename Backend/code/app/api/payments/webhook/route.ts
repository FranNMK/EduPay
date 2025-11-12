import { type NextRequest, NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { getDB } from "@/lib/db/mongodb"
import type { Transaction } from "@/lib/types"

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const sig = request.headers.get("stripe-signature")

    if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
      return NextResponse.json({ error: "Missing signature or webhook secret" }, { status: 400 })
    }

    // Verify webhook signature
    const event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET)

    const db = await getDB()
    const transactionsCollection = db.collection<Transaction>("transactions")

    // Handle different event types
    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object
        await transactionsCollection.updateOne(
          { stripePaymentIntentId: paymentIntent.id },
          {
            $set: {
              status: "completed",
              updatedAt: new Date(),
            },
          },
        )
        break
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object
        await transactionsCollection.updateOne(
          { stripePaymentIntentId: paymentIntent.id },
          {
            $set: {
              status: "failed",
              updatedAt: new Date(),
            },
          },
        )
        break
      }

      case "charge.refunded": {
        const charge = event.data.object
        await transactionsCollection.updateOne(
          { stripePaymentIntentId: charge.payment_intent },
          {
            $set: {
              status: "refunded",
              updatedAt: new Date(),
            },
          },
        )
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("[v0] Webhook error:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 400 })
  }
}
