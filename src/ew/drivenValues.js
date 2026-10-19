/* ==========================================================
   DRIVEN VALUES
   Port of the computed nodes the glazing / scheduling logic
   depends on. In the old code these were addLogic() nodes
   (LOAD_DRIVEN_INPUTS.js / LOAD_GLOBAL_VARIABLES.js).
   The old logic no longer runs, so the EW inputs would hold
   stale values – they are calculated here instead.

     PANEL_SPACING, CENTER_HINGE_CODE, LM_DOOR_MODEL,
     RAYNOR_DOOR, computeValue("lites")
========================================================== */

import { DOOR_MODEL_ATTRS } from "./ewAttributes";

/* ----------------------------------------------------------
   Mixed design code -> center hinge code
   (DESIGN_CODE option attribute "center_hinge_code")
---------------------------------------------------------- */

const DESIGN_CENTER_HINGE = {
    A: "C", B: "C", C: "D", D: "C", E: "C",
    J: "E", K: "E",
    F: "E", G: "E", H: "E", I: "D", N: "E", O: "D",
    L: "E", M: "E",
    P: "E", Q: "E",
    R: "E", S: "E",
    T: "F", U: "F"
};

/* ----------------------------------------------------------
   getLites (same table as original)
---------------------------------------------------------- */

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

export function getLites(width, type) {

    const table = LITE_RANGES[type];

    if (!table) {
        return null;
    }

    return table.find(r => width >= r.min && width <= r.max) || null;
}

/* ----------------------------------------------------------
   PANEL_SPACING
---------------------------------------------------------- */

export function getPanelSpacing({ panelStyle, glassShape, numOfPanels }) {

    const face = panelStyle || "";
    const shape = glassShape || "";

    if (["2", "4", "6", "8"].includes(String(numOfPanels))) {
        return "P";
    }

    if (face === "F" || face === "V") {
        if (shape === "colonial" || shape.includes("slim")) return "S";
        if (shape === "ranch") return "R";
    }

    if (["C", "R", "M"].includes(face)) return "S";
    if (["B", "S", "T"].includes(face)) return "C";

    return "";
}

/* ----------------------------------------------------------
   resolveLiteResult (original, without the global cache)
---------------------------------------------------------- */

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

    // Copy so the table is never modified
    const result = { ...found };

    const custom = Number(numOfWindows) || 0;

    if (custom > 0) {
        result.lites = custom;
    }

    return result;
}

/* ----------------------------------------------------------
   computeValue(field)
---------------------------------------------------------- */

export function computeValue(field, input) {

    const result = resolveLiteResult(input);

    return result ? (result[field] ?? 0) : 0;
}

/* ----------------------------------------------------------
   CENTER_HINGE_CODE
---------------------------------------------------------- */

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

    return result ? (result.center_hinge_code || "") : "";
}

/* ----------------------------------------------------------
   ALL DRIVEN VALUES
---------------------------------------------------------- */

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

    const panelSpacing = getPanelSpacing({
        panelStyle,
        glassShape,
        numOfPanels
    });

    const centerHingeCode = getCenterHingeCode({
        width,
        panelStyle,
        glassShape,
        spacing: panelSpacing,
        designCode,
        numOfWindows
    });

    return {
        PANEL_SPACING: panelSpacing,
        CENTER_HINGE_CODE: centerHingeCode,
        LM_DOOR_MODEL: DOOR_MODEL_ATTRS[doorModel]?.id || "",
        RAYNOR_DOOR:
            selectedColor === "X" ||
            selectedColor === "Y" ||
            panelStyle === "B"
                ? "Y"
                : "N"
    };
}
