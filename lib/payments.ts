import { revalidatePath } from "next/cache"
import clientPromise from "@/lib/mongodb"
import { appConfig } from "@/data/config"
import type { ObjectId } from "mongodb"

export type PaymentStatus =
  | "pending"
  | "paid"
  | "processing"
  | "completed"
  | "failed"

export interface PanelDetails {
  username: string
  password: string
  serverId: number | null
  userId?: number
  type?: "panel-bot" | "admin-panel"
}

export interface RedfingerDetails {
  type: "redfinger"
  productName: string
  duration: string
  redeemCode: string
}

export interface AlightMotionDetails {
  type: "alight-motion"
  productName: string
  duration: string
  accountType: "sharing" | "private"
  accountEmail?: string
  accountPassword?: string
  // Private (manual): kontak admin untuk konfirmasi
  adminWhatsapp?: string
  adminTelegram?: string
}

export interface PaymentData {
  _id?: ObjectId

  transactionId: string
  vpediaId: string

  planId: string

  productType?:
    | "panel"
    | "redfinger"
    | "alight-motion"

  productName?: string
  duration?: string

  username: string
  phone?: string

  email: string

  amount: number
  fee: number
  total: number

  qrImageUrl: string
  expirationTime: string

  status: PaymentStatus
  createdAt: string

  // Akun BROCK STORE.
  // Optional supaya guest checkout
  // tetap bisa digunakan.
  userId?: string
  accountEmail?: string

  panelDetails?: PanelDetails
  redfingerDetails?: RedfingerDetails
  alightMotionDetails?: AlightMotionDetails

  // Tracking pengiriman email otomatis (AM Premium)
  processingAt?: string
  emailPending?: boolean
  emailLockAt?: string
  emailSentAt?: string
}

function collection(db: any) {
  return db.collection<PaymentData>(
    "payments",
  )
}

export async function getPayment(
  transactionId: string,
): Promise<PaymentData | null> {
  try {
    const client =
      await clientPromise

    const db = client.db(
      appConfig.mongodb.dbName,
    )

    return await collection(
      db,
    ).findOne({
      transactionId,
    })
  } catch (error) {
    console.error(
      "Error getting payment:",
      error,
    )

    return null
  }
}

export async function updatePaymentStatus(
  transactionId: string,
  status: PaymentStatus,
  panelDetails?: PanelDetails,
): Promise<boolean> {
  try {
    const client =
      await clientPromise

    const db = client.db(
      appConfig.mongodb.dbName,
    )

    const filter: any = {
      transactionId,
    }

    if (status === "failed") {
      filter.status = {
        $in: [
          "pending",
          "paid",
        ],
      }
    }

    const updateData:
      Record<string, unknown> = {
      status,
    }

    if (panelDetails) {
      updateData.panelDetails =
        panelDetails
    }

    const result =
      await collection(
        db,
      ).updateOne(
        filter,
        {
          $set: updateData,
        },
      )

    if (
      result.matchedCount > 0
    ) {
      revalidatePath(
        `/invoice/${transactionId}`,
      )

      return true
    }

    return false
  } catch (error) {
    console.error(
      "Error updating payment status:",
      error,
    )

    return false
  }
}

export async function claimPaymentForProcessing(
  transactionId: string,
): Promise<boolean> {
  try {
    const client =
      await clientPromise

    const db = client.db(
      appConfig.mongodb.dbName,
    )

    const result =
      await collection(
        db,
      ).updateOne(
        {
          transactionId,

          status: {
            $in: [
              "pending",
              "paid",
            ],
          },
        },
        {
          $set: {
            status:
              "processing",
            processingAt:
              new Date().toISOString(),
          },
        },
      )

    return (
      result.modifiedCount === 1
    )
  } catch (error) {
    console.error(
      "Error claiming payment:",
      error,
    )

    return false
  }
}

export async function releasePaymentProcessing(
  transactionId: string,
): Promise<boolean> {
  try {
    const client =
      await clientPromise

    const db = client.db(
      appConfig.mongodb.dbName,
    )

    const result =
      await collection(
        db,
      ).updateOne(
        {
          transactionId,
          status:
            "processing",
        },
        {
          $set: {
            status: "paid",
          },
        },
      )

    return (
      result.modifiedCount === 1
    )
  } catch (error) {
    console.error(
      "Error releasing payment processing:",
      error,
    )

    return false
  }
}

export async function completePaymentProcessing(
  transactionId: string,
  panelDetails: PanelDetails,
): Promise<boolean> {
  try {
    const client =
      await clientPromise

    const db = client.db(
      appConfig.mongodb.dbName,
    )

    const result =
      await collection(
        db,
      ).updateOne(
        {
          transactionId,
          status:
            "processing",
        },
        {
          $set: {
            status:
              "completed",

            panelDetails,
          },
        },
      )

    if (
      result.modifiedCount === 1
    ) {
      revalidatePath(
        `/invoice/${transactionId}`,
      )

      return true
    }

    return false
  } catch (error) {
    console.error(
      "Error completing payment processing:",
      error,
    )

    return false
  }
}

export async function completeRedfingerPaymentProcessing(
  transactionId: string,
  redfingerDetails: RedfingerDetails,
): Promise<boolean> {
  try {
    const client =
      await clientPromise

    const db = client.db(
      appConfig.mongodb.dbName,
    )

    const result =
      await collection(
        db,
      ).updateOne(
        {
          transactionId,
          status:
            "processing",
        },
        {
          $set: {
            status:
              "completed",

            redfingerDetails,
          },
        },
      )

    if (
      result.modifiedCount === 1
    ) {
      revalidatePath(
        `/invoice/${transactionId}`,
      )

      return true
    }

    return false
  } catch (error) {
    console.error(
      "Error completing REDFINGER payment:",
      error,
    )

    return false
  }
}


export async function completeAlightMotionPaymentProcessing(transactionId: string, alightMotionDetails: AlightMotionDetails): Promise<boolean> {
  try {
    const db = (await clientPromise).db(appConfig.mongodb.dbName)
    const result = await collection(db).updateOne(
      { transactionId, status: { $in: ["pending", "paid", "processing"] } },
      { $set: { status: "completed", alightMotionDetails, emailPending: true } },
    )
    if (result.modifiedCount === 1) {
      revalidatePath(`/invoice/${transactionId}`)
      return true
    }
    return false
  } catch (error) {
    console.error("Error completing AM payment:", error)
    return false
  }
}

// Transaksi yang nyangkut di "processing" > 2 menit (mis. server restart) dikembalikan ke "paid"
// supaya polling/callback berikutnya bisa menyelesaikannya. Aman untuk AM karena klaim akun idempotent.
export async function recoverStaleProcessing(transactionId: string, olderThanMs = 2 * 60 * 1000): Promise<boolean> {
  try {
    const db = (await clientPromise).db(appConfig.mongodb.dbName)
    const before = new Date(Date.now() - olderThanMs).toISOString()
    const r = await collection(db).updateOne(
      { transactionId, status: "processing", $or: [{ processingAt: { $lt: before } }, { processingAt: { $exists: false } }] },
      { $set: { status: "paid" } },
    )
    return r.modifiedCount === 1
  } catch (error) {
    console.error("Error recovering stale processing:", error)
    return false
  }
}

// Lock kirim email supaya callback + polling tidak mengirim email ganda.
export async function acquireEmailSlot(transactionId: string): Promise<boolean> {
  try {
    const db = (await clientPromise).db(appConfig.mongodb.dbName)
    const now = Date.now()
    const staleBefore = new Date(now - 2 * 60 * 1000).toISOString()
    const r = await collection(db).updateOne(
      { transactionId, emailPending: true, $or: [{ emailLockAt: { $exists: false } }, { emailLockAt: { $lt: staleBefore } }] },
      { $set: { emailLockAt: new Date(now).toISOString() } },
    )
    return r.modifiedCount === 1
  } catch (error) {
    console.error("Error acquiring email slot:", error)
    return false
  }
}

export async function markEmailSent(transactionId: string): Promise<void> {
  try {
    const db = (await clientPromise).db(appConfig.mongodb.dbName)
    await collection(db).updateOne(
      { transactionId },
      { $set: { emailPending: false, emailSentAt: new Date().toISOString() }, $unset: { emailLockAt: "" } },
    )
  } catch (error) {
    console.error("Error marking email sent:", error)
  }
}

export async function releaseEmailSlot(transactionId: string): Promise<void> {
  try {
    const db = (await clientPromise).db(appConfig.mongodb.dbName)
    await collection(db).updateOne({ transactionId }, { $unset: { emailLockAt: "" } })
  } catch (error) {
    console.error("Error releasing email slot:", error)
  }
}

export async function resolvePaymentTransactionId(
  identifier: string,
): Promise<string | null> {
  try {
    const client =
      await clientPromise

    const db = client.db(
      appConfig.mongodb.dbName,
    )

    const payment =
      await collection(
        db,
      ).findOne(
        {
          $or: [
            {
              transactionId:
                identifier,
            },
            {
              vpediaId:
                identifier,
            },
          ],
        },
        {
          projection: {
            transactionId: 1,
          },
        },
      )

    return (
      payment?.transactionId ||
      null
    )
  } catch (error) {
    console.error(
      "Error resolving payment transaction:",
      error,
    )

    return null
  }
}