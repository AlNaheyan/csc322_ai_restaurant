"use client"

import { useState, useEffect } from "react"
import { useSelector } from "react-redux"
import api from "../services/api"
import socketService from "../services/socketService"
import RatingDisplay from "../components/RatingDisplay"

function DeliveryDashboardPage() {
  const { user } = useSelector((state) => state.auth)
  const [availableOrders, setAvailableOrders] = useState([])
  const [myDeliveries, setMyDeliveries] = useState([])
  const [myBids, setMyBids] = useState([])
  const [readyOrders, setReadyOrders] = useState([])
  const [stats, setStats] = useState(null)
  const [ratings, setRatings] = useState([])
  const [complaints, setComplaints] = useState([])
  const [receivedComplaints, setReceivedComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("available")
  const [complaintsTab, setComplaintsTab] = useState("received")
  const [bidForm, setBidForm] = useState({})
  const [showBidForm, setShowBidForm] = useState(null)

  useEffect(() => {
    loadData()
    loadReadyOrders()
    loadMyBids()
    if (activeTab === "ratings") {
      loadRatings()
    }
    if (activeTab === "complaints") {
      loadComplaints()
    }

    socketService.on("new_order_ready", handleNewOrderReady)
    socketService.on("bid_accepted", handleBidAccepted)
    socketService.on("bid_rejected", handleBidRejected)

    return () => {
      socketService.off("new_order_ready", handleNewOrderReady)
      socketService.off("bid_accepted", handleBidAccepted)
      socketService.off("bid_rejected", handleBidRejected)
    }
  }, [activeTab])

  const handleNewOrderReady = (data) => {
    loadReadyOrders()
    alert("New order ready for bidding!")
  }

  const handleBidAccepted = (data) => {
    alert("Your bid was accepted! Check My Deliveries.")
    loadData()
    loadMyBids()
  }

  const handleBidRejected = (data) => {
    alert("Your bid was not accepted.")
    loadMyBids()
  }

  const loadData = async () => {
    try {
      const [ordersRes, deliveriesRes, statsRes] = await Promise.all([
        api.get("/delivery/available-orders"),
        api.get("/delivery/my-deliveries"),
        api.get("/delivery/stats"),
      ])
      setAvailableOrders(ordersRes.data)
      setMyDeliveries(deliveriesRes.data)
      setStats(statsRes.data)
      setLoading(false)
    } catch (err) {
      console.error("Failed to load delivery data:", err)
      setLoading(false)
    }
  }

  const loadReadyOrders = async () => {
    try {
      const response = await api.get("/bidding/orders/ready")
      setReadyOrders(response.data)
    } catch (err) {
      console.error("Failed to load ready orders:", err)
    }
  }

  const loadMyBids = async () => {
    try {
      const response = await api.get("/bidding/bids/my-bids")
      setMyBids(response.data)
    } catch (err) {
      console.error("Failed to load bids:", err)
    }
  }

  const loadRatings = async () => {
    try {
      const response = await fetch("http://localhost:3001/api/delivery/profile", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      const profileData = await response.json()

      if (response.ok && profileData.employee_id) {
        const ratingsResponse = await fetch(
          `http://localhost:3001/api/ratings/employees/${profileData.employee_id}/ratings`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          },
        )
        const ratingsData = await ratingsResponse.json()
        if (ratingsResponse.ok) {
          setRatings(ratingsData.data)
        }
      }
    } catch (err) {
      console.error("Failed to load ratings:", err)
    }
  }

  const loadComplaints = async () => {
    try {
      const [filedRes, receivedRes] = await Promise.all([
        fetch("http://localhost:3001/api/complaints/my?role=filer", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }),
        fetch("http://localhost:3001/api/complaints/my?role=subject", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }),
      ])

      const [filedData, receivedData] = await Promise.all([filedRes.json(), receivedRes.json()])

      if (filedRes.ok) setComplaints(filedData.data || [])
      if (receivedRes.ok) setReceivedComplaints(receivedData.data || [])
    } catch (err) {
      console.error("Failed to load complaints:", err)
    }
  }

  const handleAcceptDelivery = async (orderId) => {
    try {
      await api.post(`/delivery/accept/${orderId}`)
      alert("Delivery accepted!")
      loadData()
    } catch (err) {
      alert(err.response?.data?.error || "Failed to accept delivery")
    }
  }

  const handleUpdateStatus = async (orderId, status) => {
    try {
      await api.patch(`/delivery/order/${orderId}/status`, { status })
      alert("Status updated!")
      loadData()
    } catch (err) {
      alert(err.response?.data?.error || "Failed to update status")
    }
  }

  const handleSubmitBid = async (orderId) => {
    const bid = bidForm[orderId]
    if (!bid?.bid_amount || !bid?.estimated_time) {
      alert("Please fill in all bid fields")
      return
    }

    try {
      await api.post(`/bidding/orders/${orderId}/bid`, bid)
      alert("Bid submitted successfully!")
      setBidForm({ ...bidForm, [orderId]: {} })
      setShowBidForm(null)
      loadMyBids()
    } catch (err) {
      alert(err.response?.data?.error || "Failed to submit bid")
    }
  }

  const handleWithdrawBid = async (bidId) => {
    if (!confirm("Are you sure you want to withdraw this bid?")) return

    try {
      await api.delete(`/bidding/bids/${bidId}`)
      alert("Bid withdrawn successfully")
      loadMyBids()
    } catch (err) {
      alert(err.response?.data?.error || "Failed to withdraw bid")
    }
  }

  if (loading)
    return (
      <div
        style={{
          padding: "20px",
          color: "#fff",
          background: "linear-gradient(135deg, #0f172a 0%, #1a1f3a 100%)",
          minHeight: "100vh",
        }}
      >
        Loading...
      </div>
    )

  return (
    <div
      style={{
        background: "linear-gradient(135deg, #0f172a 0%, #1a1f3a 100%)",
        minHeight: "100vh",
        padding: "clamp(15px, 3vw, 40px) clamp(15px, 3vw, 30px)",
        boxSizing: "border-box",
      }}
    >
      <div style={{ maxWidth: "1400px", width: "100%", margin: "0 auto", boxSizing: "border-box" }}>
        <h1 style={{ color: "#fff", fontSize: "clamp(24px, 4vw, 32px)", marginBottom: "5px" }}>Delivery Dashboard</h1>
        <p style={{ color: "#9ca3af", fontSize: "clamp(14px, 2vw, 16px)", marginBottom: "clamp(20px, 3vw, 30px)" }}>
          Welcome, {user?.first_name}!
        </p>

        {stats && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "clamp(12px, 2vw, 20px)",
              marginBottom: "clamp(20px, 3vw, 30px)",
            }}
          >
            <div
              style={{
                background: "#1e293b",
                padding: "20px",
                borderRadius: "8px",
                border: "1px solid #334155",
              }}
            >
              <h3 style={{ margin: "0 0 10px 0", color: "#cbd5e1", fontSize: "14px" }}>Total Deliveries</h3>
              <p style={{ fontSize: "32px", fontWeight: "bold", margin: 0, color: "#4ade80" }}>
                {stats.total_deliveries}
              </p>
            </div>
            <div
              style={{
                background: "#1e293b",
                padding: "20px",
                borderRadius: "8px",
                border: "1px solid #334155",
              }}
            >
              <h3 style={{ margin: "0 0 10px 0", color: "#cbd5e1", fontSize: "14px" }}>Active Deliveries</h3>
              <p style={{ fontSize: "32px", fontWeight: "bold", margin: 0, color: "#60a5fa" }}>
                {stats.active_deliveries}
              </p>
            </div>
            <div
              style={{
                background: "#1e293b",
                padding: "20px",
                borderRadius: "8px",
                border: "1px solid #334155",
              }}
            >
              <h3 style={{ margin: "0 0 10px 0", color: "#cbd5e1", fontSize: "14px" }}>Average Rating</h3>
              <p style={{ fontSize: "32px", fontWeight: "bold", margin: 0, color: "#fbbf24" }}>
                {Number.parseFloat(stats.average_rating || 0).toFixed(1)} ⭐
              </p>
            </div>
          </div>
        )}

        <div style={{ marginBottom: "20px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button
            onClick={() => setActiveTab("available")}
            style={{
              padding: "10px 20px",
              background: activeTab === "available" ? "#4ade80" : "#334155",
              color: activeTab === "available" ? "#0f172a" : "#cbd5e1",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "500",
              transition: "all 0.2s",
            }}
          >
            Available Orders ({availableOrders.length})
          </button>
          <button
            onClick={() => {
              setActiveTab("bidding")
              loadReadyOrders()
            }}
            style={{
              padding: "10px 20px",
              background: activeTab === "bidding" ? "#4ade80" : "#334155",
              color: activeTab === "bidding" ? "#0f172a" : "#cbd5e1",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "500",
              transition: "all 0.2s",
            }}
          >
            Bid on Orders
          </button>
          <button
            onClick={() => {
              setActiveTab("myBids")
              loadMyBids()
            }}
            style={{
              padding: "10px 20px",
              background: activeTab === "myBids" ? "#4ade80" : "#334155",
              color: activeTab === "myBids" ? "#0f172a" : "#cbd5e1",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "500",
              transition: "all 0.2s",
            }}
          >
            My Bids ({myBids.length})
          </button>
          <button
            onClick={() => setActiveTab("myDeliveries")}
            style={{
              padding: "10px 20px",
              background: activeTab === "myDeliveries" ? "#4ade80" : "#334155",
              color: activeTab === "myDeliveries" ? "#0f172a" : "#cbd5e1",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "500",
              transition: "all 0.2s",
            }}
          >
            My Deliveries ({myDeliveries.length})
          </button>
          <button
            onClick={() => setActiveTab("ratings")}
            style={{
              padding: "10px 20px",
              background: activeTab === "ratings" ? "#4ade80" : "#334155",
              color: activeTab === "ratings" ? "#0f172a" : "#cbd5e1",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "500",
              transition: "all 0.2s",
            }}
          >
            My Ratings
          </button>
          <button
            onClick={() => setActiveTab("complaints")}
            style={{
              padding: "10px 20px",
              background: activeTab === "complaints" ? "#4ade80" : "#334155",
              color: activeTab === "complaints" ? "#0f172a" : "#cbd5e1",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "500",
              transition: "all 0.2s",
            }}
          >
            Complaints
          </button>
        </div>

        {activeTab === "available" && (
          <div>
            <h2 style={{ color: "#fff", marginBottom: "20px" }}>Available Orders</h2>
            {availableOrders.length === 0 ? (
              <p style={{ color: "#9ca3af" }}>No available orders at the moment</p>
            ) : (
              <div style={{ display: "grid", gap: "15px" }}>
                {availableOrders.map((order) => (
                  <div
                    key={order.order_id}
                    style={{
                      background: "#1e293b",
                      padding: "20px",
                      borderRadius: "8px",
                      border: "1px solid #334155",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                      <div>
                        <h3 style={{ margin: "0 0 10px 0", color: "#4ade80" }}>Order #{order.order_id}</h3>
                        <p style={{ color: "#cbd5e1", margin: "5px 0" }}>
                          <strong>Customer:</strong> {order.Customer?.User?.first_name}{" "}
                          {order.Customer?.User?.last_name}
                        </p>
                        <p style={{ color: "#cbd5e1", margin: "5px 0" }}>
                          <strong>Address:</strong> {order.delivery_address}
                        </p>
                        <p style={{ color: "#cbd5e1", margin: "5px 0" }}>
                          <strong>Total:</strong> ${Number.parseFloat(order.total).toFixed(2)}
                        </p>
                        <p style={{ color: "#cbd5e1", margin: "5px 0" }}>
                          <strong>Status:</strong> <span style={{ color: "#fbbf24" }}>{order.status}</span>
                        </p>
                      </div>
                      <button
                        onClick={() => handleAcceptDelivery(order.order_id)}
                        style={{
                          background: "#4ade80",
                          color: "#0f172a",
                          border: "none",
                          padding: "10px 20px",
                          borderRadius: "6px",
                          cursor: "pointer",
                          fontWeight: "500",
                          transition: "opacity 0.2s",
                        }}
                      >
                        Accept Delivery
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "myDeliveries" && (
          <div>
            <h2 style={{ color: "#fff", marginBottom: "20px" }}>My Deliveries</h2>
            {myDeliveries.length === 0 ? (
              <p style={{ color: "#9ca3af" }}>You have no active deliveries</p>
            ) : (
              <div style={{ display: "grid", gap: "15px" }}>
                {myDeliveries.map((order) => (
                  <div
                    key={order.order_id}
                    style={{
                      background: "#1e293b",
                      padding: "20px",
                      borderRadius: "8px",
                      border: "1px solid #334155",
                    }}
                  >
                    <h3 style={{ margin: "0 0 10px 0", color: "#4ade80" }}>Order #{order.order_id}</h3>
                    <p style={{ color: "#cbd5e1", margin: "5px 0" }}>
                      <strong>Customer:</strong> {order.Customer?.User?.first_name} {order.Customer?.User?.last_name}
                    </p>
                    <p style={{ color: "#cbd5e1", margin: "5px 0" }}>
                      <strong>Address:</strong> {order.delivery_address}
                    </p>
                    <p style={{ color: "#cbd5e1", margin: "5px 0" }}>
                      <strong>Total:</strong> ${Number.parseFloat(order.total).toFixed(2)}
                    </p>
                    <p style={{ color: "#cbd5e1", margin: "5px 0" }}>
                      <strong>Status:</strong>{" "}
                      <span
                        style={{
                          padding: "2px 8px",
                          borderRadius: "4px",
                          background: order.status === "delivered" ? "#4ade80" : "#60a5fa",
                          color: "#0f172a",
                          fontSize: "12px",
                          fontWeight: "500",
                        }}
                      >
                        {order.status}
                      </span>
                    </p>
                    {order.special_instructions && (
                      <p style={{ color: "#cbd5e1", margin: "5px 0" }}>
                        <strong>Instructions:</strong> {order.special_instructions}
                      </p>
                    )}
                    <div style={{ marginTop: "15px", display: "flex", gap: "10px" }}>
                      {order.status === "ready" && (
                        <button
                          onClick={() => handleUpdateStatus(order.order_id, "out_for_delivery")}
                          style={{
                            background: "#60a5fa",
                            color: "#0f172a",
                            border: "none",
                            padding: "8px 16px",
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontWeight: "500",
                          }}
                        >
                          Mark Out for Delivery
                        </button>
                      )}
                      {order.status === "out_for_delivery" && (
                        <button
                          onClick={() => handleUpdateStatus(order.order_id, "delivered")}
                          style={{
                            background: "#4ade80",
                            color: "#0f172a",
                            border: "none",
                            padding: "8px 16px",
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontWeight: "500",
                          }}
                        >
                          Mark Delivered
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "bidding" && (
          <div>
            <h2 style={{ color: "#fff", marginBottom: "20px" }}>Orders Ready for Bidding</h2>
            {readyOrders.length === 0 ? (
              <p style={{ color: "#9ca3af" }}>No orders ready for bidding at the moment</p>
            ) : (
              <div style={{ display: "grid", gap: "15px" }}>
                {readyOrders.map((order) => (
                  <div
                    key={order.order_id}
                    style={{
                      background: "#1e293b",
                      padding: "20px",
                      borderRadius: "8px",
                      border: "1px solid #334155",
                    }}
                  >
                    <div>
                      <h3 style={{ margin: "0 0 10px 0", color: "#4ade80" }}>Order #{order.order_id}</h3>
                      <p style={{ color: "#cbd5e1", margin: "5px 0" }}>
                        <strong>Address:</strong> {order.delivery_address}
                      </p>
                      <p style={{ color: "#cbd5e1", margin: "5px 0" }}>
                        <strong>Total:</strong> ${Number.parseFloat(order.total).toFixed(2)}
                      </p>
                      {order.special_instructions && (
                        <p style={{ color: "#cbd5e1", margin: "5px 0" }}>
                          <strong>Instructions:</strong> {order.special_instructions}
                        </p>
                      )}

                      {showBidForm === order.order_id ? (
                        <div
                          style={{
                            marginTop: "15px",
                            padding: "15px",
                            background: "#0f172a",
                            borderRadius: "6px",
                            border: "1px solid #334155",
                          }}
                        >
                          <h4 style={{ margin: "0 0 10px 0", color: "#4ade80" }}>Submit Your Bid</h4>
                          <div style={{ display: "grid", gap: "10px" }}>
                            <div>
                              <label
                                style={{ display: "block", marginBottom: "5px", color: "#cbd5e1", fontSize: "14px" }}
                              >
                                Bid Amount ($):
                              </label>
                              <input
                                type="number"
                                step="0.01"
                                min="1"
                                placeholder="5.00"
                                value={bidForm[order.order_id]?.bid_amount || ""}
                                onChange={(e) =>
                                  setBidForm({
                                    ...bidForm,
                                    [order.order_id]: { ...bidForm[order.order_id], bid_amount: e.target.value },
                                  })
                                }
                                style={{
                                  width: "100%",
                                  padding: "8px",
                                  border: "1px solid #334155",
                                  borderRadius: "4px",
                                  background: "#1e293b",
                                  color: "#cbd5e1",
                                }}
                              />
                            </div>
                            <div>
                              <label
                                style={{ display: "block", marginBottom: "5px", color: "#cbd5e1", fontSize: "14px" }}
                              >
                                Estimated Time (minutes):
                              </label>
                              <input
                                type="number"
                                min="5"
                                placeholder="30"
                                value={bidForm[order.order_id]?.estimated_time || ""}
                                onChange={(e) =>
                                  setBidForm({
                                    ...bidForm,
                                    [order.order_id]: { ...bidForm[order.order_id], estimated_time: e.target.value },
                                  })
                                }
                                style={{
                                  width: "100%",
                                  padding: "8px",
                                  border: "1px solid #334155",
                                  borderRadius: "4px",
                                  background: "#1e293b",
                                  color: "#cbd5e1",
                                }}
                              />
                            </div>
                            <div>
                              <label
                                style={{ display: "block", marginBottom: "5px", color: "#cbd5e1", fontSize: "14px" }}
                              >
                                Notes (optional):
                              </label>
                              <textarea
                                placeholder="Any special notes..."
                                value={bidForm[order.order_id]?.notes || ""}
                                onChange={(e) =>
                                  setBidForm({
                                    ...bidForm,
                                    [order.order_id]: { ...bidForm[order.order_id], notes: e.target.value },
                                  })
                                }
                                style={{
                                  width: "100%",
                                  padding: "8px",
                                  border: "1px solid #334155",
                                  borderRadius: "4px",
                                  background: "#1e293b",
                                  color: "#cbd5e1",
                                  minHeight: "60px",
                                }}
                              />
                            </div>
                            <div style={{ display: "flex", gap: "10px" }}>
                              <button
                                onClick={() => handleSubmitBid(order.order_id)}
                                style={{
                                  background: "#4ade80",
                                  color: "#0f172a",
                                  border: "none",
                                  padding: "8px 16px",
                                  borderRadius: "6px",
                                  cursor: "pointer",
                                  fontWeight: "500",
                                }}
                              >
                                Submit Bid
                              </button>
                              <button
                                onClick={() => setShowBidForm(null)}
                                style={{
                                  background: "#334155",
                                  color: "#cbd5e1",
                                  border: "none",
                                  padding: "8px 16px",
                                  borderRadius: "6px",
                                  cursor: "pointer",
                                }}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setShowBidForm(order.order_id)}
                          style={{
                            marginTop: "15px",
                            background: "#4ade80",
                            color: "#0f172a",
                            border: "none",
                            padding: "10px 20px",
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontWeight: "500",
                          }}
                        >
                          Place Bid
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "myBids" && (
          <div>
            <h2 style={{ color: "#fff", marginBottom: "20px" }}>My Bids</h2>
            {myBids.length === 0 ? (
              <p style={{ color: "#9ca3af" }}>You haven't placed any bids yet</p>
            ) : (
              <div style={{ display: "grid", gap: "15px" }}>
                {myBids.map((bid) => (
                  <div
                    key={bid.bid_id}
                    style={{
                      background: "#1e293b",
                      padding: "20px",
                      borderRadius: "8px",
                      border: "1px solid #334155",
                    }}
                  >
                    <h3 style={{ margin: "0 0 10px 0", color: "#4ade80" }}>Order #{bid.order_id}</h3>
                    <p style={{ color: "#cbd5e1", margin: "5px 0" }}>
                      <strong>Bid Amount:</strong> ${Number.parseFloat(bid.bid_amount).toFixed(2)}
                    </p>
                    <p style={{ color: "#cbd5e1", margin: "5px 0" }}>
                      <strong>Estimated Time:</strong> {bid.estimated_time} minutes
                    </p>
                    <p style={{ color: "#cbd5e1", margin: "5px 0" }}>
                      <strong>Status:</strong>{" "}
                      <span
                        style={{
                          padding: "2px 8px",
                          borderRadius: "4px",
                          background:
                            bid.status === "accepted" ? "#4ade80" : bid.status === "rejected" ? "#ef4444" : "#fbbf24",
                          color: "#0f172a",
                          fontSize: "12px",
                          fontWeight: "500",
                        }}
                      >
                        {bid.status}
                      </span>
                    </p>
                    {bid.status === "pending" && (
                      <button
                        onClick={() => handleWithdrawBid(bid.bid_id)}
                        style={{
                          marginTop: "15px",
                          background: "#ef4444",
                          color: "#fff",
                          border: "none",
                          padding: "8px 16px",
                          borderRadius: "6px",
                          cursor: "pointer",
                          fontWeight: "500",
                        }}
                      >
                        Withdraw Bid
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "ratings" && (
          <div>
            <h2 style={{ color: "#fff", marginBottom: "20px" }}>My Ratings</h2>
            {ratings.length === 0 ? (
              <p style={{ color: "#9ca3af" }}>No ratings yet</p>
            ) : (
              <div style={{ display: "grid", gap: "15px" }}>
                {ratings.map((rating) => (
                  <div
                    key={rating.rating_id}
                    style={{
                      background: "#1e293b",
                      padding: "20px",
                      borderRadius: "8px",
                      border: "1px solid #334155",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                      <div>
                        <RatingDisplay rating={rating.rating_value} />
                        <p style={{ color: "#cbd5e1", margin: "10px 0 0 0" }}>{rating.comment}</p>
                      </div>
                      <p style={{ color: "#9ca3af", margin: 0 }}>From {rating.rater_name}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "complaints" && (
          <div>
            <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
              <button
                onClick={() => setComplaintsTab("filed")}
                style={{
                  padding: "8px 16px",
                  background: complaintsTab === "filed" ? "#4ade80" : "#334155",
                  color: complaintsTab === "filed" ? "#0f172a" : "#cbd5e1",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "500",
                }}
              >
                Filed ({complaints.length})
              </button>
              <button
                onClick={() => setComplaintsTab("received")}
                style={{
                  padding: "8px 16px",
                  background: complaintsTab === "received" ? "#4ade80" : "#334155",
                  color: complaintsTab === "received" ? "#0f172a" : "#cbd5e1",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "500",
                }}
              >
                Received ({receivedComplaints.length})
              </button>
            </div>

            {complaintsTab === "filed" && (
              <div>
                <h2 style={{ color: "#fff", marginBottom: "20px" }}>Complaints I Filed</h2>
                {complaints.length === 0 ? (
                  <p style={{ color: "#9ca3af" }}>You haven't filed any complaints</p>
                ) : (
                  <div style={{ display: "grid", gap: "15px" }}>
                    {complaints.map((complaint) => (
                      <div
                        key={complaint.complaint_id}
                        style={{
                          background: "#1e293b",
                          padding: "20px",
                          borderRadius: "8px",
                          border: "1px solid #334155",
                        }}
                      >
                        <h3 style={{ margin: "0 0 10px 0", color: "#4ade80" }}>{complaint.title}</h3>
                        <p style={{ color: "#cbd5e1", margin: "5px 0" }}>
                          <strong>Description:</strong> {complaint.description}
                        </p>
                        <p style={{ color: "#cbd5e1", margin: "5px 0" }}>
                          <strong>Status:</strong>{" "}
                          <span
                            style={{
                              padding: "2px 8px",
                              borderRadius: "4px",
                              background: complaint.status === "resolved" ? "#4ade80" : "#fbbf24",
                              color: "#0f172a",
                              fontSize: "12px",
                              fontWeight: "500",
                            }}
                          >
                            {complaint.status}
                          </span>
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {complaintsTab === "received" && (
              <div>
                <h2 style={{ color: "#fff", marginBottom: "20px" }}>Complaints About Me</h2>
                {receivedComplaints.length === 0 ? (
                  <p style={{ color: "#9ca3af" }}>No complaints received</p>
                ) : (
                  <div style={{ display: "grid", gap: "15px" }}>
                    {receivedComplaints.map((complaint) => (
                      <div
                        key={complaint.complaint_id}
                        style={{
                          background: "#1e293b",
                          padding: "20px",
                          borderRadius: "8px",
                          border: "1px solid #334155",
                        }}
                      >
                        <h3 style={{ margin: "0 0 10px 0", color: "#ef4444" }}>{complaint.title}</h3>
                        <p style={{ color: "#cbd5e1", margin: "5px 0" }}>
                          <strong>Description:</strong> {complaint.description}
                        </p>
                        <p style={{ color: "#cbd5e1", margin: "5px 0" }}>
                          <strong>Status:</strong>{" "}
                          <span
                            style={{
                              padding: "2px 8px",
                              borderRadius: "4px",
                              background: complaint.status === "resolved" ? "#4ade80" : "#fbbf24",
                              color: "#0f172a",
                              fontSize: "12px",
                              fontWeight: "500",
                            }}
                          >
                            {complaint.status}
                          </span>
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default DeliveryDashboardPage
