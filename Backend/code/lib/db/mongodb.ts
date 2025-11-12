import { MongoClient, type Db } from "mongodb"

if (!process.env.MONGODB_URI) {
  throw new Error("MONGODB_URI environment variable is not set")
}

const uri = process.env.MONGODB_URI
let client: MongoClient | null = null
let db: Db | null = null

export async function connectDB(): Promise<Db> {
  if (db) {
    return db
  }

  try {
    client = new MongoClient(uri)
    await client.connect()
    db = client.db("edupay")
    console.log("[v0] Connected to MongoDB")
    return db
  } catch (error) {
    console.error("[v0] MongoDB connection error:", error)
    throw error
  }
}

export async function disconnectDB(): Promise<void> {
  if (client) {
    await client.close()
    client = null
    db = null
  }
}

export async function getDB(): Promise<Db> {
  if (!db) {
    await connectDB()
  }
  return db!
}
