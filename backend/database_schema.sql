CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'visitor',
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    is_blacklisted BOOLEAN DEFAULT false,
    blacklist_reason TEXT,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE customers (
    customer_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    registration_status VARCHAR(20) DEFAULT 'pending',
    rejection_reason TEXT,
    rejection_date TIMESTAMP,
    deposit_balance DECIMAL(10, 2) DEFAULT 0.00,
    total_spent DECIMAL(10, 2) DEFAULT 0.00,
    order_count INTEGER DEFAULT 0,
    warning_count INTEGER DEFAULT 0,
    is_vip BOOLEAN DEFAULT false,
    vip_upgraded_at TIMESTAMP,
    free_delivery_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE employees (
    employee_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    employee_type VARCHAR(20) NOT NULL,
    salary DECIMAL(10, 2) NOT NULL,
    average_rating DECIMAL(3, 2) DEFAULT 0.00,
    total_ratings INTEGER DEFAULT 0,
    complaint_count INTEGER DEFAULT 0,
    compliment_count INTEGER DEFAULT 0,
    demotion_count INTEGER DEFAULT 0,
    hire_date DATE NOT NULL,
    termination_date DATE,
    is_available BOOLEAN DEFAULT true,
    profile_picture_url VARCHAR(500),
    bio TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_customers_user_id ON customers(user_id);
CREATE INDEX idx_customers_is_vip ON customers(is_vip);
CREATE INDEX idx_employees_user_id ON employees(user_id);
CREATE INDEX idx_employees_type ON employees(employee_type);
