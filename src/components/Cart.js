import React, { useState } from 'react';

function Cart() {
  const [showQR, setShowQR] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('');
  
  // Assuming you have cartItems array with price property
  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handlePaymentMethod = (method) => {
    setPaymentMethod(method);
    if (method === 'upi') {
      setShowQR(true);
    } else {
      setShowQR(false);
    }
  };

  const generateUPILink = () => {
    const amount = calculateTotal();
    return `upi://pay?pa=8122904068@ybl&pn=StoreName&am=${amount}&cu=INR`;
  };

  return (
    <div className="cart-container">
      {/* ... existing cart items ... */}

      {/* Total Calculator */}
      <div className="cart-total">
        <h3>Cart Total</h3>
        <div className="total-amount">₹{calculateTotal().toFixed(2)}</div>
      </div>

      {/* Payment Options */}
      <div className="payment-options">
        <button onClick={() => handlePaymentMethod('card')}>Pay with Card</button>
        <button onClick={() => handlePaymentMethod('upi')}>Pay with UPI</button>
      </div>

      {/* QR Code Modal/iframe */}
      {showQR && (
        <div className="qr-modal">
          <div className="qr-container">
            <button className="close-btn" onClick={() => setShowQR(false)}>×</button>
            <iframe
              src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(generateUPILink())}`}
              title="UPI Payment QR"
              width="250"
              height="250"
              frameBorder="0"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default Cart; 