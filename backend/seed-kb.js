const { sequelize } = require('./src/config/database');
const { KnowledgeBaseArticle } = require('./src/models');

const articles = [
  {
    title: 'Restaurant Hours',
    content: 'Our restaurant is open Monday to Friday from 11:00 AM to 10:00 PM, and Saturday to Sunday from 10:00 AM to 11:00 PM. We are closed on major holidays.',
    category: 'general'
  },
  {
    title: 'Delivery Information',
    content: 'We offer delivery within a 5-mile radius. Standard delivery fee is $5.00. VIP members get 1 free delivery for every 3 orders. Delivery time typically ranges from 30-45 minutes.',
    category: 'delivery'
  },
  {
    title: 'VIP Membership Benefits',
    content: 'VIP members receive 5% discount on all orders, 1 free delivery for every 3 orders, access to special menu items, and their ratings count twice as much as regular customers. You become a VIP by spending over $100 or making 3 orders without outstanding complaints.',
    category: 'vip'
  },
  {
    title: 'Payment and Deposits',
    content: 'All customers must maintain a deposit in their account. Orders are automatically deducted from your deposit balance. You can add funds through your dashboard. Minimum deposit is $10.',
    category: 'payment'
  },
  {
    title: 'Rating System',
    content: 'You can rate both food quality (chef) and delivery service separately on a scale of 1-5 stars after each order. Your feedback helps us maintain quality and recognize excellent service.',
    category: 'ratings'
  },
  {
    title: 'How to File a Complaint',
    content: 'If you have any issues, you can file a complaint through your order history. Our manager will review all complaints within 24-48 hours. You can also dispute complaints filed against you.',
    category: 'complaints'
  },
  {
    title: 'Menu and Dietary Information',
    content: 'Our chefs create diverse menus with vegetarian, vegan, and gluten-free options. Check each dish description for dietary information. You can filter menu items by dietary preferences.',
    category: 'menu'
  },
  {
    title: 'Account Registration',
    content: 'Visitors can apply to become registered customers. The manager will review and approve your registration. Once approved, you can place orders and access all customer features.',
    category: 'registration'
  }
];

async function seedKnowledgeBase() {
  try {
    await sequelize.authenticate();
    console.log('Database connected');

    await KnowledgeBaseArticle.destroy({ where: {} });
    console.log('Cleared existing articles');

    await KnowledgeBaseArticle.bulkCreate(articles);
    console.log(`Seeded ${articles.length} knowledge base articles`);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding knowledge base:', error);
    process.exit(1);
  }
}

seedKnowledgeBase();
