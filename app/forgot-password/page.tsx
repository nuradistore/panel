"use client"

import { FormEvent, useState } from "react"
import Link from "next/link"
import { Mail, Send } from "lucide-react"
import { AuthShell } from "@/components/auth/auth-shell"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  async function submit(e: FormEvent) {
    e.preventDefault(); setLoading(true); setMessage("")
    try {
      const res = await fetch("/api/auth/forgot-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) })
      const data = await res.json(); setMessage(data.message || "Jika email terdaftar, link reset telah dikirim.")
    } finally { setLoading(false) }
  }

  return (
    <AuthShell eyebrow="Pemulihan Akun" title="Lupa password?" description="Masukkan email akunmu. Jika terdaftar, BROCK STORE akan mengirim link untuk membuat password baru.">
      <form onSubmit={submit} className="space-y-4">
        <label className="block"><span className="mb-2 flex items-center gap-2 text-xs font-bold text-slate-400"><Mail className="h-4 w-4 text-cyan-300" />Email Akun</span><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="auth-input" placeholder="nama@email.com" required /></label>
        {message && <p className="rounded-xl border border-cyan-300/15 bg-cyan-300/5 px-4 py-3 text-xs leading-5 text-cyan-100">{message}</p>}
        <button disabled={loading} className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-300 to-sky-400 text-sm font-black text-[#041017] disabled:opacity-60"><Send className="h-4 w-4" />{loading ? "Mengirim..." : "Kirim Link Reset"}</button>
      </form>
      <Link href="/login" className="mt-6 block text-center text-xs font-bold text-slate-400 hover:text-white">← Kembali ke Login</Link>
    </AuthShell>
  )
}
