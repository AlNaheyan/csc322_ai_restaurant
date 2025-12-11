"use client"

import { useState, useEffect } from "react"

const ManagerPerformanceReviewPage = () => {
  const [performanceHistory, setPerformanceHistory] = useState([])
  const [vipCustomers, setVipCustomers] = useState([])
  const [blacklist, setBlacklist] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("performance")

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    await Promise.all([loadPerformanceHistory(), loadVipCustomers(), loadBlacklist()])
    setLoading(false)
  }

  const loadPerformanceHistory = async () => {
    try {
      const response = await fetch("http://localhost:3001/api/performance/history", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      const data = await response.json()
      if (response.ok) {
        setPerformanceHistory(data.data)
      }
    } catch (err) {
      console.error("Failed to load performance history:", err)
    }
  }

  const loadVipCustomers = async () => {
    try {
      const response = await fetch("http://localhost:3001/api/vip/customers", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      const data = await response.json()
      if (response.ok) {
        setVipCustomers(data.data)
      }
    } catch (err) {
      console.error("Failed to load VIP customers:", err)
    }
  }

  const loadBlacklist = async () => {
    try {
      const response = await fetch("http://localhost:3001/api/performance/blacklist", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      const data = await response.json()
      if (response.ok) {
        setBlacklist(data.data)
      }
    } catch (err) {
      console.error("Failed to load blacklist:", err)
    }
  }

  const handleEvaluateAll = async () => {
    if (!confirm("Run performance evaluation for all employees?")) return

    try {
      const response = await fetch("http://localhost:3001/api/performance/evaluate-all", {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      const data = await response.json()
      if (response.ok) {
        alert(
          `Evaluation complete:\n${data.data.bonuses.length} bonuses\n${data.data.demotions.length} demotions\n${data.data.terminations.length} terminations`,
        )
        loadPerformanceHistory()
      }
    } catch (err) {
      alert("Failed to run evaluation")
    }
  }

  const handleCheckVipStatus = async () => {
    if (!confirm("Check VIP status for all customers?")) return

    try {
      const response = await fetch("http://localhost:3001/api/vip/check-all", {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      const data = await response.json()
      if (response.ok) {
        alert(`VIP check complete:\n${data.data.upgraded.length} upgraded\n${data.data.downgraded.length} downgraded`)
        loadVipCustomers()
      }
    } catch (err) {
      alert("Failed to check VIP status")
    }
  }

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #0f172a 0%, #1a1f3a 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ color: "#a1a5b4", fontSize: "18px" }}>Loading...</div>
      </div>
    )
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0f172a 0%, #1a1f3a 100%)",
        padding: "32px 16px",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <h1 style={{ fontSize: "28px", fontWeight: "bold", marginBottom: "24px", color: "#ffffff" }}>
          Performance & VIP Management
        </h1>

        <div style={{ marginBottom: "24px", display: "flex", gap: "12px" }}>
          <button
            onClick={() => setActiveTab("performance")}
            style={{
              padding: "10px 16px",
              border: "1px solid #475569",
              background: activeTab === "performance" ? "#4ade80" : "transparent",
              color: activeTab === "performance" ? "#ffffff" : "#cbd5e1",
              cursor: "pointer",
              borderRadius: "6px",
              fontWeight: "600",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              if (activeTab !== "performance") {
                e.currentTarget.style.borderColor = "#4ade80"
                e.currentTarget.style.color = "#4ade80"
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== "performance") {
                e.currentTarget.style.borderColor = "#475569"
                e.currentTarget.style.color = "#cbd5e1"
              }
            }}
          >
            Performance History
          </button>
          <button
            onClick={() => setActiveTab("vip")}
            style={{
              padding: "10px 16px",
              border: "1px solid #475569",
              background: activeTab === "vip" ? "#4ade80" : "transparent",
              color: activeTab === "vip" ? "#ffffff" : "#cbd5e1",
              cursor: "pointer",
              borderRadius: "6px",
              fontWeight: "600",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              if (activeTab !== "vip") {
                e.currentTarget.style.borderColor = "#4ade80"
                e.currentTarget.style.color = "#4ade80"
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== "vip") {
                e.currentTarget.style.borderColor = "#475569"
                e.currentTarget.style.color = "#cbd5e1"
              }
            }}
          >
            VIP Customers
          </button>
          <button
            onClick={() => setActiveTab("blacklist")}
            style={{
              padding: "10px 16px",
              border: "1px solid #475569",
              background: activeTab === "blacklist" ? "#4ade80" : "transparent",
              color: activeTab === "blacklist" ? "#ffffff" : "#cbd5e1",
              cursor: "pointer",
              borderRadius: "6px",
              fontWeight: "600",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              if (activeTab !== "blacklist") {
                e.currentTarget.style.borderColor = "#4ade80"
                e.currentTarget.style.color = "#4ade80"
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== "blacklist") {
                e.currentTarget.style.borderColor = "#475569"
                e.currentTarget.style.color = "#cbd5e1"
              }
            }}
          >
            Blacklist
          </button>
        </div>

        {activeTab === "performance" && (
          <div>
            <div style={{ marginBottom: "20px", display: "flex", gap: "10px" }}>
              <button
                onClick={handleEvaluateAll}
                style={{
                  padding: "10px 16px",
                  background: "#4ade80",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "600",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#22c55e")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "#4ade80")}
              >
                Run Employee Evaluation
              </button>
            </div>

            <div
              style={{
                borderCollapse: "collapse",
                background: "#1e293b",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.3)",
                borderRadius: "8px",
                overflow: "hidden",
                border: "1px solid #334155",
              }}
            >
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#0f172a", borderBottom: "1px solid #334155" }}>
                    <th
                      style={{
                        padding: "16px",
                        textAlign: "left",
                        color: "#ffffff",
                        fontWeight: "600",
                        fontSize: "14px",
                      }}
                    >
                      Employee
                    </th>
                    <th
                      style={{
                        padding: "16px",
                        textAlign: "left",
                        color: "#ffffff",
                        fontWeight: "600",
                        fontSize: "14px",
                      }}
                    >
                      Date
                    </th>
                    <th
                      style={{
                        padding: "16px",
                        textAlign: "left",
                        color: "#ffffff",
                        fontWeight: "600",
                        fontSize: "14px",
                      }}
                    >
                      Avg Rating
                    </th>
                    <th
                      style={{
                        padding: "16px",
                        textAlign: "left",
                        color: "#ffffff",
                        fontWeight: "600",
                        fontSize: "14px",
                      }}
                    >
                      Total Ratings
                    </th>
                    <th
                      style={{
                        padding: "16px",
                        textAlign: "left",
                        color: "#ffffff",
                        fontWeight: "600",
                        fontSize: "14px",
                      }}
                    >
                      Action Taken
                    </th>
                    <th
                      style={{
                        padding: "16px",
                        textAlign: "left",
                        color: "#ffffff",
                        fontWeight: "600",
                        fontSize: "14px",
                      }}
                    >
                      Bonus/Salary Change
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {performanceHistory.map((record) => (
                    <tr key={record.history_id} style={{ borderBottom: "1px solid #334155" }}>
                      <td style={{ padding: "16px", color: "#cbd5e1" }}>
                        {record.Employee?.User?.first_name} {record.Employee?.User?.last_name}
                      </td>
                      <td style={{ padding: "16px", color: "#cbd5e1" }}>
                        {new Date(record.evaluation_date).toLocaleDateString()}
                      </td>
                      <td style={{ padding: "16px", color: "#cbd5e1" }}>{record.rating_average}</td>
                      <td style={{ padding: "16px", color: "#cbd5e1" }}>{record.total_ratings}</td>
                      <td style={{ padding: "16px" }}>
                        <span
                          style={{
                            padding: "6px 12px",
                            borderRadius: "4px",
                            fontSize: "12px",
                            fontWeight: "500",
                            background:
                              record.action_taken === "bonus"
                                ? "#166534"
                                : record.action_taken === "termination"
                                  ? "#7f1d1d"
                                  : record.action_taken === "demotion"
                                    ? "#92400e"
                                    : "#334155",
                            color:
                              record.action_taken === "bonus"
                                ? "#86efac"
                                : record.action_taken === "termination"
                                  ? "#fca5a5"
                                  : record.action_taken === "demotion"
                                    ? "#fcd34d"
                                    : "#a1a5b4",
                          }}
                        >
                          {record.action_taken || "none"}
                        </span>
                      </td>
                      <td style={{ padding: "16px", color: "#4ade80" }}>
                        {record.bonus_amount && `+$${Number.parseFloat(record.bonus_amount).toFixed(2)}`}
                        {record.salary_change && `${Number.parseFloat(record.salary_change).toFixed(2)}`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "vip" && (
          <div>
            <div style={{ marginBottom: "20px", display: "flex", gap: "10px" }}>
              <button
                onClick={handleCheckVipStatus}
                style={{
                  padding: "10px 16px",
                  background: "#4ade80",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "600",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#22c55e")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "#4ade80")}
              >
                Check All VIP Status
              </button>
            </div>

            <div
              style={{
                borderCollapse: "collapse",
                background: "#1e293b",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.3)",
                borderRadius: "8px",
                overflow: "hidden",
                border: "1px solid #334155",
              }}
            >
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#0f172a", borderBottom: "1px solid #334155" }}>
                    <th
                      style={{
                        padding: "16px",
                        textAlign: "left",
                        color: "#ffffff",
                        fontWeight: "600",
                        fontSize: "14px",
                      }}
                    >
                      Customer
                    </th>
                    <th
                      style={{
                        padding: "16px",
                        textAlign: "left",
                        color: "#ffffff",
                        fontWeight: "600",
                        fontSize: "14px",
                      }}
                    >
                      Email
                    </th>
                    <th
                      style={{
                        padding: "16px",
                        textAlign: "left",
                        color: "#ffffff",
                        fontWeight: "600",
                        fontSize: "14px",
                      }}
                    >
                      Total Spent
                    </th>
                    <th
                      style={{
                        padding: "16px",
                        textAlign: "left",
                        color: "#ffffff",
                        fontWeight: "600",
                        fontSize: "14px",
                      }}
                    >
                      Order Count
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {vipCustomers.map((customer) => (
                    <tr key={customer.customer_id} style={{ borderBottom: "1px solid #334155" }}>
                      <td style={{ padding: "16px", color: "#cbd5e1" }}>
                        {customer.User?.first_name} {customer.User?.last_name}
                      </td>
                      <td style={{ padding: "16px", color: "#cbd5e1" }}>{customer.User?.email}</td>
                      <td style={{ padding: "16px", color: "#4ade80", fontWeight: "600" }}>
                        ${Number.parseFloat(customer.total_spent || 0).toFixed(2)}
                      </td>
                      <td style={{ padding: "16px", color: "#cbd5e1" }}>{customer.order_count || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "blacklist" && (
          <div>
            <div
              style={{
                borderCollapse: "collapse",
                background: "#1e293b",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.3)",
                borderRadius: "8px",
                overflow: "hidden",
                border: "1px solid #334155",
              }}
            >
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#0f172a", borderBottom: "1px solid #334155" }}>
                    <th
                      style={{
                        padding: "16px",
                        textAlign: "left",
                        color: "#ffffff",
                        fontWeight: "600",
                        fontSize: "14px",
                      }}
                    >
                      User
                    </th>
                    <th
                      style={{
                        padding: "16px",
                        textAlign: "left",
                        color: "#ffffff",
                        fontWeight: "600",
                        fontSize: "14px",
                      }}
                    >
                      Reason
                    </th>
                    <th
                      style={{
                        padding: "16px",
                        textAlign: "left",
                        color: "#ffffff",
                        fontWeight: "600",
                        fontSize: "14px",
                      }}
                    >
                      Blacklisted By
                    </th>
                    <th
                      style={{
                        padding: "16px",
                        textAlign: "left",
                        color: "#ffffff",
                        fontWeight: "600",
                        fontSize: "14px",
                      }}
                    >
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {blacklist.map((record) => (
                    <tr key={record.blacklist_id} style={{ borderBottom: "1px solid #334155" }}>
                      <td style={{ padding: "16px", color: "#cbd5e1" }}>
                        {record.BlacklistedUser?.first_name} {record.BlacklistedUser?.last_name}
                      </td>
                      <td style={{ padding: "16px", color: "#cbd5e1" }}>{record.reason}</td>
                      <td style={{ padding: "16px", color: "#cbd5e1" }}>
                        {record.BlacklistedBy?.first_name} {record.BlacklistedBy?.last_name}
                      </td>
                      <td style={{ padding: "16px", color: "#cbd5e1" }}>
                        {new Date(record.blacklisted_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ManagerPerformanceReviewPage
