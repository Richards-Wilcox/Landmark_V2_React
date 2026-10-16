import ColorSelector from "../Dimensions/ColorSelector";
import {
    availableColors,
    optionalColors,
    silverColor
} from "../../Data/colors";

function FrameColor({

    glassShape,

    panelStyle,

    frameColor,
    setFrameColor,

    showPopularFrameColors,
    setShowPopularFrameColors

}) {

    const isSlim =
        glassShape?.includes("slim");

    const filteredAvailableColors =
        isSlim
            ? [
                ...availableColors.filter(
                    color =>
                        color.value === "K"
                ),
                silverColor
            ]
            : availableColors;

    const filteredOptionalColors =
        isSlim
            ? []
            : optionalColors;

    return (

        <ColorSelector
            title="Frame Colour"

            availableColors={filteredAvailableColors}
            optionalColors={filteredOptionalColors}

            panelStyle={panelStyle}

            selectedColor={frameColor}
            setSelectedColor={setFrameColor}

            showPopularColors={showPopularFrameColors}
            setShowPopularColors={
                setShowPopularFrameColors
            }
        />

    );

}

export default FrameColor;