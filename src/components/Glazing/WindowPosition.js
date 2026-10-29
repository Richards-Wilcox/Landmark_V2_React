import {
    isSpecialFace
} from "../Canvas/canvasLayout";

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

    const isSlim =
        shape.includes("slim");

    const isGrand =
        shape.includes("grand");

    /*
     * Special / Grand:
     * - Top remains enabled
     * - All other options remain visible
     * - All other options are disabled / greyed out
     *
     * Keep this existing special-case behavior.
     */
    const isLocked =
        !isSlim &&
        (
            isGrand ||
            isSpecialFace(
                panelStyle,
                shape
            )
        );

    /*
     * Selected position:
     * - no glass shape -> nothing selected
     * - Grand / special face -> Top is always selected
     * - otherwise use the selected window position
     */
    const selected =
        isLocked
            ? "top"
            : shape
                ? windowPosition
                : "";

    const isVisible = value => {

        /*
         * Slim windows:
         * Top stays hidden.
         */
        if (value === "top") {
            return !isSlim;
        }

        /*
         * Custom is now visible for every face style.
         *
         * Do not check Flush or Plank here.
         * Grand / special cases still show Custom,
         * but isDisabled() greys it out.
         */
        return true;
    };

    const isDisabled = value => {

        /*
         * Grand / special case:
         * only Top is selectable.
         */
        return (
            isLocked &&
            value !== "top"
        );
    };

    const handlePositionClick = value => {

        if (isDisabled(value)) {
            return;
        }

        onPositionChange(value);
    };

    return (
        <div className="window-position-wrapper">

            <div className="window-position-header">
                <span>Window Position</span>
            </div>

            <div className="window-position-buttons">

                {POSITIONS
                    .filter(position =>
                        isVisible(position.value)
                    )
                    .map(position => {

                        const {
                            value,
                            label
                        } = position;

                        const isSelected =
                            selected === value;

                        const disabled =
                            isDisabled(value);

                        const className = [
                            "door-size-button",
                            isSelected
                                ? "active"
                                : "",
                            disabled
                                ? "disabled"
                                : ""
                        ]
                            .filter(Boolean)
                            .join(" ");

                        return (
                            <button
                                key={value}
                                type="button"
                                className={className}
                                disabled={disabled}
                                aria-pressed={isSelected}
                                onClick={() =>
                                    handlePositionClick(
                                        value
                                    )
                                }
                            >
                                <span>
                                    {label}
                                </span>

                                {renderSelectionIndicator?.(
                                    isSelected
                                )}
                            </button>
                        );
                    })}

            </div>

        </div>
    );
}

export default WindowPosition;