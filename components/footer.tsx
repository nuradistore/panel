import Link from "next/link"
import { Bot } from "lucide-react"
import { appConfig } from "@/data/config"

export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-[#05070B]">
      <div className="mx-auto max-w-7xl px-4 py-10 md:px-6">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-300/10 text-cyan-200"><Bot className="h-5 w-5" /></div>
              <div>
                <div className="text-xs uppercase tracking-[0.18em] text-slate-600">Panel Store</div>
                <div className="font-black text-white">{appConfig.nameHost}</div>
              </div>
            </div>
            <p className="mt-4 max-w-md text-xs leading-6 text-slate-600">Layanan panel Pterodactyl dengan proses pembelian yang sederhana, cepat, dan transparan.</p>
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-3 text-xs font-semibold text-slate-500">
            <Link href="/history" className="hover:text-cyan-200">Riwayat</Link>
            <Link href="/garansi" className="hover:text-cyan-200">Garansi</Link>
            <a href={appConfig.socialMedia.whatsapp} target="_blank" rel="noreferrer" className="hover:text-cyan-200">WhatsApp</a>
            <a href={appConfig.socialMedia.telegram} target="_blank" rel="noreferrer" className="hover:text-cyan-200">Telegram</a>
            <a href={appConfig.whatsappGroupLink} target="_blank" rel="noreferrer" className="hover:text-cyan-200">Komunitas</a>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-2 border-t border-white/5 pt-6 text-[11px] text-slate-700 sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} {appConfig.nameHost}. All rights reserved.</span>
          <span>Built for fast panel ordering.</span>
        </div>
      </div>
    </footer>
  )
}
