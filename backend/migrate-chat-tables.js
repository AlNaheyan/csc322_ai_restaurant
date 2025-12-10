const { sequelize } = require('./src/config/database');
const { KnowledgeBaseArticle, ChatSession, ChatMessage } = require('./src/models');

async function migrateChatTables() {
  try {
    await sequelize.authenticate();
    console.log('Database connected');

    // Drop existing tables in reverse dependency order
    await sequelize.query('DROP TABLE IF EXISTS chat_messages CASCADE;');
    console.log('Dropped chat_messages table');

    await sequelize.query('DROP TABLE IF EXISTS chat_sessions CASCADE;');
    console.log('Dropped chat_sessions table');

    await sequelize.query('DROP TABLE IF EXISTS knowledge_base_articles CASCADE;');
    console.log('Dropped knowledge_base_articles table');

    // Sync models to create fresh tables with all columns
    await KnowledgeBaseArticle.sync({ force: true });
    console.log('Created knowledge_base_articles table');

    await ChatSession.sync({ force: true });
    console.log('Created chat_sessions table');

    await ChatMessage.sync({ force: true });
    console.log('Created chat_messages table');

    console.log('Migration complete!');
    process.exit(0);
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  }
}

migrateChatTables();
