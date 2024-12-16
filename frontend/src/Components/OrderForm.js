import React, { useEffect, useState } from 'react';
import ProductCard from './ProductCard';
import DatePicker from './DatePicker';
import OrderSuccess from './OrderSuccess'; // Import the success component
import { auth } from '../firebase';
import API_BASE_URL from '../api/apiConfig';

export default function OrderForm() {
  // use states
  const [products, setProducts] = useState([]);
  const [order, setOrder] = useState({});
  const [resetSignal, setResetSignal] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false); // State for showing success message
  const [completeOrder, setCompleteOrder] = useState({});
  const [currentTimestamp, setCurrentTimestamp] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showErrorOverlay, setShowErrorOverlay] = useState(false);
  const [orderNumber, setOrderNumber] = useState(null); // State for order number

  // fetching json file saved in public directory with products list
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

  // Handle submission by rendering confirmation box
  const handleSubmit = (e) => {
    e.preventDefault();

    // Check if all quantities are zero or not set
    const isEmptyOrder = products.every((product) => !order[product.id]);
    if (isEmptyOrder) {
      setErrorMessage('Your order is empty. Please add at least one item.');
      setShowErrorOverlay(true); // Show the error overlay
      return;
    }

    // Clear any previous error messages
    setErrorMessage('');
    setShowErrorOverlay(false); // Hide the error overlay if no error

    // setting current timestamp
    const currentDate = new Date();
    const localTime = new Date(
      currentDate.getTime() - currentDate.getTimezoneOffset() * 60000
    );
    const currentTimestamp = localTime.toISOString().slice(0, 16);
    setCurrentTimestamp(currentTimestamp);

    // setting the complete order
    const CompleteOrder = {
      items: products.map((product) => ({
        id: product.id,
        name: product.name,
        quantity: order[product.id] || 0,
      })),
      deliveryDate: selectedDate,
      orderTime: currentTimestamp,
    };
    setCompleteOrder(CompleteOrder);

    // Show confirmation dialog
    setShowConfirmation(true);

    // Clear any previous error messages
    setErrorMessage('');
  };

  // clear order form
  const handleClear = () => {
    setOrder({});
    setSelectedDate('');
    setResetSignal(!resetSignal);
  };

  // handle cancellation
  const handleCancel = () => {
    setShowConfirmation(false);
  };

  // handle confirm order
  const handleConfirm = async () => {
    try {
      const token = await auth.currentUser.getIdToken();

      const response = await fetch(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          items: completeOrder.items,
          deliveryDate: completeOrder.deliveryDate,
          orderTime: completeOrder.orderTime,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setOrderNumber(data.orderNumber); // Set the order number from the response
        setOrder({});
        setSelectedDate('');
        setResetSignal(!resetSignal);
        setShowConfirmation(false);
        setShowSuccess(true); // Show the success message
      } else {
        console.error('Error confirming order:', response.statusText);
      }
    } catch (error) {
      console.error('Error confirming order:', error);
    }
  };

  if (showSuccess) {
    return <OrderSuccess orderNumber={orderNumber} />;
  }

  return (
    <div>
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
        <DatePicker
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
        />
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

      {showErrorOverlay && (
        <div className="confirmation-dialog-overlay">
          <div className="confirmation-dialog">
            <h2>Error</h2>
            <p>{errorMessage}</p>
            <button
              className="confirm-button"
              onClick={() => setShowErrorOverlay(false)}
            >
              OK
            </button>
          </div>
        </div>
      )}
      {showConfirmation && (
        <div className="confirmation-dialog-overlay">
          <div className="confirmation-dialog">
            <h2>Confirm Order</h2>
            <p>Are you sure you want to submit this order?</p>
            <ul>
              {completeOrder.items.map((item) => (
                <li key={item.id}>
                  <span className="name">{item.name}:</span>
                  <span className="quantity">{item.quantity}</span>
                </li>
              ))}
            </ul>
            <p>Order Date and Time: {currentTimestamp}</p>
            <p>Delivery Date: {selectedDate}</p>
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
