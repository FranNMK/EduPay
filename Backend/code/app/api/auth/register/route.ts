import { type NextRequest, NextResponse } from "next/server"
import { getDB } from "@/lib/db/mongodb"
import type { User } from "@/lib/types"
import { successResponse, errorResponse } from "@/lib/utils/api-response"
import { isValidEmail } from "@/lib/utils/validation"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, name, studentId, phone } = body

    // Validation
    if (!email || !isValidEmail(email)) {
      return NextResponse.json(errorResponse("Invalid email format", 400), { status: 400 })
    }

    if (!name || name.trim().length === 0) {
      return NextResponse.json(errorResponse("Name is required", 400), { status: 400 })
    }

    const db = await getDB()
    const usersCollection = db.collection<User>("users")

    // Check if user already exists
    const existingUser = await usersCollection.findOne({ email })
    if (existingUser) {
      return NextResponse.json(errorResponse("User already exists", 409), { status: 409 })
    }

    // Create new user
    const newUser: User = {
      email,
      name,
      studentId: studentId || undefined,
      phone: phone || undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await usersCollection.insertOne(newUser)

    return NextResponse.json(successResponse({ userId: result.insertedId, ...newUser }), { status: 201 })
  } catch (error) {
    console.error("[v0] Registration error:", error)
    return NextResponse.json(errorResponse("Internal server error", 500), { status: 500 })
  }
}
