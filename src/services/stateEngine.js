export const selectProduct = (
    product
) => {

    if (window.setState) {

        window.setState(
            "PRODUCT_TYPE",
            {
                value: product.value,
                text: product.title
            }
        );
    }

    const screen =
        document.getElementById(
            "PRODUCT_SELECTION_SCREEN"
        );

    if (screen) {

        screen.classList.add(
            "screen-exit"
        );

        setTimeout(() => {

            screen.remove();

            const configurator =
                document.getElementById(
                    "configurator"
                );

            if (configurator) {

                configurator.style.display =
                    "block";
            }

            if (
                window.applyDefaults
            ) {

                window.applyDefaults();
            }

        }, 250);
    }
};