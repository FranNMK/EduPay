import { type NextRequest, NextResponse } from "next/server"
import { getDB } from "@/lib/db/mongodb"
import type { User } from "@/lib/types"
import { successResponse, errorResponse } from "@/lib/utils/api-response"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get("id")

    if (!userId) {
      return NextResponse.json(errorResponse("User ID is required", 400), { status: 400 })
    }

    const db = await getDB()
    const usersCollection = db.collection<User>("users")

    const user = await usersCollection.findOne({
      _id: new ObjectId(userId),
    })

    if (!user) {
      return NextResponse.json(errorResponse("User not found", 404), { status: 404 })
    }

    return NextResponse.json(successResponse(user))
  } catch (error) {
    console.error("[v0] Get user error:", error)
    return NextResponse.json(errorResponse("Internal server error", 500), { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, ...updateData } = body

    if (!userId) {
      return NextResponse.json(errorResponse("User ID is required", 400), { status: 400 })
    }

    const db = await getDB()
    const usersCollection = db.collection<User>("users")

    const result = await usersCollection.findOneAndUpdate(
      { _id: new ObjectId(userId) },
      {
        $set: {
          ...updateData,
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after" },
    )

    if (!result.value) {
      return NextResponse.json(errorResponse("User not found", 404), { status: 404 })
    }

    return NextResponse.json(successResponse(result.value))
  } catch (error) {
    console.error("[v0] Update user error:", error)
    return NextResponse.json(errorResponse("Internal server error", 500), { status: 500 })
  }
}
