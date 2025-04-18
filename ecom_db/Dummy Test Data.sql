-- Insert data into UserAccount table
INSERT INTO UserAccount (username, email, password_hash, first_name, last_name, phone_number, address, role)
VALUES
('john_doe', 'john.doe@example.com', 'hashed_password_1', 'John', 'Doe', '1234567890', '123 Main St, City A', 'CUSTOMER'),
('jane_doe', 'jane.doe@example.com', 'hashed_password_2', 'Jane', 'Doe', '9876543210', '456 Maple Ave, City B', 'CUSTOMER'),
('admin_user', 'admin@example.com', 'hashed_password_3', 'Admin', 'User', '1122334455', '789 Oak Blvd, City C', 'ADMIN'),
('test', 'test@etest.com', 'test', 'Test', 'Test', '9876543210', '126 Test Ave, City D', 'CUSTOMER');

-- Insert data into Product table
INSERT INTO Product (name, description, price, stock, category)
VALUES
('Laptop', 'High-performance laptop with 16GB RAM', 1200.00, 10, 'Electronics'),
('Smartphone', 'Latest smartphone with 5G support', 800.00, 20, 'Electronics'),
('Headphones', 'Noise-canceling over-ear headphones', 150.00, 50, 'Accessories'),
('Office Chair', 'Ergonomic office chair with adjustable height', 200.00, 15, 'Furniture'),
('Coffee Maker', 'Automatic coffee maker with programmable settings', 100.00, 25, 'Appliances');

-- Insert data into OrderTable
INSERT INTO OrderTable (user_id, total_amount, status)
VALUES
(1, 2150.00, 'pending'), -- John Doe's order
(2, 950.00, 'shipped');  -- Jane Doe's useraccountorder

-- Insert data into OrderItems table
INSERT INTO OrderItems (order_id, product_id, quantity, price)
VALUES
(1, 1, 1, 1200.00), -- John ordered 1 Laptop
(1, 2, 1, 800.00),  -- John ordered 1 Smartphone
(1, 3, 1, 150.00),  -- John ordered 1 Headphones
(2, 4, 1, 200.00),  -- Jane ordered 1 Office Chair
(2, 5, 1, 100.00);  -- Jane ordered 1 Coffee Maker
