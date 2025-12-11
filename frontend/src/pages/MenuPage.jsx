"use client"

import { useState, useEffect } from "react"
import { useDispatch } from "react-redux"
import { useNavigate, Link } from "react-router-dom"
import { menuService } from "../services/menuService"
import { addToCart } from "../store/cartSlice"

function MenuPage() {
  const [menuItems, setMenuItems] = useState([])
  const [filteredItems, setFilteredItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("name")
  const [showVipOnly, setShowVipOnly] = useState(false)
  const [minPrice, setMinPrice] = useState("")
  const [maxPrice, setMaxPrice] = useState("")
  const dispatch = useDispatch()
  const navigate = useNavigate()

  useEffect(() => {
    loadMenu()
  }, [])

  useEffect(() => {
    filterAndSortItems()
  }, [menuItems, searchTerm, sortBy, showVipOnly, minPrice, maxPrice])

  const loadMenu = async () => {
    try {
      const items = await menuService.getAllMenuItems()
      setMenuItems(items)
      setFilteredItems(items)
      setLoading(false)
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load menu")
      setLoading(false)
    }
  }

  const filterAndSortItems = () => {
    let filtered = [...menuItems]

    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.description?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (showVipOnly) {
      filtered = filtered.filter((item) => item.is_vip_only)
    }

    if (minPrice) {
      filtered = filtered.filter((item) => Number.parseFloat(item.price) >= Number.parseFloat(minPrice))
    }

    if (maxPrice) {
      filtered = filtered.filter((item) => Number.parseFloat(item.price) <= Number.parseFloat(maxPrice))
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "price_low":
          return Number.parseFloat(a.price) - Number.parseFloat(b.price)
        case "price_high":
          return Number.parseFloat(b.price) - Number.parseFloat(a.price)
        case "rating":
          return Number.parseFloat(b.average_rating) - Number.parseFloat(a.average_rating)
        case "popular":
          return b.order_count - a.order_count
        case "name":
        default:
          return a.name.localeCompare(b.name)
      }
    })

    setFilteredItems(filtered)
  }

  const handleAddToCart = (item) => {
    dispatch(addToCart(item))
    alert(`${item.name} added to cart!`)
  }

  if (loading) return <div style={{ padding: "40px", textAlign: "center", color: "#999" }}>Loading menu...</div>
  if (error) return <div style={{ padding: "40px", textAlign: "center", color: "#ff6b6b" }}>{error}</div>

  return (
    <div
      style={{
        padding: "clamp(20px, 4vw, 50px)",
        maxWidth: "1400px",
        width: "100%",
        margin: "0 auto",
        boxSizing: "border-box",
        minHeight: "100vh",
      }}
    >
      <div style={{ marginBottom: "50px" }}>
        <h1
          style={{
            color: "#fff",
            fontSize: "clamp(28px, 5vw, 42px)",
            fontWeight: "700",
            margin: "0 0 8px 0",
            letterSpacing: "-0.5px",
          }}
        >
          Our Menu
        </h1>
        <p style={{ color: "#999", fontSize: "16px", margin: "0", fontWeight: "400" }}>
          Discover our carefully curated selection of dishes
        </p>
      </div>

      <div
        style={{
          background: "rgba(255, 255, 255, 0.04)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          padding: "clamp(24px, 4vw, 32px)",
          borderRadius: "12px",
          marginBottom: "40px",
          backdropFilter: "blur(4px)",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "20px",
            marginBottom: "24px",
          }}
        >
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                color: "#ccc",
                fontSize: "13px",
                fontWeight: "500",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Search
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or description..."
              style={{
                width: "100%",
                padding: "10px 14px",
                background: "rgba(255, 255, 255, 0.06)",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                borderRadius: "8px",
                color: "#fff",
                fontSize: "14px",
                boxSizing: "border-box",
                transition: "all 0.2s ease",
                outline: "none",
              }}
              onFocus={(e) => {
                e.target.style.background = "rgba(255, 255, 255, 0.09)"
                e.target.style.borderColor = "rgba(255, 255, 255, 0.2)"
              }}
              onBlur={(e) => {
                e.target.style.background = "rgba(255, 255, 255, 0.06)"
                e.target.style.borderColor = "rgba(255, 255, 255, 0.12)"
              }}
            />
          </div>

          <div>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                color: "#ccc",
                fontSize: "13px",
                fontWeight: "500",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 14px",
                background: "rgba(255, 255, 255, 0.06)",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                borderRadius: "8px",
                color: "#fff",
                fontSize: "14px",
                boxSizing: "border-box",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              <option value="name">Name (A-Z)</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="popular">Most Popular</option>
            </select>
          </div>

          <div>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                color: "#ccc",
                fontSize: "13px",
                fontWeight: "500",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Min Price
            </label>
            <input
              type="number"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              placeholder="$0"
              min="0"
              step="0.01"
              style={{
                width: "100%",
                padding: "10px 14px",
                background: "rgba(255, 255, 255, 0.06)",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                borderRadius: "8px",
                color: "#fff",
                fontSize: "14px",
                boxSizing: "border-box",
                transition: "all 0.2s ease",
              }}
            />
          </div>

          <div>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                color: "#ccc",
                fontSize: "13px",
                fontWeight: "500",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Max Price
            </label>
            <input
              type="number"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              placeholder="Any"
              min="0"
              step="0.01"
              style={{
                width: "100%",
                padding: "10px 14px",
                background: "rgba(255, 255, 255, 0.06)",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                borderRadius: "8px",
                color: "#fff",
                fontSize: "14px",
                boxSizing: "border-box",
                transition: "all 0.2s ease",
              }}
            />
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            paddingTop: "12px",
            borderTop: "1px solid rgba(255, 255, 255, 0.06)",
          }}
        >
          <label
            style={{
              display: "flex",
              alignItems: "center",
              color: "#ccc",
              fontSize: "14px",
              fontWeight: "500",
              cursor: "pointer",
              margin: "0",
            }}
          >
            <input
              type="checkbox"
              checked={showVipOnly}
              onChange={(e) => setShowVipOnly(e.target.checked)}
              style={{ marginRight: "10px", width: "16px", height: "16px", cursor: "pointer" }}
            />
            VIP Items Only
          </label>
          <span style={{ color: "#666", fontSize: "13px", marginLeft: "auto" }}>
            Showing {filteredItems.length} of {menuItems.length}
          </span>
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <p style={{ color: "#666", textAlign: "center", padding: "80px 20px", fontSize: "16px" }}>
          No menu items match your filters. Try adjusting your search criteria.
        </p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
            gap: "clamp(16px, 3vw, 24px)",
          }}
        >
          {filteredItems.map((item) => (
            <div
              key={item.item_id}
              style={{
                background: "rgba(255, 255, 255, 0.02)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: "12px",
                overflow: "hidden",
                transition: "all 0.3s ease",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)"
                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.15)"
                e.currentTarget.style.transform = "translateY(-4px)"
                e.currentTarget.style.boxShadow = "0 12px 24px rgba(0, 0, 0, 0.3)"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.02)"
                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.08)"
                e.currentTarget.style.transform = "translateY(0)"
                e.currentTarget.style.boxShadow = "none"
              }}
            >
              <div onClick={() => navigate(`/menu/${item.item_id}`)} style={{ flex: "1" }}>
                {item.image_url && (
                  <img
                    src={item.image_url || "/placeholder.svg"}
                    alt={item.name}
                    style={{ width: "100%", height: "180px", objectFit: "cover" }}
                  />
                )}
                <div style={{ padding: "18px" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      gap: "8px",
                      marginBottom: "8px",
                    }}
                  >
                    <h3
                      style={{
                        color: "#fff",
                        fontSize: "16px",
                        fontWeight: "600",
                        margin: "0",
                        lineHeight: "1.3",
                        flex: "1",
                      }}
                    >
                      {item.name}
                    </h3>
                    {item.is_vip_only && (
                      <span
                        style={{
                          background: "linear-gradient(135deg, #ffd700, #ffed4e)",
                          color: "#1a1a1a",
                          padding: "4px 10px",
                          borderRadius: "6px",
                          fontSize: "11px",
                          fontWeight: "700",
                          whiteSpace: "nowrap",
                        }}
                      >
                        VIP
                      </span>
                    )}
                  </div>
                  <p
                    style={{
                      fontSize: "13px",
                      color: "#999",
                      margin: "0 0 12px 0",
                      lineHeight: "1.4",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {item.description}
                  </p>
                  <p
                    style={{
                      fontSize: "20px",
                      fontWeight: "700",
                      color: "#4ade80",
                      margin: "12px 0",
                      letterSpacing: "-0.5px",
                    }}
                  >
                    ${Number.parseFloat(item.price).toFixed(2)}
                  </p>
                  {item.Chef && (
                    <p style={{ fontSize: "12px", color: "#666", margin: "8px 0" }}>
                      Chef: {item.Chef.User?.first_name} {item.Chef.User?.last_name}
                    </p>
                  )}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      fontSize: "13px",
                      color: "#ffd700",
                      marginTop: "10px",
                    }}
                  >
                    <span>⭐ {Number.parseFloat(item.average_rating).toFixed(1)}</span>
                    <span style={{ color: "#666" }}>({item.total_ratings} reviews)</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleAddToCart(item)}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  margin: "0",
                  background: "linear-gradient(135deg, #4ade80, #22c55e)",
                  color: "#000",
                  border: "none",
                  borderRadius: "0",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = "linear-gradient(135deg, #22c55e, #16a34a)"
                  e.target.style.boxShadow = "0 6px 12px rgba(74, 222, 128, 0.3)"
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = "linear-gradient(135deg, #4ade80, #22c55e)"
                  e.target.style.boxShadow = "none"
                }}
              >
                Add to Cart
              </button>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: "50px", paddingTop: "30px", borderTop: "1px solid rgba(255, 255, 255, 0.08)" }}>
        <Link
          to="/cart"
          style={{
            color: "#4ade80",
            textDecoration: "none",
            fontSize: "14px",
            fontWeight: "600",
            transition: "all 0.2s ease",
            display: "inline-block",
            padding: "8px 0",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "#22c55e"
            e.currentTarget.style.transform = "translateX(4px)"
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "#4ade80"
            e.currentTarget.style.transform = "translateX(0)"
          }}
        >
          ← Back to Cart
        </Link>
      </div>
    </div>
  )
}

export default MenuPage
