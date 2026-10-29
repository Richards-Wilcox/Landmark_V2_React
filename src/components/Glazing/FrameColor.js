import ColorSelector from "../Dimensions/ColorSelector";
import {
    availableColors,
    optionalColors,
    silverColor
} from "../../Data/colors";

function FrameColor({
    doorModel,
    glassShape,

    panelStyle,

    frameColor,
    setFrameColor,

    showPopularFrameColors,
    setShowPopularFrameColors

}) {

    // const isSlim =
    //     glassShape?.includes("slim");

    const isClassicSlim =
        doorModel === "A" &&
        glassShape.includes("slim");

    const filteredAvailableColors =
        isClassicSlim
            ? [
                ...availableColors.filter(
                    color =>
                        color.value === "K"
                ),
                silverColor
            ]
            : availableColors;

    const filteredOptionalColors =
        isClassicSlim
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