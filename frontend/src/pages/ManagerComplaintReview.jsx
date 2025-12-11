"use client"

import { useState, useEffect } from "react"

export default function ManagerComplaintReview() {
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [reviewingId, setReviewingId] = useState(null)
  const [decision, setDecision] = useState("upheld")
  const [notes, setNotes] = useState("")

  useEffect(() => {
    fetchComplaints()
  }, [])

  const fetchComplaints = async () => {
    try {
      const response = await fetch("http://localhost:3001/api/complaints/pending", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch complaints")
      }

      setComplaints(data.data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleReview = async (complaintId) => {
    if (!notes.trim()) {
      alert("Please provide review notes")
      return
    }

    try {
      const response = await fetch(`http://localhost:3001/api/complaints/${complaintId}/review`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ decision, notes }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to review complaint")
      }

      setReviewingId(null)
      setNotes("")
      fetchComplaints()
    } catch (err) {
      alert(err.message)
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
        <div style={{ color: "#a1a5b4", fontSize: "18px" }}>Loading complaints...</div>
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
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <h1 style={{ fontSize: "28px", fontWeight: "bold", marginBottom: "24px", color: "#ffffff" }}>
          Complaint Review Dashboard
        </h1>

        {error && (
          <div
            style={{
              marginBottom: "16px",
              padding: "16px",
              background: "#7f1d1d",
              border: "1px solid #dc2626",
              borderRadius: "8px",
              color: "#fecaca",
            }}
          >
            {error}
          </div>
        )}

        {complaints.length === 0 ? (
          <div style={{ textAlign: "center", color: "#a1a5b4", padding: "32px" }}>No pending complaints to review</div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "16px" }}>
            {complaints.map((complaint) => (
              <div
                key={complaint.complaint_id}
                style={{
                  background: "#1e293b",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.3)",
                  padding: "24px",
                  border: `3px solid ${complaint.is_vip_complaint ? "#f59e0b" : "#475569"}`,
                  transition: "all 0.3s ease",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    marginBottom: "16px",
                  }}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                      <span
                        style={{
                          padding: "6px 12px",
                          borderRadius: "20px",
                          fontSize: "13px",
                          fontWeight: "500",
                          background: complaint.complaint_type === "complaint" ? "#7f1d1d" : "#166534",
                          color: complaint.complaint_type === "complaint" ? "#fca5a5" : "#86efac",
                        }}
                      >
                        {complaint.complaint_type}
                      </span>
                      {complaint.is_vip_complaint && (
                        <span
                          style={{
                            padding: "6px 12px",
                            background: "#92400e",
                            color: "#fcd34d",
                            borderRadius: "20px",
                            fontSize: "13px",
                            fontWeight: "500",
                          }}
                        >
                          VIP
                        </span>
                      )}
                      {complaint.is_disputed && (
                        <span
                          style={{
                            padding: "6px 12px",
                            background: "#7c2d12",
                            color: "#fed7aa",
                            borderRadius: "20px",
                            fontSize: "13px",
                            fontWeight: "500",
                          }}
                        >
                          DISPUTED
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: "14px", color: "#cbd5e1", marginBottom: "4px" }}>
                      Subject: {complaint.Subject.username} ({complaint.subject_type})
                    </p>
                    <p style={{ fontSize: "14px", color: "#cbd5e1", marginBottom: "4px" }}>
                      Filed by: {complaint.Filer.username}
                    </p>
                    {complaint.category && (
                      <p style={{ fontSize: "14px", color: "#cbd5e1" }}>Category: {complaint.category}</p>
                    )}
                  </div>
                  <span style={{ fontSize: "12px", color: "#64748b" }}>
                    {new Date(complaint.created_at).toLocaleDateString()}
                  </span>
                </div>

                <div style={{ marginBottom: "16px" }}>
                  <h3 style={{ fontWeight: "600", marginBottom: "8px", color: "#ffffff" }}>Description:</h3>
                  <p style={{ color: "#cbd5e1" }}>{complaint.description}</p>
                </div>

                {complaint.evidence_url && (
                  <div style={{ marginBottom: "16px" }}>
                    <h3 style={{ fontWeight: "600", marginBottom: "8px", color: "#ffffff" }}>Evidence:</h3>
                    <a
                      href={complaint.evidence_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "#4ade80", textDecoration: "underline" }}
                    >
                      {complaint.evidence_url}
                    </a>
                  </div>
                )}

                {complaint.is_disputed && complaint.dispute_notes && (
                  <div
                    style={{
                      marginBottom: "16px",
                      padding: "12px",
                      background: "#7c2d12",
                      borderRadius: "6px",
                      border: "1px solid #92400e",
                    }}
                  >
                    <h3 style={{ fontWeight: "600", marginBottom: "8px", color: "#fed7aa" }}>Dispute Notes:</h3>
                    <p style={{ color: "#fed7aa" }}>{complaint.dispute_notes}</p>
                  </div>
                )}

                {reviewingId === complaint.complaint_id ? (
                  <div style={{ marginTop: "16px", padding: "16px", background: "#0f172a", borderRadius: "6px" }}>
                    <div style={{ marginBottom: "16px" }}>
                      <label
                        style={{
                          display: "block",
                          fontSize: "14px",
                          fontWeight: "500",
                          color: "#ffffff",
                          marginBottom: "8px",
                        }}
                      >
                        Decision
                      </label>
                      <select
                        value={decision}
                        onChange={(e) => setDecision(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "8px 12px",
                          border: "1px solid #475569",
                          borderRadius: "6px",
                          background: "#1e293b",
                          color: "#ffffff",
                        }}
                      >
                        <option value="upheld">Uphold</option>
                        <option value="dismissed">Dismiss</option>
                      </select>
                    </div>

                    <div style={{ marginBottom: "16px" }}>
                      <label
                        style={{
                          display: "block",
                          fontSize: "14px",
                          fontWeight: "500",
                          color: "#ffffff",
                          marginBottom: "8px",
                        }}
                      >
                        Review Notes
                      </label>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={3}
                        style={{
                          width: "100%",
                          padding: "10px 12px",
                          border: "1px solid #475569",
                          borderRadius: "6px",
                          background: "#1e293b",
                          color: "#ffffff",
                          fontFamily: "inherit",
                        }}
                        placeholder="Provide your reasoning..."
                        required
                      />
                    </div>

                    <div style={{ display: "flex", gap: "12px" }}>
                      <button
                        onClick={() => handleReview(complaint.complaint_id)}
                        style={{
                          flex: 1,
                          background: "#4ade80",
                          color: "#ffffff",
                          padding: "10px 16px",
                          borderRadius: "6px",
                          border: "none",
                          fontWeight: "600",
                          cursor: "pointer",
                          transition: "all 0.3s ease",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "#22c55e")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "#4ade80")}
                      >
                        Submit Review
                      </button>
                      <button
                        onClick={() => {
                          setReviewingId(null)
                          setNotes("")
                        }}
                        style={{
                          flex: 1,
                          background: "#475569",
                          color: "#ffffff",
                          padding: "10px 16px",
                          borderRadius: "6px",
                          border: "none",
                          fontWeight: "600",
                          cursor: "pointer",
                          transition: "all 0.3s ease",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "#64748b")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "#475569")}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setReviewingId(complaint.complaint_id)}
                    style={{
                      width: "100%",
                      background: "#4ade80",
                      color: "#ffffff",
                      padding: "10px 16px",
                      borderRadius: "6px",
                      border: "none",
                      fontWeight: "600",
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#22c55e")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "#4ade80")}
                  >
                    Review This {complaint.complaint_type}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
