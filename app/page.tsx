import PanelForm from "@/components/panel-form"
import Navbar from "@/components/navbar"
import { LoadingScreen } from "@/components/loading-screen"
import { SocialMediaButton } from "@/components/social-media-button"
import { InfoSection } from "@/components/info-section"
import { StatsSection } from "@/components/stats-section"
import { Footer } from "@/components/footer"
import { FaqSection } from "@/components/faq"
import { ArrowDownRight, Bot, ShieldCheck, Zap } from "lucide-react"

export default function Home() {
  return (
    <>
      <LoadingScreen />
      <div className="min-h-screen bg-[#070A10] text-white">
        <Navbar />
        <SocialMediaButton />

        <main>
          <section className="relative overflow-hidden border-b border-white/5 pt-28 pb-16 md:pt-36 md:pb-24">
            <div className="absolute inset-0 hero-grid opacity-30" />
            <div className="absolute -top-32 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-cyan-400/10 blur-[100px]" />
            <div className="absolute right-0 top-20 h-80 w-80 rounded-full bg-violet-500/10 blur-[120px]" />

            <div className="relative mx-auto grid max-w-7xl gap-12 px-4 md:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
              <div className="lg:sticky lg:top-28">
                <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/5 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">
                  <span className="h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_14px_rgba(103,232,249,.9)]" />
                  Instant panel service
                </div>

                <h1 className="mt-6 max-w-xl text-4xl font-black leading-[1.05] tracking-tight md:text-6xl">
                  Panel cepat.
                  <span className="block bg-gradient-to-r from-cyan-300 via-sky-300 to-violet-300 bg-clip-text text-transparent">
                    Setup tanpa ribet.
                  </span>
                </h1>

                <p className="mt-5 max-w-lg text-sm leading-7 text-slate-400 md:text-base">
                  Pilih kategori, tentukan paket, lalu lanjutkan pembayaran. Semua proses pembelian tetap seperti sistem lama, tapi tampilannya sekarang dibuat lebih ringkas dan modern.
                </p>

                <div className="mt-8 grid max-w-lg grid-cols-3 gap-3">
                  <MiniStat icon={<Bot className="h-4 w-4" />} label="Bot Ready" />
                  <MiniStat icon={<Zap className="h-4 w-4" />} label="Fast Setup" />
                  <MiniStat icon={<ShieldCheck className="h-4 w-4" />} label="Warranty" />
                </div>

                <a href="#order" className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-white hover:text-cyan-200">
                  Pilih paket sekarang <ArrowDownRight className="h-4 w-4" />
                </a>
              </div>

              <div id="order" className="scroll-mt-28">
                <PanelForm />
              </div>
            </div>
          </section>

          <InfoSection />
          <StatsSection />
          <FaqSection />
        </main>

        <Footer />
      </div>
    </>
  )
}

function MiniStat({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.025] px-3 py-3 text-center">
      <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-xl bg-white/5 text-cyan-200">{icon}</div>
      <div className="text-[11px] font-semibold text-slate-300">{label}</div>
    </div>
  )
}
