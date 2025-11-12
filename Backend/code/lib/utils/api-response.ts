import type { ApiResponse } from "@/lib/types"

export function successResponse<T>(data: T, statusCode = 200): ApiResponse<T> {
  return {
    success: true,
    data,
    statusCode,
  }
}

export function errorResponse(error: string, statusCode = 500): ApiResponse {
  return {
    success: false,
    error,
    statusCode,
  }
}
