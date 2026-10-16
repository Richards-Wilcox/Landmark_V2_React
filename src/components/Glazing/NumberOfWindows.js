function NumberOfWindows({
    width,
    panelStyle,
    glassShape,

    numOfWindows,
    setNumOfWindows,

    renderSelectionIndicator
}) {

    let defaultWindows = "";
    let specialWindows = "";

    if (width >= 72 && width <= 94) {

        defaultWindows = "3";
        specialWindows = "2";

    } else if (width >= 119 && width <= 142) {

        defaultWindows = "5";
        specialWindows = "4";

    } else if (width >= 166 && width <= 189) {

        defaultWindows = "7";
        specialWindows = "6";

    } else if (width >= 228 && width <= 235) {

        defaultWindows = "9";
        specialWindows = "8";

    }

    const showNumberOfWindows =

        panelStyle === "F" &&
        glassShape === "colonial" &&
        defaultWindows !== "" &&
        specialWindows !== "";

    const selectedWindowValue =
        numOfWindows || defaultWindows;

    return (
        <>
            {showNumberOfWindows && (

                <div
                    className="landmark-section"
                    id="WINDOW_COUNT_LAYOUT"
                >

                    <div className="landmark-section-header">
                        Number Of Windows
                    </div>

                    <div className="segmented-toggle">

                        <div
                            className={
                                selectedWindowValue === defaultWindows
                                    ? "segmented-option active"
                                    : "segmented-option"
                            }
                            onClick={() =>
                                setNumOfWindows(
                                    defaultWindows
                                )
                            }
                        >

                            {`Default (${defaultWindows})`}

                            {renderSelectionIndicator(
                                selectedWindowValue === defaultWindows
                            )}

                        </div>

                        <div
                            className={
                                selectedWindowValue === specialWindows
                                    ? "segmented-option active"
                                    : "segmented-option"
                            }
                            onClick={() =>
                                setNumOfWindows(
                                    specialWindows
                                )
                            }
                        >

                            {`Special (${specialWindows})`}

                            {renderSelectionIndicator(
                                selectedWindowValue === specialWindows
                            )}

                        </div>

                    </div>

                </div>

            )}
        </>
    );

}

export default NumberOfWindows;