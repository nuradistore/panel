import Link from "next/link"
import { ArrowRight, Bot, CheckCircle2, Cloud, Crown, History, LogIn, QrCode, ShieldCheck, Zap } from "lucide-react"
import Navbar from "@/components/navbar"
import { Footer } from "@/components/footer"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#050914] text-white">
      <Navbar />
      <main>
        <section className="relative overflow-hidden border-b border-white/5 pt-32 pb-20 md:pt-40 md:pb-28">
          <div className="absolute inset-0 hero-grid opacity-30" />
          <div className="absolute -top-28 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-cyan-400/10 blur-[110px]" />
          <div className="absolute right-0 top-20 h-80 w-80 rounded-full bg-violet-500/10 blur-[120px]" />
          <div className="relative mx-auto max-w-6xl px-4 text-center md:px-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/15 bg-cyan-300/5 px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-cyan-200">
              <span className="h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_14px_rgba(103,232,249,.9)]" /> BROCK STORE • DIGITAL SERVICE
            </div>
            <h1 className="mx-auto mt-6 max-w-4xl text-5xl font-black leading-[.98] tracking-[-0.04em] sm:text-6xl md:text-7xl">
              Semua kebutuhan digital <span className="block bg-gradient-to-r from-cyan-300 via-sky-300 to-violet-300 bg-clip-text text-transparent">dalam satu tempat.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-sm leading-7 text-slate-400 md:text-base">Beli Panel Bot, Admin Panel, dan Redeem Code REDFINGER dengan proses otomatis, pembayaran QRIS, dan pengiriman cepat.</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href="/store" className="inline-flex h-12 items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-300 to-sky-400 px-6 text-sm font-black text-[#041017]">Lihat Produk <ArrowRight className="h-4 w-4" /></Link>
              <Link href="/login" className="inline-flex h-12 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-6 text-sm font-bold text-white hover:bg-white/[0.06]"><LogIn className="h-4 w-4" /> Login Akun</Link>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-20 md:px-6">
          <div className="text-center">
            <p className="text-sm font-black uppercase tracking-[0.24em] text-cyan-300 md:text-base">LAYANAN KAMI</p>
            <h2 className="mt-3 text-3xl font-black md:text-5xl">Pilih produk yang kamu butuhkan</h2>
            <p className="mt-3 text-sm text-slate-400">Satu website untuk beberapa layanan digital BROCK STORE.</p>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            <ServiceCard icon={<Bot className="h-6 w-6" />} title="Panel Bot" text="Panel Pterodactyl untuk bot WhatsApp, Telegram, Discord, dan kebutuhan lainnya." />
            <ServiceCard icon={<Crown className="h-6 w-6" />} title="Admin Panel" text="Akses administrator untuk kebutuhan pengelolaan panel dengan proses otomatis." />
            <ServiceCard icon={<Cloud className="h-6 w-6" />} title="Code REDFINGER" text="Redeem Code VIP, KVIP, dan SVIP dengan stok real-time dan pengiriman otomatis." />
          </div>
        </section>

        <section className="border-y border-white/5 bg-white/[0.012]">
          <div className="mx-auto grid max-w-7xl gap-4 px-4 py-14 sm:grid-cols-2 lg:grid-cols-4 md:px-6">
            <Stat icon={<Zap className="h-5 w-5" />} value="24/7" label="Sistem Otomatis" />
            <Stat icon={<QrCode className="h-5 w-5" />} value="QRIS" label="Pembayaran Praktis" />
            <Stat icon={<CheckCircle2 className="h-5 w-5" />} value="Instan" label="Proses Pesanan" />
            <Stat icon={<History className="h-5 w-5" />} value="Akun" label="Riwayat Tersimpan" />
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-10 px-4 py-20 md:px-6 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-300">KENAPA BROCK STORE?</p>
            <h2 className="mt-3 text-4xl font-black tracking-tight md:text-5xl">Belanja digital tanpa ribet.</h2>
            <p className="mt-5 max-w-xl text-sm leading-7 text-slate-400">Login tidak diwajibkan. Kamu bisa checkout sebagai tamu, atau login supaya transaksi yang dibuat saat login tersimpan ke akun dan bisa dibuka lagi dari perangkat lain.</p>
            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              {['Pembayaran QRIS otomatis','Detail pesanan via email','Stok REDFINGER real-time','Riwayat transaksi akun'].map((x) => <div key={x} className="flex items-center gap-3 rounded-2xl border border-white/7 bg-white/[0.025] p-4 text-sm font-semibold text-slate-300"><ShieldCheck className="h-4 w-4 text-cyan-300" />{x}</div>)}
            </div>
          </div>
          <div className="rounded-[30px] border border-cyan-300/10 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,.14),transparent_42%),radial-gradient(circle_at_bottom_right,rgba(99,102,241,.16),transparent_42%),#080D18] p-8 sm:p-12">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-300">FLOW PEMBELIAN</p>
            <h3 className="mt-3 text-3xl font-black">Pilih → Bayar → Proses → Selesai</h3>
            <p className="mt-4 text-sm leading-7 text-slate-400">Sistem toko tetap menggunakan flow pembayaran yang sama. Fitur akun hanya menambahkan penyimpanan riwayat untuk transaksi saat kamu login.</p>
            <Link href="/store" className="mt-7 inline-flex items-center gap-2 text-sm font-black text-cyan-300">Buka Katalog <ArrowRight className="h-4 w-4" /></Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

function ServiceCard({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return <Link href="/store" className="group rounded-[24px] border border-white/7 bg-white/[0.025] p-6 transition hover:-translate-y-1 hover:border-cyan-300/20 hover:bg-white/[0.04]"><div className="grid h-12 w-12 place-items-center rounded-2xl bg-cyan-300/8 text-cyan-300">{icon}</div><h3 className="mt-5 text-xl font-black">{title}</h3><p className="mt-3 text-sm leading-6 text-slate-400">{text}</p><span className="mt-5 inline-flex items-center gap-2 text-xs font-black text-cyan-300">Lihat Produk <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" /></span></Link>
}

function Stat({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return <div className="rounded-2xl border border-white/7 bg-white/[0.02] p-5 text-center"><div className="mx-auto grid h-10 w-10 place-items-center rounded-xl bg-white/5 text-cyan-300">{icon}</div><strong className="mt-3 block text-2xl font-black text-cyan-200">{value}</strong><span className="mt-1 block text-xs text-slate-500">{label}</span></div>
}
