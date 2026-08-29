import { NextResponse } from "next/server"
import { createPasswordReset, findUserByEmail } from "@/lib/auth"
import { sendPasswordResetEmail } from "@/lib/email-service"

export async function POST(request: Request) {
  try {
    const { email } = await request.json()
    const cleanEmail = String(email || "").trim().toLowerCase()
    const generic = { success: true, message: "Jika email terdaftar, link reset telah dikirim." }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) return NextResponse.json(generic)

    const user: any = await findUserByEmail(cleanEmail)
    if (!user) return NextResponse.json(generic)

    const { token } = await createPasswordReset(user._id.toString())
    const result = await sendPasswordResetEmail(cleanEmail, token)
    if (!result.success) console.error("Password reset email failed:", result.error)
    return NextResponse.json(generic)
  } catch (error) {
    console.error("Forgot password error:", error)
    return NextResponse.json({ success: true, message: "Jika email terdaftar, link reset telah dikirim." })
  }
}
