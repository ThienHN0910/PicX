-- Enhanced PicX Database Schema
CREATE DATABASE PicX;
Use PicX
DROP DATABASE PicX;

-- Table: Users (Enhanced with additional fields)
CREATE TABLE Users (
    user_id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(100) NOT NULL,
    email NVARCHAR(100) UNIQUE NOT NULL,
    password NVARCHAR(255) NOT NULL,
    role NVARCHAR(20) CHECK (role IN ('guest', 'buyer', 'artist', 'admin')) NOT NULL,
    phone NVARCHAR(20),
    address NVARCHAR(500),
    is_active BIT DEFAULT 1,
    email_verified BIT DEFAULT 0,
    last_login DATETIME,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE()
);

-- Table: ArtistProfiles (Enhanced)
CREATE TABLE ArtistProfiles (
    artist_id INT PRIMARY KEY,
    bio NVARCHAR(MAX),
    profile_picture NVARCHAR(255),
    specialization NVARCHAR(100),
    experience_years INT,
    website_url NVARCHAR(255),
    social_media_links NVARCHAR(MAX), -- JSON format for multiple links
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (artist_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

-- Table: Categories (New - for better product organization)
CREATE TABLE Categories (
    category_id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(100) NOT NULL,
    description NVARCHAR(500),
    parent_category_id INT,
    is_active BIT DEFAULT 1,
    FOREIGN KEY (parent_category_id) REFERENCES Categories(category_id)
);

-- Table: Products (Enhanced)
CREATE TABLE Products (
    product_id INT IDENTITY(1,1) PRIMARY KEY,
    artist_id INT NOT NULL,
    category_id INT,
    title NVARCHAR(255) NOT NULL,
    description NVARCHAR(MAX),
    price DECIMAL(10, 2) NOT NULL,
    image_url NVARCHAR(255),
    additional_images NVARCHAR(MAX), -- JSON array of image URLs
    dimensions NVARCHAR(100), -- e.g., "24x36 inches"
    medium NVARCHAR(100), -- e.g., "Oil on Canvas"
    is_available BIT DEFAULT 1,
    tags NVARCHAR(500), -- Comma-separated tags for search
    like_count INT DEFAULT 0,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (artist_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES Categories(category_id)
);

-- Table: Orders (Enhanced)
CREATE TABLE Orders (
    order_id INT IDENTITY(1,1) PRIMARY KEY,
    buyer_id INT NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    order_date DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (buyer_id) REFERENCES Users(user_id)
);

-- Table: OrderDetails (Enhanced)
CREATE TABLE OrderDetails (
    order_detail_id INT IDENTITY(1,1) PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES Orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES Products(product_id)
);

-- Table: Payments (Enhanced)
CREATE TABLE Payments (
    payment_id INT IDENTITY(1,1) PRIMARY KEY,
    order_id INT NOT NULL,
    payment_method NVARCHAR(50) NOT NULL, -- 'VNPay', 'Credit Card', etc.
    payment_provider NVARCHAR(50), -- 'VNPay', 'PayPal', etc.
    transaction_id NVARCHAR(100), -- External transaction ID
    payment_date DATETIME DEFAULT GETDATE(),
    amount DECIMAL(10, 2) NOT NULL,
    currency NVARCHAR(10) DEFAULT 'VND',
    payment_details NVARCHAR(MAX), -- JSON for additional payment info
    FOREIGN KEY (order_id) REFERENCES Orders(order_id)
);

-- Table: Comments (Enhanced)
CREATE TABLE Comments (
    comment_id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    content NVARCHAR(MAX) NOT NULL,
    created_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE NO ACTION,
    FOREIGN KEY (product_id) REFERENCES Products(product_id) ON DELETE CASCADE
);

-- Table: CommentReplies (Enhanced)
CREATE TABLE CommentReplies (
    reply_id INT IDENTITY(1,1) PRIMARY KEY,
    comment_id INT NOT NULL,
    user_id INT NOT NULL,
    content NVARCHAR(MAX) NOT NULL,
    created_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (comment_id) REFERENCES Comments(comment_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
);

-- Table: Favorites/Likes (Enhanced)
CREATE TABLE Favorites (
    favorite_id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    created_at DATETIME DEFAULT GETDATE(),
    UNIQUE(user_id, product_id), -- Prevent duplicate likes
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES Products(product_id) ON DELETE NO ACTION
);

-- Table: Chats (Enhanced)
CREATE TABLE Chats (
    chat_id INT IDENTITY(1,1) PRIMARY KEY,
    sender_id INT NOT NULL,
    receiver_id INT NOT NULL,
    message NVARCHAR(MAX) NOT NULL,
    is_read BIT DEFAULT 0,
    sent_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (sender_id) REFERENCES Users(user_id) ON DELETE NO ACTION,
    FOREIGN KEY (receiver_id) REFERENCES Users(user_id) ON DELETE NO ACTION
);



-- Table: Sessions (New - for user session management)
CREATE TABLE Sessions (
    session_id NVARCHAR(255) PRIMARY KEY,
    user_id INT NOT NULL,
    ip_address NVARCHAR(45),
    user_agent NVARCHAR(500),
    created_at DATETIME DEFAULT GETDATE(),
    expires_at DATETIME NOT NULL,
    is_active BIT DEFAULT 1,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

-- Table: Reviews (New - separate from comments for better organization)
CREATE TABLE Reporting (
    review_id INT IDENTITY(1,1) PRIMARY KEY,
    product_id INT NOT NULL,
    user_id INT NOT NULL,
    content NVARCHAR(MAX),
    is_approved BIT DEFAULT 0,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),
    UNIQUE(product_id, user_id), -- One review per user per product
    FOREIGN KEY (product_id) REFERENCES Products(product_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE NO ACTION,
);

-- Table: Notifications (New)
CREATE TABLE Notifications (
    notification_id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,
    type NVARCHAR(50) NOT NULL, -- 'order', 'comment', 'like', 'message', etc.
    title NVARCHAR(255) NOT NULL,
    message NVARCHAR(500) NOT NULL,
    entity_type NVARCHAR(50), -- Related entity type
    entity_id INT, -- Related entity ID
    is_read BIT DEFAULT 0,
    created_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

-- Table: FinancialReports (New - for admin finance tracking)
CREATE TABLE FinancialReports (
    report_id INT IDENTITY(1,1) PRIMARY KEY,
    artist_id INT,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    total_sales DECIMAL(12, 2) DEFAULT 0,
    total_commission DECIMAL(12, 2) DEFAULT 0,
    net_earnings DECIMAL(12, 2) DEFAULT 0,
    commission_rate DECIMAL(5, 2) DEFAULT 10.00, -- Platform commission %
    generated_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (artist_id) REFERENCES Users(user_id) ON DELETE SET NULL
);


-- Insert sample categories
INSERT INTO Categories (name, description) VALUES 
('Paintings', 'Traditional and digital paintings'),
('Photography', 'Artistic photography and prints'),
('Digital Art', 'Computer-generated and digital artwork'),
('Sculptures', '3D artistic creations'),
('Mixed Media', 'Artwork combining multiple mediums');

-- Sample data for testing
INSERT INTO Users (name, email, password, role) VALUES 
('Admin User', 'admin@picx.com', 'hashed_password', 'admin'),
('John Artist', 'john@artist.com', 'hashed_password', 'artist'),
('Jane Buyer', 'jane@buyer.com', 'hashed_password', 'buyer');