const db = require('../config/db');
const { BOOKING_STATUS, VEHICLE_STATUS } = require('../config/constants');
const { isBookingOverdue } = require('../utils/dateUtils');

/**
 * Fetch comprehensive metrics for Admin Dashboard
 */
const getAdminDashboardStats = async () => {
  // 1. Vehicle counts
  const vehicleStats = await db.query(`
    SELECT
      COUNT(*) as total_vehicles,
      SUM(CASE WHEN status = 'AVAILABLE' THEN 1 ELSE 0 END) as available_vehicles,
      SUM(CASE WHEN status = 'RENTED' THEN 1 ELSE 0 END) as rented_vehicles,
      SUM(CASE WHEN status = 'MAINTENANCE' THEN 1 ELSE 0 END) as maintenance_vehicles,
      SUM(CASE WHEN status = 'INACTIVE' THEN 1 ELSE 0 END) as inactive_vehicles
    FROM vehicles
  `);

  // 2. Customer count
  const customerStats = await db.query(`
    SELECT COUNT(*) as total_customers FROM users WHERE role = 'CUSTOMER'
  `);

  // 3. Booking stats
  const bookingStats = await db.query(`
    SELECT
      COUNT(*) as total_bookings,
      SUM(CASE WHEN booking_status = 'PENDING' THEN 1 ELSE 0 END) as pending_bookings,
      SUM(CASE WHEN booking_status = 'CONFIRMED' THEN 1 ELSE 0 END) as confirmed_bookings,
      SUM(CASE WHEN booking_status = 'ACTIVE' THEN 1 ELSE 0 END) as active_rentals,
      SUM(CASE WHEN booking_status = 'COMPLETED' THEN 1 ELSE 0 END) as completed_rentals,
      SUM(CASE WHEN booking_status = 'CANCELLED' THEN 1 ELSE 0 END) as cancelled_bookings,
      SUM(CASE WHEN payment_status = 'PAID' THEN total_amount ELSE 0 END) as total_revenue
    FROM bookings
  `);

  // 4. Overdue rentals detection
  const activeBookings = await db.query(`
    SELECT b.*,
           v.brand, v.model, v.vehicle_number, v.category,
           u.name as customer_name, u.email as customer_email, u.phone as customer_phone
    FROM bookings b
    JOIN vehicles v ON b.vehicle_id = v.id
    JOIN users u ON b.user_id = u.id
    WHERE b.booking_status = 'ACTIVE'
  `);

  const overdueBookings = activeBookings.filter(b => isBookingOverdue(b));

  // 5. Recent 5 bookings
  const recentBookings = await db.query(`
    SELECT b.*,
           v.brand, v.model, v.vehicle_number, v.image_url,
           u.name as customer_name, u.email as customer_email
    FROM bookings b
    JOIN vehicles v ON b.vehicle_id = v.id
    JOIN users u ON b.user_id = u.id
    ORDER BY b.created_at DESC
    LIMIT 5
  `);

  // 6. Category distribution
  const categoryStats = await db.query(`
    SELECT category, COUNT(*) as count
    FROM vehicles
    GROUP BY category
  `);

  return {
    vehicles: {
      total: Number(vehicleStats[0]?.total_vehicles || 0),
      available: Number(vehicleStats[0]?.available_vehicles || 0),
      rented: Number(vehicleStats[0]?.rented_vehicles || 0),
      maintenance: Number(vehicleStats[0]?.maintenance_vehicles || 0),
      inactive: Number(vehicleStats[0]?.inactive_vehicles || 0)
    },
    customers: {
      total: Number(customerStats[0]?.total_customers || 0)
    },
    bookings: {
      total: Number(bookingStats[0]?.total_bookings || 0),
      pending: Number(bookingStats[0]?.pending_bookings || 0),
      confirmed: Number(bookingStats[0]?.confirmed_bookings || 0),
      active: Number(bookingStats[0]?.active_rentals || 0),
      completed: Number(bookingStats[0]?.completed_rentals || 0),
      cancelled: Number(bookingStats[0]?.cancelled_bookings || 0),
      overdue: overdueBookings.length,
      revenue: Number(bookingStats[0]?.total_revenue || 0)
    },
    overdueBookings,
    recentBookings,
    categoryDistribution: categoryStats
  };
};

/**
 * Fetch customer dashboard data
 */
const getCustomerDashboardStats = async (userId) => {
  const allBookings = await db.query(`
    SELECT b.*,
           v.brand, v.model, v.vehicle_number, v.category, v.image_url,
           v.fuel_type, v.transmission, v.location as vehicle_location
    FROM bookings b
    JOIN vehicles v ON b.vehicle_id = v.id
    WHERE b.user_id = ?
    ORDER BY b.created_at DESC
  `, [userId]);

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  const activeRentals = allBookings.filter(b => b.booking_status === BOOKING_STATUS.ACTIVE);
  const upcomingBookings = allBookings.filter(b => 
    (b.booking_status === BOOKING_STATUS.CONFIRMED || b.booking_status === BOOKING_STATUS.PENDING) &&
    b.pickup_date >= todayStr
  );
  const completedRentals = allBookings.filter(b => b.booking_status === BOOKING_STATUS.COMPLETED);
  const cancelledBookings = allBookings.filter(b => b.booking_status === BOOKING_STATUS.CANCELLED);

  const totalSpent = allBookings
    .filter(b => b.payment_status === 'PAID')
    .reduce((sum, b) => sum + Number(b.total_amount), 0);

  return {
    activeRentals,
    upcomingBookings,
    completedRentals,
    cancelledBookings,
    counts: {
      total: allBookings.length,
      active: activeRentals.length,
      upcoming: upcomingBookings.length,
      completed: completedRentals.length,
      cancelled: cancelledBookings.length,
      totalSpent
    }
  };
};

module.exports = {
  getAdminDashboardStats,
  getCustomerDashboardStats
};
