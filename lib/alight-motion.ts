import clientPromise from "@/lib/mongodb"
import { appConfig } from "@/data/config"
import { defaultAlightMotionProducts } from "@/data/alight-motion-products"

const DB = appConfig.mongodb.dbName

export interface AlightMotionStockItem {
  productId: string
  email: string
  password: string
  note?: string
  status: "available" | "sold"
  transactionId?: string
  buyerEmail?: string
  soldAt?: Date
}

async function getDb() {
  return (await clientPromise).db(DB)
}

export async function getAlightMotionProduct(productId: string) {
  const db = await getDb()
  const custom: any = await db.collection("am_products").findOne({ productId })
  const base = defaultAlightMotionProducts.find((p) => p.productId === productId)
  if (!base) return null
  return { ...base, ...(custom || {}), _id: undefined }
}

// Sharing DAN Private sama-sama ambil stok dari collection am_stock (1 dokumen = 1 akun).
export async function countAlightMotionStock(productId: string) {
  const p = await getAlightMotionProduct(productId)
  if (!p || !p.active) return 0
  const db = await getDb()
  return db.collection("am_stock").countDocuments({ productId, status: "available" })
}

export async function listAlightMotionProducts() {
  return Promise.all(
    defaultAlightMotionProducts.map(async (b) => ({
      ...b,
      ...((await getAlightMotionProduct(b.productId)) || {}),
      stock: await countAlightMotionStock(b.productId),
    })),
  )
}

export async function getAssignedAlightMotionAccount(transactionId: string): Promise<AlightMotionStockItem | null> {
  const db = await getDb()
  return db.collection<any>("am_stock").findOne({ transactionId, status: "sold" })
}

// Idempotent: kalau transaksi ini sudah punya akun, akun yang sama dikembalikan (tidak ambil stok baru).
export async function claimAlightMotionAccount(
  productId: string,
  transactionId: string,
  buyerEmail: string,
): Promise<AlightMotionStockItem | null> {
  const existing = await getAssignedAlightMotionAccount(transactionId)
  if (existing) return existing

  const db = await getDb()
  const result: any = await db.collection<any>("am_stock").findOneAndUpdate(
    { productId, status: "available" },
    { $set: { status: "sold", transactionId, buyerEmail, soldAt: new Date() } },
    { returnDocument: "after", sort: { _id: 1 }, includeResultMetadata: false } as any,
  )
  // Support driver lama (result.value) maupun baru (dokumen langsung)
  const doc = result && typeof result === "object" && "ok" in result && "value" in result ? result.value : result
  return doc?.email ? doc : null
}
