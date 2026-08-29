import { NextResponse } from "next/server"
import { createSession, createUser, SESSION_COOKIE } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const username = String(body.username || "").trim()
    const email = String(body.email || "").trim().toLowerCase()
    const password = String(body.password || "")

    if (!/^[a-zA-Z0-9._-]{3,24}$/.test(username)) {
      return NextResponse.json({ success: false, error: "Username 3-24 karakter, gunakan huruf/angka/._-" }, { status: 400 })
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ success: false, error: "Email tidak valid" }, { status: 400 })
    }
    if (password.length < 8) {
      return NextResponse.json({ success: false, error: "Password minimal 8 karakter" }, { status: 400 })
    }

    const user = await createUser(username, email, password)
    const session = await createSession(user.userId)
    const response = NextResponse.json({ success: true, user: { username: user.username, email: user.email } })
    response.cookies.set(SESSION_COOKIE, session.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      expires: session.expiresAt,
    })
    return response
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gagal membuat akun"
    const status = message.includes("sudah terdaftar") ? 409 : 500
    return NextResponse.json({ success: false, error: message }, { status })
  }
}
