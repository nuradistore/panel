"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Bot, History, Home, LogIn, LogOut, Menu, ShieldCheck, ShoppingBag, UserRound, Users, X } from "lucide-react"
import { appConfig } from "@/data/config"

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [user, setUser] = useState<{ username: string; email: string } | null>(null)

  useEffect(() => {
    fetch("/api/auth/me", { cache: "no-store" }).then((r) => r.json()).then((d) => setUser(d.user || null)).catch(() => {})
  }, [])

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" })
    setUser(null)
    window.location.href = "/"
  }

  const links = [
    { href: "/", label: "Home", icon: Home },
    { href: "/store", label: "Toko", icon: ShoppingBag },
    { href: user ? "/account" : "/history", label: user ? "Akun" : "Riwayat", icon: user ? UserRound : History },
    { href: "/garansi", label: "Garansi", icon: ShieldCheck },
  ]

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/5 bg-[#070A10]/85 backdrop-blur-xl">
      <div className="mx-auto flex h-[74px] max-w-7xl items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-300/10 text-cyan-200"><Bot className="h-5 w-5" /></span>
          <div className="leading-none"><div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500">Digital Store</div><div className="mt-1 text-base font-black tracking-tight text-white">{appConfig.nameHost}</div></div>
        </Link>

        <nav className="hidden items-center gap-1 rounded-2xl border border-white/8 bg-white/[0.025] p-1 md:flex">
          {links.map(({ href, label, icon: Icon }) => <Link key={href} href={href} className="flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-400 transition hover:bg-white/5 hover:text-white"><Icon className="h-4 w-4" />{label}</Link>)}
          <a href={appConfig.whatsappGroupLink} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-400 transition hover:bg-white/5 hover:text-white"><Users className="h-4 w-4" />Komunitas</a>
          {user ? <button onClick={logout} className="ml-1 flex items-center gap-2 rounded-xl bg-white/5 px-3.5 py-2 text-xs font-bold text-slate-300 hover:bg-white/10"><LogOut className="h-4 w-4" />Keluar</button> : <Link href="/login" className="ml-1 flex items-center gap-2 rounded-xl bg-cyan-300 px-3.5 py-2 text-xs font-black text-[#041017]"><LogIn className="h-4 w-4" />Login</Link>}
        </nav>

        <button onClick={() => setOpen(!open)} className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white md:hidden" aria-label="Menu">{open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</button>
      </div>

      {open && <div className="border-t border-white/5 bg-[#090D14] px-4 py-4 md:hidden"><div className="grid gap-2">{links.map(({ href, label, icon: Icon }) => <Link key={href} href={href} onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-xl border border-white/6 bg-white/[0.02] px-4 py-3 text-sm font-semibold text-slate-300"><Icon className="h-4 w-4 text-cyan-300" />{label}</Link>)}<a href={appConfig.whatsappGroupLink} target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-xl border border-white/6 bg-white/[0.02] px-4 py-3 text-sm font-semibold text-slate-300"><Users className="h-4 w-4 text-cyan-300" />Komunitas</a>{user ? <button onClick={logout} className="flex items-center gap-3 rounded-xl border border-white/6 bg-white/[0.02] px-4 py-3 text-left text-sm font-semibold text-slate-300"><LogOut className="h-4 w-4 text-cyan-300" />Keluar ({user.username})</button> : <Link href="/login" onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-xl bg-cyan-300 px-4 py-3 text-sm font-black text-[#041017]"><LogIn className="h-4 w-4" />Login / Daftar</Link>}</div></div>}
    </header>
  )
}
