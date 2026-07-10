import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const session = await getSession()

    if (!session?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const transactions = await db.transaction.findMany({
      where: { userId: session.id },
    })

    const totalPemasukan = transactions
      .filter((t) => t.type === "pemasukan")
      .reduce((sum, t) => sum + t.amount, 0)

    const totalPengeluaran = transactions
      .filter((t) => t.type === "pengeluaran")
      .reduce((sum, t) => sum + t.amount, 0)

    const sisaSaldo = totalPemasukan - totalPengeluaran

    return NextResponse.json({
      totalPemasukan,
      totalPengeluaran,
      sisaSaldo,
    })
  } catch (error) {
    console.error("GET summary error:", error)
    return NextResponse.json(
      { error: "Gagal mengambil ringkasan" },
      { status: 500 }
    )
  }
}