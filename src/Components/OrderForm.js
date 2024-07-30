import React, { useEffect, useState } from 'react';
import ProductCard from './ProductCard';

export default function OrderForm() {
  // use state
  const [products, setProducts] = useState([]);
  const [order, setOrder] = useState([]);
  const [resetSignal, setResetSignal] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [completeOrder, setCompleteOrder] = useState([]);
  const [orderTimestamp, setOrderTimestamp] = useState('');
  const [currentTimestamp, setCurrentTimestamp] = useState('');
  const [futureTimestamp, setFutureTimestamp] = useState('');

  const [errorMessage, setErrorMessage] = useState('');

  // fetching json file with products list
  useEffect(() => {
    fetch('products.json').then((response) =>
      response.json().then((data) => setProducts(data))
    );
  }, []);

  // handle the quantity change
  const handleQuantityChange = (productId, quantity) => {
    setOrder((prevOrder) => ({
      ...prevOrder,
      [productId]: quantity,
    }));
  };

  // handle submission by rendering confirmation box
  const handleSubmit = (e) => {
    e.preventDefault();

    // Check if all quantities are zero or not set
    const isEmptyOrder = products.every((product) => !order[product.id]);

    if (isEmptyOrder) {
      setErrorMessage('Your order is empty. Please add at least one item.');
      return;
    }

    // setting the complete order
    const newCompleteOrder = products.map((product) => ({
      id: product.id,
      name: product.name,
      quantity: order[product.id] || 0,
    }));
    setCompleteOrder(newCompleteOrder);

    // setting current timestamp
    const currentDate = new Date();
    const currentTimestamp = currentDate.toLocaleString();
    setCurrentTimestamp(currentTimestamp);

    // setting bake day
    currentDate.setDate(currentDate.getDate() + 3);
    const threeDaysFromNow = currentDate.toLocaleDateString();
    setFutureTimestamp(threeDaysFromNow);

    setShowConfirmation(true); // Show confirmation dialog
    setErrorMessage(''); // Clear any previous error messages
  };

  // clear order form
  const handleClear = () => {
    setOrder({});
    setResetSignal(!resetSignal);
  };

  // handle cancellation
  const handleCancel = () => {
    setShowConfirmation(false);
  };

  // handle confirm order
  const handleConfirm = () => {
    console.log('Order confirmed:', completeOrder, 'at', orderTimestamp);
    setOrder({}); // clears order state
    setResetSignal(!resetSignal); // toggles reset
    setShowConfirmation(false); // Close the confirmation dialog
  };

  return (
    <div>
      {errorMessage && <div className="error-message">{errorMessage}</div>}
      <form onSubmit={handleSubmit}>
        <div className="order-form">
          {products.map((product) => {
            return (
              <ProductCard
                key={product.id}
                product={product}
                onQuantityChange={handleQuantityChange}
                resetSignal={resetSignal}
              />
            );
          })}
        </div>
        <div className="button-field">
          <ul>
            <li>
              <button className="submit-button" type="submit">
                Submit Order
              </button>
            </li>
            <li>
              <button
                className="clear-button"
                type="button"
                onClick={handleClear}
              >
                Clear Order
              </button>
            </li>
          </ul>
        </div>
      </form>

      {showConfirmation && (
        <div className="confirmation-dialog-overlay">
          <div className="confirmation-dialog">
            <h2>Confirm Order</h2>
            <p>Are you sure you want to submit this order?</p>
            <ul>
              {completeOrder.map((item) => (
                <li key={item.id}>
                  <span>{item.name}</span>: <span>{item.quantity}</span>
                </li>
              ))}
            </ul>
            <p>Order Time: {currentTimestamp}</p>
            <p>Bake Day: {futureTimestamp}</p>
            <button className="confirm-button" onClick={handleConfirm}>
              Yes, I'm sure.
            </button>
            <button className="confirm-button" onClick={handleCancel}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
