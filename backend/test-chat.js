const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api/chat';

async function testChatAPI() {
  try {
    console.log('=== Testing Chat API ===\n');

    // 1. Create a session
    console.log('1. Creating chat session...');
    const sessionRes = await axios.post(`${BASE_URL}/sessions`);
    const sessionId = sessionRes.data.data.session_id;
    console.log(`✓ Session created: ${sessionId}\n`);

    // 2. Send a message that should match KB (contains keywords: hours, restaurant)
    console.log('2. Sending message: "What are your hours?"');
    const msg1 = await axios.post(`${BASE_URL}/sessions/${sessionId}/messages`, {
      content: 'What are your hours?'
    });
    console.log(`✓ Response source: ${msg1.data.data.source}`);
    console.log(`  Content: ${msg1.data.data.botMessage.content.substring(0, 100)}...\n`);

    // 3. Send another KB query (contains keywords: delivery)
    console.log('3. Sending message: "Tell me about delivery"');
    const msg2 = await axios.post(`${BASE_URL}/sessions/${sessionId}/messages`, {
      content: 'Tell me about delivery'
    });
    console.log(`✓ Response source: ${msg2.data.data.source}`);
    console.log(`  Content: ${msg2.data.data.botMessage.content.substring(0, 100)}...\n`);

    // 4. Rate the message
    console.log('4. Rating the message with 5 stars...');
    const messageId = msg2.data.data.botMessage.message_id;
    await axios.post(`${BASE_URL}/messages/${messageId}/rate`, { rating: 5 });
    console.log(`✓ Message rated successfully\n`);

    // 5. Send a message that won't match KB (should try Ollama or fallback)
    console.log('5. Sending message: "What is the weather today?"');
    const msg3 = await axios.post(`${BASE_URL}/sessions/${sessionId}/messages`, {
      content: 'What is the weather today?'
    });
    console.log(`✓ Response source: ${msg3.data.data.source}`);
    console.log(`  Content: ${msg3.data.data.botMessage.content.substring(0, 100)}...\n`);

    // 6. Get session history
    console.log('6. Getting session history...');
    const history = await axios.get(`${BASE_URL}/sessions/${sessionId}/history`);
    console.log(`✓ History retrieved: ${history.data.data.length} messages\n`);

    // 7. End session
    console.log('7. Ending session...');
    await axios.post(`${BASE_URL}/sessions/${sessionId}/end`);
    console.log(`✓ Session ended\n`);

    console.log('=== All tests passed! ===');
    process.exit(0);
  } catch (error) {
    console.error('Test failed:', error.response?.data || error.message);
    process.exit(1);
  }
}

testChatAPI();
