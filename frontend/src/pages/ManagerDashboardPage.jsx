"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import socketService from "../services/socketService"

const ManagerDashboardPage = () => {
  const [readyOrders, setReadyOrders] = useState([])
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [bids, setBids] = useState([])
  const [justification, setJustification] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    fetchReadyOrders()

    socketService.on("new_bid", handleNewBid)
    socketService.on("new_order_ready", handleNewOrderReady)

    return () => {
      socketService.off("new_bid", handleNewBid)
      socketService.off("new_order_ready", handleNewOrderReady)
    }
  }, [])

  const handleNewBid = (data) => {
    if (selectedOrder && data.orderId === selectedOrder.order_id) {
      fetchBidsForOrder(selectedOrder.order_id)
    }
  }

  const handleNewOrderReady = (data) => {
    fetchReadyOrders()
  }

  const fetchReadyOrders = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("http://localhost:3001/api/bidding/orders/with-bids", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setReadyOrders(data)
      }
      setLoading(false)
    } catch (err) {
      setError("Failed to fetch orders")
      setLoading(false)
    }
  }

  const fetchBidsForOrder = async (orderId) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`http://localhost:3001/api/bidding/orders/${orderId}/bids`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setBids(data)
      }
    } catch (err) {
      setError("Failed to fetch bids")
    }
  }

  const handleSelectOrder = (order) => {
    setSelectedOrder(order)
    setBids([])
    setJustification("")
    fetchBidsForOrder(order.order_id)
  }

  const handleAcceptBid = async (bidId) => {
    if (!justification.trim()) {
      alert("Please provide a justification for accepting this bid")
      return
    }

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`http://localhost:3001/api/bidding/bids/${bidId}/accept`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ justification }),
      })

      if (response.ok) {
        alert("Bid accepted successfully!")
        setSelectedOrder(null)
        setBids([])
        setJustification("")
        fetchReadyOrders()
      } else {
        const data = await response.json()
        alert(`Failed to accept bid: ${data.error}`)
      }
    } catch (err) {
      alert("Failed to accept bid")
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
        <div style={{ fontSize: "18px", color: "#a1a5b4" }}>Loading...</div>
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
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
          <h1 style={{ fontSize: "28px", fontWeight: "bold", color: "#ffffff" }}>Manager Dashboard - Bid Management</h1>
          <div style={{ display: "flex", gap: "12px" }}>
            <button
              onClick={() => navigate("/manager/performance")}
              style={{
                background: "#4ade80",
                color: "#ffffff",
                fontWeight: "600",
                padding: "10px 16px",
                borderRadius: "6px",
                border: "none",
                cursor: "pointer",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#22c55e")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#4ade80")}
            >
              Performance & VIP
            </button>
            <button
              onClick={() => navigate("/manager/complaints")}
              style={{
                background: "#f59e0b",
                color: "#ffffff",
                fontWeight: "600",
                padding: "10px 16px",
                borderRadius: "6px",
                border: "none",
                cursor: "pointer",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#d97706")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#f59e0b")}
            >
              Review Complaints
            </button>
          </div>
        </div>

        {error && (
          <div
            style={{
              background: "#7f1d1d",
              border: "1px solid #dc2626",
              color: "#fca5a5",
              padding: "12px 16px",
              borderRadius: "6px",
              marginBottom: "16px",
            }}
          >
            {error}
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px" }}>
          {/* Orders Ready for Delivery */}
          <div
            style={{
              background: "#1e293b",
              borderRadius: "8px",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.3)",
              padding: "24px",
              border: "1px solid #334155",
            }}
          >
            <h2 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "16px", color: "#ffffff" }}>
              Orders Ready for Delivery
            </h2>

            {readyOrders.length === 0 ? (
              <p style={{ color: "#a1a5b4" }}>No orders ready for delivery</p>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "12px" }}>
                {readyOrders.map((order) => (
                  <div
                    key={order.order_id}
                    onClick={() => handleSelectOrder(order)}
                    style={{
                      border: selectedOrder?.order_id === order.order_id ? "2px solid #4ade80" : "1px solid #475569",
                      borderRadius: "6px",
                      padding: "16px",
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                      background: selectedOrder?.order_id === order.order_id ? "#0f172a" : "#0f172a",
                      hover: "borderColor: #4ade80",
                    }}
                    onMouseEnter={(e) => {
                      if (selectedOrder?.order_id !== order.order_id) {
                        e.currentTarget.style.borderColor = "#4ade80"
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedOrder?.order_id !== order.order_id) {
                        e.currentTarget.style.borderColor = "#475569"
                      }
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <p style={{ fontWeight: "600", color: "#ffffff" }}>Order #{order.order_id}</p>
                        <p style={{ fontSize: "13px", color: "#cbd5e1", marginTop: "4px" }}>{order.delivery_address}</p>
                        <p style={{ fontSize: "13px", color: "#64748b", marginTop: "4px" }}>
                          {new Date(order.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <p style={{ fontWeight: "600", fontSize: "18px", color: "#4ade80" }}>
                          ${Number.parseFloat(order.total).toFixed(2)}
                        </p>
                        <p style={{ fontSize: "13px", color: "#64748b", marginTop: "4px" }}>
                          {order.assigned_delivery_person ? "Assigned" : "Pending"}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bids for Selected Order */}
          <div
            style={{
              background: "#1e293b",
              borderRadius: "8px",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.3)",
              padding: "24px",
              border: "1px solid #334155",
            }}
          >
            <h2 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "16px", color: "#ffffff" }}>
              {selectedOrder ? `Bids for Order #${selectedOrder.order_id}` : "Select an Order"}
            </h2>

            {!selectedOrder ? (
              <p style={{ color: "#a1a5b4" }}>Select an order to view bids</p>
            ) : bids.length === 0 ? (
              <p style={{ color: "#a1a5b4" }}>No bids yet for this order</p>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "12px" }}>
                {bids.map((bid) => (
                  <div
                    key={bid.bid_id}
                    style={{ border: "1px solid #475569", borderRadius: "6px", padding: "16px", background: "#0f172a" }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: "12px",
                      }}
                    >
                      <div>
                        <p style={{ fontWeight: "600", color: "#ffffff" }}>
                          {bid.DeliveryPerson?.User?.first_name} {bid.DeliveryPerson?.User?.last_name}
                        </p>
                        <p style={{ fontSize: "13px", color: "#cbd5e1", marginTop: "4px" }}>
                          {bid.DeliveryPerson?.User?.email}
                        </p>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <p style={{ fontWeight: "600", fontSize: "18px", color: "#4ade80" }}>
                          ${Number.parseFloat(bid.bid_amount).toFixed(2)}
                        </p>
                        <p style={{ fontSize: "13px", color: "#64748b", marginTop: "4px" }}>
                          {bid.estimated_time_minutes} min
                        </p>
                      </div>
                    </div>

                    {bid.notes && (
                      <p style={{ fontSize: "13px", color: "#cbd5e1", marginBottom: "12px" }}>
                        <span style={{ fontWeight: "500" }}>Notes:</span> {bid.notes}
                      </p>
                    )}

                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                      <span style={{ fontSize: "12px", color: "#64748b" }}>Rating:</span>
                      <span style={{ fontSize: "13px", fontWeight: "500", color: "#4ade80" }}>
                        {Number.parseFloat(bid.DeliveryPerson?.average_rating || 0).toFixed(1)} ⭐
                      </span>
                      <span style={{ fontSize: "12px", color: "#64748b" }}>
                        ({bid.DeliveryPerson?.total_ratings || 0} ratings)
                      </span>
                    </div>

                    <div style={{ paddingTop: "12px", borderTop: "1px solid #475569" }}>
                      <label
                        style={{
                          display: "block",
                          fontSize: "13px",
                          fontWeight: "500",
                          color: "#ffffff",
                          marginBottom: "8px",
                        }}
                      >
                        Justification for accepting this bid:
                      </label>
                      <textarea
                        style={{
                          width: "100%",
                          padding: "8px 10px",
                          border: "1px solid #475569",
                          borderRadius: "4px",
                          background: "#1e293b",
                          color: "#ffffff",
                          marginBottom: "12px",
                          fontFamily: "inherit",
                          resize: "vertical",
                        }}
                        rows={2}
                        placeholder="Explain why you are accepting this bid..."
                        value={justification}
                        onChange={(e) => setJustification(e.target.value)}
                      />
                      <button
                        onClick={() => handleAcceptBid(bid.bid_id)}
                        style={{
                          width: "100%",
                          background: "#4ade80",
                          color: "#ffffff",
                          padding: "8px 12px",
                          borderRadius: "4px",
                          border: "none",
                          fontWeight: "600",
                          cursor: "pointer",
                          transition: "all 0.3s ease",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "#22c55e")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "#4ade80")}
                      >
                        Accept Bid
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ManagerDashboardPage
