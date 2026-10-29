/* ==========================================================
   CANVAS LAYOUT
   WHERE everything goes on the door – pure math, no drawing.
   Used by DoorCanvas (drawing + clicking), doorInfo (JSON_OBJ)
   and Configurator / WindowPosition (window rules).

   1) Canvas size + door scale
   2) Face rules      (original FACE_desc, SPECIAL_FACE, hints)
   3) Panel geometry  (original getPanelPositions, getSectionHeights)
   4) Slim windows    (original slim_* functions)
   5) Window sections (original WINDOW_STATE / setWindowPositions)
========================================================== */

import panelConfigurations from "../../Data/panelConfigurations";


/* ==========================================================
   1) CANVAS SIZE + DOOR SCALE
========================================================== */

export const CANVAS_WIDTH = 900;
export const CANVAS_HEIGHT = 700;

// The door is fitted inside this box on the canvas
const MAX_DOOR_WIDTH = 700;
const MAX_DOOR_HEIGHT = 500;

/* Scale used by the canvas AND by JSON_OBJ (must be the same) */
export function getDoorScale(doorWidth, doorHeight) {

    const width = Number(doorWidth) || 0;
    const height = Number(doorHeight) || 0;

    if (!width || !height) {
        return 0;
    }

    return Math.min(
        MAX_DOOR_WIDTH / width,
        MAX_DOOR_HEIGHT / height
    );
}

/* Top-left corner of the door on the canvas: [x, y] */
export function getDoorPosition(doorWidth, doorHeight) {

    const scale = getDoorScale(doorWidth, doorHeight);

    return [
        (CANVAS_WIDTH - Number(doorWidth) * scale) / 2,
        (CANVAS_HEIGHT - Number(doorHeight) * scale) / 2
    ];
}


/* ==========================================================
   2) FACE RULES
========================================================== */

// Original FACE_desc
const FACE_MAP = {
    C: "colonial",
    F: "flush",
    V: "plank",
    R: "ranch",
    B: "colonial_grooved",
    S: "ranch_grooved",
    T: "smooth_ranch",
    M: "mixed"
};

export function getFaceDesc(panelStyle) {
    return FACE_MAP[panelStyle] || "flush";
}

/* Original SPECIAL_FACE node – e.g. Colonial door + Ranch glass */
export function isSpecialFace(panelStyle, glassShape) {

    let face = getFaceDesc(panelStyle);

    if (face === "colonial_grooved") {
        face = "colonial";
    }

    const specialList = ["colonial", "ranch"];

    return (
        !!glassShape &&
        glassShape !== face &&
        specialList.includes(glassShape) &&
        specialList.includes(face)
    );
}

/* Panel type used by the door face */
export function getFacePanelType(panelStyle) {
    return (panelStyle === "C" || panelStyle === "B")
        ? "colonial"
        : "ranch";
}

/* Dotted window hints + click-to-select (one rule for both).
   - Only on the Glazing card, only in Custom window position
   - Grand / special faces: never (their position is locked to Top)
   Used by DoorCanvas (drawing + clicking) and doorInfo (draw_hints),
   so JSON_OBJ always matches what is drawn. */
export function getHintsVisible({
    activeTab,
    panelStyle,
    glassShape,
    windowPosition
}) {

    const shape = glassShape || "";

    if (!shape || activeTab !== "glazing" || windowPosition !== "custom") {
        return false;
    }

    return !(shape.includes("grand") || isSpecialFace(panelStyle, shape));
}


/* ==========================================================
   3) PANEL GEOMETRY (original getPanelPositions etc.)
========================================================== */

/* Grooved / smooth ranch faces use the windemere rules */
export function getPanelConfigurationKey(panelType) {

    const windemere = [
        "colonial_grooved",
        "smooth_ranch",
        "ranch_grooved"
    ];

    return windemere.includes(panelType)
        ? "windemere"
        : panelType;
}

/* Section rule for this panel type + door width */
export function getRule(panelType, doorWidth) {

    const rules =
        panelConfigurations[getPanelConfigurationKey(panelType)]?.sectionRules || [];

    return rules.find(rule =>
        doorWidth >= rule.sectionWidth.min &&
        doorWidth <= rule.sectionWidth.max
    );
}

export function getPanelDimensions(panelType) {

    const config = panelConfigurations[getPanelConfigurationKey(panelType)];

    if (!config) {
        return null;
    }

    return {
        panelWidth: config.panelWidth,
        panelHeight: config.panelHeight
    };
}

/* X position (inches) of every panel / window in a section */
export function getPanelPositions({
    panelType,
    doorWidth,
    face,
    glassShape,
    selectedPanels = 0,
    selectedWindows = 0,
    special = false
}) {

    const rule = getRule(panelType, doorWidth);

    if (!rule) {
        return [];
    }

    let panelQty = rule.qtyOfPanels;
    let muttSpacing = rule.muttSpacing;

    if (
        // Number Of Windows (Flush + Colonial glass)
        (face === "F" &&
            glassShape === "colonial" &&
            rule.special &&
            selectedWindows === rule.special.qtyOfPanels) ||

        // Number Of Panels (Raised Colonial)
        (face === "C" &&
            rule.special &&
            selectedPanels === rule.special.qtyOfPanels) ||

        // Legacy special mode (special face)
        (special && rule.special)
    ) {
        panelQty = rule.special.qtyOfPanels;
        muttSpacing = rule.special.muttSpacing;
    }

    const panelWidth =
        panelConfigurations[getPanelConfigurationKey(panelType)].panelWidth;

    const startX =
        (doorWidth - (panelQty * panelWidth + (panelQty - 1) * muttSpacing)) / 2;

    let positions = [];

    for (let i = 0; i < panelQty; i++) {
        positions.push(startX + i * (panelWidth + muttSpacing));
    }

    // Grooved colonial: two colonial panels inside each windemere panel
    if (panelType === "colonial_grooved") {

        const offset = panelWidth - panelConfigurations.colonial.panelWidth;

        positions = positions.flatMap(pos => [pos, pos + offset]);
    }

    return positions;
}

/* Section heights TOP -> BOTTOM (EasyWeb stack chart rule) */
export function getSectionHeights(doorHeight, numSections) {

    const averageHeight = doorHeight / numSections;

    if (averageHeight < 18 || averageHeight > 24) {
        return [];
    }

    const section1 = Math.floor(averageHeight / 3) * 3;
    const section2 = Math.ceil(averageHeight / 3) * 3;

    const percent = (averageHeight - section1) / 3;

    const numSection1 = Math.round((1 - percent) * numSections);
    const numSection2 = numSections - numSection1;

    const stack = [
        ...Array(numSection1).fill(section1),
        ...Array(numSection2).fill(section2)
    ];

    const heights = Array(numSections).fill(0);

    let offset = 0;
    let top = false;

    heights[offset] = stack.pop();
    heights[numSections - offset - 1] = stack.pop();

    offset++;

    while (stack.length > 0) {

        if (top) {
            heights[offset] = stack.pop();
            offset++;
        } else {
            heights[numSections - offset - 1] = stack.pop();
        }

        top = !top;
    }

    return heights;
}

/* Mixed panel layout (C / R pattern).
   Not used yet – kept for the Mixed panel canvas. */
export function getMixedPanelLayout({ doorWidth, pattern }) {

    if (!pattern || !pattern.length) {
        return [];
    }

    const mixed = panelConfigurations.mixed;
    const rule = getRule("mixed", doorWidth);

    if (!mixed || !rule) {
        return [];
    }

    const spacing = rule.muttSpacing ?? 0;

    const panels = pattern.map(style => {

        const colonial = style === "C";

        return {
            style,
            width: colonial ? mixed.panelWidthCol : mixed.panelWidthRnc,
            height: colonial ? mixed.panelHeightCol : mixed.panelHeightRnc
        };
    });

    const colonialPositions = getPanelPositions({
        panelType: "colonial",
        doorWidth,
        face: "C"
    });

    const endStile = Math.max(0, colonialPositions[0] ?? 0);
    const usableWidth = Math.max(0, doorWidth - 2 * endStile);

    const rawWidth =
        panels.reduce((sum, panel) => sum + panel.width, 0) +
        spacing * (panels.length - 1);

    const fitScale = rawWidth > 0 ? usableWidth / rawWidth : 1;
    const fittedSpacing = spacing * fitScale;

    panels.forEach(panel => {
        panel.width *= fitScale;
    });

    const totalWidth =
        panels.reduce((sum, panel) => sum + panel.width, 0) +
        fittedSpacing * (panels.length - 1);

    let x = endStile + (usableWidth - totalWidth) / 2;

    return panels.map(panel => {

        const result = { ...panel, x };

        x += panel.width + fittedSpacing;

        return result;
    });
}


/* ==========================================================
   4) SLIM WINDOWS (original slim_* functions)
========================================================== */

const SLIM_SINGLE_WIDTH = 34.344;
const SLIM_DOUBLE_WIDTH = 68.344;

const ENDCAP_SINGLE = 4.8125;
const ENDCAP_DOUBLE = 7.8125;

function findQty(rules, widthIn) {

    const rule = rules.find(r => widthIn >= r.min && widthIn <= r.max);

    return rule ? rule.qty : 0;
}

function slimSinglePerSection(widthIn, fixedEnd, singleEndcap) {

    const evenSingle = [
        { min: 96, max: 132, qty: 2 },
        { min: 133, max: 175, qty: 3 },
        { min: 176, max: 217, qty: 4 },
        { min: 218, max: 242, qty: 5 }
    ];

    const fixedSingle = [
        { min: 96, max: 128, qty: 2 },
        { min: 129, max: 170, qty: 3 },
        { min: 171, max: 213, qty: 4 },
        { min: 214, max: 242, qty: 5 }
    ];

    const evenDouble = [
        { min: 96, max: 136, qty: 2 },
        { min: 137, max: 179, qty: 3 },
        { min: 180, max: 222, qty: 4 },
        { min: 223, max: 242, qty: 5 }
    ];

    const fixedDouble = [
        { min: 96, max: 134, qty: 2 },
        { min: 135, max: 177, qty: 3 },
        { min: 178, max: 219, qty: 4 },
        { min: 220, max: 242, qty: 5 }
    ];

    if (!fixedEnd && singleEndcap) return findQty(evenSingle, widthIn);
    if (fixedEnd && singleEndcap) return findQty(fixedSingle, widthIn);
    if (!fixedEnd && !singleEndcap) return findQty(evenDouble, widthIn);

    return findQty(fixedDouble, widthIn);
}

function slimDoublePerSection(widthIn, fixedEnd, singleEndcap) {

    const evenSingle = [
        { min: 96, max: 158, qty: 1 },
        { min: 159, max: 234, qty: 2 },
        { min: 235, max: 242, qty: 3 }
    ];

    const fixedSingle = [
        { min: 96, max: 154, qty: 1 },
        { min: 155, max: 230, qty: 2 },
        { min: 231, max: 242, qty: 3 }
    ];

    const evenDouble = [
        { min: 96, max: 161, qty: 1 },
        { min: 162, max: 238, qty: 2 },
        { min: 239, max: 242, qty: 3 }
    ];

    const fixedDouble = [
        { min: 96, max: 160, qty: 1 },
        { min: 161, max: 236, qty: 2 },
        { min: 237, max: 242, qty: 3 }
    ];

    if (!fixedEnd && singleEndcap) return findQty(evenSingle, widthIn);
    if (fixedEnd && singleEndcap) return findQty(fixedSingle, widthIn);
    if (!fixedEnd && !singleEndcap) return findQty(evenDouble, widthIn);

    return findQty(fixedDouble, widthIn);
}

/* Original slim_window_locationsx_in */
function slimWindowLocations(widthIn, windowIn, numWindows, fixedOffsetIn) {

    const spacingFixed =
        (widthIn - 2 * fixedOffsetIn - windowIn) / (numWindows - 1);

    const spacingEven =
        (widthIn - numWindows * windowIn) / (numWindows + 1) + windowIn;

    const offsetEven = spacingEven - windowIn;

    const offset = fixedOffsetIn === 0 ? offsetEven : fixedOffsetIn;

    let spacing = fixedOffsetIn === 0 ? spacingEven : spacingFixed;

    if (isNaN(spacing) || !isFinite(spacing)) {
        spacing = 0;
    }

    const results = [];

    for (let i = 0; i < numWindows; i++) {
        results.push(offset + i * spacing);
    }

    return results;
}

export function getSlimWindowWidth(shape) {
    return shape === "slim_single"
        ? SLIM_SINGLE_WIDTH
        : SLIM_DOUBLE_WIDTH;
}

export function getSlimEndcapOffset(singleEndcap = true) {
    return singleEndcap
        ? ENDCAP_SINGLE
        : ENDCAP_DOUBLE;
}

/* Qty-based layout (original slim_getWindowPositions) */
export function getSlimWindowPositions(
    shape,
    doorWidth,
    fixedEnd = false,
    singleEndcap = true
) {

    const numWindows = shape === "slim_single"
        ? slimSinglePerSection(doorWidth, fixedEnd, singleEndcap)
        : slimDoublePerSection(doorWidth, fixedEnd, singleEndcap);

    const endcapOffset = fixedEnd
        ? getSlimEndcapOffset(singleEndcap)
        : 0;

    return slimWindowLocations(
        doorWidth,
        getSlimWindowWidth(shape),
        numWindows,
        endcapOffset
    );
}

/* 3-slot layout: Left / Center / Right
   (original slim_one / slim_position_mode) */
export function getSlimFixedPositions(shape, doorWidth, singleEndcap = true) {

    return slimWindowLocations(
        doorWidth,
        getSlimWindowWidth(shape),
        3,
        getSlimEndcapOffset(singleEndcap)
    );
}

/* Default per-section slim config */
export function getDefaultSlimSection(glassShape) {
    return {
        shape: glassShape,
        slimOne: false,
        spacing: "even"
    };
}

/* Merge saved config with defaults */
export function getSlimSectionConfig(slimSections, index, glassShape) {

    const config = {
        ...getDefaultSlimSection(glassShape),
        ...(slimSections?.[index] || {})
    };

    if (!config.shape || !config.shape.includes("slim")) {
        config.shape = glassShape;
    }

    return config;
}

/* Positions for a section in custom mode */
export function getSlimSectionPositions(config, doorWidth, singleEndcap = true) {

    if (config.slimOne) {
        return getSlimFixedPositions(config.shape, doorWidth, singleEndcap);
    }

    return getSlimWindowPositions(
        config.shape,
        doorWidth,
        config.spacing === "fixed",
        singleEndcap
    );
}

/* Original getMaxSlimWindowQty */
export function getMaxSlimWindowQty(
    shape,
    doorWidth,
    spacing = "even",
    singleEndcap = true
) {

    const fixedEnd = spacing === "fixed";

    if (shape === "slim_single") {
        return slimSinglePerSection(doorWidth, fixedEnd, singleEndcap);
    }

    if (shape === "slim_double") {
        return slimDoublePerSection(doorWidth, fixedEnd, singleEndcap);
    }

    return 0;
}


/* ==========================================================
   5) WINDOW SECTIONS
========================================================== */

/* Original setWindowPositions */
export function getEnabledWindows(count, sectionIndex, position, isSlim) {

    const enabled = Array(count).fill(false);

    if (!count) {
        return enabled;
    }

    switch (position) {

        case "top":
            if (sectionIndex === 0) {
                if (isSlim) {
                    enabled[Math.floor(count / 2)] = true;
                } else {
                    enabled.fill(true);
                }
            }
            break;

        case "left":
            enabled[0] = true;
            break;

        case "center": {
            const middle = Math.floor(count / 2);
            enabled[middle] = true;
            if (!isSlim && count % 2 === 0) {
                enabled[middle - 1] = true;
            }
            break;
        }

        case "right":
            enabled[count - 1] = true;
            break;

        case "both":
            enabled[0] = true;
            enabled[count - 1] = true;
            break;

        default:
            break;
    }

    return enabled;
}

/* Original WINDOW_STATE. Sections are ordered TOP -> BOTTOM.
   numOfPanels / numOfWindows = NUM_OF_PANELS / NUM_OF_WINDOWS:
   the special value switches getPanelPositions to rule.special. */
export function buildWindowSections({
    panelStyle,
    glassShape,
    width,
    height,
    sectionCount,
    sectionHeights,
    windowPosition,
    customWindows = [],
    slimSections = [],
    selectedSlimSection = null,
    singleEndcap = true,
    numOfPanels = 0,
    numOfWindows = 0
}) {

    if (!glassShape) {
        return [];
    }

    const face = getFaceDesc(panelStyle);
    const isFlush = face === "flush" || face === "plank";
    const isGrand = glassShape.includes("grand");
    const isSlim = glassShape.includes("slim");
    const special = isSpecialFace(panelStyle, glassShape);

    const selectedPanels = Number(numOfPanels) || 0;
    const selectedWindows = Number(numOfWindows) || 0;

    // Grand and special faces are always forced to TOP
    const effectivePosition = (isGrand || special) ? "top" : windowPosition;

    const isCustom = effectivePosition === "custom";

    let windowShape;

    if (isGrand) {
        windowShape = "window_gv";
    } else if (isSlim || isFlush || special) {
        windowShape = glassShape;
    } else {
        windowShape = getFacePanelType(panelStyle);
    }

    const getPositions = (shape, useSpecial) => getPanelPositions({
        panelType: shape,
        doorWidth: width,
        face: panelStyle,
        glassShape,
        selectedPanels,
        selectedWindows,
        special: useSpecial
    });

    // Saved custom windows are kept only while the window count is unchanged
    const getSaved = (index, length) => {

        const saved = customWindows[index];

        if (isCustom && Array.isArray(saved) && saved.length === length) {
            return [...saved];
        }

        return null;
    };

    const sections = [];

    let ypos = 0;

    for (let i = 0; i < sectionCount; i++) {

        const sectionHeight = sectionHeights[i] || (height / sectionCount);

        let shape = windowShape;
        let positions;
        let enabled;
        let slimOne = false;
        let slimSpacing = "even";

        if (special) {

            /* Special face: top section gets the glass layout,
               other sections keep the face layout (special spacing) */
            shape = i === 0 ? glassShape : getFacePanelType(panelStyle);
            positions = getPositions(shape, true);
            enabled = Array(positions.length).fill(i === 0);

        } else if (isSlim) {

            if (isCustom) {

                const config = getSlimSectionConfig(slimSections, i, glassShape);

                shape = config.shape;
                slimOne = config.slimOne;
                slimSpacing = config.spacing;

                positions = getSlimSectionPositions(config, width, singleEndcap);

                enabled =
                    getSaved(i, positions.length) ||
                    Array(positions.length).fill(false);

            } else {

                // Left / Center / Right / Both use the 3-slot layout
                shape = glassShape;
                positions = getSlimFixedPositions(glassShape, width, singleEndcap);
                enabled = getEnabledWindows(positions.length, i, effectivePosition, true);
            }

        } else {

            positions = getPositions(shape, false);

            enabled =
                getSaved(i, positions.length) ||
                getEnabledWindows(positions.length, i, effectivePosition, false);
        }

        const dimensions = getPanelDimensions(shape) || {
            panelWidth: 0,
            panelHeight: 0
        };

        sections.push({
            shape,
            positions,
            enabled,
            panel_width: dimensions.panelWidth,
            panel_height: dimensions.panelHeight,
            height: sectionHeight,
            ypos,
            slim_one: slimOne,
            slim_spacing: slimSpacing,
            selected: isSlim && isCustom && selectedSlimSection === i
        });

        ypos += sectionHeight;
    }

    return sections;
}
