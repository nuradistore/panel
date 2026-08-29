import { NextRequest, NextResponse } from "next/server"
import { deleteSession, SESSION_COOKIE } from "@/lib/auth"

export async function POST(request: NextRequest) {
  await deleteSession(request.cookies.get(SESSION_COOKIE)?.value)
  const response = NextResponse.json({ success: true })
  response.cookies.set(SESSION_COOKIE, "", { httpOnly: true, path: "/", expires: new Date(0) })
  return response
}
