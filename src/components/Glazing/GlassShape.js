import { toggleValue } from "../../utils/toggleValue";

function GlassShape({
    doorModel,
    panelStyle,
    width,
    selectedColor,

    glassShape,
    setGlassShape,

    renderSelectionIndicator
}) {

    const glassShapes = [
        {
            value: "colonial",
            label: "Colonial"
        },
        {
            value: "ranch",
            label: "Ranch"
        },
        {
            value: "slim_single",
            label: "Slim"
        },
        {
            value: "slim_double",
            label: "Slim Double"
        },
        {
            value: "grand_wrought_iron_rectangle",
            label: "Grand Wrought Iron - Rectangle"
        },
        {
            value: "grand_wrought_iron_double_arched",
            label: "Grand Wrought Iron - Double Arched"
        },
        {
            value: "grand_44_rectangle",
            label: "Grand 4/4 - Rectangle"
        },
        {
            value: "grand_44_double_arched",
            label: "Grand 4/4 - Double Arched"
        },
        {
            value: "grand_4_pane_rectangle",
            label: "Grand 4 Pane - Rectangle"
        },
        {
            value: "grand_4_pane_double_arched",
            label: "Grand 4 Pane - Double Arched"
        },
        {
            value: "grand_clear_rectangle",
            label: "Grand Clear - Rectangle"
        },
        {
            value: "grand_clear_double_arched",
            label: "Grand Clear - Double Arched"
        }
    ];

    const isWoodTone =
        selectedColor === "X" ||
        selectedColor === "Y";

    const allowedFacesColonial = [
        "R",
        "C",
        "B",
        "F",
        "V",
        "M"
    ];

    const allowedFacesRanch = [
        "R",
        "C",
        "B",
        "S",
        "T",
        "F",
        "V"
    ];

    const allowedFacesSlim = [
        "F",
        "V"
    ];

    const visibleGlassShapes =
        glassShapes.filter(shape => {

            const value = shape.value;

            const isColonial =
                value === "colonial";

            const isRanch =
                value === "ranch";

            const isSlim =
                value.startsWith("slim");

            const isGrand =
                value.startsWith("grand");

            if (
                doorModel === "G"
            ) {

                return isGrand;

            }

            if (isColonial) {

                if (
                    !allowedFacesColonial.includes(
                        panelStyle
                    )
                ) {

                    return false;

                }

                if (
                    panelStyle === "R"
                ) {

                    return !(
                        width >= 76 &&
                        width < 95
                    );

                }

                if (
                    panelStyle === "M"
                ) {

                    return width >= 96;

                }

                return true;

            }

            if (isRanch) {

                if (
                    !allowedFacesRanch.includes(
                        panelStyle
                    )
                ) {

                    return false;

                }

                switch (panelStyle) {

                    case "C":

                        return isWoodTone
                            ? width >= 95
                            : !(
                                width >= 76 &&
                                width < 95
                            );

                    case "B":

                        return width >= 96;

                    case "R":

                        return isWoodTone
                            ? width >= 76
                            : true;

                    default:

                        return true;
                }

            }

            if (isSlim) {

                return (
                    width > 96 &&
                    allowedFacesSlim.includes(
                        panelStyle
                    )
                );

            }

            return false;

        });

    return (

        <div
            className="landmark-section"
            id="GLASS_SHAPE_LAYOUT"
        >

            <div className="landmark-section-header">
                Glass Shape
            </div>

            <div className="more-panel-grid">

                {visibleGlassShapes.map(shape => (

                    <div
                        key={shape.value}
                        className={
                            glassShape === shape.value
                                ? "door-size-button active"
                                : "door-size-button"
                        }
                        onClick={() =>
                            toggleValue(
                                glassShape,
                                shape.value,
                                setGlassShape
                            )
                        }

                    >

                        {shape.label}

                        {
                            renderSelectionIndicator(
                                glassShape === shape.value
                            )}

                    </div>

                ))}

            </div>

        </div >

    );

}

export default GlassShape;