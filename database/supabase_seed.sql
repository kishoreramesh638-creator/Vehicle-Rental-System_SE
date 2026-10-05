-- ==============================================================
-- Vehicle Rental System - Supabase Seed Data
-- ==============================================================

-- 1. USERS SEED
-- Passwords:
-- Admin@123    -> $2a$10$a6GDEff3FrNJZgVZmxvisOttlSGFwi.f9Yf1zaWHi20L8W6YbA5hy
-- Customer@123 -> $2a$10$Fabss1vFJyn7X57RUFRD3u9X91pqasqKP2m8a6tP785//LW1Hg3Ge

INSERT INTO users (id, name, email, phone, password_hash, role, status) VALUES
(1, 'System Administrator', 'admin@vehiclerental.com', '+91 9876543210', '$2a$10$a6GDEff3FrNJZgVZmxvisOttlSGFwi.f9Yf1zaWHi20L8W6YbA5hy', 'ADMIN', 'ACTIVE'),
(2, 'Rahul Sharma', 'rahul.sharma@example.com', '+91 9811223344', '$2a$10$Fabss1vFJyn7X57RUFRD3u9X91pqasqKP2m8a6tP785//LW1Hg3Ge', 'CUSTOMER', 'ACTIVE'),
(3, 'Priya Patel', 'priya.patel@example.com', '+91 9822334455', '$2a$10$Fabss1vFJyn7X57RUFRD3u9X91pqasqKP2m8a6tP785//LW1Hg3Ge', 'CUSTOMER', 'ACTIVE'),
(4, 'Amit Kumar', 'amit.kumar@example.com', '+91 9833445566', '$2a$10$Fabss1vFJyn7X57RUFRD3u9X91pqasqKP2m8a6tP785//LW1Hg3Ge', 'CUSTOMER', 'ACTIVE')
ON CONFLICT (id) DO NOTHING;

SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));

-- 2. VEHICLES SEED
INSERT INTO vehicles (id, vehicle_number, brand, model, category, year, fuel_type, transmission, seating_capacity, price_per_day, security_deposit, image_url, description, location, status) VALUES
(1, 'MH-01-AB-1001', 'Tata', 'Nexon Fearless Plus', 'SUV', 2024, 'Diesel', 'Automatic', 5, 2800.00, 5000.00, 
 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1000&q=80', 
 '5-star Global NCAP safety rated subcompact SUV with ventilated leatherette seats, voice-assisted sunroof, and high ground clearance ideal for city and highway drives.', 'Mumbai', 'AVAILABLE'),

(2, 'KA-03-CD-2002', 'Hyundai', 'Creta SX (O)', 'SUV', 2024, 'Petrol', 'Automatic', 5, 3200.00, 6000.00, 
 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=1000&q=80', 
 'Premium feature-rich SUV featuring panoramic sunroof, Level 2 ADAS suite, Bose 8-speaker audio, and smooth IVT transmission for refined journeys.', 'Bengaluru', 'AVAILABLE'),

(3, 'MH-12-EF-3003', 'Mahindra', 'Thar 4x4 Hard Top', 'SUV', 2023, 'Diesel', 'Manual', 4, 3600.00, 8000.00, 
 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1000&q=80', 
 'Iconic off-roader with shift-on-the-fly 4WD transfer case, rugged all-terrain capability, roll-cage, and modern infotainment. Perfect for weekend adventures.', 'Pune', 'AVAILABLE'),

(4, 'DL-01-GH-4004', 'Mahindra', 'XUV700 AX7 Luxury', 'SUV', 2024, 'Diesel', 'Automatic', 7, 4200.00, 8000.00, 
 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1000&q=80', 
 'Luxurious 7-seater SUV equipped with dual HD screens, Sony 3D surround sound, Skyroof, ADAS safety package, and powerful mHawk turbo engine.', 'Delhi NCR', 'AVAILABLE'),

(5, 'MH-02-IJ-5005', 'Maruti Suzuki', 'Swift ZXi Plus', 'Hatchback', 2024, 'Petrol', 'Manual', 5, 1400.00, 3000.00, 
 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=1000&q=80', 
 'Spirited, highly fuel-efficient hatchback with crisp handling, keyless entry, automatic climate control, and modern wireless smartphone connectivity.', 'Mumbai', 'AVAILABLE'),

(6, 'KA-05-KL-6006', 'Hyundai', 'i20 Asta (O)', 'Hatchback', 2023, 'Petrol', 'Automatic', 5, 1700.00, 4000.00, 
 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1000&q=80', 
 'Sleek premium hatchback equipped with digital cluster, electric sunroof, air purifier, cooled glovebox, and smooth IVT automatic gearbox.', 'Bengaluru', 'AVAILABLE'),

(7, 'DL-03-MN-7007', 'Honda', 'City ZX CVT', 'Sedan', 2024, 'Petrol', 'Automatic', 5, 2400.00, 5000.00, 
 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1000&q=80', 
 'The undisputed benchmark executive sedan offering legendary i-VTEC refinement, supple rear seat legroom, LaneWatch camera, and Honda Sensing suite.', 'Delhi NCR', 'AVAILABLE'),

(8, 'MH-14-OP-8008', 'Skoda', 'Slavia Style 1.5 TSI', 'Sedan', 2023, 'Petrol', 'Automatic', 5, 2700.00, 6000.00, 
 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&w=1000&q=80', 
 'European engineered sports sedan featuring active cylinder technology, DSG transmission, 521-litre cavernous boot, and ventilated front seats.', 'Pune', 'MAINTENANCE'),

(9, 'MH-01-QR-9009', 'BMW', '3 Series Gran Limousine', 'Luxury', 2024, 'Petrol', 'Automatic', 5, 8500.00, 15000.00, 
 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1000&q=80', 
 'Chauffeur-worthy luxury limousine with extended wheelbase, panoramic glass roof, Harman Kardon audio system, and exhilarating TwinPower Turbo performance.', 'Mumbai', 'AVAILABLE'),

(10, 'MH-03-ST-1111', 'Royal Enfield', 'Classic 350 Reborn', 'Bike', 2024, 'Petrol', 'Manual', 2, 950.00, 3000.00, 
 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=1000&q=80', 
 'Timeless retro cruiser motorcycle powered by the refined J-series counterbalanced engine with plush touring dual saddle and dual-channel ABS.', 'Mumbai', 'AVAILABLE'),

(11, 'KA-01-UV-2222', 'KTM', '390 Duke Gen-3', 'Bike', 2024, 'Petrol', 'Manual', 2, 1500.00, 4000.00, 
 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=1000&q=80', 
 'Aggressive corner rocket with 45 PS power output, cornering ABS, traction control, launch control, and adjustable WP APEX suspension.', 'Bengaluru', 'AVAILABLE'),

(12, 'MH-12-WX-3333', 'Yamaha', 'MT-15 V2', 'Bike', 2023, 'Petrol', 'Manual', 2, 850.00, 2500.00, 
 'https://images.unsplash.com/photo-1609630875171-b1321377ee65?auto=format&fit=crop&w=1000&q=80', 
 'Hyper Naked streetfighter featuring Variable Valve Actuation (VVA), inverted front forks, assist & slipper clutch, and razor-sharp agility.', 'Pune', 'AVAILABLE'),

(13, 'KA-03-YZ-4444', 'Ather', '450X Gen 3', 'Bike', 2024, 'Electric', 'Automatic', 2, 650.00, 2000.00, 
 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=1000&q=80', 
 'High-performance electric scooter with Warp mode, 150km true range, 7-inch touchscreen with Google Maps navigation, and fast-charging capability.', 'Bengaluru', 'AVAILABLE')
ON CONFLICT (id) DO NOTHING;

SELECT setval('vehicles_id_seq', (SELECT MAX(id) FROM vehicles));

-- 3. BOOKINGS SEED
INSERT INTO bookings (id, booking_reference, user_id, vehicle_id, pickup_date, return_date, pickup_location, return_location, number_of_days, price_per_day, subtotal, security_deposit, total_amount, booking_status, payment_status, created_at) VALUES
(1, 'VR-2026-000101', 2, 1, '2026-10-10', '2026-10-14', 'Mumbai Airport (T2)', 'Mumbai Airport (T2)', 4, 2800.00, 11200.00, 5000.00, 16200.00, 'CONFIRMED', 'PAID', '2026-10-01 10:30:00+05:30'),
(2, 'VR-2026-000102', 3, 2, '2026-10-04', '2026-10-07', 'Koramangala, Bengaluru', 'Indiranagar, Bengaluru', 3, 3200.00, 9600.00, 6000.00, 15600.00, 'ACTIVE', 'PAID', '2026-10-02 14:15:00+05:30'),
(3, 'VR-2026-000103', 4, 5, '2026-09-20', '2026-09-23', 'Andheri West, Mumbai', 'Andheri West, Mumbai', 3, 1400.00, 4200.00, 3000.00, 7200.00, 'COMPLETED', 'PAID', '2026-09-18 09:00:00+05:30')
ON CONFLICT (id) DO NOTHING;

SELECT setval('bookings_id_seq', (SELECT MAX(id) FROM bookings));

-- 4. PAYMENTS SEED
INSERT INTO payments (id, booking_id, amount, payment_method, transaction_reference, payment_status, paid_at, created_at) VALUES
(1, 1, 16200.00, 'UPI', 'UPI-TXN-98472918', 'PAID', '2026-10-01 10:32:00+05:30', '2026-10-01 10:32:00+05:30'),
(2, 2, 15600.00, 'Card', 'CARD-TXN-11223344', 'PAID', '2026-10-02 14:18:00+05:30', '2026-10-02 14:18:00+05:30'),
(3, 3, 7200.00, 'Cash', 'CASH-REF-88776655', 'PAID', '2026-09-20 10:00:00+05:30', '2026-09-20 10:00:00+05:30')
ON CONFLICT (id) DO NOTHING;

SELECT setval('payments_id_seq', (SELECT MAX(id) FROM payments));

-- 5. RENTAL RECORDS SEED
INSERT INTO rental_records (id, booking_id, pickup_datetime, return_datetime, pickup_odometer, return_odometer, fuel_level_pickup, fuel_level_return, additional_charges, damage_charges, notes) VALUES
(1, 2, '2026-10-04 10:00:00+05:30', NULL, 18500, 0, '100%', '0%', 0.00, 0.00, 'Vehicle handed over with pristine condition and original documents in glovebox.'),
(2, 3, '2026-09-20 10:00:00+05:30', '2026-09-23 18:30:00+05:30', 32100, 32480, '100%', '100%', 0.00, 0.00, 'Returned on time with clean exterior and full tank. Deposit refunded.')
ON CONFLICT (id) DO NOTHING;

SELECT setval('rental_records_id_seq', (SELECT MAX(id) FROM rental_records));

-- 6. AUDIT LOGS SEED
INSERT INTO audit_logs (id, user_id, action, entity_type, entity_id, description, created_at) VALUES
(1, 1, 'SYSTEM_INITIALIZATION', 'SYSTEM', '1', 'Initial database schema and vehicle inventory configured in Supabase.', NOW()),
(2, 2, 'BOOKING_CREATED', 'BOOKING', 'VR-2026-000101', 'Booking created by Rahul Sharma for Tata Nexon.', NOW()),
(3, 1, 'BOOKING_CONFIRMED', 'BOOKING', 'VR-2026-000101', 'Booking confirmed by administrator.', NOW()),
(4, 1, 'RENTAL_PICKUP', 'BOOKING', 'VR-2026-000102', 'Vehicle picked up for booking VR-2026-000102. Odometer: 18500.', NOW())
ON CONFLICT (id) DO NOTHING;

SELECT setval('audit_logs_id_seq', (SELECT MAX(id) FROM audit_logs));
