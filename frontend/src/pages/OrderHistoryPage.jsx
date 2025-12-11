"use client"

import { useState, useEffect } from "react"
import { orderService } from "../services/orderService"
import socketService from "../services/socketService"
import RatingForm from "../components/RatingForm"
import ComplaintForm from "../components/ComplaintForm"

function OrderHistoryPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [ratingOrder, setRatingOrder] = useState(null)
  const [ratingType, setRatingType] = useState(null)
  const [showComplaintForm, setShowComplaintForm] = useState(false)

  useEffect(() => {
    loadOrders()

    socketService.on("order_status_update", handleOrderStatusUpdate)

    return () => {
      socketService.off("order_status_update", handleOrderStatusUpdate)
    }
  }, [])

  const handleOrderStatusUpdate = (data) => {
    setOrders((prevOrders) =>
      prevOrders.map((order) => (order.order_id === data.orderId ? { ...order, status: data.status } : order)),
    )
  }

  const loadOrders = async () => {
    try {
      const data = await orderService.getMyOrders()
      setOrders(data)
      setLoading(false)
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load orders")
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: "#fbbf24",
      confirmed: "#06b6d4",
      preparing: "#f97316",
      ready_for_delivery: "#10b981",
      out_for_delivery: "#3b82f6",
      delivered: "#4ade80",
      cancelled: "#ef4444",
    }
    return colors[status] || "#64748b"
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
        Loading orders...
      </div>
    )
  if (error)
    return (
      <div
        style={{
          padding: "40px",
          minHeight: "100vh",
          background: "linear-gradient(135deg, #0f172a 0%, #1a1f3a 100%)",
          color: "#fca5a5",
        }}
      >
        {error}
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
      <div style={{ maxWidth: "1400px", width: "100%", margin: "0 auto", boxSizing: "border-box" }}>
        <h2 style={{ fontSize: "clamp(28px, 5vw, 36px)", marginBottom: "30px", color: "#ffffff" }}>Order History</h2>

        {orders.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "#cbd5e1" }}>
            <p style={{ fontSize: "18px", marginBottom: "20px" }}>You haven't placed any orders yet</p>
            <a
              href="/menu"
              style={{
                display: "inline-block",
                color: "#4ade80",
                textDecoration: "none",
                fontSize: "16px",
                fontWeight: "bold",
                transition: "all 0.3s ease",
              }}
            >
              Browse menu to place your first order →
            </a>
          </div>
        ) : (
          <div style={{ marginTop: "20px" }}>
            {orders.map((order) => (
              <div
                key={order.order_id}
                style={{
                  background: "#1e293b",
                  border: "1px solid #334155",
                  borderRadius: "12px",
                  padding: "25px",
                  marginBottom: "20px",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
                  transition: "all 0.3s ease",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "20px",
                    alignItems: "flex-start",
                    flexWrap: "wrap",
                    gap: "15px",
                  }}
                >
                  <div>
                    <h3 style={{ color: "#ffffff", margin: "0 0 8px 0", fontSize: "18px" }}>Order #{order.order_id}</h3>
                    <p style={{ color: "#94a3b8", fontSize: "14px", margin: 0 }}>
                      {new Date(order.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <span
                      style={{
                        background: getStatusColor(order.status),
                        color: "#0f172a",
                        padding: "8px 16px",
                        borderRadius: "6px",
                        fontSize: "13px",
                        fontWeight: "bold",
                      }}
                    >
                      {order.status.replace(/_/g, " ").toUpperCase()}
                    </span>
                  </div>
                </div>

                <div style={{ borderTop: "1px solid #334155", paddingTop: "20px", marginTop: "20px" }}>
                  <h4 style={{ color: "#ffffff", marginBottom: "15px", fontSize: "16px" }}>Items:</h4>
                  {order.OrderItems?.map((item) => (
                    <div
                      key={item.order_item_id}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "12px 0",
                        borderBottom: "1px solid #334155",
                      }}
                    >
                      <span style={{ color: "#cbd5e1" }}>
                        {item.MenuItem?.name || "Item"} x {item.quantity}
                      </span>
                      <span style={{ color: "#4ade80", fontWeight: "bold" }}>
                        ${Number.parseFloat(item.price_at_order * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: "20px", paddingTop: "20px", borderTop: "1px solid #334155" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                    <span style={{ color: "#94a3b8" }}>Subtotal:</span>
                    <span style={{ color: "#e0e7ff" }}>${Number.parseFloat(order.subtotal).toFixed(2)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                    <span style={{ color: "#94a3b8" }}>Tax:</span>
                    <span style={{ color: "#e0e7ff" }}>${Number.parseFloat(order.tax).toFixed(2)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                    <span style={{ color: "#94a3b8" }}>Delivery Fee:</span>
                    <span style={{ color: "#e0e7ff" }}>
                      {order.is_free_delivery ? (
                        <span style={{ color: "#4ade80", fontWeight: "bold" }}>FREE</span>
                      ) : (
                        `$${Number.parseFloat(order.delivery_fee).toFixed(2)}`
                      )}
                    </span>
                  </div>
                  {order.discount > 0 && (
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                      <span style={{ color: "#94a3b8" }}>Discount:</span>
                      <span style={{ color: "#4ade80", fontWeight: "bold" }}>
                        -${Number.parseFloat(order.discount).toFixed(2)}
                      </span>
                    </div>
                  )}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginTop: "15px",
                      paddingTop: "15px",
                      borderTop: "2px solid #4ade80",
                    }}
                  >
                    <span style={{ color: "#ffffff", fontWeight: "bold", fontSize: "18px" }}>Total:</span>
                    <span style={{ color: "#4ade80", fontWeight: "bold", fontSize: "18px" }}>
                      ${Number.parseFloat(order.total).toFixed(2)}
                    </span>
                  </div>
                </div>

                <div style={{ marginTop: "20px", paddingTop: "20px", borderTop: "1px solid #334155" }}>
                  <p style={{ color: "#cbd5e1", fontSize: "14px", margin: "8px 0" }}>
                    <strong style={{ color: "#ffffff" }}>Delivery Address:</strong> {order.delivery_address}
                  </p>
                  {order.special_instructions && (
                    <p style={{ color: "#cbd5e1", fontSize: "14px", margin: "8px 0" }}>
                      <strong style={{ color: "#ffffff" }}>Special Instructions:</strong> {order.special_instructions}
                    </p>
                  )}
                  {order.estimated_delivery_time && (
                    <p style={{ color: "#cbd5e1", fontSize: "14px", margin: "8px 0" }}>
                      <strong style={{ color: "#ffffff" }}>Estimated Delivery:</strong>{" "}
                      {new Date(order.estimated_delivery_time).toLocaleString()}
                    </p>
                  )}
                  {order.actual_delivery_time && (
                    <p style={{ color: "#cbd5e1", fontSize: "14px", margin: "8px 0" }}>
                      <strong style={{ color: "#ffffff" }}>Delivered At:</strong>{" "}
                      {new Date(order.actual_delivery_time).toLocaleString()}
                    </p>
                  )}
                </div>

                {order.status === "delivered" && (
                  <div style={{ marginTop: "20px", paddingTop: "20px", borderTop: "1px solid #334155" }}>
                    <h4 style={{ color: "#ffffff", marginBottom: "15px", fontSize: "16px" }}>Actions:</h4>
                    <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                      <button
                        onClick={() => {
                          setRatingOrder(order)
                          setRatingType("food")
                        }}
                        style={{
                          background: "#4ade80",
                          color: "#0f172a",
                          border: "none",
                          padding: "10px 20px",
                          borderRadius: "8px",
                          cursor: "pointer",
                          fontSize: "14px",
                          fontWeight: "bold",
                          transition: "all 0.3s ease",
                        }}
                      >
                        Rate Food/Chef
                      </button>
                      <button
                        onClick={() => {
                          setRatingOrder(order)
                          setRatingType("delivery")
                        }}
                        style={{
                          background: "#06b6d4",
                          color: "#0f172a",
                          border: "none",
                          padding: "10px 20px",
                          borderRadius: "8px",
                          cursor: "pointer",
                          fontSize: "14px",
                          fontWeight: "bold",
                          transition: "all 0.3s ease",
                        }}
                      >
                        Rate Delivery
                      </button>
                      <button
                        onClick={() => {
                          setRatingOrder(order)
                          setShowComplaintForm(true)
                        }}
                        style={{
                          background: "#fbbf24",
                          color: "#1f2937",
                          border: "none",
                          padding: "10px 20px",
                          borderRadius: "8px",
                          cursor: "pointer",
                          fontSize: "14px",
                          fontWeight: "bold",
                          transition: "all 0.3s ease",
                        }}
                      >
                        File Complaint
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {ratingOrder && ratingType && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0, 0, 0, 0.8)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
            }}
          >
            <div style={{ maxWidth: "500px", width: "100%", padding: "20px" }}>
              <RatingForm
                orderId={ratingOrder.order_id}
                targetType={ratingType}
                targetId={
                  ratingType === "food" ? ratingOrder.OrderItems?.[0]?.chef_id : ratingOrder.assigned_delivery_person
                }
                targetName={ratingType === "food" ? "Chef" : "Delivery Person"}
                onSubmit={() => {
                  setRatingOrder(null)
                  setRatingType(null)
                  alert("Rating submitted successfully!")
                }}
                onCancel={() => {
                  setRatingOrder(null)
                  setRatingType(null)
                }}
              />
            </div>
          </div>
        )}

        {showComplaintForm && ratingOrder && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0, 0, 0, 0.8)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
            }}
          >
            <div style={{ maxWidth: "600px", width: "100%", padding: "20px" }}>
              <ComplaintForm
                order={ratingOrder}
                onSubmit={() => {
                  setShowComplaintForm(false)
                  setRatingOrder(null)
                  alert("Complaint/Compliment submitted successfully!")
                }}
                onCancel={() => {
                  setShowComplaintForm(false)
                  setRatingOrder(null)
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default OrderHistoryPage
