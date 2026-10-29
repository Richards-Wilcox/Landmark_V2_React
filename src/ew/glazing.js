/* ==========================================================
   GLAZING
   All glazing codes in one file.

   1) LIVE PART CODES (run on every change)
      Port of registerGlazingCalculationLogic() from
      PRICE_CONTROLLER.js – the fields GLAZING_PRICE needs:
      WINDOW_1/2, INSERT_1/2, EXTERIOR/INTERIOR_FRAME_1/2,
      FRAME_KIT, SCREWS, INSERT_YES_NO, SLIM_YES_NO_FOR_FRAMES
      -> getGlazingCodeValues()

   2) CONFIGURE CODES (run on Configure)
      Port of addGlazingCodeLogic() from GLAZING_CODES.js.
      Needs the section bundle values (SB / SC part numbers,
      BUNDLE*_SC*_HEIGHT, SECTION_0*, GLASS_QTY_*) and the live
      part codes above, so it runs AFTER the section bundle.
      Output:
        DOOR_THICKNESS, WINDOW_1_QTY, WINDOW_2_QTY, CENTER_HINGE_QTY,
        LITE_LOCATION, INSERT_1_QTY, INSERT_2_QTY,
        SECTION_0x_SMARTCOM_CODE, GLZ_CODE_SECTION_0x,
        CNC_SECTION_0x, PUNCH_CODE_SECTION_0x   (x = 1..9)
      -> getGlazingCodeLogicValues()
========================================================== */

import { readEwValue } from "./ewSync";

import {
    GLASS_TYPE_GLAZING,
    INSERT_CODES,
    DESIGN_PATTERNS,
    getDrivenValues,
    computeValue
} from "./drivenValues";


/* ##########################################################
   1) LIVE PART CODES
########################################################## */

const GLASS_TYPE_COLONIAL = {
    CLEAR: "004",
    CLEAR_SINGLE: "005",
    SATIN: "012",
    OBSCURE_GLASS_PINHEAD: "006",
    OBSCURE_GLASS_SINGLE: "007",
    DARK_TINT_SEALED: "014",
    DARK_TINT_SINGLE: "015",
    BLACK_SATIN_SEALED: "016"
};

const GLASS_TYPE_RANCH = {
    CLEAR: "504",
    CLEAR_SINGLE: "505",
    SATIN: "512",
    OBSCURE_GLASS_PINHEAD: "506",
    OBSCURE_GLASS_SINGLE: "507",
    DARK_TINT_SEALED: "514",
    DARK_TINT_SINGLE: "515",
    BLACK_SATIN_SEALED: "516"
};

const GLASS_TYPE_COLONIAL_TEMP = {
    CLEAR: "024",
    CLEAR_SINGLE: "009",
    OBSCURE_GLASS_PINHEAD: "026",
    OBSCURE_GLASS_SINGLE: "027",
    DARK_TINT_SEALED: "034",
    DARK_TINT_SINGLE: "035"
};

const GLASS_TYPE_RANCH_TEMP = {
    CLEAR: "524",
    CLEAR_SINGLE: "509",
    OBSCURE_GLASS_PINHEAD: "526",
    OBSCURE_GLASS_SINGLE: "527",
    DARK_TINT_SEALED: "534",
    DARK_TINT_SINGLE: "535"
};

const L138_SINGLE_SLIM = { CLEAR: "54S-101", SATIN: "54S-111", BLACK_SATIN_SEALED: "54S-121" };
const L138_DOUBLE_SLIM = { CLEAR: "54L-101", SATIN: "54L-111", BLACK_SATIN_SEALED: "54L-121" };
const L200_SINGLE_SLIM = { CLEAR: "55S-201", SATIN: "55S-211", BLACK_SATIN_SEALED: "55S-221" };
const L200_DOUBLE_SLIM = { CLEAR: "55L-201", SATIN: "55L-211", BLACK_SATIN_SEALED: "55L-221" };

const FRAME_KIT_MAP = {
    slim_single: { S: "54S-6214", K: "54S-621K", W: "54S-621W" },
    slim_double: { S: "54L-6714", K: "54L-671K", W: "54L-671W" }
};

const MIXED_INSERT_RANCH = {
    stockton_colonial: "stockton_ranch",
    waterton_colonial: "waterton_ranch",
    cascade_colonial: "cascade_ranch",
    prairie: "prairie"
};

function getWindow1({ doorModel, shape, glassType, isMixed, isCustomSlim, hasSlimSingle }) {

    if (isCustomSlim && hasSlimSingle) {
        return doorModel === "A"
            ? (L138_SINGLE_SLIM[glassType] || "None")
            : (L200_SINGLE_SLIM[glassType] || "None");
    }

    if (isMixed) {
        const code = GLASS_TYPE_COLONIAL[glassType];
        return code ? `552-${code}` : "None";
    }

    if (!shape || !glassType) {
        return "None";
    }

    let code = "";

    if (shape === "colonial") {
        code = GLASS_TYPE_COLONIAL[glassType];
    } else if (shape === "ranch") {
        code = GLASS_TYPE_RANCH[glassType];
    } else if (shape === "slim_single") {
        code = doorModel === "A" ? L138_SINGLE_SLIM[glassType] : L200_SINGLE_SLIM[glassType];
    } else if (shape === "slim_double") {
        code = doorModel === "A" ? L138_DOUBLE_SLIM[glassType] : L200_DOUBLE_SLIM[glassType];
    }

    if (!code) {
        return "None";
    }

    return shape.includes("slim") ? code : `552-${code}`;
}

function getWindow2({ doorModel, shape, glassType, temperedGlass, isMixed, isCustomSlim, hasSlimDouble }) {

    if (isCustomSlim && hasSlimDouble) {
        return doorModel === "A"
            ? (L138_DOUBLE_SLIM[glassType] || "None")
            : (L200_DOUBLE_SLIM[glassType] || "None");
    }

    if (isMixed) {
        const code = GLASS_TYPE_RANCH[glassType];
        return code ? `552-${code}` : "None";
    }

    // Original returns "0" (not "None") here
    if (!shape || !glassType || !temperedGlass) {
        return "0";
    }

    let code = "";

    if (shape === "colonial") {
        code = GLASS_TYPE_COLONIAL_TEMP[glassType];
    } else if (shape === "ranch") {
        code = GLASS_TYPE_RANCH_TEMP[glassType];
    }

    return code ? `552-${code}` : "0";
}

function getInsert1({ glassInsert, insertColor }) {

    const code = INSERT_CODES[glassInsert];

    if (!glassInsert || !code) {
        return "";
    }

    return `${code}${insertColor}`;
}

function getInsert2({ glassInsert, insertColor, isMixed }) {

    if (!isMixed || !glassInsert) {
        return "";
    }

    const ranchCode = INSERT_CODES[MIXED_INSERT_RANCH[glassInsert]];

    return ranchCode ? `${ranchCode}${insertColor}` : "";
}

function getExteriorFrame1({ doorModel, shape, glassType, frameColor, isMixed }) {

    let value = "None";

    if (isMixed) {
        if (!glassType) {
            return "None";
        }
        value = `550-601${frameColor}`;
    }

    if (!shape && !isMixed) {
        return "None";
    }

    if (shape === "colonial") value = `550-601${frameColor}`;
    if (shape === "ranch") value = `550-651${frameColor}`;

    if (doorModel === "D") {
        if (shape === "slim_single") value = `550-620${frameColor}`;
        if (shape === "slim_double") value = `550-670${frameColor}`;
    }

    return value;
}

function getExteriorFrame2({ glassType, frameColor, isMixed }) {

    if (!isMixed || !glassType) {
        return "None";
    }

    return `550-651${frameColor}`;
}

function getInteriorFrame1({ doorModel, shape, glassType, isMixed }) {

    const isDouble = GLASS_TYPE_GLAZING[glassType] === "double";

    if (isMixed) {
        if (!glassType) {
            return "None";
        }
        return isDouble ? "550-612X" : "550-613X";
    }

    if (!shape) {
        return "None";
    }

    let value = "None";

    if (shape === "colonial") {
        value = doorModel === "A"
            ? (isDouble ? "550-606X" : "550-612X")
            : (doorModel === "D" ? (isDouble ? "550-612X" : "550-613X") : value);
    }

    if (shape === "ranch") {
        value = doorModel === "A"
            ? (isDouble ? "550-656X" : "550-662X")
            : (doorModel === "D" ? (isDouble ? "550-662X" : "550-663X") : value);
    }

    if (doorModel === "D") {
        if (shape === "slim_single") value = "550-622";
        if (shape === "slim_double") value = "550-672";
    }

    return value;
}

function getInteriorFrame2({ glassType, isMixed }) {

    if (!isMixed || !glassType) {
        return "None";
    }

    return GLASS_TYPE_GLAZING[glassType] === "double" ? "550-662X" : "550-663X";
}

function getFrameKit({ doorModel, shape, frameColor }) {

    if (doorModel !== "A") {
        return "None";
    }

    return FRAME_KIT_MAP[shape]?.[frameColor] || "None";
}

function getScrews({ doorModel, shape, glassType, isMixed }) {

    if (isMixed) {
        return glassType ? "215-328" : "";
    }

    if (!shape) {
        return "";
    }

    if (shape.includes("slim")) {
        return doorModel === "D" ? "215-333" : "215-334";
    }

    if (doorModel === "A") return "215-321";
    if (doorModel === "D") return "215-328";

    return "";
}

/* Live part codes – written to EW on every change */
export function getGlazingCodeValues({
    doorModel,
    panelStyle,
    glassShape,
    glassType,
    glassInsert,
    temperedGlass,
    frameColor,
    insertColor,
    windowPosition,
    doorInfoSections = []
}) {

    const shape = glassShape || "";

    const ctx = {
        doorModel,
        shape,
        glassType: glassType || "",
        glassInsert: shape.includes("slim") ? "" : (glassInsert || ""),
        temperedGlass: temperedGlass || "",
        frameColor: frameColor || "",
        insertColor: insertColor || "",
        isMixed: panelStyle === "M",
        isCustomSlim: windowPosition === "custom" && shape.includes("slim"),
        hasSlimSingle: doorInfoSections.some(s => s.shape === "slim_single"),
        hasSlimDouble: doorInfoSections.some(s => s.shape === "slim_double")
    };

    return {
        WINDOW_1: getWindow1(ctx),
        WINDOW_2: getWindow2(ctx),
        INSERT_1: getInsert1(ctx),
        INSERT_2: getInsert2(ctx),
        EXTERIOR_FRAME_1: getExteriorFrame1(ctx),
        EXTERIOR_FRAME_2: getExteriorFrame2(ctx),
        INTERIOR_FRAME_1: getInteriorFrame1(ctx),
        INTERIOR_FRAME_2: getInteriorFrame2(ctx),
        FRAME_KIT: getFrameKit(ctx),
        SCREWS: getScrews(ctx),
        INSERT_YES_NO: ctx.glassInsert ? "Y" : "N",
        SLIM_YES_NO_FOR_FRAMES:
            ["slim_single", "slim_double"].includes(shape) && doorModel === "A"
                ? "Y"
                : "N"
    };
}


/* ##########################################################
   2) CONFIGURE CODES
########################################################## */

/* ----------------------------------------------------------
   CONSTANTS (same as original)
---------------------------------------------------------- */

const BUNDLES = [
    { sb: "SB1_SPNUM", scs: ["BUNDLE1_SC1_SPNUM", "BUNDLE1_SC2_SPNUM"] },
    { sb: "SB2_SPNUM", scs: ["BUNDLE2_SC1_SPNUM", "BUNDLE2_SC2_SPNUM"] },
    { sb: "SB3_SPNUM", scs: ["BUNDLE3_SC1_SPNUM", "BUNDLE3_SC2_SPNUM"] },
    { sb: "SB4_SPNUM", scs: ["BUNDLE4_SC1_SPNUM", "BUNDLE4_SC2_SPNUM"] },
    { sb: "SB5_SPNUM", scs: ["BUNDLE5_SC1_SPNUM"] },
    { sb: "SB6_SPNUM", scs: ["BUNDLE6_SC1_SPNUM"] },
    { sb: "SB7_SPNUM", scs: ["BUNDLE7_SC1_SPNUM"] },
    { sb: "SB8_SPNUM", scs: ["BUNDLE8_SC1_SPNUM"] },
    { sb: "SB9_SPNUM", scs: ["BUNDLE9_SC1_SPNUM"] }
];

const LITE_CODE_MAP = {
    colonial: "C",
    ranch: "R",
    slim_single: "S",
    slim_double: "L"
};

const NO_GLAZING_CODE = "0,0,0,0,0,0,0,0,0,0";

const DOOR_THICKNESS_MAP = {
    A: 1.375,
    D: 2.00,
    G: 2.00
};

const MAX_WINDOWS = 10;

const LOC_Y_MAP = {
    24: 12.0,
    21: 10.5,
    18: 9.0
};

const CNC_WIDTH_MAP = {
    colonial: 18.8125,
    ranch: 41.6875,
    slim_single: 34.469,
    slim_double: 68.469
};

const CNC_HEIGHT_MAP = {
    colonial: 13.625,
    ranch: 13.625,
    slim_single: 6.594,
    slim_double: 6.594
};

const pad2 = n => String(n).padStart(2, "0");

/* ----------------------------------------------------------
   RLL VALUES API (original getAllRLLValuesForSmartcom)
   Cached by SMARTCOM code for the whole session.
---------------------------------------------------------- */

const RLL_CACHE_BY_SMARTCOM = {};

function getConfigId() {
    return window.location.href.split("/").pop().split("?")[0];
}

function parseAllRllValues(data) {

    const values = Array(15).fill(0);
    const results = data?.option?.[0]?.result || [];

    results.forEach(item => {

        const match = item.attr && item.attr.match(/^(\d+)X$/);

        if (!match) {
            return;
        }

        const idx = parseInt(match[1], 10);

        if (idx < 1 || idx > 15) {
            return;
        }

        if (Array.isArray(item.value) && item.value.length > 0) {
            values[idx - 1] = item.value[0];
        } else if (item.value != null) {
            values[idx - 1] = item.value;
        } else {
            values[idx - 1] = 0;
        }
    });

    return values;
}

async function getAllRllValuesForSmartcom(smartcomCode) {

    if (!smartcomCode) {
        return Array(15).fill(0);
    }

    if (RLL_CACHE_BY_SMARTCOM[smartcomCode]) {
        return RLL_CACHE_BY_SMARTCOM[smartcomCode];
    }

    const query =
        "id=" + getConfigId() +
        "&iName=" + encodeURIComponent("RLL_VALUES") +
        "&iVal=" + encodeURIComponent(smartcomCode);

    let data = null;

    try {
        const res = await fetch(
            "/spr/Configuration/interface/api/beta/attribute?" + query
        );
        data = await res.json();
    } catch (err) {
        console.error("RLL API error:", err);
    }

    const values = parseAllRllValues(data);

    RLL_CACHE_BY_SMARTCOM[smartcomCode] = values;

    return values;
}

/* ----------------------------------------------------------
   HELPERS
---------------------------------------------------------- */

function countMixedPanelStyles(pattern) {

    const result = { C: 0, R: 0 };

    String(pattern || "").split("").forEach(char => {

        const style = char.toUpperCase();

        if (style === "C" || style === "R") {
            result[style]++;
        }
    });

    return result;
}

/* ----------------------------------------------------------
   MAIN (Configure)
---------------------------------------------------------- */

export async function getGlazingCodeLogicValues(input, values) {

    const {
        doorModel,
        panelStyle: face,
        glassShape,
        glassType,
        glassInsert,
        temperedGlass,
        windowPosition,
        numOfSections,
        width,
        designCode,
        selectedColor,
        numOfPanels,
        numOfWindows,
        doorInfoSections = [],
        endCaps = "N",
        drill = "Y",
        windowCutouts = "N"
    } = input;

    const shape = glassShape || "";
    const isMixed = face === "M";
    const customWindows = windowPosition === "custom";
    const totalSections = Number(numOfSections) || 0;

    // Original getSectionInfo(): BOTTOM -> TOP
    const sections = [...doorInfoSections].reverse();

    // Computed nodes (old LOAD_DRIVEN_INPUTS / LOAD_GLOBAL_VARIABLES)
    const driven = getDrivenValues({
        doorModel,
        panelStyle: face,
        glassShape: shape,
        width,
        designCode,
        selectedColor,
        numOfPanels,
        numOfWindows
    });

    const panelSpacing = driven.PANEL_SPACING;
    const centerHingeCode = driven.CENTER_HINGE_CODE;
    const isRaynor = driven.RAYNOR_DOOR;

    // Advanced tab values (passed from React – not EW inputs on Landmark)
    const drillValue = drill || "Y";
    const isCutOut = windowCutouts || "N";

    // Original: fields keep their current value when the logic
    // does not set a new one (rw node value was left untouched)
    const keep = (field) => readEwValue(field) ?? "";

    // Original GLASS_INSERT node is "" for slim
    const hasInsert = !!glassInsert && !shape.includes("slim");

    const out = { ...driven };

    /* ---------- DOOR_THICKNESS ---------- */

    const doorThickness = DOOR_THICKNESS_MAP[doorModel] || 0;

    out.DOOR_THICKNESS = doorThickness;

    /* ---------- Lites (original computeValue("lites")) ---------- */

    const topSection = sections[sections.length - 1] || {};

    const litesQty = computeValue("lites", {
        width,
        panelStyle: face,
        glassShape: shape,
        spacing: panelSpacing,
        numOfWindows
    });

    const onlyTopHasGlass =
        sections.length > 0 &&
        (Number(topSection.glass_qty) || 0) > 0 &&
        sections.slice(0, -1).every(s => (Number(s.glass_qty) || 0) === 0);

    /* ---------- WINDOW_1_QTY ---------- */

    let window1Qty = keep("WINDOW_1_QTY");

    if (isMixed) {
        window1Qty = countMixedPanelStyles(DESIGN_PATTERNS[designCode]).C;
    } else if (!shape || !glassType) {
        window1Qty = 0;
    } else if (!customWindows && !shape.includes("slim")) {
        if (windowPosition === "top") {
            window1Qty = litesQty;
        }
    } else if (customWindows && !shape.includes("slim")) {
        window1Qty = onlyTopHasGlass ? topSection.glass_qty : "";
    }

    out.WINDOW_1_QTY = window1Qty;

    /* ---------- WINDOW_2_QTY ---------- */

    out.WINDOW_2_QTY = isMixed
        ? countMixedPanelStyles(DESIGN_PATTERNS[designCode]).R
        : 0;

    /* ---------- CENTER_HINGE_QTY ---------- */

    out.CENTER_HINGE_QTY = centerHingeCode;

    /* ---------- LITE_LOCATION ---------- */

    const liteCode = LITE_CODE_MAP[shape] ?? "";

    let liteLocation = keep("LITE_LOCATION");

    if (!customWindows && !shape.includes("slim")) {
        if (windowPosition === "top") {
            liteLocation = liteCode.repeat(Number(window1Qty) || 0);
        }
    } else if (customWindows && !shape.includes("slim")) {
        liteLocation = onlyTopHasGlass
            ? (topSection.enabled || []).map(v => (v ? liteCode : "0")).join("")
            : "";
    }

    out.LITE_LOCATION = liteLocation;

    /* ---------- INSERT_1_QTY / INSERT_2_QTY ---------- */

    if (!glassInsert) {
        out.INSERT_1_QTY = "0";
    } else if (!width || !face || !shape) {
        out.INSERT_1_QTY = 0;
    } else {
        out.INSERT_1_QTY = litesQty;
    }

    out.INSERT_2_QTY = 0;

    /* ---------- SMARTCOM CODE (createSmartcomLogic) ---------- */

    const widthFt = pad2(Math.floor(Number(width) / 12));
    const widthIn = Number(width) % 12;

    let prefix = "";

    if (face === "F" || face === "V") {
        if (customWindows || windowPosition === "top") {
            prefix = liteCode;
        }
        if (shape.includes("slim")) {
            prefix = liteCode;
        }
    } else {
        prefix = face;
    }

    const panelCode = isMixed ? designCode : panelSpacing;

    const smartcomCode =
        prefix + panelCode + centerHingeCode + "S" + drillValue + "-" + widthFt + widthIn;

    for (let i = 1; i <= 9; i++) {

        const sectionValue = values[`SECTION_0${i}`];

        out[`SECTION_0${i}_SMARTCOM_CODE`] =
            sectionValue !== "" && sectionValue !== null && sectionValue !== undefined
                ? smartcomCode
                : "";
    }

    /* ---------- SC / SB lookup ---------- */

    const allSCs = BUNDLES
        .flatMap(bundle => bundle.scs)
        .map(key => values[key])
        .filter(sc => sc && sc !== "None");

    const findSBForSC = (scPartNo) => {
        for (const bundle of BUNDLES) {
            for (const scKey of bundle.scs) {
                if (values[scKey] === scPartNo) {
                    return values[bundle.sb];
                }
            }
        }
        return "";
    };

    const getMatchingSC = (sectionIndex) => {
        for (const bundle of BUNDLES) {
            for (const scKey of bundle.scs) {
                const scVal = values[scKey];
                if (scVal && parseInt(scVal.slice(-2), 10) === sectionIndex) {
                    return {
                        sc_part_no: scVal,
                        sc_key: scKey,
                        sb_part_no: values[bundle.sb],
                        height_key: scKey.replace("SPNUM", "HEIGHT")
                    };
                }
            }
        }
        return null;
    };

    /* ---------- Glazing code string ---------- */

    const qtyFromScKey = (scKey, useTempOrMixed) => {

        if (!hasInsert) {
            return 0;
        }

        const match = String(scKey || "").match(/^BUNDLE(\d+)_SC(\d+)_SPNUM$/);

        if (!match) {
            return 0;
        }

        const base = `GLASS_QTY_B${match[1]}_SC${match[2]}`;

        return Number(values[useTempOrMixed ? `${base}_TEMP_OR_MIXED` : base]) || 0;
    };

    const glazingCodeString = (glassKey, options = {}) => {

        const ext1 = values.EXTERIOR_FRAME_1 || 0;
        const ext2 = values.EXTERIOR_FRAME_2 || 0;
        const int1 = values.INTERIOR_FRAME_1 || 0;
        const int2 = values.INTERIOR_FRAME_2 || 0;
        const screw = values.SCREWS || 0;
        const insert1 = values.INSERT_1 || 0;
        const insert2 = values.INSERT_2 || 0;
        const frameKit = values.FRAME_KIT || 0;

        const glass = options.glassValue !== undefined
            ? options.glassValue
            : values[glassKey];

        const glassQty = qtyFromScKey(options.scKey, false);
        const glassQtyTempOrMixed = qtyFromScKey(options.scKey, true);

        if (shape.includes("slim") && doorModel === "A") {
            return [frameKit, glass, screw, insert1, glassQty].join(",");
        }

        if (isMixed) {
            return [
                ext1, ext2, glass, int1, int2, screw,
                insert1, glassQty, insert2, glassQtyTempOrMixed
            ].join(",");
        }

        return [
            ext1, glass, int1, screw, insert1,
            options.useTempQty === true ? glassQtyTempOrMixed : glassQty
        ].join(",");
    };

    /* ---------- GLZ_CODE_SECTION (buildGlzCode) ---------- */

    const buildGlzCode = (sectionIndex) => {

        if (!shape && !isMixed) {
            return keep(`GLZ_CODE_SECTION_${pad2(sectionIndex)}`);
        }

        if (isRaynor === "Y") {
            return "";
        }

        const section = sections[sectionIndex - 1] || {};
        const enabled = Array.isArray(section.enabled) ? section.enabled : [];

        const allDisabled =
            enabled.length === 0 || enabled.every(v => v === false);

        const scPartNo = allSCs.find(
            sc => parseInt(sc.slice(-2), 10) === sectionIndex
        );

        if (!scPartNo) {
            return "";
        }

        const sbPartNo = findSBForSC(scPartNo);

        if (!sbPartNo) {
            return "";
        }

        const match = getMatchingSC(sectionIndex);

        if (!match) {
            return "";
        }

        let finalCode;

        if (allDisabled) {

            finalCode = NO_GLAZING_CODE;

        } else if (isMixed) {

            finalCode = glazingCodeString("WINDOW_1", {
                scKey: match.sc_key,
                glassValue: [values.WINDOW_1, values.WINDOW_2].join(",")
            });

        } else if (
            temperedGlass === "all" ||
            (temperedGlass === "bottom_1" && sectionIndex === 1) ||
            (temperedGlass === "bottom_2" && (sectionIndex === 1 || sectionIndex === 2))
        ) {

            finalCode = glazingCodeString("WINDOW_2", {
                scKey: match.sc_key,
                useTempQty: true
            });

        } else {

            finalCode = glazingCodeString("WINDOW_1", {
                scKey: match.sc_key,
                useTempQty: false
            });
        }

        const hasGlazing =
            finalCode && finalCode !== NO_GLAZING_CODE;

        if (isCutOut === "Y") {
            return hasGlazing ? "CUTOUT" : "";
        }

        return `${sbPartNo},${scPartNo},${finalCode}`;
    };

    for (let i = 1; i <= 9; i++) {
        out[`GLZ_CODE_SECTION_${pad2(i)}`] = buildGlzCode(i);
    }

    /* ---------- CNC string (getCNCString) ---------- */

    const getCncString = (sectionHeight, scPartNo, sectionIndex, sectionRll) => {

        try {

            const rpWidth = Number(width) || 0;
            const section = sections[sectionIndex - 1] || {};

            const isFlushGlass =
                (face === "F" || face === "V") &&
                (shape === "colonial" || shape === "ranch");

            const useFlushSpecialCNC =
                isFlushGlass &&
                windowPosition !== "top" &&
                windowPosition !== "custom";

            const enabledArr = Array.isArray(section.enabled) ? section.enabled : [];

            const mixedPanels = isMixed && Array.isArray(section.mixed_panels)
                ? section.mixed_panels
                : [];

            const mixedStyle = index => mixedPanels[index]?.style || "";

            const shapeForIndex = (index) => {
                if (!isMixed) return shape;
                const style = mixedStyle(index);
                if (style === "C") return "colonial";
                if (style === "R") return "ranch";
                return "";
            };

            const codeForIndex = (index) => {
                if (!enabledArr[index]) return "0";
                if (isMixed) return mixedStyle(index) || "0";
                return LITE_CODE_MAP[shape] || "0";
            };

            const flushGlassLocX = (position) => {

                let offset = 0;

                if (shape === "colonial") {
                    offset = endCaps === "Y" ? 16.1875 : 13.1875;
                } else if (shape === "ranch") {
                    offset = endCaps === "Y" ? 27.375 : 24.375;
                }

                switch (position) {
                    case "left": return [rpWidth - offset];
                    case "center":
                    case "top": return [rpWidth / 2];
                    case "right": return [offset];
                    case "both": return [rpWidth - offset, offset];
                    default: return [];
                }
            };

            const punchCode = enabledArr
                .map((enabled, index) => (enabled ? codeForIndex(index) : "0"))
                .join("");

            const rll = sectionRll || Array(15).fill(0);

            const RLL = Array.from({ length: MAX_WINDOWS }, (_, index) =>
                enabledArr[index] ? Number(rll[index]) || 0 : 0
            );

            const windowCount = enabledArr.filter(v => v === true).length;

            const locationY = LOC_Y_MAP[sectionHeight] || 0;

            const WIDTHS = Array.from({ length: MAX_WINDOWS }, (_, index) =>
                enabledArr[index] ? CNC_WIDTH_MAP[shapeForIndex(index)] || 0 : 0
            );

            const HEIGHTS = Array.from({ length: MAX_WINDOWS }, (_, index) =>
                enabledArr[index] ? CNC_HEIGHT_MAP[shapeForIndex(index)] || 0 : 0
            );

            const LOC_Y = Array.from({ length: MAX_WINDOWS }, (_, index) =>
                enabledArr[index] ? locationY : 0
            );

            const WC = Array.from({ length: MAX_WINDOWS }, (_, index) =>
                enabledArr[index] ? codeForIndex(index) : 0
            );

            let cnc = `${scPartNo},${doorThickness},${punchCode},${rpWidth},${sectionHeight},LR`;

            cnc += "," + Array(14).fill(0).join(",");
            cnc += `,${windowCount}`;

            const slimOffset = (slimShape) => {
                if (slimShape === "slim_single") {
                    return endCaps === "Y" ? 25 : 22;
                }
                return endCaps === "Y" ? 42 : 39;
            };

            const appendSlimWindows = (locXValues, useDecimals) => {

                let liteIndex = 0;

                for (let index = 0; index < MAX_WINDOWS; index++) {

                    if (!enabledArr[index]) {
                        cnc += ",0,0,0,0,0";
                        continue;
                    }

                    const locX = locXValues[liteIndex++];
                    const s = shapeForIndex(index);

                    cnc += `,${WC[index]},${CNC_WIDTH_MAP[s] || 0},${CNC_HEIGHT_MAP[s] || 0},${useDecimals ? Number(locX).toFixed(2) : locX},${locationY}`;
                }
            };

            const buildLocXValues = (firstCenterLine, spacing, qty) => {

                const result = [];

                let centerLine = firstCenterLine;

                for (let index = 0; index < qty; index++) {
                    result.push(Number(centerLine.toFixed(2)));
                    centerLine += spacing;
                }

                return result.reverse();
            };

            if (!isMixed && shape.includes("slim")) {

                const windowQty = section.max_window_qty;

                if (customWindows) {

                    if (section.slim_one) {

                        const offset = slimOffset(section.shape);
                        const windowIndex = enabledArr.findIndex(v => v === true);

                        let slimLocX;

                        if (windowIndex === 1) {
                            slimLocX = rpWidth / 2;
                        } else if (windowIndex === 0) {
                            slimLocX = rpWidth - offset;
                        } else {
                            slimLocX = offset;
                        }

                        appendSlimWindows([slimLocX], false);

                    } else if (section.slim_spacing === "even") {

                        const windowWidth = CNC_WIDTH_MAP[section.shape || shape] || 0;

                        const offset =
                            (rpWidth - windowQty * windowWidth) / (windowQty + 1);

                        appendSlimWindows(
                            buildLocXValues(offset + windowWidth / 2, offset + windowWidth, windowQty),
                            true
                        );

                    } else if (section.slim_spacing === "fixed") {

                        const windowWidth = CNC_WIDTH_MAP[section.shape || shape] || 0;
                        const fixedOffset = endCaps === "N" ? 4.8125 : 7.8125;
                        const firstCenterLine = fixedOffset + windowWidth / 2;
                        const spacing = (rpWidth - 2 * firstCenterLine) / (windowQty - 1);

                        appendSlimWindows(
                            buildLocXValues(firstCenterLine, spacing, windowQty),
                            true
                        );
                    }

                } else {

                    const offset = slimOffset(shape);

                    if (windowPosition === "both") {

                        const firstIndex = enabledArr.indexOf(true);
                        const lastIndex = enabledArr.lastIndexOf(true);

                        for (let index = 0; index < MAX_WINDOWS; index++) {

                            const s = shapeForIndex(index);
                            const w = CNC_WIDTH_MAP[s] || 0;
                            const h = CNC_HEIGHT_MAP[s] || 0;

                            if (index === firstIndex) {
                                cnc += `,${WC[index]},${w},${h},${rpWidth - offset},${locationY}`;
                            } else if (index === lastIndex && firstIndex !== lastIndex) {
                                cnc += `,${WC[index]},${w},${h},${offset},${locationY}`;
                            } else {
                                cnc += ",0,0,0,0,0";
                            }
                        }

                    } else {

                        let slimLocX;

                        if (windowPosition === "center") {
                            slimLocX = rpWidth / 2;
                        } else {
                            slimLocX = windowPosition === "left"
                                ? rpWidth - offset
                                : offset;
                        }

                        const windowIndex = enabledArr.findIndex(v => v === true);

                        if (windowIndex < 0) {

                            for (let index = 0; index < MAX_WINDOWS; index++) {
                                cnc += ",0,0,0,0,0";
                            }

                        } else {

                            const s = shapeForIndex(windowIndex);

                            cnc += `,${WC[windowIndex]},${CNC_WIDTH_MAP[s] || 0},${CNC_HEIGHT_MAP[s] || 0},${slimLocX},${locationY}`;

                            for (let index = 1; index < MAX_WINDOWS; index++) {
                                cnc += ",0,0,0,0,0";
                            }
                        }
                    }
                }

            } else if (useFlushSpecialCNC) {

                const locXValues = flushGlassLocX(windowPosition);

                let locIndex = 0;

                for (let index = 0; index < MAX_WINDOWS; index++) {

                    if (!enabledArr[index]) {
                        cnc += ",0,0,0,0,0";
                        continue;
                    }

                    const locX = locXValues[locIndex++] || 0;

                    cnc += `,${WC[index]},${WIDTHS[index]},${HEIGHTS[index]},${locX},${LOC_Y[index]}`;
                }

            } else {

                // Standard non-slim (mixed also comes here)
                for (let index = 0; index < MAX_WINDOWS; index++) {

                    if (enabledArr[index]) {
                        cnc += `,${WC[index]},${WIDTHS[index]},${HEIGHTS[index]},${RLL[index]},${LOC_Y[index]}`;
                    } else {
                        cnc += ",0,0,0,0,0";
                    }
                }
            }

            return cnc;

        } catch (err) {
            console.error("ERROR in getCncString:", err);
            return "";
        }
    };

    /* ---------- CNC_SECTION (buildCncCode) ---------- */

    const buildCncCode = async (sectionIndex) => {

        if (!shape && !isMixed) {
            return keep(`CNC_SECTION_${pad2(sectionIndex)}`);
        }

        if (isRaynor === "Y") {
            return "";
        }

        const match = getMatchingSC(sectionIndex);

        if (!match) {
            return "";
        }

        const sectionHeight = values[match.height_key];
        const isTopSection = sectionIndex === totalSections;
        const glz = out[`GLZ_CODE_SECTION_${pad2(sectionIndex)}`];

        if (sectionIndex === 1) {
            if (windowPosition === "top") return "";
        } else if (windowPosition === "top" && !isTopSection) {
            return "";
        }

        if (!glz) {
            return "";
        }

        const rll = await getAllRllValuesForSmartcom(
            out[`SECTION_0${sectionIndex}_SMARTCOM_CODE`]
        );

        return getCncString(sectionHeight, match.sc_part_no, sectionIndex, rll);
    };

    for (let i = 1; i <= 9; i++) {

        const key = `CNC_SECTION_${pad2(i)}`;

        // Original CNC_SECTION: glz ? buildCncCode() : ""
        out[key] = out[`GLZ_CODE_SECTION_${pad2(i)}`]
            ? await buildCncCode(i)
            : "";
    }

    /* ---------- PUNCH_CODE_SECTION (setPunchCode) ---------- */

    for (let i = 1; i <= 9; i++) {

        const enabledArr = sections[i - 1]?.enabled || [];

        out[`PUNCH_CODE_SECTION_${pad2(i)}`] = enabledArr
            .slice()
            .reverse()
            .map(v => (v ? 0 : 1))
            .join("");
    }

    return out;
}
