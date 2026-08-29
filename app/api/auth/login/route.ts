import { NextResponse } from "next/server"
import { createSession, findUserByLogin, SESSION_COOKIE, verifyPassword } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const login = String(body.login || "").trim()
    const password = String(body.password || "")
    if (!login || !password) {
      return NextResponse.json({ success: false, error: "Isi username/email dan password" }, { status: 400 })
    }

    const user: any = await findUserByLogin(login)
    if (!user || !verifyPassword(password, String(user.passwordHash || ""))) {
      return NextResponse.json({ success: false, error: "Username/email atau password salah" }, { status: 401 })
    }

    const session = await createSession(user._id.toString())
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
    console.error("Login error:", error)
    return NextResponse.json({ success: false, error: "Gagal login" }, { status: 500 })
  }
}
