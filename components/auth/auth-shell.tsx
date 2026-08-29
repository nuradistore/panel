import Link from "next/link"
import { Bot, ShieldCheck } from "lucide-react"

export function AuthShell({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050914] px-4 py-8 text-white">
      <div className="pointer-events-none absolute inset-0 hero-grid opacity-25" />
      <div className="pointer-events-none absolute -left-28 top-10 h-72 w-72 rounded-full bg-cyan-400/10 blur-[110px]" />
      <div className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-violet-500/10 blur-[120px]" />

      <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-[30px] border border-white/8 bg-[#080D18]/90 shadow-[0_35px_120px_rgba(0,0,0,.5)] lg:grid-cols-[.9fr_1.1fr]">
          <div className="hidden border-r border-white/6 bg-white/[0.015] p-10 lg:flex lg:flex-col lg:justify-between">
            <Link href="/" className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-cyan-300 to-sky-500 text-[#041017]">
                <Bot className="h-5 w-5" />
              </span>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">Digital Store</div>
                <div className="mt-1 text-lg font-black">BROCK STORE</div>
              </div>
            </Link>

            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/15 bg-cyan-300/5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-200">
                <ShieldCheck className="h-3.5 w-3.5" /> Akun Aman
              </div>
              <h2 className="mt-5 text-4xl font-black leading-tight">Belanja cepat, riwayat tetap tersimpan.</h2>
              <p className="mt-4 max-w-md text-sm leading-7 text-slate-400">Login bersifat opsional. Kamu tetap bisa checkout sebagai tamu, tapi akun membuat transaksi berikutnya tersimpan dan bisa dibuka lagi dari perangkat lain.</p>
            </div>

            <p className="text-xs text-slate-600">BROCK STORE • QRIS • Panel • REDFINGER</p>
          </div>

          <div className="p-6 sm:p-9 lg:p-12">
            <Link href="/" className="mb-8 inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white lg:hidden">← Kembali ke Home</Link>
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-cyan-300">{eyebrow}</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">{title}</h1>
            <p className="mt-3 max-w-lg text-sm leading-6 text-slate-400">{description}</p>
            <div className="mt-8">{children}</div>
          </div>
        </div>
      </div>
    </main>
  )
}
