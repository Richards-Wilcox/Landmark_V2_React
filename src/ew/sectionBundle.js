/* ==========================================================
   SECTION BUNDLE LOGIC (React)

   Replaces (React-Wilcox addLogic versions):
   - PRICE_CONTROLLER.js
       registerSectionCalculationLogic
       getSectionBundle / bundleByHeight / getBundle
       calculateSectionShipWeight (+ helpers)
       GLASS_QTY_* / SCREW_QTY_* fields
   - SECTION_BUNDLES.js
       every register*Logic function

   Everything here is a pure function of the configurator
   state. The result is { EW_INPUT_ID: value }, which
   ewSync.js writes into the EW / ConfigureOne inputs.
========================================================== */

/* ----------------------------------------------------------
   CONSTANTS
---------------------------------------------------------- */

export const BUNDLE_CONFIG = [
    { bundleNo: 1, sectionCount: 2 },
    { bundleNo: 2, sectionCount: 2 },
    { bundleNo: 3, sectionCount: 2 },
    { bundleNo: 4, sectionCount: 2 },
    { bundleNo: 5, sectionCount: 1 },
    { bundleNo: 6, sectionCount: 1 },
    { bundleNo: 7, sectionCount: 1 },
    { bundleNo: 8, sectionCount: 1 },
    { bundleNo: 9, sectionCount: 1 }
];

const GLASS_QTY_FIELDS = [
    { bundleIndex: 0, sectionIndex: 0, field: "GLASS_QTY_B1_SC1" },
    { bundleIndex: 0, sectionIndex: 1, field: "GLASS_QTY_B1_SC2" },
    { bundleIndex: 1, sectionIndex: 0, field: "GLASS_QTY_B2_SC1" },
    { bundleIndex: 1, sectionIndex: 1, field: "GLASS_QTY_B2_SC2" },
    { bundleIndex: 2, sectionIndex: 0, field: "GLASS_QTY_B3_SC1" },
    { bundleIndex: 2, sectionIndex: 1, field: "GLASS_QTY_B3_SC2" },
    { bundleIndex: 3, sectionIndex: 0, field: "GLASS_QTY_B4_SC1" },
    { bundleIndex: 3, sectionIndex: 1, field: "GLASS_QTY_B4_SC2" },
    { bundleIndex: 4, sectionIndex: 0, field: "GLASS_QTY_B5_SC1" },
    { bundleIndex: 5, sectionIndex: 0, field: "GLASS_QTY_B6_SC1" },
    { bundleIndex: 6, sectionIndex: 0, field: "GLASS_QTY_B7_SC1" },
    { bundleIndex: 7, sectionIndex: 0, field: "GLASS_QTY_B8_SC1" },
    { bundleIndex: 8, sectionIndex: 0, field: "GLASS_QTY_B9_SC1" }
];

const SCREW_QTY_FIELDS = GLASS_QTY_FIELDS.map(item => ({
    field: item.field.replace("GLASS_QTY", "SCREW_QTY"),
    glassField: item.field
}));

const END_CAPS_PART_NUMBERS = {
    A: { // L138
        N: { 18: "426-0800", 21: "426-0801", 24: "426-0802" }, // Single
        Y: { 18: "426-0805", 21: "426-0806", 24: "426-0807" }  // Double
    },
    D: { // L200
        N: { 18: "426-0810", 21: "426-0811", 24: "426-0812" },
        Y: { 18: "426-0815", 21: "426-0816", 24: "426-0817" }
    }
};

const TOP_SHEET_CODES = {
    18: "034",
    21: "032",
    24: "033",
    28: "034",
    32: "035"
};

const BOTTOM_RETAINER_RANGES = [
    { max: 96, code: "328-790-080" },
    { max: 108, code: "328-790-090" },
    { max: 120, code: "328-790-100" },
    { max: 144, code: "328-790-120" },
    { max: 168, code: "328-790-140" },
    { max: 180, code: "328-790-150" },
    { max: 192, code: "328-790-160" },
    { max: 216, code: "328-790-180" },
    { max: 240, code: "328-790-200" }
];

/* ----------------------------------------------------------
   FIELD NAME HELPERS
---------------------------------------------------------- */

const bundleField = (b, suffix) => `BUNDLE_${b}_${suffix}`;
const bundleScField = (b, s, suffix) => `BUNDLE${b}_SC${s}_${suffix}`;
const bundleRpField = (b, s, suffix) => `BUNDLE${b}_RP${s}_${suffix}`;
const sbField = (b, suffix) => `SB${b}_${suffix}`;

/* ==========================================================
   1. SECTION CALCULATION (registerSectionCalculationLogic)
========================================================== */

export function getSectionCalc({ height, numOfSections, doorModel }) {

    const isGrandView = doorModel === "G";

    const doorHeight = isGrandView
        ? Number(height) - 24
        : Number(height);

    const numOfSec = isGrandView
        ? Number(numOfSections) - 1
        : Number(numOfSections);

    if (!numOfSec || numOfSec <= 0 || !doorHeight) {
        return {
            shortestSection: 0,
            shortestQty: 0,
            tallestSection: 0,
            tallestQty: 0
        };
    }

    const average = doorHeight / numOfSec;

    const shortestSection = Math.floor(average / 3) * 3;

    const shortestQty = Math.round(
        (1 - ((average - shortestSection) / 3)) * numOfSec
    );

    const tallestSection = Math.ceil(average / 3) * 3;

    const tallestQty = Math.round(
        ((average - shortestSection) / 3) * numOfSec
    );

    return {
        shortestSection,
        shortestQty,
        tallestSection,
        tallestQty
    };
}

/* ==========================================================
   2. SECTION STACK (getSectionBundle)
   Index 0 = BOTTOM section
========================================================== */

export function getSectionBundle({ calc, doorModel }) {

    const isGrandView = doorModel === "G";

    const shortestQty = Math.ceil(Number(calc.shortestQty)) || 0;
    const tallestQty = Math.ceil(Number(calc.tallestQty)) || 0;

    const shortestSection = Number(calc.shortestSection) || 0;
    const tallestSection = Number(calc.tallestSection) || 0;

    // Sorted DESC
    const sections = [
        ...Array(shortestQty).fill(shortestSection),
        ...Array(tallestQty).fill(tallestSection)
    ].sort((a, b) => b - a);

    const length = sections.length;
    const result = new Array(length);

    // Placement order: top, bottom, bottom+1, top-1, bottom+2, top-2 ...
    const positions = [];

    let bottom = 0;
    let top = length - 1;

    positions.push(top);
    top--;

    if (bottom <= top + 1) {
        positions.push(bottom);
        bottom++;
    }

    while (bottom <= top) {

        positions.push(bottom);
        bottom++;

        if (bottom <= top) {
            positions.push(top);
            top--;
        }
    }

    sections.forEach((section, index) => {
        result[positions[index]] = section;
    });

    if (isGrandView) {
        result.push(24);
    }

    return result;
}

/* ==========================================================
   3. SHIPPING WEIGHT (calculateSectionShipWeight)
========================================================== */

function calculateRawPanelWeight(sectionHeight, ctx) {

    const rpWeight = ctx.doorModel === "A" ? 1.775 : 1.74;

    const areaSqFt =
        (Number(ctx.doorWidthFeet) || 0) * (sectionHeight / 12);

    return Number((rpWeight * areaSqFt).toFixed(2));
}

function calculateEndCapsWeight(sectionHeight, ctx) {

    let weightPerFoot;

    if (ctx.endCaps === "N") {
        weightPerFoot = ctx.doorModel === "A" ? 1.02 : 1.14;
    } else {
        weightPerFoot = ctx.doorModel === "A" ? 3.07 : 3.3;
    }

    return Number(((sectionHeight / 12) * weightPerFoot).toFixed(2));
}

function calculateBottomRetainerWeight(isBottomSection, ctx) {

    if (!isBottomSection) {
        return 0;
    }

    return Number(((Number(ctx.doorWidthFeet) || 0) * 0.4).toFixed(2));
}

export function calculateSectionShipWeight(
    sectionHeight,
    isBottomSection,
    ctx
) {

    const lites = 0;
    const packagingWeight = 0.15;

    return Number((
        calculateRawPanelWeight(sectionHeight, ctx) +
        calculateEndCapsWeight(sectionHeight, ctx) +
        calculateBottomRetainerWeight(isBottomSection, ctx) +
        lites +
        packagingWeight
    ).toFixed(2));
}

/* ==========================================================
   4. BUNDLING (bundleByHeight)
   bundles[bundleNo - 1] = { sections, indexes, weight }
   indexes are 1-based, 1 = bottom section
========================================================== */

export function bundleByHeight({
    width,
    sections,
    glassShape,
    weightCtx
}) {

    const result = [];

    if (!sections.length) {
        return result;
    }

    const weight = (height, isBottom) =>
        calculateSectionShipWeight(height, isBottom, weightCtx);

    /* Width rule: every section is its own bundle */

    if (Number(width) >= 199) {
        return sections.map((height, i) => ({
            sections: [height],
            indexes: [i + 1],
            weight: weight(height, false)
        }));
    }

    const used = new Array(sections.length).fill(false);

    const isGlazed =
        !!glassShape && glassShape !== "undefined";

    /* Glazed rule: top + bottom together if same height */

    if (isGlazed) {

        const bottomHeight = sections[0];
        const topHeight = sections[sections.length - 1];

        if (bottomHeight === topHeight) {

            result.push({
                sections: [bottomHeight, topHeight],
                indexes: [1, sections.length],
                weight: weight(bottomHeight, true) + weight(topHeight, false)
            });

            used[0] = true;
            used[sections.length - 1] = true;
        }
    }

    /* Bottom single (if not already used) */

    if (!used[0]) {

        result.push({
            sections: [sections[0]],
            indexes: [1],
            weight: weight(sections[0], true)
        });

        used[0] = true;
    }

    /* Forward nearest match */

    for (let i = 1; i < sections.length; i++) {

        if (used[i]) {
            continue;
        }

        const height = sections[i];
        const indexes = [i + 1];

        used[i] = true;

        for (let j = i + 1; j < sections.length; j++) {

            if (!used[j] && sections[j] === height) {
                indexes.push(j + 1);
                used[j] = true;
                break;
            }
        }

        result.push({
            sections: indexes.map(() => height),
            indexes,
            weight: indexes.reduce(sum => sum + weight(height, false), 0)
        });
    }

    return result;
}

/* ==========================================================
   5. SMALL HELPERS
========================================================== */

export function getEndCapsPartNum(sectionHeight, doorModel, endCaps) {
    return END_CAPS_PART_NUMBERS[doorModel]?.[endCaps]?.[sectionHeight] || null;
}

function getSBPrefix(type, height) {

    if (type === "SB1") {
        return height < 32 ? "SB-B" : "SB-BI";
    }

    return height > 32 ? "SB-II" : "SB-I";
}

function getBottomRetainer(width) {
    const range = BOTTOM_RETAINER_RANGES.find(r => width <= r.max);
    return range ? range.code : "";
}

function getScrewsPerWindow(glassShape, doorModel) {

    if (glassShape === "colonial") return 10;
    if (glassShape === "ranch") return 18;
    if (glassShape === "slim_single") return doorModel === "D" ? 12 : 14;
    if (glassShape === "slim_double") return doorModel === "D" ? 20 : 22;

    return 0;
}

/* ==========================================================
   6. MAIN: ALL EW VALUES
========================================================== */

export function getSectionBundleValues({
    // Dimensions (inches)
    width,
    height,
    numOfSections,

    // Door model value ("A", "D", "G") + EW attributes
    doorModel,
    doorModelId,      // EW DOOR_MODEL radio "id"   e.g. "L138"
    doorModelDesc,    // EW DOOR_MODEL radio "desc"

    // Panel
    panelStyle,       // "C", "R", "F", "M" ...
    faceDesc,         // EW FACE radio "desc"
    designPattern,    // EW DESIGN_CODE option "pattern"

    // Color
    colorValue,       // e.g. "W"
    colorDesc,

    // Glazing
    glassShape,
    windowPosition,
    doorInfoSections = [],   // getDoorInfo().sections (TOP -> BOTTOM)

    // Not built in React yet
    endCaps = "N",
    raynorDoor = "N"
}) {

    const values = {};

    /* ---------- Dimensions from inches (always in sync) ---------- */

    const doorWidthFeet = Math.floor(Number(width) / 12);
    const doorWidthInches = Number(width) % 12;
    const doorHeightFeet = Math.floor(Number(height) / 12);

    const numOfSec = Number(numOfSections) || 0;

    /* ---------- Model / description pieces ---------- */

    const doorModelIdShort = (doorModelId || "").substring(1);

    const newModelId =
        doorModelIdShort === "200GV" ? "GRD" : doorModelIdShort;

    const widthFeetPadded = String(doorWidthFeet).padStart(2, "0");

    const panelDesc =
        faceDesc !== "mixed" ? faceDesc : designPattern;

    const doubleEndCaps = endCaps === "Y" ? "DE" : "";

    /* ---------- Sections + bundles ---------- */

    const calc = getSectionCalc({ height, numOfSections, doorModel });

    const sections = getSectionBundle({ calc, doorModel });

    const bundles = bundleByHeight({
        width,
        sections,
        glassShape,
        weightCtx: { doorModel, doorWidthFeet, endCaps }
    });

    const getBundle = (bundleNo) => bundles[bundleNo - 1];

    const getBundleHeight = (bundleNo) =>
        getBundle(bundleNo)?.sections?.reduce((a, b) => a + b, 0) ?? 0;

    const getBundleSectionHeight = (bundleNo, s) =>
        getBundle(bundleNo)?.sections?.[s - 1] ?? 0;

    const getBundleIndex = (bundleNo, s) =>
        getBundle(bundleNo)?.indexes?.[s - 1] ?? "";

    /* ---------- Descriptions ---------- */

    const sizeText = (h) =>
        `${widthFeetPadded}-${doorWidthInches}x${h}`;

    const buildSBDescription = (prefix, h, qty) =>
        qty > 0
            ? `${prefix} ${sizeText(h)} ${doorModelDesc} ${colorDesc} ${panelDesc} ${doubleEndCaps}`
            : "";

    const buildSCDescription = (h, qty) =>
        qty > 0
            ? `SC ${sizeText(h)} ${doorModelDesc} ${colorDesc} ${panelDesc} ${doubleEndCaps}`
            : "";

    const buildRPDescription = (h, qty) =>
        qty > 0
            ? `SR ${sizeText(h)} ${doorModelDesc} ${colorDesc} ${panelDesc}`
            : "";

    /* ---------- Section calculation fields ---------- */

    values.SHORTEST_SECTION = calc.shortestSection;
    values.SHORTEST_SECTIONS_QTY = calc.shortestQty;
    values.TALLEST_SECTION = calc.tallestSection;
    values.TALLEST_SECTION_QTY = calc.tallestQty;

    /* ---------- Header (registerHeaderLogic) ---------- */

    values.YLINE_DESC =
        `DF ${doorWidthFeet}-${doorWidthInches}x${doorHeightFeet}-0(${numOfSections}) ${doorModelDesc} ${colorDesc} ${panelDesc}`;

    /* ---------- Section heights (registerSectionHeightLogic) ---------- */

    for (let i = 1; i <= 9; i++) {
        values[`SECTION_0${i}`] =
            i <= 3 || numOfSec >= i
                ? (sections[i - 1] ?? "")
                : "";
    }

    /* ---------- Packaging qty ---------- */

    const pkgQty = Number(width / 12).toFixed(1);

    values.PKG_QTY = pkgQty;

    /* ---------- Per bundle ---------- */

    BUNDLE_CONFIG.forEach(({ bundleNo, sectionCount }) => {

        /* Core (registerBundleCoreLogic) */

        const bundleHeight = getBundleHeight(bundleNo);
        const bundleQty = bundleHeight > 0 ? 1 : 0;

        values[bundleField(bundleNo, "HEIGHT")] = bundleHeight;
        values[bundleField(bundleNo, "QTY")] = bundleQty;

        /* Section bundle (registerSectionBundleLogic) */

        let sbSpNum;

        if (bundleQty <= 0) {
            sbSpNum = "None";
        } else if (raynorDoor === "Y") {
            sbSpNum = `RL${doorModel}00${bundleNo}`;
        } else if (doorModelIdShort === "200GV") {
            sbSpNum = `SBGRD0${bundleNo}`;
        } else {
            sbSpNum = `SB${doorModelIdShort}0${bundleNo}`;
        }

        values[sbField(bundleNo, "SPNUM")] = sbSpNum;

        values[sbField(bundleNo, "DESC")] = buildSBDescription(
            getSBPrefix(bundleNo === 1 ? "SB1" : "DEFAULT", bundleHeight),
            bundleHeight,
            bundleQty
        );

        /* Packaging (registerPackagingLogic) */

        if (bundleNo <= 4) {
            values[`BUNDLE_${bundleNo}_PKG_QTY_DBL`] =
                bundleHeight > 32 ? pkgQty : 0;
        }

        values[`BUNDLE_${bundleNo}_PKG_QTY_SGL`] =
            bundleHeight > 0 && bundleHeight < 32 ? pkgQty : 0;

        /* Per section in bundle */

        for (let s = 1; s <= sectionCount; s++) {

            const scHeight = getBundleSectionHeight(bundleNo, s);
            const scQty = scHeight === 0 ? 0 : 1;
            const index = getBundleIndex(bundleNo, s);

            values[bundleScField(bundleNo, s, "HEIGHT")] = scHeight;
            values[bundleScField(bundleNo, s, "QTY")] = scQty;

            /* Section component */

            values[bundleScField(bundleNo, s, "SPNUM")] =
                scQty > 0 ? `SC${newModelId}0${index}` : "None";

            values[bundleScField(bundleNo, s, "DESC")] =
                buildSCDescription(scHeight, scQty);

            /* Raw panel */

            values[bundleRpField(bundleNo, s, "SPNUM")] =
                scHeight > 0 ? `SR${newModelId}0${index}` : "None";

            values[bundleRpField(bundleNo, s, "DESC")] =
                buildRPDescription(scHeight, scQty);

            /* Raw panel base */

            values[`BUNDLE${bundleNo}_SC${s}_RP_BASE_SPNUM`] =
                `RB-${doorModelId}-${scHeight}S`;

            /* Raw panel top sheet */

            values[`BUNDLE${bundleNo}_SC${s}_RP_TOP_SHEET_SPNUM`] =
                `127-${TOP_SHEET_CODES[scHeight] ?? ""}${colorValue}`;

            /* End caps */

            values[`BUNDLE${bundleNo}_SC${s}_END_CAPS_SPNUM`] =
                bundleNo >= 3 && !(scHeight > 0)
                    ? "None"
                    : (getEndCapsPartNum(scHeight, doorModel, endCaps) ?? "");
        }
    });

    /* ---------- Raw panel base qty ---------- */

    values.RP_BASE_QTY = width;

    /* ---------- Bottom retainer ---------- */

    values.BOTTOM_RETAINER = getBottomRetainer(width);
    values.BTM_SEAL_QTY = (Number(width) / 12) + 0.5;
    values.BTM_RETAINER_SCREW_QTY = doorWidthFeet + 2;

    /* ---------- Glass + screw qty per bundle section ---------- */

    // doorInfo sections are TOP -> BOTTOM, bundle indexes are BOTTOM-first
    const reversedSections = [...doorInfoSections].reverse();

    const shape = glassShape || "";

    const isCustomSlim =
        windowPosition === "custom" && shape.includes("slim");

    const isMixed = panelStyle === "M";

    const primaryKey = isCustomSlim
        ? "slim_single_glass_qty"
        : (isMixed ? "mixed_colonial_qty" : "glass_qty");

    const secondaryKey = isCustomSlim
        ? "slim_double_glass_qty"
        : (isMixed ? "mixed_ranch_qty" : "temp_glass_qty");

    const qtyAt = (bundleIndex, sectionIndex, key) => {

        const index = bundles[bundleIndex]?.indexes?.[sectionIndex];

        if (!index) {
            return 0;
        }

        return Number(reversedSections[index - 1]?.[key]) || 0;
    };

    GLASS_QTY_FIELDS.forEach(item => {

        values[item.field] =
            qtyAt(item.bundleIndex, item.sectionIndex, primaryKey);

        values[`${item.field}_TEMP_OR_MIXED`] =
            qtyAt(item.bundleIndex, item.sectionIndex, secondaryKey);
    });

    SCREW_QTY_FIELDS.forEach(item => {

        if (!shape && !isMixed) {
            values[item.field] = 0;
            return;
        }

        const primary = values[item.glassField];
        const secondary = values[`${item.glassField}_TEMP_OR_MIXED`];

        values[item.field] = isMixed
            ? primary * 10 + secondary * 18
            : (primary + secondary) * getScrewsPerWindow(shape, doorModel);
    });

    return { values, sections, bundles, calc };
}
