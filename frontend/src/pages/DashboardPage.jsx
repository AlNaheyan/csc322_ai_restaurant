"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useDispatch } from "react-redux"
import { customerService } from "../services/customerService"
import { logout } from "../store/authSlice"

function DashboardPage() {
  const [customer, setCustomer] = useState(null)
  const [depositAmount, setDepositAmount] = useState("")
  const [loading, setLoading] = useState(true)
  const [depositLoading, setDepositLoading] = useState(false)
  const [cashbackLoading, setCashbackLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showCloseAccount, setShowCloseAccount] = useState(false)
  const [closureReason, setClosureReason] = useState("")
  const navigate = useNavigate()
  const dispatch = useDispatch()

  useEffect(() => {
    loadCustomerData()
  }, [])

  const loadCustomerData = async () => {
    try {
      const data = await customerService.getProfile()
      setCustomer(data)
      setLoading(false)
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load profile")
      setLoading(false)
    }
  }

  const handleDeposit = async (e) => {
    e.preventDefault()
    setDepositLoading(true)
    setError(null)

    try {
      await customerService.addDeposit(Number.parseFloat(depositAmount))
      setDepositAmount("")
      await loadCustomerData()
      alert("Deposit successful!")
      setDepositLoading(false)
    } catch (err) {
      setError(err.response?.data?.error || "Deposit failed")
      setDepositLoading(false)
    }
  }

  const handleRedeemCashback = async () => {
    if (!window.confirm("Redeem your cashback to your deposit balance?")) {
      return
    }

    setCashbackLoading(true)
    setError(null)

    try {
      const result = await customerService.redeemCashback()
      await loadCustomerData()
      alert(result.message || "Cashback redeemed successfully!")
      setCashbackLoading(false)
    } catch (err) {
      setError(err.response?.data?.error || "Failed to redeem cashback")
      setCashbackLoading(false)
    }
  }

  const handleCloseAccount = async () => {
    if (!closureReason.trim()) {
      setError("Please provide a reason for closing your account")
      return
    }

    if (!window.confirm("Are you sure you want to close your account? This action cannot be undone.")) {
      return
    }

    try {
      await customerService.closeAccount(closureReason)
      alert("Your account has been closed. You will be logged out.")
      dispatch(logout())
      navigate("/login")
    } catch (err) {
      setError(err.response?.data?.error || "Failed to close account")
    }
  }

  if (loading)
    return (
      <div
        style={{
          padding: "40px",
          minHeight: "100vh",
          background: "linear-gradient(135deg, #0f172a 0%, #1a1f3a 100%)",
          color: "#e0e7ff",
          textAlign: "center",
          fontSize: "18px",
        }}
      >
        Loading...
      </div>
    )

  return (
    <div
      style={{
        padding: "clamp(20px, 5vw, 40px)",
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0f172a 0%, #1a1f3a 100%)",
      }}
    >
      <div style={{ maxWidth: "1000px", width: "100%", margin: "0 auto", boxSizing: "border-box" }}>
        <h2 style={{ fontSize: "clamp(28px, 5vw, 36px)", marginBottom: "30px", color: "#ffffff" }}>
          Customer Dashboard
        </h2>

        {error && (
          <div
            style={{
              background: "#7f1d1d",
              color: "#fca5a5",
              padding: "15px",
              borderRadius: "8px",
              marginBottom: "20px",
              border: "1px solid #dc2626",
            }}
          >
            {error}
          </div>
        )}

        <div
          style={{
            background: "#1e293b",
            padding: "25px",
            borderRadius: "12px",
            marginBottom: "25px",
            border: "1px solid #334155",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
          }}
        >
          <h3 style={{ color: "#ffffff", marginBottom: "15px", fontSize: "20px" }}>Account Balance</h3>
          <p style={{ fontSize: "40px", fontWeight: "bold", color: "#4ade80", margin: "0 0 15px 0" }}>
            ${Number.parseFloat(customer?.deposit_balance || 0).toFixed(2)}
          </p>

          {/* Cashback Balance */}
          <div
            style={{
              marginTop: "20px",
              padding: "20px",
              background: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
              borderRadius: "12px",
              border: "2px solid #fbbf24",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h4 style={{ color: "#1f2937", marginTop: 0, marginBottom: "8px", fontSize: "16px", fontWeight: "600" }}>
                  💰 Cashback Balance
                </h4>
                <p style={{ fontSize: "32px", fontWeight: "bold", color: "#1f2937", margin: 0 }}>
                  ${Number.parseFloat(customer?.cashback_balance || 0).toFixed(2)}
                </p>
                <p style={{ color: "#78350f", fontSize: "13px", marginTop: "8px", marginBottom: 0 }}>
                  Earn {customer?.is_vip ? "10%" : "5%"} cashback on completed orders
                </p>
              </div>
              {Number.parseFloat(customer?.cashback_balance || 0) > 0 && (
                <button
                  onClick={handleRedeemCashback}
                  disabled={cashbackLoading}
                  style={{
                    padding: "12px 24px",
                    background: "#1f2937",
                    color: "#fbbf24",
                    border: "none",
                    borderRadius: "8px",
                    fontWeight: "bold",
                    cursor: cashbackLoading ? "wait" : "pointer",
                    fontSize: "14px",
                    transition: "all 0.3s ease",
                    opacity: cashbackLoading ? 0.6 : 1,
                  }}
                  onMouseEnter={(e) => {
                    if (!cashbackLoading) {
                      e.currentTarget.style.background = "#111827"
                      e.currentTarget.style.transform = "translateY(-2px)"
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "#1f2937"
                    e.currentTarget.style.transform = "translateY(0)"
                  }}
                >
                  {cashbackLoading ? "Redeeming..." : "Redeem to Balance"}
                </button>
              )}
            </div>
          </div>

          {customer?.is_vip && (
            <span
              style={{
                background: "#fbbf24",
                padding: "8px 18px",
                borderRadius: "8px",
                fontWeight: "bold",
                color: "#1f2937",
                fontSize: "14px",
              }}
            >
              ⭐ VIP Member
            </span>
          )}
          {!customer?.is_vip && (
            <div
              style={{
                marginTop: "20px",
                padding: "20px",
                background: "#0f172a",
                borderRadius: "8px",
                border: "1px solid #4ade80",
              }}
            >
              <h4 style={{ color: "#4ade80", marginTop: 0, fontSize: "16px" }}>Become a VIP Member!</h4>
              <p style={{ color: "#cbd5e1", fontSize: "14px", margin: "10px 0" }}>
                VIP benefits: Free delivery, exclusive menu items, priority support, and your ratings count 2x!
              </p>
              <p style={{ color: "#cbd5e1", fontSize: "14px", margin: "10px 0" }}>
                <strong>Requirements:</strong> Spend $100+ OR place 3+ orders (with no active complaints)
              </p>
              <div style={{ marginTop: "15px", fontSize: "14px" }}>
                <p style={{ color: "#cbd5e1", margin: "5px 0" }}>
                  Progress: ${Number.parseFloat(customer?.total_spent || 0).toFixed(2)} / $100 spent
                </p>
                <p style={{ color: "#cbd5e1", margin: "5px 0" }}>{customer?.order_count || 0} / 3 orders placed</p>
              </div>
            </div>
          )}
        </div>

        <div
          style={{
            background: "#1e293b",
            border: "1px solid #334155",
            padding: "25px",
            borderRadius: "12px",
            marginBottom: "25px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
          }}
        >
          <h3 style={{ color: "#ffffff", marginBottom: "20px", fontSize: "20px" }}>Add Funds</h3>
          <form onSubmit={handleDeposit} style={{ display: "flex", gap: "15px", flexWrap: "wrap" }}>
            <input
              type="number"
              min="10"
              step="0.01"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              placeholder="Amount (min $10)"
              required
              style={{
                flex: 1,
                minWidth: "200px",
                padding: "12px",
                color: "#ffffff",
                background: "#0f172a",
                border: "1px solid #334155",
                borderRadius: "8px",
                fontSize: "16px",
              }}
            />
            <button
              type="submit"
              disabled={depositLoading}
              style={{
                padding: "12px 30px",
                background: depositLoading ? "#64748b" : "#4ade80",
                color: depositLoading ? "#94a3b8" : "#0f172a",
                border: "none",
                borderRadius: "8px",
                cursor: depositLoading ? "not-allowed" : "pointer",
                fontSize: "16px",
                fontWeight: "bold",
                transition: "all 0.3s ease",
              }}
            >
              {depositLoading ? "Processing..." : "Add Deposit"}
            </button>
          </form>
        </div>

        <div
          style={{
            background: "#1e293b",
            border: "1px solid #334155",
            padding: "25px",
            borderRadius: "12px",
            marginBottom: "40px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
          }}
        >
          <h3 style={{ color: "#ffffff", marginBottom: "20px", fontSize: "20px" }}>Account Stats</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "15px" }}>
            <div>
              <p style={{ color: "#94a3b8", fontSize: "14px", margin: "0 0 5px 0" }}>Total Orders</p>
              <p style={{ color: "#4ade80", fontWeight: "bold", fontSize: "24px", margin: 0 }}>
                {customer?.order_count || 0}
              </p>
            </div>
            <div>
              <p style={{ color: "#94a3b8", fontSize: "14px", margin: "0 0 5px 0" }}>Total Spent</p>
              <p style={{ color: "#4ade80", fontWeight: "bold", fontSize: "24px", margin: 0 }}>
                ${Number.parseFloat(customer?.total_spent || 0).toFixed(2)}
              </p>
            </div>
            <div>
              <p style={{ color: "#94a3b8", fontSize: "14px", margin: "0 0 5px 0" }}>Status</p>
              <p style={{ color: "#e0e7ff", fontWeight: "500", fontSize: "16px", margin: 0 }}>
                {customer?.registration_status}
              </p>
            </div>
            <div>
              <p style={{ color: "#94a3b8", fontSize: "14px", margin: "0 0 5px 0" }}>Warnings</p>
              <p
                style={{
                  color: customer?.warning_count > 0 ? "#ef4444" : "#4ade80",
                  fontWeight: "bold",
                  fontSize: "24px",
                  margin: 0,
                }}
              >
                {customer?.warning_count || 0}
              </p>
            </div>
          </div>
        </div>

        <div style={{ marginBottom: "40px" }}>
          <a
            href="/orders"
            style={{
              color: "#4ade80",
              textDecoration: "none",
              fontSize: "16px",
              fontWeight: "bold",
              transition: "all 0.3s ease",
            }}
          >
            → View Order History
          </a>
        </div>

        <div style={{ marginTop: "40px", paddingTop: "25px", borderTop: "1px solid #334155" }}>
          <h3 style={{ color: "#ef4444", fontSize: "20px", marginBottom: "20px" }}>Danger Zone</h3>
          {!showCloseAccount ? (
            <button
              onClick={() => setShowCloseAccount(true)}
              style={{
                background: "#dc2626",
                color: "white",
                border: "none",
                padding: "12px 24px",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "16px",
                fontWeight: "bold",
                transition: "all 0.3s ease",
              }}
            >
              Close Account
            </button>
          ) : (
            <div
              style={{
                background: "#7f2d1d",
                border: "1px solid #dc2626",
                borderRadius: "8px",
                padding: "25px",
              }}
            >
              <h4 style={{ color: "#fca5a5", marginTop: 0, marginBottom: "15px", fontSize: "18px" }}>
                Close Your Account
              </h4>
              <p style={{ color: "#fecaca", marginBottom: "15px" }}>
                Warning: This action cannot be undone. Your account balance must be $0 to close your account.
              </p>
              <p style={{ color: "#fecaca", marginBottom: "15px", fontSize: "16px" }}>
                Current Balance: ${Number.parseFloat(customer?.deposit_balance || 0).toFixed(2)}
              </p>
              {Number.parseFloat(customer?.deposit_balance || 0) > 0 && (
                <p style={{ color: "#fca5a5", marginBottom: "15px", fontWeight: "bold" }}>
                  You cannot close your account while you have a remaining balance.
                </p>
              )}
              <textarea
                value={closureReason}
                onChange={(e) => setClosureReason(e.target.value)}
                placeholder="Please tell us why you're closing your account..."
                rows="4"
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "1px solid #dc2626",
                  borderRadius: "8px",
                  marginBottom: "15px",
                  background: "#0f172a",
                  color: "#ffffff",
                  fontSize: "14px",
                }}
              />
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                <button
                  onClick={handleCloseAccount}
                  disabled={Number.parseFloat(customer?.deposit_balance || 0) > 0}
                  style={{
                    background: "#dc2626",
                    color: "white",
                    border: "none",
                    padding: "10px 20px",
                    borderRadius: "8px",
                    cursor: Number.parseFloat(customer?.deposit_balance || 0) > 0 ? "not-allowed" : "pointer",
                    opacity: Number.parseFloat(customer?.deposit_balance || 0) > 0 ? 0.5 : 1,
                    fontSize: "14px",
                    fontWeight: "bold",
                    transition: "all 0.3s ease",
                  }}
                >
                  Confirm Account Closure
                </button>
                <button
                  onClick={() => {
                    setShowCloseAccount(false)
                    setClosureReason("")
                    setError(null)
                  }}
                  style={{
                    background: "#475569",
                    color: "white",
                    border: "none",
                    padding: "10px 20px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: "bold",
                    transition: "all 0.3s ease",
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DashboardPage
