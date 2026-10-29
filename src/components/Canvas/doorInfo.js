/* ==========================================================
   DOOR INFO (JSON_OBJ)
   React replacement for the old getDoorInfo().
   Builds the door object that is saved to EW as JSON_OBJ
   and used by the glazing / section bundle drivers.
   Uses the same layout as the canvas, so JSON_OBJ always
   matches what is drawn.
========================================================== */

import {
    getDoorScale,
    getDoorPosition,
    getSectionHeights,
    buildWindowSections,
    getFaceDesc,
    isSpecialFace,
    getHintsVisible,
    getMaxSlimWindowQty
} from "./canvasLayout";

import {
    findColor,
    getTextureImage,
    getPatternScale
} from "./canvasDoor";

/* ==========================================
   TEMPERED GLASS (original isTempGlassSection)
   React sections are TOP -> BOTTOM, so the bottom
   section is the last index.
========================================== */

export function isTempGlassSection(temperedGlass, sectionIndex, totalSections) {

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
   EMPTY SECTIONS
   Old WINDOW_STATE always contained one object
   for every section, even when no glass was chosen.
========================================== */

function buildEmptySections({ height, sectionCount, sectionHeights }) {

    let ypos = 0;

    return Array.from({ length: sectionCount }, (_, index) => {

        const sectionHeight =
            sectionHeights[index] || Number(height) / sectionCount;

        const section = {
            selected: false,
            slim_one: false,
            slim_position_mode: false,
            slim_spacing: "even",
            shape: "",
            positions: [],
            enabled: [],
            panel_width: 0,
            panel_height: 0,
            glass_qty: 0,
            temp_glass_qty: 0,
            slim_single_glass_qty: 0,
            slim_double_glass_qty: 0,
            mixed_panels: [],
            mixed_colonial_qty: 0,
            mixed_ranch_qty: 0,
            max_window_qty: 0,
            height: sectionHeight,
            ypos
        };

        ypos += sectionHeight;

        return section;
    });
}

/* ==========================================
   NORMALIZE SECTION
   Ensures the JSON contains the fields expected
   by the legacy RENDER / JSON_OBJ consumers.
========================================== */

function normalizeSection({
    section,
    index,
    totalSections,
    width,
    singleEndcap,
    temperedGlass,
    selectedSlimSection
}) {

    const enabled = Array.isArray(section.enabled) ? [...section.enabled] : [];
    const positions = Array.isArray(section.positions) ? [...section.positions] : [];

    const selectedQty = enabled.filter(value => value === true).length;

    const isTempered = isTempGlassSection(temperedGlass, index, totalSections);

    const sectionShape = section.shape || "";

    return {
        ...section,

        selected: section.selected === true || selectedSlimSection === index,
        slim_one: !!section.slim_one,
        slim_position_mode: !!section.slim_position_mode,
        slim_spacing: section.slim_spacing || "even",

        shape: sectionShape,
        positions,
        enabled,

        panel_width: Number(section.panel_width) || 0,
        panel_height: Number(section.panel_height) || 0,

        glass_qty: isTempered ? 0 : selectedQty,
        temp_glass_qty: isTempered ? selectedQty : 0,
        slim_single_glass_qty: sectionShape === "slim_single" ? selectedQty : 0,
        slim_double_glass_qty: sectionShape === "slim_double" ? selectedQty : 0,

        // Mixed is not fully built yet – keep values another helper assigned
        mixed_panels: Array.isArray(section.mixed_panels) ? section.mixed_panels : [],
        mixed_colonial_qty: Number(section.mixed_colonial_qty) || 0,
        mixed_ranch_qty: Number(section.mixed_ranch_qty) || 0,

        max_window_qty: getMaxSlimWindowQty(
            sectionShape,
            width,
            section.slim_spacing || "even",
            singleEndcap
        ),

        height: Number(section.height) || 0,
        ypos: Number(section.ypos) || 0
    };
}

/* ==========================================
   GET DOOR INFO
========================================== */

export function getDoorInfo({
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
    customWindows = [],
    slimSections = [],
    selectedSlimSection = null,
    temperedGlass = "",
    activeTab,
    singleEndcap = true
}) {

    const doorWidth = Number(width) || 0;
    const doorHeight = Number(height) || 0;
    const sectionCount = Number(numOfSections) || 4;
    const shape = glassShape || "";

    const face = getFaceDesc(panelStyle);
    const special = isSpecialFace(panelStyle, shape);

    const scale = getDoorScale(doorWidth, doorHeight);
    const [xpos, ypos] = getDoorPosition(doorWidth, doorHeight);

    const sectionHeights = getSectionHeights(doorHeight, sectionCount);

    /* ---------- Window sections ---------- */

    let windowSections = buildWindowSections({
        panelStyle,
        glassShape: shape,
        width: doorWidth,
        height: doorHeight,
        sectionCount,
        sectionHeights,
        windowPosition,
        customWindows,
        slimSections,
        selectedSlimSection,
        singleEndcap,
        numOfPanels,
        numOfWindows
    });

    // No glass still needs one section object per door section
    if (!Array.isArray(windowSections) || windowSections.length === 0) {
        windowSections = buildEmptySections({
            height: doorHeight,
            sectionCount,
            sectionHeights
        });
    }

    const totalSections = windowSections.length;

    /* ---------- Per-section quantities ---------- */

    const sections = windowSections.map((section, index) =>
        normalizeSection({
            section,
            index,
            totalSections,
            width: doorWidth,
            singleEndcap,
            temperedGlass,
            selectedSlimSection
        })
    );

    /* ---------- Totals ---------- */

    const sumOf = key =>
        sections.reduce((total, section) => total + Number(section[key] || 0), 0);

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

    /* ---------- Colours ---------- */

    const doorColorObj = findColor(selectedColor);
    const frameColorObj = findColor(frameColor) || doorColorObj;
    const insertColorObj = findColor(insertColor) || doorColorObj;

    /* ---------- Insert ----------
       Old format: { value, insertCode }. Slim glass has no insert. */

    let insert = "";

    if (!shape.includes("slim") && glassInsert) {
        insert = typeof glassInsert === "object" && glassInsert !== null
            ? { ...glassInsert }
            : { value: glassInsert, insertCode: "" };
    }

    /* ---------- Result ---------- */

    return {
        // Old JSON_OBJ had the last mouse position – not needed for BOM
        mouse_x: 0,
        mouse_y: 0,

        xpos,
        ypos,
        door_width: doorWidth,
        door_height: doorHeight,
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

        // Same rule as the dotted hints on the canvas
        draw_hints: getHintsVisible({
            activeTab,
            panelStyle,
            glassShape: shape,
            windowPosition
        }),

        // React value – used by the canvas and restore logic
        window_position: windowPosition,

        // Old CUSTOM_WINDOWS was a boolean
        custom_windows: windowPosition === "custom"
    };
}

/* ==========================================
   JSON_OBJ
========================================== */

export function getJsonObj(doorInfo) {

    if (!doorInfo) {
        return "";
    }

    try {
        return JSON.stringify(doorInfo);
    } catch (error) {
        console.error("Unable to create JSON_OBJ:", error);
        return "";
    }
}
