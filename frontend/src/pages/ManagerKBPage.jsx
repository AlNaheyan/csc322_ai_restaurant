"use client"

import { useState, useEffect } from "react"
import { chatService } from "../services/chatService"

const ManagerKBPage = () => {
  const [activeTab, setActiveTab] = useState("flagged")
  const [flaggedArticles, setFlaggedArticles] = useState([])
  const [pendingArticles, setPendingArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")

  useEffect(() => {
    if (activeTab === "flagged") {
      fetchFlaggedArticles()
    } else {
      fetchPendingArticles()
    }
  }, [activeTab])

  const fetchFlaggedArticles = async () => {
    try {
      setLoading(true)
      const result = await chatService.getFlaggedArticles()
      setFlaggedArticles(result.data)
    } catch (err) {
      setError("Failed to load flagged articles")
    } finally {
      setLoading(false)
    }
  }

  const fetchPendingArticles = async () => {
    try {
      setLoading(true)
      const result = await chatService.getPendingArticles()
      setPendingArticles(result.data)
    } catch (err) {
      setError("Failed to load pending articles")
    } finally {
      setLoading(false)
    }
  }

  const handleUnflag = async (articleId) => {
    try {
      await chatService.unflagArticle(articleId)
      setSuccessMessage("Article unflagged successfully")
      fetchFlaggedArticles()
      setTimeout(() => setSuccessMessage(""), 3000)
    } catch (err) {
      setError("Failed to unflag article")
    }
  }

  const handleDelete = async (articleId) => {
    if (!window.confirm("Are you sure you want to delete this article? This action cannot be undone.")) {
      return
    }

    try {
      await chatService.deleteArticle(articleId)
      setSuccessMessage("Article deleted successfully")
      if (activeTab === "flagged") {
        fetchFlaggedArticles()
      } else {
        fetchPendingArticles()
      }
      setTimeout(() => setSuccessMessage(""), 3000)
    } catch (err) {
      setError("Failed to delete article")
    }
  }

  const handleApprove = async (articleId) => {
    try {
      setError("")
      await chatService.approveArticle(articleId)
      setSuccessMessage("Article approved successfully")
      await fetchPendingArticles()
      setTimeout(() => setSuccessMessage(""), 3000)
    } catch (err) {
      setError("Failed to approve article")
      setTimeout(() => setError(""), 3000)
    }
  }

  const handleReject = async (articleId) => {
    if (!window.confirm("Are you sure you want to reject this article? This will mark it as inactive.")) {
      return
    }

    try {
      setError("")
      await chatService.rejectArticle(articleId)
      setSuccessMessage("Article rejected successfully")
      await fetchPendingArticles()
      setTimeout(() => setSuccessMessage(""), 3000)
    } catch (err) {
      setError("Failed to reject article")
      setTimeout(() => setError(""), 3000)
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0f172a 0%, #1a1f3a 100%)",
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "32px 16px",
      }}
    >
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "28px", fontWeight: "bold", color: "#ffffff", marginBottom: "8px" }}>
          Knowledge Base Management
        </h1>
        <p style={{ color: "#a1a5b4", marginTop: "8px" }}>Review and manage knowledge base articles</p>
      </div>

      <div style={{ display: "flex", gap: "12px", marginBottom: "24px" }}>
        <button
          onClick={() => setActiveTab("flagged")}
          style={{
            padding: "12px 20px",
            borderRadius: "6px",
            fontWeight: "600",
            border: "none",
            cursor: "pointer",
            transition: "all 0.3s ease",
            background: activeTab === "flagged" ? "#ef4444" : "#475569",
            color: "#ffffff",
          }}
          onMouseEnter={(e) => {
            if (activeTab !== "flagged") e.currentTarget.style.background = "#64748b"
          }}
          onMouseLeave={(e) => {
            if (activeTab !== "flagged") e.currentTarget.style.background = "#475569"
          }}
        >
          Flagged Articles ({flaggedArticles.length})
        </button>
        <button
          onClick={() => setActiveTab("pending")}
          style={{
            padding: "12px 20px",
            borderRadius: "6px",
            fontWeight: "600",
            border: "none",
            cursor: "pointer",
            transition: "all 0.3s ease",
            background: activeTab === "pending" ? "#4ade80" : "#475569",
            color: activeTab === "pending" ? "#ffffff" : "#ffffff",
          }}
          onMouseEnter={(e) => {
            if (activeTab !== "pending") e.currentTarget.style.background = "#64748b"
          }}
          onMouseLeave={(e) => {
            if (activeTab !== "pending") e.currentTarget.style.background = "#475569"
          }}
        >
          Pending Approval ({pendingArticles.length})
        </button>
      </div>

      {error && (
        <div
          style={{
            marginBottom: "16px",
            padding: "16px",
            background: "#7f1d1d",
            color: "#fca5a5",
            borderRadius: "6px",
          }}
        >
          {error}
        </div>
      )}

      {successMessage && (
        <div
          style={{
            marginBottom: "16px",
            padding: "16px",
            background: "#166534",
            color: "#86efac",
            borderRadius: "6px",
          }}
        >
          {successMessage}
        </div>
      )}

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "48px" }}>
          <div
            style={{
              animation: "spin 1s linear infinite",
              width: "48px",
              height: "48px",
              border: "4px solid #4ade80",
              borderTop: "4px solid transparent",
              borderRadius: "50%",
            }}
          ></div>
        </div>
      ) : activeTab === "flagged" ? (
        flaggedArticles.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "48px",
              background: "#1e293b",
              borderRadius: "8px",
              color: "#a1a5b4",
            }}
          >
            No flagged articles to review
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "16px" }}>
            {flaggedArticles.map((article) => (
              <div
                key={article.article_id}
                style={{
                  background: "#1e293b",
                  borderRadius: "8px",
                  padding: "24px",
                  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.3)",
                  border: "1px solid #334155",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: "16px",
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: "18px", fontWeight: "600", color: "#ffffff", marginBottom: "8px" }}>
                      {article.title}
                    </h3>
                    <span
                      style={{
                        display: "inline-block",
                        marginTop: "8px",
                        padding: "4px 8px",
                        background: "#4ade80",
                        color: "#ffffff",
                        fontSize: "12px",
                        borderRadius: "4px",
                      }}
                    >
                      {article.category}
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", marginLeft: "16px" }}>
                    <span
                      style={{
                        background: "#ef4444",
                        color: "#ffffff",
                        padding: "6px 12px",
                        borderRadius: "20px",
                        fontSize: "13px",
                        fontWeight: "500",
                      }}
                    >
                      {article.flag_count} flag{article.flag_count !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>

                <div style={{ marginBottom: "16px" }}>
                  <p style={{ color: "#cbd5e1", whiteSpace: "pre-wrap" }}>{article.content}</p>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingTop: "16px",
                    borderTop: "1px solid #334155",
                  }}
                >
                  <div style={{ fontSize: "13px", color: "#64748b" }}>
                    <span>Views: {article.view_count}</span>
                    <span style={{ margin: "0 12px" }}>•</span>
                    <span>Helpful: {article.helpful_count}</span>
                    {article.Author && (
                      <>
                        <span style={{ margin: "0 12px" }}>•</span>
                        <span>
                          Author: {article.Author.first_name} {article.Author.last_name}
                        </span>
                      </>
                    )}
                  </div>

                  <div style={{ display: "flex", gap: "12px" }}>
                    <button
                      onClick={() => handleUnflag(article.article_id)}
                      style={{
                        padding: "8px 16px",
                        background: "#4ade80",
                        color: "#ffffff",
                        borderRadius: "6px",
                        border: "none",
                        cursor: "pointer",
                        fontWeight: "600",
                        transition: "all 0.3s ease",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#22c55e")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "#4ade80")}
                    >
                      Unflag
                    </button>
                    <button
                      onClick={() => handleDelete(article.article_id)}
                      style={{
                        padding: "8px 16px",
                        background: "#ef4444",
                        color: "#ffffff",
                        borderRadius: "6px",
                        border: "none",
                        cursor: "pointer",
                        fontWeight: "600",
                        transition: "all 0.3s ease",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#dc2626")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "#ef4444")}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : pendingArticles.length === 0 ? (
        <div
          style={{ textAlign: "center", padding: "48px", background: "#1e293b", borderRadius: "8px", color: "#a1a5b4" }}
        >
          No pending articles to review
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "16px" }}>
          {pendingArticles.map((article) => (
            <div
              key={article.article_id}
              style={{
                background: "#1e293b",
                borderRadius: "8px",
                padding: "24px",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.3)",
                border: "1px solid #334155",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: "16px",
                }}
              >
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: "18px", fontWeight: "600", color: "#ffffff", marginBottom: "8px" }}>
                    {article.title}
                  </h3>
                  <span
                    style={{
                      display: "inline-block",
                      marginTop: "8px",
                      padding: "4px 8px",
                      background: "#4ade80",
                      color: "#ffffff",
                      fontSize: "12px",
                      borderRadius: "4px",
                    }}
                  >
                    {article.category}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginLeft: "16px" }}>
                  <span
                    style={{
                      background: "#f59e0b",
                      color: "#ffffff",
                      padding: "6px 12px",
                      borderRadius: "20px",
                      fontSize: "13px",
                      fontWeight: "500",
                    }}
                  >
                    Pending Approval
                  </span>
                </div>
              </div>

              <div style={{ marginBottom: "16px" }}>
                <p style={{ color: "#cbd5e1", whiteSpace: "pre-wrap" }}>{article.content}</p>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingTop: "16px",
                  borderTop: "1px solid #334155",
                }}
              >
                <div style={{ fontSize: "13px", color: "#64748b" }}>
                  {article.Author && (
                    <span>
                      Author: {article.Author.first_name} {article.Author.last_name} ({article.Author.email})
                    </span>
                  )}
                  <span style={{ margin: "0 12px" }}>•</span>
                  <span>Submitted: {new Date(article.created_at).toLocaleDateString()}</span>
                </div>

                <div style={{ display: "flex", gap: "12px" }}>
                  <button
                    onClick={() => handleApprove(article.article_id)}
                    style={{
                      padding: "8px 16px",
                      background: "#4ade80",
                      color: "#ffffff",
                      borderRadius: "6px",
                      border: "none",
                      cursor: "pointer",
                      fontWeight: "600",
                      transition: "all 0.3s ease",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#22c55e")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "#4ade80")}
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(article.article_id)}
                    style={{
                      padding: "8px 16px",
                      background: "#ef4444",
                      color: "#ffffff",
                      borderRadius: "6px",
                      border: "none",
                      cursor: "pointer",
                      fontWeight: "600",
                      transition: "all 0.3s ease",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#dc2626")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "#ef4444")}
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ManagerKBPage
