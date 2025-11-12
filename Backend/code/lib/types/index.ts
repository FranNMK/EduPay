import type { ObjectId } from "mongodb"

export interface User {
  _id?: ObjectId
  email: string
  name: string
  studentId?: string
  phone?: string
  stripeCustomerId?: string
  createdAt: Date
  updatedAt: Date
}

export interface Transaction {
  _id?: ObjectId
  userId: ObjectId
  amount: number
  currency: string
  description: string
  status: "pending" | "completed" | "failed" | "refunded"
  stripePaymentIntentId: string
  type: "payment" | "refund"
  metadata?: Record<string, any>
  createdAt: Date
  updatedAt: Date
}

export interface Fee {
  _id?: ObjectId
  name: string
  amount: number
  currency: string
  description: string
  dueDate: Date
  createdAt: Date
  updatedAt: Date
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  statusCode: number
}
