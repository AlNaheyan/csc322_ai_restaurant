# AI-Enabled Restaurant Order & Delivery System - Implementation Plan

## Table of Contents
1. [Technology Stack](#technology-stack)
2. [Project Structure](#project-structure)
3. [Database Schema Design](#database-schema-design)
4. [Backend Architecture](#backend-architecture)
5. [Frontend Architecture](#frontend-architecture)
6. [AI/LLM Integration](#aillm-integration)
7. [Implementation Phases](#implementation-phases)
8. [Key Features Implementation](#key-features-implementation)
9. [Testing Strategy](#testing-strategy)
10. [Development Timeline](#development-timeline)

---

## 1. Technology Stack

### Backend
- **Framework**: Node.js with Express.js (OR Python with FastAPI)
  - *Recommendation*: Node.js for better real-time capabilities (bidding, notifications)
- **Database**: PostgreSQL (better for complex queries and transactions)
- **ORM**: Sequelize (Node.js) or Prisma (modern alternative)
- **Authentication**: JWT (JSON Web Tokens) + bcrypt for password hashing
- **Real-time**: Socket.io for delivery bidding and notifications
- **LLM Integration**: 
  - Ollama (local) with llama2 or mistral models
  - Hugging Face Inference API as fallback
- **Task Scheduler**: node-cron for daily performance evaluations
- **File Upload**: Multer (for dish images)

### Frontend
- **Framework**: React 18+ with TypeScript
- **State Management**: Redux Toolkit or Zustand
- **Routing**: React Router v6
- **UI Framework**: Tailwind CSS + shadcn/ui components
- **Forms**: React Hook Form + Zod validation
- **HTTP Client**: Axios with interceptors
- **Real-time**: Socket.io-client
- **Charts**: Recharts (for manager analytics)

### DevOps & Tools
- **Version Control**: Git + GitHub
- **Package Manager**: npm or pnpm
- **API Testing**: Postman/Thunder Client
- **Database Migration**: Sequelize migrations
- **Environment**: dotenv for config
- **Logging**: Winston (backend), console (frontend dev)

---

## 2. Project Structure

```
restaurant-system/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js
│   │   │   ├── jwt.js
│   │   │   └── llm.js
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Customer.js
│   │   │   ├── Employee.js
│   │   │   ├── MenuItem.js
│   │   │   ├── Order.js
│   │   │   ├── OrderItem.js
│   │   │   ├── DeliveryBid.js
│   │   │   ├── Rating.js
│   │   │   ├── Complaint.js
│   │   │   ├── Warning.js
│   │   │   ├── Transaction.js
│   │   │   ├── KnowledgeBaseArticle.js
│   │   │   ├── ChatMessage.js
│   │   │   ├── DiscussionTopic.js
│   │   │   └── DiscussionPost.js
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── customerController.js
│   │   │   ├── menuController.js
│   │   │   ├── orderController.js
│   │   │   ├── deliveryController.js
│   │   │   ├── ratingController.js
│   │   │   ├── complaintController.js
│   │   │   ├── chatController.js
│   │   │   ├── managerController.js
│   │   │   └── employeeController.js
│   │   ├── services/
│   │   │   ├── authService.js
│   │   │   ├── customerService.js
│   │   │   ├── vipService.js
│   │   │   ├── orderService.js
│   │   │   ├── deliveryService.js
│   │   │   ├── ratingService.js
│   │   │   ├── complaintService.js
│   │   │   ├── performanceService.js
│   │   │   ├── knowledgeBaseService.js
│   │   │   ├── llmService.js
│   │   │   └── notificationService.js
│   │   ├── middleware/
│   │   │   ├── auth.js
│   │   │   ├── roleCheck.js
│   │   │   ├── validation.js
│   │   │   └── errorHandler.js
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── customers.js
│   │   │   ├── menu.js
│   │   │   ├── orders.js
│   │   │   ├── delivery.js
│   │   │   ├── ratings.js
│   │   │   ├── complaints.js
│   │   │   ├── chat.js
│   │   │   ├── manager.js
│   │   │   └── employees.js
│   │   ├── utils/
│   │   │   ├── validators.js
│   │   │   ├── helpers.js
│   │   │   └── constants.js
│   │   ├── jobs/
│   │   │   ├── performanceEvaluation.js
│   │   │   └── vipUpgrade.js
│   │   └── app.js
│   ├── migrations/
│   ├── seeders/
│   ├── tests/
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
├── frontend/
│   ├── public/
│   │   └── images/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── Navbar.tsx
│   │   │   │   ├── Footer.tsx
│   │   │   │   ├── LoadingSpinner.tsx
│   │   │   │   └── ErrorBoundary.tsx
│   │   │   ├── auth/
│   │   │   │   ├── LoginForm.tsx
│   │   │   │   ├── RegisterForm.tsx
│   │   │   │   └── ProtectedRoute.tsx
│   │   │   ├── menu/
│   │   │   │   ├── MenuList.tsx
│   │   │   │   ├── MenuItem.tsx
│   │   │   │   ├── MenuFilters.tsx
│   │   │   │   └── Cart.tsx
│   │   │   ├── chat/
│   │   │   │   ├── ChatBox.tsx
│   │   │   │   └── ChatMessage.tsx
│   │   │   ├── customer/
│   │   │   │   ├── Dashboard.tsx
│   │   │   │   ├── OrderHistory.tsx
│   │   │   │   ├── DepositManagement.tsx
│   │   │   │   └── RatingForm.tsx
│   │   │   ├── delivery/
│   │   │   │   ├── DeliveryDashboard.tsx
│   │   │   │   ├── BiddingInterface.tsx
│   │   │   │   └── OrderStatusUpdate.tsx
│   │   │   └── manager/
│   │   │       ├── ManagerDashboard.tsx
│   │   │       ├── RegistrationApproval.tsx
│   │   │       ├── ComplaintManagement.tsx
│   │   │       ├── PerformanceReview.tsx
│   │   │       └── DeliveryAssignment.tsx
│   │   ├── pages/
│   │   │   ├── HomePage.tsx
│   │   │   ├── MenuPage.tsx
│   │   │   ├── CheckoutPage.tsx
│   │   │   ├── CustomerDashboardPage.tsx
│   │   │   ├── DeliveryDashboardPage.tsx
│   │   │   ├── ManagerDashboardPage.tsx
│   │   │   └── NotFoundPage.tsx
│   │   ├── store/
│   │   │   ├── slices/
│   │   │   │   ├── authSlice.ts
│   │   │   │   ├── menuSlice.ts
│   │   │   │   ├── cartSlice.ts
│   │   │   │   └── orderSlice.ts
│   │   │   └── store.ts
│   │   ├── services/
│   │   │   ├── api.ts
│   │   │   ├── authApi.ts
│   │   │   ├── menuApi.ts
│   │   │   ├── orderApi.ts
│   │   │   └── socket.ts
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   └── useSocket.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── utils/
│   │   │   ├── constants.ts
│   │   │   └── helpers.ts
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
│
├── database/
│   ├── init.sql
│   └── seed.sql
│
└── README.md
```

---

## 3. Database Schema Design

### 3.1 Core Tables

#### Users Table (Base for all user types)
```sql
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL, -- 'visitor', 'customer', 'vip', 'chef', 'delivery', 'manager'
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    is_blacklisted BOOLEAN DEFAULT false,
    blacklist_reason TEXT,
    last_login TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
```

#### Customers Table
```sql
CREATE TABLE customers (
    customer_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    registration_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    rejection_reason TEXT,
    rejection_date TIMESTAMP,
    deposit_balance DECIMAL(10, 2) DEFAULT 0.00,
    total_spent DECIMAL(10, 2) DEFAULT 0.00,
    order_count INTEGER DEFAULT 0,
    warning_count INTEGER DEFAULT 0,
    is_vip BOOLEAN DEFAULT false,
    vip_upgraded_at TIMESTAMP,
    free_delivery_count INTEGER DEFAULT 0, -- Tracks free deliveries used
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_customers_user_id ON customers(user_id);
CREATE INDEX idx_customers_is_vip ON customers(is_vip);
```

#### Employees Table
```sql
CREATE TABLE employees (
    employee_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    employee_type VARCHAR(20) NOT NULL, -- 'chef', 'delivery'
    salary DECIMAL(10, 2) NOT NULL,
    average_rating DECIMAL(3, 2) DEFAULT 0.00,
    total_ratings INTEGER DEFAULT 0,
    complaint_count INTEGER DEFAULT 0,
    compliment_count INTEGER DEFAULT 0,
    demotion_count INTEGER DEFAULT 0,
    hire_date DATE NOT NULL,
    termination_date DATE,
    is_available BOOLEAN DEFAULT true, -- For delivery people
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_employees_user_id ON employees(user_id);
CREATE INDEX idx_employees_type ON employees(employee_type);
```

#### Menu Items Table
```sql
CREATE TABLE menu_items (
    item_id SERIAL PRIMARY KEY,
    chef_id INTEGER REFERENCES employees(employee_id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    image_url VARCHAR(500),
    is_vip_only BOOLEAN DEFAULT false,
    is_available BOOLEAN DEFAULT true,
    average_rating DECIMAL(3, 2) DEFAULT 0.00,
    total_ratings INTEGER DEFAULT 0,
    order_count INTEGER DEFAULT 0, -- For popularity tracking
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_menu_items_chef_id ON menu_items(chef_id);
CREATE INDEX idx_menu_items_vip_only ON menu_items(is_vip_only);
CREATE INDEX idx_menu_items_available ON menu_items(is_available);
```

### 3.2 Order Management Tables

#### Orders Table
```sql
CREATE TABLE orders (
    order_id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES customers(customer_id),
    status VARCHAR(20) NOT NULL, -- 'pending', 'confirmed', 'preparing', 'ready_for_delivery', 'out_for_delivery', 'delivered', 'cancelled'
    subtotal DECIMAL(10, 2) NOT NULL,
    tax DECIMAL(10, 2) NOT NULL,
    delivery_fee DECIMAL(10, 2) NOT NULL,
    discount DECIMAL(10, 2) DEFAULT 0.00,
    total DECIMAL(10, 2) NOT NULL,
    is_free_delivery BOOLEAN DEFAULT false,
    delivery_address TEXT NOT NULL,
    special_instructions TEXT,
    assigned_delivery_person INTEGER REFERENCES employees(employee_id),
    estimated_delivery_time TIMESTAMP,
    actual_delivery_time TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_delivery_person ON orders(assigned_delivery_person);
```

#### Order Items Table
```sql
CREATE TABLE order_items (
    order_item_id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(order_id) ON DELETE CASCADE,
    item_id INTEGER REFERENCES menu_items(item_id),
    quantity INTEGER NOT NULL,
    price_at_order DECIMAL(10, 2) NOT NULL, -- Store price at time of order
    chef_id INTEGER REFERENCES employees(employee_id)
);

CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_item_id ON order_items(item_id);
```

#### Delivery Bids Table
```sql
CREATE TABLE delivery_bids (
    bid_id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(order_id) ON DELETE CASCADE,
    delivery_person_id INTEGER REFERENCES employees(employee_id),
    bid_amount DECIMAL(10, 2) NOT NULL,
    estimated_time INTEGER, -- Minutes
    bid_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'accepted', 'rejected'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(order_id, delivery_person_id)
);

CREATE INDEX idx_delivery_bids_order_id ON delivery_bids(order_id);
CREATE INDEX idx_delivery_bids_delivery_person ON delivery_bids(delivery_person_id);
```

#### Manager Memos Table (for bid overrides)
```sql
CREATE TABLE manager_memos (
    memo_id SERIAL PRIMARY KEY,
    manager_id INTEGER REFERENCES users(user_id),
    reference_type VARCHAR(50), -- 'delivery_bid', 'performance_override', etc.
    reference_id INTEGER, -- ID of the related record
    memo_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 3.3 Rating System Tables

#### Ratings Table
```sql
CREATE TABLE ratings (
    rating_id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(order_id),
    customer_id INTEGER REFERENCES customers(customer_id),
    target_type VARCHAR(20) NOT NULL, -- 'food', 'delivery'
    target_id INTEGER NOT NULL, -- chef_id or delivery_person_id
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    is_vip_rating BOOLEAN DEFAULT false, -- For 2x weight tracking
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(order_id, target_type) -- One rating per order per type
);

CREATE INDEX idx_ratings_target ON ratings(target_type, target_id);
CREATE INDEX idx_ratings_customer ON ratings(customer_id);
```

### 3.4 Reputation System Tables

#### Complaints Table
```sql
CREATE TABLE complaints (
    complaint_id SERIAL PRIMARY KEY,
    filer_id INTEGER REFERENCES users(user_id), -- Who filed it
    subject_id INTEGER REFERENCES users(user_id), -- Who it's against
    subject_type VARCHAR(20) NOT NULL, -- 'chef', 'delivery', 'customer'
    complaint_type VARCHAR(20) NOT NULL, -- 'compliment', 'complaint'
    category VARCHAR(50), -- 'quality', 'behavior', 'delivery_issue', etc.
    description TEXT NOT NULL,
    evidence_url VARCHAR(500), -- Optional proof/screenshot
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'under_review', 'resolved', 'dismissed'
    manager_decision VARCHAR(20), -- 'upheld', 'dismissed'
    manager_notes TEXT,
    resolved_by INTEGER REFERENCES users(user_id),
    resolved_at TIMESTAMP,
    is_vip_complaint BOOLEAN DEFAULT false, -- 2x weight
    is_disputed BOOLEAN DEFAULT false,
    dispute_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_complaints_filer ON complaints(filer_id);
CREATE INDEX idx_complaints_subject ON complaints(subject_id);
CREATE INDEX idx_complaints_status ON complaints(status);
```

#### Warnings Table
```sql
CREATE TABLE warnings (
    warning_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id),
    warning_type VARCHAR(50) NOT NULL, -- 'complaint_upheld', 'insufficient_balance', 'false_complaint'
    source VARCHAR(50), -- 'complaint', 'system', 'manager'
    reason TEXT NOT NULL,
    issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

CREATE INDEX idx_warnings_user_id ON warnings(user_id);
CREATE INDEX idx_warnings_active ON warnings(is_active);
```

### 3.5 Transaction Tables

#### Transactions Table
```sql
CREATE TABLE transactions (
    transaction_id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES customers(customer_id),
    transaction_type VARCHAR(20) NOT NULL, -- 'deposit', 'order', 'refund'
    amount DECIMAL(10, 2) NOT NULL,
    balance_before DECIMAL(10, 2) NOT NULL,
    balance_after DECIMAL(10, 2) NOT NULL,
    order_id INTEGER REFERENCES orders(order_id),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_transactions_customer ON transactions(customer_id);
CREATE INDEX idx_transactions_type ON transactions(transaction_type);
```

### 3.6 AI/Knowledge Base Tables

#### Knowledge Base Articles Table
```sql
CREATE TABLE knowledge_base_articles (
    article_id SERIAL PRIMARY KEY,
    author_id INTEGER REFERENCES users(user_id),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(50), -- 'dish', 'restaurant', 'policy', etc.
    is_active BOOLEAN DEFAULT true,
    is_manager_approved BOOLEAN DEFAULT false,
    flag_count INTEGER DEFAULT 0, -- Number of 0-star ratings
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_kb_articles_category ON knowledge_base_articles(category);
CREATE INDEX idx_kb_articles_active ON knowledge_base_articles(is_active);
```

#### KB Article Ratings Table
```sql
CREATE TABLE kb_ratings (
    kb_rating_id SERIAL PRIMARY KEY,
    article_id INTEGER REFERENCES knowledge_base_articles(article_id),
    user_id INTEGER REFERENCES users(user_id),
    rating INTEGER CHECK (rating >= 0 AND rating <= 5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(article_id, user_id)
);

CREATE INDEX idx_kb_ratings_article ON kb_ratings(article_id);
```

#### Chat Sessions Table
```sql
CREATE TABLE chat_sessions (
    session_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id),
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP
);
```

#### Chat Messages Table
```sql
CREATE TABLE chat_messages (
    message_id SERIAL PRIMARY KEY,
    session_id INTEGER REFERENCES chat_sessions(session_id),
    sender_type VARCHAR(20) NOT NULL, -- 'user', 'kb', 'llm'
    content TEXT NOT NULL,
    kb_article_id INTEGER REFERENCES knowledge_base_articles(article_id),
    source VARCHAR(50), -- 'knowledge_base', 'llm_ollama', 'llm_huggingface'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_chat_messages_session ON chat_messages(session_id);
```

### 3.7 Discussion Forum Tables

#### Discussion Topics Table
```sql
CREATE TABLE discussion_topics (
    topic_id SERIAL PRIMARY KEY,
    created_by INTEGER REFERENCES users(user_id),
    title VARCHAR(255) NOT NULL,
    category VARCHAR(50), -- 'chef', 'dish', 'delivery', 'general'
    target_type VARCHAR(20), -- 'chef', 'menu_item', 'delivery_person', null
    target_id INTEGER, -- Related entity ID
    is_locked BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_discussion_topics_category ON discussion_topics(category);
```

#### Discussion Posts Table
```sql
CREATE TABLE discussion_posts (
    post_id SERIAL PRIMARY KEY,
    topic_id INTEGER REFERENCES discussion_topics(topic_id) ON DELETE CASCADE,
    author_id INTEGER REFERENCES users(user_id),
    content TEXT NOT NULL,
    is_reported BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_discussion_posts_topic ON discussion_posts(topic_id);
CREATE INDEX idx_discussion_posts_author ON discussion_posts(author_id);
```

### 3.8 Performance Tracking Tables

#### Performance History Table
```sql
CREATE TABLE performance_history (
    history_id SERIAL PRIMARY KEY,
    employee_id INTEGER REFERENCES employees(employee_id),
    evaluation_date DATE NOT NULL,
    average_rating DECIMAL(3, 2),
    complaint_count INTEGER,
    compliment_count INTEGER,
    action_taken VARCHAR(50), -- 'bonus', 'demotion', 'termination', 'none'
    old_salary DECIMAL(10, 2),
    new_salary DECIMAL(10, 2),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_performance_history_employee ON performance_history(employee_id);
```

---

## 4. Backend Architecture

### 4.1 Service Layer Design

#### Auth Service (`authService.js`)
```javascript
class AuthService {
  async registerVisitor(userData)
  async login(email, password)
  async logout(userId)
  async verifyToken(token)
  async changePassword(userId, oldPassword, newPassword)
  async resetPassword(email)
}
```

#### Customer Service (`customerService.js`)
```javascript
class CustomerService {
  async getCustomerProfile(userId)
  async updateProfile(userId, updates)
  async getDepositBalance(customerId)
  async addDeposit(customerId, amount)
  async getTransactionHistory(customerId, filters)
  async getOrderHistory(customerId, filters)
  async getWarnings(customerId)
}
```

#### VIP Service (`vipService.js`)
```javascript
class VIPService {
  async checkVIPEligibility(customerId)
  async upgradeToVIP(customerId)
  async downgradeFromVIP(customerId, reason)
  async applyVIPDiscount(customerId, orderTotal)
  async checkFreeDeliveryEligibility(customerId)
  async trackFreeDeliveryUsage(customerId)
}
```

#### Order Service (`orderService.js`)
```javascript
class OrderService {
  async createOrder(customerId, orderData)
  async getOrder(orderId)
  async updateOrderStatus(orderId, status)
  async cancelOrder(orderId, reason)
  async calculateOrderTotal(items, customerId)
  async validateOrderBalance(customerId, orderTotal)
  async getCustomerOrders(customerId, filters)
  async getChefOrders(chefId, filters)
}
```

#### Delivery Service (`deliveryService.js`)
```javascript
class DeliveryService {
  async notifyAvailableDeliveryPeople(orderId)
  async submitBid(deliveryPersonId, orderId, bidData)
  async getBidsForOrder(orderId)
  async assignDelivery(orderId, deliveryPersonId, managerId, justification)
  async updateDeliveryStatus(orderId, status)
  async getDeliveryPersonOrders(deliveryPersonId, filters)
  async trackDelivery(orderId) // Optional GPS feature
}
```

#### Rating Service (`ratingService.js`)
```javascript
class RatingService {
  async submitRating(customerId, orderId, ratingData)
  async calculateAverageRating(targetId, targetType)
  async getEmployeeRatings(employeeId, filters)
  async getMenuItemRatings(itemId)
  async checkDuplicateRating(orderId, targetType)
  async flagAbusePattern(customerId)
}
```

#### Complaint Service (`complaintService.js`)
```javascript
class ComplaintService {
  async fileComplaint(filerId, complaintData)
  async getComplaint(complaintId)
  async getPendingComplaints(managerId)
  async reviewComplaint(complaintId, managerId, decision)
  async disputeComplaint(complaintId, userId, disputeNotes)
  async resolveDispute(complaintId, managerId, finalDecision)
  async applyConsequences(complaintId)
  async cancelComplaintWithCompliment(userId, complaintId, complimentId)
}
```

#### Performance Service (`performanceService.js`)
```javascript
class PerformanceService {
  async evaluateEmployee(employeeId)
  async suggestPromotion(employeeId)
  async suggestDemotion(employeeId)
  async applyBonus(employeeId, amount, reason)
  async applyDemotion(employeeId, newSalary, reason)
  async terminateEmployee(employeeId, reason)
  async runDailyEvaluation() // Cron job
  async getPerformanceHistory(employeeId)
}
```

#### Knowledge Base Service (`knowledgeBaseService.js`)
```javascript
class KnowledgeBaseService {
  async searchKnowledgeBase(query)
  async getArticle(articleId)
  async createArticle(authorId, articleData)
  async rateArticle(userId, articleId, rating)
  async flagArticle(articleId)
  async reviewFlaggedArticles(managerId)
  async removeArticle(articleId, managerId)
  async blockAuthor(authorId, managerId)
}
```

#### LLM Service (`llmService.js`)
```javascript
class LLMService {
  async queryLLM(question, context)
  async queryOllama(question)
  async queryHuggingFace(question)
  async generateResponse(question)
  async logInteraction(userId, question, answer, source)
}
```

#### Notification Service (`notificationService.js`)
```javascript
class NotificationService {
  async sendEmail(userId, subject, body)
  async sendInAppNotification(userId, message)
  async notifyNewOrder(chefId, orderId)
  async notifyDeliveryBidding(deliveryPersonIds, orderId)
  async notifyOrderStatus(customerId, orderId, status)
  async notifyComplaintResolution(userId, complaintId)
  async notifyVIPUpgrade(customerId)
  async notifyWarning(userId, warningId)
}
```

### 4.2 API Endpoints Structure

#### Authentication Routes (`/api/auth`)
```
POST   /auth/register              - Register new visitor
POST   /auth/login                 - Login user
POST   /auth/logout                - Logout user
GET    /auth/me                    - Get current user info
PUT    /auth/password              - Change password
POST   /auth/forgot-password       - Request password reset
```

#### Customer Routes (`/api/customers`)
```
GET    /customers/me               - Get own profile
PUT    /customers/me               - Update own profile
GET    /customers/me/balance       - Get deposit balance
POST   /customers/me/deposit       - Add deposit
GET    /customers/me/transactions  - Get transaction history
GET    /customers/me/orders        - Get order history
GET    /customers/me/warnings      - Get warnings
```

#### Menu Routes (`/api/menu`)
```
GET    /menu                       - Get all menu items (with filters)
GET    /menu/:id                   - Get single menu item
GET    /menu/recommended           - Get personalized recommendations
GET    /menu/popular               - Get most popular items
GET    /menu/top-rated             - Get highest rated items
GET    /menu/vip-exclusive         - Get VIP-only items (auth required)
```

#### Order Routes (`/api/orders`)
```
POST   /orders                     - Create new order
GET    /orders/:id                 - Get order details
PUT    /orders/:id/cancel          - Cancel order
GET    /orders/my-orders           - Get customer's orders
POST   /orders/:id/rate            - Rate food and delivery
```

#### Delivery Routes (`/api/delivery`)
```
GET    /delivery/available         - Get available orders for bidding
POST   /delivery/bid               - Submit delivery bid
GET    /delivery/my-bids           - Get delivery person's bids
GET    /delivery/my-deliveries     - Get assigned deliveries
PUT    /delivery/:id/status        - Update delivery status
```

#### Manager Routes (`/api/manager`)
```
GET    /manager/registrations      - Get pending registrations
PUT    /manager/registrations/:id  - Approve/reject registration
GET    /manager/complaints         - Get pending complaints
PUT    /manager/complaints/:id     - Review complaint
GET    /manager/delivery-bids/:orderId - Get bids for order
POST   /manager/assign-delivery    - Assign delivery with justification
GET    /manager/performance        - Get employee performance data
POST   /manager/performance/action - Apply bonus/demotion/termination
GET    /manager/kb-flags           - Get flagged KB articles
PUT    /manager/kb-flags/:id       - Review flagged article
```

#### Chat Routes (`/api/chat`)
```
POST   /chat/ask                   - Ask question (KB + LLM)
GET    /chat/history               - Get chat history
POST   /chat/rate-answer           - Rate KB answer
```

#### Discussion Routes (`/api/discussions`)
```
GET    /discussions                - Get all topics
POST   /discussions                - Create new topic
GET    /discussions/:id            - Get topic with posts
POST   /discussions/:id/posts      - Add post to topic
PUT    /discussions/:id/lock       - Lock topic (manager only)
POST   /discussions/posts/:id/report - Report inappropriate post
```

#### Rating Routes (`/api/ratings`)
```
POST   /ratings                    - Submit rating
GET    /ratings/chef/:id           - Get chef ratings
GET    /ratings/delivery/:id       - Get delivery person ratings
GET    /ratings/item/:id           - Get menu item ratings
```

#### Complaint Routes (`/api/complaints`)
```
POST   /complaints                 - File complaint/compliment
GET    /complaints/:id             - Get complaint details
GET    /complaints/my-complaints   - Get user's complaints
POST   /complaints/:id/dispute     - Dispute complaint
```

### 4.3 Middleware Structure

#### Authentication Middleware
```javascript
// middleware/auth.js
const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findByPk(decoded.userId);
    if (!req.user || !req.user.is_active) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};
```

#### Role-Based Access Control
```javascript
// middleware/roleCheck.js
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};
```

#### Request Validation
```javascript
// middleware/validation.js
const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    next();
  };
};
```

---

## 5. Frontend Architecture

### 5.1 State Management (Redux Toolkit)

#### Auth Slice
```typescript
// store/slices/authSlice.ts
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (state, action) => { /* ... */ },
    logout: (state) => { /* ... */ },
    updateProfile: (state, action) => { /* ... */ },
  },
});
```

#### Menu Slice
```typescript
// store/slices/menuSlice.ts
interface MenuState {
  items: MenuItem[];
  filters: MenuFilters;
  loading: boolean;
  error: string | null;
}
```

#### Cart Slice
```typescript
// store/slices/cartSlice.ts
interface CartState {
  items: CartItem[];
  total: number;
  discount: number;
  deliveryFee: number;
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => { /* ... */ },
    removeFromCart: (state, action) => { /* ... */ },
    updateQuantity: (state, action) => { /* ... */ },
    clearCart: (state) => { /* ... */ },
    calculateTotal: (state) => { /* ... */ },
  },
});
```

### 5.2 Component Structure

#### Protected Routes
```typescript
// components/auth/ProtectedRoute.tsx
const ProtectedRoute = ({ allowedRoles, children }) => {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" />;
  }
  
  return children;
};
```

#### Menu Components
```typescript
// components/menu/MenuList.tsx
const MenuList = () => {
  // Fetch menu items
  // Apply filters
  // Display personalized recommendations for logged-in users
  // Show VIP-only items for VIP users
  // Render menu items grid
};
```

#### Chat Component
```typescript
// components/chat/ChatBox.tsx
const ChatBox = () => {
  // Send question to backend
  // Display response from KB or LLM
  // Show rating interface if response from KB
  // Handle 0-star rating (flag)
};
```

### 5.3 API Integration

#### Axios Configuration
```typescript
// services/api.ts
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  timeout: 10000,
});

// Request interceptor (add auth token)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor (handle errors)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth and redirect to login
    }
    return Promise.reject(error);
  }
);
```

### 5.4 Socket.io Integration

#### Socket Service
```typescript
// services/socket.ts
import io from 'socket.io-client';

class SocketService {
  socket: Socket;

  connect(userId: number) {
    this.socket = io(process.env.REACT_APP_SOCKET_URL, {
      auth: { userId }
    });
    
    this.socket.on('new-order', this.handleNewOrder);
    this.socket.on('bid-update', this.handleBidUpdate);
    this.socket.on('delivery-assigned', this.handleDeliveryAssignment);
    this.socket.on('status-update', this.handleStatusUpdate);
  }

  submitBid(orderId: number, bidData: any) {
    this.socket.emit('submit-bid', { orderId, bidData });
  }

  disconnect() {
    this.socket.disconnect();
  }
}
```

---

## 6. AI/LLM Integration

### 6.1 Knowledge Base Search

#### Search Algorithm
```javascript
// services/knowledgeBaseService.js
async searchKnowledgeBase(query) {
  // 1. Tokenize and clean query
  const cleanQuery = this.cleanQuery(query);
  
  // 2. Full-text search in KB articles
  const results = await KnowledgeBaseArticle.findAll({
    where: {
      is_active: true,
      [Op.or]: [
        { title: { [Op.iLike]: `%${cleanQuery}%` } },
        { content: { [Op.iLike]: `%${cleanQuery}%` } }
      ]
    },
    limit: 5,
    order: [['created_at', 'DESC']]
  });
  
  // 3. Rank by relevance (simple scoring)
  const scoredResults = results.map(article => ({
    article,
    score: this.calculateRelevanceScore(query, article)
  }));
  
  // 4. Return top result if score > threshold
  const topResult = scoredResults.sort((a, b) => b.score - a.score)[0];
  
  if (topResult && topResult.score > 0.6) {
    return {
      found: true,
      source: 'knowledge_base',
      article: topResult.article,
      answer: topResult.article.content
    };
  }
  
  return { found: false };
}
```

### 6.2 LLM Integration

#### Ollama Integration
```javascript
// services/llmService.js
async queryOllama(question) {
  try {
    const response = await axios.post('http://localhost:11434/api/generate', {
      model: 'llama2', // or mistral
      prompt: this.buildPrompt(question),
      stream: false,
      options: {
        temperature: 0.7,
        max_tokens: 500
      }
    });
    
    return {
      success: true,
      answer: response.data.response,
      source: 'llm_ollama'
    };
  } catch (error) {
    console.error('Ollama error:', error);
    return { success: false, error: error.message };
  }
}
```

#### Hugging Face Fallback
```javascript
async queryHuggingFace(question) {
  try {
    const response = await axios.post(
      'https://api-inference.huggingface.co/models/google/flan-t5-base',
      { inputs: this.buildPrompt(question) },
      {
        headers: {
          'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`
        }
      }
    );
    
    return {
      success: true,
      answer: response.data[0].generated_text,
      source: 'llm_huggingface'
    };
  } catch (error) {
    console.error('Hugging Face error:', error);
    return { success: false, error: error.message };
  }
}
```

#### Unified Query Method
```javascript
async generateResponse(question) {
  // 1. Try knowledge base first
  const kbResult = await knowledgeBaseService.searchKnowledgeBase(question);
  
  if (kbResult.found) {
    return {
      answer: kbResult.answer,
      source: 'knowledge_base',
      articleId: kbResult.article.article_id,
      requiresRating: true
    };
  }
  
  // 2. Try Ollama
  const ollamaResult = await this.queryOllama(question);
  if (ollamaResult.success) {
    return {
      answer: ollamaResult.answer,
      source: 'llm_ollama',
      requiresRating: false
    };
  }
  
  // 3. Fallback to Hugging Face
  const hfResult = await this.queryHuggingFace(question);
  if (hfResult.success) {
    return {
      answer: hfResult.answer,
      source: 'llm_huggingface',
      requiresRating: false
    };
  }
  
  // 4. All failed
  return {
    answer: 'I apologize, but I am unable to answer your question at this time. Please contact our manager for assistance.',
    source: 'fallback',
    requiresRating: false,
    error: true
  };
}
```

#### Context-Aware Prompts
```javascript
buildPrompt(question) {
  const systemContext = `You are a helpful assistant for a restaurant. 
You can answer questions about our menu, restaurant policies, and services.
Be concise and friendly. If you don't know the answer, say so.`;

  return `${systemContext}\n\nQuestion: ${question}\n\nAnswer:`;
}
```

---

## 7. Implementation Phases

### Phase 1: Foundation (Week 1-2)
**Goal**: Set up project infrastructure and core functionality

**Backend Tasks**:
- [ ] Initialize Node.js/Express project
- [ ] Set up PostgreSQL database
- [ ] Create database schema with migrations
- [ ] Implement User, Customer, Employee models
- [ ] Build authentication system (JWT)
- [ ] Create basic auth routes (register, login, logout)
- [ ] Set up middleware (auth, error handling)
- [ ] Database seeding script with test data

**Frontend Tasks**:
- [ ] Initialize React project with Vite
- [ ] Set up React Router
- [ ] Configure Redux Toolkit
- [ ] Create auth slice and API integration
- [ ] Build Login/Register pages
- [ ] Create ProtectedRoute component
- [ ] Set up Axios interceptors
- [ ] Basic navigation/layout components

**Deliverables**:
- Working authentication system
- Database with seed data
- Basic routing on frontend
- Auth token management

### Phase 2: Menu & Ordering (Week 3-4)
**Goal**: Implement menu browsing and order placement

**Backend Tasks**:
- [ ] MenuItem model and CRUD operations
- [ ] Menu routes with filtering/sorting
- [ ] Order model and OrderItem model
- [ ] Order creation logic
- [ ] VIP discount calculation
- [ ] Balance verification
- [ ] Transaction logging
- [ ] Free delivery tracking for VIPs

**Frontend Tasks**:
- [ ] Menu listing page with filters
- [ ] MenuItem detail view
- [ ] Shopping cart functionality
- [ ] Cart slice in Redux
- [ ] Checkout page
- [ ] Deposit management page
- [ ] Order history page
- [ ] Personalized recommendations

**Deliverables**:
- Functional menu browsing
- Complete order flow
- Cart management
- VIP discount application
- Deposit system

### Phase 3: Delivery System (Week 5)
**Goal**: Implement delivery bidding and assignment

**Backend Tasks**:
- [ ] DeliveryBid model
- [ ] Socket.io setup for real-time bidding
- [ ] Delivery notification system
- [ ] Bid submission and ranking logic
- [ ] Manager assignment with justification
- [ ] Delivery status updates
- [ ] ManagerMemo model for overrides

**Frontend Tasks**:
- [ ] Delivery person dashboard
- [ ] Bidding interface with Socket.io
- [ ] Manager delivery assignment UI
- [ ] Real-time bid updates
- [ ] Delivery status tracking
- [ ] Order status updates for customers

**Deliverables**:
- Real-time delivery bidding
- Manager assignment interface
- Status tracking system

### Phase 4: Ratings & Reputation (Week 6)
**Goal**: Implement rating and complaint systems

**Backend Tasks**:
- [ ] Rating model and submission
- [ ] Average rating calculation
- [ ] VIP rating weight (2x)
- [ ] Complaint model
- [ ] Complaint filing and review
- [ ] Dispute mechanism
- [ ] Warning system
- [ ] Compliment-complaint cancellation
- [ ] Automated consequence application

**Frontend Tasks**:
- [ ] Rating submission forms
- [ ] Complaint filing interface
- [ ] Manager complaint review dashboard
- [ ] Dispute submission
- [ ] Warning display
- [ ] Rating display on menu/employees

**Deliverables**:
- Complete rating system
- Complaint management
- Warning tracking
- Reputation scoring

### Phase 5: Performance & VIP Management (Week 7)
**Goal**: Implement automated performance evaluation and VIP system

**Backend Tasks**:
- [ ] Performance evaluation service
- [ ] Cron job for daily evaluation
- [ ] VIP eligibility checking
- [ ] Automated VIP upgrade
- [ ] VIP downgrade logic
- [ ] Employee bonus/demotion/termination
- [ ] Performance history tracking
- [ ] Blacklist management

**Frontend Tasks**:
- [ ] Manager performance review dashboard
- [ ] VIP upgrade notifications
- [ ] Performance history view
- [ ] Employee management interface
- [ ] Salary adjustment UI

**Deliverables**:
- Automated performance evaluation
- VIP upgrade system
- Employee management
- Blacklist functionality

### Phase 6: AI/Chat System (Week 8)
**Goal**: Implement knowledge base and LLM integration

**Backend Tasks**:
- [ ] KnowledgeBaseArticle model
- [ ] KB search algorithm
- [ ] Ollama integration
- [ ] Hugging Face fallback
- [ ] Chat session and message models
- [ ] Answer rating system
- [ ] Article flagging (0-star rating)
- [ ] Manager KB review

**Frontend Tasks**:
- [ ] Chat interface component
- [ ] KB article submission
- [ ] Answer rating UI
- [ ] Chat history display
- [ ] Manager KB management
- [ ] Flagged article review

**Deliverables**:
- Working chatbot with KB
- LLM fallback system
- KB contribution system
- Article flagging and review

### Phase 7: Discussion Forum (Week 9)
**Goal**: Implement community discussion features

**Backend Tasks**:
- [ ] DiscussionTopic model
- [ ] DiscussionPost model
- [ ] Topic creation and management
- [ ] Post reporting system
- [ ] Topic locking (manager)
- [ ] Complaint filing from forum

**Frontend Tasks**:
- [ ] Discussion list page
- [ ] Topic detail with posts
- [ ] Post creation interface
- [ ] Report post functionality
- [ ] Manager moderation tools

**Deliverables**:
- Discussion forum
- Moderation system
- Integration with complaints

### Phase 8: Manager Dashboard & Analytics (Week 10)
**Goal**: Build comprehensive manager tools

**Backend Tasks**:
- [ ] Registration approval endpoints
- [ ] Analytics/reporting endpoints
- [ ] Customer statistics
- [ ] Employee statistics
- [ ] Revenue tracking
- [ ] Performance trends

**Frontend Tasks**:
- [ ] Manager dashboard overview
- [ ] Registration approval interface
- [ ] Analytics charts (Recharts)
- [ ] Employee management
- [ ] Customer management
- [ ] Report generation

**Deliverables**:
- Complete manager dashboard
- Analytics and reporting
- Comprehensive admin tools

### Phase 9: Creative Feature (Week 11)
**Goal**: Implement innovative feature (15% of grade)

**Options**:
1. **Image-based Search**: YOLO/DINO for food recognition
2. **Voice Ordering**: Speech-to-text integration
3. **Smart Routing**: Optimized delivery route planning
4. **Predictive Analytics**: ML for demand forecasting
5. **AR Menu**: Augmented reality dish preview

**Recommended**: Smart Routing for Delivery
- Use Google Maps API or OpenRouteService
- Optimize delivery routes for multiple orders
- Estimate accurate delivery times
- Reduce delivery costs

### Phase 10: Testing, Polish & Documentation (Week 12)
**Goal**: Ensure quality and prepare for submission

**Tasks**:
- [ ] Unit tests for critical services
- [ ] Integration tests for API endpoints
- [ ] E2E tests for main user flows
- [ ] Bug fixing and edge case handling
- [ ] Performance optimization
- [ ] UI/UX refinement
- [ ] Code documentation
- [ ] README and deployment guide
- [ ] Video demo preparation

**Deliverables**:
- Test coverage report
- Bug-free application
- Complete documentation
- Demo video

---

## 8. Key Features Implementation

### 8.1 VIP Auto-Upgrade System

```javascript
// services/vipService.js
async checkAndUpgradeVIP(customerId) {
  const customer = await Customer.findByPk(customerId, {
    include: [{ model: User }]
  });
  
  if (customer.is_vip) return; // Already VIP
  
  // Check criteria
  const meetsSpending = customer.total_spent > 100;
  const meetsOrders = customer.order_count >= 3;
  
  // Check for outstanding complaints
  const hasComplaints = await Complaint.count({
    where: {
      subject_id: customer.user_id,
      status: 'pending'
    }
  }) > 0;
  
  if ((meetsSpending || meetsOrders) && !hasComplaints) {
    // Upgrade to VIP
    await customer.update({
      is_vip: true,
      vip_upgraded_at: new Date(),
      free_delivery_count: 0
    });
    
    await notificationService.notifyVIPUpgrade(customerId);
    
    return { upgraded: true, customer };
  }
  
  return { upgraded: false };
}
```

### 8.2 Warning Management System

```javascript
// services/warningService.js
async addWarning(userId, type, reason, source) {
  const warning = await Warning.create({
    user_id: userId,
    warning_type: type,
    reason,
    source
  });
  
  // Count active warnings
  const warningCount = await Warning.count({
    where: { user_id: userId, is_active: true }
  });
  
  const user = await User.findByPk(userId);
  
  // Customer with 3 warnings → terminate
  if (user.role === 'customer' && warningCount >= 3) {
    await this.terminateCustomer(userId);
  }
  
  // VIP with 2 warnings → downgrade
  if (user.role === 'vip' && warningCount >= 2) {
    await vipService.downgradeFromVIP(userId, 'warning_threshold');
  }
  
  // Employee with 3 warnings → terminate
  if (['chef', 'delivery'].includes(user.role) && warningCount >= 3) {
    await performanceService.terminateEmployee(userId, 'warning_threshold');
  }
  
  await notificationService.notifyWarning(userId, warning.warning_id);
  
  return warning;
}

async terminateCustomer(userId) {
  const customer = await Customer.findOne({ where: { user_id: userId } });
  
  // Process refund
  if (customer.deposit_balance > 0) {
    await transactionService.processRefund(customer.customer_id);
  }
  
  // Blacklist and deactivate
  await User.update(
    { is_active: false, is_blacklisted: true, blacklist_reason: 'warning_threshold' },
    { where: { user_id: userId } }
  );
  
  await notificationService.notifyTermination(userId);
}
```

### 8.3 Performance Evaluation (Daily Cron Job)

```javascript
// jobs/performanceEvaluation.js
const cron = require('node-cron');

// Run daily at midnight
cron.schedule('0 0 * * *', async () => {
  console.log('Running daily performance evaluation...');
  
  const employees = await Employee.findAll({
    where: { termination_date: null }
  });
  
  for (const employee of employees) {
    await performanceService.evaluateEmployee(employee.employee_id);
  }
});

// services/performanceService.js
async evaluateEmployee(employeeId) {
  const employee = await Employee.findByPk(employeeId);
  
  // Check for demotion criteria
  if (employee.average_rating < 2 || employee.complaint_count >= 3) {
    await this.suggestDemotion(employeeId);
  }
  
  // Check for bonus criteria
  if (employee.average_rating > 4 || employee.compliment_count >= 3) {
    await this.suggestBonus(employeeId);
  }
  
  // Log evaluation
  await PerformanceHistory.create({
    employee_id: employeeId,
    evaluation_date: new Date(),
    average_rating: employee.average_rating,
    complaint_count: employee.complaint_count,
    compliment_count: employee.compliment_count,
    action_taken: 'evaluated'
  });
}

async applyDemotion(employeeId, newSalary, managerId, notes) {
  const employee = await Employee.findByPk(employeeId);
  const oldSalary = employee.salary;
  
  await employee.update({
    salary: newSalary,
    demotion_count: employee.demotion_count + 1,
    complaint_count: 0 // Reset after action
  });
  
  // Check if should be fired (2 demotions)
  if (employee.demotion_count >= 2) {
    await this.terminateEmployee(employeeId, 'demotion_threshold');
  }
  
  await PerformanceHistory.create({
    employee_id: employeeId,
    evaluation_date: new Date(),
    action_taken: 'demotion',
    old_salary: oldSalary,
    new_salary: newSalary,
    notes
  });
  
  await notificationService.notifyDemotion(employeeId);
}
```

### 8.4 Delivery Bidding System (Real-time)

```javascript
// Backend: Socket.io handling
io.on('connection', (socket) => {
  socket.on('join-delivery-room', (deliveryPersonId) => {
    socket.join(`delivery-${deliveryPersonId}`);
  });
  
  socket.on('submit-bid', async ({ orderId, deliveryPersonId, bidData }) => {
    // Validate and save bid
    const bid = await DeliveryBid.create({
      order_id: orderId,
      delivery_person_id: deliveryPersonId,
      bid_amount: bidData.amount,
      estimated_time: bidData.estimatedTime
    });
    
    // Notify manager of new bid
    io.to('manager-room').emit('new-bid', {
      orderId,
      bid
    });
    
    // Check if bid window should close (3 bids or 5 minutes)
    const bidCount = await DeliveryBid.count({ where: { order_id: orderId } });
    if (bidCount >= 3) {
      io.to('manager-room').emit('bid-window-closed', { orderId });
    }
  });
  
  socket.on('assign-delivery', async ({ orderId, bidId, managerId, justification }) => {
    const bid = await DeliveryBid.findByPk(bidId);
    
    // Check if higher bid was chosen
    const lowestBid = await DeliveryBid.findOne({
      where: { order_id: orderId },
      order: [['bid_amount', 'ASC']]
    });
    
    if (bid.bid_id !== lowestBid.bid_id && !justification) {
      socket.emit('error', { message: 'Justification required for higher bid' });
      return;
    }
    
    // Save justification if higher bid chosen
    if (justification) {
      await ManagerMemo.create({
        manager_id: managerId,
        reference_type: 'delivery_bid',
        reference_id: bidId,
        memo_text: justification
      });
    }
    
    // Assign delivery
    await Order.update(
      { assigned_delivery_person: bid.delivery_person_id },
      { where: { order_id: orderId } }
    );
    
    await bid.update({ bid_status: 'accepted' });
    
    // Notify delivery person
    io.to(`delivery-${bid.delivery_person_id}`).emit('delivery-assigned', {
      orderId,
      bid
    });
    
    // Reject other bids
    await DeliveryBid.update(
      { bid_status: 'rejected' },
      { where: { order_id: orderId, bid_id: { [Op.ne]: bidId } } }
    );
  });
});
```

### 8.5 Rating System with VIP Weight

```javascript
// services/ratingService.js
async submitRating(customerId, orderId, ratingData) {
  const customer = await Customer.findByPk(customerId);
  const order = await Order.findByPk(orderId, {
    include: [OrderItem]
  });
  
  // Prevent duplicate ratings
  const existingRating = await Rating.findOne({
    where: { order_id: orderId, target_type: ratingData.targetType }
  });
  
  if (existingRating) {
    throw new Error('Rating already submitted for this order');
  }
  
  // Create rating
  const rating = await Rating.create({
    order_id: orderId,
    customer_id: customerId,
    target_type: ratingData.targetType, // 'food' or 'delivery'
    target_id: ratingData.targetId,
    rating: ratingData.rating,
    comment: ratingData.comment,
    is_vip_rating: customer.is_vip
  });
  
  // Update average rating with VIP weight
  await this.updateAverageRating(ratingData.targetId, ratingData.targetType);
  
  // Check for abuse pattern (all 1-star)
  if (ratingData.rating === 1) {
    await this.checkAbusePattern(customerId);
  }
  
  // Trigger performance evaluation if threshold crossed
  await performanceService.checkThresholds(ratingData.targetId);
  
  return rating;
}

async updateAverageRating(targetId, targetType) {
  const ratings = await Rating.findAll({
    where: { target_id: targetId, target_type: targetType }
  });
  
  // Calculate weighted average (VIP ratings count 2x)
  let totalWeight = 0;
  let weightedSum = 0;
  
  ratings.forEach(r => {
    const weight = r.is_vip_rating ? 2 : 1;
    weightedSum += r.rating * weight;
    totalWeight += weight;
  });
  
  const avgRating = weightedSum / totalWeight;
  
  // Update employee record
  if (targetType === 'food' || targetType === 'delivery') {
    await Employee.update(
      { 
        average_rating: avgRating.toFixed(2),
        total_ratings: ratings.length
      },
      { where: { employee_id: targetId } }
    );
  }
  // Or menu item
  else if (targetType === 'menu_item') {
    await MenuItem.update(
      { 
        average_rating: avgRating.toFixed(2),
        total_ratings: ratings.length
      },
      { where: { item_id: targetId } }
    );
  }
  
  return avgRating;
}
```

---

## 9. Testing Strategy

### 9.1 Backend Testing

#### Unit Tests (Jest)
```javascript
// tests/services/vipService.test.js
describe('VIPService', () => {
  describe('checkVIPEligibility', () => {
    it('should upgrade customer who spent >$100', async () => {
      const customer = await Customer.create({
        user_id: 1,
        total_spent: 150,
        order_count: 2
      });
      
      const result = await vipService.checkAndUpgradeVIP(customer.customer_id);
      
      expect(result.upgraded).toBe(true);
      expect(result.customer.is_vip).toBe(true);
    });
    
    it('should upgrade customer with 3+ orders', async () => {
      const customer = await Customer.create({
        user_id: 2,
        total_spent: 50,
        order_count: 3
      });
      
      const result = await vipService.checkAndUpgradeVIP(customer.customer_id);
      
      expect(result.upgraded).toBe(true);
    });
    
    it('should not upgrade with pending complaints', async () => {
      const customer = await Customer.create({
        user_id: 3,
        total_spent: 150,
        order_count: 3
      });
      
      await Complaint.create({
        subject_id: customer.user_id,
        status: 'pending'
      });
      
      const result = await vipService.checkAndUpgradeVIP(customer.customer_id);
      
      expect(result.upgraded).toBe(false);
    });
  });
});
```

#### Integration Tests
```javascript
// tests/integration/order.test.js
describe('Order API', () => {
  let authToken;
  
  beforeAll(async () => {
    // Login and get token
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@test.com', password: 'password' });
    
    authToken = response.body.token;
  });
  
  describe('POST /api/orders', () => {
    it('should create order with valid balance', async () => {
      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          items: [{ item_id: 1, quantity: 2 }],
          delivery_address: '123 Main St'
        });
      
      expect(response.status).toBe(201);
      expect(response.body.order).toHaveProperty('order_id');
    });
    
    it('should reject order with insufficient balance', async () => {
      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          items: [{ item_id: 1, quantity: 100 }],
          delivery_address: '123 Main St'
        });
      
      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Insufficient balance');
    });
  });
});
```

### 9.2 Frontend Testing

#### Component Tests (React Testing Library)
```typescript
// tests/components/MenuList.test.tsx
describe('MenuList', () => {
  it('should display menu items', () => {
    const mockItems = [
      { item_id: 1, name: 'Pizza', price: 15.99 },
      { item_id: 2, name: 'Burger', price: 12.99 }
    ];
    
    render(<MenuList items={mockItems} />);
    
    expect(screen.getByText('Pizza')).toBeInTheDocument();
    expect(screen.getByText('Burger')).toBeInTheDocument();
  });
  
  it('should filter VIP items for non-VIP users', () => {
    const mockItems = [
      { item_id: 1, name: 'Pizza', price: 15.99, is_vip_only: false },
      { item_id: 2, name: 'Truffle Pasta', price: 45.99, is_vip_only: true }
    ];
    
    const { container } = render(
      <MenuList items={mockItems} user={{ is_vip: false }} />
    );
    
    expect(screen.getByText('Pizza')).toBeInTheDocument();
    expect(screen.queryByText('Truffle Pasta')).not.toBeInTheDocument();
  });
});
```

#### E2E Tests (Playwright/Cypress)
```javascript
// e2e/order-flow.spec.js
describe('Complete Order Flow', () => {
  it('should allow customer to place order', () => {
    // Login
    cy.visit('/login');
    cy.get('[data-testid=email]').type('customer@test.com');
    cy.get('[data-testid=password]').type('password');
    cy.get('[data-testid=submit]').click();
    
    // Browse menu
    cy.visit('/menu');
    cy.get('[data-testid=menu-item-1]').click();
    cy.get('[data-testid=add-to-cart]').click();
    
    // Checkout
    cy.get('[data-testid=cart-icon]').click();
    cy.get('[data-testid=checkout]').click();
    
    // Fill address
    cy.get('[data-testid=address]').type('123 Main St');
    cy.get('[data-testid=place-order]').click();
    
    // Verify success
    cy.contains('Order placed successfully').should('be.visible');
  });
});
```

### 9.3 Test Coverage Goals
- **Backend**: >80% code coverage
- **Frontend**: >70% code coverage
- **E2E**: Cover all critical user flows

---

## 10. Development Timeline

### Weeks 1-2: Foundation
- Project setup
- Database design
- Authentication
- Basic routing

### Weeks 3-4: Core Features
- Menu system
- Order placement
- Deposit management
- Transaction tracking

### Weeks 5-6: Advanced Features
- Delivery bidding
- Rating system
- Complaint management
- Warning system

### Weeks 7-8: Automation
- Performance evaluation
- VIP auto-upgrade
- AI/LLM integration
- Knowledge base

### Weeks 9-10: Additional Features
- Discussion forum
- Manager dashboard
- Analytics
- Reporting

### Week 11: Creative Feature
- Implementation of chosen creative feature
- Integration with main system
- Testing and refinement

### Week 12: Final Polish
- Testing
- Bug fixes
- Documentation
- Demo preparation
- Deployment

---

## Additional Recommendations

### 1. Code Organization
- Use consistent naming conventions (camelCase for JS, PascalCase for React components)
- Keep functions small and focused (single responsibility)
- Add JSDoc comments for complex functions
- Use environment variables for all config

### 2. Error Handling
- Always use try-catch in async functions
- Return consistent error response format
- Log errors properly (Winston on backend)
- Show user-friendly error messages on frontend

### 3. Security Best Practices
- Hash passwords with bcrypt (salt rounds: 10)
- Validate all user inputs
- Use parameterized queries (prevent SQL injection)
- Implement rate limiting on auth endpoints
- Set appropriate CORS policies
- Use HTTPS in production

### 4. Performance Optimization
- Use database indexes on frequently queried fields
- Implement pagination for large data sets
- Cache frequently accessed data (Redis optional)
- Optimize images (compress, use appropriate formats)
- Lazy load components on frontend
- Use React.memo for expensive components

### 5. Git Workflow
- Create feature branches (feature/menu-system)
- Write meaningful commit messages
- Do code reviews before merging
- Keep main branch stable
- Tag releases (v1.0.0, v1.1.0)

### 6. Documentation
- README with setup instructions
- API documentation (Swagger/Postman collection)
- Database schema diagram
- Architecture overview diagram
- Component hierarchy diagram
- Deployment guide

---

## Success Criteria

✅ All 10 use cases fully implemented
✅ All functional requirements met
✅ All non-functional requirements met (performance, security)
✅ Exception scenarios handled gracefully
✅ Creative feature successfully integrated
✅ Comprehensive testing (unit, integration, E2E)
✅ Clean, well-documented code
✅ Working demo with seed data
✅ Complete documentation

---

This implementation plan provides a comprehensive roadmap for building your restaurant system. Follow it phase by phase, and you'll have a robust, feature-complete application ready for submission!
