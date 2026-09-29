import nodemailer from "nodemailer"
import { appConfig, pterodactylConfig } from "@/data/config"

type PanelType = "panel-bot" | "admin-panel"
const CHANNELS = appConfig.emailChannels
const CONTACT = appConfig.contact

// Dua tombol yang tampil di SEMUA email pesanan: Saluran WhatsApp + All Transaksi (Telegram).
// Ubah link/label di data/config.ts -> emailChannels.
function channelButtonsHtml() {
  const btn = "display:inline-block;margin:5px;padding:12px 18px;border-radius:10px;font-weight:800;font-size:14px;text-decoration:none"
  return `<div style="text-align:center;margin:24px 0 8px">
    <a href="${CHANNELS.whatsappChannel.url}" style="${btn};background:#25D366;color:#07120b">📢 ${CHANNELS.whatsappChannel.label}</a>
    <a href="${CHANNELS.allTransaksi.url}" style="${btn};background:#229ED9;color:#ffffff">🧾 ${CHANNELS.allTransaksi.label}</a>
  </div>
  <p style="text-align:center;font-size:12px;opacity:.7;margin:6px 0 0">Ikuti saluran untuk info terbaru, dan cek All Transaksi untuk melihat transaksi Brock Store.</p>`
}

function channelButtonsText() {
  return `${CHANNELS.whatsappChannel.label}: ${CHANNELS.whatsappChannel.url}\n${CHANNELS.allTransaksi.label}: ${CHANNELS.allTransaksi.url}`
}

// Kalimat bantuan yang seragam untuk semua email.
function supportHtml() {
  return `<p>Ada kendala dengan pesananmu? Tenang, tim ${appConfig.nameHost} siap bantu. Hubungi kami lewat WhatsApp <b>${CONTACT.whatsappNumber}</b> atau Telegram <b>${CONTACT.telegramUsername}</b>, dan sertakan ID Transaksi supaya lebih cepat ditangani.</p>`
}

const transporter = nodemailer.createTransport({
  host: appConfig.emailSender.host,
  port: appConfig.emailSender.port,
  secure: appConfig.emailSender.secure,
  auth: {
    user: appConfig.emailSender.auth.user,
    pass: appConfig.emailSender.auth.pass,
  },
})

export async function sendRegistrationVerificationEmail(to: string, code: string) {
  const template = appConfig.emailTemplates.verification
  const minutes = appConfig.auth.verificationCodeMinutes

  return sendMailSafe({
    to,
    subject: template.subject,
    text: `${template.title}\n\nKode verifikasi pendaftaran kamu: ${code}\n\nKode berlaku selama ${minutes} menit.\n\nJangan berikan kode ini kepada siapa pun.\n\nBROCK STORE`,
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.7;color:#111;max-width:600px;margin:0 auto">
        <h2 style="margin-bottom:18px">${template.title}</h2>
        <p>Halo,</p>
        <p>Gunakan kode berikut untuk menyelesaikan pendaftaran akun BROCK STORE:</p>
        <div style="margin:24px 0;padding:18px;border-radius:12px;background:#f1f5f9;text-align:center;font-size:30px;font-weight:800;letter-spacing:8px">${code}</div>
        <p>Kode verifikasi ini berlaku selama <strong>${minutes} menit</strong>.</p>
        <p>Jangan berikan kode ini kepada siapa pun.</p>
        <p style="margin-top:32px;color:#888">BROCK STORE</p>
      </div>
    `,
  })
}

export async function sendResetPasswordEmail(to: string, resetUrl: string) {
  const template = appConfig.emailTemplates.resetPassword
  const minutes = appConfig.auth.resetPasswordMinutes

  return sendMailSafe({
    to,
    subject: template.subject,
    text: `Halo,\n\nKami menerima permintaan untuk mengganti password akun BROCK STORE.\n\nKlik link berikut untuk membuat password baru:\n\n${resetUrl}\n\nLink reset password ini berlaku selama ${minutes} menit.\n\nJika kamu tidak meminta penggantian password, abaikan email ini.\n\nBROCK STORE`,
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.7;color:#111;max-width:600px;margin:0 auto">
        <h2>${template.title}</h2>
        <p>Halo,</p>
        <p>Kami menerima permintaan untuk mengganti password akun BROCK STORE.</p>
        <p>Klik link berikut untuk membuat password baru:</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
        <p>Link reset password ini berlaku selama <strong>${minutes} menit</strong>.</p>
        <p>Jika kamu tidak meminta penggantian password, abaikan email ini.</p>
        <p style="margin-top:32px;color:#888">BROCK STORE</p>
      </div>
    `,
  })
}

export async function sendPanelDetailsEmail(
  to: string,
  username: string,
  password: string,
  serverId: number | null,
  planName: string,
  panelType: PanelType = "panel-bot",
  transactionId?: string,
) {
  const panelUrl = pterodactylConfig.domain
  const isAdmin = panelType === "admin-panel"
  const template = isAdmin
    ? appConfig.emailTemplates.adminPanel
    : appConfig.emailTemplates.panelBot

  return sendMailSafe({
    to,
    subject: template.subject,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;border:1px solid #e0e0e0;border-radius:8px">
        <div style="background:linear-gradient(to right,#06b6d4,#3b82f6);padding:15px;border-radius:8px 8px 0 0">
          <h2 style="color:white;margin:0;text-align:center">${template.title}</h2>
        </div>
        <div style="padding:20px;background:#f8f9fa">
          <p>Halo,</p>
          <p>Pembayaran ${isAdmin ? "Admin Panel" : "Panel Bot"} kamu telah berhasil dan pesanan sudah diproses otomatis.</p>
          ${transactionId ? `<div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:8px;padding:15px;margin:20px 0"><strong>ID Transaksi:</strong><div style="margin-top:8px;font-family:monospace;word-break:break-all">${transactionId}</div></div>` : ""}
          <div style="background:#fff;border:1px solid #e0e0e0;border-radius:8px;padding:15px;margin:20px 0">
            <p><strong>Paket:</strong> ${planName}</p>
            <p><strong>Username:</strong> ${username}</p>
            <p><strong>Password:</strong> <code style="background:#f0f0f0;padding:2px 4px;border-radius:3px">${password}</code></p>
            ${isAdmin ? `<p><strong>Hak Akses:</strong> Administrator</p>` : serverId !== null ? `<p><strong>Server ID:</strong> ${serverId}</p>` : ""}
            <p><strong>URL Panel:</strong> <a href="${panelUrl}" style="color:#0891b2">${panelUrl}</a></p>
          </div>
          <div style="text-align:center;margin:20px 0"><a href="${panelUrl}" style="background:#06b6d4;color:#041017;padding:11px 20px;text-decoration:none;border-radius:8px;font-weight:bold">Login Sekarang</a></div>
          <p>Simpan username dan password di atas dengan baik dan jangan membagikannya kepada orang lain.</p>
          ${supportHtml()}${channelButtonsHtml()}
          <p style="margin-top:30px">Terima kasih telah berbelanja di ${appConfig.nameHost}.<br /><br />Salam,<br />Tim ${appConfig.nameHost}</p>
        </div>
      </div>
    `,
  })
}

export async function sendRedfingerDetailsEmail(
  to: string,
  productName: string,
  duration: string,
  redeemCode: string,
) {
  const template = appConfig.emailTemplates.redfinger

  return sendMailSafe({
    to,
    subject: template.subject,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;border:1px solid #e0e0e0;border-radius:8px">
        <div style="background:linear-gradient(to right,#06b6d4,#3b82f6,#8b5cf6);padding:15px;border-radius:8px 8px 0 0">
          <h2 style="color:white;margin:0;text-align:center">${template.title}</h2>
        </div>
        <div style="padding:20px;background:#f8f9fa">
          <p>Halo,</p>
          <p>Pembayaran REDFINGER kamu telah berhasil dan pesanan sudah diproses otomatis.</p>
          <div style="background:#fff;border:1px solid #e0e0e0;border-radius:8px;padding:18px;margin:20px 0">
            <p><strong>Produk:</strong> ${productName}</p>
            <p><strong>Masa Aktif:</strong> ${duration}</p>
            <p><strong>Redeem Code:</strong></p>
            <div style="font-family:monospace;font-size:20px;font-weight:bold;letter-spacing:1px;background:#f1f5f9;padding:14px;border-radius:8px;word-break:break-all">${redeemCode}</div>
          </div>
          <p>Simpan kode dengan baik dan jangan membagikannya kepada orang lain.</p>
          ${supportHtml()}${channelButtonsHtml()}
          <p style="margin-top:30px">Terima kasih telah berbelanja di ${appConfig.nameHost}.<br /><br />Salam,<br />Tim ${appConfig.nameHost}</p>
        </div>
      </div>
    `,
  })
}

function escapeHtml(value: string) {
  return String(value ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string)
}

// AM Premium:
// - Sharing  : otomatis, email berisi akun (email + password).
// - Private  : MANUAL, email berisi instruksi hubungi admin (WA/Telegram) + kirim SS email & ID transaksi.
export async function sendAlightMotionAccountEmail(params: {
  to: string
  accountType: "sharing" | "private"
  productName: string
  duration: string
  accountEmail?: string
  accountPassword?: string
  adminWhatsapp?: string
  adminTelegram?: string
  transactionId: string
  note?: string
}) {
  const { to, accountType, productName, duration, accountEmail, accountPassword, transactionId, note } = params
  const isPrivate = accountType === "private"
  const template = isPrivate ? appConfig.emailTemplates.amPrivate : appConfig.emailTemplates.amSharing
  const wa = params.adminWhatsapp || CONTACT.whatsappNumber
  const tg = params.adminTelegram || CONTACT.telegramUsername
  const waLink = `https://wa.me/${wa.replace(/^0/, "62").replace(/\D/g, "")}`
  const tgLink = `https://t.me/${tg.replace(/^@/, "")}`

  const shell = (title: string, body: string) =>
    `<div style="font-family:Arial,sans-serif;max-width:620px;margin:auto;background:#07101f;color:#e8f4ff;border-radius:18px;overflow:hidden"><div style="padding:28px;background:linear-gradient(135deg,#0891b2,#2563eb,#7c3aed);text-align:center"><div style="font-size:12px;letter-spacing:3px;font-weight:800">BROCK STORE</div><h2 style="margin:8px 0 0">${title}</h2></div><div style="padding:28px;line-height:1.7">${body}</div></div>`

  const detailBox = (rows: string) =>
    `<div style="background:#0b1729;border:1px solid #20344e;border-radius:14px;padding:18px;margin:20px 0">${rows}</div>`

  const help = `<div style="background:#0b1729;border:1px solid #20344e;border-radius:12px;padding:14px;margin-top:18px"><b>💬 Butuh bantuan?</b><p style="margin:6px 0 0">Kalau mengalami kendala, jangan ragu hubungi Brock Store. Kami siap bantu sampai pesananmu beres.</p></div>`

  if (isPrivate) {
    const btn = "display:inline-block;margin:5px;padding:12px 20px;border-radius:10px;font-weight:800;font-size:14px;text-decoration:none"
    const html = shell(
      "AM Premium Private — Pembayaran Berhasil ✓",
      `<p>Terima kasih, pembayaran kamu sudah kami terima. 🎉</p>
       <p>Karena <b>AM Premium Private diproses manual oleh admin</b>, akunnya belum dikirim otomatis. Ikuti 3 langkah singkat ini ya:</p>
       ${detailBox(`<p style="margin:0 0 8px"><b>Paket:</b> ${escapeHtml(productName)}</p><p style="margin:0 0 8px"><b>Masa Aktif:</b> ${escapeHtml(duration)}</p>${note ? `<p style="margin:0 0 8px"><b>Catatan:</b> ${escapeHtml(note)}</p>` : ""}<p style="margin:0"><b>ID Transaksi:</b> <code>${escapeHtml(transactionId)}</code></p>`)}
       <div style="background:#0b1729;border:1px solid #20344e;border-radius:14px;padding:18px;margin:20px 0">
         <b>Langkah aktivasi</b>
         <p style="margin:10px 0 4px"><b>1.</b> Hubungi admin lewat salah satu kontak ini:</p>
         <div style="text-align:center;margin:8px 0">
           <a href="${waLink}" style="${btn};background:#25D366;color:#07120b">💬 WhatsApp ${escapeHtml(wa)}</a>
           <a href="${tgLink}" style="${btn};background:#229ED9;color:#ffffff">✈️ Telegram ${escapeHtml(tg)}</a>
         </div>
         <p style="margin:10px 0 4px"><b>2.</b> Kirim <b>screenshot email ini</b> beserta <b>ID Transaksi</b> di atas.</p>
         <p style="margin:10px 0 0"><b>3.</b> Tunggu admin memproses, lalu akun private kamu akan dikirimkan.</p>
       </div>
       <div style="background:#291d0b;border:1px solid #694812;border-radius:12px;padding:14px"><b>⚠️ Penting</b><p style="margin:6px 0 0">Screenshot email dan ID Transaksi wajib disertakan sebagai bukti pembelian, karena pesanan Private diverifikasi manual oleh admin. Simpan email ini sampai akunmu aktif.</p></div>
       ${help}
       ${channelButtonsHtml()}
       <p style="margin:22px 0 0;text-align:center;opacity:.8">Terima kasih sudah berbelanja di ${appConfig.nameHost}. 💙</p>`,
    )
    const text = `${template.title}\n\nTerima kasih, pembayaran kamu sudah kami terima.\nAM Premium Private diproses MANUAL oleh admin.\n\nPaket: ${productName}\nMasa Aktif: ${duration}\nID Transaksi: ${transactionId}${note ? `\nCatatan: ${note}` : ""}\n\nLANGKAH AKTIVASI\n1. Hubungi admin via WhatsApp ${wa} atau Telegram ${tg}\n2. Kirim screenshot email ini beserta ID Transaksi di atas\n3. Tunggu admin memproses dan mengirimkan akun private kamu\n\nPENTING: Screenshot email dan ID Transaksi wajib disertakan sebagai bukti pembelian karena pesanan Private diverifikasi manual oleh admin.\n\nKalau mengalami kendala, jangan ragu hubungi Brock Store.\n\n${channelButtonsText()}\n\nTerima kasih sudah berbelanja di ${appConfig.nameHost}.\nBROCK STORE`
    return sendMailSafe({ to, subject: template.subject, text, html })
  }

  // ---- Sharing (otomatis) ----
  const info = "Akun ini merupakan akun sharing. Jangan mengubah email, password, atau informasi akun lainnya. Simpan ID transaksi sebagai bukti pembelian."
  const html = shell(
    "AM Premium Sharing — Pesanan Berhasil ✓",
    `<p>Terima kasih, pembayaran kamu sudah berhasil dan akun langsung diproses otomatis. 🎉</p>
     ${detailBox(`<p style="margin:0 0 8px"><b>Paket:</b> ${escapeHtml(productName)}</p><p style="margin:0 0 8px"><b>Email Akun:</b> ${escapeHtml(accountEmail || "-")}</p><p style="margin:0 0 8px"><b>Password:</b> <code>${escapeHtml(accountPassword || "-")}</code></p><p style="margin:0 0 8px"><b>Masa Aktif:</b> ${escapeHtml(duration)}</p>${note ? `<p style="margin:0 0 8px"><b>Catatan:</b> ${escapeHtml(note)}</p>` : ""}<p style="margin:0"><b>ID Transaksi:</b> <code>${escapeHtml(transactionId)}</code></p>`)}
     <div style="background:#291d0b;border:1px solid #694812;border-radius:12px;padding:14px"><b>⚠️ Informasi Penting</b><p style="margin:6px 0 0">${info}</p></div>
     ${help}
     ${channelButtonsHtml()}
     <p style="margin:22px 0 0;text-align:center;opacity:.8">Terima kasih sudah berbelanja di ${appConfig.nameHost}. 💙</p>`,
  )
  const text = `${template.title}\n\nPaket: ${productName}\nEmail Akun: ${accountEmail}\nPassword: ${accountPassword}\nMasa Aktif: ${duration}\nID Transaksi: ${transactionId}${note ? `\nCatatan: ${note}` : ""}\n\n${info}\n\nKalau mengalami kendala, jangan ragu hubungi Brock Store (WA ${wa} / Telegram ${tg}).\n\n${channelButtonsText()}\n\nBROCK STORE`
  return sendMailSafe({ to, subject: template.subject, text, html })
}

async function sendMailSafe({
  to,
  subject,
  text,
  html,
}: {
  to: string
  subject: string
  text?: string
  html: string
}) {
  try {
    const info = await transporter.sendMail({
      from: appConfig.emailSender.from,
      to,
      subject,
      text,
      html,
    })

    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error(`Error sending email (${subject}):`, error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}
