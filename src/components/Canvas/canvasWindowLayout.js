import {
    getPanelDimensions,
    getPanelPositions
} from "./canvasGeometry";

/* ==========================================
   FACE MAP (original FACE_desc)
========================================== */

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

/* ==========================================
   SPECIAL FACE (original SPECIAL_FACE node)
   e.g. Colonial door + Ranch glass
========================================== */

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

/* ==========================================
   PANEL TYPE USED BY THE DOOR FACE
========================================== */

export function getFacePanelType(panelStyle) {
    return (panelStyle === "C" || panelStyle === "B")
        ? "colonial"
        : "ranch";
}

/* ==========================================
   HINTS VISIBLE (original getDoorInfo hint rules)
   - Non-flush panels: ON by default
   - Flush / Plank with Colonial or Ranch glass: only in custom
   - Grand / special: never
========================================== */

export function getHintsVisible({
    activeTab,
    panelStyle,
    glassShape,
    windowPosition
}) {

    const shape = glassShape || "";

    if (!shape || activeTab !== "glazing") {
        return false;
    }

    if (
        shape.includes("grand") ||
        isSpecialFace(panelStyle, shape)
    ) {
        return false;
    }

    const face = getFaceDesc(panelStyle);
    const isFlush = face === "flush" || face === "plank";

    if (
        isFlush &&
        (shape === "colonial" || shape === "ranch") &&
        windowPosition !== "custom"
    ) {
        return false;
    }

    return true;
}

/* ==========================================
   CAN CLICK WINDOWS (original click.canvasFix)
   - Same as hints
   - Slim windows: only in custom
========================================== */

export function getCanSelectWindows({
    activeTab,
    panelStyle,
    glassShape,
    windowPosition
}) {

    if (
        !getHintsVisible({
            activeTab,
            panelStyle,
            glassShape,
            windowPosition
        })
    ) {
        return false;
    }

    if (
        (glassShape || "").includes("slim") &&
        windowPosition !== "custom"
    ) {
        return false;
    }

    return true;
}

/* ==========================================
   SLIM CONSTANTS
========================================== */

const SLIM_SINGLE_WIDTH = 34.344;
const SLIM_DOUBLE_WIDTH = 68.344;
const ENDCAP_SINGLE = 4.8125;
const ENDCAP_DOUBLE = 7.8125;

/* ==========================================
   SLIM QUANTITY RULES (original slim_* functions)
========================================== */

function findQty(rules, widthIn) {

    const rule = rules.find(
        r => widthIn >= r.min && widthIn <= r.max
    );

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

/* original slim_window_locationsx_in */

function slimWindowLocations(widthIn, windowIn, numWindows, fixedOffsetIn) {

    const spacingFixed =
        (widthIn - 2 * fixedOffsetIn - windowIn) / (numWindows - 1);

    const spacingEven =
        (widthIn - numWindows * windowIn) / (numWindows + 1) + windowIn;

    const offsetEven = spacingEven - windowIn;

    const offset = fixedOffsetIn === 0
        ? offsetEven
        : fixedOffsetIn;

    let spacing = fixedOffsetIn === 0
        ? spacingEven
        : spacingFixed;

    if (isNaN(spacing) || !isFinite(spacing)) {
        spacing = 0;
    }

    const results = [];

    for (let i = 0; i < numWindows; i++) {
        results.push(offset + i * spacing);
    }

    return results;
}

/* ==========================================
   SLIM HELPERS
========================================== */

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

export function getSlimFixedPositions(
    shape,
    doorWidth,
    singleEndcap = true
) {

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

export function getSlimSectionConfig(
    slimSections,
    index,
    glassShape
) {

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

export function getSlimSectionPositions(
    config,
    doorWidth,
    singleEndcap = true
) {

    if (config.slimOne) {
        return getSlimFixedPositions(
            config.shape,
            doorWidth,
            singleEndcap
        );
    }

    return getSlimWindowPositions(
        config.shape,
        doorWidth,
        config.spacing === "fixed",
        singleEndcap
    );
}

/* ==========================================
   MAX SLIM WINDOW QTY (original getMaxSlimWindowQty)
========================================== */

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

/* ==========================================
   ENABLED WINDOWS (original setWindowPositions)
========================================== */

export function getEnabledWindows(
    count,
    sectionIndex,
    position,
    isSlim
) {

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

/* ==========================================
   BUILD WINDOW SECTIONS (original WINDOW_STATE)
   Sections are ordered TOP -> BOTTOM

   numOfPanels / numOfWindows = NUM_OF_PANELS / NUM_OF_WINDOWS.
   When the special value is selected, getPanelPositions
   switches to rule.special (qty + mutt spacing), exactly
   like the original getPanelPositions().
========================================== */

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

    const effectivePosition =
        (isGrand || special)
            ? "top"
            : windowPosition;

    const isCustom = effectivePosition === "custom";

    let windowShape;

    if (isGrand) {
        windowShape = "window_gv";
    } else if (isSlim || isFlush || special) {
        windowShape = glassShape;
    } else {
        windowShape = getFacePanelType(panelStyle);
    }

    const getPositions = (shape, useSpecial) => {

        return getPanelPositions({
            panelType: shape,
            doorWidth: width,
            face: panelStyle,
            glassShape,
            selectedPanels,
            selectedWindows,
            special: useSpecial
        });
    };

    const getSaved = (index, length) => {

        const saved = customWindows[index];

        if (
            isCustom &&
            Array.isArray(saved) &&
            saved.length === length
        ) {
            return [...saved];
        }

        return null;
    };

    const sections = [];

    let ypos = 0;

    for (let i = 0; i < sectionCount; i++) {

        const sectionHeight =
            sectionHeights[i] || (height / sectionCount);

        let shape = windowShape;
        let positions;
        let enabled;

        let slimOne = false;
        let slimSpacing = "even";

        if (special) {

            /* -------- Special face -------- */

            // Top section gets the glass layout,
            // other sections keep the face layout (special spacing)

            shape = i === 0
                ? glassShape
                : getFacePanelType(panelStyle);

            positions = getPositions(shape, true);

            enabled = Array(positions.length).fill(i === 0);

        } else if (isSlim) {

            /* -------- Slim -------- */

            if (isCustom) {

                const config = getSlimSectionConfig(
                    slimSections,
                    i,
                    glassShape
                );

                shape = config.shape;
                slimOne = config.slimOne;
                slimSpacing = config.spacing;

                positions = getSlimSectionPositions(
                    config,
                    width,
                    singleEndcap
                );

                enabled =
                    getSaved(i, positions.length) ||
                    Array(positions.length).fill(false);

            } else {

                // Left / Center / Right / Both use the 3-slot layout

                shape = glassShape;

                positions = getSlimFixedPositions(
                    glassShape,
                    width,
                    singleEndcap
                );

                enabled = getEnabledWindows(
                    positions.length,
                    i,
                    effectivePosition,
                    true
                );
            }

        } else {

            /* -------- Normal -------- */

            // Saved custom windows are kept only while the
            // window count is unchanged; switching NUM_OF_PANELS /
            // NUM_OF_WINDOWS changes the count, so the position
            // defaults are re-applied (original WINDOW_STATE).

            positions = getPositions(shape, false);

            enabled =
                getSaved(i, positions.length) ||
                getEnabledWindows(
                    positions.length,
                    i,
                    effectivePosition,
                    false
                );
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
