/* ==========================================================
   COLOR SELECTOR
   - Popular colours / Other colours toggle (stack of 3 circles)
   - Hover tooltip on the stack (port of the old .stack-wrapper .tooltip):
       Popular stack -> "View Most Popular Colors" (below)
       Other stack   -> moreColorsLabel (to the right)
                        Door colour:          "View More Colors"
                        Frame / Insert / Jamb: "View Other Colors"
========================================================== */

function ColorSelector({
    title = "Colour",

    availableColors,
    optionalColors,

    panelStyle,

    selectedColor,
    setSelectedColor,

    showPopularColors,
    setShowPopularColors,

    // Tooltip texts (same wording as the old configurator)
    popularColorsLabel = "View Most Popular Colors",
    moreColorsLabel = "View More Colors"
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

    const renderColorCircle = (color) => (

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

    );

    const renderStack = (colors) =>
        colors
            .slice(0, 3)
            .map((color, index) => (

                <div
                    key={color.value}
                    className={`stack-color stack-${index + 1}`}
                    style={{
                        background: color.hex
                    }}
                />

            ));

    return (

        <div className="landmark-section">

            <div className="landmark-section-header">
                {title}
            </div>

            <div className="colorChooser">

                {showPopularColors ? (

                    <>

                        <div className="colorContainer">
                            {availableColors.map(renderColorCircle)}
                        </div>

                        {filteredOptionalColors.length > 0 && (
                            <>

                                <div className="divider"></div>

                                {/* Other colours stack – tooltip on the right */}

                                <div
                                    className="stack-wrapper stack-tooltip-right"
                                    role="button"
                                    tabIndex={0}
                                    aria-label={moreColorsLabel}
                                    onClick={() =>
                                        setShowPopularColors(false)
                                    }
                                    onKeyDown={event => {
                                        if (event.key === "Enter" || event.key === " ") {
                                            event.preventDefault();
                                            setShowPopularColors(false);
                                        }
                                    }}
                                >

                                    {renderStack(filteredOptionalColors)}

                                    <div className="stack-tooltip" role="tooltip">
                                        {moreColorsLabel}
                                    </div>

                                </div>

                            </>
                        )}

                    </>

                ) : (

                    <>

                        {/* Popular colours stack – tooltip below */}

                        <div
                            className="stack-wrapper stack-tooltip-bottom"
                            role="button"
                            tabIndex={0}
                            aria-label={popularColorsLabel}
                            onClick={() =>
                                setShowPopularColors(true)
                            }
                            onKeyDown={event => {
                                if (event.key === "Enter" || event.key === " ") {
                                    event.preventDefault();
                                    setShowPopularColors(true);
                                }
                            }}
                        >

                            {renderStack(availableColors)}

                            <div className="stack-tooltip" role="tooltip">
                                {popularColorsLabel}
                            </div>

                        </div>

                        <div className="divider"></div>

                        <div className="colorContainer">
                            {filteredOptionalColors.map(renderColorCircle)}
                        </div>

                    </>

                )}

            </div>

        </div>

    );

}

export default ColorSelector;
