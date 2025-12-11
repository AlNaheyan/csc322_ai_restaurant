"use client"

import { useState, useEffect } from "react"
import { useSelector } from "react-redux"
import api from "../services/api"

function HomePage() {
  const { isAuthenticated, user } = useSelector((state) => state.auth)
  const [topChefs, setTopChefs] = useState([])

  useEffect(() => {
    const loadTopChefs = async () => {
      try {
        const response = await api.get("/employees/top-chefs?limit=3")
        setTopChefs(response.data)
      } catch (err) {
        console.error("Failed to load top chefs:", err)
      }
    }

    loadTopChefs()
  }, [])

  if (!isAuthenticated) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#0f172a",
          padding: "60px 20px",
        }}
      >
        <div
          style={{
            textAlign: "center",
            marginBottom: "80px",
            maxWidth: "800px",
            margin: "0 auto 80px",
          }}
        >
          <h1
            style={{
              fontSize: "3.5rem",
              fontWeight: "700",
              color: "#ffffff",
              marginBottom: "20px",
              letterSpacing: "-1px",
            }}
          >
            Welcome to Restaurant Order System
          </h1>
          <p
            style={{
              fontSize: "1.3rem",
              marginTop: "20px",
              color: "#cbd5e1",
              lineHeight: "1.6",
              fontWeight: "300",
            }}
          >
            Experience fine dining delivered to your door
          </p>
          <div style={{ marginTop: "40px" }}>
            <a
              href="/menu"
              style={{
                background: "#4ade80",
                color: "#0f172a",
                padding: "16px 48px",
                textDecoration: "none",
                borderRadius: "12px",
                display: "inline-block",
                fontSize: "1.1rem",
                fontWeight: "600",
                boxShadow: "0 10px 30px rgba(74, 222, 128, 0.3)",
                transition: "all 0.3s ease",
                border: "none",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-3px)"
                e.currentTarget.style.boxShadow = "0 15px 40px rgba(74, 222, 128, 0.4)"
                e.currentTarget.style.background = "#22c55e"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)"
                e.currentTarget.style.boxShadow = "0 10px 30px rgba(74, 222, 128, 0.3)"
                e.currentTarget.style.background = "#4ade80"
              }}
            >
              Browse Menu
            </a>
          </div>
        </div>

        {topChefs.length > 0 && (
          <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
            <h2
              style={{
                textAlign: "center",
                color: "#ffffff",
                marginBottom: "50px",
                fontSize: "2.5rem",
                fontWeight: "700",
              }}
            >
              Our Top Chefs
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: "40px",
                padding: "0 20px",
              }}
            >
              {topChefs.map((chef) => (
                <div
                  key={chef.employee_id}
                  style={{
                    background: "#1e293b",
                    border: "1px solid #334155",
                    borderRadius: "16px",
                    padding: "35px 25px",
                    textAlign: "center",
                    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.3)",
                    transition: "all 0.3s ease",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-8px)"
                    e.currentTarget.style.boxShadow = "0 20px 40px rgba(74, 222, 128, 0.2)"
                    e.currentTarget.style.borderColor = "#4ade80"
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)"
                    e.currentTarget.style.boxShadow = "0 10px 30px rgba(0, 0, 0, 0.3)"
                    e.currentTarget.style.borderColor = "#334155"
                  }}
                >
                  {chef.profile_picture_url ? (
                    <img
                      src={chef.profile_picture_url || "/placeholder.svg"}
                      alt={`${chef.User?.first_name} ${chef.User?.last_name}`}
                      style={{
                        width: "150px",
                        height: "150px",
                        borderRadius: "50%",
                        objectFit: "cover",
                        margin: "0 auto 20px",
                        border: "5px solid #4ade80",
                        boxShadow: "0 8px 20px rgba(74, 222, 128, 0.25)",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: "150px",
                        height: "150px",
                        borderRadius: "50%",
                        background: "#1e293b",
                        margin: "0 auto 20px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "64px",
                        border: "5px solid #4ade80",
                        boxShadow: "0 8px 20px rgba(74, 222, 128, 0.25)",
                      }}
                    >
                      👨‍🍳
                    </div>
                  )}
                  <h3
                    style={{
                      color: "#f1f5f9",
                      marginBottom: "12px",
                      fontSize: "1.5rem",
                      fontWeight: "700",
                    }}
                  >
                    {chef.User?.first_name} {chef.User?.last_name}
                  </h3>
                  <div
                    style={{
                      color: "#4ade80",
                      fontSize: "24px",
                      marginBottom: "12px",
                      letterSpacing: "2px",
                    }}
                  >
                    {"★".repeat(Math.round(chef.average_rating))}
                    {"☆".repeat(5 - Math.round(chef.average_rating))}
                  </div>
                  <p
                    style={{
                      color: "#94a3b8",
                      fontSize: "15px",
                      fontWeight: "600",
                      marginBottom: "15px",
                    }}
                  >
                    {Number.parseFloat(chef.average_rating).toFixed(1)} rating • {chef.total_ratings} reviews
                  </p>
                  {chef.bio && (
                    <p
                      style={{
                        color: "#cbd5e1",
                        fontSize: "14px",
                        marginTop: "15px",
                        fontStyle: "italic",
                        lineHeight: "1.6",
                        padding: "15px",
                        background: "rgba(74, 222, 128, 0.08)",
                        borderRadius: "10px",
                      }}
                    >
                      "{chef.bio}"
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0f172a",
        padding: "60px 20px",
      }}
    >
      <div
        style={{
          maxWidth: "800px",
          margin: "0 auto",
          background: "#1e293b",
          border: "1px solid #334155",
          borderRadius: "16px",
          padding: "40px",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5)",
        }}
      >
        <h1
          style={{
            color: "#f1f5f9",
            fontSize: "2.5rem",
            fontWeight: "700",
            marginBottom: "10px",
          }}
        >
          Welcome back, {user?.first_name}!
        </h1>
        <div
          style={{
            height: "4px",
            width: "80px",
            background: "#4ade80",
            borderRadius: "2px",
            marginBottom: "30px",
          }}
        />

        <div
          style={{
            display: "grid",
            gap: "20px",
          }}
        >
          <div
            style={{
              padding: "20px",
              background: "#0f172a",
              borderRadius: "12px",
              borderLeft: "4px solid #4ade80",
            }}
          >
            <p
              style={{
                color: "#94a3b8",
                fontSize: "14px",
                fontWeight: "600",
                marginBottom: "5px",
                textTransform: "uppercase",
                letterSpacing: "1px",
              }}
            >
              Email
            </p>
            <p style={{ color: "#f1f5f9", fontSize: "18px", fontWeight: "500" }}>{user?.email}</p>
          </div>

          <div
            style={{
              padding: "20px",
              background: "#0f172a",
              borderRadius: "12px",
              borderLeft: "4px solid #4ade80",
            }}
          >
            <p
              style={{
                color: "#94a3b8",
                fontSize: "14px",
                fontWeight: "600",
                marginBottom: "5px",
                textTransform: "uppercase",
                letterSpacing: "1px",
              }}
            >
              Role
            </p>
            <p
              style={{
                color: "#f1f5f9",
                fontSize: "18px",
                fontWeight: "500",
                textTransform: "capitalize",
              }}
            >
              {user?.role}
            </p>
          </div>

          {user?.Customer && (
            <>
              <div
                style={{
                  padding: "25px",
                  background: "#0f172a",
                  borderRadius: "15px",
                  border: "2px solid #4ade80",
                  boxShadow: "0 10px 30px rgba(74, 222, 128, 0.15)",
                }}
              >
                <p
                  style={{
                    color: "#cbd5e1",
                    fontSize: "14px",
                    fontWeight: "600",
                    marginBottom: "8px",
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                  }}
                >
                  Account Balance
                </p>
                <p
                  style={{
                    color: "#4ade80",
                    fontSize: "2.5rem",
                    fontWeight: "700",
                  }}
                >
                  ${Number.parseFloat(user.Customer.deposit_balance).toFixed(2)}
                </p>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "20px",
                }}
              >
                <div
                  style={{
                    padding: "20px",
                    background: user.Customer.is_vip ? "#0f172a" : "#0f172a",
                    borderRadius: "12px",
                    textAlign: "center",
                    border: user.Customer.is_vip ? "2px solid #4ade80" : "1px solid #334155",
                    boxShadow: user.Customer.is_vip ? "0 8px 20px rgba(74, 222, 128, 0.2)" : "none",
                  }}
                >
                  <p
                    style={{
                      color: user.Customer.is_vip ? "#4ade80" : "#94a3b8",
                      fontSize: "12px",
                      fontWeight: "600",
                      marginBottom: "8px",
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                    }}
                  >
                    VIP Status
                  </p>
                  <p
                    style={{
                      color: user.Customer.is_vip ? "#4ade80" : "#f1f5f9",
                      fontSize: "1.3rem",
                      fontWeight: "700",
                    }}
                  >
                    {user.Customer.is_vip ? "⭐ VIP Member" : "Standard"}
                  </p>
                </div>

                <div
                  style={{
                    padding: "20px",
                    background: "#0f172a",
                    borderRadius: "12px",
                    textAlign: "center",
                    borderLeft: "4px solid #4ade80",
                  }}
                >
                  <p
                    style={{
                      color: "#94a3b8",
                      fontSize: "12px",
                      fontWeight: "600",
                      marginBottom: "8px",
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                    }}
                  >
                    Status
                  </p>
                  <p
                    style={{
                      color: "#f1f5f9",
                      fontSize: "1.3rem",
                      fontWeight: "700",
                      textTransform: "capitalize",
                    }}
                  >
                    {user.Customer.registration_status}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default HomePage
