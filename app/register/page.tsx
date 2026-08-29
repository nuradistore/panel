"use client"

import { FormEvent, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, LockKeyhole, Mail, UserPlus, UserRound } from "lucide-react"
import { AuthShell } from "@/components/auth/auth-shell"

export default function RegisterPage() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function submit(e: FormEvent) {
    e.preventDefault(); setError("")
    if (password !== confirm) return setError("Konfirmasi password tidak sama")
    setLoading(true)
    try {
      const res = await fetch("/api/auth/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username, email, password }) })
      const data = await res.json()
      if (!res.ok || !data.success) throw new Error(data.error || "Gagal membuat akun")
      router.push("/account"); router.refresh()
    } catch (err) { setError(err instanceof Error ? err.message : "Gagal membuat akun") }
    finally { setLoading(false) }
  }

  return (
    <AuthShell eyebrow="Buat Akun" title="Daftar BROCK STORE" description="Akun hanya menyimpan username, email, dan password yang sudah di-hash. Tidak wajib punya akun untuk melakukan checkout.">
      <form onSubmit={submit} className="space-y-4">
        <Field label="Username" icon={<UserRound className="h-4 w-4" />}><input value={username} onChange={(e) => setUsername(e.target.value)} className="auth-input" placeholder="contoh: brock123" autoComplete="username" required /></Field>
        <Field label="Email Aktif" icon={<Mail className="h-4 w-4" />}><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="auth-input" placeholder="nama@email.com" autoComplete="email" required /></Field>
        <Field label="Password" icon={<LockKeyhole className="h-4 w-4" />}><div className="relative"><input type={show ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} className="auth-input pr-12" placeholder="Minimal 8 karakter" autoComplete="new-password" required /><button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">{show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div></Field>
        <Field label="Ulangi Password" icon={<LockKeyhole className="h-4 w-4" />}><input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className="auth-input" placeholder="Ulangi password" autoComplete="new-password" required /></Field>
        {error && <p className="rounded-xl border border-red-400/15 bg-red-400/5 px-4 py-3 text-xs text-red-300">{error}</p>}
        <button disabled={loading} className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-300 to-sky-400 text-sm font-black text-[#041017] disabled:opacity-60"><UserPlus className="h-4 w-4" />{loading ? "Membuat akun..." : "Buat Akun"}</button>
      </form>
      <p className="mt-6 text-center text-xs text-slate-500">Sudah punya akun? <Link href="/login" className="font-bold text-cyan-300">Login</Link></p>
    </AuthShell>
  )
}

function Field({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) { return <label className="block"><span className="mb-2 flex items-center gap-2 text-xs font-bold text-slate-400"><span className="text-cyan-300">{icon}</span>{label}</span>{children}</label> }
