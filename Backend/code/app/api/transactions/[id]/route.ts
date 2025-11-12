import { type NextRequest, NextResponse } from "next/server"
import { getDB } from "@/lib/db/mongodb"
import type { Transaction } from "@/lib/types"
import { successResponse, errorResponse } from "@/lib/utils/api-response"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const db = await getDB()
    const transactionsCollection = db.collection<Transaction>("transactions")

    const transaction = await transactionsCollection.findOne({
      _id: new ObjectId(params.id),
    })

    if (!transaction) {
      return NextResponse.json(errorResponse("Transaction not found", 404), { status: 404 })
    }

    return NextResponse.json(successResponse(transaction))
  } catch (error) {
    console.error("[v0] Get transaction error:", error)
    return NextResponse.json(errorResponse("Internal server error", 500), { status: 500 })
  }
}
