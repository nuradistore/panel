"use client"

import { FormEvent, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { CheckCircle2, KeyRound } from "lucide-react"
import { AuthShell } from "@/components/auth/auth-shell"

export default function ResetPasswordPage() {
  const search = useSearchParams()
  const token = search.get("token") || ""
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [done, setDone] = useState(false)

  async function submit(e: FormEvent) {
    e.preventDefault(); setError("")
    if (password !== confirm) return setError("Konfirmasi password tidak sama")
    setLoading(true)
    try {
      const res = await fetch("/api/auth/reset-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, password }) })
      const data = await res.json(); if (!res.ok || !data.success) throw new Error(data.error || "Reset gagal")
      setDone(true)
    } catch (err) { setError(err instanceof Error ? err.message : "Reset gagal") }
    finally { setLoading(false) }
  }

  return (
    <AuthShell eyebrow="Password Baru" title={done ? "Password berhasil diubah" : "Buat password baru"} description={done ? "Password lama sudah tidak berlaku. Silakan login menggunakan password baru." : "Link reset berlaku 30 menit. Gunakan password minimal 8 karakter."}>
      {done ? <div className="rounded-2xl border border-emerald-400/15 bg-emerald-400/5 p-5 text-center"><CheckCircle2 className="mx-auto h-9 w-9 text-emerald-300" /><p className="mt-3 text-sm text-slate-300">Akunmu siap digunakan kembali.</p><Link href="/login" className="mt-5 inline-flex h-11 items-center justify-center rounded-xl bg-cyan-300 px-5 text-sm font-black text-[#041017]">Login Sekarang</Link></div> :
      <form onSubmit={submit} className="space-y-4">
        {!token && <p className="rounded-xl border border-red-400/15 bg-red-400/5 px-4 py-3 text-xs text-red-300">Token reset tidak ditemukan. Minta link baru dari halaman Lupa Password.</p>}
        <label className="block"><span className="mb-2 flex items-center gap-2 text-xs font-bold text-slate-400"><KeyRound className="h-4 w-4 text-cyan-300" />Password Baru</span><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="auth-input" placeholder="Minimal 8 karakter" required /></label>
        <label className="block"><span className="mb-2 flex items-center gap-2 text-xs font-bold text-slate-400"><KeyRound className="h-4 w-4 text-cyan-300" />Ulangi Password</span><input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className="auth-input" placeholder="Ulangi password baru" required /></label>
        {error && <p className="rounded-xl border border-red-400/15 bg-red-400/5 px-4 py-3 text-xs text-red-300">{error}</p>}
        <button disabled={loading || !token} className="h-12 w-full rounded-xl bg-gradient-to-r from-cyan-300 to-sky-400 text-sm font-black text-[#041017] disabled:opacity-50">{loading ? "Menyimpan..." : "Simpan Password Baru"}</button>
      </form>}
    </AuthShell>
  )
}
