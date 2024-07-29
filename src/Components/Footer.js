import React from "react";

export default function Footer(){
    const currentYear = new Date().getFullYear();

    return(

        <div className="footer">
            <p>{currentYear} © Powered by BreadBasket, All Rights Reserved</p>
        </div>
    )
}