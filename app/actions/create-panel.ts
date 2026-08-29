import { Pterodactyl } from "@/lib/pterodactyl"
import { generatePassword } from "@/lib/utils"
import { sendPanelDetailsEmail } from "@/lib/email-service"
import { sendTelegramNotification } from "@/lib/telegram-service"
import { plans } from "@/data/plans"

type PanelData = {
  username: string
  email: string
  memory: number
  disk: number
  cpu: number
  planId: string
  createdAt: string
}

export async function createPanel(data: PanelData) {
  try {
    const {
      username,
      email,
      memory,
      disk,
      cpu,
      planId,
      createdAt,
    } = data

    const password = generatePassword(10)
    const pterodactyl = new Pterodactyl()

    const plan = plans.find((p) => p?.id === planId)

    if (!plan) {
      throw new Error("Plan tidak ditemukan")
    }

    const category = plan.category

    console.log(`Plan: ${plan.name}`)
    console.log(`Category: ${category}`)
    console.log(`Creating user ${username} with email ${email}...`)

    /*
     * ==========================================
     * ADMIN PANEL
     * ==========================================
     */
    if (category === "admin-panel") {
      console.log(`Creating ADMIN Pterodactyl account for ${username}...`)

      const userResponse = await pterodactyl.createUser(
        username,
        email,
        password,
        true
      )

      if (!userResponse.attributes) {
        throw new Error(
          "Gagal membuat admin panel: " + JSON.stringify(userResponse)
        )
      }

      const userId = userResponse.attributes.id

      console.log(`Admin created successfully with ID: ${userId}`)

      /*
       * EMAIL DETAIL AKUN
       * Ditunggu sampai selesai supaya tidak kepotong Vercel
       */
      console.log(`Sending admin panel email to ${email}...`)

      const emailResult = await sendPanelDetailsEmail(
        email,
        username,
        password,
        null,
        plan.name,
        "admin-panel"
      )

      if (emailResult.success) {
        console.log(
          `Admin panel email sent successfully to ${email}`
        )
      } else {
        console.error(
          `Admin panel created, but email failed: ${emailResult.error}`
        )
      }

      /*
       * TELEGRAM
       * Telegram tidak boleh menggagalkan pembuatan panel
       */
      try {
        const telegramResult = await sendTelegramNotification(
          userId,
          createdAt,
          plan.price,
          plan.name,
          email
        )

        if (telegramResult.success) {
          console.log(
            `Telegram notification sent successfully for admin ${userId}`
          )
        } else {
          console.error(
            `Failed to send Telegram notification: ${telegramResult.error}`
          )
        }
      } catch (error) {
        console.error(
          `Exception when sending Telegram notification:`,
          error
        )
      }

      console.log("Admin Panel creation completed successfully")

      return {
        success: true,
        type: "admin-panel",
        userId,
        serverId: null,
        password,
        emailSent: emailResult.success,
      }
    }

    /*
     * ==========================================
     * PANEL BOT BIASA
     * ==========================================
     */

    console.log(`Creating normal Pterodactyl user ${username}...`)

    const userResponse = await pterodactyl.createUser(
      username,
      email,
      password,
      false
    )

    if (!userResponse.attributes) {
      throw new Error(
        "Gagal membuat user: " + JSON.stringify(userResponse)
      )
    }

    const userId = userResponse.attributes.id

    console.log(`User created successfully with ID: ${userId}`)

    /*
     * CREATE SERVER
     */
    const serverName = `${username}'s Server`

    console.log(
      `Creating server "${serverName}" for user ${userId}...`
    )

    const serverResponse = await pterodactyl.addServer(
      userId,
      serverName,
      memory,
      disk,
      cpu
    )

    if (!serverResponse.attributes) {
      /*
       * Kalau server gagal dibuat,
       * user dihapus supaya tidak meninggalkan akun kosong
       */
      await pterodactyl.deleteUser(userId)

      throw new Error(
        "Gagal membuat server: " + JSON.stringify(serverResponse)
      )
    }

    const serverId = serverResponse.attributes.id

    console.log(
      `Server created successfully with ID: ${serverId}`
    )

    /*
     * ==========================================
     * EMAIL DETAIL AKUN
     * ==========================================
     */

    console.log(`Sending panel details email to ${email}...`)

    const emailResult = await sendPanelDetailsEmail(
      email,
      username,
      password,
      serverId,
      plan.name,
      "panel-bot"
    )

    if (emailResult.success) {
      console.log(
        `Panel details email sent successfully to ${email}`
      )
    } else {
      /*
       * Email gagal tidak boleh bikin panel dianggap gagal,
       * karena user + server Pterodactyl sudah berhasil dibuat
       */
      console.error(
        `Panel created, but email failed: ${emailResult.error}`
      )
    }

    /*
     * ==========================================
     * TELEGRAM
     * ==========================================
     */

    try {
      console.log(
        `Sending Telegram notification for user ${userId}...`
      )

      const telegramResult = await sendTelegramNotification(
        userId,
        createdAt,
        plan.price,
        plan.name,
        email
      )

      if (telegramResult.success) {
        console.log(
          `Telegram notification sent successfully for user ${userId}`
        )
      } else {
        console.error(
          `Failed to send Telegram notification: ${telegramResult.error}`
        )
      }
    } catch (error) {
      console.error(
        `Exception when sending Telegram notification:`,
        error
      )
    }

    console.log(
      `Panel Bot creation process completed successfully`
    )

    return {
      success: true,
      type: "panel-bot",
      userId,
      serverId,
      password,
      emailSent: emailResult.success,
    }
  } catch (error) {
    console.error("Error creating panel:", error)

    throw new Error(
      error instanceof Error
        ? error.message
        : "Terjadi kesalahan saat membuat panel"
    )
  }
}
