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

import {
    availableColors,
    optionalColors,
    silverColor
} from "../../Data/colors";

import { useEwSync } from "../../ew/ewSync";
import { getGlazingCodeValues } from "../../ew/glazingCodes";
import { usePricebook, getPriceValues } from "../../ew/priceController";
import { runConfigure } from "../../ew/configureController";

import {
    DOOR_MODEL_ATTRS,
    FACE_DESC,
    DESIGN_PATTERNS
} from "../../ew/ewAttributes";

import { IoIosArrowForward, IoIosArrowBack } from "react-icons/io";

import {
    MdBookmark,
    MdRestore
} from "react-icons/md";

import "./Configurator.css";

// End caps / Raynor inputs are not built yet – original defaults
const SINGLE_ENDCAP = true;
const END_CAPS = "N";
const RAYNOR_DOOR = "N";

const ALL_COLORS = [
    ...availableColors,
    ...optionalColors,
    silverColor
];

const SIZE_MAP = {
    "0": { width: 8, height: 7 },
    "1": { width: 9, height: 7 },
    "2": { width: 16, height: 7 },
    "3": { width: 8, height: 8 },
    "4": { width: 9, height: 8 },
    "5": { width: 16, height: 8 }
};

const TABS = [
    "dimensions",
    "glazing",
    "hardware",
    "operator",
    "advanced",
    "annotations"
];

function Configurator() {

    const [activeTab, setActiveTab] = useState("dimensions");

    /* ---------- Door ---------- */

    const [doorModel, setDoorModel] = useState("A");
    const [doorSize, setDoorSize] = useState("2");
    const [customDimension, setCustomDimension] = useState(false);
    const [panelStyle, setPanelStyle] = useState("F");
    const [morePanelStyle, setMorePanelStyle] = useState(false);
    const [selectedColor, setSelectedColor] = useState("W");
    const [finish, setFinish] = useState("W");
    const [designCode, setDesignCode] = useState("");

    const [doorWidthFeet, setDoorWidthFeet] = useState("16");
    const [doorWidthInches, setDoorWidthInches] = useState("0");
    const [doorHeightFeet, setDoorHeightFeet] = useState("7");
    const [doorHeightInches, setDoorHeightInches] = useState("0");

    const [numOfSections, setNumOfSections] = useState("4");
    const [numOfPanels, setNumOfPanels] = useState("");
    const [numOfWindows, setNumOfWindows] = useState("");

    const [showPopularColors, setShowPopularColors] = useState(true);

    /* ---------- Glazing ---------- */

    const [frameColor, setFrameColor] = useState("W");
    const [insertColor, setInsertColor] = useState("W");

    const [glassShape, setGlassShape] = useState("");
    const [glassType, setGlassType] = useState("");
    const [glassInsert, setGlassInsert] = useState("");
    const [temperedGlass, setTemperedGlass] = useState("");

    const [windowPosition, setWindowPosition] = useState("top");
    const [lastWindowPosition, setLastWindowPosition] = useState("top");
    const [customWindows, setCustomWindows] = useState([]);
    const [slimSections, setSlimSections] = useState([]);
    const [selectedSlimSection, setSelectedSlimSection] = useState(null);

    /* ---------- Configure ---------- */

    const [configuring, setConfiguring] = useState(false);

    const pricebook = usePricebook();

    /* ---------- Derived ---------- */

    const selectedSize = SIZE_MAP[doorSize];

    const width = customDimension
        ? Number(doorWidthFeet) * 12 + Number(doorWidthInches)
        : selectedSize.width * 12;

    const height = customDimension
        ? Number(doorHeightFeet) * 12 + Number(doorHeightInches)
        : selectedSize.height * 12;

    const sectionCount = Number(numOfSections) || 4;

    const isSlimGlass = (glassShape || "").includes("slim");

    /* ==========================================
       EFFECTS
    ========================================== */

    // Frame colour follows door colour (L138 slim -> Black)
    useEffect(() => {

        const isSlimA =
            doorModel === "A" &&
            (glassShape === "slim_single" || glassShape === "slim_double");

        setFrameColor(isSlimA ? "K" : selectedColor);

    }, [selectedColor, doorModel, glassShape]);

    // Insert colour follows door colour
    useEffect(() => {
        setInsertColor(selectedColor);
    }, [selectedColor]);

    // New glass shape: reset positions (slim -> Left, others -> Top)
    useEffect(() => {

        const defaultPosition =
            (glassShape || "").includes("slim") ? "left" : "top";

        setCustomWindows([]);
        setSlimSections([]);
        setSelectedSlimSection(null);

        setWindowPosition(defaultPosition);
        setLastWindowPosition(defaultPosition);

    }, [glassShape]);

    // Original: picking a glass shape with no glass type selects Clear
    useEffect(() => {

        if (glassShape && !glassType) {
            setGlassType("CLEAR");
        }

    }, [glassShape, glassType]);

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

    /* ==========================================
       LIVE EW VALUES (run on every change)
       Glazing part codes + price
    ========================================== */

    const liveValues = useMemo(() => {

        const glazing = getGlazingCodeValues({
            doorModel,
            panelStyle,
            glassShape,
            glassType,
            glassInsert,
            temperedGlass,
            frameColor,
            insertColor,
            windowPosition,
            doorInfoSections: doorInfo.sections
        });

        const price = getPriceValues({
            width,
            height,
            doorModel,
            panelStyle,
            glazing,
            totals: doorInfo,
            pricebook
        });

        return { ...glazing, ...price };

    }, [
        doorModel,
        panelStyle,
        glassShape,
        glassType,
        glassInsert,
        temperedGlass,
        frameColor,
        insertColor,
        windowPosition,
        doorInfo,
        width,
        height,
        pricebook
    ]);

    // PRICE / PRICE_DISPLAY are React-only (header display)
    const ewLiveValues = useMemo(() => {

        const { PRICE, PRICE_DISPLAY, ...rest } = liveValues;

        return rest;

    }, [liveValues]);

    useEwSync(ewLiveValues);

    /* ==========================================
       CONFIGURE (original Configure() in FINAL_VALIDATION.js)
    ========================================== */

    const getConfigureContext = () => {

        const colorObj = ALL_COLORS.find(
            color => color.value === selectedColor
        );

        const modelAttrs = DOOR_MODEL_ATTRS[doorModel] || {};

        return {

            /* Live values that exist in EW (glazing codes + door face / glazing price) */
            liveValues: ewLiveValues,

            /* Full door info */
            doorInfo,

            /* Section bundle input (values come from React state) */
            sectionBundleInput: {
                width,
                height,
                numOfSections,

                doorModel,
                doorModelId: modelAttrs.id || "",
                doorModelDesc: modelAttrs.desc || "",

                panelStyle,
                faceDesc: FACE_DESC[panelStyle] || "",
                designPattern: DESIGN_PATTERNS[designCode] || "",

                colorValue: selectedColor,
                colorDesc: colorObj?.desc || "",

                glassShape,
                windowPosition,
                doorInfoSections: doorInfo.sections,

                endCaps: END_CAPS,
                raynorDoor: RAYNOR_DOOR
            },

            /* Glazing code + scheduling input */
            glazingInput: {
                doorModel,
                panelStyle,
                glassShape,
                glassType,
                glassInsert,
                temperedGlass,
                windowPosition,
                numOfSections,
                width,
                designCode,
                selectedColor,
                doorInfoSections: doorInfo.sections,
                endCaps: END_CAPS
            }

        };
    };


    const handleConfigure = async (event) => {

        event?.preventDefault?.();

        if (configuring) {
            return;
        }

        setConfiguring(true);

        try {
            await runConfigure(getConfigureContext);
        } finally {
            setConfiguring(false);
        }
    };

    /* ==========================================
       HELPERS
    ========================================== */

    const renderSelectionIndicator = (isSelected) =>
        isSelected ? (
            <div className="selection-indicator">✓</div>
        ) : null;

    const getCurrentEnabled = () =>
        doorInfo.sections.map(section => [...section.enabled]);

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

            return getEnabledWindows(count, index, seedPosition || "left", true);
        });

        return { sections, enabled };
    };

    /* ==========================================
       HANDLERS
    ========================================== */

    const handleWindowsChange = (enabled) => {
        setCustomWindows(enabled);
        setWindowPosition("custom");
    };

    const handleWindowPositionChange = (position) => {

        setSelectedSlimSection(null);

        if (position === "custom") {

            if (isSlimGlass) {
                const seed = buildSlimCustomSeed(lastWindowPosition);
                setSlimSections(seed.sections);
                setCustomWindows(seed.enabled);
            } else {
                setCustomWindows(getCurrentEnabled());
            }

        } else {

            setCustomWindows([]);
            setLastWindowPosition(position);
        }

        setWindowPosition(position);
    };

    const handleSlimSectionChange = (index, patch) => {

        const nextSections = Array.from(
            { length: sectionCount },
            (_, i) => getSlimSectionConfig(slimSections, i, glassShape)
        );

        const next = { ...nextSections[index], ...patch };

        nextSections[index] = next;

        const count = getSlimSectionPositions(next, width, SINGLE_ENDCAP).length;

        const oldEnabled = doorInfo.sections[index]?.enabled || [];

        let enabled;

        if (patch.slimOne === true) {

            enabled = Array(count).fill(false);

            if (count) {
                enabled[Math.floor(count / 2)] = true;
            }

        } else if (!("shape" in patch) && oldEnabled.length === count) {

            enabled = [...oldEnabled];

        } else {

            enabled = Array(count).fill(false);
        }

        const nextEnabled = getCurrentEnabled();

        nextEnabled[index] = enabled;

        setSlimSections(nextSections);
        setCustomWindows(nextEnabled);
    };

    const resetGlazing = () => {

        setGlassShape("");
        setGlassType("");
        setGlassInsert("");

        setWindowPosition("top");
        setLastWindowPosition("top");
        setCustomWindows([]);

        setSlimSections([]);
        setSelectedSlimSection(null);

        setTemperedGlass("");

        setFrameColor(selectedColor);
        setInsertColor(selectedColor);
    };

    const handlePanelStyleChange = (value) => {

        if (value === panelStyle) {
            return;
        }

        setPanelStyle(value);

        resetGlazing();
    };

    const handleNext = () => {

        const index = TABS.indexOf(activeTab);

        if (index < TABS.length - 1) {
            setActiveTab(TABS[index + 1]);
        }
    };

    const handleBack = () => {

        const index = TABS.indexOf(activeTab);

        if (index > 0) {
            setActiveTab(TABS[index - 1]);
        }
    };

    /* ==========================================
       RENDER
    ========================================== */

    return (

        <div className="rw-configurator__layout">

            {/* Configure loader (original canvas-loader-backdrop) */}

            {configuring && (
                <div className="canvas-loader-backdrop">
                    <div className="canvas-loader" />
                </div>
            )}

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
                            renderSelectionIndicator={renderSelectionIndicator}
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

                <HeaderSection
                    priceDisplay={liveValues.PRICE_DISPLAY}
                />

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

                        renderSelectionIndicator={renderSelectionIndicator}
                    />

                )}

                {activeTab === "glazing" && (

                    <GlazingSection
                        glassShape={glassShape}
                        setGlassShape={setGlassShape}

                        glassType={glassType}
                        setGlassType={setGlassType}

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

                        renderSelectionIndicator={renderSelectionIndicator}

                        numOfWindows={numOfWindows}
                        setNumOfWindows={setNumOfWindows}
                    />

                )}

                {activeTab === "hardware" && <HardwareSection />}

                {activeTab === "operator" && <OperatorSection />}

                {activeTab === "advanced" && <AdvancedSection />}

                {activeTab === "annotations" && <AnnotationsSection />}

                <div className="configurator-navigation">

                    <button
                        type="button"
                        className="nav-button nav-button-dark"
                        disabled={activeTab === TABS[0]}
                        onClick={handleBack}
                    >
                        <span className="nav-icon-left">
                            <IoIosArrowBack />
                        </span>
                        Back
                    </button>

                    <button
                        type="button"
                        id="CONFIGURE_BTN"
                        className="nav-button configure-button"
                        disabled={configuring}
                        onClick={handleConfigure}
                    >
                        Configure
                    </button>

                    <button
                        type="button"
                        className="nav-button nav-button-dark"
                        disabled={activeTab === TABS[TABS.length - 1]}
                        onClick={handleNext}
                    >
                        Next
                        <span className="nav-icon-right">
                            <IoIosArrowForward />
                        </span>
                    </button>

                </div>

                <div className="configurator-footer-actions">

                    <button type="button" className="default-link-button">
                        <MdBookmark />
                        <span>Save as Default</span>
                    </button>

                    <button type="button" className="default-link-button">
                        <MdRestore />
                        <span>Restore Default</span>
                    </button>

                </div>

            </div>

        </div>
    );
}

export default Configurator;
