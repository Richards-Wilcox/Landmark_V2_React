/* ==========================================================
   EW SYNC
   Everything that reads or writes EW / ConfigureOne inputs.

   1) DOM BRIDGE
      React never renders the EW inputs. It only:
      - READS current values of EW inputs  (readEwValue)
      - WRITES calculated values into them (writeEwValue / writeEwValues)
      - keeps them in sync on every change (useEwSync)

   2) INPUT_JSON STORAGE (React port of MAINTAIN_INPUTS_LM.js)
      - saveInputValues()  -> every configurator input as JSON
                              into INPUT_JSON_1..4 (4000-char chunks)
      - saveOutputValues() -> other EW inputs into OUTPUT_JSON chunks
      - loadInputValues()  -> read the JSON back into React state
      - loadOutputValues() -> put OUTPUT_JSON back into the EW inputs
      Same JSON format ({ id, value, desc, text }) and same ids,
      so configurations saved by the old configurator still load.
      Extra React-only ids (ignored by the old code):
        CUSTOM_WINDOWS, SLIM_SECTIONS, LAST_WINDOW_POSITION
========================================================== */

import { useEffect } from "react";

import {
    availableColors,
    optionalColors,
    silverColor
} from "../Data/colors";

import {
    HARDWARE_SETS,
    SPRING_TYPES,
    SPRING_CYCLES,
    INCLINED_TRACK_OPTIONS,
    LIFT_TYPES,
    JAMB_SEALS,
    HANGER_ANGLES,
    DEFAULT_HARDWARE,
    applyHardwareRules
} from "../Data/hardwareData";

import {
    DEFAULT_OPERATOR,
    OPERATOR_OPTIONS,
    OPERATOR_BRACKETS,
    OPERATOR_ACCESSORIES,
    getOperatorEwValues
} from "../Data/operatorData";


/* ##########################################################
   1) DOM BRIDGE
########################################################## */

// true -> log each missing EW id once (console.info)
const EW_SYNC_DEBUG = false;

const reportedMissing = new Set();

const escape = (value) =>
    window.CSS && CSS.escape
        ? CSS.escape(String(value))
        : String(value).replace(/"/g, '\\"');

/* ----------------------------------------------------------
   READ: current value of an EW input (like getState)
   Returns null if the input is not on the page.
---------------------------------------------------------- */

export function readEwValue(id) {

    const element = document.getElementById(id);

    if (element) {

        const tag = element.tagName;
        const type = (element.getAttribute("type") || "").toLowerCase();

        if (tag === "INPUT" && type === "checkbox") {
            return element.checked ? (element.value || "Y") : "";
        }

        if (tag === "INPUT" && type === "radio") {
            return element.checked ? element.value : "";
        }

        if (
            tag === "INPUT" ||
            tag === "SELECT" ||
            tag === "TEXTAREA" ||
            tag === "OPTION"
        ) {
            return element.value;
        }

        return element.innerText;
    }

    const radios = document.querySelectorAll(
        `input[type="radio"][name="${escape(id)}"]`
    );

    if (!radios.length) {
        return null;
    }

    const checked = Array.from(radios).find(radio => radio.checked);

    return checked ? checked.value : "";
}

/* ----------------------------------------------------------
   WRITE: one value into one EW input
   Returns true if changed, false if unchanged, null if not found.
---------------------------------------------------------- */

export function writeEwValue(id, value, { fireChange = false } = {}) {

    const text =
        value === null || value === undefined
            ? ""
            : String(value);

    const element = document.getElementById(id);

    /* No element with this id: try a radio group with this name */

    if (!element) {

        const radios = document.querySelectorAll(
            `input[type="radio"][name="${escape(id)}"]`
        );

        if (!radios.length) {
            return null;
        }

        let changed = false;

        radios.forEach(radio => {

            const shouldCheck = radio.value === text;

            if (radio.checked !== shouldCheck) {
                radio.checked = shouldCheck;
                changed = true;
            }
        });

        if (changed && fireChange) {
            radios[0].dispatchEvent(new Event("change", { bubbles: true }));
        }

        return changed;
    }

    const tag = element.tagName;
    const type = (element.getAttribute("type") || "").toLowerCase();

    let changed = false;

    if (tag === "INPUT" && (type === "radio" || type === "checkbox")) {

        const shouldCheck =
            text === element.value ||
            text === "Y" ||
            text === "true";

        if (element.checked !== shouldCheck) {
            element.checked = shouldCheck;
            changed = true;
        }

    } else if (
        tag === "INPUT" ||
        tag === "SELECT" ||
        tag === "TEXTAREA" ||
        tag === "OPTION"
    ) {

        if (element.value !== text) {
            element.value = text;
            changed = true;
        }

    } else {

        if (element.innerText !== text) {
            element.innerText = text;
            changed = true;
        }
    }

    if (changed && fireChange) {
        element.dispatchEvent(new Event("change", { bubbles: true }));
    }

    return changed;
}

/* ----------------------------------------------------------
   BATCH WRITE: used by the Configure button
   Returns the list of ids that were not found on the page.
---------------------------------------------------------- */

export function writeEwValues(values, options = {}) {

    const missing = [];

    Object.entries(values).forEach(([id, value]) => {

        if (writeEwValue(id, value, options) === null) {
            missing.push(id);
        }
    });

    return missing;
}

/* ----------------------------------------------------------
   HOOK: keep EW inputs in sync with live React values
---------------------------------------------------------- */

export function useEwSync(values, options = {}) {

    useEffect(() => {

        const missing = writeEwValues(values, options);

        // Console access (like getState in React-Wilcox)
        window.EW_LIVE_VALUES = values;
        window.EW_MISSING_IDS = missing;

        if (!EW_SYNC_DEBUG || !missing.length) {
            return;
        }

        const newMissing = missing.filter(id => !reportedMissing.has(id));

        newMissing.forEach(id => reportedMissing.add(id));

        if (newMissing.length) {
            console.info(
                "EW inputs not found (React-only, not written):",
                newMissing
            );
        }

    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [values]);
}

/* ----------------------------------------------------------
   Node-aware access (used by INPUT_JSON / OUTPUT_JSON)
   Also checks document.ui and window.nodeset, like the
   old MAINTAIN_INPUTS_LM.js.
---------------------------------------------------------- */

function getEwElement(id) {
    return document.getElementById(id) || document.ui?.[id] || null;
}

function getEwValue(id) {

    const element = getEwElement(id);

    if (element && "value" in element) {
        return element.value || "";
    }

    return window.nodeset?.[id]?.value || "";
}

// Same as the old code: set the value, no change event
function setEwValue(id, value) {

    const element = getEwElement(id);

    if (element && "value" in element) {
        element.value = value;
    }

    if (window.nodeset?.[id]) {
        window.nodeset[id].value = value;
    }
}


/* ##########################################################
   2) INPUT_JSON STORAGE
########################################################## */

/* ---------- EW fields ---------- */

const INPUT_JSON_READ_FIELDS = [
    "INPUT_JSON",
    "INPUT_JSON_1",
    "INPUT_JSON_2",
    "INPUT_JSON_3",
    "INPUT_JSON_4"
];

const INPUT_JSON_WRITE_FIELDS = [
    "INPUT_JSON_1",
    "INPUT_JSON_2",
    "INPUT_JSON_3",
    "INPUT_JSON_4"
];

const CHUNK_SIZE = 4000;

const ALL_COLORS = [
    ...availableColors,
    ...optionalColors,
    silverColor
];

/* ---------- Labels / desc (same as the old radio labels + desc attributes) ---------- */

const DOOR_MODELS = {
    A: { text: "Classic L138", desc: "Cls" },
    D: { text: "Premium L200", desc: "Prem" },
    G: { text: "Grandview L200GV", desc: "Grd" }
};

const SIZES = {
    "0": { text: "8x7", width: 8, height: 7 },
    "1": { text: "9x7", width: 9, height: 7 },
    "2": { text: "16x7", width: 16, height: 7 },
    "3": { text: "8x8", width: 8, height: 8 },
    "4": { text: "9x8", width: 9, height: 8 },
    "5": { text: "16x8", width: 16, height: 8 }
};

const FACES = {
    R: { text: "Raised Ranch", desc: "Rnc" },
    F: { text: "Flush", desc: "Fls" },
    C: { text: "Raised Colonial", desc: "Col" },
    S: { text: "Recessed grooved Ranch", desc: "RncGc" },
    B: { text: "Recessed grooved Colonial", desc: "ColGc" },
    T: { text: "Recessed Ranch", desc: "RncSc" },
    V: { text: "Plank", desc: "Plk" },
    M: { text: "Mixed", desc: "mixed" }
};

const FINISHES = {
    W: { text: "Woodgrain" },
    S: { text: "Stucco" }
};

const GLASS_SHAPES = {
    colonial: { text: "Colonial" },
    ranch: { text: "Ranch" },
    slim_single: { text: "Slim" },
    slim_double: { text: "Slim Double" },
    grand_wrought_iron_rectangle: { text: "Grand Wrought Iron - Rectangle" },
    grand_wrought_iron_double_arched: { text: "Grand Wrought Iron - Double Arched" },
    grand_44_rectangle: { text: "Grand 4/4 - Rectangle" },
    grand_44_double_arched: { text: "Grand 4/4 - Double Arched" },
    grand_4_pane_rectangle: { text: "Grand 4 Pane - Rectangle" },
    grand_4_pane_double_arched: { text: "Grand 4 Pane - Double Arched" },
    grand_clear_rectangle: { text: "Grand Clear - Rectangle" },
    grand_clear_double_arched: { text: "Grand Clear - Double Arched" }
};

// glazingType = old "glazingtype" attribute (saved as GLAZING_TYPE)
const GLASS_TYPES = {
    CLEAR: { text: "Clear Sealed", glazingType: "double" },
    CLEAR_SINGLE: { text: "Clear Single", glazingType: "single" },
    SATIN: { text: "Satin", glazingType: "double" },
    OBSCURE_GLASS_PINHEAD: { text: "Obscure Pinhead Sealed", glazingType: "double" },
    OBSCURE_GLASS_SINGLE: { text: "Obscure Pinhead Single", glazingType: "single" },
    DARK_TINT_SEALED: { text: "Dark Tint - Sealed", glazingType: "double" },
    DARK_TINT_SINGLE: { text: "Dark Tint - Single", glazingType: "single" },
    BLACK_SATIN_SEALED: { text: "Black Satin - Sealed", glazingType: "double" }
};

const GLASS_INSERTS = {
    stockton_colonial: "Stockton",
    waterton_colonial: "Waterton",
    stockton_ranch: "Stockton",
    waterton_ranch: "Waterton",
    prairie: "Prairie",
    cascade_colonial: "Cascade",
    cascade_ranch: "Cascade",
    arched_stockton: "Arched Stockton",
    stockbridge: "Stockbridge",
    arched_stockbridge: "Arched Stockbridge",
    alum_stockton_4: "Aluminum Grid - Stockton 4",
    alum_stockton_6: "Aluminum Grid - Stockton 6",
    alum_prairie: "Aluminum Grid - Prairie",
    alum_stockton_10: "Aluminum Grid - Stockton 10",
    square_bar_stockton_4: "Square Bar - Stockton 4",
    square_bar_stockton_6: "Square Bar - Stockton 6",
    square_bar_prairie: "Square Bar - Prairie",
    round_bar_stockton_4: "Round Bar - Stockton 4",
    round_bar_stockton_6: "Round Bar - Stockton 6",
    round_bar_prairie: "Round Bar - Prairie",
    square_bar_stockton_10: "Square Bar - Stockton 10",
    round_bar_stockton_10: "Round Bar - Stockton 10",
    arched_stockton_3: "Arched Stockton 3pc Set",
    arched_stockbridge_3: "Arched Stockbridge 3pc Set",
    arched_stockton_4: "Berkshire",
    arched_stockbridge_4: "Breckenridge"
};

const GLASS_TEMPERED = {
    all: { text: "All" },
    bottom_1: { text: "Bottom" },
    bottom_2: { text: "Bottom 2" }
};

const WINDOW_POSITIONS = {
    top: { text: "Top", desc: "Top" },
    left: { text: "Left", desc: "Left" },
    center: { text: "Center", desc: "Center" },
    right: { text: "Right", desc: "Right" },
    both: { text: "Both", desc: "Both" },
    custom: { text: "Custom", desc: "Custom" }
};

// React value <-> old PRODUCT_TYPE value
const PRODUCT_TYPES = {
    complete: { value: "COMPLETE_DOOR", text: "Complete Door" },
    assemble: { value: "ASSEMBLED_PANEL", text: "Assembled Panel" },
    raw: { value: "RAW_PANEL", text: "Raw Panel" }
};

const listToMap = (list) =>
    list.reduce((map, item) => ({ ...map, [item.value]: { text: item.label } }), {});

const HARDWARE_LABELS = {
    HARDWARE_SET: listToMap(HARDWARE_SETS),
    SPRING_TYPE: listToMap(SPRING_TYPES),
    SPRING_CYCLE: listToMap(SPRING_CYCLES),
    INCLINED_TRACK: listToMap(INCLINED_TRACK_OPTIONS),
    LIFT_TYPE: listToMap(LIFT_TYPES),
    JAMB_SEAL: listToMap(JAMB_SEALS),
    HANGER_ANGLE: listToMap(HANGER_ANGLES)
};

/* ---------- Operator labels (text shown in the old selects) ---------- */

const OPERATOR_LABELS = OPERATOR_OPTIONS.reduce(
    (map, option) => ({ ...map, [option.value]: { text: option.name } }),
    {}
);

const BRACKET_LABELS = listToMap(OPERATOR_BRACKETS);

const ACCESSORY_LABELS = OPERATOR_ACCESSORIES.reduce((map, item) => ({
    ...map,
    [item.id]: item.options.reduce(
        (labels, option) => ({ ...labels, [option.value]: { text: option.label } }),
        { NONE: { text: item.noneLabel } }
    )
}), {});

/* ---------- Advanced + annotation inputs ----------
   Keep these ids identical to the original HTML/EW inputs.
   jambSealColorUserOverride is React-only UI state – not saved. */

export const DEFAULT_ADVANCED_OPTIONS = {
    DOOROPT: "COMPLETEDOOR",
    DRILL: "Y",
    END_CAPS: "N",
    EXTRA_TRUSS: "N",
    SHAFT_TYPE: "T",
    WINDOW_CUTOUTS: "N",
    JAMB_SEAL_COLOR: "W",
    TOP_SEAL: "N",
    BOTTOM_SEAL: "N",
    SNAP_LATCH_OPTION: "",
    DEC_HARDWARE: "",
    FULL_SETS: "NONE",
    FULL_SETS_QTY: "0",
    L_HANDLE: "NONE",
    L_HANDLE_QTY: "0",
    HANDLE: "NONE",
    HANDLE_QTY: "0",
    DOOR_KNOCKER: "NONE",
    DOOR_KNOCKER_QTY: "0",
    STRAPS: "NONE",
    STRAPS_QTY: "0",
    DOOR_STUDS: "N",
    DOOR_STUDS_QTY: "0",
    GRIPPER_SCREWS: "N",
    MAGNETIC_SET: "NONE",
    MAGNETIC_SET_QTY: "0"
};

export const DEFAULT_ANNOTATIONS = {
    TAG: "",
    CONTRACTOR: "",
    ARCHITECT: "",
    REFERENCE: "",
    CLIENT: ""
};

const ADVANCED_INPUT_IDS = [
    "DRILL",
    "END_CAPS",
    "EXTRA_TRUSS",
    "SHAFT_TYPE",
    "WINDOW_CUTOUTS",
    "JAMB_SEAL_COLOR",
    "TOP_SEAL",
    "BOTTOM_SEAL",
    "SNAP_LATCH_OPTION",
    "DEC_HARDWARE",
    "FULL_SETS",
    "FULL_SETS_QTY",
    "L_HANDLE",
    "L_HANDLE_QTY",
    "HANDLE",
    "HANDLE_QTY",
    "DOOR_KNOCKER",
    "DOOR_KNOCKER_QTY",
    "STRAPS",
    "STRAPS_QTY",
    "DOOR_STUDS",
    "DOOR_STUDS_QTY",
    "GRIPPER_SCREWS",
    "MAGNETIC_SET",
    "MAGNETIC_SET_QTY"
];

const ANNOTATION_INPUT_IDS = [
    "TAG",
    "CONTRACTOR",
    "ARCHITECT",
    "REFERENCE",
    "CLIENT"
];

const YES_NO_LABELS = {
    Y: { text: "YES", desc: "" },
    N: { text: "NO", desc: "" }
};

const SHAFT_TYPE_LABELS = {
    T: { text: "Tube Shaft", desc: "" },
    K: { text: "Keyed Tube Shaft", desc: "" }
};

const SNAP_LATCH_LABELS = {
    SnapLatch: { text: "Snap Latch", desc: "" },
    OnePointLatch: { text: "One Point Latch", desc: "" }
};

const DECORATIVE_HARDWARE_LABELS = {
    FS: { text: "Full Sets", desc: "" },
    IC: { text: "Individual Components", desc: "" },
    MS: { text: "Magnetic Sets", desc: "" }
};

/* ---------- Special window / panel counts (old NUM_OF_WINDOWS) ---------- */

const WINDOW_COUNT_RANGES = [
    { min: 72, max: 94, defaultQty: "3", specialQty: "2" },
    { min: 119, max: 142, defaultQty: "5", specialQty: "4" },
    { min: 166, max: 189, defaultQty: "7", specialQty: "6" },
    { min: 228, max: 235, defaultQty: "9", specialQty: "8" }
];

const getWindowCounts = (width) =>
    WINDOW_COUNT_RANGES.find(r => width >= r.min && width <= r.max) || null;

/* ==========================================================
   INPUT_JSON (read / write)
========================================================== */

// Old getInputJsonValue() / loadInputValues() chunk join
export function readSavedInputs() {

    const json = INPUT_JSON_READ_FIELDS
        .map(getEwValue)
        .join("");

    if (!json) {
        return null;
    }

    try {
        const arr = JSON.parse(json);
        return Array.isArray(arr) ? arr : null;
    } catch (err) {
        console.error("INPUT_JSON could not be parsed:", err, json);
        return null;
    }
}

export function hasSavedInputs() {
    return !!readSavedInputs();
}

// Old saveInputValues() chunk write
export function saveInputsToEw(arr) {

    const json = JSON.stringify(arr);

    if (json.length > CHUNK_SIZE * INPUT_JSON_WRITE_FIELDS.length) {
        console.error(
            `INPUT_JSON is ${json.length} characters – only ${CHUNK_SIZE * INPUT_JSON_WRITE_FIELDS.length} fit in INPUT_JSON_1..4.`
        );
    }

    // Clear all chunks first
    INPUT_JSON_WRITE_FIELDS.forEach(field => setEwValue(field, ""));

    INPUT_JSON_WRITE_FIELDS.forEach((field, index) => {

        const chunk = json.substring(index * CHUNK_SIZE, (index + 1) * CHUNK_SIZE);

        if (chunk) {
            setEwValue(field, chunk);
        }
    });

    console.log("json on save", json);

    return true;
}

/* ==========================================================
   OUTPUT_JSON (other EW inputs – old save/loadOutputValues)
   Chunk ids: OUTPUT_JSON, OUTPUT_JSON_1, OUTPUT_JSON_1_1, ...
========================================================== */

const isJsonField = (id) => /^(INPUT|OUTPUT)_JSON/.test(id || "");

export function saveOutputValues() {

    const root = document.getElementById("displayMainInputGroups");

    if (!root) {
        return;
    }

    const values = {};

    root
        .querySelectorAll("select:not(.disabled), input[type='text']:not(.disabled)")
        .forEach(element => {

            // Skip the React configurator itself + the JSON fields
            if (element.closest("#react-root, #configurator")) return;
            if (!element.id || isJsonField(element.id)) return;

            values[element.id] = element.value;
        });

    const json = JSON.stringify(values);

    let suffix = "";

    for (let i = 0; i < json.length / CHUNK_SIZE; i++) {
        setEwValue(`OUTPUT_JSON${suffix}`, json.substring(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE));
        suffix += "_1";
    }

    // Clear chunks left over from a longer previous save
    while (getEwElement(`OUTPUT_JSON${suffix}`)) {
        setEwValue(`OUTPUT_JSON${suffix}`, "");
        suffix += "_1";
    }
}

export function loadOutputValues() {

    let json = getEwValue("OUTPUT_JSON");

    if (!json) {
        return;
    }

    let suffix = "_1";

    while (getEwValue(`OUTPUT_JSON${suffix}`)) {
        json += getEwValue(`OUTPUT_JSON${suffix}`);
        suffix += "_1";
    }

    try {
        const values = JSON.parse(json);
        Object.keys(values).forEach(key => setEwValue(key, values[key]));
    } catch (err) {
        console.error("OUTPUT_JSON could not be parsed:", err);
    }
}

/* ==========================================================
   REACT STATE -> SAVED JSON (old saveInputValues)
========================================================== */

const entry = (id, value, text = "", desc = "") => ({
    id,
    value: value === "" || value === undefined ? null : value,
    desc,
    text
});

const radio = (id, value, labels = {}) =>
    entry(id, value, labels[value]?.text || "", labels[value]?.desc || "");

const select = (id, value, text) =>
    entry(id, value, text ?? String(value ?? ""), text ?? String(value ?? ""));

const checkbox = (id, checked, label) => ({
    id,
    value: !!checked,
    desc: "",
    text: label
});

const color = (id, value) => {
    const info = ALL_COLORS.find(c => c.value === value);
    return entry(id, value, info?.colorName || value || "", info?.desc || "");
};

/* Operator entries (same ids as the old inputs) */
function buildOperatorEntries(operator) {

    const values = getOperatorEwValues(operator);

    return Object.entries(values).map(([id, value]) => {

        if (id === "OPERATOR") {
            return radio(id, value, OPERATOR_LABELS);
        }

        if (id === "OPERATOR_BRACKET") {
            return radio(id, value, BRACKET_LABELS);
        }

        if (id.endsWith("_QTY")) {
            return select(id, String(value ?? "0"));
        }

        // ADDITIONAL_TRANSMITTER / _CONTROL_PANEL / _KEYLESS_ENTRY
        return select(id, value, ACCESSORY_LABELS[id]?.[value]?.text);
    });
}

/* Advanced entries, using the original HTML/EW input ids */
function buildAdvancedEntries(advancedOptions = {}) {

    const advanced = {
        ...DEFAULT_ADVANCED_OPTIONS,
        ...advancedOptions
    };

    return [
        radio("DRILL", advanced.DRILL, YES_NO_LABELS),
        radio("END_CAPS", advanced.END_CAPS, YES_NO_LABELS),
        radio("EXTRA_TRUSS", advanced.EXTRA_TRUSS, YES_NO_LABELS),
        radio("SHAFT_TYPE", advanced.SHAFT_TYPE, SHAFT_TYPE_LABELS),
        radio("WINDOW_CUTOUTS", advanced.WINDOW_CUTOUTS, YES_NO_LABELS),
        color("JAMB_SEAL_COLOR", advanced.JAMB_SEAL_COLOR),
        radio("TOP_SEAL", advanced.TOP_SEAL, YES_NO_LABELS),
        radio("BOTTOM_SEAL", advanced.BOTTOM_SEAL, YES_NO_LABELS),
        radio("SNAP_LATCH_OPTION", advanced.SNAP_LATCH_OPTION, SNAP_LATCH_LABELS),
        radio("DEC_HARDWARE", advanced.DEC_HARDWARE, DECORATIVE_HARDWARE_LABELS),

        select("FULL_SETS", advanced.FULL_SETS),
        select("FULL_SETS_QTY", String(advanced.FULL_SETS_QTY ?? "0")),

        select("L_HANDLE", advanced.L_HANDLE),
        select("L_HANDLE_QTY", String(advanced.L_HANDLE_QTY ?? "0")),

        select("HANDLE", advanced.HANDLE),
        select("HANDLE_QTY", String(advanced.HANDLE_QTY ?? "0")),

        select("DOOR_KNOCKER", advanced.DOOR_KNOCKER),
        select("DOOR_KNOCKER_QTY", String(advanced.DOOR_KNOCKER_QTY ?? "0")),

        select("STRAPS", advanced.STRAPS),
        select("STRAPS_QTY", String(advanced.STRAPS_QTY ?? "0")),

        radio("DOOR_STUDS", advanced.DOOR_STUDS, YES_NO_LABELS),
        select("DOOR_STUDS_QTY", String(advanced.DOOR_STUDS_QTY ?? "0")),

        radio("GRIPPER_SCREWS", advanced.GRIPPER_SCREWS, YES_NO_LABELS),

        select("MAGNETIC_SET", advanced.MAGNETIC_SET),
        select("MAGNETIC_SET_QTY", String(advanced.MAGNETIC_SET_QTY ?? "0"))
    ];
}

/* Annotation entries, using the original HTML/EW input ids */
function buildAnnotationEntries(annotations = {}) {

    const values = {
        ...DEFAULT_ANNOTATIONS,
        ...annotations
    };

    return ANNOTATION_INPUT_IDS.map(id =>
        entry(id, values[id] ?? "", values[id] ?? "", "")
    );
}

/* snapshot = values from Configurator.js state (getSaveSnapshot) */
export function buildSavedInputs(snapshot) {

    const s = snapshot;
    const hw = s.hardware || DEFAULT_HARDWARE;

    const advanced = {
        ...DEFAULT_ADVANCED_OPTIONS,
        ...(s.advancedOptions || {})
    };

    const annotations = {
        ...DEFAULT_ANNOTATIONS,
        ...(s.annotations || {})
    };

    const counts = getWindowCounts(Number(s.width) || 0);

    const windowsSelection =
        counts && String(s.numOfWindows) === counts.specialQty
            ? "SPECIAL"
            : "DEFAULT";

    const windowsText = counts
        ? (windowsSelection === "SPECIAL"
            ? `Special (${counts.specialQty})`
            : `Default (${counts.defaultQty})`)
        : (windowsSelection === "SPECIAL" ? "Special" : "Default");

    const panelsText = (() => {
        const panelCounts = getWindowCounts(Number(s.width) || 0);
        if (!panelCounts || !s.numOfPanels) return "";
        return String(s.numOfPanels) === panelCounts.specialQty
            ? `Special (${panelCounts.specialQty})`
            : `Default (${panelCounts.defaultQty})`;
    })();

    const glassType = GLASS_TYPES[s.glassType];

    const weight = s.weight ?? getEwValue("WEIGHT");

    return [

        /* ----- Door model ----- */
        radio("DOOR_MODEL", s.doorModel, DOOR_MODELS),

        // Old: SIZE radios are cleared while Custom Dimension is on
        radio("SIZE", s.customDimension ? null : s.doorSize, SIZES),
        checkbox("customSwitch", s.customDimension, "Custom Dimension"),

        select("DOOR_WIDTH_FEET", s.doorWidthFeet),
        select("DOOR_WIDTH_INCHES", s.doorWidthInches),
        select("DOOR_HEIGHT_FEET", s.doorHeightFeet),
        select("DOOR_HEIGHT_INCHES", s.doorHeightInches),
        select("NUM_OF_SEC", s.numOfSections),
        select("NUM_OF_PANELS", s.numOfPanels, panelsText),

        radio("FACE", s.panelStyle, FACES),
        checkbox("customPanelSwitch", s.morePanelStyle, "More Panel Style"),
        select("DESIGN_CODE", s.designCode),

        color("COLOR", s.selectedColor),
        radio("FINISH", s.finish, FINISHES),

        /* ----- Glazing ----- */
        radio("GLASS_SHAPE", s.glassShape, GLASS_SHAPES),

        // Old saveInputValues pushed GLAZING_TYPE right before GLASS_TYPE
        ...(glassType
            ? [entry("GLAZING_TYPE", glassType.glazingType, glassType.glazingType, glassType.glazingType)]
            : []),

        radio("GLASS_TYPE", s.glassType, GLASS_TYPES),
        entry("GLASS_INSERT", s.glassInsert, GLASS_INSERTS[s.glassInsert] || ""),

        color("FRAME_COLOR", s.frameColor),
        color("INSERT_COLOR", s.insertColor),

        radio("GLASS_TEMPERED", s.temperedGlass, GLASS_TEMPERED),
        radio("WINDOW_POSITION", s.windowPosition, WINDOW_POSITIONS),
        entry("NUM_OF_WINDOWS", windowsSelection, windowsText),

        /* ----- Hardware ----- */
        radio("HARDWARE_SET", hw.hardwareSet, HARDWARE_LABELS.HARDWARE_SET),
        radio("SPRING_TYPE", hw.springType, HARDWARE_LABELS.SPRING_TYPE),
        radio("INCLINED_TRACK", hw.inclinedTrack, HARDWARE_LABELS.INCLINED_TRACK),
        radio("LIFT_TYPE", hw.liftType, HARDWARE_LABELS.LIFT_TYPE),
        entry("HIGHLIFT", String(hw.highlift ?? ""), ""),
        radio("SPRING_CYCLE", hw.springCycle, HARDWARE_LABELS.SPRING_CYCLE),
        select("JAMB_SEAL", hw.jambSeal, HARDWARE_LABELS.JAMB_SEAL[hw.jambSeal]?.text),
        select("HANGER_ANGLE", hw.hangerAngle, HARDWARE_LABELS.HANGER_ANGLE[hw.hangerAngle]?.text),
        entry("HANGER_ANGLE_QTY", String(hw.hangerAngleQty ?? 0), "Hanger Qty"),
        entry("JAMB_SEAL_SCREW_PACKAGES", String(hw.jambSealScrewPackages ?? 0), "Screw Packages"),

        /* ----- Operator (same ids as the old inputs) ----- */
        ...buildOperatorEntries(s.operator || DEFAULT_OPERATOR),

        /* ----- Advanced (same ids as the old HTML/EW inputs) ----- */
        ...buildAdvancedEntries(advanced),

        /* ----- Annotations (same ids as the old HTML/EW inputs) ----- */
        ...buildAnnotationEntries(annotations),

        /* ----- React only: exact window layout ----- */
        entry("CUSTOM_WINDOWS", JSON.stringify(s.customWindows || [])),
        entry("SLIM_SECTIONS", JSON.stringify(s.slimSections || [])),
        entry("LAST_WINDOW_POSITION", s.lastWindowPosition || ""),

        /* ----- Old extras (saveInputValues + additionalSaves) ----- */
        entry("WEIGHT", weight, weight, weight),
        {
            id: "PRODUCT_TYPE",
            value: PRODUCT_TYPES[s.productType]?.value || "",
            text: PRODUCT_TYPES[s.productType]?.text || "",
            desc: ""
        }
    ];
}

/* Build + write everything (old saveInputValues) */
export function saveConfiguratorInputs(snapshot) {
    saveOutputValues();
    return saveInputsToEw(buildSavedInputs(snapshot));
}

/* ==========================================================
   SAVED JSON -> REACT STATE (old loadInputValues)
   Returns only the keys found in the JSON.
========================================================== */

const isOn = (value) =>
    value === true || value === "true" || value === "on";

// Old saves stored colors / inserts as objects sometimes
const plain = (value) =>
    value && typeof value === "object" ? (value.value ?? "") : value;

export function parseSavedInputs(arr) {

    if (!Array.isArray(arr) || !arr.length) {
        return {};
    }

    // id -> value (a later empty duplicate does not wipe a real value;
    // the old additionalSaves() pushed HANGER_ANGLE_QTY twice)
    const map = {};

    arr.forEach(item => {

        if (!item || !item.id) return;

        const value = plain(item.value);
        const isEmpty = value === null || value === undefined || value === "";

        if (isEmpty && item.id in map) return;

        map[item.id] = isEmpty ? null : value;
    });

    const has = (id) => id in map;
    const str = (id) => (map[id] === null || map[id] === undefined ? "" : String(map[id]));

    const r = {};

    /* ----- Door model ----- */

    if (has("DOOR_MODEL") && str("DOOR_MODEL")) r.doorModel = str("DOOR_MODEL");
    if (has("customSwitch")) r.customDimension = isOn(map.customSwitch);
    if (has("SIZE") && str("SIZE")) r.doorSize = str("SIZE");

    const dimensionKeys = {
        DOOR_WIDTH_FEET: "doorWidthFeet",
        DOOR_WIDTH_INCHES: "doorWidthInches",
        DOOR_HEIGHT_FEET: "doorHeightFeet",
        DOOR_HEIGHT_INCHES: "doorHeightInches"
    };

    Object.entries(dimensionKeys).forEach(([id, key]) => {
        if (has(id) && str(id) !== "") {
            r[key] = str(id);
        }
    });

    if (has("NUM_OF_SEC") && str("NUM_OF_SEC")) r.numOfSections = str("NUM_OF_SEC");
    if (has("NUM_OF_PANELS")) r.numOfPanels = str("NUM_OF_PANELS");

    if (has("FACE") && str("FACE")) r.panelStyle = str("FACE");
    if (has("customPanelSwitch")) r.morePanelStyle = isOn(map.customPanelSwitch);
    if (has("DESIGN_CODE")) r.designCode = str("DESIGN_CODE");

    if (has("COLOR") && str("COLOR")) r.selectedColor = str("COLOR");
    if (has("FINISH") && str("FINISH")) r.finish = str("FINISH");

    /* ----- Width (needed for NUM_OF_WINDOWS SPECIAL) ----- */

    const width = r.customDimension
        ? (Number(r.doorWidthFeet) || 0) * 12 + (Number(r.doorWidthInches) || 0)
        : (SIZES[r.doorSize ?? "2"]?.width || 16) * 12;

    /* ----- Glazing ----- */

    if (has("GLASS_SHAPE")) r.glassShape = str("GLASS_SHAPE");
    if (has("GLASS_TYPE")) r.glassType = str("GLASS_TYPE");
    if (has("GLASS_INSERT")) r.glassInsert = str("GLASS_INSERT");

    if (has("FRAME_COLOR") && str("FRAME_COLOR")) r.frameColor = str("FRAME_COLOR");
    if (has("INSERT_COLOR") && str("INSERT_COLOR")) r.insertColor = str("INSERT_COLOR");

    if (has("GLASS_TEMPERED")) r.temperedGlass = str("GLASS_TEMPERED");

    if (has("WINDOW_POSITION") && str("WINDOW_POSITION")) {
        r.windowPosition = str("WINDOW_POSITION");
    }

    if (has("LAST_WINDOW_POSITION") && str("LAST_WINDOW_POSITION")) {
        r.lastWindowPosition = str("LAST_WINDOW_POSITION");
    } else if (r.windowPosition) {
        r.lastWindowPosition = r.windowPosition !== "custom"
            ? r.windowPosition
            : ((r.glassShape || "").includes("slim") ? "left" : "top");
    }

    const parseJsonArray = (id) => {
        if (!has(id) || !str(id)) return null;
        try {
            const value = JSON.parse(str(id));
            return Array.isArray(value) ? value : null;
        } catch (err) {
            return null;
        }
    };

    const customWindows = parseJsonArray("CUSTOM_WINDOWS");
    const slimSections = parseJsonArray("SLIM_SECTIONS");

    if (customWindows) r.customWindows = customWindows;
    if (slimSections) r.slimSections = slimSections;

    // Old radio values DEFAULT / SPECIAL -> React count ("" = default)
    if (has("NUM_OF_WINDOWS")) {

        const saved = str("NUM_OF_WINDOWS");
        const counts = getWindowCounts(width);

        if (saved === "SPECIAL") {
            r.numOfWindows = counts ? counts.specialQty : "";
        } else if (/^\d+$/.test(saved)) {
            r.numOfWindows = saved;
        } else {
            r.numOfWindows = "";
        }
    }

    /* ----- Hardware ----- */

    const hwFields = {
        HARDWARE_SET: "hardwareSet",
        SPRING_TYPE: "springType",
        INCLINED_TRACK: "inclinedTrack",
        LIFT_TYPE: "liftType",
        SPRING_CYCLE: "springCycle",
        JAMB_SEAL: "jambSeal",
        HANGER_ANGLE: "hangerAngle"
    };

    const hwNumbers = {
        HIGHLIFT: "highlift",
        HANGER_ANGLE_QTY: "hangerAngleQty",
        JAMB_SEAL_SCREW_PACKAGES: "jambSealScrewPackages"
    };

    const hwKeys = [...Object.keys(hwFields), ...Object.keys(hwNumbers)];

    if (hwKeys.some(has)) {

        const hardware = { ...DEFAULT_HARDWARE };

        Object.entries(hwFields).forEach(([id, key]) => {
            if (has(id)) hardware[key] = str(id);
        });

        Object.entries(hwNumbers).forEach(([id, key]) => {
            if (has(id) && str(id) !== "") hardware[key] = Number(str(id)) || 0;
        });

        // Old radio-group spelling of the spring types
        if (hardware.springType === "TORSION") hardware.springType = "TOR";
        if (hardware.springType === "EXTENSION") hardware.springType = "EXT";

        // Same rules as a user change (keeps the combination valid)
        r.hardware = applyHardwareRules(hardware, hardware);
    }

    /* ----- Operator ----- */

    const operatorIds = Object.keys(getOperatorEwValues(DEFAULT_OPERATOR));

    if (operatorIds.some(has)) {

        const restoredOperator = { ...DEFAULT_OPERATOR };

        if (has("OPERATOR") && str("OPERATOR")) {
            const value = str("OPERATOR");
            // Unknown operator value -> keep the default (None)
            if (OPERATOR_OPTIONS.some(option => option.value === value)) {
                restoredOperator.operator = value;
            }
        }

        if (has("OPERATOR_BRACKET")) {
            restoredOperator.bracket = str("OPERATOR_BRACKET");
        }

        OPERATOR_ACCESSORIES.forEach(item => {

            const qtyId = `${item.id}_QTY`;

            if (has(item.id) && str(item.id)) {
                restoredOperator[item.id] = str(item.id);
            }

            if (restoredOperator[item.id] === "NONE") {
                restoredOperator[qtyId] = "0";
            } else if (has(qtyId) && str(qtyId) && str(qtyId) !== "0") {
                restoredOperator[qtyId] = str(qtyId);
            } else {
                restoredOperator[qtyId] = "1";
            }
        });

        r.operator = restoredOperator;
    }

    /* ----- Advanced ----- */

    if (ADVANCED_INPUT_IDS.some(has)) {

        const restoredAdvanced = { ...DEFAULT_ADVANCED_OPTIONS };

        ADVANCED_INPUT_IDS.forEach(id => {
            if (has(id)) {
                restoredAdvanced[id] = str(id);
            }
        });

        // A missing or NONE accessory cannot keep a hidden quantity
        const accessoryQuantityPairs = [
            ["FULL_SETS", "FULL_SETS_QTY"],
            ["L_HANDLE", "L_HANDLE_QTY"],
            ["HANDLE", "HANDLE_QTY"],
            ["DOOR_KNOCKER", "DOOR_KNOCKER_QTY"],
            ["STRAPS", "STRAPS_QTY"],
            ["MAGNETIC_SET", "MAGNETIC_SET_QTY"]
        ];

        accessoryQuantityPairs.forEach(([valueId, qtyId]) => {

            if (!restoredAdvanced[valueId] || restoredAdvanced[valueId] === "NONE") {
                restoredAdvanced[valueId] = "NONE";
                restoredAdvanced[qtyId] = "0";
            } else if (!restoredAdvanced[qtyId] || restoredAdvanced[qtyId] === "0") {
                // Straps have no qty 1 – first valid is 2
                restoredAdvanced[qtyId] = valueId === "STRAPS" ? "2" : "1";
            }
        });

        if (restoredAdvanced.DOOR_STUDS !== "Y") {
            restoredAdvanced.DOOR_STUDS = "N";
            restoredAdvanced.DOOR_STUDS_QTY = "0";
        }

        if (!restoredAdvanced.DOOR_STUDS_QTY) {
            restoredAdvanced.DOOR_STUDS_QTY = "0";
        }

        // UI-only: a saved jamb colour must not be overwritten by the door colour
        restoredAdvanced.jambSealColorUserOverride =
            has("JAMB_SEAL_COLOR") && !!str("JAMB_SEAL_COLOR");

        r.advancedOptions = restoredAdvanced;
    }

    /* ----- Annotations ----- */

    if (ANNOTATION_INPUT_IDS.some(has)) {

        const restoredAnnotations = { ...DEFAULT_ANNOTATIONS };

        ANNOTATION_INPUT_IDS.forEach(id => {
            if (has(id)) {
                restoredAnnotations[id] = str(id);
            }
        });

        r.annotations = restoredAnnotations;
    }

    /* ----- Product type ----- */

    if (has("PRODUCT_TYPE") && str("PRODUCT_TYPE")) {

        const saved = str("PRODUCT_TYPE");

        const match = Object.entries(PRODUCT_TYPES)
            .find(([, item]) => item.value === saved);

        if (match) {
            r.productType = match[0];
        }
    }

    return r;
}

/* Read + parse (old loadInputValues). {} when nothing saved. */
export function loadConfiguratorInputs() {

    const arr = readSavedInputs();

    if (!arr) {
        return {};
    }

    const restored = parseSavedInputs(arr);

    console.log("Restoring saved configuration:", restored);

    return restored;
}
