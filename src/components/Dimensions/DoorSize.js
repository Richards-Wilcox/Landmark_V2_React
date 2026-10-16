function DoorSize({
    doorSize,
    setDoorSize,
    doorSizes,

    customDimension,
    setCustomDimension,

    doorWidthFeet,
    setDoorWidthFeet,

    doorWidthInches,
    setDoorWidthInches,

    doorHeightFeet,
    setDoorHeightFeet,

    doorHeightInches,
    setDoorHeightInches,

    panelStyle,

    numOfSections,
    setNumOfSections,

    numOfPanels,
    setNumOfPanels,

    width,
    height,

    renderSelectionIndicator
}) {

    const widthFeetOptions =
        Array.from(
            { length: 17 },
            (_, i) => i + 4
        );

    const widthInchOptions =
        Number(doorWidthFeet) === 20
            ? [0, 1, 2]
            : [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

    const heightFeetOptions =
        Array.from(
            { length: 9 },
            (_, i) => i + 6
        );

    const heightInchOptions =
        Number(doorHeightFeet) === 14
            ? [0]
            : [0, 3, 6, 9];

    const sectionMap = {
        72: [3, 4],
        75: [4],
        78: [4],
        81: [4],
        84: [4],
        87: [4],
        90: [4, 5],
        93: [4, 5],
        96: [4, 5],
        99: [5],
        102: [5],
        105: [5],
        108: [5, 6],
        111: [5, 6],
        114: [5, 6],
        117: [5, 6],
        120: [5, 6],
        123: [6],
        126: [6, 7],
        129: [6, 7],
        132: [6, 7],
        135: [6, 7],
        138: [6, 7],
        141: [6, 7],
        144: [6, 7],
        147: [7, 8],
        150: [7, 8],
        153: [7, 8],
        156: [7, 8],
        159: [7, 8],
        162: [7, 8, 9],
        165: [7, 8, 9],
        168: [7, 8, 9]
    };

    const sectionOptions =
        sectionMap[height] || [4];

    let panelOptions = [];

    if (width >= 72 && width <= 94) {

        panelOptions = [
            {
                value: "3",
                label: "Default (3)"
            },
            {
                value: "2",
                label: "Special (2)"
            }
        ];

    } else if (width >= 119 && width <= 142) {

        panelOptions = [
            {
                value: "5",
                label: "Default (5)"
            },
            {
                value: "4",
                label: "Special (4)"
            }
        ];

    } else if (width >= 166 && width <= 189) {

        panelOptions = [
            {
                value: "7",
                label: "Default (7)"
            },
            {
                value: "6",
                label: "Special (6)"
            }
        ];

    } else if (width >= 228 && width <= 235) {

        panelOptions = [
            {
                value: "9",
                label: "Default (9)"
            },
            {
                value: "8",
                label: "Special (8)"
            }
        ];

    }

    const showNumOfPanels =
        panelStyle === "C" &&
        panelOptions.length > 1;

    return (
        <>

            {!customDimension && (

                <div className="landmark-section">

                    <div className="landmark-section-header">
                        Door Size (4 Sections)
                    </div>

                    <div className="door-size-grid">

                        {doorSizes.map(size => (

                            <div
                                key={size.id}
                                className={
                                    doorSize === size.value
                                        ? "door-size-button active"
                                        : "door-size-button"
                                }
                                onClick={() =>
                                    setDoorSize(size.value)
                                }
                            >

                                {size.label}

                                {renderSelectionIndicator(
                                    doorSize === size.value
                                )}

                            </div>

                        ))}

                    </div>

                </div>

            )}

            <div className="landmark-section">

                <div className="landmark-toggle-row">

                    <div className="landmark-section-header">
                        Custom Dimension
                    </div>

                    <div
                        className={
                            customDimension
                                ? "landmark-toggle active"
                                : "landmark-toggle"
                        }
                        onClick={() =>
                            setCustomDimension(
                                !customDimension
                            )
                        }
                    >

                        <div className="landmark-toggle-knob">

                            {customDimension
                                ? "✓"
                                : "✕"}

                        </div>

                    </div>

                </div>

            </div>

            {customDimension && (

                <div className="landmark-section">

                    <div className="landmark-custom-dimension-container">

                        <div className="dimension-group">

                            <div className="landmark-section-header">
                                Door Width
                            </div>

                            <div className="dimension-label-row">

                                <span>Ft</span>

                                <span>In</span>

                            </div>

                            <div className="dimension-dropdown-row">

                                <select
                                    id="DOOR_WIDTH_FEET"
                                    name="DOOR_WIDTH_FEET"
                                    value={doorWidthFeet}
                                    onChange={(e) =>
                                        setDoorWidthFeet(
                                            e.target.value
                                        )
                                    }
                                >

                                    {widthFeetOptions.map(option => (

                                        <option
                                            key={option}
                                            value={option}
                                        >
                                            {option}
                                        </option>

                                    ))}

                                </select>

                                <select
                                    id="DOOR_WIDTH_INCHES"
                                    name="DOOR_WIDTH_INCHES"
                                    value={doorWidthInches}
                                    onChange={(e) =>
                                        setDoorWidthInches(
                                            e.target.value
                                        )
                                    }
                                >

                                    {widthInchOptions.map(option => (

                                        <option
                                            key={option}
                                            value={option}
                                        >
                                            {option}
                                        </option>

                                    ))}

                                </select>

                            </div>

                        </div>

                        <div className="dimension-group">

                            <div className="landmark-section-header">
                                Door Height
                            </div>

                            <div className="dimension-label-row">

                                <span>Ft</span>

                                <span>In</span>

                            </div>

                            <div className="dimension-dropdown-row">

                                <select
                                    id="DOOR_HEIGHT_FEET"
                                    name="DOOR_HEIGHT_FEET"
                                    value={doorHeightFeet}
                                    onChange={(e) =>
                                        setDoorHeightFeet(
                                            e.target.value
                                        )
                                    }
                                >

                                    {heightFeetOptions.map(option => (

                                        <option
                                            key={option}
                                            value={option}
                                        >
                                            {option}
                                        </option>

                                    ))}

                                </select>

                                <select
                                    id="DOOR_HEIGHT_INCHES"
                                    name="DOOR_HEIGHT_INCHES"
                                    value={doorHeightInches}
                                    onChange={(e) =>
                                        setDoorHeightInches(
                                            e.target.value
                                        )
                                    }
                                >

                                    {heightInchOptions.map(option => (

                                        <option
                                            key={option}
                                            value={option}
                                        >
                                            {option}
                                        </option>

                                    ))}

                                </select>

                            </div>

                        </div>

                        <div className="dimension-group">

                            <div className="landmark-section-header">
                                Number Of Sections
                            </div>

                            <div className="dimension-label-row">

                                <span>&nbsp;</span>

                                <span>&nbsp;</span>

                            </div>

                            <select
                                id="NUM_OF_SEC"
                                name="NUM_OF_SEC"
                                value={numOfSections}
                                onChange={(e) =>
                                    setNumOfSections(
                                        e.target.value
                                    )
                                }
                            >

                                {sectionOptions.map(option => (

                                    <option
                                        key={option}
                                        value={option}
                                    >
                                        {option}
                                    </option>

                                ))}

                            </select>

                        </div>

                    </div>

                </div>

            )}

            {showNumOfPanels && (

                <div
                    className="landmark-section"
                    id="CustomPanelLayout"
                >

                    <div className="landmark-section-header">
                        Number Of Panels
                    </div>

                    <select
                        id="NUM_OF_PANELS"
                        name="NUM_OF_PANELS"
                        value={numOfPanels}
                        onChange={(e) =>
                            setNumOfPanels(
                                e.target.value
                            )
                        }
                    >

                        {panelOptions.map(option => (

                            <option
                                key={option.value}
                                value={option.value}
                            >
                                {option.label}
                            </option>

                        ))}

                    </select>

                </div>

            )}

        </>
    );
}

export default DoorSize;