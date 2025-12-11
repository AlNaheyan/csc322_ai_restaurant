import ChatBox from "../components/ChatBox"

const ChatPage = () => {
  return (
    <div
      style={{
        padding: "30px",
        maxWidth: "1200px",
        margin: "0 auto",
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0f172a 0%, #1a1f3a 100%)",
      }}
    >
      <div style={{ textAlign: "center", marginBottom: "30px" }}>
        <h1 style={{ fontSize: "32px", fontWeight: "bold", marginBottom: "10px", color: "#ffffff" }}>
          Restaurant Assistant
        </h1>
        <p style={{ color: "#a1a5b4", fontSize: "16px" }}>
          Get instant answers about our menu, policies, delivery, and more
        </p>
      </div>

      <ChatBox />

      <div
        style={{
          marginTop: "40px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "20px",
        }}
      >
        <div
          style={{
            background: "#1e293b",
            padding: "20px",
            borderRadius: "12px",
            border: "1px solid #334155",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.3)",
          }}
        >
          <h3 style={{ fontWeight: "600", color: "#4ade80", marginBottom: "12px", fontSize: "18px" }}>
            Quick Questions
          </h3>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, color: "#cbd5e1", fontSize: "14px" }}>
            <li style={{ marginBottom: "8px" }}>• What are your hours?</li>
            <li style={{ marginBottom: "8px" }}>• How does delivery work?</li>
            <li style={{ marginBottom: "8px" }}>• What is VIP membership?</li>
          </ul>
        </div>
        <div
          style={{
            background: "#1e293b",
            padding: "20px",
            borderRadius: "12px",
            border: "1px solid #334155",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.3)",
          }}
        >
          <h3 style={{ fontWeight: "600", color: "#4ade80", marginBottom: "12px", fontSize: "18px" }}>About Orders</h3>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, color: "#cbd5e1", fontSize: "14px" }}>
            <li style={{ marginBottom: "8px" }}>• How do I place an order?</li>
            <li style={{ marginBottom: "8px" }}>• What payment methods?</li>
            <li style={{ marginBottom: "8px" }}>• How do I track my order?</li>
          </ul>
        </div>
        <div
          style={{
            background: "#1e293b",
            padding: "20px",
            borderRadius: "12px",
            border: "1px solid #334155",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.3)",
          }}
        >
          <h3 style={{ fontWeight: "600", color: "#4ade80", marginBottom: "12px", fontSize: "18px" }}>
            Help & Support
          </h3>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, color: "#cbd5e1", fontSize: "14px" }}>
            <li style={{ marginBottom: "8px" }}>• How do I file a complaint?</li>
            <li style={{ marginBottom: "8px" }}>• How does the rating system work?</li>
            <li style={{ marginBottom: "8px" }}>• How do I add deposit?</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default ChatPage
