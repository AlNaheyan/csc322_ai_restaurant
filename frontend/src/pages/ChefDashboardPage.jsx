"use client"

import { useState, useEffect } from "react"
import { chefService } from "../services/chefService"
import socketService from "../services/socketService"

function ChefDashboardPage() {
  const [stats, setStats] = useState(null)
  const [menuItems, setMenuItems] = useState([])
  const [orders, setOrders] = useState([])
  const [ratings, setRatings] = useState([])
  const [complaints, setComplaints] = useState([])
  const [receivedComplaints, setReceivedComplaints] = useState([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    image_url: "",
    is_vip_only: false,
    is_available: true,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState("orders")
  const [complaintsTab, setComplaintsTab] = useState("received")

  useEffect(() => {
    loadDashboardData()
    if (activeTab === "ratings") {
      loadRatings()
    }
    if (activeTab === "complaints") {
      loadComplaints()
    }

    socketService.on("new_order", loadDashboardData)
    socketService.on("order_status_update", loadDashboardData)

    return () => {
      socketService.off("new_order", loadDashboardData)
      socketService.off("order_status_update", loadDashboardData)
    }
  }, [activeTab])

  const loadDashboardData = async () => {
    try {
      const [statsData, itemsData, ordersData] = await Promise.all([
        chefService.getDashboard(),
        chefService.getMyMenuItems(),
        chefService.getMyOrders(),
      ])
      setStats(statsData)
      setMenuItems(itemsData)
      setOrders(ordersData)
      setLoading(false)
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load dashboard")
      setLoading(false)
    }
  }

  const loadRatings = async () => {
    try {
      const response = await fetch("http://localhost:3001/api/chef/profile", {
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

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    try {
      if (editingItem) {
        await chefService.updateMenuItem(editingItem.item_id, formData)
        alert("Menu item updated successfully!")
      } else {
        await chefService.createMenuItem(formData)
        alert("Menu item created successfully!")
      }
      setFormData({
        name: "",
        description: "",
        price: "",
        image_url: "",
        is_vip_only: false,
        is_available: true,
      })
      setShowAddForm(false)
      setEditingItem(null)
      await loadDashboardData()
    } catch (err) {
      setError(err.response?.data?.error || "Failed to save menu item")
    }
  }

  const handleEdit = (item) => {
    setEditingItem(item)
    setFormData({
      name: item.name,
      description: item.description || "",
      price: item.price,
      image_url: item.image_url || "",
      is_vip_only: item.is_vip_only,
      is_available: item.is_available,
    })
    setShowAddForm(true)
  }

  const handleDelete = async (itemId) => {
    if (!window.confirm("Are you sure you want to delete this menu item?")) {
      return
    }

    try {
      await chefService.deleteMenuItem(itemId)
      alert("Menu item deleted successfully!")
      await loadDashboardData()
    } catch (err) {
      setError(err.response?.data?.error || "Failed to delete menu item")
    }
  }

  const handleCancel = () => {
    setShowAddForm(false)
    setEditingItem(null)
    setFormData({
      name: "",
      description: "",
      price: "",
      image_url: "",
      is_vip_only: false,
      is_available: true,
    })
  }

  const handleMarkReady = async (orderId) => {
    try {
      await chefService.markOrderReady(orderId)
      alert("Order marked as ready for delivery!")
      await loadDashboardData()
    } catch (err) {
      setError(err.response?.data?.error || "Failed to mark order as ready")
    }
  }

  if (loading) return <div style={{ padding: "20px", color: "#fff" }}>Loading...</div>

  const getStatusColor = (status) => {
    const colors = {
      pending: "#ffc107",
      confirmed: "#4ade80",
      preparing: "#fd7e14",
      ready: "#4ade80",
      out_for_delivery: "#4ade80",
      delivered: "#4ade80",
      cancelled: "#ef4444",
    }
    return colors[status] || "#6c757d"
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0f172a 0%, #1a1f3a 100%)",
        padding: "clamp(15px, 3vw, 40px) clamp(15px, 3vw, 30px)",
        maxWidth: "1400px",
        width: "100%",
        margin: "0 auto",
        boxSizing: "border-box",
      }}
    >
      <h2 style={{ color: "#fff", fontSize: "clamp(24px, 4vw, 32px)", marginBottom: "20px" }}>Chef Dashboard</h2>

      {error && (
        <div
          style={{
            color: "#ef4444",
            marginBottom: "15px",
            padding: "12px",
            background: "#7f1d1d",
            borderRadius: "6px",
          }}
        >
          {error}
        </div>
      )}

      <div style={{ marginBottom: "20px", borderBottom: "2px solid #334155" }}>
        <button
          onClick={() => setActiveTab("orders")}
          style={{
            padding: "10px 20px",
            background: activeTab === "orders" ? "#4ade80" : "transparent",
            color: activeTab === "orders" ? "#000" : "#94a3b8",
            border: "none",
            borderBottom: activeTab === "orders" ? "3px solid #4ade80" : "none",
            cursor: "pointer",
            fontSize: "16px",
            marginRight: "10px",
            fontWeight: "bold",
            transition: "all 0.3s ease",
          }}
        >
          Orders ({orders.length})
        </button>
        <button
          onClick={() => setActiveTab("menu")}
          style={{
            padding: "10px 20px",
            background: activeTab === "menu" ? "#4ade80" : "transparent",
            color: activeTab === "menu" ? "#000" : "#94a3b8",
            border: "none",
            borderBottom: activeTab === "menu" ? "3px solid #4ade80" : "none",
            cursor: "pointer",
            fontSize: "16px",
            fontWeight: "bold",
            transition: "all 0.3s ease",
          }}
        >
          Menu Items ({menuItems.length})
        </button>
        <button
          onClick={() => setActiveTab("ratings")}
          style={{
            padding: "10px 20px",
            background: activeTab === "ratings" ? "#4ade80" : "transparent",
            color: activeTab === "ratings" ? "#000" : "#94a3b8",
            border: "none",
            borderBottom: activeTab === "ratings" ? "3px solid #4ade80" : "none",
            cursor: "pointer",
            fontSize: "16px",
            marginLeft: "10px",
            fontWeight: "bold",
            transition: "all 0.3s ease",
          }}
        >
          My Ratings
        </button>
        <button
          onClick={() => setActiveTab("complaints")}
          style={{
            padding: "10px 20px",
            background: activeTab === "complaints" ? "#4ade80" : "transparent",
            color: activeTab === "complaints" ? "#000" : "#94a3b8",
            border: "none",
            borderBottom: activeTab === "complaints" ? "3px solid #4ade80" : "none",
            cursor: "pointer",
            fontSize: "16px",
            marginLeft: "10px",
            fontWeight: "bold",
            transition: "all 0.3s ease",
          }}
        >
          Complaints
        </button>
      </div>

      {stats && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: "clamp(12px, 2vw, 20px)",
            marginBottom: "clamp(20px, 3vw, 30px)",
          }}
        >
          <div
            style={{
              background: "#1e293b",
              padding: "20px",
              borderRadius: "8px",
              textAlign: "center",
              border: "1px solid #334155",
            }}
          >
            <h3 style={{ color: "#cbd5e1", fontSize: "14px", margin: "0 0 10px 0" }}>Total Menu Items</h3>
            <p style={{ fontSize: "32px", fontWeight: "bold", color: "#4ade80", margin: 0 }}>
              {stats.menu_items_count}
            </p>
          </div>
          <div
            style={{
              background: "#1e293b",
              padding: "20px",
              borderRadius: "8px",
              textAlign: "center",
              border: "1px solid #334155",
            }}
          >
            <h3 style={{ color: "#cbd5e1", fontSize: "14px", margin: "0 0 10px 0" }}>Active Items</h3>
            <p style={{ fontSize: "32px", fontWeight: "bold", color: "#4ade80", margin: 0 }}>
              {stats.active_items_count}
            </p>
          </div>
          <div
            style={{
              background: "#1e293b",
              padding: "20px",
              borderRadius: "8px",
              textAlign: "center",
              border: "1px solid #334155",
            }}
          >
            <h3 style={{ color: "#cbd5e1", fontSize: "14px", margin: "0 0 10px 0" }}>Total Orders</h3>
            <p style={{ fontSize: "32px", fontWeight: "bold", color: "#4ade80", margin: 0 }}>{stats.total_orders}</p>
          </div>
          <div
            style={{
              background: "#1e293b",
              padding: "20px",
              borderRadius: "8px",
              textAlign: "center",
              border: "1px solid #334155",
            }}
          >
            <h3 style={{ color: "#cbd5e1", fontSize: "14px", margin: "0 0 10px 0" }}>Rating</h3>
            <p style={{ fontSize: "32px", fontWeight: "bold", color: "#fbbf24", margin: 0 }}>
              {Number.parseFloat(stats.average_rating).toFixed(1)} ★
            </p>
            <p style={{ color: "#94a3b8", fontSize: "12px", margin: "5px 0 0 0" }}>({stats.total_ratings} reviews)</p>
          </div>
        </div>
      )}

      {activeTab === "orders" && (
        <div>
          <h3 style={{ color: "#fff" }}>Active Orders</h3>
          {orders.length === 0 ? (
            <p style={{ color: "#94a3b8" }}>No active orders at the moment</p>
          ) : (
            <div style={{ marginTop: "20px" }}>
              {orders.map((order) => (
                <div
                  key={order.order_id}
                  style={{
                    background: "#1e293b",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                    padding: "20px",
                    marginBottom: "20px",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "15px" }}>
                    <div>
                      <h4 style={{ color: "#fff", margin: 0 }}>Order #{order.order_id}</h4>
                      <p style={{ color: "#94a3b8", fontSize: "14px", margin: "5px 0" }}>
                        {new Date(order.created_at).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <span
                        style={{
                          background: getStatusColor(order.status),
                          color: getStatusColor(order.status) === "#4ade80" ? "#000" : "#fff",
                          padding: "5px 15px",
                          borderRadius: "4px",
                          fontSize: "14px",
                          fontWeight: "bold",
                        }}
                      >
                        {order.status.replace(/_/g, " ").toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <div style={{ borderTop: "1px solid #334155", paddingTop: "15px", marginTop: "15px" }}>
                    <h5 style={{ color: "#fff", marginBottom: "10px" }}>Your Items:</h5>
                    {order.OrderItems?.map((item) => (
                      <div
                        key={item.order_item_id}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          padding: "8px 0",
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

                  <div style={{ marginTop: "15px", paddingTop: "15px", borderTop: "1px solid #334155" }}>
                    <p style={{ color: "#94a3b8", fontSize: "14px", margin: "5px 0" }}>
                      <strong style={{ color: "#cbd5e1" }}>Delivery Address:</strong> {order.delivery_address}
                    </p>
                    {order.special_instructions && (
                      <p style={{ color: "#94a3b8", fontSize: "14px", margin: "5px 0" }}>
                        <strong style={{ color: "#cbd5e1" }}>Special Instructions:</strong> {order.special_instructions}
                      </p>
                    )}
                  </div>

                  {(order.status === "pending" || order.status === "confirmed" || order.status === "preparing") && (
                    <div style={{ marginTop: "15px" }}>
                      <button
                        onClick={() => handleMarkReady(order.order_id)}
                        style={{
                          background: "#4ade80",
                          color: "#000",
                          border: "none",
                          padding: "10px 20px",
                          borderRadius: "4px",
                          cursor: "pointer",
                          fontSize: "16px",
                          fontWeight: "bold",
                          transition: "transform 0.2s ease",
                        }}
                        onMouseOver={(e) => (e.target.style.transform = "scale(1.05)")}
                        onMouseOut={(e) => (e.target.style.transform = "scale(1)")}
                      >
                        Mark as Ready for Delivery
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "menu" && (
        <div>
          <div style={{ marginBottom: "20px" }}>
            <button
              onClick={() => setShowAddForm(true)}
              style={{
                background: "#4ade80",
                color: "#000",
                border: "none",
                padding: "10px 20px",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "16px",
                fontWeight: "bold",
                transition: "transform 0.2s ease",
              }}
              onMouseOver={(e) => (e.target.style.transform = "scale(1.05)")}
              onMouseOut={(e) => (e.target.style.transform = "scale(1)")}
            >
              Add New Menu Item
            </button>
          </div>

          {showAddForm && (
            <div
              style={{
                background: "#1e293b",
                border: "1px solid #334155",
                borderRadius: "8px",
                padding: "20px",
                marginBottom: "30px",
              }}
            >
              <h3 style={{ color: "#fff", marginTop: 0 }}>{editingItem ? "Edit Menu Item" : "Add New Menu Item"}</h3>
              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: "15px" }}>
                  <label style={{ display: "block", marginBottom: "5px", color: "#cbd5e1" }}>Name:</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    style={{
                      width: "100%",
                      padding: "8px",
                      border: "1px solid #334155",
                      borderRadius: "4px",
                      background: "#0f172a",
                      color: "#fff",
                    }}
                  />
                </div>
                <div style={{ marginBottom: "15px" }}>
                  <label style={{ display: "block", marginBottom: "5px", color: "#cbd5e1" }}>Description:</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                    style={{
                      width: "100%",
                      padding: "8px",
                      border: "1px solid #334155",
                      borderRadius: "4px",
                      background: "#0f172a",
                      color: "#fff",
                    }}
                  />
                </div>
                <div style={{ marginBottom: "15px" }}>
                  <label style={{ display: "block", marginBottom: "5px", color: "#cbd5e1" }}>Price:</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    required
                    style={{
                      width: "100%",
                      padding: "8px",
                      border: "1px solid #334155",
                      borderRadius: "4px",
                      background: "#0f172a",
                      color: "#fff",
                    }}
                  />
                </div>
                <div style={{ marginBottom: "15px" }}>
                  <label style={{ display: "block", marginBottom: "5px", color: "#cbd5e1" }}>Image URL:</label>
                  <input
                    type="text"
                    name="image_url"
                    value={formData.image_url}
                    onChange={handleInputChange}
                    style={{
                      width: "100%",
                      padding: "8px",
                      border: "1px solid #334155",
                      borderRadius: "4px",
                      background: "#0f172a",
                      color: "#fff",
                    }}
                  />
                </div>
                <div style={{ marginBottom: "15px" }}>
                  <label style={{ display: "flex", alignItems: "center", color: "#cbd5e1" }}>
                    <input
                      type="checkbox"
                      name="is_vip_only"
                      checked={formData.is_vip_only}
                      onChange={handleInputChange}
                      style={{ marginRight: "8px" }}
                    />
                    VIP Only
                  </label>
                </div>
                <div style={{ marginBottom: "15px" }}>
                  <label style={{ display: "flex", alignItems: "center", color: "#cbd5e1" }}>
                    <input
                      type="checkbox"
                      name="is_available"
                      checked={formData.is_available}
                      onChange={handleInputChange}
                      style={{ marginRight: "8px" }}
                    />
                    Available
                  </label>
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    type="submit"
                    style={{
                      background: "#4ade80",
                      color: "#000",
                      border: "none",
                      padding: "10px 20px",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontWeight: "bold",
                      transition: "transform 0.2s ease",
                    }}
                    onMouseOver={(e) => (e.target.style.transform = "scale(1.05)")}
                    onMouseOut={(e) => (e.target.style.transform = "scale(1)")}
                  >
                    {editingItem ? "Update" : "Create"}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    style={{
                      background: "#475569",
                      color: "#fff",
                      border: "none",
                      padding: "10px 20px",
                      borderRadius: "4px",
                      cursor: "pointer",
                      transition: "transform 0.2s ease",
                    }}
                    onMouseOver={(e) => (e.target.style.transform = "scale(1.05)")}
                    onMouseOut={(e) => (e.target.style.transform = "scale(1)")}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          <h3 style={{ color: "#fff" }}>My Menu Items</h3>
          {menuItems.length === 0 ? (
            <p style={{ color: "#94a3b8" }}>No menu items yet. Create your first one!</p>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "20px" }}>
              {menuItems.map((item) => (
                <div
                  key={item.item_id}
                  style={{
                    background: "#1e293b",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                    overflow: "hidden",
                    transition: "transform 0.3s ease, box-shadow 0.3s ease",
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = "translateY(-4px)"
                    e.currentTarget.style.boxShadow = "0 8px 24px rgba(74, 222, 128, 0.15)"
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = "translateY(0)"
                    e.currentTarget.style.boxShadow = "none"
                  }}
                >
                  {item.image_url && (
                    <img
                      src={item.image_url || "/placeholder.svg"}
                      alt={item.name}
                      style={{ width: "100%", height: "200px", objectFit: "cover" }}
                    />
                  )}
                  <div style={{ padding: "16px" }}>
                    <h4 style={{ color: "#fff", margin: "0 0 8px 0" }}>{item.name}</h4>
                    <p style={{ color: "#94a3b8", fontSize: "14px", margin: "0 0 12px 0" }}>{item.description}</p>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "12px",
                      }}
                    >
                      <span style={{ color: "#4ade80", fontSize: "20px", fontWeight: "bold" }}>
                        ${Number.parseFloat(item.price).toFixed(2)}
                      </span>
                      <div style={{ display: "flex", gap: "4px" }}>
                        {item.is_vip_only && (
                          <span
                            style={{
                              background: "#f59e0b",
                              color: "#000",
                              padding: "2px 8px",
                              borderRadius: "4px",
                              fontSize: "12px",
                              fontWeight: "bold",
                            }}
                          >
                            VIP
                          </span>
                        )}
                        <span
                          style={{
                            background: item.is_available ? "#4ade80" : "#ef4444",
                            color: "#000",
                            padding: "2px 8px",
                            borderRadius: "4px",
                            fontSize: "12px",
                            fontWeight: "bold",
                          }}
                        >
                          {item.is_available ? "Available" : "Unavailable"}
                        </span>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
                        onClick={() => handleEdit(item)}
                        style={{
                          flex: 1,
                          background: "#4ade80",
                          color: "#000",
                          border: "none",
                          padding: "8px",
                          borderRadius: "4px",
                          cursor: "pointer",
                          fontSize: "14px",
                          fontWeight: "bold",
                          transition: "transform 0.2s ease",
                        }}
                        onMouseOver={(e) => (e.target.style.transform = "scale(1.05)")}
                        onMouseOut={(e) => (e.target.style.transform = "scale(1)")}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item.item_id)}
                        style={{
                          flex: 1,
                          background: "#ef4444",
                          color: "#fff",
                          border: "none",
                          padding: "8px",
                          borderRadius: "4px",
                          cursor: "pointer",
                          fontSize: "14px",
                          fontWeight: "bold",
                          transition: "transform 0.2s ease",
                        }}
                        onMouseOver={(e) => (e.target.style.transform = "scale(1.05)")}
                        onMouseOut={(e) => (e.target.style.transform = "scale(1)")}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "ratings" && (
        <div>
          <h3 style={{ color: "#fff" }}>Your Ratings</h3>
          {ratings.length === 0 ? (
            <p style={{ color: "#94a3b8" }}>No ratings yet</p>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
              {ratings.map((rating) => (
                <div
                  key={rating.rating_id}
                  style={{
                    background: "#1e293b",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                    padding: "16px",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                    <div>
                      <p style={{ color: "#fff", fontWeight: "bold", margin: 0 }}>{rating.User?.name}</p>
                      <p style={{ color: "#94a3b8", fontSize: "14px", margin: "4px 0 0 0" }}>
                        {new Date(rating.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span style={{ color: "#fbbf24", fontSize: "18px" }}>{"★".repeat(rating.rating)}</span>
                  </div>
                  <p style={{ color: "#cbd5e1", marginTop: "12px" }}>{rating.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "complaints" && (
        <div>
          <div style={{ marginBottom: "20px", borderBottom: "2px solid #334155" }}>
            <button
              onClick={() => setComplaintsTab("filed")}
              style={{
                padding: "10px 20px",
                background: complaintsTab === "filed" ? "#4ade80" : "transparent",
                color: complaintsTab === "filed" ? "#000" : "#94a3b8",
                border: "none",
                borderBottom: complaintsTab === "filed" ? "3px solid #4ade80" : "none",
                cursor: "pointer",
                fontSize: "16px",
                fontWeight: "bold",
                transition: "all 0.3s ease",
              }}
            >
              Filed Complaints ({complaints.length})
            </button>
            <button
              onClick={() => setComplaintsTab("received")}
              style={{
                padding: "10px 20px",
                background: complaintsTab === "received" ? "#4ade80" : "transparent",
                color: complaintsTab === "received" ? "#000" : "#94a3b8",
                border: "none",
                borderBottom: complaintsTab === "received" ? "3px solid #4ade80" : "none",
                cursor: "pointer",
                fontSize: "16px",
                fontWeight: "bold",
                transition: "all 0.3s ease",
                marginLeft: "10px",
              }}
            >
              Received Complaints ({receivedComplaints.length})
            </button>
          </div>

          {complaintsTab === "filed" && (
            <div>
              <h3 style={{ color: "#fff" }}>Complaints I Filed</h3>
              {complaints.length === 0 ? (
                <p style={{ color: "#94a3b8" }}>No complaints filed</p>
              ) : (
                <div style={{ display: "grid", gap: "16px" }}>
                  {complaints.map((complaint) => (
                    <div
                      key={complaint.complaint_id}
                      style={{
                        background: "#1e293b",
                        border: "1px solid #334155",
                        borderRadius: "8px",
                        padding: "16px",
                      }}
                    >
                      <p style={{ color: "#fff", fontWeight: "bold", margin: "0 0 8px 0" }}>
                        Against: {complaint.SubjectUser?.name}
                      </p>
                      <p style={{ color: "#cbd5e1", margin: "0 0 8px 0" }}>{complaint.complaint_text}</p>
                      <p style={{ color: "#94a3b8", fontSize: "14px", margin: 0 }}>
                        {new Date(complaint.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {complaintsTab === "received" && (
            <div>
              <h3 style={{ color: "#fff" }}>Complaints About Me</h3>
              {receivedComplaints.length === 0 ? (
                <p style={{ color: "#94a3b8" }}>No complaints received</p>
              ) : (
                <div style={{ display: "grid", gap: "16px" }}>
                  {receivedComplaints.map((complaint) => (
                    <div
                      key={complaint.complaint_id}
                      style={{
                        background: "#1e293b",
                        border: "1px solid #ef4444",
                        borderRadius: "8px",
                        padding: "16px",
                      }}
                    >
                      <p style={{ color: "#fff", fontWeight: "bold", margin: "0 0 8px 0" }}>
                        From: {complaint.FiledByUser?.name}
                      </p>
                      <p style={{ color: "#cbd5e1", margin: "0 0 8px 0" }}>{complaint.complaint_text}</p>
                      <p style={{ color: "#94a3b8", fontSize: "14px", margin: 0 }}>
                        {new Date(complaint.created_at).toLocaleDateString()}
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
  )
}

export default ChefDashboardPage
