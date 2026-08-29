"use client"

import { useState } from "react"
import PanelForm from "@/components/panel-form"
import { InfoSection } from "@/components/info-section"
import { StatsSection } from "@/components/stats-section"
import { FaqSection } from "@/components/faq"
import type { StoreCategory } from "@/data/store-categories"
import {
  ArrowDownRight,
  Bot,
  Cloud,
  Crown,
  ShieldCheck,
  Zap,
} from "lucide-react"

const hero = {
  "panel-bot": {
    eyebrow: "LAYANAN PANEL INSTAN",
    title: "Panel cepat.",
    accent: "Setup tanpa ribet.",
    text: "Pilih paket Panel Bot, isi username dan email aktif, lalu lanjutkan pembayaran QRIS. Setelah pembayaran berhasil, akun dan server dibuat otomatis.",
  },

  "admin-panel": {
    eyebrow: "LAYANAN ADMIN PANEL",
    title: "Kelola panel.",
    accent: "Akses lebih luas.",
    text: "Pilih paket Admin Panel, isi username dan email aktif, lalu lanjutkan pembayaran. Detail akses dikirim otomatis setelah transaksi selesai.",
  },

  redfinger: {
    eyebrow: "LAYANAN REDFINGER INSTAN",
    title: "Kode REDFINGER.",
    accent: "Langsung terkirim.",
    text: "Pilih REDFINGER VIP 7 Hari atau 30 Hari, isi nomor WhatsApp dan email aktif. Setelah pembayaran berhasil, redeem code langsung tampil di invoice dan dikirim ke email.",
  },
} satisfies Record<
  StoreCategory,
  {
    eyebrow: string
    title: string
    accent: string
    text: string
  }
>

export function StorefrontHome() {
  const [activeCategory, setActiveCategory] =
    useState<StoreCategory>("panel-bot")

  const copy = hero[activeCategory]

  return (
    <main>
      <section className="relative overflow-hidden border-b border-white/5 pt-28 pb-16 md:pt-36 md:pb-24">
        <div className="absolute inset-0 hero-grid opacity-30" />

        <div className="absolute -top-32 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-cyan-400/10 blur-[100px]" />

        <div className="absolute right-0 top-20 h-80 w-80 rounded-full bg-violet-500/10 blur-[120px]" />

        <div className="relative mx-auto grid max-w-7xl gap-12 px-4 md:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <div className="lg:sticky lg:top-28">

            {/* HERO BADGE */}
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/5 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">
              <span className="h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_14px_rgba(103,232,249,.9)]" />

              {copy.eyebrow}
            </div>

            {/* HERO TITLE */}
            <h1 className="mt-6 max-w-xl text-4xl font-black leading-[1.05] tracking-tight md:text-6xl">
              {copy.title}

              <span className="block bg-gradient-to-r from-cyan-300 via-sky-300 to-violet-300 bg-clip-text text-transparent">
                {copy.accent}
              </span>
            </h1>

            {/* HERO DESCRIPTION */}
            <p className="mt-5 max-w-lg text-sm leading-7 text-slate-400 md:text-base">
              {copy.text}
            </p>

            {/* MINI FEATURES */}
            <div className="mt-8 grid max-w-lg grid-cols-3 gap-3">
              <MiniStat
                icon={
                  activeCategory === "redfinger" ? (
                    <Cloud className="h-4 w-4" />
                  ) : activeCategory === "admin-panel" ? (
                    <Crown className="h-4 w-4" />
                  ) : (
                    <Bot className="h-4 w-4" />
                  )
                }
                label={
                  activeCategory === "redfinger"
                    ? "Code Ready"
                    : activeCategory === "admin-panel"
                      ? "Admin Ready"
                      : "Bot Ready"
                }
              />

              <MiniStat
                icon={<Zap className="h-4 w-4" />}
                label={
                  activeCategory === "redfinger"
                    ? "Kirim Instan"
                    : "Fast Setup"
                }
              />

              <MiniStat
                icon={<ShieldCheck className="h-4 w-4" />}
                label={
                  activeCategory === "redfinger"
                    ? "Code Aman"
                    : "Secure"
                }
              />
            </div>

            {/* BUTTON */}
            <a
              href="#order"
              className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-white hover:text-cyan-200"
            >
              {activeCategory === "redfinger"
                ? "Pilih REDFINGER sekarang"
                : activeCategory === "admin-panel"
                  ? "Pilih Admin Panel sekarang"
                  : "Pilih Panel Bot sekarang"}

              <ArrowDownRight className="h-4 w-4" />
            </a>
          </div>

          {/* ORDER FORM */}
          <div id="order" className="scroll-mt-28">
            <PanelForm
              activeCategory={activeCategory}
              onCategoryChange={setActiveCategory}
            />
          </div>
        </div>
      </section>

      {/* CONTENT BERUBAH SESUAI TAB */}
      <InfoSection category={activeCategory} />

      <StatsSection category={activeCategory} />

      <FaqSection category={activeCategory} />
    </main>
  )
}

function MiniStat({
  icon,
  label,
}: {
  icon: React.ReactNode
  label: string
}) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.025] px-3 py-3 text-center">
      <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-xl bg-white/5 text-cyan-200">
        {icon}
      </div>

      <div className="text-[11px] font-semibold text-slate-300">
        {label}
      </div>
    </div>
  )
}