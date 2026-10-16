import { toggleValue } from "../../utils/toggleValue";

function GlassInsert({
    width,
    panelStyle,

    glassShape,

    glassInsert,
    setGlassInsert,

    showMoreGlassInserts,
    setShowMoreGlassInserts,

    renderSelectionIndicator
}) {

    const glassInserts = [

        {
            value: "stockton_colonial",
            label: "Stockton",
            shapes: ["colonial"]
        },

        {
            value: "stockton_ranch",
            label: "Stockton",
            shapes: ["ranch"]
        },

        {
            value: "waterton_colonial",
            label: "Waterton",
            shapes: ["colonial"]
        },

        {
            value: "waterton_ranch",
            label: "Waterton Ranch",
            shapes: ["ranch"]
        },

        {
            value: "prairie",
            label: "Prairie",
            shapes: ["colonial", "ranch"]
        }

    ];


    const moreGlassInserts = [
        {
            value: "cascade_colonial",
            label: "Cascade"
        },
        {
            value: "cascade_ranch",
            label: "Cascade Ranch"
        },
        {
            value: "arched_stockton",
            label: "Arched Stockton"
        },
        {
            value: "stockbridge",
            label: "Stockbridge"
        },
        {
            value: "arched_stockbridge",
            label: "Arched Stockbridge"
        },
        {
            value: "alum_stockton_4",
            label: "Aluminum Grid - Stockton 4"
        },
        {
            value: "alum_stockton_6",
            label: "Aluminum Grid - Stockton 6"
        },
        {
            value: "alum_prairie",
            label: "Aluminum Grid - Prairie"
        },
        {
            value: "alum_stockton_10",
            label: "Aluminum Grid - Stockton 10"
        },
        {
            value: "square_bar_stockton_4",
            label: "Square Bar - Stockton 4"
        },
        {
            value: "square_bar_stockton_6",
            label: "Square Bar - Stockton 6"
        },
        {
            value: "square_bar_prairie",
            label: "Square Bar - Prairie"
        },
        {
            value: "round_bar_stockton_4",
            label: "Round Bar - Stockton 4"
        },
        {
            value: "round_bar_stockton_6",
            label: "Round Bar - Stockton 6"
        },
        {
            value: "round_bar_prairie",
            label: "Round Bar - Prairie"
        },
        {
            value: "square_bar_stockton_10",
            label: "Square Bar - Stockton 10"
        },
        {
            value: "round_bar_stockton_10",
            label: "Round Bar - Stockton 10"
        },
        {
            value: "arched_stockton_3",
            label: "Arched Stockton 3pc Set"
        },
        {
            value: "arched_stockbridge_3",
            label: "Arched Stockbridge 3pc Set"
        },
        {
            value: "arched_stockton_4",
            label: "Berkshire"
        },
        {
            value: "arched_stockbridge_4",
            label: "Breckenridge"
        }
    ];

    const allowedColonial = [
        "stockton_colonial",
        "waterton_colonial",
        "prairie",
        "cascade_colonial",

        "alum_stockton_4",
        "alum_stockton_6",
        "alum_prairie",

        "square_bar_stockton_4",
        "square_bar_stockton_6",
        "square_bar_prairie",

        "round_bar_stockton_4",
        "round_bar_stockton_6",
        "round_bar_prairie"
    ];

    const allowedRanch = [
        "cascade_ranch",
        "stockton_ranch",
        "waterton_ranch",
        "stockbridge",
        "prairie",

        "square_bar_stockton_10",
        "square_bar_prairie",

        "round_bar_stockton_10",
        "round_bar_prairie",

        "alum_stockton_10",
        "alum_prairie",

        "arched_stockton",
        "arched_stockbridge",

        "arched_stockbridge_3",
        "arched_stockton_3",

        "arched_stockton_4",
        "arched_stockbridge_4"
    ];

    const getAllowedRanch = (
        width,
        alumMax,
        arch1Min,
        arch1Max,
        arch3Min,
        arch3Max,
        arch4Min,
        arch4Max
    ) => {

        return allowedRanch.filter(item => {

            if (
                item === "alum_stockton_10" ||
                item === "alum_prairie"
            ) {

                return width < alumMax;

            }

            if (
                item === "arched_stockton" ||
                item === "arched_stockbridge"
            ) {

                return (
                    width >= arch1Min &&
                    width < arch1Max
                );

            }

            if (
                item === "arched_stockbridge_3" ||
                item === "arched_stockton_3"
            ) {

                return (
                    width >= arch3Min &&
                    width < arch3Max
                );

            }

            if (
                item === "arched_stockton_4" ||
                item === "arched_stockbridge_4"
            ) {

                return (
                    width >= arch4Min &&
                    width < arch4Max
                );

            }

            return true;

        });

    };

    const filteredAllowedRanch =
        getAllowedRanch(
            width,
            243,
            95,
            143,
            143,
            190,
            192,
            236
        );

    const filterRanchStd =
        getAllowedRanch(
            width,
            259,
            96,
            143,
            143,
            190,
            190,
            236
        );
    const isInsertVisible = value => {

        if (glassShape === "colonial") {

            return (
                width >= 49 &&
                allowedColonial.includes(value)
            );

        }

        if (glassShape === "ranch") {

            switch (panelStyle) {

                case "C":

                    return (
                        width >= 49 &&
                        filteredAllowedRanch.includes(value)
                    );

                case "R":

                    return (
                        width >= 49 &&
                        filterRanchStd.includes(value)
                    );

                case "F":

                case "V":

                    return (
                        width >= 72 &&
                        filterRanchStd.includes(value)
                    );

                default:

                    return false;

            }

        }

        return false;

    };

    const visiblePrimaryInserts =
        glassInserts.filter(insert => {

            if (
                glassShape === "colonial" &&
                !insert.shapes.includes("colonial")
            ) {
                return false;
            }

            if (
                glassShape === "ranch" &&
                !insert.shapes.includes("ranch")
            ) {
                return false;
            }

            return isInsertVisible(
                insert.value
            );

        });

    const visibleSecondaryInserts =
        moreGlassInserts.filter(insert =>
            isInsertVisible(insert.value)
        );

    const hasVisibleGlassInserts =
        visiblePrimaryInserts.length > 0;

    const hasVisibleMoreGlassInserts =
        visibleSecondaryInserts.length > 0;

    return (
        <>
            {hasVisibleGlassInserts && (

                <div className="landmark-section">

                    <div className="landmark-section-header">
                        Glass Insert
                    </div>

                    <div className="more-panel-grid">

                        {visiblePrimaryInserts
                            .filter(insert =>
                                !moreGlassInserts.some(
                                    more =>
                                        more.value === insert.value
                                )
                            )
                            .map(insert => (

                                <div
                                    key={insert.value}
                                    className={
                                        glassInsert === insert.value
                                            ? "door-size-button active"
                                            : "door-size-button"
                                    }
                                    onClick={() =>
                                        toggleValue(
                                            glassInsert,
                                            insert.value,
                                            setGlassInsert
                                        )
                                    }
                                >

                                    {insert.label}

                                    {renderSelectionIndicator(
                                        glassInsert === insert.value
                                    )}

                                </div>

                            ))}

                    </div>

                </div>

            )}

            {hasVisibleMoreGlassInserts && (

                <div className="landmark-section">

                    <div className="landmark-toggle-row">

                        <div className="landmark-section-header">
                            More Glass Inserts
                        </div>

                        <div
                            className={
                                showMoreGlassInserts
                                    ? "landmark-toggle active"
                                    : "landmark-toggle"
                            }
                            onClick={() =>
                                setShowMoreGlassInserts(
                                    !showMoreGlassInserts
                                )
                            }
                        >

                            <div className="landmark-toggle-knob">

                                {showMoreGlassInserts
                                    ? "✓"
                                    : "✕"}

                            </div>

                        </div>

                    </div>

                </div>

            )}

            {hasVisibleMoreGlassInserts &&
                showMoreGlassInserts && (

                    <div className="landmark-section">

                        <div className="more-panel-grid">

                            {visibleSecondaryInserts
                                .filter(insert =>
                                    moreGlassInserts.some(
                                        more =>
                                            more.value === insert.value
                                    )
                                )
                                .map(insert => (

                                    <div
                                        key={insert.value}
                                        className={
                                            glassInsert === insert.value
                                                ? "door-size-button active"
                                                : "door-size-button"
                                        }
                                        onClick={() =>
                                            toggleValue(
                                                glassInsert,
                                                insert.value,
                                                setGlassInsert
                                            )
                                        }
                                    >

                                        {insert.label}

                                        {renderSelectionIndicator(
                                            glassInsert === insert.value
                                        )}

                                    </div>

                                ))}

                        </div>

                    </div>

                )}

        </>
    );
}

export default GlassInsert;
