import { type NextRequest, NextResponse } from "next/server"
import { getDB } from "@/lib/db/mongodb"
import type { Fee } from "@/lib/types"
import { successResponse, errorResponse } from "@/lib/utils/api-response"

export async function GET(request: NextRequest) {
  try {
    const db = await getDB()
    const feesCollection = db.collection<Fee>("fees")

    const fees = await feesCollection.find({}).sort({ dueDate: 1 }).toArray()

    return NextResponse.json(successResponse(fees))
  } catch (error) {
    console.error("[v0] Get fees error:", error)
    return NextResponse.json(errorResponse("Internal server error", 500), { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, amount, currency = "USD", description, dueDate } = body

    if (!name || !amount || !dueDate) {
      return NextResponse.json(errorResponse("Missing required fields", 400), { status: 400 })
    }

    const db = await getDB()
    const feesCollection = db.collection<Fee>("fees")

    const newFee: Fee = {
      name,
      amount,
      currency,
      description,
      dueDate: new Date(dueDate),
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await feesCollection.insertOne(newFee)

    return NextResponse.json(successResponse({ _id: result.insertedId, ...newFee }), { status: 201 })
  } catch (error) {
    console.error("[v0] Create fee error:", error)
    return NextResponse.json(errorResponse("Internal server error", 500), { status: 500 })
  }
}
