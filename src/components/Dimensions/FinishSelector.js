function FinishSelector({
    finish,
    setFinish,

    panelStyle,
    selectedColor,

    renderSelectionIndicator
}) {

    const showStucco =
        ["F", "V", "T"].includes(panelStyle) &&
        !["X", "Y"].includes(selectedColor?.value);

    return (

        <div className="landmark-section">

            <div className="landmark-section-header">
                Finish
            </div>

            <div className="door-model-buttons">

                <div
                    className={
                        finish === "W"
                            ? "door-model-button active"
                            : "door-model-button"
                    }
                    onClick={() =>
                        setFinish("W")
                    }
                >

                    Woodgrain

                    {renderSelectionIndicator(
                        finish === "W"
                    )}

                </div>

                {showStucco && (

                    <div
                        className={
                            finish === "S"
                                ? "door-model-button active"
                                : "door-model-button"
                        }
                        onClick={() =>
                            setFinish("S")
                        }
                    >

                        Stucco

                        {renderSelectionIndicator(
                            finish === "S"
                        )}

                    </div>

                )}

            </div>

        </div>

    );

}

export default FinishSelector;