CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'vendor', 'user') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS vendors (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  business_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  address TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  vendor_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  image VARCHAR(500),
  gallery_images TEXT,
  video_url VARCHAR(500),
  description TEXT,
  location VARCHAR(255),
  category VARCHAR(100),
  zone VARCHAR(100),
  landmark VARCHAR(255),
  latitude DECIMAL(10, 7),
  longitude DECIMAL(10, 7),
  street_view_image VARCHAR(500),
  occasion_types VARCHAR(255),
  features TEXT,
  capacity INT,
  price DECIMAL(10, 2),
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  user_id INT NOT NULL,
  booking_name VARCHAR(255) NOT NULL,
  booking_email VARCHAR(255) NOT NULL,
  booking_phone VARCHAR(20),
  event_date DATE NOT NULL,
  event_time TIME NOT NULL,
  guest_count INT,
  occasion_type VARCHAR(100),
  selected_services TEXT,
  payment_method ENUM('on_visit', 'upi', 'card', 'net_banking') DEFAULT 'on_visit',
  payment_status ENUM('pending', 'not_available', 'paid') DEFAULT 'pending',
  message TEXT,
  status ENUM('pending', 'accepted', 'rejected', 'completed') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
