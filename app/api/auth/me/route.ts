import { NextRequest, NextResponse } from "next/server"
import { getUserBySessionToken, SESSION_COOKIE } from "@/lib/auth"

export async function GET(request: NextRequest) {
  const user = await getUserBySessionToken(request.cookies.get(SESSION_COOKIE)?.value)
  return NextResponse.json({ authenticated: Boolean(user), user })
}
