import {
    availableColors,
    optionalColors,
    silverColor
} from "../../Data/colors";

import {
    getSectionHeights
} from "./canvasGeometry";

import {
    getTextureImage
} from "./canvasTextureUtils";

import {
    buildWindowSections,
    getFaceDesc,
    isSpecialFace,
    getHintsVisible,
    getMaxSlimWindowQty
} from "./canvasWindowLayout";

/* ==========================================
   CANVAS CONSTANTS (same values as DoorCanvas)
========================================== */

export const CANVAS_WIDTH = 900;
export const CANVAS_HEIGHT = 700;

const MAX_DOOR_WIDTH = 700;
const MAX_DOOR_HEIGHT = 500;

const ALL_COLORS = [
    ...availableColors,
    ...optionalColors,
    silverColor
];

/* ==========================================
   HELPERS
========================================== */

export function findColor(value) {
    return ALL_COLORS.find(
        color => color.value === value
    ) || null;
}

export function getScale(doorWidth, doorHeight) {
    return Math.min(
        MAX_DOOR_WIDTH / doorWidth,
        MAX_DOOR_HEIGHT / doorHeight
    );
}

export function getCanvasDoorPosition(doorWidth, doorHeight) {

    const scale = getScale(doorWidth, doorHeight);

    const x = (CANVAS_WIDTH - doorWidth * scale) / 2;
    const y = (CANVAS_HEIGHT - doorHeight * scale) / 2;

    return [x, y];
}

export function getPatternScale(finish, selectedColor) {

    let patternScale = 0.04;

    // Woodgrain (Honey Cedar, Cocoa Hickory)
    if (selectedColor === "X" || selectedColor === "Y") {
        patternScale = 0.05;
    }

    // Stucco
    if (finish === "S") {
        patternScale = 0.005;
    }

    return patternScale;
}

/* ==========================================
   TEMPERED GLASS (original isTempGlassSection)
   Sections are TOP -> BOTTOM, so bottom = last index
========================================== */

export function isTempGlassSection(
    temperedGlass,
    sectionIndex,
    totalSections
) {

    if (!temperedGlass) {
        return false;
    }

    if (temperedGlass === "all") {
        return true;
    }

    if (temperedGlass === "bottom_1") {
        return sectionIndex === totalSections - 1;
    }

    if (temperedGlass === "bottom_2") {
        return (
            sectionIndex === totalSections - 1 ||
            sectionIndex === totalSections - 2
        );
    }

    return false;
}

/* ==========================================
   GET DOOR INFO (original getDoorInfo)
========================================== */

export function getDoorInfo({
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
    customWindows = [],

    slimSections = [],
    selectedSlimSection = null,

    temperedGlass = "",

    activeTab,

    // Not built in React yet – defaults match the original
    singleEndcap = true
}) {

    const sectionCount = Number(numOfSections) || 4;

    const shape = glassShape || "";

    const face = getFaceDesc(panelStyle);

    const special = isSpecialFace(panelStyle, shape);

    const scale = getScale(width, height);

    const [xpos, ypos] = getCanvasDoorPosition(width, height);

    const sectionHeights = getSectionHeights(height, sectionCount);

    /* ---------- Window sections ---------- */

    let windowSections = buildWindowSections({
        panelStyle,
        glassShape: shape,
        width,
        height,
        sectionCount,
        sectionHeights,
        windowPosition,
        customWindows,
        slimSections,
        selectedSlimSection,
        singleEndcap
    });

    // No glass: still return one entry per section (like the original)
    if (!windowSections.length) {

        let sum = 0;

        windowSections = Array.from(
            { length: sectionCount },
            (_, i) => {

                const sectionHeight =
                    sectionHeights[i] || (height / sectionCount);

                const section = {
                    shape: "",
                    positions: [],
                    enabled: [],
                    panel_width: 0,
                    panel_height: 0,
                    height: sectionHeight,
                    ypos: sum,
                    slim_one: false,
                    slim_spacing: "even",
                    selected: false
                };

                sum += sectionHeight;

                return section;
            }
        );
    }

    const totalSections = windowSections.length;

    /* ---------- Per-section quantities ---------- */

    const sections = windowSections.map((section, i) => {

        const enabled = Array.isArray(section.enabled)
            ? [...section.enabled]
            : [];

        const selectedQty =
            enabled.filter(v => v === true).length;

        const isTemp = isTempGlassSection(
            temperedGlass,
            i,
            totalSections
        );

        return {
            ...section,

            enabled,

            glass_qty: isTemp ? 0 : selectedQty,
            temp_glass_qty: isTemp ? selectedQty : 0,

            slim_single_glass_qty:
                section.shape === "slim_single" ? selectedQty : 0,

            slim_double_glass_qty:
                section.shape === "slim_double" ? selectedQty : 0,

            // Mixed is not built in React yet
            mixed_panels: [],
            mixed_colonial_qty: 0,
            mixed_ranch_qty: 0,

            max_window_qty: getMaxSlimWindowQty(
                section.shape,
                width,
                section.slim_spacing || "even",
                singleEndcap
            )
        };
    });

    /* ---------- Totals ---------- */

    const sumOf = key =>
        sections.reduce(
            (total, section) => total + Number(section[key] || 0),
            0
        );

    const totals = face === "mixed"
        ? {
            total_colonial_glass_qty: sumOf("mixed_colonial_qty"),
            total_ranch_glass_qty: sumOf("mixed_ranch_qty")
        }
        : {
            total_glass_qty: sumOf("glass_qty"),
            total_temp_glass_qty: sumOf("temp_glass_qty"),
            total_slim_single_glass_qty: sumOf("slim_single_glass_qty"),
            total_slim_double_glass_qty: sumOf("slim_double_glass_qty")
        };

    /* ---------- Colors ---------- */

    const doorColorObj = findColor(selectedColor);
    const frameColorObj = findColor(frameColor) || doorColorObj;
    const insertColorObj = findColor(insertColor) || doorColorObj;

    /* ---------- Insert (slim has no insert) ---------- */

    const insert = shape.includes("slim")
        ? ""
        : (glassInsert || "");

    /* ---------- Result ---------- */

    return {
        xpos,
        ypos,

        door_width: width,
        door_height: height,
        num_sections: sectionCount,

        special_panel_config: special,
        glass_shape: shape,

        background: {
            color: doorColorObj?.hex || "#d9d9d9",
            pattern_url: getTextureImage(finish, selectedColor),
            pattern_scale: getPatternScale(finish, selectedColor),
            frame_color: frameColorObj?.hex || "#d9d9d9",
            insert_color: insertColorObj?.hex || "#d9d9d9"
        },

        insert,

        sections,

        ...totals,

        scale,
        face,

        misc: {
            labels: true
        },

        draw_hints: getHintsVisible({
            activeTab,
            panelStyle,
            glassShape: shape,
            windowPosition
        }),

        window_position: windowPosition,
        custom_windows: windowPosition === "custom"
    };
}
