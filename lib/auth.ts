import "server-only"

import crypto from "crypto"
import { ObjectId } from "mongodb"
import { cookies } from "next/headers"
import clientPromise from "@/lib/mongodb"
import { appConfig } from "@/data/config"

export const SESSION_COOKIE = "brock_session"
const SESSION_DAYS = 30

export interface StoreUser {
  _id?: ObjectId
  username: string
  email: string
  passwordHash: string
}

interface SessionDoc {
  userId: string
  tokenHash: string
  expiresAt: Date
}

interface PasswordResetDoc {
  userId: string
  tokenHash: string
  expiresAt: Date
}

async function db() {
  const client = await clientPromise
  return client.db(appConfig.mongodb.dbName)
}

function sha256(value: string) {
  return crypto.createHash("sha256").update(value).digest("hex")
}

export function hashPassword(password: string) {
  const salt = crypto.randomBytes(16).toString("hex")
  const hash = crypto.scryptSync(password, salt, 64).toString("hex")
  return `scrypt$${salt}$${hash}`
}

export function verifyPassword(password: string, stored: string) {
  try {
    const [version, salt, hash] = stored.split("$")
    if (version !== "scrypt" || !salt || !hash) return false
    const candidate = crypto.scryptSync(password, salt, 64)
    const expected = Buffer.from(hash, "hex")
    return candidate.length === expected.length && crypto.timingSafeEqual(candidate, expected)
  } catch {
    return false
  }
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

export function normalizeUsername(username: string) {
  return username.trim()
}

export async function findUserByEmail(email: string) {
  const database = await db()
  return database.collection<StoreUser>("users").findOne({ email: normalizeEmail(email) })
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

export async function findUserByLogin(login: string) {
  const database = await db()
  const value = login.trim()
  return database.collection<StoreUser>("users").findOne({
    $or: [
      { email: value.toLowerCase() },
      { username: { $regex: `^${escapeRegex(value)}$`, $options: "i" } } as any,
    ],
  } as any)
}

export async function createUser(username: string, email: string, password: string) {
  const database = await db()
  const cleanUsername = normalizeUsername(username)
  const cleanEmail = normalizeEmail(email)

  const existing = await database.collection("users").findOne({
    $or: [
      { email: cleanEmail },
      { username: { $regex: `^${escapeRegex(cleanUsername)}$`, $options: "i" } },
    ],
  })
  if (existing) throw new Error("Username atau email sudah terdaftar")

  const result = await database.collection("users").insertOne({
    username: cleanUsername,
    email: cleanEmail,
    passwordHash: hashPassword(password),
  })

  return { userId: result.insertedId.toString(), username: cleanUsername, email: cleanEmail }
}

export async function createSession(userId: string) {
  const database = await db()
  const token = crypto.randomBytes(32).toString("hex")
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000)

  await database.collection<SessionDoc>("sessions").insertOne({
    userId,
    tokenHash: sha256(token),
    expiresAt,
  })

  return { token, expiresAt }
}

export async function deleteSession(token?: string | null) {
  if (!token) return
  const database = await db()
  await database.collection<SessionDoc>("sessions").deleteOne({ tokenHash: sha256(token) })
}

export async function getUserBySessionToken(token?: string | null) {
  if (!token) return null
  const database = await db()
  const session = await database.collection<SessionDoc>("sessions").findOne({
    tokenHash: sha256(token),
    expiresAt: { $gt: new Date() },
  })
  if (!session || !ObjectId.isValid(session.userId)) return null

  const user = await database.collection("users").findOne(
    { _id: new ObjectId(session.userId) },
    { projection: { username: 1, email: 1 } },
  )
  if (!user) return null

  return {
    id: user._id.toString(),
    username: String(user.username || ""),
    email: String(user.email || ""),
  }
}

export async function getCurrentUser() {
  const cookieStore = await cookies()
  return getUserBySessionToken(cookieStore.get(SESSION_COOKIE)?.value)
}

export async function createPasswordReset(userId: string) {
  const database = await db()
  const token = crypto.randomBytes(32).toString("hex")
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000)

  await database.collection<PasswordResetDoc>("password_resets").deleteMany({ userId })
  await database.collection<PasswordResetDoc>("password_resets").insertOne({
    userId,
    tokenHash: sha256(token),
    expiresAt,
  })

  return { token, expiresAt }
}

export async function resetPasswordWithToken(token: string, newPassword: string) {
  const database = await db()
  const reset = await database.collection<PasswordResetDoc>("password_resets").findOne({
    tokenHash: sha256(token),
    expiresAt: { $gt: new Date() },
  })

  if (!reset || !ObjectId.isValid(reset.userId)) return false

  await database.collection("users").updateOne(
    { _id: new ObjectId(reset.userId) },
    { $set: { passwordHash: hashPassword(newPassword) } },
  )
  await database.collection<PasswordResetDoc>("password_resets").deleteMany({ userId: reset.userId })
  await database.collection<SessionDoc>("sessions").deleteMany({ userId: reset.userId })
  return true
}
