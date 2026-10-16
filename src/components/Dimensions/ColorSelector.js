function ColorSelector({
    title = "Colour",

    availableColors,
    optionalColors,

    panelStyle,

    selectedColor,
    setSelectedColor,

    showPopularColors,
    setShowPopularColors
}) {

    const filteredOptionalColors =
        optionalColors.filter(color => {

            const isWoodToneColor =
                color.colorName === "Honey Cedar" ||
                color.colorName === "Cocoa Hickory";

            if (
                isWoodToneColor &&
                (
                    panelStyle === "F" ||
                    panelStyle === "T"
                )
            ) {
                return false;
            }

            return true;

        });

    return (

        <div className="landmark-section">

            <div className="landmark-section-header">
                {title}
            </div>

            <div className="colorChooser">

                {showPopularColors ? (

                    <>

                        <div className="colorContainer">

                            {availableColors.map(color => (

                                <div
                                    key={color.value}
                                    className={
                                        selectedColor === color.value
                                            ? "color-circle active"
                                            : "color-circle"
                                    }
                                    onClick={() =>
                                        setSelectedColor(color.value)
                                    }
                                >

                                    <div
                                        className="color-circle-fill color-tooltip"
                                        data-tooltip={color.colorName}
                                        style={{
                                            background: color.hex
                                        }}
                                    />

                                </div>

                            ))}

                        </div>

                        {filteredOptionalColors.length > 0 && (
                            <div className="divider"></div>
                        )}

                        <div
                            className="stack-wrapper right"
                            onClick={() =>
                                setShowPopularColors(false)
                            }
                        >

                            {filteredOptionalColors
                                .slice(0, 3)
                                .map((color, index) => (

                                    <div
                                        key={color.value}
                                        className={`stack-color stack-${index + 1}`}
                                        style={{
                                            background: color.hex
                                        }}
                                    />

                                ))}

                        </div>

                    </>

                ) : (

                    <>

                        <div
                            className="stack-wrapper left"
                            onClick={() =>
                                setShowPopularColors(true)
                            }
                        >

                            {availableColors
                                .slice(0, 3)
                                .map((color, index) => (

                                    <div
                                        key={color.value}
                                        className={`stack-color stack-${index + 1}`}
                                        style={{
                                            background: color.hex
                                        }}
                                    />

                                ))}

                        </div>

                        <div className="divider"></div>

                        <div className="colorContainer">

                            {filteredOptionalColors.map(color => (

                                <div
                                    key={color.value}
                                    className={
                                        selectedColor === color.value
                                            ? "color-circle active"
                                            : "color-circle"
                                    }
                                    onClick={() =>
                                        setSelectedColor(color.value)
                                    }
                                >

                                    <div
                                        className="color-circle-fill color-tooltip"
                                        data-tooltip={color.colorName}
                                        style={{
                                            background: color.hex
                                        }}
                                    />

                                </div>

                            ))}

                        </div>

                    </>

                )}

            </div>

        </div>

    );

}

export default ColorSelector;