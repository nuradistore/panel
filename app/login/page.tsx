"use client"

import { FormEvent, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Eye, EyeOff, LockKeyhole, LogIn, UserRound } from "lucide-react"
import { AuthShell } from "@/components/auth/auth-shell"

export default function LoginPage() {
  const router = useRouter()
  const search = useSearchParams()
  const [login, setLogin] = useState("")
  const [password, setPassword] = useState("")
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function submit(e: FormEvent) {
    e.preventDefault()
    setLoading(true); setError("")
    try {
      const res = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ login, password }) })
      const data = await res.json()
      if (!res.ok || !data.success) throw new Error(data.error || "Login gagal")
      const next = search.get("next") || "/account"
      router.push(next.startsWith("/") ? next : "/account")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login gagal")
    } finally { setLoading(false) }
  }

  return (
    <AuthShell eyebrow="Selamat Datang" title="Login ke akunmu" description="Masuk untuk melihat transaksi yang kamu lakukan saat login. Checkout sebagai tamu tetap tersedia.">
      <form onSubmit={submit} className="space-y-4">
        <Field label="Username atau Email" icon={<UserRound className="h-4 w-4" />}>
          <input value={login} onChange={(e) => setLogin(e.target.value)} className="auth-input" placeholder="brock123 atau email@gmail.com" autoComplete="username" required />
        </Field>
        <Field label="Password" icon={<LockKeyhole className="h-4 w-4" />}>
          <div className="relative">
            <input type={show ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} className="auth-input pr-12" placeholder="Masukkan password" autoComplete="current-password" required />
            <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white" aria-label="Tampilkan password">{show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
          </div>
        </Field>
        <div className="flex justify-end"><Link href="/forgot-password" className="text-xs font-bold text-cyan-300 hover:text-cyan-200">Lupa Password?</Link></div>
        {error && <p className="rounded-xl border border-red-400/15 bg-red-400/5 px-4 py-3 text-xs text-red-300">{error}</p>}
        <button disabled={loading} className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-300 to-sky-400 text-sm font-black text-[#041017] disabled:opacity-60"><LogIn className="h-4 w-4" />{loading ? "Memproses..." : "Login"}</button>
      </form>
      <p className="mt-6 text-center text-xs text-slate-500">Belum punya akun? <Link href="/register" className="font-bold text-cyan-300">Daftar sekarang</Link></p>
      <Link href="/store" className="mt-3 block text-center text-xs font-semibold text-slate-500 hover:text-white">Lanjut belanja sebagai tamu →</Link>
    </AuthShell>
  )
}

function Field({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) {
  return <label className="block"><span className="mb-2 flex items-center gap-2 text-xs font-bold text-slate-400"><span className="text-cyan-300">{icon}</span>{label}</span>{children}</label>
}
