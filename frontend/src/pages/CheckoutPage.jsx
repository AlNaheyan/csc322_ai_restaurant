"use client"

import { useState } from "react"
import { useSelector, useDispatch } from "react-redux"
import { useNavigate } from "react-router-dom"
import { orderService } from "../services/orderService"
import { clearCart } from "../store/cartSlice"

function CheckoutPage() {
  const { items } = useSelector((state) => state.cart)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const [deliveryAddress, setDeliveryAddress] = useState("")
  const [specialInstructions, setSpecialInstructions] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const orderData = {
        items: items.map((item) => ({
          item_id: item.item_id,
          quantity: item.quantity,
        })),
        delivery_address: deliveryAddress,
        special_instructions: specialInstructions,
      }

      const result = await orderService.createOrder(orderData)
      dispatch(clearCart())
      alert(`Order placed successfully! Order ID: ${result.order_id}`)
      navigate("/orders")
    } catch (err) {
      setError(err.response?.data?.error || "Failed to place order")
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #0f172a 0%, #1a1f3a 100%)",
          padding: "clamp(20px, 5vw, 60px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            textAlign: "center",
            background: "#1e293b",
            padding: "clamp(30px, 8vw, 60px)",
            borderRadius: "12px",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            maxWidth: "400px",
          }}
        >
          <h2
            style={{
              fontSize: "clamp(24px, 5vw, 32px)",
              color: "#f1f5f9",
              marginBottom: "12px",
              fontWeight: "600",
            }}
          >
            Checkout
          </h2>
          <p
            style={{
              fontSize: "clamp(14px, 3vw, 16px)",
              color: "#cbd5e1",
              marginBottom: "32px",
            }}
          >
            Your cart is empty
          </p>
          <a
            href="/menu"
            style={{
              display: "inline-block",
              background: "#4ade80",
              color: "#0f172a",
              padding: "12px 32px",
              borderRadius: "8px",
              textDecoration: "none",
              fontWeight: "600",
              fontSize: "14px",
              transition: "all 0.3s ease",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              e.target.style.background = "#22c55e"
              e.target.style.transform = "translateY(-2px)"
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "#4ade80"
              e.target.style.transform = "translateY(0)"
            }}
          >
            Browse Menu
          </a>
        </div>
      </div>
    )
  }

  const totalPrice = items.reduce((sum, item) => sum + Number.parseFloat(item.price) * item.quantity, 0)

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0f172a 0%, #1a1f3a 100%)",
        padding: "clamp(20px, 5vw, 60px)",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
        }}
      >
        <h2
          style={{
            fontSize: "clamp(24px, 4vw, 32px)",
            color: "#f1f5f9",
            marginBottom: "32px",
            fontWeight: "600",
          }}
        >
          Checkout
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "32px",
          }}
        >
          <form
            onSubmit={handleSubmit}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "20px",
            }}
          >
            {/* Delivery Address Field */}
            <div
              style={{
                background: "#1e293b",
                padding: "20px",
                borderRadius: "12px",
                border: "1px solid rgba(255, 255, 255, 0.1)",
              }}
            >
              <label
                style={{
                  display: "block",
                  color: "#f1f5f9",
                  fontWeight: "500",
                  marginBottom: "8px",
                  fontSize: "14px",
                }}
              >
                Delivery Address
              </label>
              <textarea
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                required
                rows="4"
                style={{
                  width: "100%",
                  padding: "12px",
                  marginTop: "8px",
                  background: "#0f172a",
                  border: "1px solid rgba(74, 222, 128, 0.3)",
                  borderRadius: "8px",
                  color: "#f1f5f9",
                  fontFamily: "inherit",
                  fontSize: "14px",
                  boxSizing: "border-box",
                  transition: "all 0.3s ease",
                  resize: "none",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#4ade80"
                  e.target.style.boxShadow = "0 0 0 3px rgba(74, 222, 128, 0.1)"
                  e.target.style.background = "#1a1f3a"
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "rgba(74, 222, 128, 0.3)"
                  e.target.style.boxShadow = "none"
                  e.target.style.background = "#0f172a"
                }}
              />
            </div>

            {/* Special Instructions Field */}
            <div
              style={{
                background: "#1e293b",
                padding: "20px",
                borderRadius: "12px",
                border: "1px solid rgba(255, 255, 255, 0.1)",
              }}
            >
              <label
                style={{
                  display: "block",
                  color: "#f1f5f9",
                  fontWeight: "500",
                  marginBottom: "8px",
                  fontSize: "14px",
                }}
              >
                Special Instructions <span style={{ color: "#94a3b8", fontWeight: "400" }}>(optional)</span>
              </label>
              <textarea
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                rows="4"
                style={{
                  width: "100%",
                  padding: "12px",
                  marginTop: "8px",
                  background: "#0f172a",
                  border: "1px solid rgba(74, 222, 128, 0.3)",
                  borderRadius: "8px",
                  color: "#f1f5f9",
                  fontFamily: "inherit",
                  fontSize: "14px",
                  boxSizing: "border-box",
                  transition: "all 0.3s ease",
                  resize: "none",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#4ade80"
                  e.target.style.boxShadow = "0 0 0 3px rgba(74, 222, 128, 0.1)"
                  e.target.style.background = "#1a1f3a"
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "rgba(74, 222, 128, 0.3)"
                  e.target.style.boxShadow = "none"
                  e.target.style.background = "#0f172a"
                }}
              />
            </div>

            {/* Error Message */}
            {error && (
              <div
                style={{
                  background: "rgba(239, 68, 68, 0.1)",
                  border: "1px solid rgba(239, 68, 68, 0.3)",
                  borderRadius: "8px",
                  padding: "12px 16px",
                  color: "#fca5a5",
                  fontSize: "14px",
                }}
              >
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "14px 20px",
                marginTop: "20px",
                background: loading ? "#64748b" : "#4ade80",
                color: "#0f172a",
                border: "none",
                borderRadius: "8px",
                cursor: loading ? "not-allowed" : "pointer",
                fontSize: "16px",
                fontWeight: "600",
                transition: "all 0.3s ease",
                opacity: loading ? "0.7" : "1",
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.target.style.background = "#22c55e"
                  e.target.style.transform = "translateY(-2px)"
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.target.style.background = "#4ade80"
                  e.target.style.transform = "translateY(0)"
                }
              }}
            >
              {loading ? "Placing Order..." : "Place Order"}
            </button>
          </form>

          <div>
            <div
              style={{
                background: "#1e293b",
                padding: "24px",
                borderRadius: "12px",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                position: "sticky",
                top: "20px",
              }}
            >
              <h3
                style={{
                  fontSize: "18px",
                  color: "#f1f5f9",
                  fontWeight: "600",
                  marginBottom: "20px",
                }}
              >
                Order Summary
              </h3>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                  paddingBottom: "20px",
                  borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                  marginBottom: "20px",
                }}
              >
                {items.map((item) => (
                  <div
                    key={item.item_id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: "12px",
                    }}
                  >
                    <div
                      style={{
                        flex: 1,
                        minWidth: 0,
                      }}
                    >
                      <p
                        style={{
                          color: "#e2e8f0",
                          fontSize: "14px",
                          margin: "0 0 4px 0",
                          fontWeight: "500",
                        }}
                      >
                        {item.name}
                      </p>
                      <p
                        style={{
                          color: "#94a3b8",
                          fontSize: "12px",
                          margin: "0",
                        }}
                      >
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <span
                      style={{
                        color: "#4ade80",
                        fontWeight: "600",
                        whiteSpace: "nowrap",
                      }}
                    >
                      ${(Number.parseFloat(item.price) * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    color: "#cbd5e1",
                    fontSize: "16px",
                    fontWeight: "500",
                  }}
                >
                  Total:
                </span>
                <span
                  style={{
                    color: "#4ade80",
                    fontSize: "24px",
                    fontWeight: "700",
                  }}
                >
                  ${totalPrice.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CheckoutPage
