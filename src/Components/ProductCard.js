import React from "react";

export default function ProductCard({product}){

    return (
        <div className="product-card">
            <img src={`${product.image}`} alt={product.name}/>
            <h2>{product.name}</h2>
            <p className="product-info">{product.description}</p>
            <input
             type="number"
             value="0"
             min="0"
             onChange={(e) => console.log(e.target.value)}
             />
        </div>
    )

}