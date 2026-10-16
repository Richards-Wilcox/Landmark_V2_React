import {
    getFaceDesc,
    isSpecialFace
} from "../Canvas/canvasWindowLayout";

const POSITIONS = [
    { value: "top", label: "Top" },
    { value: "left", label: "Left" },
    { value: "center", label: "Center" },
    { value: "right", label: "Right" },
    { value: "both", label: "Both" },
    { value: "custom", label: "Custom" }
];

function WindowPosition({
    glassShape,
    panelStyle,

    windowPosition,
    onPositionChange,

    renderSelectionIndicator
}) {

    const shape = glassShape || "";

    const face = getFaceDesc(panelStyle);

    const isFlush = face === "flush" || face === "plank";
    const isSlim = shape.includes("slim");
    const isGrand = shape.includes("grand");

    /* Special / Grand: only TOP allowed */
    const isLocked =
        !isSlim &&
        (isGrand || isSpecialFace(panelStyle, shape));

    /* What is shown as selected.
       Non-flush custom: windowPosition stays "custom",
       but no visible button is highlighted. */
    let selected = shape ? windowPosition : "";

    if (isLocked) {
        selected = "top";
    }

    const isVisible = (value) => {

        // Slim windows: TOP is hidden
        if (value === "top") {
            return !isSlim;
        }

        // Custom button: Flush / Plank and Slim only
        if (value === "custom") {
            return (isFlush || isSlim) && !isLocked;
        }

        return true;
    };

    const isDisabled = (value) =>
        isLocked && value !== "top";

    return (
        <div className="window-position-wrapper">

            <div className="window-position-header">
                <span>Window Position</span>
            </div>

            <div className="window-position-buttons">

                {POSITIONS
                    .filter(position => isVisible(position.value))
                    .map(position => {

                        const isSelected =
                            selected === position.value;

                        const disabled =
                            isDisabled(position.value);

                        const className = [
                            "door-size-button",
                            isSelected ? "active" : "",
                            disabled ? "disabled" : ""
                        ].join(" ").trim();

                        return (
                            <button
                                key={position.value}
                                type="button"
                                className={className}
                                disabled={disabled}
                                onClick={() =>
                                    onPositionChange(position.value)
                                }
                            >
                                {position.label}

                                {renderSelectionIndicator(isSelected)}
                            </button>
                        );
                    })}

            </div>

        </div>
    );
}

export default WindowPosition;
