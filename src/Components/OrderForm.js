import React, {useState} from "react";
import ProductCard from "./ProductCard";

export default function OrderForm(){

    // sample product array
    const products = [
        { id: 1, name: 'Product 1', description: 'Description for Product 1', image: 'https://via.placeholder.com/150' },
        { id: 2, name: 'Product 2', description: 'Description for Product 2', image: 'https://via.placeholder.com/150' },
        { id: 3, name: 'Product 3', description: 'Description for Product 3', image: 'https://via.placeholder.com/150' }, 
    ]; 

    // initalize quantities state 
    const initalQuantities = products.reduce((acc, product) => {
        acc[product.id] = 0;
        return acc;
    }, {})

    // quantity use state
    const [quantities, setQuantities] = useState({initalQuantities});


    // handle quantities change
    const handleQuantityChange = (productId, quantity) => {
        setQuantities(prevQuantities => ({...prevQuantities, [productId]: parseInt(quantity, 10)
        }))
    }

    // cl the quantities 
    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("order submitted:", quantities)
    }

    return(
        <form onSubmit={handleSubmit} className="order-form">
            <div>
                {products.map(product => {
                    <ProductCard
                    key={product.id}
                    product={product}
                    quantity={quantities[product.id]}
                    handleQuantityChange={(quantity) => handleQuantityChange(product.id, quantity)}
                    />
                })}
            </div>
            <button type="submit">Submit Order</button>
        </form>
    )
}