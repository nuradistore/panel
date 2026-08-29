import Link from "next/link"
import { ArrowLeft, LockKeyhole, Mail, User } from "lucide-react"
import { forgotAction, loginAction, registerAction, resetAction } from "@/app/actions/auth"

export function AuthForm({mode,token="",error="",success=""}:{mode:"login"|"register"|"forgot"|"reset",token?:string,error?:string,success?:string}) {
  const action=mode==="login"?loginAction:mode==="register"?registerAction:mode==="forgot"?forgotAction:resetAction
  const title={login:"Selamat datang kembali.",register:"Buat akun BROCK STORE.",forgot:"Lupa password?",reset:"Buat password baru."}[mode]
  const sub={login:"Login untuk menyimpan dan melihat transaksi akunmu.",register:"Daftar sekali, riwayat transaksi bisa tetap tersimpan.",forgot:"Masukkan email akunmu. Kami kirim link reset password.",reset:"Masukkan password baru untuk akun BROCK STORE."}[mode]
  return <main className="min-h-screen bg-[#050914] px-4 py-12 text-white">
    <div className="mx-auto max-w-md">
      <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white"><ArrowLeft className="h-4 w-4"/>Kembali ke Home</Link>
      <div className="rounded-[2rem] border border-white/10 bg-white/[.025] p-6 shadow-2xl md:p-8">
        <div className="mb-7"><div className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-cyan-300 to-sky-500 font-black text-slate-950">B</div><div className="text-xs font-black tracking-[.25em] text-cyan-300">BROCK STORE</div><h1 className="mt-2 text-3xl font-black">{title}</h1><p className="mt-3 text-sm leading-6 text-slate-400">{sub}</p></div>
        <form action={action} className="space-y-4">
          {mode==="register" && <Field name="username" label="Username" type="text" icon={<User className="h-4 w-4"/>}/>}
          {(mode==="login"||mode==="register"||mode==="forgot") && <Field name="email" label="Email Aktif" type="email" icon={<Mail className="h-4 w-4"/>}/>}
          {(mode==="login"||mode==="register"||mode==="reset") && <Field name="password" label={mode==="reset"?"Password Baru":"Password"} type="password" icon={<LockKeyhole className="h-4 w-4"/>}/>}
          {mode==="reset" && <input type="hidden" name="token" value={token}/>}
          {error && <div className="rounded-xl border border-red-400/20 bg-red-400/10 p-3 text-sm text-red-200">{error}</div>}
          {success && <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 p-3 text-sm text-emerald-200">{success}</div>}
          {mode==="login" && <div className="text-right"><Link href="/forgot-password" className="text-xs font-bold text-cyan-300">Lupa Password?</Link></div>}
          <button className="h-12 w-full rounded-xl bg-gradient-to-r from-cyan-300 to-sky-400 font-black text-slate-950">{mode==="login"?"Login":mode==="register"?"Buat Akun":mode==="forgot"?"Kirim Link Reset":"Simpan Password Baru"}</button>
        </form>
        <div className="mt-6 text-center text-sm text-slate-500">
          {mode==="login" && <>Belum punya akun? <Link className="font-bold text-cyan-300" href="/register">Daftar</Link></>}
          {mode==="register" && <>Sudah punya akun? <Link className="font-bold text-cyan-300" href="/login">Login</Link></>}
          {(mode==="forgot"||mode==="reset") && <Link className="font-bold text-cyan-300" href="/login">Kembali ke Login</Link>}
        </div>
        {mode==="login" && <Link href="/store" className="mt-4 block text-center text-xs text-slate-500 hover:text-white">Lanjut belanja sebagai tamu →</Link>}
      </div>
    </div>
  </main>
}
function Field({name,label,type,icon}:{name:string,label:string,type:string,icon:React.ReactNode}) {
  return <label className="block"><span className="mb-2 flex items-center gap-2 text-xs font-bold text-slate-400">{icon}{label}</span><input name={name} type={type} required className="h-12 w-full rounded-xl border border-white/10 bg-[#070B15] px-4 outline-none focus:border-cyan-300/50" /></label>
}
