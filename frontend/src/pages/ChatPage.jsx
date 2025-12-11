import ChatBox from '../components/ChatBox';

const ChatPage = () => {
  return (
    <div style={{ padding: '30px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '10px' }}>Restaurant Assistant</h1>
        <p style={{ color: '#666', fontSize: '16px' }}>
          Get instant answers about our menu, policies, delivery, and more
        </p>
      </div>

      <ChatBox />

      <div style={{ marginTop: '40px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        <div style={{ background: 'linear-gradient(to bottom right, #eff6ff, #dbeafe)', padding: '20px', borderRadius: '12px', border: '1px solid #bfdbfe' }}>
          <h3 style={{ fontWeight: '600', color: '#1e3a8a', marginBottom: '12px', fontSize: '18px' }}>Quick Questions</h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: '#1d4ed8', fontSize: '14px' }}>
            <li style={{ marginBottom: '8px' }}>• What are your hours?</li>
            <li style={{ marginBottom: '8px' }}>• How does delivery work?</li>
            <li style={{ marginBottom: '8px' }}>• What is VIP membership?</li>
          </ul>
        </div>
        <div style={{ background: 'linear-gradient(to bottom right, #f0fdf4, #dcfce7)', padding: '20px', borderRadius: '12px', border: '1px solid #bbf7d0' }}>
          <h3 style={{ fontWeight: '600', color: '#14532d', marginBottom: '12px', fontSize: '18px' }}>About Orders</h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: '#15803d', fontSize: '14px' }}>
            <li style={{ marginBottom: '8px' }}>• How do I place an order?</li>
            <li style={{ marginBottom: '8px' }}>• What payment methods?</li>
            <li style={{ marginBottom: '8px' }}>• How do I track my order?</li>
          </ul>
        </div>
        <div style={{ background: 'linear-gradient(to bottom right, #faf5ff, #f3e8ff)', padding: '20px', borderRadius: '12px', border: '1px solid #e9d5ff' }}>
          <h3 style={{ fontWeight: '600', color: '#581c87', marginBottom: '12px', fontSize: '18px' }}>Help & Support</h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: '#7e22ce', fontSize: '14px' }}>
            <li style={{ marginBottom: '8px' }}>• How do I file a complaint?</li>
            <li style={{ marginBottom: '8px' }}>• How does the rating system work?</li>
            <li style={{ marginBottom: '8px' }}>• How do I add deposit?</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
