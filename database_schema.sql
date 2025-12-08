-- Restaurant System Database Schema
-- PostgreSQL

-- Drop existing tables (in reverse order of dependencies)
DROP TABLE IF EXISTS performance_history CASCADE;

DROP TABLE IF EXISTS discussion_posts CASCADE;

DROP TABLE IF EXISTS discussion_topics CASCADE;

DROP TABLE IF EXISTS chat_messages CASCADE;

DROP TABLE IF EXISTS chat_sessions CASCADE;

DROP TABLE IF EXISTS kb_ratings CASCADE;

DROP TABLE IF EXISTS knowledge_base_articles CASCADE;

DROP TABLE IF EXISTS transactions CASCADE;

DROP TABLE IF EXISTS warnings CASCADE;

DROP TABLE IF EXISTS complaints CASCADE;

DROP TABLE IF EXISTS ratings CASCADE;

DROP TABLE IF EXISTS manager_memos CASCADE;

DROP TABLE IF EXISTS delivery_bids CASCADE;

DROP TABLE IF EXISTS order_items CASCADE;

DROP TABLE IF EXISTS orders CASCADE;

DROP TABLE IF EXISTS menu_items CASCADE;

DROP TABLE IF EXISTS employees CASCADE;

DROP TABLE IF EXISTS customers CASCADE;

DROP TABLE IF EXISTS users CASCADE;

-- Enable UUID extension (optional, if you want to use UUIDs)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (base for all user types)
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (
        role IN (
            'visitor',
            'customer',
            'vip',
            'chef',
            'delivery',
            'manager'
        )
    ),
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

CREATE INDEX idx_users_email ON users (email);

CREATE INDEX idx_users_role ON users (role);

CREATE INDEX idx_users_active ON users (is_active);

-- Customers table
CREATE TABLE customers (
    customer_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users (user_id) ON DELETE CASCADE,
    registration_status VARCHAR(20) DEFAULT 'pending' CHECK (
        registration_status IN (
            'pending',
            'approved',
            'rejected'
        )
    ),
    rejection_reason TEXT,
    rejection_date TIMESTAMP,
    deposit_balance DECIMAL(10, 2) DEFAULT 0.00 CHECK (deposit_balance >= 0),
    total_spent DECIMAL(10, 2) DEFAULT 0.00 CHECK (total_spent >= 0),
    order_count INTEGER DEFAULT 0 CHECK (order_count >= 0),
    warning_count INTEGER DEFAULT 0 CHECK (warning_count >= 0),
    is_vip BOOLEAN DEFAULT false,
    vip_upgraded_at TIMESTAMP,
    free_delivery_count INTEGER DEFAULT 0 CHECK (free_delivery_count >= 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id)
);

CREATE INDEX idx_customers_user_id ON customers (user_id);

CREATE INDEX idx_customers_is_vip ON customers (is_vip);

CREATE INDEX idx_customers_status ON customers (registration_status);

-- Employees table
CREATE TABLE employees (
    employee_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users (user_id) ON DELETE CASCADE,
    employee_type VARCHAR(20) NOT NULL CHECK (
        employee_type IN ('chef', 'delivery')
    ),
    salary DECIMAL(10, 2) NOT NULL CHECK (salary >= 0),
    average_rating DECIMAL(3, 2) DEFAULT 0.00 CHECK (
        average_rating >= 0
        AND average_rating <= 5
    ),
    total_ratings INTEGER DEFAULT 0 CHECK (total_ratings >= 0),
    complaint_count INTEGER DEFAULT 0 CHECK (complaint_count >= 0),
    compliment_count INTEGER DEFAULT 0 CHECK (compliment_count >= 0),
    demotion_count INTEGER DEFAULT 0 CHECK (demotion_count >= 0),
    hire_date DATE NOT NULL,
    termination_date DATE,
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id)
);

CREATE INDEX idx_employees_user_id ON employees (user_id);

CREATE INDEX idx_employees_type ON employees (employee_type);

CREATE INDEX idx_employees_available ON employees (is_available);

-- Menu items table
CREATE TABLE menu_items (
    item_id SERIAL PRIMARY KEY,
    chef_id INTEGER REFERENCES employees (employee_id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    image_url VARCHAR(500),
    is_vip_only BOOLEAN DEFAULT false,
    is_available BOOLEAN DEFAULT true,
    average_rating DECIMAL(3, 2) DEFAULT 0.00 CHECK (
        average_rating >= 0
        AND average_rating <= 5
    ),
    total_ratings INTEGER DEFAULT 0 CHECK (total_ratings >= 0),
    order_count INTEGER DEFAULT 0 CHECK (order_count >= 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_menu_items_chef_id ON menu_items (chef_id);

CREATE INDEX idx_menu_items_vip_only ON menu_items (is_vip_only);

CREATE INDEX idx_menu_items_available ON menu_items (is_available);

CREATE INDEX idx_menu_items_rating ON menu_items (average_rating);

-- Orders table
CREATE TABLE orders (
    order_id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES customers (customer_id),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (
        status IN (
            'pending',
            'confirmed',
            'preparing',
            'ready_for_delivery',
            'out_for_delivery',
            'delivered',
            'cancelled'
        )
    ),
    subtotal DECIMAL(10, 2) NOT NULL CHECK (subtotal >= 0),
    tax DECIMAL(10, 2) NOT NULL CHECK (tax >= 0),
    delivery_fee DECIMAL(10, 2) NOT NULL CHECK (delivery_fee >= 0),
    discount DECIMAL(10, 2) DEFAULT 0.00 CHECK (discount >= 0),
    total DECIMAL(10, 2) NOT NULL CHECK (total >= 0),
    is_free_delivery BOOLEAN DEFAULT false,
    delivery_address TEXT NOT NULL,
    special_instructions TEXT,
    assigned_delivery_person INTEGER REFERENCES employees (employee_id),
    estimated_delivery_time TIMESTAMP,
    actual_delivery_time TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_orders_customer_id ON orders (customer_id);

CREATE INDEX idx_orders_status ON orders (status);

CREATE INDEX idx_orders_delivery_person ON orders (assigned_delivery_person);

CREATE INDEX idx_orders_created_at ON orders (created_at);

-- Order items table
CREATE TABLE order_items (
    order_item_id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders (order_id) ON DELETE CASCADE,
    item_id INTEGER REFERENCES menu_items (item_id),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price_at_order DECIMAL(10, 2) NOT NULL CHECK (price_at_order >= 0),
    chef_id INTEGER REFERENCES employees (employee_id)
);

CREATE INDEX idx_order_items_order_id ON order_items (order_id);

CREATE INDEX idx_order_items_item_id ON order_items (item_id);

CREATE INDEX idx_order_items_chef_id ON order_items (chef_id);

-- Delivery bids table
CREATE TABLE delivery_bids (
    bid_id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders (order_id) ON DELETE CASCADE,
    delivery_person_id INTEGER REFERENCES employees (employee_id),
    bid_amount DECIMAL(10, 2) NOT NULL CHECK (bid_amount >= 0),
    estimated_time INTEGER CHECK (estimated_time > 0),
    bid_status VARCHAR(20) DEFAULT 'pending' CHECK (
        bid_status IN (
            'pending',
            'accepted',
            'rejected'
        )
    ),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (order_id, delivery_person_id)
);

CREATE INDEX idx_delivery_bids_order_id ON delivery_bids (order_id);

CREATE INDEX idx_delivery_bids_delivery_person ON delivery_bids (delivery_person_id);

CREATE INDEX idx_delivery_bids_status ON delivery_bids (bid_status);

-- Manager memos table
CREATE TABLE manager_memos (
    memo_id SERIAL PRIMARY KEY,
    manager_id INTEGER REFERENCES users (user_id),
    reference_type VARCHAR(50) NOT NULL,
    reference_id INTEGER NOT NULL,
    memo_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_manager_memos_manager ON manager_memos (manager_id);

CREATE INDEX idx_manager_memos_reference ON manager_memos (reference_type, reference_id);

-- Ratings table
CREATE TABLE ratings (
    rating_id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders (order_id),
    customer_id INTEGER REFERENCES customers (customer_id),
    target_type VARCHAR(20) NOT NULL CHECK (
        target_type IN ('food', 'delivery')
    ),
    target_id INTEGER NOT NULL,
    rating INTEGER NOT NULL CHECK (
        rating >= 1
        AND rating <= 5
    ),
    comment TEXT,
    is_vip_rating BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (order_id, target_type)
);

CREATE INDEX idx_ratings_target ON ratings (target_type, target_id);

CREATE INDEX idx_ratings_customer ON ratings (customer_id);

CREATE INDEX idx_ratings_order ON ratings (order_id);

-- Complaints table
CREATE TABLE complaints (
    complaint_id SERIAL PRIMARY KEY,
    filer_id INTEGER REFERENCES users (user_id),
    subject_id INTEGER REFERENCES users (user_id),
    subject_type VARCHAR(20) NOT NULL CHECK (
        subject_type IN (
            'chef',
            'delivery',
            'customer'
        )
    ),
    complaint_type VARCHAR(20) NOT NULL CHECK (
        complaint_type IN ('complaint', 'compliment')
    ),
    category VARCHAR(50),
    description TEXT NOT NULL,
    evidence_url VARCHAR(500),
    status VARCHAR(20) DEFAULT 'pending' CHECK (
        status IN (
            'pending',
            'under_review',
            'resolved',
            'dismissed'
        )
    ),
    manager_decision VARCHAR(20) CHECK (
        manager_decision IN ('upheld', 'dismissed', NULL)
    ),
    manager_notes TEXT,
    resolved_by INTEGER REFERENCES users (user_id),
    resolved_at TIMESTAMP,
    is_vip_complaint BOOLEAN DEFAULT false,
    is_disputed BOOLEAN DEFAULT false,
    dispute_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_complaints_filer ON complaints (filer_id);

CREATE INDEX idx_complaints_subject ON complaints (subject_id);

CREATE INDEX idx_complaints_status ON complaints (status);

CREATE INDEX idx_complaints_type ON complaints (complaint_type);

CREATE TABLE warnings (
    warning_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users (user_id),
    warning_type VARCHAR(50) NOT NULL,
    source VARCHAR(50) NOT NULL,
    reason TEXT NOT NULL,
    issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

CREATE INDEX idx_warnings_user_id ON warnings (user_id);

CREATE INDEX idx_warnings_active ON warnings (is_active);

CREATE TABLE transactions (
    transaction_id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES customers (customer_id),
    transaction_type VARCHAR(20) NOT NULL CHECK (
        transaction_type IN ('deposit', 'order', 'refund')
    ),
    amount DECIMAL(10, 2) NOT NULL,
    balance_before DECIMAL(10, 2) NOT NULL,
    balance_after DECIMAL(10, 2) NOT NULL,
    order_id INTEGER REFERENCES orders (order_id),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_transactions_customer ON transactions (customer_id);

CREATE INDEX idx_transactions_type ON transactions (transaction_type);

CREATE INDEX idx_transactions_created_at ON transactions (created_at);

CREATE TABLE knowledge_base_articles (
    article_id SERIAL PRIMARY KEY,
    author_id INTEGER REFERENCES users (user_id),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    is_manager_approved BOOLEAN DEFAULT false,
    flag_count INTEGER DEFAULT 0 CHECK (flag_count >= 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_kb_articles_category ON knowledge_base_articles (category);

CREATE INDEX idx_kb_articles_active ON knowledge_base_articles (is_active);

CREATE INDEX idx_kb_articles_author ON knowledge_base_articles (author_id);

-- KB article ratings table
CREATE TABLE kb_ratings (
    kb_rating_id SERIAL PRIMARY KEY,
    article_id INTEGER REFERENCES knowledge_base_articles (article_id),
    user_id INTEGER REFERENCES users (user_id),
    rating INTEGER NOT NULL CHECK (
        rating >= 0
        AND rating <= 5
    ),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (article_id, user_id)
);

CREATE INDEX idx_kb_ratings_article ON kb_ratings (article_id);

CREATE INDEX idx_kb_ratings_user ON kb_ratings (user_id);

-- Chat sessions table
CREATE TABLE chat_sessions (
    session_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users (user_id),
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP
);

CREATE INDEX idx_chat_sessions_user ON chat_sessions (user_id);

-- Chat messages table
CREATE TABLE chat_messages (
    message_id SERIAL PRIMARY KEY,
    session_id INTEGER REFERENCES chat_sessions (session_id),
    sender_type VARCHAR(20) NOT NULL CHECK (
        sender_type IN ('user', 'kb', 'llm')
    ),
    content TEXT NOT NULL,
    kb_article_id INTEGER REFERENCES knowledge_base_articles (article_id),
    source VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_chat_messages_session ON chat_messages (session_id);

-- Discussion topics table
CREATE TABLE discussion_topics (
    topic_id SERIAL PRIMARY KEY,
    created_by INTEGER REFERENCES users (user_id),
    title VARCHAR(255) NOT NULL,
    category VARCHAR(50),
    target_type VARCHAR(20),
    target_id INTEGER,
    is_locked BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_discussion_topics_category ON discussion_topics (category);

CREATE INDEX idx_discussion_topics_created_by ON discussion_topics (created_by);

-- Discussion posts table
CREATE TABLE discussion_posts (
    post_id SERIAL PRIMARY KEY,
    topic_id INTEGER REFERENCES discussion_topics (topic_id) ON DELETE CASCADE,
    author_id INTEGER REFERENCES users (user_id),
    content TEXT NOT NULL,
    is_reported BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_discussion_posts_topic ON discussion_posts (topic_id);

CREATE INDEX idx_discussion_posts_author ON discussion_posts (author_id);

CREATE INDEX idx_discussion_posts_reported ON discussion_posts (is_reported);

-- Performance history table
CREATE TABLE performance_history (
    history_id SERIAL PRIMARY KEY,
    employee_id INTEGER REFERENCES employees (employee_id),
    evaluation_date DATE NOT NULL,
    average_rating DECIMAL(3, 2),
    complaint_count INTEGER,
    compliment_count INTEGER,
    action_taken VARCHAR(50),
    old_salary DECIMAL(10, 2),
    new_salary DECIMAL(10, 2),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_performance_history_employee ON performance_history (employee_id);

CREATE INDEX idx_performance_history_date ON performance_history (evaluation_date);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON employees
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_menu_items_updated_at BEFORE UPDATE ON menu_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_complaints_updated_at BEFORE UPDATE ON complaints
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_kb_articles_updated_at BEFORE UPDATE ON knowledge_base_articles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_discussion_topics_updated_at BEFORE UPDATE ON discussion_topics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_discussion_posts_updated_at BEFORE UPDATE ON discussion_posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();