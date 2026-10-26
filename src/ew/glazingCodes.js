/* ==========================================================
   GLAZING PART CODES (LIVE)
   Port of registerGlazingCalculationLogic() from
   PRICE_CONTROLLER.js – the fields GLAZING_PRICE needs:
   WINDOW_1/2, INSERT_1/2, EXTERIOR/INTERIOR_FRAME_1/2,
   FRAME_KIT, SCREWS, INSERT_YES_NO, SLIM_YES_NO_FOR_FRAMES
========================================================== */

import {
    GLASS_TYPE_GLAZING,
    INSERT_CODES
} from "./ewAttributes";

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

/* ---------------------------------------------------------- */

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

/* ==========================================================
   MAIN
========================================================== */

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
