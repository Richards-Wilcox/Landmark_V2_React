import { toggleValue }
from "../../utils/toggleValue";

function TemperedGlass({
    temperedGlass,
    setTemperedGlass,
    renderSelectionIndicator
}) {

    return (

        <div className="landmark-section">

            <div className="landmark-section-header">
                Tempered Glass
            </div>

            <div className="door-model-buttons">

                <div
                    className={
                        temperedGlass === "all"
                            ? "door-model-button active"
                            : "door-model-button"
                    }
                    onClick={() =>
                        toggleValue(
                            temperedGlass,
                            "all",
                            setTemperedGlass
                        )
                    }
                >

                    All

                    {renderSelectionIndicator(
                        temperedGlass === "all"
                    )}

                </div>

                <div
                    className={
                        temperedGlass === "bottom_1"
                            ? "door-model-button active"
                            : "door-model-button"
                    }
                    onClick={() =>
                        toggleValue(
                            temperedGlass,
                            "bottom_1",
                            setTemperedGlass
                        )
                    }
                >

                    Bottom

                    {renderSelectionIndicator(
                        temperedGlass === "bottom_1"
                    )}

                </div>

                <div
                    className={
                        temperedGlass === "bottom_2"
                            ? "door-model-button active"
                            : "door-model-button"
                    }
                    onClick={() =>
                        toggleValue(
                            temperedGlass,
                            "bottom_2",
                            setTemperedGlass
                        )
                    }
                >

                    Bottom 2

                    {renderSelectionIndicator(
                        temperedGlass === "bottom_2"
                    )}

                </div>

            </div>

        </div>

    );

}

export default TemperedGlass;