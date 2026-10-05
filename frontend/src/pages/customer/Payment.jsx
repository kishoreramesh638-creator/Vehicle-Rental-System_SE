import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  CreditCard, QrCode, Banknote, ShieldCheck, CheckCircle2, 
  AlertCircle, ArrowRight, Lock, Check 
} from 'lucide-react';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

export const Payment = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  // Payment form state
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [upiId, setUpiId] = useState('customer@okhdfcbank');
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8892');
  const [cardExpiry, setCardExpiry] = useState('08/29');
  const [cardCvv, setCardCvv] = useState('•••');

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const res = await api.get(`/bookings/${bookingId}`);
        const b = res.data?.booking;
        setBooking(b);
        if (b?.payment_status === 'PAID') {
          navigate(`/confirmation/${bookingId}`, { replace: true });
        }
      } catch (err) {
        setError(err.message || 'Could not find booking for payment');
      } finally {
        setLoading(false);
      }
    };
    fetchBooking();
  }, [bookingId, navigate]);

  const handleSimulatePayment = async (simulateSuccess = true) => {
    setProcessing(true);
    setError('');

    try {
      await api.post('/payments', {
        bookingId: booking.id,
        paymentMethod,
        simulateSuccess
      });

      if (simulateSuccess) {
        navigate(`/confirmation/${booking.id}`);
      }
    } catch (err) {
      setError(err.message || 'Payment simulation failed');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Preparing secure payment gateway..." size="lg" />;
  }

  if (!booking) {
    return (
      <div className="max-w-md mx-auto py-16 text-center">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold">Booking Not Found</h2>
        <Link to="/my-bookings" className="text-xs text-emerald-600 font-bold mt-2 block">Back to My Bookings</Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Step Header */}
      <div className="text-center space-y-2">
        <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest block">
          Step 2 of 2: Simulated Checkout
        </span>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Complete Your Payment</h1>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Secure sandbox payment simulation for booking <strong className="text-slate-800">{booking.booking_reference}</strong>.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl overflow-hidden">
        {/* Total Amount Ribbon */}
        <div className="bg-slate-900 text-white p-6 sm:p-8 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Total Payable</span>
            <span className="text-3xl font-black text-emerald-400">
              ₹{Number(booking.total_amount).toLocaleString('en-IN')}
            </span>
          </div>
          <div className="text-right text-xs text-slate-400">
            <span className="block font-medium">{booking.brand} {booking.model}</span>
            <span>{booking.number_of_days} Days ({booking.pickup_date} to {booking.return_date})</span>
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Payment Method Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-3">
              Choose Payment Method
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('UPI')}
                className={`p-3.5 rounded-2xl border text-center transition flex flex-col items-center justify-center space-y-1.5 ${
                  paymentMethod === 'UPI'
                    ? 'border-emerald-600 bg-emerald-50/50 text-emerald-800 font-bold ring-2 ring-emerald-500/20'
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <QrCode className="w-5 h-5 text-emerald-600" />
                <span className="text-xs">UPI / QR</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('Card')}
                className={`p-3.5 rounded-2xl border text-center transition flex flex-col items-center justify-center space-y-1.5 ${
                  paymentMethod === 'Card'
                    ? 'border-emerald-600 bg-emerald-50/50 text-emerald-800 font-bold ring-2 ring-emerald-500/20'
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <CreditCard className="w-5 h-5 text-blue-600" />
                <span className="text-xs">Debit / Credit Card</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('Cash')}
                className={`p-3.5 rounded-2xl border text-center transition flex flex-col items-center justify-center space-y-1.5 ${
                  paymentMethod === 'Cash'
                    ? 'border-emerald-600 bg-emerald-50/50 text-emerald-800 font-bold ring-2 ring-emerald-500/20'
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Banknote className="w-5 h-5 text-amber-600" />
                <span className="text-xs">Cash on Pickup</span>
              </button>
            </div>
          </div>

          {/* Form details per method */}
          {paymentMethod === 'UPI' && (
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-3">
              <span className="text-xs font-bold text-slate-800 block">UPI Instant Payment</span>
              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-1">Virtual Payment Address (VPA)</label>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
              <p className="text-[11px] text-slate-400">Supports Google Pay, PhonePe, Paytm, BHIM.</p>
            </div>
          )}

          {paymentMethod === 'Card' && (
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-3">
              <span className="text-xs font-bold text-slate-800 block">Card Details (Simulation)</span>
              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-1">Card Number</label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-500 block mb-1">Expiry Date</label>
                  <input
                    type="text"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-500 block mb-1">CVV / CVC</label>
                  <input
                    type="password"
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
              <p className="text-[10px] text-slate-400 flex items-center">
                <Lock className="w-3 h-3 mr-1 text-emerald-600" />
                No actual card data is stored or transmitted. This is a testing simulation.
              </p>
            </div>
          )}

          {paymentMethod === 'Cash' && (
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-2">
              <span className="text-xs font-bold text-slate-800 block">Pay with Cash on Pickup</span>
              <p className="text-xs text-slate-600">
                You will hand over the full rental amount of <strong>₹{Number(booking.total_amount).toLocaleString('en-IN')}</strong> (including refundable deposit) at the pickup hub when collecting the vehicle keys.
              </p>
            </div>
          )}

          {/* Simulation CTA buttons */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <button
              onClick={() => handleSimulatePayment(true)}
              disabled={processing}
              className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-sm shadow-md transition shadow-emerald-600/30 flex items-center justify-center space-x-2"
            >
              {processing ? (
                <span>Simulating Payment Processing...</span>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Simulate Successful Payment (₹{Number(booking.total_amount).toLocaleString('en-IN')})</span>
                </>
              )}
            </button>

            <button
              onClick={() => handleSimulatePayment(false)}
              disabled={processing}
              className="w-full py-2.5 px-4 border border-rose-200 hover:bg-rose-50 text-rose-600 rounded-2xl font-bold text-xs transition"
            >
              Simulate Failed / Declined Payment (Test Error Handling)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
