import Navbar from "@/components/navbar"
import { LoadingScreen } from "@/components/loading-screen"
import { SocialMediaButton } from "@/components/social-media-button"
import { Footer } from "@/components/footer"
import { StorefrontHome } from "@/components/storefront-home"

export default function StorePage() {
  return (
    <>
      <LoadingScreen />
      <div className="min-h-screen bg-[#070A10] text-white">
        <Navbar />
        <SocialMediaButton />
        <StorefrontHome />
        <Footer />
      </div>
    </>
  )
}
