/* ==========================================================
   DRIVEN VALUES
   React port of the computed nodes + old radio attributes:

   0) ATTRIBUTES (old LOAD_HTML.js createForm())
      The original read these from the jQuery form
      (getNode("DOOR_MODEL").getAttribute("id") etc.).
      That form no longer exists, so the values live here.

   1) LOAD_DRIVEN_INPUTS.js
      PANEL_SPACING, CENTER_HINGE_CODE, resolveLiteResult,
      getLites, getCenterHingeCodeEarly

   2) LOAD_GLOBAL_VARIABLES.js (loadGlobalNodes)
      LM_DOOR_MODEL, RAYNOR_DOOR, PRODUCT_TYPE, SIZE, WIDTH,
      HEIGHT, OPT_YESNO, WINDOW_CUTOUTS_YESNO, OP_..._VALUE

   Rule for this file:
   every value the old addLogic / addNode CALCULATED lives here.
   Pure functions – no DOM, no EW, no React.

   Covered in other files (do not add here):
     HARDWARE_YESNO, HANGER_ANGLE_QTY -> Data/hardwareData.js
     WEIGHT                           -> ew/weightController.js
     setupQtyLogic (qty fields)       -> Operator / Advanced sections
     PRODUCT_TYPE_TAB_VISIBILITY      -> visibleSections (Configurator.js)
========================================================== */


/* ==========================================================
   0) ATTRIBUTES (old radio / option attributes)
========================================================== */

/* DOOR_MODEL radio: id + desc */
export const DOOR_MODEL_ATTRS = {
    A: { id: "L138", desc: "Cls" },
    D: { id: "L200", desc: "Prem" },
    G: { id: "L200GV", desc: "Grd" }
};

/* FACE radio: desc */
export const FACE_DESC = {
    R: "Rnc",
    F: "Fls",
    C: "Col",
    S: "RncGc",
    B: "ColGc",
    T: "RncSc",
    V: "Plk",
    M: "mixed"
};

/* DESIGN_CODE option: pattern */
export const DESIGN_PATTERNS = {
    A: "CRC",
    B: "RCR",
    C: "CRRC",
    D: "RCCR",
    E: "CCRCC",
    F: "CRRRC",
    G: "CRCCRC",
    H: "RCRCR",
    I: "CCRRCC",
    J: "CRCRC",
    K: "RCCCR",
    L: "CRCCCRC",
    M: "CCRCRCC",
    N: "CCCRCCC",
    O: "RCCCCR",
    P: "RCCRCCR",
    Q: "RCCCCCR",
    R: "CCCRCRCCC",
    S: "CCRCCRCC",
    T: "RCCCCCCCCR",
    U: "CCRCCCCRCC"
};

/* GLASS_TYPE radio: glazingtype */
export const GLASS_TYPE_GLAZING = {
    CLEAR: "double",
    CLEAR_SINGLE: "single",
    SATIN: "double",
    OBSCURE_GLASS_PINHEAD: "double",
    OBSCURE_GLASS_SINGLE: "single",
    DARK_TINT_SEALED: "double",
    DARK_TINT_SINGLE: "single",
    BLACK_SATIN_SEALED: "double"
};

/* GLASS_INSERT radio: insertCode (aluminum / bar inserts have none) */
export const INSERT_CODES = {
    stockton_colonial: "550-309",
    waterton_colonial: "550-337",
    stockton_ranch: "550-313",
    waterton_ranch: "550-347",
    prairie: "550-451",
    cascade_colonial: "550-317",
    cascade_ranch: "550-321",
    arched_stockton: "550-341",
    stockbridge: "550-456",
    arched_stockbridge: "550-396",
    arched_stockton_3: "550-341",
    arched_stockbridge_3: "550-396",
    arched_stockton_4: "550-341",
    arched_stockbridge_4: "550-396"
};


/* ==========================================================
   1) LITES / CENTER HINGE (LOAD_DRIVEN_INPUTS.js)
========================================================== */

// Original getLites() ranges
const LITE_RANGES = {
    colonial_std: [
        { min: 48, max: 71, lites: 2, center_hinge_code: "B" },
        { min: 72, max: 94, lites: 3, center_hinge_code: "C" },
        { min: 95, max: 118, lites: 4, center_hinge_code: "B" },
        { min: 119, max: 142, lites: 5, center_hinge_code: "C" },
        { min: 143, max: 165, lites: 6, center_hinge_code: "C" },
        { min: 166, max: 189, lites: 7, center_hinge_code: "E" },
        { min: 190, max: 227, lites: 8, center_hinge_code: "D" },
        { min: 228, max: 235, lites: 9, center_hinge_code: "E" },
        { min: 236, max: 258, lites: 10, center_hinge_code: "F" },
        { min: 259, max: 281, lites: 11, center_hinge_code: "G" },
        { min: 282, max: 287, lites: 12, center_hinge_code: "F" }
    ],
    ranch_std: [
        { min: 48, max: 94, lites: 1, center_hinge_code: "B" },
        { min: 95, max: 142, lites: 2, center_hinge_code: "B" },
        { min: 143, max: 189, lites: 3, center_hinge_code: "C" },
        { min: 190, max: 235, lites: 4, center_hinge_code: "D" },
        { min: 236, max: 281, lites: 5, center_hinge_code: "E" },
        { min: 282, max: 287, lites: 6, center_hinge_code: "F" }
    ],
    RanchOverColonialStd: [
        { min: 48, max: 75, lites: 1, center_hinge_code: "B" },
        { min: 76, max: 76, lites: 0, center_hinge_code: "" },
        { min: 77, max: 119, lites: 2, center_hinge_code: "B" },
        { min: 120, max: 178, lites: 3, center_hinge_code: "C" },
        { min: 179, max: 228, lites: 4, center_hinge_code: "D" },
        { min: 229, max: 259, lites: 5, center_hinge_code: "E" },
        { min: 260, max: 282, lites: 6, center_hinge_code: "F" }
    ],
    ColonialOverRanchStd: [
        { min: 48, max: 75, lites: 2, center_hinge_code: "B" },
        { min: 76, max: 76, lites: 0, center_hinge_code: "" },
        { min: 77, max: 119, lites: 4, center_hinge_code: "B" },
        { min: 120, max: 178, lites: 6, center_hinge_code: "C" },
        { min: 179, max: 228, lites: 8, center_hinge_code: "D" },
        { min: 229, max: 259, lites: 10, center_hinge_code: "E" },
        { min: 260, max: 282, lites: 12, center_hinge_code: "F" }
    ],
    colonial_pass: [
        { min: 48, max: 71, lites: 0, center_hinge_code: "" },
        { min: 72, max: 94, lites: 2, center_hinge_code: "B" },
        { min: 95, max: 118, lites: 0, center_hinge_code: "" },
        { min: 119, max: 142, lites: 4, center_hinge_code: "B" },
        { min: 143, max: 165, lites: 0, center_hinge_code: "" },
        { min: 166, max: 189, lites: 6, center_hinge_code: "C" },
        { min: 190, max: 227, lites: 0, center_hinge_code: "" },
        { min: 228, max: 235, lites: 8, center_hinge_code: "D" }
    ]
};

// Mixed panel: DESIGN_CODE option "center_hinge_code" attribute
const DESIGN_CENTER_HINGE = {
    A: "C", B: "C", C: "D", D: "C", E: "C",
    J: "E", K: "E",
    F: "E", G: "E", H: "E", I: "D", N: "E", O: "D",
    L: "E", M: "E",
    P: "E", Q: "E",
    R: "E", S: "E",
    T: "F", U: "F"
};

// CENTER_HINGE_CODE letter -> CENTER_HINGE_QTY number
// (same map as HARDWARE_CARTON_CONTROLLER.js)
const CENTER_HINGE_CODE_TO_QTY = {
    A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8, I: 9
};

export function getLites(width, type) {

    const table = LITE_RANGES[type];

    if (!table) {
        return null;
    }

    return table.find(r => width >= r.min && width <= r.max) || null;
}

/* Original PANEL_SPACING node */
export function getPanelSpacing({ panelStyle, glassShape, numOfPanels }) {

    const face = panelStyle || "";
    const shape = glassShape || "";

    if (["2", "4", "6", "8"].includes(String(numOfPanels))) {
        return "P";
    }

    // Flush / Plank: spacing follows the glass shape
    if (face === "F" || face === "V") {
        if (shape === "colonial" || shape.includes("slim")) return "S";
        if (shape === "ranch") return "R";
    }

    if (["C", "R", "M"].includes(face)) return "S";
    if (["B", "S", "T"].includes(face)) return "C";

    return "";
}

/* Original resolveLiteResult() (without the cache) */
export function resolveLiteResult({
    width,
    panelStyle,
    glassShape,
    spacing,
    numOfWindows
}) {

    const w = Number(width) || 0;
    const face = panelStyle || "";
    const shape = glassShape || "";

    if (!w || !face) {
        return null;
    }

    let windowType = "";

    if (["C", "B", "F", "V"].includes(face)) {

        if (shape === "colonial" || !shape) {
            if (spacing === "S") windowType = "colonial_std";
            if (spacing === "P") windowType = "colonial_pass";
        } else if (shape === "ranch") {
            windowType = "RanchOverColonialStd";
        }

    } else if (["R", "S", "T"].includes(face)) {

        if (shape === "ranch" || !shape) {
            windowType = "ranch_std";
        } else if (shape === "colonial") {
            windowType = "ColonialOverRanchStd";
        }
    }

    if (!windowType) {
        return null;
    }

    const found = getLites(w, windowType);

    if (!found) {
        return null;
    }

    // Copy – never change the range table
    const result = { ...found };

    const customWindows = Number(numOfWindows) || 0;

    if (customWindows > 0) {
        result.lites = customWindows;
    }

    return result;
}

/* Original computeValue(field) */
export function computeValue(field, options) {

    const result = resolveLiteResult(options);

    return result ? (result[field] ?? 0) : 0;
}

/* Original getCenterHingeCodeEarly() – before glazing is selected */
export function getCenterHingeCodeEarly({ width, panelStyle, spacing }) {

    const w = Number(width) || 0;
    const face = panelStyle || "";

    if (!w || !face) {
        return "";
    }

    let type = "";

    if (face === "C" && spacing === "P") {
        type = "colonial_pass";
    } else if (["C", "F", "B", "V"].includes(face)) {
        type = "colonial_std";
    } else if (["R", "S", "T"].includes(face)) {
        type = "ranch_std";
    }

    const result = type ? getLites(w, type) : null;

    return result ? (result.center_hinge_code || "") : "";
}

/* Original CENTER_HINGE_CODE node */
export function getCenterHingeCode({
    width,
    panelStyle,
    glassShape,
    spacing,
    designCode,
    numOfWindows
}) {

    if (panelStyle === "M") {
        return DESIGN_CENTER_HINGE[designCode] || "";
    }

    const result = resolveLiteResult({
        width,
        panelStyle,
        glassShape,
        spacing,
        numOfWindows
    });

    if (result) {
        return result.center_hinge_code || "";
    }

    return getCenterHingeCodeEarly({ width, panelStyle, spacing });
}

/* Letter (A–I) -> number (1–9). 0 = no code. */
export function getCenterHingeQty(centerHingeCode) {

    const code = String(centerHingeCode ?? "").trim().toUpperCase();

    return CENTER_HINGE_CODE_TO_QTY[code] || 0;
}

/* Values written to EW on every change */
export function getDrivenValues({
    doorModel,
    panelStyle,
    glassShape,
    width,
    designCode,
    selectedColor,
    numOfPanels,
    numOfWindows
}) {

    const spacing = getPanelSpacing({ panelStyle, glassShape, numOfPanels });

    return {
        PANEL_SPACING: spacing,

        CENTER_HINGE_CODE: getCenterHingeCode({
            width,
            panelStyle,
            glassShape,
            spacing,
            designCode,
            numOfWindows
        }),

        // Old LM_DOOR_MODEL: DOOR_MODEL radio "id" attribute
        LM_DOOR_MODEL: DOOR_MODEL_ATTRS[doorModel]?.id || "",

        // Old RAYNOR_DOOR: woodtone colours or grooved colonial
        RAYNOR_DOOR:
            selectedColor === "X" ||
            selectedColor === "Y" ||
            panelStyle === "B"
                ? "Y"
                : "N"
    };
}


/* ==========================================================
   2) GLOBAL NODES (LOAD_GLOBAL_VARIABLES.js – loadGlobalNodes)
========================================================== */

// React product type -> old PRODUCT_TYPE value
const PRODUCT_TYPE_VALUES = {
    complete: "COMPLETE_DOOR",
    assemble: "ASSEMBLED_PANEL",
    raw: "RAW_PANEL"
};

// Old OP_..._VALUE nodes: part number by DOOR_HEIGHT_FEET
// (kept exactly as the original, incl. "951-193-010B")
const OPERATOR_HEIGHT_PARTS = {
    OP_6580L_VALUE: { 7: "951-193-07B", 8: "951-193-08B", 10: "951-193-010B" },
    OP_6590L_VALUE: { 7: "951-194-07B", 8: "951-194-08B", 10: "951-194-10B" },
    OP_2220L_CHAIN_VALUE: { 7: "951-190-07C", 8: "951-190-08C", 10: "951-190-10C" },
    OP_2420L_CHAIN_VALUE: { 7: "951-191-07C", 8: "951-191-08C", 10: "951-191-10C" }
};

export function getGlobalNodeValues({
    productType,
    customDimension,
    doorSize,
    sizeWidth,      // standard size, feet
    sizeHeight,     // standard size, feet
    doorDims,       // { doorWidthFeet, doorWidthInches, doorHeightFeet, doorHeightInches }
    width,          // total inches
    height,         // total inches
    operator,       // OPERATOR value ("PS" = None)
    windowCutouts   // WINDOW_CUTOUTS ("Y" / "N")
}) {

    const heightFeet = Number(doorDims.doorHeightFeet) || 0;

    const operatorParts = {};

    Object.entries(OPERATOR_HEIGHT_PARTS).forEach(([id, parts]) => {
        operatorParts[id] = parts[heightFeet] || "";
    });

    return {
        PRODUCT_TYPE: PRODUCT_TYPE_VALUES[productType] || "",

        // Old: SIZE radios are cleared while Custom Dimension is on
        SIZE: customDimension ? "" : doorSize,
        SIZE_WIDTH: customDimension ? 0 : Number(sizeWidth) || 0,
        SIZE_HEIGHT: customDimension ? 0 : Number(sizeHeight) || 0,

        WIDTH: Number(width) || 0,
        HEIGHT: Number(height) || 0,

        DOOR_WIDTH_FEET: doorDims.doorWidthFeet,
        DOOR_WIDTH_INCHES: doorDims.doorWidthInches,
        DOOR_HEIGHT_FEET: doorDims.doorHeightFeet,
        DOOR_HEIGHT_INCHES: doorDims.doorHeightInches,

        // Old: !opt || opt == 'PS' -> 0
        OPT_YESNO: !operator || operator === "PS" ? 0 : 1,

        WINDOW_CUTOUTS_YESNO: windowCutouts || "N",

        ...operatorParts
    };
}
