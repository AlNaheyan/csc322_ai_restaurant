"use client"

import { useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { loginStart, loginSuccess, loginFailure } from "../store/authSlice"
import { authService } from "../services/authService"

function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { loading, error } = useSelector((state) => state.auth)

  const handleSubmit = async (e) => {
    e.preventDefault()
    dispatch(loginStart())

    try {
      const data = await authService.login({ email, password })
      dispatch(loginSuccess(data))
      navigate("/")
    } catch (err) {
      dispatch(loginFailure(err.response?.data?.error || "Login failed"))
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0f172a 0%, #1a1f3a 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "400px",
          background: "#1e293b",
          borderRadius: "12px",
          padding: "40px",
          border: "1px solid #334155",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
        }}
      >
        <h2
          style={{
            fontSize: "28px",
            fontWeight: "600",
            color: "#ffffff",
            marginBottom: "8px",
            textAlign: "center",
          }}
        >
          Welcome Back
        </h2>
        <p
          style={{
            color: "#94a3b8",
            textAlign: "center",
            marginBottom: "32px",
            fontSize: "14px",
          }}
        >
          Sign in to your account
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                color: "#e2e8f0",
                fontSize: "14px",
                fontWeight: "500",
                marginBottom: "8px",
              }}
            >
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "12px 14px",
                border: "1px solid #334155",
                borderRadius: "8px",
                background: "#0f172a",
                color: "#e2e8f0",
                fontSize: "14px",
                boxSizing: "border-box",
                transition: "all 0.2s ease",
                outline: "none",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#4ade80"
                e.target.style.boxShadow = "0 0 0 3px rgba(74, 222, 128, 0.1)"
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#334155"
                e.target.style.boxShadow = "none"
              }}
            />
          </div>

          <div style={{ marginBottom: "24px" }}>
            <label
              style={{
                display: "block",
                color: "#e2e8f0",
                fontSize: "14px",
                fontWeight: "500",
                marginBottom: "8px",
              }}
            >
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "12px 14px",
                border: "1px solid #334155",
                borderRadius: "8px",
                background: "#0f172a",
                color: "#e2e8f0",
                fontSize: "14px",
                boxSizing: "border-box",
                transition: "all 0.2s ease",
                outline: "none",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#4ade80"
                e.target.style.boxShadow = "0 0 0 3px rgba(74, 222, 128, 0.1)"
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#334155"
                e.target.style.boxShadow = "none"
              }}
            />
          </div>

          {error && (
            <div
              style={{
                background: "rgba(239, 68, 68, 0.1)",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                color: "#fca5a5",
                padding: "12px",
                borderRadius: "8px",
                marginBottom: "20px",
                fontSize: "14px",
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "12px",
              background: loading ? "#64748b" : "#4ade80",
              color: loading ? "#94a3b8" : "#0f172a",
              border: "none",
              borderRadius: "8px",
              fontSize: "15px",
              fontWeight: "600",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "all 0.2s ease",
              boxShadow: "0 4px 12px rgba(74, 222, 128, 0.2)",
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.target.style.background = "#22c55e"
                e.target.style.transform = "translateY(-2px)"
                e.target.style.boxShadow = "0 6px 16px rgba(74, 222, 128, 0.3)"
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.target.style.background = "#4ade80"
                e.target.style.transform = "translateY(0)"
                e.target.style.boxShadow = "0 4px 12px rgba(74, 222, 128, 0.2)"
              }
            }}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p
          style={{
            marginTop: "24px",
            textAlign: "center",
            color: "#94a3b8",
            fontSize: "14px",
          }}
        >
          Don't have an account?{" "}
          <a
            href="/register"
            style={{
              color: "#4ade80",
              textDecoration: "none",
              fontWeight: "600",
              transition: "color 0.2s ease",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => (e.target.style.color = "#22c55e")}
            onMouseLeave={(e) => (e.target.style.color = "#4ade80")}
          >
            Create account
          </a>
        </p>
      </div>
    </div>
  )
}

export default LoginPage
