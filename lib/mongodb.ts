import { MongoClient } from "mongodb"
import { appConfig } from "@/data/config"

const uri = appConfig.mongodb.uri

if (!uri) {
  throw new Error("MONGODB_URL belum tersedia. Tambahkan MONGODB_URL di Environment Variables Vercel.")
}

const options = {
  serverSelectionTimeoutMS: 10000,
  connectTimeoutMS: 10000,
}

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined
}

function createClientPromise() {
  const client = new MongoClient(uri as string, options)
  return client.connect()
}

const clientPromise =
  process.env.NODE_ENV === "development"
    ? global._mongoClientPromise ?? (global._mongoClientPromise = createClientPromise())
    : createClientPromise()

export default clientPromise
