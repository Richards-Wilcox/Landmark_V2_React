import { useEffect, useState } from "react";


function HeaderSection() {

    const [serialNumber, setSerialNumber] = useState("");

    useEffect(() => {

        const serialElement =
            document.getElementById(
                "header-serial_number"
            );

        if (serialElement) {

            const clone =
                serialElement.cloneNode(true);

            clone
                .querySelectorAll("label")
                .forEach(label =>
                    label.remove()
                );

            setSerialNumber(
                clone.textContent.trim()
            );
        }

    }, []);

    return (

        <div className="configurator-header">

            <div className="serial-number">

                Serial Number:
                <span className="serial-value">
                    {serialNumber}
                </span>

            </div>

            <div className="price-display">

                $7465.92

            </div>

        </div>

    );

}

export default HeaderSection;