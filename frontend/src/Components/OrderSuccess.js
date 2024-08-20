import React from 'react';

export default function OrderSuccess({ orderNumber }) {
  return (
    <div className="order-success-form">
      <h2>Order Placed Successfully!</h2>
      <p className="order-success-p">Your order number is: #{orderNumber}</p>
    </div>
  );
}
