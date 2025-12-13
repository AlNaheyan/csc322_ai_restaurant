# Beaver Eats

A full-stack web application for restaurant order management featuring AI-powered customer support, real-time delivery bidding, automated performance evaluation, and comprehensive user role management.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Setup](#environment-setup)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [User Roles](#user-roles)
- [Project Structure](#project-structure)
- [Key Features Explained](#key-features-explained)
- [API Endpoints](#api-endpoints)
- [Testing](#testing)
- [Contributing](#contributing)

## Overview

This is a comprehensive restaurant management system built for CSC322 that enables customers to browse menus, place orders, and interact with an AI chatbot. The system features a unique delivery bidding mechanism, automated employee performance evaluation, VIP customer management, and community discussion forums.

## Features

### Core Functionality

- **User Authentication & Authorization**: JWT-based auth with role-based access control
- **Multi-Role System**: Visitor, Customer, VIP, Chef, Delivery Person, Manager
- **Menu Management**: Browse dishes with filtering, sorting, and personalized recommendations
- **Order System**: Full cart and checkout flow with deposit-based payments
- **AI Chatbot**: Knowledge base search with LLM fallback for customer queries
- **Real-time Delivery Bidding**: Delivery personnel bid on orders with Socket.io
- **Rating System**: Weighted ratings (VIP ratings count 2x)
- **Complaint Management**: File complaints/compliments with manager review
- **Discussion Forum**: Community discussions about dishes, chefs, and the restaurant
- **Performance Tracking**: Automated daily evaluation of employees
- **VIP Auto-Upgrade**: Automatic promotion based on spending or order count

### Advanced Features

- **Manager Dashboard**: Registration approvals, complaint reviews, performance actions
- **Chef Dashboard**: Manage menu items, view orders, track performance
- **Delivery Dashboard**: Real-time bidding interface, order tracking
- **Knowledge Base**: User-contributed articles with rating system
- **Warning System**: Automated warnings leading to demotions or terminations
- **Transaction History**: Complete audit trail of all financial transactions
- **Analytics**: Revenue tracking, customer statistics, employee performance metrics

## Tech Stack

### Backend

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Sequelize
- **Authentication**: JWT (jsonwebtoken) + bcrypt
- **Real-time**: Socket.io
- **Scheduling**: node-cron (daily performance evaluations)
- **Logging**: Winston

### Frontend

- **Framework**: React
- **Build Tool**: Vite
- **State Management**: Redux Toolkit
- **Real-time**: Socket.io-client
- **Icons**: Lucide React

## Prerequisites

Before running this application, ensure you have:

- **Node.js**: v18.x or higher
- **PostgreSQL**: v14.x or higher
- **npm**: v9.x or higher
- **Git**: Latest version

Optional (for AI features):

- Ollama (for local LLM) or Hugging Face API key

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/csc322_ai_restaurant.git
cd csc322_ai_restaurant
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

## Environment Setup

### Backend Environment Variables

Create a `.env` file in the `backend` directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=restaurant_db
DB_USER=your_postgres_user
DB_PASSWORD=your_postgres_password

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRES_IN=7d

# AI/LLM Configuration (Optional)
OLLAMA_URL=http://localhost:11434
HUGGINGFACE_API_KEY=your_huggingface_api_key

# CORS Configuration
CORS_ORIGIN=http://localhost:5173
```

### Frontend Environment Variables

Create a `.env` file in the `frontend` directory:

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

## Database Setup

### 1. Create PostgreSQL Database

```bash
# Login to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE restaurant_db;

# Exit psql
\q
```

### 2. Initialize Database Schema

```bash
# From the project root
psql -U your_postgres_user -d restaurant_db -f database_schema.sql
```

### 3. Seed Database (Optional)

```bash
# Load sample data
psql -U your_postgres_user -d restaurant_db -f seed_data.sql
```

The seed data includes sample users for each role. Default credentials:

- **Manager**: manager@restaurant.com / password123
- **Chef**: chef@restaurant.com / password123
- **Delivery**: delivery@restaurant.com / password123
- **Customer**: customer@restaurant.com / password123

## Running the Application

### Development Mode

**Terminal 1 - Backend:**

```bash
cd backend
npm run dev
```

Server runs on http://localhost:5000

**Terminal 2 - Frontend:**

```bash
cd frontend
npm run dev
```

Frontend runs on http://localhost:5173

### Production Mode

**Backend:**

```bash
cd backend
npm start
```

**Frontend:**

```bash
cd frontend
npm run build
npm run preview
```

## User Roles

### 1. Visitor

- Browse menu (non-VIP items only)
- Register for customer account
- Requires manager approval to become customer

### 2. Customer

- All visitor features
- Place orders (requires deposit balance)
- Rate food and delivery
- File complaints/compliments
- Participate in discussions
- Chat with AI assistant
- View order history
- Manage deposit balance

### 3. VIP Customer

- All customer features
- Access VIP-exclusive menu items
- 10% discount on all orders
- Free delivery (tracked per order)
- Ratings weighted 2x
- Auto-upgraded when: total_spent > $100 OR order_count >= 3

### 4. Chef

- Create and manage menu items
- View orders containing their dishes
- Receive ratings on food quality
- Track performance metrics
- Subject to performance evaluations

### 5. Delivery Person

- Bid on available delivery orders
- View assigned deliveries
- Update delivery status
- Receive ratings on delivery service
- Track performance metrics
- Subject to performance evaluations

### 6. Manager

- Approve/reject customer registrations
- Review and resolve complaints
- Assign delivery orders (with justification for non-lowest bids)
- Conduct performance reviews
- Apply bonuses, demotions, or terminations
- Moderate discussion forums
- Review flagged knowledge base articles
- View comprehensive analytics

## Project Structure

```
csc322_ai_restaurant/
├── backend/
│   ├── src/
│   │   ├── config/          # Database and JWT configuration
│   │   ├── controllers/     # Request handlers
│   │   ├── middleware/      # Auth, role checks, error handling
│   │   ├── models/          # Sequelize models
│   │   ├── routes/          # API route definitions
│   │   ├── services/        # Business logic layer
│   │   ├── utils/           # Helper functions and constants
│   │   └── app.js           # Express app setup
│   ├── server.js            # Server entry point
│   ├── package.json
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable React components
│   │   ├── pages/           # Page-level components
│   │   ├── services/        # API service layer
│   │   ├── store/           # Redux store and slices
│   │   ├── App.jsx          # Main app component
│   │   └── main.jsx         # React entry point
│   ├── package.json
│   └── .env
├── database_schema.sql      # Database schema definition
├── seed_data.sql            # Sample data for testing
├── IMPLEMENTATION_PLAN.md   # Detailed implementation guide
└── README.md                # This file
```

## Key Features Explained

### AI Chatbot

The system uses a three-tier approach for answering customer questions:

1. **Knowledge Base Search**: First checks user-contributed articles
2. **Ollama LLM**: Falls back to local LLM if KB has no answer
3. **Hugging Face API**: Final fallback if Ollama unavailable

Users can rate KB answers; 0-star ratings flag articles for manager review.

### Delivery Bidding System

1. Order placed and marked ready for delivery
2. Available delivery personnel notified via Socket.io
3. Delivery people submit bids (amount + estimated time)
4. Bidding window closes after 3 bids or 5 minutes
5. Manager assigns delivery (must justify if not choosing lowest bid)
6. Justification stored in manager_memos table

### Performance Evaluation

Automated daily cron job evaluates employees:

- **Bonus**: average_rating > 4 OR compliment_count >= 3
- **Demotion**: average_rating < 2 OR complaint_count >= 3
- **Termination**: 2 demotions OR warning_count >= 3

### Warning System

- Customers: 3 warnings → account terminated with refund
- VIPs: 2 warnings → downgraded to regular customer
- Employees: 3 warnings → terminated
- Warnings issued for: upheld complaints, false complaints, insufficient balance

### VIP System

Automatic upgrade when either condition met:

- Total spending exceeds $100
- Completed 3+ orders
- No pending complaints

VIP benefits:

- Access VIP-exclusive menu items
- 10% discount on all orders
- Free delivery tracking
- 2x rating weight

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new visitor
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user info

### Menu

- `GET /api/menu` - Get all menu items (with filters)
- `GET /api/menu/:id` - Get single menu item
- `POST /api/chef/menu` - Create menu item (chef only)
- `PUT /api/chef/menu/:id` - Update menu item (chef only)

### Orders

- `POST /api/orders` - Create new order
- `GET /api/orders/:id` - Get order details
- `GET /api/customer/orders` - Get customer's orders
- `PUT /api/orders/:id/cancel` - Cancel order

### Delivery

- `GET /api/delivery/available` - Get available orders for bidding
- `POST /api/delivery/bid` - Submit delivery bid
- `GET /api/delivery/my-deliveries` - Get assigned deliveries

### Manager

- `GET /api/manager/registrations` - Get pending registrations
- `PUT /api/manager/registrations/:id` - Approve/reject registration
- `GET /api/manager/complaints` - Get pending complaints
- `PUT /api/manager/complaints/:id` - Review complaint
- `POST /api/manager/performance/action` - Apply performance action

### Chat

- `POST /api/chat/ask` - Ask question (KB + LLM)
- `GET /api/chat/history` - Get chat history
- `POST /api/chat/rate` - Rate KB answer

### Discussions

- `GET /api/discussions` - Get all topics
- `POST /api/discussions` - Create new topic
- `GET /api/discussions/:id` - Get topic with posts
- `POST /api/discussions/:id/posts` - Add post to topic

## Testing

### Backend Tests

```bash
cd backend
npm test
```

### Frontend Tests

```bash
cd frontend
npm run test
```

### Run All Tests

```bash
# Backend tests with coverage
cd backend
npm test -- --coverage

# Frontend tests
cd frontend
npm run test
```

## Contributing

This is an academic project for CSC322. For development:

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make your changes
3. Test thoroughly
4. Commit: `git commit -m "Add your feature"`
5. Push: `git push origin feature/your-feature`
6. Create a Pull Request

## Development Notes

- Always run migrations before starting the server
- Use `npm run dev` for development with hot reload
- Socket.io connections require authentication
- VIP status is evaluated after each order
- Performance evaluations run daily at midnight
- All monetary values are in USD with 2 decimal places

## License

This project is created for educational purposes as part of CSC322.

## Support

For issues or questions, please refer to the IMPLEMENTATION_PLAN.md or contact the development team.

---

**Built with** Node.js, React, PostgreSQL, Socket.io, and AI/LLM integration.
