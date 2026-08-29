import crypto from "crypto"
import clientPromise from "@/lib/mongodb"

const DB = "Cluster0"
export const SESSION_COOKIE = "brock_session"

function hashPassword(password: string, salt = crypto.randomBytes(16).toString("hex")) {
  const hash = crypto.scryptSync(password, salt, 64).toString("hex")
  return `${salt}:${hash}`
}
function verifyPassword(password: string, stored: string) {
  const [salt, hash] = stored.split(":")
  if (!salt || !hash) return false
  const test = crypto.scryptSync(password, salt, 64)
  const saved = Buffer.from(hash, "hex")
  return saved.length === test.length && crypto.timingSafeEqual(saved, test)
}
export async function createUser(username:string,email:string,password:string) {
  const db=(await clientPromise).db(DB), users=db.collection("users")
  const cleanEmail=email.trim().toLowerCase(), cleanUsername=username.trim()
  if(await users.findOne({$or:[{email:cleanEmail},{username:cleanUsername}]})) throw new Error("Username atau email sudah terdaftar.")
  const result=await users.insertOne({username:cleanUsername,email:cleanEmail,passwordHash:hashPassword(password)})
  return result.insertedId.toString()
}
export async function loginUser(email:string,password:string) {
  const users=(await clientPromise).db(DB).collection("users")
  const user:any=await users.findOne({email:email.trim().toLowerCase()})
  if(!user || !verifyPassword(password,user.passwordHash)) return null
  const token=crypto.randomBytes(32).toString("hex")
  await users.updateOne({_id:user._id},{$set:{sessionToken:token}})
  return {token, user:{id:user._id.toString(),username:user.username,email:user.email}}
}
export async function getUserBySession(token?:string) {
  if(!token) return null
  const user:any=await (await clientPromise).db(DB).collection("users").findOne({sessionToken:token},{projection:{passwordHash:0}})
  return user ? {id:user._id.toString(),username:user.username,email:user.email} : null
}
export async function createReset(email:string) {
  const db=(await clientPromise).db(DB), users=db.collection("users")
  const user:any=await users.findOne({email:email.trim().toLowerCase()})
  if(!user) return null
  const token=crypto.randomBytes(32).toString("hex")
  const tokenHash=crypto.createHash("sha256").update(token).digest("hex")
  await db.collection("password_resets").deleteMany({email:user.email})
  await db.collection("password_resets").insertOne({email:user.email,tokenHash,expiresAt:new Date(Date.now()+30*60*1000)})
  return token
}
export async function resetPassword(token:string,password:string) {
  const db=(await clientPromise).db(DB)
  const tokenHash=crypto.createHash("sha256").update(token).digest("hex")
  const reset:any=await db.collection("password_resets").findOne({tokenHash,expiresAt:{$gt:new Date()}})
  if(!reset) return false
  await db.collection("users").updateOne({email:reset.email},{$set:{passwordHash:hashPassword(password)},$unset:{sessionToken:""}})
  await db.collection("password_resets").deleteMany({email:reset.email})
  return true
}
