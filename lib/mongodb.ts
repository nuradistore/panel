import { MongoClient } from "mongodb"
import { appConfig } from "@/data/config"
import { defaultAlightMotionProducts } from "@/data/alight-motion-products"
import { defaultRedfingerProducts } from "@/data/redfinger-products"

const options = {
  serverSelectionTimeoutMS: 10000,
  connectTimeoutMS: 10000,
}

const REQUIRED_COLLECTIONS = [
  "am_products",
  "am_stock",
  "password_resets",
  "payments",
  "pending_registrations",
  "redfinger_products",
  "redfinger_stock",
  "users",
] as const

async function initializeDatabase(client: MongoClient) {
  const db = client.db(appConfig.mongodb.dbName)
  const existing = new Set((await db.listCollections({}, { nameOnly: true }).toArray()).map((item) => item.name))

  for (const name of REQUIRED_COLLECTIONS) {
    if (!existing.has(name)) {
      try {
        await db.createCollection(name)
      } catch (error: any) {
        // Aman untuk beberapa instance Vercel yang start bersamaan.
        if (error?.codeName !== "NamespaceExists" && error?.code !== 48) throw error
      }
    }
  }

  // Isi metadata produk bawaan tanpa menimpa harga/stok yang sudah diubah admin.
  const amProducts = db.collection("am_products")
  for (const product of defaultAlightMotionProducts) {
    await amProducts.updateOne(
      { productId: product.productId },
      { $setOnInsert: { ...product, stock: 0, createdAt: new Date() } },
      { upsert: true },
    )
  }

  const redfingerProducts = db.collection("redfinger_products")
  for (const product of defaultRedfingerProducts) {
    await redfingerProducts.updateOne(
      { productId: product.productId },
      { $setOnInsert: { ...product, createdAt: new Date() } },
      { upsert: true },
    )
  }

  // Index dibuat idempotent dan membantu lookup transaksi/stok/login.
  await Promise.all([
    db.collection("am_products").createIndex({ productId: 1 }, { unique: true }),
    db.collection("am_stock").createIndex({ productId: 1, status: 1 }),
    db.collection("payments").createIndex({ transactionId: 1 }, { unique: true }),
    db.collection("redfinger_products").createIndex({ productId: 1 }, { unique: true }),
    db.collection("redfinger_stock").createIndex({ productId: 1, status: 1 }),
    db.collection("users").createIndex({ email: 1 }, { unique: true, sparse: true }),
    db.collection("users").createIndex({ username: 1 }, { unique: true, sparse: true }),
  ])
}

async function createClient(): Promise<MongoClient> {
  const uri = appConfig.mongodb.uri

  if (!uri) {
    throw new Error("MONGODB_URL belum tersedia.")
  }

  const client = await new MongoClient(uri, options).connect()
  await initializeDatabase(client)
  return client
}

let clientPromise: Promise<MongoClient>

if (process.env.NODE_ENV === "development") {
  const globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>
  }

  if (!globalWithMongo._mongoClientPromise) {
    globalWithMongo._mongoClientPromise = createClient()
  }

  clientPromise = globalWithMongo._mongoClientPromise
} else {
  clientPromise = createClient()
}

export default clientPromise
