import { useState } from "react";

import ProductSelectionScreen from "./components/ProductSelection/ProductSelectionScreen";
import Configurator from "./pages/Configurator/Configurator";

import "./App.css";

function App() {

    const [selectedProduct, setSelectedProduct] =
        useState(null);

    const [screenExit, setScreenExit] =
        useState(false);

    const handleProductSelect = (product) => {

        setScreenExit(true);

        setTimeout(() => {

            setSelectedProduct(product);

        }, 250);

    };

    return (
        <>
            {!selectedProduct && (

                <div
                    className={
                        screenExit
                            ? "screen-exit"
                            : ""
                    }
                >

                    <ProductSelectionScreen
                        onSelectProduct={
                            handleProductSelect
                        }
                    />

                </div>

            )}

            {selectedProduct && (

                <div
                    className="configurator-enter"
                >

                    <Configurator
                        product={selectedProduct}
                    />

                </div>

            )}

        </>
    );

}

export default App;