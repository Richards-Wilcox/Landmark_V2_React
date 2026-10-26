import { useState, useEffect, useMemo, useRef } from "react";

import ConfigSection from "./ConfigSection";

import HeaderSection from "./Sections/HeaderSection";
import DimensionsSection from "./Sections/DimensionsSection";
import GlazingSection from "./Sections/GlazingSection";
import HardwareSection from "./Sections/HardwareSection";
import OperatorSection from "./Sections/OperatorSection";
import AdvancedSection from "./Sections/AdvancedSection";
import AnnotationsSection from "./Sections/AnnotationSection";
import DoorCanvas from "../../components/Canvas/DoorCanvas";
import WindowPosition from "../../components/Glazing/WindowPosition";

import SceneControls from "../../components/Scene/SceneControls";
import HomePhotoMarker from "../../components/Scene/HomePhotoMarker";
import PhotoCanvas from "../../components/Scene/PhotoCanvas";

import {
    validateHomePhotoFile,
    readHomePhotoFile,
    saveHomePhoto,
    loadSavedHomePhoto,
    clearHomePhoto,
    getConfigSerial
} from "../../components/Scene/homePhoto";

import { getDoorInfo, getJsonObj } from "../../components/Canvas/doorInfo";

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
    loadConfiguratorInputs,
    saveConfiguratorInputs
} from "../../ew/configStorage";

import {
    DEFAULT_HARDWARE,
    applyHardwareRules,
    getHardwareEwValues,
    getLiftConfig
} from "../../Data/hardwareData";

import {
    DOOR_MODEL_ATTRS,
    FACE_DESC,
    DESIGN_PATTERNS
} from "../../ew/ewAttributes";


import { getDrivenValues } from "../../ew/drivenValues";

import {
    MdBookmarkBorder,
    MdRestore,
    MdArrowBack,
    MdCheck
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

// Standard door sizes (8x7, 9x7, 16x7, 8x8, 9x8, 16x8)
const SIZE_MAP = {
    "0": { width: 8, height: 7 },
    "1": { width: 9, height: 7 },
    "2": { width: 16, height: 7 },
    "3": { width: 8, height: 8 },
    "4": { width: 9, height: 8 },
    "5": { width: 16, height: 8 }
};


/* ==========================================================
   LANDMARK HOUSE SCENES

   Door models:
   A = Classic L138      -> Classic house   (1536 x 1024 images)
   D = Premium L200      -> Contemporary    (1440 x 908 images)
   G = Grandview L200GV  -> Classic house (until its own set exists)

   Standard sizes (SIZE_MAP keys):
   0 = 8x7
   1 = 9x7
   2 = 16x7
   3 = 8x8
   4 = 9x8
   5 = 16x8

   Every house has ONE image per standard size. The garage
   door in each image is a plain door area of that size, and
   the React door is stretched to fill it.

   width / height : image size in pixels (differs per house)
   opening        : garage door area inside the image (image px)
   lights         : optional wall-light spots for the night glow
========================================================== */

const IMAGE_PATH =
    "/HTML/products/162059085/images/";

/* ----------------------------------------------------------
   Shared scene builder
---------------------------------------------------------- */

const makeLandmarkScene = ({
    id,
    file,
    opening,
    lights = [],

    // Classic images are 1536 x 1024
    width = 1536,
    height = 1024
}) => ({
    id,

    url: `${IMAGE_PATH}${file}`,

    width,
    height,

    opening,

    safeArea: {
        left: Math.max(
            0,
            opening.x - 70
        ),

        right:
            opening.x +
            opening.width +
            70
    },

    lights,

    // The door fills the opening exactly
    stretch: true
});

/* ==========================================================
   CLASSIC L138
   Door model A
========================================================== */

const CLASSIC_LANDMARK_SCENES = {

    /* ---------- 8x7 ---------- */

    "0": makeLandmarkScene({
        id: "classic-8x7",

        file:
            "Landmark_8x7.jpg",

        opening: {
            x: 223,
            y: 540,
            width: 284,
            height: 244
        },

        lights: [
            {
                x: 167,
                y: 567
            },
            {
                x: 560,
                y: 567
            }
        ]
    }),

    /* ---------- 9x7 ---------- */

    "1": makeLandmarkScene({
        id: "classic-9x7",

        file:
            "Landmark_9x7.jpg",

        opening: {
            x: 236,
            y: 555,
            width: 298,
            height: 243
        },

        lights: [
            {
                x: 185,
                y: 575
            },
            {
                x: 578,
                y: 575
            }
        ]
    }),

    /* ---------- 16x7 ---------- */

    "2": makeLandmarkScene({
        id: "classic-16x7",

        file:
            "Landmark_16x7.jpg",

        opening: {
            x: 149,
            y: 549,
            width: 520,
            height: 220
        },

        lights: [
            {
                x: 105,
                y: 570
            },
            {
                x: 710,
                y: 570
            }
        ]
    }),

    /* ---------- 8x8 ---------- */

    "3": makeLandmarkScene({
        id: "classic-8x8",

        file:
            "Landmark_8x8.jpg",

        opening: {
            x: 177,
            y: 561,
            width: 278,
            height: 253
        },

        lights: [
            {
                x: 118,
                y: 595
            },
            {
                x: 508,
                y: 595
            }
        ]
    }),

    /* ---------- 9x8 ---------- */

    "4": makeLandmarkScene({
        id: "classic-9x8",

        file:
            "Landmark_9x8.jpg",

        opening: {
            x: 215,
            y: 537,
            width: 290,
            height: 259
        },

        lights: [
            {
                x: 142,
                y: 562
            },
            {
                x: 570,
                y: 562
            }
        ]
    }),

    /* ---------- 16x8 ---------- */

    "5": makeLandmarkScene({
        id: "classic-16x8",

        file:
            "Landmark_16x8.jpg",

        opening: {
            x: 155,
            y: 552,
            width: 496,
            height: 226
        },

        lights: [
            {
                x: 105,
                y: 570
            },
            {
                x: 698,
                y: 568
            }
        ]
    })
};

/* ==========================================================
   CONTEMPORARY
   Premium L200
   Door model D

   Made from the original Landmark_Contemporary.jpg.
   Image size: 1440 x 908.

========================================================== */

const CONTEMPORARY_IMAGE_SIZE = {
    width: 1440,
    height: 908
};

const CONTEMPORARY_LANDMARK_SCENES = {

    // 8x7  (door 156 + jamb 8)
    "0": makeLandmarkScene({
        id: "contemporary-8x7",
        file: "Landmark_Contemporary_8x7.jpg",
        opening: { x: 385, y: 536, width: 164, height: 136 },
        ...CONTEMPORARY_IMAGE_SIZE
    }),

    // 9x7  (door 176 + jamb 8)
    "1": makeLandmarkScene({
        id: "contemporary-9x7",
        file: "Landmark_Contemporary_9x7.jpg",
        opening: { x: 375, y: 536, width: 184, height: 136 },
        ...CONTEMPORARY_IMAGE_SIZE
    }),

    // 16x7 (door 312 + jamb 8)
    "2": makeLandmarkScene({
        id: "contemporary-16x7",
        file: "Landmark_Contemporary_16x7.jpg",
        opening: { x: 307, y: 536, width: 320, height: 136 },
        ...CONTEMPORARY_IMAGE_SIZE
    }),

    // 8x8  (door 156 + jamb 8)
    "3": makeLandmarkScene({
        id: "contemporary-8x8",
        file: "Landmark_Contemporary_8x8.jpg",
        opening: { x: 385, y: 516, width: 164, height: 156 },
        ...CONTEMPORARY_IMAGE_SIZE
    }),

    // 9x8  (door 176 + jamb 8)
    "4": makeLandmarkScene({
        id: "contemporary-9x8",
        file: "Landmark_Contemporary_9x8.jpg",
        opening: { x: 375, y: 516, width: 184, height: 156 },
        ...CONTEMPORARY_IMAGE_SIZE
    }),

    // 16x8 (door 312 + jamb 8)
    "5": makeLandmarkScene({
        id: "contemporary-16x8",
        file: "Landmark_Contemporary_16x8.jpg",
        opening: { x: 307, y: 516, width: 320, height: 156 },
        ...CONTEMPORARY_IMAGE_SIZE
    })
};

/* ==========================================================
   GRANDVIEW
   Grandview L200GV
   Door model G

   8x7 / 9x7 / 8x8 / 9x8 : single-car garage houses (1536 x 1024)
   16x7 / 16x8           : made from Grandview_White.webp (1192 x 752)
   Opening = the plain door area (white trim stays visible).
   Lights  = the two wall lanterns beside the garage.
========================================================== */

const GRANDVIEW_LANDMARK_SCENES = {

    // 8x7
    "0": makeLandmarkScene({
        id: "grandview-8x7",
        file: "Landmark_Grandview_8x7.jpg",
        opening: { x: 140, y: 562, width: 279, height: 244 },
        lights: [{ x: 96, y: 608 }, { x: 510, y: 608 }]
    }),

    // 9x7
    "1": makeLandmarkScene({
        id: "grandview-9x7",
        file: "Landmark_Grandview_9x7.jpg",
        opening: { x: 201, y: 499, width: 350, height: 272 },
        lights: [{ x: 140, y: 534 }, { x: 596, y: 534 }]
    }),

    // 16x7
    "2": makeLandmarkScene({
        id: "grandview-16x7",
        file: "Landmark_Grandview_16x7.jpg",
        opening: { x: 190, y: 553, width: 511, height: 223 },
        lights: [{ x: 138, y: 578 }, { x: 744, y: 578 }]
    }),

    // 8x8
    "3": makeLandmarkScene({
        id: "grandview-8x8",
        file: "Landmark_Grandview_8x8.jpg",
        opening: { x: 227, y: 503, width: 275, height: 275 },
        lights: [{ x: 174, y: 560 }, { x: 572, y: 560 }]
    }),

    // 9x8
    "4": makeLandmarkScene({
        id: "grandview-9x8",
        file: "Landmark_Grandview_9x8.jpg",
        opening: { x: 186, y: 565, width: 286, height: 254 },
        lights: [{ x: 125, y: 605 }, { x: 565, y: 605 }]
    }),

    // 16x8
    "5": makeLandmarkScene({
        id: "grandview-16x8",
        file: "Landmark_Grandview_16x8.jpg",
        opening: { x: 152, y: 575, width: 465, height: 232 },
        lights: [{ x: 103, y: 613 }, { x: 658, y: 613 }]
    })
};

/* ==========================================================
   SCENE MAP BY DOOR MODEL
========================================================== */

const LANDMARK_SCENES_BY_MODEL = {

    // Classic L138
    A: CLASSIC_LANDMARK_SCENES,

    // Premium L200
    D: CONTEMPORARY_LANDMARK_SCENES,

    // Grandview L200GV
    G: GRANDVIEW_LANDMARK_SCENES
};

/* ==========================================================
   GET LANDMARK SCENE
   Door model picks the house, door size picks the image.
========================================================== */

const getLandmarkScene = (
    doorModel,
    doorSize
) => {

    /*
     * Unknown door model -> Classic images.
     */
    const modelScenes =
        LANDMARK_SCENES_BY_MODEL[doorModel] ||
        CLASSIC_LANDMARK_SCENES;

    /*
     * Unknown size -> 16x7 (SIZE_MAP id "2").
     */
    return (
        modelScenes[doorSize] ||
        modelScenes["2"]
    );
};

/* Customer photo
   stretch: door fills the marked box exactly. */
const getCustomScene = (photo) => {

    const { opening } = photo;

    const padX = opening.width * 0.15;
    const padY = opening.height * 0.2;

    return {
        id: "custom",
        url: photo.url,
        width: photo.width,
        height: photo.height,
        opening,
        safeArea: {
            left: Math.max(0, opening.x - padX),
            right: Math.min(photo.width, opening.x + opening.width + padX),
            top: Math.max(0, opening.y - padY),
            bottom: Math.min(photo.height, opening.y + opening.height + padY)
        },
        lights: [],
        stretch: true
    };
};

// Lantern glow size in Night view (image px)
const LIGHT_GLOW_RADIUS = 70;

/* Glazing focus zoom: door is enlarged and centred in the scene
   so windows / slim pencils are easy to use.
   Values are fractions of the left scene size. */
const GLAZING_FOCUS = {
    doorWidth: 0.56,     // door takes up to 56% of the scene width
    centerX: 0.5,        // door centre = middle of the scene
    topReserved: 100,    // px kept free for the Window Position toolbar
    bottomReserved: 70   // px kept free for the footer / zoom controls
};

// DoorCanvas internals (canvas 900 x 700, door fitted in 700 x 500)
const CANVAS_W = 900;
const CANVAS_H = 700;
const CANVAS_DOOR_MAX_W = 700;
const CANVAS_DOOR_MAX_H = 500;

// Product types (Change product type menu)
const PRODUCT_TYPES = [
    { value: "complete", label: "Complete" },
    { value: "assemble", label: "Assemble" },
    { value: "raw", label: "Raw Panel" }
];

// Cards (same order as the old tabs)
const CONFIG_SECTIONS = [
    { id: "dimensions", title: "Door Model" },
    { id: "glazing", title: "Glazing" },
    { id: "hardware", title: "Hardware" },
    { id: "operator", title: "Operator" },
    { id: "advanced", title: "Advanced" },
    { id: "annotations", title: "Annotations" }
];

function Configurator() {

    const [restored] = useState(() => loadConfiguratorInputs());

    // activeTab = card currently in view (updated on scroll)
    const [activeTab, setActiveTab] = useState("dimensions");

    // Cards are open by default; ids set to true here are collapsed
    const [collapsedSections, setCollapsedSections] = useState({});

    /* ---------- Scroll-spy refs ---------- */

    const scrollRef = useRef(null);
    const cardRefs = useRef({});
    const isProgrammaticScroll = useRef(false);
    const scrollTimer = useRef(null);

    /* ---------- Full-page layout ref ---------- */

    const layoutRef = useRef(null);

    /* ---------- House scene ---------- */

    const sceneRef = useRef(null);
    const [sceneSize, setSceneSize] = useState({ width: 0, height: 0 });

    // Day / Night preview
    const [viewMode, setViewMode] = useState("day");

    const [wallColor, setWallColor] = useState("");

    /* ---------- Scene background ----------
       "none"   = grey gradient (old design)
       "house"  = Landmark photo (standard sizes only)
       "custom" = customer's own photo                */

    const [sceneBackground, setSceneBackground] = useState("house");

    // Photo saved for THIS configuration (loaded by serial below)
    const [homePhoto, setHomePhoto] = useState(null);

    // Photo currently being marked (opens HomePhotoMarker)
    const [markerPhoto, setMarkerPhoto] = useState(null);

    const [photoLoading, setPhotoLoading] = useState(false);
    const [sceneMessage, setSceneMessage] = useState("");

    // Current configuration serial (state only changes when the serial changes)
    const [serialNumber, setSerialNumber] = useState("");

    useEffect(() => {

        const serial = getConfigSerial();

        if (serial !== serialNumber) {
            setSerialNumber(serial);
        }
    });

    // New / different configuration: load ITS photo, otherwise default
    useEffect(() => {

        const saved = loadSavedHomePhoto(serialNumber);

        setHomePhoto(saved);
        setSceneBackground(saved ? "custom" : "house");
        setMarkerPhoto(null);
        setSceneMessage("");

    }, [serialNumber]);

    /* ---------- Product type (scene toolbar) ---------- */

    const [productType, setProductType] = useState(restored.productType ?? "complete");
    const [productMenuOpen, setProductMenuOpen] = useState(false);
    const productMenuRef = useRef(null);

    /* Product type – Hardware / Operator only for "Complete"
      (original PRODUCT_TYPE_TAB_VISIBILITY). */

    const visibleSections = useMemo(
        () => CONFIG_SECTIONS.filter(section =>
            productType === "complete" ||
            (section.id !== "hardware" && section.id !== "operator")
        ),
        [productType]
    );

    // Leaving a hidden card -> back to Door Model
    useEffect(() => {
        if (!visibleSections.some(section => section.id === activeTab)) {
            setActiveTab("dimensions");
        }
    }, [visibleSections, activeTab]);

    /* ---------- Door ---------- */

    const [doorModel, setDoorModel] = useState(restored.doorModel ?? "A");
    const [doorSize, setDoorSize] = useState(restored.doorSize ?? "2");
    const [customDimension, setCustomDimension] = useState(restored.customDimension ?? false);
    const [panelStyle, setPanelStyle] = useState(restored.panelStyle ?? "F");
    const [morePanelStyle, setMorePanelStyle] = useState(restored.morePanelStyle ?? false);
    const [selectedColor, setSelectedColor] = useState(restored.selectedColor ?? "W");
    const [finish, setFinish] = useState(restored.finish ?? "W");
    const [designCode, setDesignCode] = useState(restored.designCode ?? "");

    const [doorWidthFeet, setDoorWidthFeet] = useState(restored.doorWidthFeet ?? "16");
    const [doorWidthInches, setDoorWidthInches] = useState(restored.doorWidthInches ?? "0");
    const [doorHeightFeet, setDoorHeightFeet] = useState(restored.doorHeightFeet ?? "7");
    const [doorHeightInches, setDoorHeightInches] = useState(restored.doorHeightInches ?? "0");

    const [numOfSections, setNumOfSections] = useState(restored.numOfSections ?? "4");
    const [numOfPanels, setNumOfPanels] = useState(restored.numOfPanels ?? "");
    const [numOfWindows, setNumOfWindows] = useState(restored.numOfWindows ?? "");


    // Saved colour is an "other" colour -> open the other colours
    const [showPopularColors, setShowPopularColors] = useState(
        () => !optionalColors.some(color => color.value === restored.selectedColor)
    );


    /* ---------- Glazing ---------- */

    const [frameColor, setFrameColor] = useState(restored.frameColor ?? restored.selectedColor ?? "W");
    const [insertColor, setInsertColor] = useState(restored.insertColor ?? restored.selectedColor ?? "W");

    const [glassShape, setGlassShape] = useState(restored.glassShape ?? "");
    const [glassType, setGlassType] = useState(restored.glassType ?? "");
    const [glassInsert, setGlassInsert] = useState(restored.glassInsert ?? "");
    const [temperedGlass, setTemperedGlass] = useState(restored.temperedGlass ?? "");

    const [windowPosition, setWindowPosition] = useState(restored.windowPosition ?? "top");
    const [lastWindowPosition, setLastWindowPosition] = useState(restored.lastWindowPosition ?? "top");
    const [customWindows, setCustomWindows] = useState(restored.customWindows ?? []);
    const [slimSections, setSlimSections] = useState(restored.slimSections ?? []);
    const [selectedSlimSection, setSelectedSlimSection] = useState(null);

    /* ---------- Hardware ---------- */

    const [hardware, setHardware] = useState(restored.hardware ?? DEFAULT_HARDWARE);

    // Every change goes through the original hardware rules
    const handleHardwareChange = (patch) => {
        setHardware(prev => applyHardwareRules(prev, { ...prev, ...patch }));
    };

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

    /* ==========================================
       GLOBAL DOOR SIZE
       (old getGlobalDoorWidth / getGlobalDoorHeight)
    ========================================== */

    // Always holds the latest values – the functions are created once
    const globalDoorSizeRef = useRef({ width, height });
    globalDoorSizeRef.current = { width, height };

    useEffect(() => {

        window.getGlobalDoorWidth = () => globalDoorSizeRef.current.width;
        window.getGlobalDoorHeight = () => globalDoorSizeRef.current.height;

        return () => {
            delete window.getGlobalDoorWidth;
            delete window.getGlobalDoorHeight;
        };

    }, []);


    const sectionCount = Number(numOfSections) || 4;

    const isSlimGlass = (glassShape || "").includes("slim");

    /* Background actually shown:
      - My home (uploaded photo) -> any size, incl. custom dimension
      - Landmark                 -> standard sizes only
      - Custom dimension without a photo -> grey gradient */

    const effectiveBackground =
        sceneBackground === "custom" && homePhoto?.opening
            ? "custom"
            : sceneBackground === "house" && !customDimension
                ? "house"
                : "none";

    /* Landmark house for the selected door model + size:
       A -> Classic, D -> Contemporary, G -> Classic */
    const landmarkScene = useMemo(
        () => getLandmarkScene(doorModel, doorSize),
        [doorModel, doorSize]
    );

    /* ==========================================
       EFFECTS
    ========================================== */

    // Frame colour follows door colour (L138 slim -> Black)
    const frameColorKeyRef = useRef(`${selectedColor}|${doorModel}|${glassShape}`);

    useEffect(() => {

        const key = `${selectedColor}|${doorModel}|${glassShape}`;

        if (frameColorKeyRef.current === key) {
            return;
        }

        frameColorKeyRef.current = key;

        const isSlimA =
            doorModel === "A" &&
            (glassShape === "slim_single" || glassShape === "slim_double");

        setFrameColor(isSlimA ? "K" : selectedColor);

    }, [selectedColor, doorModel, glassShape]);

    // Insert colour follows door colour
    const insertColorKeyRef = useRef(selectedColor);

    useEffect(() => {

        if (insertColorKeyRef.current === selectedColor) {
            return;
        }

        insertColorKeyRef.current = selectedColor;

        setInsertColor(selectedColor);

    }, [selectedColor]);

    // New glass shape: reset positions (slim -> Left, others -> Top)
    const glassShapeKeyRef = useRef(glassShape);

    useEffect(() => {

        if (glassShapeKeyRef.current === glassShape) {
            return;
        }

        glassShapeKeyRef.current = glassShape;

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

    // Close the slim menu when leaving the Glazing card
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
        numOfPanels,
        numOfWindows,

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
        numOfPanels,
        numOfWindows,

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
       DRIVEN VALUES
    ========================================== */

    const drivenValues = useMemo(() => getDrivenValues({
        doorModel,
        panelStyle,
        glassShape,

        width,
        designCode,
        selectedColor,

        numOfPanels,
        numOfWindows,

        windowPosition,
        slimSections,
        selectedSlimSection
    }), [
        doorModel,
        panelStyle,
        glassShape,

        width,
        designCode,
        selectedColor,

        numOfPanels,
        numOfWindows,

        windowPosition,
        slimSections,
        selectedSlimSection
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

        const {
            PRICE,
            PRICE_DISPLAY,
            ...rest
        } = liveValues;

        return {
            ...rest,
            ...drivenValues,
            ...getHardwareEwValues(hardware),
            JSON_OBJ: getJsonObj(doorInfo)
        };

    }, [
        liveValues,
        drivenValues,
        hardware,
        doorInfo
    ]);

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
            },

            /* Hardware (for the global hardware / track logic) */
            hardwareInput: {
                ...hardware,
                lift: getLiftConfig(hardware.liftType, hardware.springType),
                width,
                height,
                doorModel
            }

        };
    };


    // Everything that is written to INPUT_JSON
    const getSaveSnapshot = () => ({
        productType,

        doorModel,
        doorSize,
        customDimension,
        doorWidthFeet,
        doorWidthInches,
        doorHeightFeet,
        doorHeightInches,
        numOfSections,
        numOfPanels,
        panelStyle,
        morePanelStyle,
        designCode,
        selectedColor,
        finish,

        glassShape,
        glassType,
        glassInsert,
        frameColor,
        insertColor,
        temperedGlass,
        windowPosition,
        lastWindowPosition,
        customWindows,
        slimSections,
        numOfWindows,

        hardware,

        width
    });

    /* ==========================================
       HARDWARE CARTON (EW: HARDWARE_CARTON_CONTROLLER.js)
       Global function from the EW logic group – no import.
    ========================================== */

    const runGlobalHardwareCarton = () => {

        if (
            typeof window.runHardwareCarton !==
            "function"
        ) {
            console.warn(
                "HARDWARE_CARTON_CONTROLLER.js is not loaded in EW."
            );
            return;
        }

        // Assembled / Raw panel or no hardware set -> no carton
        if (
            productType !== "complete" ||
            !hardware.hardwareSet
        ) {
            window.clearHardwareCarton?.();
            return;
        }

        window.runHardwareCarton({
            productId: "162059085",

            doorWidthFeet,
            doorWidthInches,
            doorHeightFeet,
            doorHeightInches,

            width,
            height,

            numSections:
                Number(numOfSections) || 4,

            endCaps: END_CAPS,

            liftType:
                hardware.liftType,

            liftHwdesc:
                getLiftConfig(
                    hardware.liftType,
                    hardware.springType
                ).hwdesc,

            highlift:
                hardware.highlift,

            trussQty: 0,

            glassShape,

            centerHingeCode:
                drivenValues.CENTER_HINGE_CODE,

            doorModelDesc:
                DOOR_MODEL_ATTRS[doorModel]?.desc ||
                ""
        });
    };

    const handleConfigure = async (event) => {

        event?.preventDefault?.();

        if (configuring) {
            return;
        }

        setConfiguring(true);

        try {
            // 1. Save all inputs (INPUT_JSON_1..4)
            saveConfiguratorInputs(getSaveSnapshot());

            // 2. Hardware carton -> EW inputs
            runGlobalHardwareCarton();

            // 3. Existing configure flow (moves to the next page)
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
        setNumOfWindows("");

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


    // New door model: clear glazing (shape, type, insert, positions)
    const handleDoorModelChange = (value) => {

        if (value === doorModel) {
            return;
        }

        setDoorModel(value);

        resetGlazing();
    };

    /* ==========================================
       UPLOAD YOUR OWN HOME
    ========================================== */

    const handleUploadFile = async (file) => {

        const error = validateHomePhotoFile(file);

        if (error) {
            setSceneMessage(error);
            return;
        }

        setSceneMessage("");
        setPhotoLoading(true);

        try {
            const photo = await readHomePhotoFile(file);
            setMarkerPhoto(photo);
        } catch (err) {
            setSceneMessage(err.message);
        } finally {
            setPhotoLoading(false);
        }
    };

    const handleMarkerConfirm = (opening) => {

        const photo = { ...markerPhoto, opening };

        setHomePhoto(photo);
        setSceneBackground("custom");
        setMarkerPhoto(null);

        const saved = saveHomePhoto(serialNumber, photo);

        setSceneMessage(
            saved
                ? ""
                : "This photo is too large to keep after a refresh. It will work for this visit."
        );
    };

    const handleMarkerCancel = () => {
        setMarkerPhoto(null);
    };

    const handleRemarkPhoto = () => {
        if (homePhoto) {
            setMarkerPhoto(homePhoto);
        }
    };

    const handleRemovePhoto = () => {
        clearHomePhoto(serialNumber);
        setHomePhoto(null);
        setSceneBackground("house");
        setSceneMessage("");
    };

    // "none" | "house" | "custom"
    const handleBackgroundChange = (value) => {

        // Landmark: standard sizes only (upload / My home: always allowed)
        if (value === "house" && customDimension) {
            return;
        }

        if (value === "custom" && !homePhoto?.opening) {
            return;
        }

        setSceneBackground(value);
    };

    /* ==========================================
       PRODUCT TYPE MENU
       Closes on outside click / Escape.
       TODO: hook the product-type switch into your
       existing product-type logic (EW input / reload).
    ========================================== */

    useEffect(() => {

        if (!productMenuOpen) {
            return undefined;
        }

        const handleOutside = (event) => {
            if (productMenuRef.current && !productMenuRef.current.contains(event.target)) {
                setProductMenuOpen(false);
            }
        };

        const handleKey = (event) => {
            if (event.key === "Escape") {
                setProductMenuOpen(false);
            }
        };

        document.addEventListener("mousedown", handleOutside);
        document.addEventListener("keydown", handleKey);

        return () => {
            document.removeEventListener("mousedown", handleOutside);
            document.removeEventListener("keydown", handleKey);
        };

    }, [productMenuOpen]);

    const handleProductTypeChange = (value) => {

        setProductMenuOpen(false);

        if (value === productType) {
            return;
        }

        setProductType(value);
    };

    /* ==========================================
       FULL PAGE SIZE (ConfigureOne)
       - Adds a body class so Configurator.css can
         override cobalt.css width (96% / min-width 1120px)
       - Sizes the layout to the remaining window height
    ========================================== */

    useEffect(() => {

        // Space kept below the layout (ConfigureOne footer + breathing room)
        const BOTTOM_GAP = 60;
        const MIN_HEIGHT = 500;

        document.body.classList.add("rw-react-fullpage");

        const fitToWindow = () => {

            const layout = layoutRef.current;

            if (!layout) {
                return;
            }

            // Real visible height (not affected by DevTools / zoom bars)
            const viewportHeight =
                window.visualViewport?.height ||
                document.documentElement.clientHeight ||
                window.innerHeight;

            // Distance from top of the visible window to the layout
            const top = layout.getBoundingClientRect().top;

            const available = Math.max(
                MIN_HEIGHT,
                Math.floor(viewportHeight - top - BOTTOM_GAP)
            );

            layout.style.setProperty("--rw-layout-height", `${available}px`);
        };

        // Run now, after the enter animation and after
        // ConfigureOne finishes laying out the page
        const frame = requestAnimationFrame(fitToWindow);
        const t1 = setTimeout(fitToWindow, 300);
        const t2 = setTimeout(fitToWindow, 1000);

        window.addEventListener("resize", fitToWindow);
        window.visualViewport?.addEventListener("resize", fitToWindow);

        // Re-fit if anything above the layout changes height
        const observer = new ResizeObserver(() => fitToWindow());
        observer.observe(document.body);

        return () => {
            cancelAnimationFrame(frame);
            clearTimeout(t1);
            clearTimeout(t2);
            window.removeEventListener("resize", fitToWindow);
            window.visualViewport?.removeEventListener("resize", fitToWindow);
            observer.disconnect();
            document.body.classList.remove("rw-react-fullpage");
        };

    }, []);

    /* ==========================================
       SCENE LAYOUT
       none   -> grey gradient, door centred (old design)
       house  -> Landmark photo for the door model + size,
                 door fills the opening
       custom -> customer photo, door stretched to the marked box
    ========================================== */

    useEffect(() => {

        const scene = sceneRef.current;

        if (!scene) {
            return undefined;
        }

        const measure = () => {
            setSceneSize({
                width: scene.clientWidth,
                height: scene.clientHeight
            });
        };

        measure();

        const observer = new ResizeObserver(measure);
        observer.observe(scene);

        return () => observer.disconnect();

    }, []);

    const houseLayout = useMemo(() => {

        const { width: sceneW, height: sceneH } = sceneSize;

        if (!sceneW || !sceneH || !width || !height) {
            return null;
        }

        /* ---------- NONE: grey gradient, canvas centred ---------- */

        if (effectiveBackground === "none") {

            // Keep the door below the Window Position toolbar on Glazing
            const topReserved = activeTab === "glazing"
                ? GLAZING_FOCUS.topReserved
                : 0;

            const availH = Math.max(1, sceneH - topReserved);

            const k = Math.min(sceneW / CANVAS_W, availH / CANVAS_H);

            return {
                mode: "none",
                sceneId: "none",
                image: null,
                imageUrl: "",
                lights: [],
                stretch: false,
                stage: {
                    marginLeft: (sceneW - CANVAS_W * k) / 2,
                    marginTop: topReserved + (availH - CANVAS_H * k) / 2,
                    width: CANVAS_W * k,
                    height: CANVAS_H * k
                }
            };
        }

        const scene = effectiveBackground === "custom"
            ? getCustomScene(homePhoto)
            : landmarkScene;

        /* ---------- Image: cover the scene ----------
           scene.width / scene.height are per image, so the
           1536 x 1024 Classic images and the 1440 x 908
           Contemporary images both scale correctly. */

        const imgScale = Math.max(
            sceneW / scene.width,
            sceneH / scene.height
        );

        const imgW = scene.width * imgScale;
        const imgH = scene.height * imgScale;

        let imgLeft = (sceneW - imgW) / 2;
        let imgTop = (sceneH - imgH) / 2;

        // Keep the garage (with trim) inside the visible area
        const safeLeft = scene.safeArea.left * imgScale;
        const safeRight = scene.safeArea.right * imgScale;

        if (imgLeft + safeLeft < 0) {
            imgLeft = -safeLeft;
        }

        if (imgLeft + safeRight > sceneW) {
            imgLeft = sceneW - safeRight;
        }

        imgLeft = Math.min(0, Math.max(sceneW - imgW, imgLeft));

        // Vertical safe area (customer photos – door can be anywhere)
        if (scene.safeArea.top !== undefined) {

            const safeTop = scene.safeArea.top * imgScale;
            const safeBottom = scene.safeArea.bottom * imgScale;

            if (imgTop + safeTop < 0) {
                imgTop = -safeTop;
            }

            if (imgTop + safeBottom > sceneH) {
                imgTop = sceneH - safeBottom;
            }

            imgTop = Math.min(0, Math.max(sceneH - imgH, imgTop));
        }

        let finalScale = imgScale;
        let finalW = imgW;
        let finalH = imgH;
        let finalLeft = imgLeft;
        let finalTop = imgTop;

        const { opening } = scene;

        /* ---------- Glazing tab: zoom in, door centred ---------- */

        if (activeTab === "glazing") {

            const availH = sceneH - GLAZING_FOCUS.topReserved - GLAZING_FOCUS.bottomReserved;

            // Where the door centre should land on screen
            const targetX = sceneW * GLAZING_FOCUS.centerX;
            const targetY = GLAZING_FOCUS.topReserved + availH / 2;

            // Door centre inside the photo (image px)
            const centerXImg = opening.x + opening.width / 2;
            const centerYImg = opening.y + opening.height / 2;

            // Size wanted: door width / free height
            let focusScale = Math.min(
                (sceneW * GLAZING_FOCUS.doorWidth) / opening.width,
                availH / opening.height
            );

            /* Smallest zoom where the photo still covers the whole
               scene WITH the door exactly at the target point.
               (Door near the photo edge -> needs a bit more zoom,
               otherwise the cover rule pushes it off centre.) */
            const minCenteredScale = Math.max(
                imgScale,
                targetX / centerXImg,
                (sceneW - targetX) / (scene.width - centerXImg),
                targetY / centerYImg,
                (sceneH - targetY) / (scene.height - centerYImg)
            );

            focusScale = Math.max(focusScale, minCenteredScale);

            finalScale = focusScale;
            finalW = scene.width * focusScale;
            finalH = scene.height * focusScale;

            finalLeft = targetX - centerXImg * focusScale;
            finalTop = targetY - centerYImg * focusScale;

            // Safety only – with minCenteredScale this no longer moves the door
            finalLeft = Math.min(0, Math.max(sceneW - finalW, finalLeft));
            finalTop = Math.min(0, Math.max(sceneH - finalH, finalTop));
        }

        /* ---------- Opening on screen ---------- */

        const openX = finalLeft + opening.x * finalScale;
        const openY = finalTop + opening.y * finalScale;
        const openW = opening.width * finalScale;
        const openH = opening.height * finalScale;

        /* ---------- Door inside the 900 x 700 canvas (same math as DoorCanvas) ---------- */

        const doorScale = Math.min(CANVAS_DOOR_MAX_W / width, CANVAS_DOOR_MAX_H / height);
        const doorW = width * doorScale;
        const doorH = height * doorScale;
        const doorX = (CANVAS_W - doorW) / 2;
        const doorY = (CANVAS_H - doorH) / 2;

        /* Door fills the opening (Landmark photos are made for the
           selected size; customer photo = the marked box) */

        const kx = openW / doorW;
        const ky = openH / doorH;

        const fitX = openX;
        const fitY = openY;

        /* ---------- Lantern glows (Night view) ---------- */

        const glowSize = LIGHT_GLOW_RADIUS * 2 * finalScale;

        const lights = (scene.lights || []).map(light => ({
            left: finalLeft + light.x * finalScale - glowSize / 2,
            top: finalTop + light.y * finalScale - glowSize / 2,
            width: glowSize,
            height: glowSize
        }));

        return {
            mode: effectiveBackground,
            sceneId: scene.id,
            imageUrl: scene.url,
            stretch: !!scene.stretch,
            image: {
                left: finalLeft,
                top: finalTop,
                width: finalW,
                height: finalH
            },
            lights,
            stage: {
                marginLeft: fitX - doorX * kx,
                marginTop: fitY - doorY * ky,
                width: CANVAS_W * kx,
                height: CANVAS_H * ky
            }
        };

    }, [sceneSize, width, height, activeTab, effectiveBackground, homePhoto, landmarkScene]);

    /* ==========================================
       SCROLL-SPY (Porsche behaviour)
       The card at the top of the scroll area
       becomes activeTab while scrolling.
    ========================================== */

    const updateActiveFromScroll = () => {

        const scroller = scrollRef.current;

        if (!scroller || isProgrammaticScroll.current) {
            return;
        }

        const scrollTop = scroller.scrollTop;
        const triggerLine = scrollTop + scroller.clientHeight * 0.3;

        const atBottom =
            scrollTop > 0 &&
            scrollTop + scroller.clientHeight >= scroller.scrollHeight - 2;

        let current = visibleSections[0].id;

        if (atBottom) {

            current = visibleSections[visibleSections.length - 1].id;

        } else {

            visibleSections.forEach(section => {

                const card = cardRefs.current[section.id];

                if (card && card.offsetTop <= triggerLine) {
                    current = section.id;
                }
            });
        }

        setActiveTab(prev => (prev === current ? prev : current));
    };

    // Keep the latest version for the scroll listener
    const updateActiveRef = useRef(updateActiveFromScroll);
    updateActiveRef.current = updateActiveFromScroll;

    useEffect(() => {

        const scroller = scrollRef.current;

        if (!scroller) {
            return undefined;
        }

        const handleScroll = () => updateActiveRef.current();

        scroller.addEventListener("scroll", handleScroll, { passive: true });

        return () => {
            scroller.removeEventListener("scroll", handleScroll);
            clearTimeout(scrollTimer.current);
        };

    }, []);

    // Re-check the active card after a card is collapsed / expanded
    useEffect(() => {

        const frame = requestAnimationFrame(() => updateActiveRef.current());

        return () => cancelAnimationFrame(frame);

    }, [collapsedSections]);

    // Activate a card and scroll it to the top of the list
    const scrollToSection = (id) => {

        const scroller = scrollRef.current;
        const card = cardRefs.current[id];

        setActiveTab(id);

        if (!scroller || !card) {
            return;
        }

        isProgrammaticScroll.current = true;

        scroller.scrollTo({
            top: card.offsetTop - 16,
            behavior: "smooth"
        });

        clearTimeout(scrollTimer.current);

        scrollTimer.current = setTimeout(() => {
            isProgrammaticScroll.current = false;
        }, 700);
    };

    // Header click: collapse an open card / expand a collapsed card
    const handleToggleSection = (id) => {

        const willCollapse = !collapsedSections[id];

        setCollapsedSections(prev => ({
            ...prev,
            [id]: willCollapse
        }));

        if (!willCollapse) {
            // Wait for the body to render, then bring it into view
            requestAnimationFrame(() => scrollToSection(id));
        }
    };

    /* ==========================================
       SECTION CONTENT
    ========================================== */

    const renderSectionContent = (id) => {

        switch (id) {

            case "dimensions":
                return (
                    <DimensionsSection

                        doorModel={doorModel}
                        setDoorModel={handleDoorModelChange}

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
                );

            case "glazing":
                return (
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
                );

            case "hardware":
                return (
                    <HardwareSection
                        hardware={hardware}
                        onChange={handleHardwareChange}
                        renderSelectionIndicator={renderSelectionIndicator}
                    />
                );

            case "operator":
                return <OperatorSection />;

            case "advanced":
                return <AdvancedSection />;

            case "annotations":
                return <AnnotationsSection />;

            default:
                return null;
        }
    };

    /* ==========================================
       RENDER
    ========================================== */

    const isNight = viewMode === "night" && effectiveBackground !== "none";

    const sceneClassName = [
        "canvas-area",
        "house-scene",
        isNight ? "night" : "day",
        effectiveBackground === "none" ? "plain" : ""
    ].join(" ").trim();

    const sceneStyle =
        effectiveBackground === "none" && wallColor
            ? {
                background:
                    "radial-gradient(circle, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0) 70%), " +
                    wallColor
            }
            : undefined;

    return (

        <div className="rw-configurator__layout" ref={layoutRef}>

            {/* Configure loader (original canvas-loader-backdrop) */}

            {configuring && (
                <div className="canvas-loader-backdrop">
                    <div className="canvas-loader" />
                </div>
            )}

            {/* Mark your garage door (upload your own home) */}

            {markerPhoto && (
                <HomePhotoMarker
                    photo={markerPhoto}
                    onConfirm={handleMarkerConfirm}
                    onCancel={handleMarkerCancel}
                />
            )}

            {/* LEFT SIDE – toolbar + scene with the door canvas */}

            <div className="rw-configurator__layout--left">

                {/* Scene toolbar (Porsche: Change model / Save / Load) */}

                <div className="scene-toolbar">

                    <div className="scene-toolbar__menu" ref={productMenuRef}>

                        <button
                            type="button"
                            className="scene-toolbar__button"
                            aria-haspopup="menu"
                            aria-expanded={productMenuOpen}
                            onClick={() => setProductMenuOpen(open => !open)}
                        >
                            <MdArrowBack />
                            <span>Change product type</span>
                        </button>

                        {productMenuOpen && (
                            <div className="scene-toolbar__dropdown" role="menu">

                                {PRODUCT_TYPES.map(type => (
                                    <button
                                        key={type.value}
                                        type="button"
                                        role="menuitemradio"
                                        aria-checked={productType === type.value}
                                        className={
                                            productType === type.value
                                                ? "scene-toolbar__option active"
                                                : "scene-toolbar__option"
                                        }
                                        onClick={() => handleProductTypeChange(type.value)}
                                    >
                                        <span>{type.label}</span>
                                        {productType === type.value && <MdCheck />}
                                    </button>
                                ))}

                            </div>
                        )}

                    </div>

                    <button type="button" className="scene-toolbar__button">
                        <MdBookmarkBorder />
                        <span>Save as Default</span>
                    </button>

                    <button type="button" className="scene-toolbar__button">
                        <MdRestore />
                        <span>Restore Default</span>
                    </button>

                </div>

                <div className={sceneClassName} ref={sceneRef} style={sceneStyle}>

                    {houseLayout && houseLayout.mode !== "none" && (
                        <>
                            {houseLayout.mode === "custom" ? (

                                /* Customer photo: drawn on canvas (CSP blocks data: <img>) */
                                <PhotoCanvas
                                    key="custom-photo"
                                    className="house-scene__image"
                                    src={houseLayout.imageUrl}
                                    width={homePhoto.width}
                                    height={homePhoto.height}
                                    style={houseLayout.image}
                                    label="Your home"
                                />

                            ) : (

                                /* Landmark photo: same-origin image (allowed by CSP 'self') */
                                <img
                                    key={houseLayout.sceneId}
                                    className="house-scene__image"
                                    src={houseLayout.imageUrl}
                                    alt=""
                                    draggable={false}
                                    style={houseLayout.image}
                                />

                            )}

                            {/* Night: dark blue sky tint over the photo */}
                            <div className="house-scene__night-tint" />

                            {/* Night: warm lantern glows (Classic houses only) */}
                            {houseLayout.lights.map((light, index) => (
                                <div
                                    key={index}
                                    className="house-scene__light"
                                    style={light}
                                />
                            ))}
                        </>
                    )}

                    {activeTab === "glazing" && (
                        <div className="house-scene__window-position">
                            <WindowPosition
                                glassShape={glassShape}
                                panelStyle={panelStyle}
                                windowPosition={windowPosition}
                                onPositionChange={handleWindowPositionChange}
                                renderSelectionIndicator={renderSelectionIndicator}
                            />
                        </div>
                    )}

                    <div
                        className={
                            houseLayout?.stretch
                                ? "house-scene__stage stretch"
                                : "house-scene__stage"
                        }
                        style={houseLayout ? houseLayout.stage : { visibility: "hidden" }}
                    >
                        <DoorCanvas
                            doorModel={doorModel}
                            panelStyle={panelStyle}

                            width={width}
                            height={height}

                            numOfSections={numOfSections}
                            numOfPanels={numOfPanels}
                            numOfWindows={numOfWindows}

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

                    {/* Adjust scene: None / Landmark / My home / Upload + Day / Night */}

                    <SceneControls
                        viewMode={viewMode}
                        onViewModeChange={setViewMode}

                        background={effectiveBackground}
                        onBackgroundChange={handleBackgroundChange}

                        houseThumbUrl={landmarkScene.url}

                        customDimension={customDimension}

                        wallColor={wallColor}
                        onWallColorChange={setWallColor}

                        homePhoto={homePhoto}
                        onUploadFile={handleUploadFile}
                        onRemark={handleRemarkPhoto}
                        onRemove={handleRemovePhoto}

                        uploading={photoLoading}
                        message={sceneMessage}
                    />

                    <div className="canvas-footer">
                        ⓘ Actual door appearance may differ slightly.
                    </div>

                </div>

            </div>

            {/* RIGHT SIDE */}

            <div className="rw-configurator__layout--right">

                {/* Fixed top bar: serial / price / Configure */}

                <div className="config-topbar">

                    <HeaderSection
                        priceDisplay={liveValues.PRICE_DISPLAY}
                    />

                    <button
                        type="button"
                        id="CONFIGURE_BTN"
                        className="config-topbar__configure"
                        disabled={configuring}
                        onClick={handleConfigure}
                    >
                        Configure
                    </button>

                </div>

                {/* Scrollable cards (open by default, collapsible) */}

                <div
                    className="config-accordion-scroll"
                    ref={scrollRef}
                >

                    {visibleSections.map(section => (
                        <ConfigSection
                            key={section.id}
                            ref={el => { cardRefs.current[section.id] = el; }}
                            id={section.id}
                            title={section.title}
                            isActive={activeTab === section.id}
                            isCollapsed={!!collapsedSections[section.id]}
                            onToggle={handleToggleSection}
                        >
                            {renderSectionContent(section.id)}
                        </ConfigSection>
                    ))}

                </div>

            </div>

        </div>
    );
}

export default Configurator;
