import Link from "next/link"
import { redirect } from "next/navigation"
import { ExternalLink, Mail, Package, UserRound } from "lucide-react"
import clientPromise from "@/lib/mongodb"
import { appConfig } from "@/data/config"
import { getCurrentUser } from "@/lib/auth"
import Navbar from "@/components/navbar"
import { Footer } from "@/components/footer"
import { formatRupiah } from "@/lib/utils"

export const dynamic = "force-dynamic"

export default async function AccountPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/login?next=/account")

  const client = await clientPromise
  const db = client.db(appConfig.mongodb.dbName)
  const transactions: any[] = await db.collection("payments").find({ userId: user.id }).sort({ createdAt: -1 }).limit(100).toArray()

  return (
    <div className="min-h-screen bg-[#070A10] text-white">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 pb-20 pt-28 md:px-6">
        <div className="rounded-[28px] border border-white/8 bg-white/[0.025] p-6 sm:p-8">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-cyan-300">AKUN BROCK STORE</p>
          <h1 className="mt-2 text-3xl font-black">Halo, {user.username}</h1>
          <div className="mt-5 flex flex-wrap gap-3 text-xs text-slate-400"><span className="flex items-center gap-2 rounded-xl border border-white/7 bg-black/10 px-3 py-2"><UserRound className="h-4 w-4 text-cyan-300" />{user.username}</span><span className="flex items-center gap-2 rounded-xl border border-white/7 bg-black/10 px-3 py-2"><Mail className="h-4 w-4 text-cyan-300" />{user.email}</span></div>
        </div>

        <div className="mt-8 flex items-end justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-300">RIWAYAT AKUN</p><h2 className="mt-1 text-2xl font-black">Transaksi tersimpan</h2></div><Link href="/store" className="rounded-xl bg-cyan-300 px-4 py-2.5 text-xs font-black text-[#041017]">Belanja Lagi</Link></div>

        {transactions.length === 0 ? <div className="mt-6 rounded-[24px] border border-dashed border-white/10 bg-white/[0.015] p-10 text-center"><Package className="mx-auto h-9 w-9 text-slate-600" /><h3 className="mt-4 font-black">Belum ada transaksi akun</h3><p className="mt-2 text-sm text-slate-500">Transaksi yang dibuat setelah kamu login akan muncul di sini.</p></div> :
          <div className="mt-6 grid gap-3">{transactions.map((trx) => <div key={trx.transactionId} className="grid gap-4 rounded-2xl border border-white/7 bg-white/[0.02] p-5 sm:grid-cols-[1fr_auto] sm:items-center"><div><div className="flex flex-wrap items-center gap-2"><h3 className="font-black">{trx.productName || trx.planId}</h3><span className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase ${trx.status === 'completed' ? 'bg-emerald-400/10 text-emerald-300' : trx.status === 'failed' ? 'bg-red-400/10 text-red-300' : 'bg-amber-400/10 text-amber-300'}`}>{trx.status}</span></div><p className="mt-1 font-mono text-[11px] text-slate-500">{trx.transactionId}</p><div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-400"><span>{formatRupiah(Number(trx.total || 0))}</span><span>•</span><span>{new Date(trx.createdAt).toLocaleString('id-ID')}</span></div></div><Link href={`/invoice/${trx.transactionId}`} className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/8 bg-white/[0.03] px-4 py-2.5 text-xs font-black text-cyan-300 hover:bg-white/[0.06]">Buka Invoice <ExternalLink className="h-3.5 w-3.5" /></Link></div>)}</div>}
      </main>
      <Footer />
    </div>
  )
}
