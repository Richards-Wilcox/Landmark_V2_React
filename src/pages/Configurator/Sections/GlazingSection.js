import { useState } from "react";

import GlassShape from "../../../components/Glazing/GlassShape";
import GlassType from "../../../components/Glazing/GlassType";
import GlassInsert from "../../../components/Glazing/GlassInsert";
import FrameColor from "../../../components/Glazing/FrameColor";
import InsertColor from "../../../components/Glazing/InsertColor";
import TemperedGlass from "../../../components/Glazing/TemperedGlass";
import NumberOfWindows from "../../../components/Glazing/NumberOfWindows";

function GlazingSection({
    glassShape,
    setGlassShape,

    glassType,
    setGlassType,

    glassInsert,
    setGlassInsert,

    temperedGlass,
    setTemperedGlass,

    doorModel,
    panelStyle,

    width,
    height,

    selectedColor,

    frameColor,
    setFrameColor,

    insertColor,
    setInsertColor,

    renderSelectionIndicator,
    numOfWindows,
    setNumOfWindows
}) {

    // UI-only state (not needed by canvas, price or EW)

    const [showMoreGlassTypes, setShowMoreGlassTypes] = useState(false);
    const [showMoreGlassInserts, setShowMoreGlassInserts] = useState(false);
    const [showPopularFrameColors, setShowPopularFrameColors] = useState(true);
    const [showPopularInsertColors, setShowPopularInsertColors] = useState(true);


    return (
        <>
            <GlassShape
                doorModel={doorModel}
                panelStyle={panelStyle}
                width={width}
                selectedColor={selectedColor}
                glassShape={glassShape}
                setGlassShape={setGlassShape}
                renderSelectionIndicator={renderSelectionIndicator}
            />

            <GlassType
                doorModel={doorModel}
                glassShape={glassShape}
                glassType={glassType}
                setGlassType={setGlassType}
                showMoreGlassTypes={showMoreGlassTypes}
                setShowMoreGlassTypes={setShowMoreGlassTypes}
                renderSelectionIndicator={renderSelectionIndicator}
            />

            <GlassInsert
                width={width}
                panelStyle={panelStyle}
                glassShape={glassShape}
                glassInsert={glassInsert}
                setGlassInsert={setGlassInsert}
                showMoreGlassInserts={showMoreGlassInserts}
                setShowMoreGlassInserts={setShowMoreGlassInserts}
                renderSelectionIndicator={renderSelectionIndicator}
            />

            <FrameColor
                doorModel={doorModel}
                glassShape={glassShape}
                panelStyle={panelStyle}
                frameColor={frameColor}
                setFrameColor={setFrameColor}
                showPopularFrameColors={showPopularFrameColors}
                setShowPopularFrameColors={setShowPopularFrameColors}
            />

            <InsertColor
                glassShape={glassShape}
                panelStyle={panelStyle}
                insertColor={insertColor}
                setInsertColor={setInsertColor}
                showPopularInsertColors={showPopularInsertColors}
                setShowPopularInsertColors={setShowPopularInsertColors}
            />

            <TemperedGlass
                temperedGlass={temperedGlass}
                setTemperedGlass={setTemperedGlass}
                renderSelectionIndicator={renderSelectionIndicator}
            />

            <NumberOfWindows
                width={width}
                panelStyle={panelStyle}
                glassShape={glassShape}
                numOfWindows={numOfWindows}
                setNumOfWindows={setNumOfWindows}
                renderSelectionIndicator={renderSelectionIndicator}
            />
        </>
    );
}

export default GlazingSection;
