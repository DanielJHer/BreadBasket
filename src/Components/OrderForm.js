import React, {useEffect, useState} from "react";
import ProductCard from "./ProductCard";

export default function OrderForm(){

    // use state
    const [products, setProducts] = useState([]);
    const [order, setOrder] = useState([]);
    const [resetSignal, setResetSignal] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);

    // fetching json file with products
    useEffect(() => {
        fetch("products.json").then(response=> response.json().then(data=> setProducts(data)))
    }, [])

    // handle the quantity change
    const handleQuantityChange = (productId, quantity) => {
        setOrder(prevOrder => ({
            ...prevOrder, [productId]: quantity
        }))
    }

    // cl the quantities 
    const handleSubmit = (e) => {
        e.preventDefault();
        setShowConfirmation(true); 
      };
    

    // handle confirm order
    const handleConfirm = () => {
        const completeOrder = products.map(product => ({
            id: product.id,
            quantity: order[product.id] || 0, // Default to 0 if no quantity is provided
          }));
    
        console.log("Order confirmed:", completeOrder);
        setOrder({});
        setResetSignal(!resetSignal);
        setShowConfirmation(false); // Close the confirmation dialog
      };

    const handleCancel = () => {
        setShowConfirmation(false);
    }

    // clear order form
    const handleClear= () => {
        setOrder({});
        setResetSignal(!resetSignal); 
    }

    return(
        <div>
        <form onSubmit={handleSubmit} >
            <div className="order-form">
                {products.map(product => {
                    return(
                        <ProductCard
                        key={product.id}
                        product={product}
                        onQuantityChange={handleQuantityChange}
                        resetSignal={resetSignal}
                        />
                    )
                })}
            </div>
            <div className="button-field">
            <ul>
                <li>
                <button className="submit-button" type="submit">Submit Order</button>
                </li>
                <li>
                <button className="clear-button" type="button" onClick={handleClear}>Clear Order</button>
                </li>
            </ul>
            </div>
        </form>

        {showConfirmation && (
        <div className="confirmation-dialog">
          <h2>Confirm Order</h2>
          <p>Are you sure you want to submit this order?</p>
          <button onClick={handleConfirm}>Yes, I'm sure.</button>
          <button onClick={handleCancel}>Cancel</button>
        </div>
      )}



        </div>
    )
}