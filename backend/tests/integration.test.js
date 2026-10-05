/**
 * Complete Workflow Integration Test
 * Verifies End-to-End API and business rules
 */
const { initDB } = require('../config/db');
const authService = require('../services/authService');
const vehicleService = require('../services/vehicleService');
const bookingService = require('../services/bookingService');
const paymentService = require('../services/paymentService');
const rentalService = require('../services/rentalService');
const dashboardService = require('../services/dashboardService');
const customerService = require('../services/customerService');
const { BOOKING_STATUS, VEHICLE_STATUS, PAYMENT_STATUS, PAYMENT_METHODS } = require('../config/constants');

const runTests = async () => {
  console.log('\n🧪 ========================================================');
  console.log('🧪 STARTING COMPREHENSIVE INTEGRATION TESTS');
  console.log('🧪 ========================================================\n');

  let passed = 0;
  let failed = 0;

  const assert = (condition, title) => {
    if (condition) {
      console.log(`  ✅ PASS: ${title}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${title}`);
      failed++;
    }
  };

  try {
    // Step 0: Init DB
    await initDB();
    assert(true, 'Database initialized successfully');

    // Step 1: Admin Login
    console.log('\n--- Test 1: Admin Authentication ---');
    const adminLogin = await authService.login({
      email: 'admin@vehiclerental.com',
      password: 'Admin@123'
    });
    assert(adminLogin.user.role === 'ADMIN', 'Admin logged in with ADMIN role');
    assert(Boolean(adminLogin.token), 'Admin JWT token received');

    // Step 2: Customer Registration
    console.log('\n--- Test 2: Customer Registration ---');
    const testEmail = `testuser_${Date.now()}@example.com`;
    const regResult = await authService.register({
      name: 'Test Customer',
      email: testEmail,
      phone: '+91 9988776655',
      password: 'Password@123'
    });
    assert(regResult.user.email === testEmail, 'Customer registered successfully');
    assert(regResult.user.role === 'CUSTOMER', 'Registered user has CUSTOMER role');

    // Duplicate email check
    try {
      await authService.register({
        name: 'Duplicate Customer',
        email: testEmail,
        phone: '+91 9988776655',
        password: 'Password@123'
      });
      assert(false, 'Should prevent duplicate email registration');
    } catch (err) {
      assert(err.statusCode === 409, 'Duplicate email correctly rejected with 409 Conflict');
    }

    // Step 3: Vehicle Catalog & Search Filtering
    console.log('\n--- Test 3: Vehicle Catalog & Filtering ---');
    const allVehicles = await vehicleService.getVehicles({}, false);
    assert(allVehicles.length >= 10, `Found ${allVehicles.length} available vehicles in catalog`);

    const suvs = await vehicleService.getVehicles({ category: 'SUV' }, false);
    assert(suvs.every(v => v.category === 'SUV'), 'Category filter correctly isolates SUVs');

    const searchRes = await vehicleService.getVehicles({ search: 'Thar' }, false);
    assert(searchRes.length > 0 && searchRes[0].model.includes('Thar'), 'Search filter finds Mahindra Thar');

    // Step 4: Availability & Overlap Check
    console.log('\n--- Test 4: Availability & Overlap Check ---');
    const targetVehicle = allVehicles[0];
    const pickupDate = '2026-11-01';
    const returnDate = '2026-11-05'; // 4 days

    const avail1 = await vehicleService.checkAvailability(targetVehicle.id, pickupDate, returnDate);
    assert(avail1.available === true, 'Vehicle is available for new future date range');
    assert(avail1.pricing.days === 4, 'Rental days calculated as 4');
    assert(avail1.pricing.subtotal === 4 * Number(targetVehicle.price_per_day), 'Backend subtotal accurately computed from vehicle price');

    // Step 5: Booking Creation
    console.log('\n--- Test 5: Booking Creation ---');
    const booking = await bookingService.createBooking({
      userId: regResult.user.id,
      vehicleId: targetVehicle.id,
      pickupDate,
      returnDate,
      pickupLocation: 'Mumbai Airport Terminal 2',
      returnLocation: 'Mumbai Airport Terminal 2'
    });
    assert(booking.booking_reference.startsWith('VR-'), `Booking created with reference ${booking.booking_reference}`);
    assert(booking.booking_status === BOOKING_STATUS.PENDING, 'New booking has status PENDING');
    assert(booking.payment_status === PAYMENT_STATUS.PENDING, 'New booking has payment status PENDING');

    // Step 6: Overlap Prevention (Double Booking)
    console.log('\n--- Test 6: Overlap Prevention (Strict Double-Booking Check) ---');
    const availOverlap = await vehicleService.checkAvailability(targetVehicle.id, '2026-11-02', '2026-11-04');
    assert(availOverlap.available === false, 'Vehicle availability returns false for overlapping period');

    try {
      await bookingService.createBooking({
        userId: regResult.user.id,
        vehicleId: targetVehicle.id,
        pickupDate: '2026-11-03',
        returnDate: '2026-11-06',
        pickupLocation: 'Bandra',
        returnLocation: 'Bandra'
      });
      assert(false, 'Should prevent overlapping booking');
    } catch (err) {
      assert(err.statusCode === 409, 'Overlapping booking blocked with 409 Conflict');
    }

    // Step 7: Payment Simulation
    console.log('\n--- Test 7: Simulated Payment Processing ---');
    const paymentRes = await paymentService.processPayment({
      bookingId: booking.id,
      user: regResult.user,
      paymentMethod: PAYMENT_METHODS.CARD,
      simulateSuccess: true
    });
    assert(paymentRes.payment.payment_status === PAYMENT_STATUS.PAID, 'Payment successfully processed');
    assert(paymentRes.booking.payment_status === PAYMENT_STATUS.PAID, 'Booking payment status updated to PAID');
    assert(paymentRes.booking.booking_status === BOOKING_STATUS.CONFIRMED, 'Booking auto-confirmed upon payment');

    // Step 8: Rental Pickup
    console.log('\n--- Test 8: Rental Pickup Workflow ---');
    const pickupRes = await rentalService.recordPickup(booking.id, adminLogin.user.id, {
      pickupOdometer: 25400,
      fuelLevel: '100%',
      notes: 'Vehicle inspected and keys handed over'
    });
    assert(pickupRes.booking_status === BOOKING_STATUS.ACTIVE, 'Booking status updated to ACTIVE');

    const updatedVehicleAfterPickup = await vehicleService.getVehicleById(targetVehicle.id);
    assert(updatedVehicleAfterPickup.status === VEHICLE_STATUS.RENTED, 'Vehicle status updated to RENTED');

    // Step 9: Cancellation Prevention on Active Rental
    console.log('\n--- Test 9: Cancellation Business Rules ---');
    try {
      await bookingService.cancelBooking(booking.id, regResult.user, 'Changed my mind');
      assert(false, 'Should not allow cancelling an ACTIVE rental');
    } catch (err) {
      assert(err.statusCode === 400, 'Customer cannot cancel ACTIVE rental in progress');
    }

    // Step 10: Rental Return & Completion
    console.log('\n--- Test 10: Rental Return Workflow ---');
    const returnRes = await rentalService.recordReturn(booking.id, adminLogin.user.id, {
      returnOdometer: 25850,
      fuelLevel: '100%',
      additionalCharges: 0,
      damageCharges: 0,
      notes: 'Clean return, 450 km driven'
    });
    assert(returnRes.booking_status === BOOKING_STATUS.COMPLETED, 'Booking status updated to COMPLETED');

    const updatedVehicleAfterReturn = await vehicleService.getVehicleById(targetVehicle.id);
    assert(updatedVehicleAfterReturn.status === VEHICLE_STATUS.AVAILABLE, 'Vehicle returned to AVAILABLE');

    // Step 11: Admin Dashboard Statistics
    console.log('\n--- Test 11: Admin Dashboard Statistics ---');
    const adminStats = await dashboardService.getAdminDashboardStats();
    assert(adminStats.vehicles.total >= 10, 'Admin dashboard reports vehicle count');
    assert(adminStats.bookings.total >= 1, 'Admin dashboard reports total bookings');
    assert(adminStats.bookings.revenue > 0, `Admin dashboard calculated revenue: ₹${adminStats.bookings.revenue}`);

    // Step 12: Customer Management
    console.log('\n--- Test 12: Customer Management ---');
    const customers = await customerService.getAllCustomers();
    assert(customers.length >= 2, `Admin lists customers (${customers.length} total)`);
    assert(customers.every(c => !c.password_hash), 'Passwords are NEVER exposed in customer management APIs');

  } catch (fatal) {
    console.error('Fatal test error:', fatal);
    failed++;
  }

  console.log('\n🧪 ========================================================');
  console.log(`🧪 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('🧪 ========================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
};

runTests();
