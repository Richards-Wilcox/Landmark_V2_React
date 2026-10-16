import { useState, useEffect, useMemo } from "react";

import NavigationTabs from "../../components/NavigationTabs/NavigationTabs";

import HeaderSection from "./Sections/HeaderSection";
import DimensionsSection from "./Sections/DimensionsSection";
import GlazingSection from "./Sections/GlazingSection";
import HardwareSection from "./Sections/HardwareSection";
import OperatorSection from "./Sections/OperatorSection";
import AdvancedSection from "./Sections/AdvancedSection";
import AnnotationsSection from "./Sections/AnnotationSection";
import DoorCanvas from "../../components/Canvas/DoorCanvas";
import WindowPosition from "../../components/Glazing/WindowPosition";

import { getDoorInfo } from "../../components/Canvas/doorInfo";

import {
    getDefaultSlimSection,
    getSlimSectionConfig,
    getSlimSectionPositions,
    getEnabledWindows
} from "../../components/Canvas/canvasWindowLayout";

import { IoIosArrowForward, IoIosArrowBack } from "react-icons/io";

import {
    MdBookmark,
    MdRestore
} from "react-icons/md";

import "./Configurator.css";

// End caps input is not built yet – original default is single
const SINGLE_ENDCAP = true;

function Configurator() {

    const [activeTab, setActiveTab] =
        useState("dimensions");

    const [doorModel, setDoorModel] =
        useState("A");

    const [doorSize, setDoorSize] =
        useState("2");

    const [customDimension, setCustomDimension] =
        useState(false);

    const [panelStyle, setPanelStyle] =
        useState("F");

    const [morePanelStyle, setMorePanelStyle] =
        useState(false);

    const [selectedColor, setSelectedColor] =
        useState("W");

    const [finish, setFinish] =
        useState("W");

    const [designCode, setDesignCode] =
        useState("");

    const [doorWidthFeet, setDoorWidthFeet] =
        useState("16");

    const [doorWidthInches, setDoorWidthInches] =
        useState("0");

    const [doorHeightFeet, setDoorHeightFeet] =
        useState("7");

    const [doorHeightInches, setDoorHeightInches] =
        useState("0");

    const [numOfSections, setNumOfSections] =
        useState("4");

    const [numOfPanels, setNumOfPanels] =
        useState("");

    const [showPopularColors,
        setShowPopularColors] =
        useState(true);

    const [frameColor, setFrameColor] =
        useState("W");

    const [insertColor, setInsertColor] =
        useState("W");

    /* ---------- Glazing ---------- */

    const [glassShape, setGlassShape] =
        useState("");

    const [glassInsert, setGlassInsert] =
        useState("");

    const [temperedGlass, setTemperedGlass] =
        useState("");

    const [windowPosition, setWindowPosition] =
        useState("top");

    // Last non-custom position (used to seed slim custom mode)
    const [lastWindowPosition, setLastWindowPosition] =
        useState("top");

    // Enabled windows per section in custom mode
    const [customWindows, setCustomWindows] =
        useState([]);

    // Slim per-section config: { shape, slimOne, spacing }
    const [slimSections, setSlimSections] =
        useState([]);

    // Section whose pencil menu is open
    const [selectedSlimSection, setSelectedSlimSection] =
        useState(null);

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

    const width =
        customDimension
            ? (
                Number(doorWidthFeet) * 12 +
                Number(doorWidthInches)
            )
            : (
                selectedSize.width * 12
            );

    const height =
        customDimension
            ? (
                Number(doorHeightFeet) * 12 +
                Number(doorHeightInches)
            )
            : (
                selectedSize.height * 12
            );

    const sectionCount =
        Number(numOfSections) || 4;

    const isSlimGlass =
        (glassShape || "").includes("slim");

    const tabs = [
        "dimensions",
        "glazing",
        "hardware",
        "operator",
        "advanced",
        "annotations"
    ];

    /* ==========================================
       EFFECTS
    ========================================== */

    //Set frame color selection same as door color
    useEffect(() => {

        const isSlimA =

            doorModel === "A" &&

            (
                glassShape === "slim_single" ||
                glassShape === "slim_double"
            );

        if (isSlimA) {

            setFrameColor("K");

            return;

        }

        setFrameColor(selectedColor);

    }, [
        selectedColor,
        doorModel,
        glassShape
    ]);

    //Set insert color selection same as door color
    useEffect(() => {

        setInsertColor(selectedColor);

    }, [selectedColor]);

    // New glass shape: reset positions (slim -> Left, others -> Top)
    useEffect(() => {

        const defaultPosition =
            (glassShape || "").includes("slim")
                ? "left"
                : "top";

        setCustomWindows([]);
        setSlimSections([]);
        setSelectedSlimSection(null);

        setWindowPosition(defaultPosition);
        setLastWindowPosition(defaultPosition);

    }, [glassShape]);

    // Close the slim menu when leaving the Glazing tab
    useEffect(() => {

        if (activeTab !== "glazing") {
            setSelectedSlimSection(null);
        }

    }, [activeTab]);

    /* ==========================================
       DOOR INFO (original getDoorInfo)
    ========================================== */

    const doorInfo = useMemo(() => getDoorInfo({
        width,
        height,
        numOfSections,
        panelStyle,
        selectedColor,
        finish,
        frameColor,
        insertColor,
        glassShape,
        glassInsert,
        windowPosition,
        customWindows,
        slimSections,
        selectedSlimSection,
        temperedGlass,
        activeTab,
        singleEndcap: SINGLE_ENDCAP
    }), [
        width,
        height,
        numOfSections,
        panelStyle,
        selectedColor,
        finish,
        frameColor,
        insertColor,
        glassShape,
        glassInsert,
        windowPosition,
        customWindows,
        slimSections,
        selectedSlimSection,
        temperedGlass,
        activeTab
    ]);

    console.log(doorInfo)
    /* ==========================================
       HELPERS
    ========================================== */

    const renderSelectionIndicator = (
        isSelected
    ) =>
        isSelected ? (
            <div className="selection-indicator">
                ✓
            </div>
        ) : null;

    const getCurrentEnabled = () =>
        doorInfo.sections.map(
            section => [...section.enabled]
        );

    /* Slim custom start (original resetSlimCustomState) */

    const buildSlimCustomSeed = (seedPosition) => {

        const sections = Array.from(
            { length: sectionCount },
            () => getDefaultSlimSection(glassShape)
        );

        const enabled = sections.map((config, index) => {

            const count = getSlimSectionPositions(
                config,
                width,
                SINGLE_ENDCAP
            ).length;

            return getEnabledWindows(
                count,
                index,
                seedPosition || "left",
                true
            );
        });

        return { sections, enabled };
    };

    /* ==========================================
       HANDLERS
    ========================================== */

    // Canvas click (custom selection)
    const handleWindowsChange = (enabled) => {

        setCustomWindows(enabled);
        setWindowPosition("custom");
    };

    // Window position buttons
    const handleWindowPositionChange = (position) => {

        setSelectedSlimSection(null);

        if (position === "custom") {

            if (isSlimGlass) {

                const seed = buildSlimCustomSeed(lastWindowPosition);

                setSlimSections(seed.sections);
                setCustomWindows(seed.enabled);

            } else {

                // Start custom from what is on the canvas now
                setCustomWindows(getCurrentEnabled());
            }

        } else {

            setCustomWindows([]);
            setLastWindowPosition(position);
        }

        setWindowPosition(position);
    };

    // Pencil menu: Shape / Lites / Spacing
    const handleSlimSectionChange = (index, patch) => {

        const nextSections = Array.from(
            { length: sectionCount },
            (_, i) => getSlimSectionConfig(slimSections, i, glassShape)
        );

        const next = {
            ...nextSections[index],
            ...patch
        };

        nextSections[index] = next;

        const count = getSlimSectionPositions(
            next,
            width,
            SINGLE_ENDCAP
        ).length;

        const oldEnabled =
            doorInfo.sections[index]?.enabled || [];

        let enabled;

        if (patch.slimOne === true) {

            // One Lite: start with the center window
            enabled = Array(count).fill(false);

            if (count) {
                enabled[Math.floor(count / 2)] = true;
            }

        } else if (
            !("shape" in patch) &&
            oldEnabled.length === count
        ) {

            // Same layout size: keep the selection
            enabled = [...oldEnabled];

        } else {

            // Layout changed: user picks windows again
            enabled = Array(count).fill(false);
        }

        const nextEnabled = getCurrentEnabled();

        nextEnabled[index] = enabled;

        setSlimSections(nextSections);
        setCustomWindows(nextEnabled);
    };

    /* ==========================================
       RESET GLAZING
    ========================================== */

    const resetGlazing = () => {

        setGlassShape("");
        setGlassInsert("");

        setWindowPosition("top");
        setLastWindowPosition("top");
        setCustomWindows([]);

        setSlimSections([]);
        setSelectedSlimSection(null);

        setTemperedGlass("");

        // Frame and insert colours go back to the door colour
        setFrameColor(selectedColor);
        setInsertColor(selectedColor);
    };

    /* Any panel change resets glazing */

    const handlePanelStyleChange = (value) => {

        if (value === panelStyle) {
            return;
        }

        setPanelStyle(value);

        resetGlazing();
    };

    /* ==========================================
       NAVIGATION
    ========================================== */

    const handleNext = () => {

        const currentIndex =
            tabs.indexOf(activeTab);

        if (
            currentIndex < tabs.length - 1
        ) {

            setActiveTab(
                tabs[currentIndex + 1]
            );

        }

    };

    const handleBack = () => {

        const currentIndex =
            tabs.indexOf(activeTab);

        if (
            currentIndex > 0
        ) {

            setActiveTab(
                tabs[currentIndex - 1]
            );

        }

    };

    return (

        <div className="rw-configurator__layout">

            {/* LEFT SIDE */}

            <div className="rw-configurator__layout--left">

                <NavigationTabs
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                />

                <div className="canvas-area">

                    {activeTab === "glazing" && (
                        <WindowPosition
                            glassShape={glassShape}
                            panelStyle={panelStyle}
                            windowPosition={windowPosition}
                            onPositionChange={handleWindowPositionChange}
                            renderSelectionIndicator={
                                renderSelectionIndicator
                            }
                        />
                    )}

                    <DoorCanvas
                        doorModel={doorModel}
                        panelStyle={panelStyle}

                        width={width}
                        height={height}

                        numOfSections={numOfSections}

                        selectedColor={selectedColor}
                        finish={finish}

                        frameColor={frameColor}
                        insertColor={insertColor}

                        glassShape={glassShape}
                        glassInsert={glassInsert}

                        windowPosition={windowPosition}
                        activeTab={activeTab}

                        customWindows={customWindows}
                        onWindowsChange={handleWindowsChange}

                        slimSections={slimSections}
                        selectedSlimSection={selectedSlimSection}
                        onSelectSlimSection={setSelectedSlimSection}
                        onSlimSectionChange={handleSlimSectionChange}
                    />

                </div>

                <div className="canvas-footer">
                    ⓘ Actual door appearance may differ slightly.
                </div>

            </div>

            {/* RIGHT SIDE */}

            <div className="rw-configurator__layout--right">

                <HeaderSection />

                {activeTab === "dimensions" && (

                    <DimensionsSection

                        doorModel={doorModel}
                        setDoorModel={setDoorModel}

                        doorSize={doorSize}
                        setDoorSize={setDoorSize}

                        customDimension={customDimension}
                        setCustomDimension={setCustomDimension}

                        panelStyle={panelStyle}
                        setPanelStyle={handlePanelStyleChange}

                        morePanelStyle={morePanelStyle}
                        setMorePanelStyle={setMorePanelStyle}

                        selectedColor={selectedColor}
                        setSelectedColor={setSelectedColor}

                        finish={finish}
                        setFinish={setFinish}

                        designCode={designCode}
                        setDesignCode={setDesignCode}

                        doorWidthFeet={doorWidthFeet}
                        setDoorWidthFeet={setDoorWidthFeet}

                        doorWidthInches={doorWidthInches}
                        setDoorWidthInches={setDoorWidthInches}

                        doorHeightFeet={doorHeightFeet}
                        setDoorHeightFeet={setDoorHeightFeet}

                        doorHeightInches={doorHeightInches}
                        setDoorHeightInches={setDoorHeightInches}

                        numOfSections={numOfSections}
                        setNumOfSections={setNumOfSections}

                        numOfPanels={numOfPanels}
                        setNumOfPanels={setNumOfPanels}

                        width={width}
                        height={height}

                        showPopularColors={showPopularColors}
                        setShowPopularColors={setShowPopularColors}

                        renderSelectionIndicator={
                            renderSelectionIndicator
                        }

                    />

                )}

                {activeTab === "glazing" && (

                    <GlazingSection
                        glassShape={glassShape}
                        setGlassShape={setGlassShape}

                        glassInsert={glassInsert}
                        setGlassInsert={setGlassInsert}

                        temperedGlass={temperedGlass}
                        setTemperedGlass={setTemperedGlass}

                        doorModel={doorModel}
                        panelStyle={panelStyle}

                        width={width}
                        height={height}

                        selectedColor={selectedColor}

                        frameColor={frameColor}
                        setFrameColor={setFrameColor}

                        insertColor={insertColor}
                        setInsertColor={setInsertColor}

                        renderSelectionIndicator={
                            renderSelectionIndicator
                        }
                    />

                )}

                {activeTab === "hardware" && (
                    <HardwareSection />
                )}

                {activeTab === "operator" && (
                    <OperatorSection />
                )}

                {activeTab === "advanced" && (
                    <AdvancedSection />
                )}

                {activeTab === "annotations" && (
                    <AnnotationsSection />
                )}

                <div className="configurator-navigation">

                    <button
                        className="nav-button nav-button-dark"
                        disabled={activeTab === tabs[0]}
                        onClick={handleBack}
                    >

                        <span className="nav-icon-left">
                            <IoIosArrowBack />
                        </span>

                        Back

                    </button>

                    <button
                        className="nav-button configure-button"
                    >
                        Configure
                    </button>

                    <button
                        className="nav-button nav-button-dark"
                        disabled={
                            activeTab === tabs[tabs.length - 1]
                        }
                        onClick={handleNext}
                    >

                        Next

                        <span className="nav-icon-right">
                            <IoIosArrowForward />
                        </span>

                    </button>
                </div>

                <div className="configurator-footer-actions">

                    <button
                        className="default-link-button"
                    >
                        <MdBookmark />

                        <span>
                            Save as Default
                        </span>
                    </button>

                    <button
                        className="default-link-button"
                    >
                        <MdRestore />

                        <span>
                            Restore Default
                        </span>
                    </button>

                </div>

            </div>

        </div>

    );

}

export default Configurator;
