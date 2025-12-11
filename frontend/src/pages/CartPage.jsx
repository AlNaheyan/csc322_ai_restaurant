"use client"

import { useSelector, useDispatch } from "react-redux"
import { useNavigate } from "react-router-dom"
import { removeFromCart, updateQuantity, clearCart } from "../store/cartSlice"

function CartPage() {
  const { items, total } = useSelector((state) => state.cart)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleQuantityChange = (itemId, newQuantity) => {
    dispatch(updateQuantity({ item_id: itemId, quantity: Number.parseInt(newQuantity) }))
  }

  const handleRemove = (itemId) => {
    dispatch(removeFromCart(itemId))
  }

  const handleCheckout = () => {
    navigate("/checkout")
  }

  if (items.length === 0) {
    return (
      <div
        style={{
          padding: "clamp(20px, 5vw, 40px)",
          minHeight: "100vh",
          background: "linear-gradient(135deg, #0f172a 0%, #1a1f3a 100%)",
          color: "#e0e7ff",
        }}
      >
        <div style={{ maxWidth: "800px", margin: "0 auto", textAlign: "center", paddingTop: "60px" }}>
          <h2 style={{ fontSize: "clamp(24px, 5vw, 36px)", marginBottom: "20px", color: "#ffffff" }}>Shopping Cart</h2>
          <p style={{ fontSize: "18px", color: "#a0aec0", marginBottom: "30px" }}>Your cart is empty</p>
          <a
            href="/menu"
            style={{
              display: "inline-block",
              background: "#4ade80",
              color: "#0f172a",
              padding: "12px 30px",
              borderRadius: "8px",
              textDecoration: "none",
              fontWeight: "bold",
              fontSize: "16px",
              transition: "all 0.3s ease",
            }}
          >
            Browse Menu
          </a>
        </div>
      </div>
    )
  }

  return (
    <div
      style={{
        padding: "clamp(20px, 5vw, 40px)",
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0f172a 0%, #1a1f3a 100%)",
      }}
    >
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        <h2 style={{ fontSize: "clamp(28px, 5vw, 36px)", marginBottom: "30px", color: "#ffffff" }}>Shopping Cart</h2>

        <div style={{ marginBottom: "30px" }}>
          {items.map((item) => (
            <div
              key={item.item_id}
              style={{
                background: "#1e293b",
                border: "1px solid #334155",
                padding: "20px",
                marginBottom: "15px",
                borderRadius: "12px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                transition: "all 0.3s ease",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
              }}
            >
              <div>
                <h3 style={{ margin: "0 0 8px 0", color: "#ffffff", fontSize: "18px" }}>{item.name}</h3>
                <p style={{ margin: 0, color: "#4ade80", fontSize: "16px", fontWeight: "bold" }}>
                  ${Number.parseFloat(item.price).toFixed(2)} each
                </p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => handleQuantityChange(item.item_id, e.target.value)}
                  style={{
                    width: "70px",
                    padding: "10px",
                    borderRadius: "8px",
                    background: "#0f172a",
                    color: "#ffffff",
                    border: "1px solid #334155",
                    fontSize: "16px",
                  }}
                />
                <span
                  style={{
                    color: "#4ade80",
                    fontWeight: "bold",
                    minWidth: "70px",
                    textAlign: "right",
                    fontSize: "16px",
                  }}
                >
                  ${(Number.parseFloat(item.price) * item.quantity).toFixed(2)}
                </span>
                <button
                  onClick={() => handleRemove(item.item_id)}
                  style={{
                    padding: "8px 16px",
                    background: "#ef4444",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "14px",
                    transition: "all 0.3s ease",
                  }}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            background: "#1e293b",
            border: "1px solid #334155",
            borderRadius: "12px",
            padding: "20px",
            marginBottom: "30px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
          }}
        >
          <h3 style={{ margin: "0 0 15px 0", color: "#ffffff", fontSize: "20px" }}>Order Summary</h3>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              paddingBottom: "15px",
              borderBottom: "1px solid #334155",
              marginBottom: "15px",
            }}
          >
            <span style={{ color: "#cbd5e1" }}>Subtotal</span>
            <span style={{ color: "#4ade80", fontWeight: "bold", fontSize: "18px" }}>${total.toFixed(2)}</span>
          </div>
          <p style={{ fontSize: "14px", color: "#94a3b8", margin: "10px 0 0 0" }}>
            Tax, delivery fee, and VIP discounts will be calculated at checkout
          </p>
        </div>

        <div style={{ display: "flex", gap: "15px", flexWrap: "wrap" }}>
          <button
            onClick={() => dispatch(clearCart())}
            style={{
              flex: 1,
              minWidth: "150px",
              padding: "14px 24px",
              background: "#475569",
              color: "#ffffff",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "16px",
              fontWeight: "bold",
              transition: "all 0.3s ease",
            }}
          >
            Clear Cart
          </button>
          <button
            onClick={handleCheckout}
            style={{
              flex: 1,
              minWidth: "150px",
              padding: "14px 24px",
              background: "#4ade80",
              color: "#0f172a",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "16px",
              fontWeight: "bold",
              transition: "all 0.3s ease",
            }}
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  )
}

export default CartPage
