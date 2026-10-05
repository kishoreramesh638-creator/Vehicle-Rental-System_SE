const db = require('../config/db');
const { VEHICLE_STATUS, DEFAULT_SECURITY_DEPOSITS } = require('../config/constants');
const { validateBookingDates, calculateRentalDays } = require('../utils/dateUtils');
const auditService = require('./auditService');

/**
 * Fetch vehicles with flexible filters, sorting, and optional date availability filtering
 */
const getVehicles = async (query = {}, isAdmin = false) => {
  let sql = `SELECT * FROM vehicles WHERE 1=1`;
  const params = [];

  // Status filtering: Public users only see AVAILABLE by default unless explicitly searching
  if (!isAdmin) {
    if (query.status) {
      sql += ` AND status = ?`;
      params.push(query.status);
    } else {
      sql += ` AND status = 'AVAILABLE'`;
    }
  } else if (query.status) {
    sql += ` AND status = ?`;
    params.push(query.status);
  }

  // Search keyword (brand, model, vehicle_number)
  if (query.search && query.search.trim()) {
    const term = `%${query.search.trim()}%`;
    sql += ` AND (LOWER(brand) LIKE LOWER(?) OR LOWER(model) LIKE LOWER(?) OR LOWER(vehicle_number) LIKE LOWER(?))`;
    params.push(term, term, term);
  }

  // Category filter
  if (query.category && query.category !== 'All') {
    sql += ` AND category = ?`;
    params.push(query.category);
  }

  // Fuel type filter
  if (query.fuel_type && query.fuel_type !== 'All') {
    sql += ` AND fuel_type = ?`;
    params.push(query.fuel_type);
  }

  // Transmission filter
  if (query.transmission && query.transmission !== 'All') {
    sql += ` AND transmission = ?`;
    params.push(query.transmission);
  }

  // Seating capacity filter
  if (query.seating_capacity && query.seating_capacity !== 'All') {
    sql += ` AND seating_capacity = ?`;
    params.push(Number(query.seating_capacity));
  }

  // Price range
  if (query.min_price) {
    sql += ` AND price_per_day >= ?`;
    params.push(Number(query.min_price));
  }
  if (query.max_price) {
    sql += ` AND price_per_day <= ?`;
    params.push(Number(query.max_price));
  }

  // Location filter
  if (query.location && query.location !== 'All') {
    sql += ` AND LOWER(location) = LOWER(?)`;
    params.push(query.location);
  }

  // Date-based availability filter (if pickup and return dates are provided)
  if (query.pickup_date && query.return_date) {
    const dateValidation = validateBookingDates(query.pickup_date, query.return_date);
    if (dateValidation.valid) {
      sql += ` AND id NOT IN (
        SELECT vehicle_id FROM bookings
        WHERE booking_status IN ('PENDING', 'CONFIRMED', 'ACTIVE', 'OVERDUE')
          AND pickup_date < ? AND return_date > ?
      )`;
      params.push(query.return_date, query.pickup_date);
    }
  }

  // Sorting
  switch (query.sort) {
    case 'price_asc':
      sql += ` ORDER BY price_per_day ASC`;
      break;
    case 'price_desc':
      sql += ` ORDER BY price_per_day DESC`;
      break;
    case 'year_desc':
      sql += ` ORDER BY year DESC`;
      break;
    case 'name_asc':
      sql += ` ORDER BY brand ASC, model ASC`;
      break;
    default:
      sql += ` ORDER BY id ASC`;
  }

  const vehicles = await db.query(sql, params);
  return vehicles;
};

/**
 * Get vehicle by ID
 */
const getVehicleById = async (id) => {
  const rows = await db.query('SELECT * FROM vehicles WHERE id = ?', [id]);
  if (rows.length === 0) {
    const error = new Error('Vehicle not found');
    error.statusCode = 404;
    throw error;
  }
  return rows[0];
};

/**
 * Check vehicle availability and calculate prospective price
 */
const checkAvailability = async (id, pickupDate, returnDate) => {
  const vehicle = await getVehicleById(id);

  const dateCheck = validateBookingDates(pickupDate, returnDate);
  if (!dateCheck.valid) {
    return {
      available: false,
      reason: dateCheck.message,
      vehicle
    };
  }

  if (vehicle.status === VEHICLE_STATUS.MAINTENANCE) {
    return {
      available: false,
      reason: 'This vehicle is currently under scheduled maintenance',
      vehicle
    };
  }

  if (vehicle.status === VEHICLE_STATUS.INACTIVE) {
    return {
      available: false,
      reason: 'This vehicle is currently inactive and not available for booking',
      vehicle
    };
  }

  // Check overlapping active bookings
  const overlaps = await db.query(
    `SELECT id, booking_reference, pickup_date, return_date 
     FROM bookings 
     WHERE vehicle_id = ? 
       AND booking_status IN ('PENDING', 'CONFIRMED', 'ACTIVE', 'OVERDUE')
       AND pickup_date < ? 
       AND return_date > ?`,
    [id, returnDate, pickupDate]
  );

  const days = calculateRentalDays(pickupDate, returnDate);
  const pricePerDay = Number(vehicle.price_per_day);
  const subtotal = days * pricePerDay;
  const securityDeposit = Number(vehicle.security_deposit || DEFAULT_SECURITY_DEPOSITS[vehicle.category] || 5000);
  const total = subtotal + securityDeposit;

  if (overlaps.length > 0) {
    return {
      available: false,
      reason: 'Vehicle is already reserved for overlapping dates',
      overlapDetails: overlaps[0],
      vehicle,
      pricing: {
        days,
        pricePerDay,
        subtotal,
        securityDeposit,
        total
      }
    };
  }

  return {
    available: true,
    reason: 'Vehicle is available for the selected dates',
    vehicle,
    pricing: {
      days,
      pricePerDay,
      subtotal,
      securityDeposit,
      total
    }
  };
};

/**
 * Create a new vehicle (Admin only)
 */
const createVehicle = async (data, adminId) => {
  const {
    vehicle_number,
    brand,
    model,
    category,
    year,
    fuel_type,
    transmission,
    seating_capacity,
    price_per_day,
    security_deposit,
    image_url,
    description,
    location,
    status
  } = data;

  if (!vehicle_number || !brand || !model || !category || !price_per_day) {
    const error = new Error('Vehicle number, brand, model, category, and price per day are required');
    error.statusCode = 400;
    throw error;
  }

  // Check duplicate vehicle number
  const existing = await db.query('SELECT id FROM vehicles WHERE LOWER(vehicle_number) = ?', [vehicle_number.trim().toLowerCase()]);
  if (existing.length > 0) {
    const error = new Error(`Vehicle number "${vehicle_number}" already exists in the system`);
    error.statusCode = 409;
    throw error;
  }

  const deposit = security_deposit ? Number(security_deposit) : (DEFAULT_SECURITY_DEPOSITS[category] || 5000);

  const result = await db.query(
    `INSERT INTO vehicles (
      vehicle_number, brand, model, category, year, fuel_type, 
      transmission, seating_capacity, price_per_day, security_deposit, 
      image_url, description, location, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      vehicle_number.trim().toUpperCase(),
      brand.trim(),
      model.trim(),
      category,
      Number(year) || new Date().getFullYear(),
      fuel_type || 'Petrol',
      transmission || 'Automatic',
      Number(seating_capacity) || 5,
      Number(price_per_day),
      deposit,
      image_url || null,
      description || '',
      location || 'Mumbai',
      status || VEHICLE_STATUS.AVAILABLE
    ]
  );

  const vehicleId = result.insertId;

  await auditService.logAction({
    userId: adminId,
    action: 'VEHICLE_CREATED',
    entityType: 'VEHICLE',
    entityId: vehicleId,
    description: `Added vehicle: ${brand} ${model} (${vehicle_number})`
  });

  return getVehicleById(vehicleId);
};

/**
 * Update existing vehicle (Admin only)
 */
const updateVehicle = async (id, data, adminId) => {
  const vehicle = await getVehicleById(id);

  // Check if changing vehicle number to one that already exists on another vehicle
  if (data.vehicle_number && data.vehicle_number.trim().toUpperCase() !== vehicle.vehicle_number) {
    const existing = await db.query(
      'SELECT id FROM vehicles WHERE LOWER(vehicle_number) = ? AND id != ?',
      [data.vehicle_number.trim().toLowerCase(), id]
    );
    if (existing.length > 0) {
      const error = new Error(`Vehicle number "${data.vehicle_number}" already in use by another vehicle`);
      error.statusCode = 409;
      throw error;
    }
  }

  const updatedFields = {
    vehicle_number: data.vehicle_number ? data.vehicle_number.trim().toUpperCase() : vehicle.vehicle_number,
    brand: data.brand ? data.brand.trim() : vehicle.brand,
    model: data.model ? data.model.trim() : vehicle.model,
    category: data.category || vehicle.category,
    year: data.year ? Number(data.year) : vehicle.year,
    fuel_type: data.fuel_type || vehicle.fuel_type,
    transmission: data.transmission || vehicle.transmission,
    seating_capacity: data.seating_capacity ? Number(data.seating_capacity) : vehicle.seating_capacity,
    price_per_day: data.price_per_day ? Number(data.price_per_day) : vehicle.price_per_day,
    security_deposit: data.security_deposit !== undefined ? Number(data.security_deposit) : vehicle.security_deposit,
    image_url: data.image_url !== undefined ? data.image_url : vehicle.image_url,
    description: data.description !== undefined ? data.description : vehicle.description,
    location: data.location || vehicle.location,
    status: data.status || vehicle.status
  };

  await db.query(
    `UPDATE vehicles SET 
      vehicle_number = ?, brand = ?, model = ?, category = ?, year = ?, 
      fuel_type = ?, transmission = ?, seating_capacity = ?, price_per_day = ?, 
      security_deposit = ?, image_url = ?, description = ?, location = ?, status = ?
     WHERE id = ?`,
    [
      updatedFields.vehicle_number,
      updatedFields.brand,
      updatedFields.model,
      updatedFields.category,
      updatedFields.year,
      updatedFields.fuel_type,
      updatedFields.transmission,
      updatedFields.seating_capacity,
      updatedFields.price_per_day,
      updatedFields.security_deposit,
      updatedFields.image_url,
      updatedFields.description,
      updatedFields.location,
      updatedFields.status,
      id
    ]
  );

  await auditService.logAction({
    userId: adminId,
    action: 'VEHICLE_UPDATED',
    entityType: 'VEHICLE',
    entityId: id,
    description: `Updated vehicle details: ${updatedFields.brand} ${updatedFields.model}`
  });

  return getVehicleById(id);
};

/**
 * Update vehicle status specifically (AVAILABLE, RENTED, MAINTENANCE, INACTIVE)
 */
const updateVehicleStatus = async (id, status, adminId) => {
  if (!Object.values(VEHICLE_STATUS).includes(status)) {
    const error = new Error(`Invalid status. Must be one of: ${Object.values(VEHICLE_STATUS).join(', ')}`);
    error.statusCode = 400;
    throw error;
  }

  const vehicle = await getVehicleById(id);
  await db.query('UPDATE vehicles SET status = ? WHERE id = ?', [status, id]);

  await auditService.logAction({
    userId: adminId,
    action: 'VEHICLE_STATUS_UPDATED',
    entityType: 'VEHICLE',
    entityId: id,
    description: `Changed vehicle ${vehicle.vehicle_number} status from ${vehicle.status} to ${status}`
  });

  return getVehicleById(id);
};

/**
 * Delete vehicle (or mark inactive if historical bookings exist)
 */
const deleteVehicle = async (id, adminId) => {
  const vehicle = await getVehicleById(id);

  // Check active bookings
  const activeBookings = await db.query(
    `SELECT id FROM bookings WHERE vehicle_id = ? AND booking_status IN ('PENDING', 'CONFIRMED', 'ACTIVE', 'OVERDUE')`,
    [id]
  );

  if (activeBookings.length > 0) {
    const error = new Error('Cannot delete vehicle with active or upcoming bookings. Please cancel or complete them first.');
    error.statusCode = 400;
    throw error;
  }

  // Check if historical bookings exist
  const historical = await db.query('SELECT id FROM bookings WHERE vehicle_id = ?', [id]);
  if (historical.length > 0) {
    // Soft delete by setting status to INACTIVE to preserve foreign key integrity
    await db.query('UPDATE vehicles SET status = ? WHERE id = ?', [VEHICLE_STATUS.INACTIVE, id]);
    await auditService.logAction({
      userId: adminId,
      action: 'VEHICLE_DEACTIVATED',
      entityType: 'VEHICLE',
      entityId: id,
      description: `Deactivated vehicle ${vehicle.vehicle_number} (preserved due to historical bookings)`
    });
    return { message: 'Vehicle has historical bookings and was set to INACTIVE instead of deleted.' };
  }

  await db.query('DELETE FROM vehicles WHERE id = ?', [id]);
  await auditService.logAction({
    userId: adminId,
    action: 'VEHICLE_DELETED',
    entityType: 'VEHICLE',
    entityId: id,
    description: `Deleted vehicle: ${vehicle.vehicle_number}`
  });

  return { message: 'Vehicle deleted successfully' };
};

module.exports = {
  getVehicles,
  getVehicleById,
  checkAvailability,
  createVehicle,
  updateVehicle,
  updateVehicleStatus,
  deleteVehicle
};
