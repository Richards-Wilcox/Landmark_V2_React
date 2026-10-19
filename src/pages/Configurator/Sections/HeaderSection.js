import { useEffect, useState } from "react";

function HeaderSection({ priceDisplay = "$0.00" }) {

    const [serial, setSerial] = useState("");

    useEffect(() => {

        const element = document.getElementById("header-serial_number");

        if (!element) {
            return;
        }

        const clone = element.cloneNode(true);

        clone.querySelectorAll("label").forEach(label => label.remove());

        setSerial(clone.textContent.trim());

    }, []);

    return (
        <div className="configurator-header">

            <div className="serial-number">
                Serial Number:
                <span className="serial-value">{serial}</span>
            </div>

            <div className="price-display">
                {priceDisplay}
            </div>

        </div>
    );
}

export default HeaderSection;
