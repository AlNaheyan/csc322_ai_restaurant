-- Seed Data for Restaurant System Database
-- Run after database_schema.sql

-- Clear existing data (in reverse dependency order)
TRUNCATE performance_history, discussion_posts, discussion_topics, chat_messages, chat_sessions, 
kb_ratings, knowledge_base_articles, transactions, warnings, complaints, ratings, manager_memos, 
delivery_bids, order_items, orders, menu_items, employees, customers, users RESTART IDENTITY CASCADE;

-- Insert Users
-- Password for all: 'password123' (bcrypt hashed)
-- Hash generated with: bcrypt.hash('password123', 10)
INSERT INTO users (email, password_hash, role, first_name, last_name, phone, is_active) VALUES
-- Manager
('manager@restaurant.com', '$2b$10$rGvM3p2Z0qH4z8KxB5nLYeJ5vX8YqW9Lm0nZzX7Xw6tQ5yU4vR8Ka', 'manager', 'Sarah', 'Johnson', '555-0001', true),

-- Chefs
('chef1@restaurant.com', '$2b$10$rGvM3p2Z0qH4z8KxB5nLYeJ5vX8YqW9Lm0nZzX7Xw6tQ5yU4vR8Ka', 'chef', 'Mario', 'Rossini', '555-0002', true),
('chef2@restaurant.com', '$2b$10$rGvM3p2Z0qH4z8KxB5nLYeJ5vX8YqW9Lm0nZzX7Xw6tQ5yU4vR8Ka', 'chef', 'Isabella', 'Chen', '555-0003', true),
('chef3@restaurant.com', '$2b$10$rGvM3p2Z0qH4z8KxB5nLYeJ5vX8YqW9Lm0nZzX7Xw6tQ5yU4vR8Ka', 'chef', 'Andre', 'Dubois', '555-0004', true),

-- Delivery People
('delivery1@restaurant.com', '$2b$10$rGvM3p2Z0qH4z8KxB5nLYeJ5vX8YqW9Lm0nZzX7Xw6tQ5yU4vR8Ka', 'delivery', 'James', 'Wilson', '555-0005', true),
('delivery2@restaurant.com', '$2b$10$rGvM3p2Z0qH4z8KxB5nLYeJ5vX8YqW9Lm0nZzX7Xw6tQ5yU4vR8Ka', 'delivery', 'Maria', 'Garcia', '555-0006', true),
('delivery3@restaurant.com', '$2b$10$rGvM3p2Z0qH4z8KxB5nLYeJ5vX8YqW9Lm0nZzX7Xw6tQ5yU4vR8Ka', 'delivery', 'Alex', 'Kim', '555-0007', true),

-- VIP Customers
('vip1@customer.com', '$2b$10$rGvM3p2Z0qH4z8KxB5nLYeJ5vX8YqW9Lm0nZzX7Xw6tQ5yU4vR8Ka', 'vip', 'Emily', 'Davis', '555-0101', true),
('vip2@customer.com', '$2b$10$rGvM3p2Z0qH4z8KxB5nLYeJ5vX8YqW9Lm0nZzX7Xw6tQ5yU4vR8Ka', 'vip', 'Michael', 'Brown', '555-0102', true),

-- Regular Customers
('customer1@email.com', '$2b$10$rGvM3p2Z0qH4z8KxB5nLYeJ5vX8YqW9Lm0nZzX7Xw6tQ5yU4vR8Ka', 'customer', 'Jennifer', 'Martinez', '555-0103', true),
('customer2@email.com', '$2b$10$rGvM3p2Z0qH4z8KxB5nLYeJ5vX8YqW9Lm0nZzX7Xw6tQ5yU4vR8Ka', 'customer', 'David', 'Anderson', '555-0104', true),
('customer3@email.com', '$2b$10$rGvM3p2Z0qH4z8KxB5nLYeJ5vX8YqW9Lm0nZzX7Xw6tQ5yU4vR8Ka', 'customer', 'Lisa', 'Taylor', '555-0105', true),
('customer4@email.com', '$2b$10$rGvM3p2Z0qH4z8KxB5nLYeJ5vX8YqW9Lm0nZzX7Xw6tQ5yU4vR8Ka', 'customer', 'Robert', 'Thomas', '555-0106', true),

-- Pending Customer (for testing approval)
('pending@email.com', '$2b$10$rGvM3p2Z0qH4z8KxB5nLYeJ5vX8YqW9Lm0nZzX7Xw6tQ5yU4vR8Ka', 'visitor', 'Sarah', 'White', '555-0107', true);

-- Insert Employees
INSERT INTO employees (user_id, employee_type, salary, average_rating, total_ratings, hire_date, is_available) VALUES
-- Chefs (user_id 2, 3, 4)
(2, 'chef', 55000, 4.5, 25, '2023-01-15', true),
(3, 'chef', 58000, 4.8, 30, '2022-06-01', true),
(4, 'chef', 52000, 4.2, 20, '2023-03-20', true),

-- Delivery People (user_id 5, 6, 7)
(5, 'delivery', 35000, 4.6, 40, '2023-02-01', true),
(6, 'delivery', 36000, 4.7, 35, '2022-11-15', true),
(7, 'delivery', 34000, 4.4, 28, '2023-04-10', true);

-- Insert Customers
INSERT INTO customers (user_id, registration_status, deposit_balance, total_spent, order_count, is_vip, vip_upgraded_at) VALUES
-- VIP Customers (user_id 8, 9)
(8, 'approved', 150.00, 250.00, 8, true, '2024-01-15 10:00:00'),
(9, 'approved', 200.00, 350.00, 12, true, '2023-12-01 14:30:00'),

-- Regular Customers (user_id 10, 11, 12, 13)
(10, 'approved', 50.00, 75.00, 2, false, NULL),
(11, 'approved', 75.00, 45.00, 1, false, NULL),
(12, 'approved', 100.00, 30.00, 1, false, NULL),
(13, 'approved', 25.00, 15.00, 0, false, NULL),

-- Pending Customer (user_id 14)
(14, 'pending', 0.00, 0.00, 0, false, NULL);

-- Insert Menu Items
INSERT INTO menu_items (chef_id, name, description, price, image_url, is_vip_only, is_available, average_rating, total_ratings, order_count) VALUES
-- Chef Mario's dishes (employee_id 1)
(1, 'Truffle Risotto', 'Creamy Arborio rice with black truffle, parmesan, and white wine', 28.99, '/images/truffle-risotto.jpg', false, true, 4.7, 15, 45),
(1, 'Osso Buco', 'Braised veal shanks with saffron risotto and gremolata', 34.99, '/images/osso-buco.jpg', false, true, 4.8, 20, 38),
(1, 'Wagyu Beef Carpaccio', 'Thinly sliced A5 Wagyu with arugula and aged parmesan', 45.99, '/images/wagyu-carpaccio.jpg', true, true, 4.9, 12, 25),

-- Chef Isabella's dishes (employee_id 2)
(2, 'Peking Duck', 'Crispy duck with mandarin pancakes, scallions, and hoisin sauce', 38.99, '/images/peking-duck.jpg', false, true, 4.9, 25, 52),
(2, 'Mapo Tofu', 'Spicy Sichuan tofu with ground pork and fermented beans', 16.99, '/images/mapo-tofu.jpg', false, true, 4.5, 18, 40),
(2, 'Lobster Fried Rice', 'Wok-fried rice with fresh lobster, eggs, and XO sauce', 42.99, '/images/lobster-rice.jpg', true, true, 4.8, 15, 30),

-- Chef Andre's dishes (employee_id 3)
(3, 'Coq au Vin', 'Braised chicken in red wine with pearl onions and mushrooms', 26.99, '/images/coq-au-vin.jpg', false, true, 4.6, 22, 48),
(3, 'Bouillabaisse', 'Provençal fish stew with saffron, fennel, and rouille', 32.99, '/images/bouillabaisse.jpg', false, true, 4.7, 19, 35),
(3, 'Duck Confit', 'Slow-cooked duck leg with garlic potatoes and cherry gastrique', 29.99, '/images/duck-confit.jpg', false, true, 4.5, 16, 28),
(3, 'Beef Wellington', 'Filet mignon wrapped in puff pastry with mushroom duxelles', 54.99, '/images/beef-wellington.jpg', true, true, 5.0, 10, 18),

-- Desserts
(1, 'Tiramisu', 'Classic Italian dessert with espresso-soaked ladyfingers and mascarpone', 9.99, '/images/tiramisu.jpg', false, true, 4.8, 30, 65),
(2, 'Mango Sticky Rice', 'Sweet coconut rice with fresh mango and sesame seeds', 8.99, '/images/mango-rice.jpg', false, true, 4.6, 25, 55),
(3, 'Crème Brûlée', 'Vanilla custard with caramelized sugar crust', 10.99, '/images/creme-brulee.jpg', false, true, 4.9, 28, 60);

-- Insert Knowledge Base Articles
INSERT INTO knowledge_base_articles (author_id, title, content, category, is_active, is_manager_approved) VALUES
(1, 'About Our Restaurant', 'Welcome to our fine dining establishment! We have been serving exquisite cuisine for over 10 years, featuring dishes from Italian, Chinese, and French culinary traditions. Our chefs use only the finest ingredients sourced locally and internationally.', 'restaurant', true, true),

(1, 'VIP Membership Benefits', 'VIP members enjoy exclusive benefits including: 5% discount on all orders, 1 free delivery for every 3 orders, access to exclusive VIP-only dishes, and priority customer service. You can become a VIP by spending over $100 or completing 3 orders as a registered customer without any complaints.', 'policy', true, true),

(1, 'Delivery Information', 'Our delivery service operates within a 10-mile radius of the restaurant. Delivery fees are competitively priced through our bidding system. Standard delivery time is 30-45 minutes. VIP members receive free delivery on every 3rd order.', 'delivery', true, true),

(8, 'Tips for Ordering Truffle Dishes', 'When ordering truffle dishes, I recommend pairing them with a light white wine. The truffle risotto is best enjoyed immediately while the rice is still creamy. Ask for extra parmesan on the side!', 'dish', true, true),

(10, 'Best Time to Order', 'From my experience, ordering between 11:30 AM - 12:30 PM for lunch ensures the freshest ingredients and faster delivery. Dinner service (6-7 PM) can get busy, but the dishes are always worth the wait!', 'restaurant', true, false);

-- Insert Sample Orders (for history)
INSERT INTO orders (customer_id, status, subtotal, tax, delivery_fee, discount, total, is_free_delivery, delivery_address, assigned_delivery_person, created_at, updated_at) VALUES
-- VIP Customer 1 orders
(1, 'delivered', 65.98, 5.94, 5.00, 3.30, 73.62, false, '123 Oak Street, Apt 4B', 1, NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'),
(1, 'delivered', 38.99, 3.51, 5.00, 1.95, 45.55, false, '123 Oak Street, Apt 4B', 2, NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),
(1, 'delivered', 54.99, 4.95, 0.00, 2.75, 57.19, true, '123 Oak Street, Apt 4B', 1, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),

-- VIP Customer 2 orders
(2, 'delivered', 91.98, 8.28, 5.00, 4.60, 100.66, false, '456 Maple Avenue', 3, NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days'),
(2, 'delivered', 42.99, 3.87, 5.00, 2.15, 49.71, false, '456 Maple Avenue', 2, NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days'),

-- Regular customer orders
(3, 'delivered', 26.99, 2.43, 5.00, 0.00, 34.42, false, '789 Pine Road', 1, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
(4, 'delivered', 16.99, 1.53, 5.00, 0.00, 23.52, false, '321 Elm Street', 3, NOW() - INTERVAL '6 days', NOW() - INTERVAL '6 days');

-- Insert Order Items (matching the orders above)
INSERT INTO order_items (order_id, item_id, quantity, price_at_order, chef_id) VALUES
-- Order 1: VIP Customer 1
(1, 1, 1, 28.99, 1),  -- Truffle Risotto
(1, 2, 1, 34.99, 1),  -- Osso Buco
(1, 11, 1, 9.99, 1),   -- Tiramisu

-- Order 2: VIP Customer 1
(2, 4, 1, 38.99, 2),   -- Peking Duck

-- Order 3: VIP Customer 1 (free delivery)
(3, 10, 1, 54.99, 3),  -- Beef Wellington

-- Order 4: VIP Customer 2
(4, 3, 1, 45.99, 1),   -- Wagyu Carpaccio
(4, 6, 1, 42.99, 2),   -- Lobster Fried Rice
(4, 11, 1, 9.99, 1),   -- Tiramisu

-- Order 5: VIP Customer 2
(5, 6, 1, 42.99, 2),   -- Lobster Fried Rice

-- Order 6: Regular Customer 1
(6, 7, 1, 26.99, 3),   -- Coq au Vin

-- Order 7: Regular Customer 2
(7, 5, 1, 16.99, 2);   -- Mapo Tofu

-- Insert Ratings
INSERT INTO ratings (order_id, customer_id, target_type, target_id, rating, comment, is_vip_rating) VALUES
-- Food ratings
(1, 1, 'food', 1, 5, 'Absolutely delicious! The truffle flavor was perfect.', true),
(2, 1, 'food', 2, 5, 'Best Peking Duck I have ever had!', true),
(4, 2, 'food', 1, 5, 'The Wagyu was melt-in-your-mouth amazing.', true),
(6, 3, 'food', 3, 4, 'Very good, traditional French cooking.', false),
(7, 4, 'food', 2, 5, 'Perfectly spiced and flavorful!', false),

-- Delivery ratings
(1, 1, 'delivery', 1, 5, 'Fast and friendly service!', true),
(2, 1, 'delivery', 2, 4, 'Good service, arrived on time.', true),
(4, 2, 'delivery', 3, 5, 'Very professional and courteous.', true),
(6, 3, 'delivery', 1, 5, 'Great communication during delivery.', false),
(7, 4, 'delivery', 3, 4, 'Delivered quickly and carefully.', false);

-- Insert Transactions
INSERT INTO transactions (customer_id, transaction_type, amount, balance_before, balance_after, order_id, description) VALUES
-- VIP Customer 1
(1, 'deposit', 200.00, 0.00, 200.00, NULL, 'Initial deposit'),
(1, 'order', -73.62, 200.00, 126.38, 1, 'Order payment'),
(1, 'order', -45.55, 126.38, 80.83, 2, 'Order payment'),
(1, 'deposit', 100.00, 80.83, 180.83, NULL, 'Account top-up'),
(1, 'order', -57.19, 180.83, 123.64, 3, 'Order payment'),

-- VIP Customer 2
(2, 'deposit', 250.00, 0.00, 250.00, NULL, 'Initial deposit'),
(2, 'order', -100.66, 250.00, 149.34, 4, 'Order payment'),
(2, 'order', -49.71, 149.34, 99.63, 5, 'Order payment'),

-- Regular Customer 1
(3, 'deposit', 100.00, 0.00, 100.00, NULL, 'Initial deposit'),
(3, 'order', -34.42, 100.00, 65.58, 6, 'Order payment'),

-- Regular Customer 2
(4, 'deposit', 75.00, 0.00, 75.00, NULL, 'Initial deposit'),
(4, 'order', -23.52, 75.00, 51.48, 7, 'Order payment');

-- Insert Discussion Topics
INSERT INTO discussion_topics (created_by, title, category, target_type, target_id) VALUES
(8, 'Best dishes for first-time visitors?', 'general', NULL, NULL),
(10, 'Chef Mario appreciation thread', 'chef', 'chef', 1),
(9, 'Delivery experience reviews', 'delivery', NULL, NULL);

-- Insert Discussion Posts
INSERT INTO discussion_posts (topic_id, author_id, content) VALUES
(1, 8, 'I highly recommend the Truffle Risotto and Peking Duck for first-timers!'),
(1, 10, 'The Coq au Vin is also excellent and very traditional.'),

(2, 9, 'Chef Mario is amazing! His Osso Buco is the best I have had anywhere.'),
(2, 12, 'Totally agree! The attention to detail in his dishes is incredible.'),

(3, 8, 'James (delivery person) is always professional and punctual!'),
(3, 11, 'Maria delivered my order yesterday and was super friendly!');

-- Insert Sample Complaints/Compliments
INSERT INTO complaints (filer_id, subject_id, subject_type, complaint_type, category, description, status, manager_decision, resolved_by, resolved_at, is_vip_complaint) VALUES
(9, 2, 'chef', 'compliment', 'quality', 'The Truffle Risotto was exceptional! Chef Mario deserves recognition.', 'resolved', 'upheld', 1, NOW() - INTERVAL '2 days', true),
(10, 5, 'delivery', 'compliment', 'service', 'James went above and beyond to ensure my order arrived perfectly!', 'resolved', 'upheld', 1, NOW() - INTERVAL '1 day', false);

-- Update employee stats based on ratings and compliments
UPDATE employees SET 
    average_rating = 4.7,
    total_ratings = 3,
    compliment_count = 1
WHERE employee_id = 1;  -- Chef Mario

UPDATE employees SET 
    average_rating = 4.8,
    total_ratings = 2
WHERE employee_id = 2;  -- Chef Isabella

UPDATE employees SET 
    average_rating = 4.5,
    total_ratings = 1
WHERE employee_id = 3;  -- Chef Andre

UPDATE employees SET 
    average_rating = 4.8,
    total_ratings = 2,
    compliment_count = 1
WHERE employee_id = 4;  -- James (delivery)

UPDATE employees SET 
    average_rating = 4.5,
    total_ratings = 1
WHERE employee_id = 5;  -- Maria (delivery)

UPDATE employees SET 
    average_rating = 4.7,
    total_ratings = 2
WHERE employee_id = 6;  -- Alex (delivery)

-- Update customer balances
UPDATE customers SET deposit_balance = 150.00, total_spent = 176.36, order_count = 3 WHERE customer_id = 1;
UPDATE customers SET deposit_balance = 200.00, total_spent = 150.37, order_count = 2 WHERE customer_id = 2;
UPDATE customers SET deposit_balance = 50.00, total_spent = 34.42, order_count = 1 WHERE customer_id = 3;
UPDATE customers SET deposit_balance = 75.00, total_spent = 23.52, order_count = 1 WHERE customer_id = 4;

-- Verify data
SELECT 'Users created:' as info, COUNT(*) as count FROM users
UNION ALL
SELECT 'Customers created:', COUNT(*) FROM customers
UNION ALL
SELECT 'Employees created:', COUNT(*) FROM employees
UNION ALL
SELECT 'Menu items created:', COUNT(*) FROM menu_items
UNION ALL
SELECT 'Orders created:', COUNT(*) FROM orders
UNION ALL
SELECT 'KB Articles created:', COUNT(*) FROM knowledge_base_articles
UNION ALL
SELECT 'Ratings created:', COUNT(*) FROM ratings;

-- Display test accounts
SELECT 
    'Test Accounts (password: password123)' as info,
    email,
    role,
    first_name || ' ' || last_name as name
FROM users
ORDER BY role, user_id;
