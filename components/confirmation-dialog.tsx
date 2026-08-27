"use client"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { formatRupiah } from "@/lib/utils"
import { plans } from "@/data/plans"
import { Loader2 } from "lucide-react"

interface ConfirmationDialogProps { open: boolean; onOpenChange: (open: boolean) => void; planId: string; onConfirm: () => void; isLoading: boolean }

export function ConfirmationDialog({ open, onOpenChange, planId, onConfirm, isLoading }: ConfirmationDialogProps) {
  if (!planId) return null
  const plan = plans?.find((p) => p?.id === planId)
  if (!plan) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md border-white/10 bg-[#0b1020] text-white shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl">Konfirmasi Pembelian</DialogTitle>
          <DialogDescription className="text-slate-400">Pastikan paket yang kamu pilih sudah benar.</DialogDescription>
        </DialogHeader>
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
          <div className="text-sm font-bold text-white">{plan.name}</div>
          <div className="mt-1 text-2xl font-black text-cyan-300">{formatRupiah(plan.price)}</div>
          <div className="mt-4 grid grid-cols-2 gap-2 text-xs"><span className="text-slate-500">RAM</span><span>{plan.memory === 0 ? "Unlimited" : `${plan.memory} MB`}</span><span className="text-slate-500">Disk</span><span>{plan.disk === 0 ? "Unlimited" : `${plan.disk} MB`}</span><span className="text-slate-500">CPU</span><span>{plan.cpu === 0 ? "Unlimited" : `${plan.cpu}%`}</span></div>
        </div>
        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading} className="border-white/10 bg-white/5 text-white hover:bg-white/10">Batal</Button>
          <Button onClick={onConfirm} disabled={isLoading} className="bg-gradient-to-r from-cyan-400 to-blue-500 font-bold text-slate-950 hover:brightness-110">{isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Memproses...</> : "Lanjutkan Pembayaran"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
