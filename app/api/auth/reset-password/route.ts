import { NextResponse } from "next/server"
import { resetPasswordWithToken } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const token = String(body.token || "")
    const password = String(body.password || "")
    if (!token) return NextResponse.json({ success: false, error: "Link reset tidak valid" }, { status: 400 })
    if (password.length < 8) return NextResponse.json({ success: false, error: "Password minimal 8 karakter" }, { status: 400 })

    const ok = await resetPasswordWithToken(token, password)
    if (!ok) return NextResponse.json({ success: false, error: "Link reset sudah tidak valid atau kedaluwarsa" }, { status: 400 })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Reset password error:", error)
    return NextResponse.json({ success: false, error: "Gagal mengubah password" }, { status: 500 })
  }
}
