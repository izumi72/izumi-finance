import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { db } from "@/lib/db"

// GET all transactions for the logged-in user (with optional month/year filter)
export async function GET(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const month = searchParams.get("month")
    const year = searchParams.get("year")

    const where: Record<string, unknown> = { userId: session.id }

    if (month && year) {
      const m = parseInt(month)
      const y = parseInt(year)
      const startDate = new Date(y, m - 1, 1)
      const endDate = new Date(y, m, 0, 23, 59, 59, 999)
      where.date = {
        gte: startDate,
        lte: endDate,
      }
    }

    const transactions = await db.transaction.findMany({
      where,
      orderBy: { date: "desc" },
    })

    return NextResponse.json({ transactions })
  } catch (error) {
    console.error("GET transactions error:", error)
    return NextResponse.json(
      { error: "Gagal mengambil data transaksi" },
      { status: 500 }
    )
  }
}

// POST create a new transaction
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { type, date, category, amount, description } = body

    if (!type || !date || !category || !amount) {
      return NextResponse.json(
        { error: "Jenis, tanggal, kategori, dan nominal wajib diisi" },
        { status: 400 }
      )
    }

    if (type !== "pemasukan" && type !== "pengeluaran") {
      return NextResponse.json(
        { error: "Jenis transaksi harus 'pemasukan' atau 'pengeluaran'" },
        { status: 400 }
      )
    }

    const transaction = await db.transaction.create({
      data: {
        userId: session.id,
        type,
        date: new Date(date),
        category,
        amount: parseInt(amount),
        description: description || null,
      },
    })

    return NextResponse.json(
      { message: "Transaksi berhasil disimpan", transaction },
      { status: 201 }
    )
  } catch (error) {
    console.error("POST transaction error:", error)
    return NextResponse.json(
      { error: "Gagal menyimpan transaksi" },
      { status: 500 }
    )
  }
}

// DELETE a transaction
export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json(
        { error: "ID transaksi diperlukan" },
        { status: 400 }
      )
    }

    const transaction = await db.transaction.findFirst({
      where: { id, userId: session.id },
    })

    if (!transaction) {
      return NextResponse.json(
        { error: "Transaksi tidak ditemukan" },
        { status: 404 }
      )
    }

    await db.transaction.delete({
      where: { id },
    })

    return NextResponse.json({ message: "Transaksi berhasil dihapus" })
  } catch (error) {
    console.error("DELETE transaction error:", error)
    return NextResponse.json(
      { error: "Gagal menghapus transaksi" },
      { status: 500 }
    )
  }
}

// DELETE all transactions for the user (reset)
export async function PUT(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await db.transaction.deleteMany({
      where: { userId: session.id },
    })

    return NextResponse.json({
      message: "Semua data keuangan berhasil direset",
    })
  } catch (error) {
    console.error("RESET transactions error:", error)
    return NextResponse.json(
      { error: "Gagal mereset data keuangan" },
      { status: 500 }
    )
  }
}