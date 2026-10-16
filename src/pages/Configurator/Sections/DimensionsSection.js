import { useEffect } from "react";

import DoorModel from "../../../components/Dimensions/DoorModel";
import DoorSize from "../../../components/Dimensions/DoorSize";
import PanelStyle from "../../../components/Dimensions/PanelStyle";
import ColorSelector from "../../../components/Dimensions/ColorSelector";
import FinishSelector from "../../../components/Dimensions/FinishSelector";

import {
    availableColors,
    optionalColors
} from "../../../Data/colors";

function DimensionsSection({

    doorModel,
    setDoorModel,

    doorSize,
    setDoorSize,

    customDimension,
    setCustomDimension,

    panelStyle,
    setPanelStyle,

    morePanelStyle,
    setMorePanelStyle,

    selectedColor,
    setSelectedColor,

    finish,
    setFinish,

    designCode,
    setDesignCode,

    doorWidthFeet,
    setDoorWidthFeet,

    doorWidthInches,
    setDoorWidthInches,

    doorHeightFeet,
    setDoorHeightFeet,

    doorHeightInches,
    setDoorHeightInches,

    numOfSections,
    setNumOfSections,

    numOfPanels,
    setNumOfPanels,

    width,
    height,

    showPopularColors,
    setShowPopularColors,

     renderSelectionIndicator

}) {

    const models = [
        {
            id: "L138",
            value: "A",
            label: "Classic L138"
        },
        {
            id: "L200",
            value: "D",
            label: "Premium L200"
        },
        {
            id: "L200GV",
            value: "G",
            label: "Grandview L200GV"
        }
    ];

    const doorSizes = [
        {
            id: "DIMENSIONS_0",
            value: "0",
            label: "8x7"
        },
        {
            id: "DIMENSIONS_1",
            value: "1",
            label: "9x7"
        },
        {
            id: "DIMENSIONS_2",
            value: "2",
            label: "16x7"
        },
        {
            id: "DIMENSIONS_3",
            value: "3",
            label: "8x8"
        },
        {
            id: "DIMENSIONS_4",
            value: "4",
            label: "9x8"
        },
        {
            id: "DIMENSIONS_5",
            value: "5",
            label: "16x8"
        }
    ];

    const sizeMap = {

        "0": {
            width: 8,
            height: 7
        },

        "1": {
            width: 9,
            height: 7
        },

        "2": {
            width: 16,
            height: 7
        },

        "3": {
            width: 8,
            height: 8
        },

        "4": {
            width: 9,
            height: 8
        },

        "5": {
            width: 16,
            height: 8
        }

    };

    const selectedSize =
        sizeMap[doorSize];

    const morePanelStyles = [
        {
            id: "GROOVED_RANCH",
            value: "S",
            desc: "RncGc",
            label: "Recessed grooved Ranch"
        },
        {
            id: "GROOVED_COLONIAL",
            value: "B",
            desc: "ColGc",
            label: "Recessed grooved Colonial"
        },
        {
            id: "SMOOTH_RANCH",
            value: "T",
            desc: "RncSc",
            label: "Recessed Ranch"
        },
        {
            id: "PLANK",
            value: "V",
            desc: "Plk",
            label: "Plank"
        },
        {
            id: "MIXED",
            value: "M",
            desc: "mixed",
            label: "Mixed"
        }
    ];

    useEffect(() => {

        if (!customDimension && selectedSize) {

            setDoorWidthFeet(
                String(selectedSize.width)
            );

            setDoorWidthInches("0");

            setDoorHeightFeet(
                String(selectedSize.height)
            );

            setDoorHeightInches("0");

        }

    }, [
        doorSize,
        customDimension,
        setDoorWidthFeet,
        setDoorWidthInches,
        setDoorHeightFeet,
        setDoorHeightInches
    ]);

    return (
        <>

            <DoorModel
                doorModel={doorModel}
                setDoorModel={setDoorModel}
                models={models}
                renderSelectionIndicator={
                    renderSelectionIndicator
                }
            />

            <DoorSize
                doorSize={doorSize}
                setDoorSize={setDoorSize}
                doorSizes={doorSizes}

                customDimension={customDimension}
                setCustomDimension={setCustomDimension}

                doorWidthFeet={doorWidthFeet}
                setDoorWidthFeet={setDoorWidthFeet}

                doorWidthInches={doorWidthInches}
                setDoorWidthInches={setDoorWidthInches}

                doorHeightFeet={doorHeightFeet}
                setDoorHeightFeet={setDoorHeightFeet}

                doorHeightInches={doorHeightInches}
                setDoorHeightInches={setDoorHeightInches}

                width={width}
                height={height}

                panelStyle={panelStyle}

                numOfSections={numOfSections}
                setNumOfSections={setNumOfSections}

                numOfPanels={numOfPanels}
                setNumOfPanels={setNumOfPanels}

                renderSelectionIndicator={
                    renderSelectionIndicator
                }
            />

            <PanelStyle
                panelStyle={panelStyle}
                setPanelStyle={setPanelStyle}

                morePanelStyle={morePanelStyle}
                setMorePanelStyle={setMorePanelStyle}

                morePanelStyles={morePanelStyles}

                designCode={designCode}
                setDesignCode={setDesignCode}

                doorModel={doorModel}

                width={width}
                height={height}

                renderSelectionIndicator={
                    renderSelectionIndicator
                }
            />

            <ColorSelector
                availableColors={availableColors}
                optionalColors={optionalColors}

                panelStyle={panelStyle}

                selectedColor={selectedColor}
                setSelectedColor={setSelectedColor}

                showPopularColors={showPopularColors}
                setShowPopularColors={setShowPopularColors}
            />

            <FinishSelector
                finish={finish}
                setFinish={setFinish}

                panelStyle={panelStyle}
                selectedColor={selectedColor}

                renderSelectionIndicator={
                    renderSelectionIndicator
                }
            />

        </>
    );
}

export default DimensionsSection;