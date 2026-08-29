"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import nodemailer from "nodemailer"
import { appConfig } from "@/data/config"
import {
  createReset,
  createUser,
  loginUser,
  resetPassword,
  SESSION_COOKIE,
} from "@/lib/auth"

const enc = (s: string) => encodeURIComponent(s)

export async function registerAction(formData: FormData) {
  const username = String(formData.get("username") || "").trim()
  const email = String(formData.get("email") || "").trim().toLowerCase()
  const password = String(formData.get("password") || "")

  if (username.length < 3 || password.length < 6 || !email.includes("@")) {
    redirect(`/register?error=${enc("Data belum valid. Password minimal 6 karakter.")}`)
  }

  try {
    await createUser(username, email, password)
  } catch (error: any) {
    redirect(`/register?error=${enc(error?.message || "Gagal membuat akun.")}`)
  }

  redirect("/login?success=Akun berhasil dibuat. Silakan login.")
}

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") || "").trim().toLowerCase()
  const password = String(formData.get("password") || "")

  const result = await loginUser(email, password)

  if (!result) {
    redirect(`/login?error=${enc("Email atau password salah.")}`)
  }

  const jar = await cookies()

  jar.set(SESSION_COOKIE, result.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  })

  redirect("/account")
}

export async function logoutAction() {
  const jar = await cookies()
  jar.delete(SESSION_COOKIE)
  redirect("/")
}

export async function forgotAction(formData: FormData) {
  const email = String(formData.get("email") || "").trim().toLowerCase()

  try {
    const token = await createReset(email)

    if (token) {
      const app = (process.env.APP_URL || "http://localhost:3000").replace(/\/$/, "")

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: appConfig.emailSender.auth.user,
          pass: appConfig.emailSender.auth.pass,
        },
      })

      await transporter.sendMail({
        from: appConfig.emailSender.from,
        to: email,
        subject: "Reset Password - BROCK STORE",
        text: `Halo,

Kami menerima permintaan untuk mengganti password akun BROCK STORE.

Klik link berikut untuk membuat password baru:

${app}/reset-password?token=${token}

Link reset password ini berlaku selama 30 menit.

Jika kamu tidak meminta penggantian password, abaikan email ini.

BROCK STORE`,
      })
    }
  } catch (error) {
    console.error("FORGOT PASSWORD ERROR:", error)

    redirect(
      `/forgot-password?error=${enc(
        "Gagal mengirim email reset password. Silakan coba lagi.",
      )}`,
    )
  }

  redirect(
    `/forgot-password?success=${enc(
      "Jika email terdaftar, link reset sudah dikirim ke email.",
    )}`,
  )
}

export async function resetAction(formData: FormData) {
  const token = String(formData.get("token") || "")
  const password = String(formData.get("password") || "")

  if (password.length < 6) {
    redirect(
      `/reset-password?token=${enc(token)}&error=${enc(
        "Password minimal 6 karakter.",
      )}`,
    )
  }

  const success = await resetPassword(token, password)

  if (!success) {
    redirect(
      `/reset-password?error=${enc(
        "Link reset tidak valid atau sudah kedaluwarsa.",
      )}`,
    )
  }

  redirect("/login?success=Password berhasil diganti. Silakan login.")
}
