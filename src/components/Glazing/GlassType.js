import { toggleValue } from "../../utils/toggleValue";

function GlassType({
    doorModel,

    glassShape,
    glassType,
    setGlassType,

    showMoreGlassTypes,
    setShowMoreGlassTypes,

    renderSelectionIndicator
}) {

    const glassTypes = [
        {
            value: "CLEAR",
            label: "Clear Sealed"
        },
        {
            value: "CLEAR_SINGLE",
            label: "Clear Single"
        },
        {
            value: "SATIN",
            label: "Satin"
        }
    ];

    const moreGlassTypes = [
        {
            value: "OBSCURE_GLASS_PINHEAD",
            label: "Obscure Pinhead Sealed"
        },
        {
            value: "OBSCURE_GLASS_SINGLE",
            label: "Obscure Pinhead Single"
        },
        {
            value: "DARK_TINT_SEALED",
            label: "Dark Tint - Sealed"
        },
        {
            value: "DARK_TINT_SINGLE",
            label: "Dark Tint - Single"
        },
        {
            value: "BLACK_SATIN_SEALED",
            label: "Black Satin - Sealed"
        }
    ];

    const slimShapes = [
        "slim_single",
        "slim_double"
    ];

    let allowedGlassTypes = [
        "CLEAR",
        "CLEAR_SINGLE",
        "SATIN",
        "OBSCURE_GLASS_PINHEAD",
        "OBSCURE_GLASS_SINGLE",
        "DARK_TINT_SEALED",
        "DARK_TINT_SINGLE",
        "BLACK_SATIN_SEALED"
    ];

    if (
        doorModel === "A" &&
        slimShapes.includes(glassShape)
    ) {

        allowedGlassTypes = [
            "CLEAR",
            "SATIN"
        ];

    }
    else if (
        doorModel === "D" &&
        slimShapes.includes(glassShape)
    ) {

        allowedGlassTypes = [
            "CLEAR",
            "SATIN",
            "BLACK_SATIN_SEALED"
        ];

    }

    const visibleGlassTypes =
        [...glassTypes, ...moreGlassTypes]
            .filter(type =>
                allowedGlassTypes.includes(
                    type.value
                )
            );

    const hasVisibleMoreGlassTypes =
        visibleGlassTypes.some(type =>
            moreGlassTypes.some(
                more =>
                    more.value === type.value
            )
        );

    return (
        <>
            <div className="landmark-section">

                <div className="landmark-section-header">
                    Glass Type
                </div>

                <div className="more-panel-grid">

                    {visibleGlassTypes
                        .filter(type =>
                            !moreGlassTypes.some(
                                more =>
                                    more.value === type.value
                            )
                        )
                        .map(type => (

                            <div
                                key={type.value}
                                className={
                                    glassType === type.value
                                        ? "door-size-button active"
                                        : "door-size-button"
                                }
                                onClick={() =>
                                    toggleValue(
                                        glassType,
                                        type.value,
                                        setGlassType
                                    )
                                }
                            >

                                {type.label}

                                {renderSelectionIndicator(
                                    glassType === type.value
                                )}

                            </div>

                        ))}

                </div>

            </div>

            {hasVisibleMoreGlassTypes && (

                <div className="landmark-section">

                    <div className="landmark-toggle-row">

                        <div className="landmark-section-header">
                            More Glass Types
                        </div>

                        <div
                            className={
                                showMoreGlassTypes
                                    ? "landmark-toggle active"
                                    : "landmark-toggle"
                            }
                            onClick={() =>
                                setShowMoreGlassTypes(
                                    !showMoreGlassTypes
                                )
                            }
                        >

                            <div className="landmark-toggle-knob">

                                {showMoreGlassTypes
                                    ? "✓"
                                    : "✕"}

                            </div>

                        </div>

                    </div>

                </div>

            )}

            {hasVisibleMoreGlassTypes &&
                showMoreGlassTypes && (

                    <div className="landmark-section">

                        <div className="more-panel-grid">

                            {visibleGlassTypes
                                .filter(type =>
                                    moreGlassTypes.some(
                                        more =>
                                            more.value === type.value
                                    )
                                )
                                .map(type => (

                                    <div
                                        key={type.value}
                                        className={
                                            glassType === type.value
                                                ? "door-size-button active"
                                                : "door-size-button"
                                        }
                                        onClick={() =>
                                            toggleValue(
                                                glassType,
                                                type.value,
                                                setGlassType
                                            )
                                        }
                                    >

                                        {type.label}

                                        {renderSelectionIndicator(
                                            glassType === type.value
                                        )}

                                    </div>

                                ))}

                        </div>

                    </div>

                )}

        </>
    );

}

export default GlassType;