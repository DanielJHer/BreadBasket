import React, { useEffect, useState } from "react";

export default function ProductCard({product, onQuantityChange, resetSignal }){

    // intializing use state
    const [quantity, setQuantity] = useState(0);

    // initializing use effect for quantity
    useEffect(() => {
        setQuantity(0); // Reset quantity when resetSignal changes
      }, [resetSignal]);

    // handle input change
    const handleInputChange = (e) => {
        const value = e.target.value;
        if (!isNaN(value)) {
          const newQuantity = parseInt(value, 10) || 0;
          setQuantity(newQuantity);
          onQuantityChange(product.id, newQuantity);
        }
    }

    return (
        <div className="product-card">
            <img src={`${product.image}`} alt={product.name}/>
            <h2 className="product-title">{product.name}</h2>
            <p className="product-info">{product.description}</p>
            <input className="product-input"
             type="number"
             min="0"
             step="1"
             value={quantity}
             onChange={handleInputChange}
             />
        </div>
    )

}