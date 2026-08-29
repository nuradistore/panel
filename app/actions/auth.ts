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

  console.log("REGISTER ACTION START:", email)

  if (
    username.length < 3 ||
    password.length < 6 ||
    !email.includes("@")
  ) {
    redirect(
      `/register?error=${enc(
        "Data belum valid. Password minimal 6 karakter."
      )}`
    )
  }

  let registerError = ""

  try {
    await createUser(username, email, password)
    console.log("REGISTER SUCCESS:", email)
  } catch (error: any) {
    console.error("REGISTER ERROR:", error)

    registerError =
      error?.message || "Gagal membuat akun."
  }

  if (registerError) {
    redirect(
      `/register?error=${enc(registerError)}`
    )
  }

  redirect(
    "/login?success=Akun berhasil dibuat. Silakan login."
  )
}

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") || "")
    .trim()
    .toLowerCase()

  const password = String(formData.get("password") || "")

  console.log("LOGIN ACTION START:", email)

  let result

  try {
    result = await loginUser(email, password)

    console.log(
      "LOGIN DATABASE FINISH:",
      !!result
    )
  } catch (error) {
    console.error(
      "LOGIN DATABASE ERROR:",
      error
    )

    redirect(
      `/login?error=${enc(
        "Terjadi kesalahan saat menghubungkan akun. Coba lagi."
      )}`
    )
  }

  if (!result) {
    redirect(
      `/login?error=${enc(
        "Email atau password salah."
      )}`
    )
  }

  const jar = await cookies()

  jar.set(
    SESSION_COOKIE,
    result.token,
    {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    }
  )

  console.log("LOGIN SUCCESS:", email)

  redirect("/store")
}

export async function logoutAction() {
  const jar = await cookies()

  jar.delete(SESSION_COOKIE)

  redirect("/")
}

export async function forgotAction(formData: FormData) {
  const email = String(formData.get("email") || "")
    .trim()
    .toLowerCase()

  if (!email || !email.includes("@")) {
    redirect(
      `/forgot-password?error=${enc(
        "Masukkan email yang valid."
      )}`
    )
  }

  let resetToken = ""

  try {
    resetToken = await createReset(email)
  } catch (error) {
    console.error(
      "CREATE RESET ERROR:",
      error
    )

    redirect(
      `/forgot-password?error=${enc(
        "Terjadi kesalahan. Silakan coba lagi."
      )}`
    )
  }

  if (!resetToken) {
    redirect(
      `/forgot-password?success=${enc(
        "Jika email terdaftar, link reset password akan dikirim."
      )}`
    )
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",

      auth: {
        user: appConfig.smtp.user,
        pass: appConfig.smtp.password,
      },
    })

    const resetUrl =
      `${process.env.APP_URL || appConfig.appUrl}` +
      `/reset-password?token=${encodeURIComponent(
        resetToken
      )}`

    await transporter.sendMail({
      from: `"BROCK STORE" <${appConfig.smtp.user}>`,
      to: email,
      subject: "Reset Password BROCK STORE",

      text:
        `Reset password akun BROCK STORE kamu:\n\n` +
        `${resetUrl}\n\n` +
        `Link ini memiliki masa berlaku terbatas.`,

      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.6">
          <h2>Reset Password BROCK STORE</h2>

          <p>Kami menerima permintaan reset password untuk akun kamu.</p>

          <p>
            <a href="${resetUrl}"
               style="
                 display:inline-block;
                 padding:12px 20px;
                 background:#22d3ee;
                 color:#071017;
                 text-decoration:none;
                 border-radius:8px;
                 font-weight:bold;
               ">
              Reset Password
            </a>
          </p>

          <p>
            Jika kamu tidak meminta reset password,
            abaikan email ini.
          </p>
        </div>
      `,
    })

    console.log(
      "RESET EMAIL SENT:",
      email
    )
  } catch (error) {
    console.error(
      "RESET EMAIL ERROR:",
      error
    )

    redirect(
      `/forgot-password?error=${enc(
        "Email reset gagal dikirim. Silakan coba lagi."
      )}`
    )
  }

  redirect(
    `/forgot-password?success=${enc(
      "Jika email terdaftar, link reset password akan dikirim."
    )}`
  )
}

export async function resetAction(formData: FormData) {
  const token = String(formData.get("token") || "")
  const password = String(
    formData.get("password") || ""
  )

  if (!token) {
    redirect(
      `/reset-password?error=${enc(
        "Token reset tidak ditemukan."
      )}`
    )
  }

  if (password.length < 6) {
    redirect(
      `/reset-password?token=${encodeURIComponent(
        token
      )}&error=${enc(
        "Password minimal 6 karakter."
      )}`
    )
  }

  let success = false

  try {
    success = await resetPassword(
      token,
      password
    )
  } catch (error) {
    console.error(
      "RESET PASSWORD ERROR:",
      error
    )

    redirect(
      `/reset-password?token=${encodeURIComponent(
        token
      )}&error=${enc(
        "Terjadi kesalahan saat reset password."
      )}`
    )
  }

  if (!success) {
    redirect(
      `/reset-password?error=${enc(
        "Token tidak valid atau sudah kedaluwarsa."
      )}`
    )
  }

  redirect(
    `/login?success=${enc(
      "Password berhasil diubah. Silakan login."
    )}`
  )
}
