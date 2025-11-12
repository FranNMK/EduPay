import { type NextRequest, NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { getDB } from "@/lib/db/mongodb"
import { successResponse, errorResponse } from "@/lib/utils/api-response"
import { isValidAmount, isValidCurrency } from "@/lib/utils/validation"
import type { User, Transaction } from "@/lib/types"
import { ObjectId } from "mongodb"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, amount, currency = "USD", description } = body

    // Validation
    if (!userId) {
      return NextResponse.json(errorResponse("User ID is required", 400), { status: 400 })
    }

    if (!isValidAmount(amount)) {
      return NextResponse.json(errorResponse("Invalid amount", 400), { status: 400 })
    }

    if (!isValidCurrency(currency)) {
      return NextResponse.json(errorResponse("Invalid currency", 400), { status: 400 })
    }

    const db = await getDB()
    const usersCollection = db.collection<User>("users")
    const transactionsCollection = db.collection<Transaction>("transactions")

    // Get user
    const user = await usersCollection.findOne({
      _id: new ObjectId(userId),
    })

    if (!user) {
      return NextResponse.json(errorResponse("User not found", 404), { status: 404 })
    }

    // Create Stripe customer if not exists
    let stripeCustomerId = user.stripeCustomerId
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: {
          userId: userId,
        },
      })
      stripeCustomerId = customer.id

      // Update user with Stripe customer ID
      await usersCollection.updateOne({ _id: new ObjectId(userId) }, { $set: { stripeCustomerId } })
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency.toLowerCase(),
      customer: stripeCustomerId,
      description,
      metadata: {
        userId,
      },
    })

    // Create transaction record
    const transaction: Transaction = {
      userId: new ObjectId(userId),
      amount,
      currency,
      description,
      status: "pending",
      stripePaymentIntentId: paymentIntent.id,
      type: "payment",
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const transactionResult = await transactionsCollection.insertOne(transaction)

    return NextResponse.json(
      successResponse({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        transactionId: transactionResult.insertedId,
      }),
      { status: 201 },
    )
  } catch (error) {
    console.error("[v0] Create payment intent error:", error)
    return NextResponse.json(errorResponse("Failed to create payment intent", 500), { status: 500 })
  }
}
