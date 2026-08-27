import PanelForm from "@/components/panel-form"
import Navbar from "@/components/navbar"
import { LoadingScreen } from "@/components/loading-screen"
import { SocialMediaButton } from "@/components/social-media-button"
import { InfoSection } from "@/components/info-section"
import { StatsSection } from "@/components/stats-section"
import { Footer } from "@/components/footer"
import { FaqSection } from "@/components/faq"
import { Bot, CheckCircle2, ShieldCheck, Zap } from "lucide-react"

export default function Home() {
  return (
    <>
      <LoadingScreen />
      <main className="min-h-screen overflow-hidden bg-[#050816] text-white">
        <Navbar />
        <SocialMediaButton />
        <section className="relative px-4 pb-20 pt-28 md:pt-36">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(34,211,238,0.13),transparent_30%),radial-gradient(circle_at_80%_20%,rgba(139,92,246,0.13),transparent_30%)]" />
          <div className="relative mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
            <div className="lg:sticky lg:top-32">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-300"><Zap className="h-3.5 w-3.5 text-cyan-300" /> Panel otomatis • cepat • praktis</div>
              <h2 className="mt-6 text-4xl font-black leading-[1.05] tracking-tight md:text-6xl">Panel modern untuk <span className="bg-gradient-to-r from-cyan-300 via-blue-400 to-violet-400 bg-clip-text text-transparent">bot & admin.</span></h2>
              <p className="mt-5 max-w-lg text-sm leading-7 text-slate-400 md:text-base">Pilih produk berdasarkan kategori tanpa daftar yang berantakan. Semua paket sekarang tersusun dalam katalog yang lebih simpel dan mudah dibandingkan.</p>
              <div className="mt-7 grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                {[{icon: Bot, text: "Panel Bot"},{icon: ShieldCheck, text: "Admin Panel"},{icon: CheckCircle2, text: "Auto Process"}].map(({icon: Icon, text}) => <div key={text} className="flex items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.035] px-3 py-3 text-xs font-semibold text-slate-300"><Icon className="h-4 w-4 text-cyan-300" />{text}</div>)}
              </div>
            </div>
            <div className="rounded-[28px] border border-white/10 bg-[#0a0f20]/90 p-5 shadow-2xl shadow-black/30 backdrop-blur-xl md:p-8"><PanelForm /></div>
          </div>
        </section>
        <FaqSection />
        <InfoSection />
        <StatsSection />
        <Footer />
      </main>
    </>
  )
}
