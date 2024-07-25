import React, {useEffect, useState} from "react";
import ProductCard from "./ProductCard";

export default function OrderForm(){

    // fetching json file with products
    useEffect(() => {
        fetch("products.json").then(response=> response.json().then(data=> setProducts(data)))
    }, [])

    // use state
    const [products, setProducts] = useState([]);

    // cl the quantities 
    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("order submitted:")
    }

    return(
        <form onSubmit={handleSubmit} >
            <div className="order-form">
                {products.map(product => {
                    return(
                        <ProductCard
                        key={product.id}
                        product={product}
                        />
                    )
                })}
            </div>
            <button type="submit">Submit Order</button>
        </form>
    )
}