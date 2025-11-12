import { type NextRequest, NextResponse } from "next/server"
import { getDB } from "@/lib/db/mongodb"
import type { Transaction } from "@/lib/types"
import { successResponse, errorResponse } from "@/lib/utils/api-response"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json(errorResponse("User ID is required", 400), { status: 400 })
    }

    const db = await getDB()
    const transactionsCollection = db.collection<Transaction>("transactions")

    const transactions = await transactionsCollection
      .find({
        userId: new ObjectId(userId),
      })
      .sort({ createdAt: -1 })
      .toArray()

    return NextResponse.json(successResponse(transactions))
  } catch (error) {
    console.error("[v0] Get transactions error:", error)
    return NextResponse.json(errorResponse("Internal server error", 500), { status: 500 })
  }
}
