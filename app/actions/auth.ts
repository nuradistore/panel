"use server"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import nodemailer from "nodemailer"
import { appConfig } from "@/data/config"
import { createReset, createUser, loginUser, resetPassword, SESSION_COOKIE } from "@/lib/auth"

const enc = (s:string) => encodeURIComponent(s)

export async function registerAction(formData:FormData) {
  const username=String(formData.get("username")||"").trim()
  const email=String(formData.get("email")||"").trim()
  const password=String(formData.get("password")||"")
  if(username.length<3 || password.length<6 || !email.includes("@")) redirect(`/register?error=${enc("Data belum valid. Password minimal 6 karakter.")}`)
  try { await createUser(username,email,password) }
  catch(e:any) { redirect(`/register?error=${enc(e?.message || "Gagal membuat akun.")}`) }
  redirect("/login?success=Akun berhasil dibuat. Silakan login.")
}

export async function loginAction(formData:FormData) {
  const email=String(formData.get("email")||""), password=String(formData.get("password")||"")
  const result=await loginUser(email,password)
  if(!result) redirect(`/login?error=${enc("Email atau password salah.")}`)
  const jar=await cookies()
  jar.set(SESSION_COOKIE,result.token,{httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"lax",path:"/",maxAge:60*60*24*30})
  redirect("/account")
}

export async function logoutAction() {
  const jar=await cookies()
  jar.delete(SESSION_COOKIE)
  redirect("/")
}

export async function forgotAction(formData:FormData) {
  const email=String(formData.get("email")||"").trim().toLowerCase()
  const token=await createReset(email)
  if(token) {
    const app=(process.env.APP_URL||"http://localhost:3000").replace(/\/$/,"")
    const transporter=nodemailer.createTransport({
      host: appConfig.emailSender.host,
      port: appConfig.emailSender.port,
      secure: appConfig.emailSender.secure,
      auth: appConfig.emailSender.auth,
    })
    await transporter.sendMail({
      from: appConfig.emailSender.from,
      to:email,
      subject:"Reset Password - BROCK STORE",
      text:`Halo,\n\nKlik link berikut untuk membuat password baru BROCK STORE:\n${app}/reset-password?token=${token}\n\nLink berlaku 30 menit.\n\nBROCK STORE`,
    })
  }
  redirect(`/forgot-password?success=${enc("Jika email terdaftar, link reset sudah dikirim ke email.")}`)
}

export async function resetAction(formData:FormData) {
  const token=String(formData.get("token")||""), password=String(formData.get("password")||"")
  if(password.length<6) redirect(`/reset-password?token=${enc(token)}&error=${enc("Password minimal 6 karakter.")}`)
  if(!await resetPassword(token,password)) redirect(`/reset-password?error=${enc("Link reset tidak valid atau sudah kedaluwarsa.")}`)
  redirect("/login?success=Password berhasil diganti. Silakan login.")
}
