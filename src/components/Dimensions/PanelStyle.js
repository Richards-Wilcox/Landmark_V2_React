function PanelStyle({
    panelStyle,
    setPanelStyle,

    morePanelStyle,
    setMorePanelStyle,

    morePanelStyles,

    designCode,
    setDesignCode,

    doorModel,
    width,

    renderSelectionIndicator
}) {

    const designOptionsMap = [
        {
            min: 96,
            max: 119,
            options: [
                {
                    value: "A",
                    text: "CRC (MP-1)"
                }
            ]
        },
        {
            min: 120,
            max: 143,
            options: [
                {
                    value: "B",
                    text: "RCR (MP-2)"
                }
            ]
        },
        {
            min: 144,
            max: 167,
            options: [
                {
                    value: "C",
                    text: "CRRC (MP-3)"
                },
                {
                    value: "D",
                    text: "RCCR (MP-4)"
                },
                {
                    value: "E",
                    text: "CCRCC (MP-5)"
                }
            ]
        },
        {
            min: 168,
            max: 191,
            options: [
                {
                    value: "J",
                    text: "CRCRC (MP-10)"
                },
                {
                    value: "K",
                    text: "RCCCR (MP-11)"
                }
            ]
        },
        {
            min: 192,
            max: 211,
            options: [
                {
                    value: "F",
                    text: "CRRRC (MP-6)"
                },
                {
                    value: "G",
                    text: "CRCCRC (MP-7)"
                },
                {
                    value: "H",
                    text: "RCRCR (MP-8)"
                },
                {
                    value: "I",
                    text: "CCRRCC (MP-9)"
                },
                {
                    value: "N",
                    text: "CCCRCCC (MP-14)"
                },
                {
                    value: "O",
                    text: "RCCCCR (MP-15)"
                }
            ]
        },
        {
            min: 212,
            max: 237,
            options: [
                {
                    value: "L",
                    text: "CRCCCRC (MP-12)"
                },
                {
                    value: "M",
                    text: "CCRCRCC (MP-13)"
                }
            ]
        },
        {
            min: 238,
            max: 255,
            options: [
                {
                    value: "P",
                    text: "RCCRCCR (MP-16)"
                },
                {
                    value: "Q",
                    text: "RCCCCCR (MP-17)"
                }
            ]
        },
        {
            min: 256,
            max: 278,
            options: [
                {
                    value: "R",
                    text: "CCCRCRCCC (MP-18)"
                },
                {
                    value: "S",
                    text: "CCRCCRCC (MP-19)"
                }
            ]
        },
        {
            min: 279,
            max: Infinity,
            options: [
                {
                    value: "T",
                    text: "RCCCCCCCCR (MP-20)"
                },
                {
                    value: "U",
                    text: "CCRCCCCRCC (MP-21)"
                }
            ]
        }
    ];

    const currentDesignOptions =
        designOptionsMap.find(
            item =>
                width >= item.min &&
                width <= item.max
        )?.options || [];

    const showMixed =
        doorModel === "D" &&
        width >= 96;

    const visibleMorePanelStyles =
        morePanelStyles.filter(style => {

            if (style.id === "MIXED") {
                return showMixed;
            }

            return true;

        });

    const selectedDesignCode =
        currentDesignOptions.find(
            option =>
                option.value === designCode
        )
            ? designCode
            : (
                currentDesignOptions[0]?.value || ""
            );

    return (
        <>
            <div className="landmark-section">

                <div className="landmark-section-header">
                    Panel Style
                </div>

                <div className="door-model-buttons">

                    <div
                        className={
                            panelStyle === "R"
                                ? "door-model-button active"
                                : "door-model-button"
                        }
                        onClick={() =>
                            setPanelStyle("R")
                        }
                    >
                        Raised Ranch

                        {renderSelectionIndicator(
                            panelStyle === "R"
                        )}
                    </div>

                    <div
                        className={
                            panelStyle === "F"
                                ? "door-model-button active"
                                : "door-model-button"
                        }
                        onClick={() =>
                            setPanelStyle("F")
                        }
                    >
                        Flush

                        {renderSelectionIndicator(
                            panelStyle === "F"
                        )}
                    </div>

                    <div
                        className={
                            panelStyle === "C"
                                ? "door-model-button active"
                                : "door-model-button"
                        }
                        onClick={() =>
                            setPanelStyle("C")
                        }
                    >
                        Raised Colonial

                        {renderSelectionIndicator(
                            panelStyle === "C"
                        )}
                    </div>

                </div>

            </div>

            <div className="landmark-section">

                <div className="landmark-toggle-row">

                    <div className="landmark-section-header">
                        More Panel Style
                    </div>

                    <div
                        className={
                            morePanelStyle
                                ? "landmark-toggle active"
                                : "landmark-toggle"
                        }
                        onClick={() => {

                            const nextValue = !morePanelStyle;

                            setMorePanelStyle(nextValue);

                            if (!nextValue) {

                                if (
                                    ["S", "B", "T", "V", "M"]
                                        .includes(panelStyle)
                                ) {

                                    setPanelStyle("F");

                                }

                            }

                        }}
                    >

                        <div className="landmark-toggle-knob">

                            {morePanelStyle
                                ? "✓"
                                : "✕"}

                        </div>

                    </div>

                </div>

            </div>

            {morePanelStyle && (

                <div className="landmark-section">

                    <div className="more-panel-grid">

                        {visibleMorePanelStyles.map(style => (

                            <div
                                key={style.id}
                                className={
                                    panelStyle === style.value
                                        ? "door-size-button active"
                                        : "door-size-button"
                                }
                                onClick={() =>
                                    setPanelStyle(style.value)
                                }
                            >

                                {style.label}

                                {renderSelectionIndicator(
                                    panelStyle === style.value
                                )}

                            </div>

                        ))}

                    </div>

                </div>

            )}

            {panelStyle === "M" && (

                <div
                    className="landmark-section design-code-layout"
                    id="MixPanelLayout"
                >

                    <div className="landmark-section-header">
                        Design Code
                    </div>

                    <select
                        id="DESIGN_CODE"
                        name="DESIGN_CODE"
                        value={selectedDesignCode}
                        onChange={(e) =>
                            setDesignCode(
                                e.target.value
                            )
                        }
                    >

                        {currentDesignOptions.map(option => (

                            <option
                                key={option.value}
                                value={option.value}
                            >
                                {option.text}
                            </option>

                        ))}

                    </select>

                </div>

            )}

        </>
    );
}

export default PanelStyle;