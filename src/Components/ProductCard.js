import React from "react";

export default function ProductCard({product, quantity, handleQuantityChange}){

    return (
        <div className="product-card">
            <img src={product.image} alt={product.name}/>
            <h2>{product.name}</h2>
            <p>{product.description}</p>
            <input
             type="number"
             value={quantity}
             min="0"
             onChange={(e) => handleQuantityChange(e.target.value)}
             />
        </div>
    )

}