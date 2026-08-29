import { cookies } from "next/headers"
import Navbar from "@/components/navbar"
import { LoadingScreen } from "@/components/loading-screen"
import { SocialMediaButton } from "@/components/social-media-button"
import { Footer } from "@/components/footer"
import { StorefrontHome } from "@/components/storefront-home"
import { getUserBySession, SESSION_COOKIE } from "@/lib/auth"

export const dynamic = "force-dynamic"

export default async function StorePage() {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get(SESSION_COOKIE)?.value

  let user = null
  try {
    user = await getUserBySession(sessionToken)
  } catch (error) {
    console.error("STORE SESSION ERROR:", error)
  }

  const account = user
    ? { username: user.username, email: user.email }
    : null

  return (
    <>
      <LoadingScreen />
      <div className="min-h-screen bg-[#070A10] text-white">
        <Navbar user={account} />
        <SocialMediaButton />
        <StorefrontHome user={account} />
        <Footer />
      </div>
    </>
  )
}
