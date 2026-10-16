import ColorSelector from "../Dimensions/ColorSelector";
import {
    availableColors,
    optionalColors
} from "../../Data/colors";

function InsertColor({
    glassShape,
    panelStyle,

    insertColor,
    setInsertColor,

    showPopularInsertColors,
    setShowPopularInsertColors
}) {

    const isSlim =
        glassShape?.includes("slim");

    if (isSlim) {
        return null;
    }

    return (

        <ColorSelector
            title="Insert Colour"

            availableColors={availableColors}
            optionalColors={optionalColors}

            panelStyle={panelStyle}

            selectedColor={insertColor}
            setSelectedColor={setInsertColor}

            showPopularColors={showPopularInsertColors}
            setShowPopularColors={
                setShowPopularInsertColors
            }
        />

    );

}

export default InsertColor;