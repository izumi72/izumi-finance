"use client"

import { useState, useEffect, useCallback, createContext, useContext } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import {
  TrendingDown,
  TrendingUp,
  Scale,
  PlusCircle,
  Clock,
  LogOut,
  User,
  Settings,
  Lock,
  RotateCcw,
  Trash2,
  Eye,
  EyeOff,
} from "lucide-react"
import { cn } from "@/lib/utils"

// ---------- Types ----------
interface SessionUser {
  id: string
  name: string
  email: string
}

interface Transaction {
  id: string
  type: string
  date: string
  category: string
  amount: number
  description: string | null
}

interface Summary {
  totalPemasukan: number
  totalPengeluaran: number
  sisaSaldo: number
}

// ---------- Auth Context ----------
const AuthContext = createContext<{
  user: SessionUser | null
  loading: boolean
  refresh: () => Promise<void>
  logout: () => Promise<void>
}>({ user: null, loading: true, refresh: async () => {}, logout: async () => {} })

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/session")
      const data = await res.json()
      setUser(data.session)
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    setUser(null)
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  return (
    <AuthContext.Provider value={{ user, loading, refresh, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

function useAuth() {
  return useContext(AuthContext)
}

// ---------- Constants ----------
const MONTHS = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
]

const CATEGORIES_PEMASUKAN = [
  "Gaji / Hasil Kerja",
  "Freelance / Side Job",
  "Investasi",
  "Bisnis",
  "Hadiah",
  "Lainnya",
]

const CATEGORIES_PENGELUARAN = [
  "Makanan & Minuman",
  "Transportasi",
  "Belanja",
  "Tagihan & Utilitas",
  "Kesehatan",
  "Hiburan",
  "Pendidikan",
  "Cicilan & Hutang",
  "Tabungan & Investasi",
  "Lainnya",
]

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

// ========== AUTH PAGE ==========
function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const { refresh } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (!isLogin) {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        })
        const data = await res.json()

        if (!res.ok) {
          toast({ title: "Gagal", description: data.error, variant: "destructive" })
          setLoading(false)
          return
        }

        toast({ title: "Berhasil!", description: "Akun berhasil dibuat. Silakan login." })
        setIsLogin(true)
        setPassword("")
      } else {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        })

        const data = await res.json()

        if (!res.ok) {
          toast({ title: "Login Gagal", description: data.error, variant: "destructive" })
          setLoading(false)
          return
        }

        toast({ title: "Login Berhasil!", description: `Selamat datang, ${data.user.name}` })
        await refresh()
      }
    } catch {
      toast({ title: "Error", description: "Terjadi kesalahan", variant: "destructive" })
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div
        className="w-full max-w-md"
      >
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-500 mb-4">
            <Scale className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">Dashboard Izumi</h1>
          <p className="text-slate-400 mt-1">Sistem Keuangan Mandiri</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8">
          {/* Tabs */}
          <div className="flex bg-slate-100 rounded-lg p-1 mb-6">
            <button
              onClick={() => setIsLogin(true)}
              className={cn(
                "flex-1 py-2.5 text-sm font-semibold rounded-md transition-all",
                isLogin
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              )}
            >
              Masuk
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={cn(
                "flex-1 py-2.5 text-sm font-semibold rounded-md transition-all",
                !isLogin
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              )}
            >
              Daftar
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div
                  key="name-field"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Label htmlFor="name">Nama Lengkap</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Masukkan nama lengkap"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required={!isLogin}
                    className="mt-1.5"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="contoh@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative mt-1.5">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Minimal 6 karakter"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-5"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Memproses...
                </span>
              ) : isLogin ? (
                "Masuk"
              ) : (
                "Daftar Akun"
              )}
            </Button>
          </form>
        </div>

        <p className="text-center text-slate-500 text-xs mt-6">
          Setiap pengguna memiliki catatan keuangan pribadi yang terpisah
        </p>
      </div>
    </div>
  )
}

// ========== DASHBOARD PAGE ==========
function Dashboard() {
  const { user, logout } = useAuth()
  const { toast } = useToast()

  // Form state
  const [txType, setTxType] = useState<"pemasukan" | "pengeluaran">("pemasukan")
  const [txDate, setTxDate] = useState(() => {
    const now = new Date()
    return now.toISOString().split("T")[0]
  })
  const [txCategory, setTxCategory] = useState("")
  const [txAmount, setTxAmount] = useState("")
  const [txDescription, setTxDescription] = useState("")
  const [submitting, setSubmitting] = useState(false)

  // Data state
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [summary, setSummary] = useState<Summary>({
    totalPemasukan: 0,
    totalPengeluaran: 0,
    sisaSaldo: 0,
  })
  const [loading, setLoading] = useState(true)

  // Filter state
  const now = new Date()
  const [filterMonth, setFilterMonth] = useState(String(now.getMonth() + 1))
  const [filterYear, setFilterYear] = useState(String(now.getFullYear()))

  const currentCategories = txType === "pemasukan" ? CATEGORIES_PEMASUKAN : CATEGORIES_PENGELUARAN

  const fetchData = useCallback(async () => {
    try {
      const [txRes, sumRes] = await Promise.all([
        fetch(`/api/transactions?month=${filterMonth}&year=${filterYear}`),
        fetch("/api/summary"),
      ])

      if (txRes.ok) {
        const txData = await txRes.json()
        setTransactions(txData.transactions || [])
      }

      if (sumRes.ok) {
        const sumData = await sumRes.json()
        setSummary(sumData)
      }
    } catch {
      toast({ title: "Error", description: "Gagal memuat data", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }, [filterMonth, filterYear, toast])

  useEffect(() => {
    if (user) {
      fetchData()
    }
  }, [user, fetchData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!txCategory || !txAmount) {
      toast({ title: "Peringatan", description: "Kategori dan nominal wajib diisi", variant: "destructive" })
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: txType,
          date: txDate,
          category: txCategory,
          amount: txAmount,
          description: txDescription,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast({ title: "Gagal", description: data.error, variant: "destructive" })
      } else {
        toast({ title: "Berhasil!", description: "Transaksi berhasil disimpan" })
        setTxAmount("")
        setTxDescription("")
        setTxCategory("")
        fetchData()
      }
    } catch {
      toast({ title: "Error", description: "Gagal menyimpan transaksi", variant: "destructive" })
    }
    setSubmitting(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menghapus transaksi ini?")) return

    try {
      const res = await fetch(`/api/transactions?id=${id}`, { method: "DELETE" })
      const data = await res.json()

      if (res.ok) {
        toast({ title: "Berhasil", description: "Transaksi berhasil dihapus" })
        fetchData()
      } else {
        toast({ title: "Gagal", description: data.error, variant: "destructive" })
      }
    } catch {
      toast({ title: "Error", description: "Gagal menghapus transaksi", variant: "destructive" })
    }
  }

  const handleReset = async () => {
    if (!confirm("PERINGATAN: Semua data keuangan Anda akan dihapus permanen. Lanjutkan?")) return

    try {
      const res = await fetch("/api/transactions", { method: "PUT" })
      const data = await res.json()

      if (res.ok) {
        toast({ title: "Berhasil", description: "Semua data keuangan berhasil direset" })
        fetchData()
      } else {
        toast({ title: "Gagal", description: data.error, variant: "destructive" })
      }
    } catch {
      toast({ title: "Error", description: "Gagal mereset data", variant: "destructive" })
    }
  }

  const handleLogout = async () => {
    await logout()
  }

  // Generate years for filter
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 5 }, (_, i) => String(currentYear - 2 + i))

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 flex-col bg-slate-800 text-white flex-shrink-0">
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight">Dashboard Izumi</h1>
              <p className="text-xs text-slate-400">Sistem Keuangan Mandiri</p>
            </div>
          </div>
        </div>

        <div className="flex-1 p-4 space-y-2">
          <div className="flex items-center gap-3 px-3 py-2.5 bg-blue-500/20 text-blue-400 rounded-lg">
            <Settings className="w-4 h-4" />
            <span className="text-sm font-medium">Catatan Keuangan</span>
          </div>
        </div>

        <div className="p-4 border-t border-slate-700 space-y-3">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start text-slate-400 hover:text-white hover:bg-slate-700"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Keluar
          </Button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-slate-800 text-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Scale className="w-5 h-5 text-blue-400" />
          <span className="font-bold">Izumi</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 truncate max-w-[120px]">{user?.name}</span>
          <Button
            variant="ghost"
            size="sm"
            className="text-slate-400 hover:text-white h-8 w-8 p-0"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 md:p-6 p-4 pt-16 md:pt-6 overflow-y-auto">
        {/* Mobile Welcome */}
        <div className="md:hidden mb-4">
          <h2 className="text-lg font-bold text-slate-800">
            Halo, {user?.name?.split(" ")[0]} 👋
          </h2>
          <p className="text-sm text-slate-500">Kelola keuangan pribadimu di sini</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-emerald-50 border border-emerald-200 rounded-xl p-4"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                <TrendingDown className="w-4 h-4 text-emerald-600" />
              </div>
              <span className="text-sm font-medium text-emerald-700">Total Pemasukan</span>
            </div>
            <p className="text-xl font-bold text-emerald-800">
              {formatRupiah(summary.totalPemasukan)}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-red-50 border border-red-200 rounded-xl p-4"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-red-600" />
              </div>
              <span className="text-sm font-medium text-red-700">Total Pengeluaran</span>
            </div>
            <p className="text-xl font-bold text-red-800">
              {formatRupiah(summary.totalPengeluaran)}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-blue-50 border border-blue-200 rounded-xl p-4"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                <Scale className="w-4 h-4 text-blue-600" />
              </div>
              <span className="text-sm font-medium text-blue-700">Sisa Saldo Akhir</span>
            </div>
            <p className="text-xl font-bold text-blue-800">
              {formatRupiah(summary.sisaSaldo)}
            </p>
          </motion.div>
        </div>

        {/* Form + Table Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Transaction Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-5">
                <PlusCircle className="w-5 h-5 text-blue-500" />
                <h3 className="font-semibold text-slate-800">Tambah Log Transaksi</h3>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Type */}
                <div>
                  <Label className="text-sm font-medium text-slate-700 mb-2 block">
                    Jenis Aliran Dana
                  </Label>
                  <RadioGroup
                    value={txType}
                    onValueChange={(v) => {
                      setTxType(v as "pemasukan" | "pengeluaran")
                      setTxCategory("")
                    }}
                    className="flex gap-3"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="pemasukan" id="pemasukan" />
                      <Label htmlFor="pemasukan" className="cursor-pointer text-emerald-700 font-medium">
                        Pemasukan
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="pengeluaran" id="pengeluaran" />
                      <Label htmlFor="pengeluaran" className="cursor-pointer text-red-700 font-medium">
                        Pengeluaran
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Date */}
                <div>
                  <Label htmlFor="txDate" className="text-sm font-medium text-slate-700">
                    Tanggal Transaksi
                  </Label>
                  <Input
                    id="txDate"
                    type="date"
                    value={txDate}
                    onChange={(e) => setTxDate(e.target.value)}
                    className="mt-1.5"
                    required
                  />
                </div>

                {/* Category */}
                <div>
                  <Label className="text-sm font-medium text-slate-700">Kategori</Label>
                  <Select value={txCategory} onValueChange={setTxCategory} required>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="Pilih kategori" />
                    </SelectTrigger>
                    <SelectContent>
                      {currentCategories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Amount */}
                <div>
                  <Label htmlFor="txAmount" className="text-sm font-medium text-slate-700">
                    Jumlah Nominal (Rupiah)
                  </Label>
                  <Input
                    id="txAmount"
                    type="number"
                    placeholder="Contoh: 150000"
                    value={txAmount}
                    onChange={(e) => setTxAmount(e.target.value)}
                    className="mt-1.5"
                    min="1"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <Label htmlFor="txDesc" className="text-sm font-medium text-slate-700">
                    Keterangan Tambahan
                  </Label>
                  <Textarea
                    id="txDesc"
                    placeholder="Contoh: Beli domain .com, Keuntungan rekening..."
                    value={txDescription}
                    onChange={(e) => setTxDescription(e.target.value)}
                    className="mt-1.5 resize-none"
                    rows={3}
                  />
                </div>

                {/* Submit */}
                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-5"
                >
                  <Lock className="w-4 h-4 mr-2" />
                  {submitting ? "Menyimpan..." : "Amankan Catatan"}
                </Button>
              </form>
            </div>
          </motion.div>

          {/* Transaction History */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-500" />
                  <h3 className="font-semibold text-slate-800">Riwayat Aliran Dana</h3>
                </div>
              </div>

              {/* Filters */}
              <div className="flex gap-2 mb-4">
                <Select value={filterMonth} onValueChange={setFilterMonth}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MONTHS.map((m, i) => (
                      <SelectItem key={m} value={String(i + 1)}>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filterYear} onValueChange={setFilterYear}>
                  <SelectTrigger className="w-[100px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((y) => (
                      <SelectItem key={y} value={y}>
                        {y}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Table */}
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <svg className="animate-spin h-6 w-6 text-slate-400" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                </div>
              ) : transactions.length === 0 ? (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
                    <Clock className="w-8 h-8 text-slate-300" />
                  </div>
                  <p className="text-slate-500 text-sm">
                    Tidak ditemukan catatan keuangan di bulan &amp; tahun ini.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-lg border border-slate-200 max-h-[400px] overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 sticky top-0">
                      <tr>
                        <th className="text-left px-3 py-2.5 font-semibold text-slate-600 whitespace-nowrap">Tanggal</th>
                        <th className="text-left px-3 py-2.5 font-semibold text-slate-600 whitespace-nowrap">Kategori</th>
                        <th className="text-left px-3 py-2.5 font-semibold text-slate-600 whitespace-nowrap">Keterangan</th>
                        <th className="text-left px-3 py-2.5 font-semibold text-slate-600 whitespace-nowrap">Status</th>
                        <th className="text-right px-3 py-2.5 font-semibold text-slate-600 whitespace-nowrap">Nominal</th>
                        <th className="text-center px-3 py-2.5 font-semibold text-slate-600 whitespace-nowrap">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {transactions.map((tx) => (
                        <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-3 py-2.5 text-slate-600 whitespace-nowrap">
                            {formatDate(tx.date)}
                          </td>
                          <td className="px-3 py-2.5 text-slate-700 font-medium whitespace-nowrap max-w-[120px] truncate">
                            {tx.category}
                          </td>
                          <td className="px-3 py-2.5 text-slate-500 whitespace-nowrap max-w-[120px] truncate">
                            {tx.description || "-"}
                          </td>
                          <td className="px-3 py-2.5 whitespace-nowrap">
                            <span
                              className={cn(
                                "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
                                tx.type === "pemasukan"
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-red-100 text-red-700"
                              )}
                            >
                              {tx.type === "pemasukan" ? "Masuk" : "Keluar"}
                            </span>
                          </td>
                          <td
                            className={cn(
                              "px-3 py-2.5 text-right font-semibold whitespace-nowrap",
                              tx.type === "pemasukan" ? "text-emerald-600" : "text-red-600"
                            )}
                          >
                            {tx.type === "pemasukan" ? "+" : "-"}
                            {formatRupiah(tx.amount)}
                          </td>
                          <td className="px-3 py-2.5 text-center whitespace-nowrap">
                            <button
                              onClick={() => handleDelete(tx.id)}
                              className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                              title="Hapus transaksi"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Reset Button */}
              {transactions.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <button
                    onClick={handleReset}
                    className="flex items-center gap-2 text-sm text-red-500 hover:text-red-600 font-medium transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Reset Seluruh Database Keuangan
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Footer */}
        <footer className="mt-8 pt-4 border-t border-slate-200 text-center">
          <p className="text-xs text-slate-400">
            Dashboard Izumi — Sistem Keuangan Mandiri •{" "}
            {new Date().toLocaleDateString("id-ID", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </footer>
      </main>
    </div>
  )
}

// ========== MAIN PAGE ==========
function MainPage() {
  const { user, loading } = useAuth()

  // While checking session or no user, show auth page
  // (auth page is also server-rendered as default)
  if (loading || !user) {
    return <AuthPage />
  }

  return <Dashboard />
}

// ========== PROVIDER WRAPPER ==========
export default function Home() {
  return (
    <AuthProvider>
      <MainPage />
    </AuthProvider>
  )
}