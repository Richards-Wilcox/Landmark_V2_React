/* ==========================================================
   HARDWARE DATA + RULES
   Port of the Hardware logic from:
   - LOAD_HTML.js            (inputs / options)
   - LOAD_DRIVEN_INPUTS.js   (SPRING_TYPE_VISIBILITY, SPRING_CYCLE_VISIBILITY,
                              INCLINED_TRACK_VISIBILITY, LIFT_TYPE,
                              LIFT_TYPE_VISIBILITY, HIGHLIFT_LAYOUT,
                              HIGHLIFT_VALUE, HEADROOM_VALUE)
   - LOAD_GLOBAL_VARIABLES.js (HARDWARE_YESNO)
   All functions are pure – no DOM, no EW.
========================================================== */

/* ---------- Options ---------- */

export const HARDWARE_SETS = [
    { value: "A", label: "Standard" },
    { value: "Y", label: "Standard Plus" },
    { value: "C", label: "Commercial" }
];

export const SPRING_TYPES = [
    { value: "TOR", label: "Torsion" },
    { value: "EXT", label: "Extension" }
];

export const SPRING_CYCLES = [
    { value: "10K", label: "10K" },
    { value: "20K", label: "20K" }
];

export const INCLINED_TRACK_OPTIONS = [
    { value: "Y", label: "YES" },
    { value: "N", label: "NO" }
];

// Same order / values / attributes as the old LIFT_TYPE radios
export const LIFT_TYPES = [
    { value: "STD12", label: 'Standard 12"R', radius: 12, numval: "1.0" },
    { value: "STD15", label: 'Standard 15"R', radius: 15, numval: "1.0" },
    { value: "32R", label: 'Standard 32"R', radius: 32, numval: "1.0" },
    { value: "LHF", label: "Low Headroom Front", radius: 7, numval: "1.0" },
    { value: "LHROUT", label: "Low Headroom Rear", radius: 7, numval: "1.0" },
    { value: "LHREXT", label: "Low Headroom Ext.", radius: 7, numval: "1.0" },
    { value: "HL", label: "High Lift", radius: 0, numval: "2.0" },
    { value: "VL", label: "Vertical Lift", radius: 0, numval: "2.0" },
    { value: "LHR_VL", label: "Vertical Lift Low Headroom", radius: 0, numval: "2.0" }
];

export const JAMB_SEALS = [
    { value: "NONE", label: "None" },
    { value: "DUALA", label: "Aluminium - Dual Fin" },
    { value: "SINGLE", label: "PVC - Single Fin" },
    { value: "DUAL", label: "PVC - Dual Fin" },
    { value: "DUALS", label: "Steel - Dual Fin" }
];

export const HANGER_ANGLES = [
    { value: "None", label: "None" },
    { value: "950-254", label: '10\' - 16 ga. 1.25" X SP1.25" Hole/Hole' },
    { value: "950-253", label: '10\' - 14 ga. 1.25" X 1.25" Hole/Hole' },
    { value: "950-252", label: '10\' - 12 ga. 1.25" X 1.25" Hole/Hole' },
    { value: "950-255", label: '10\' - 11 ga. 1.5" X 1.5" Hole/Slot' },
    { value: "950-256", label: '10\' - 12 ga. 2" X 2" Hole/Hole' }
];

export const HANGER_ANGLE_QTY_MAX = 10;
export const SCREW_PACKAGES_MAX = 50;
export const SCREWS_PER_PACKAGE = 50;

export const JAMB_SEAL_CHART_URL =
    "https://easywebdev.rwdoors.com/HTML/products/210005530/help/JambSealChart.pdf";

/* ---------- High lift ---------- */

export const HIGHLIFT_MIN = 15;
export const DEFAULT_HIGHLIFT = 17;
export const HEADROOM_OFFSET = 9;

// Original HIGHLIFT_LAYOUT: Commercial 164, others 54
export const getHighliftMax = (hardwareSet) =>
    hardwareSet === "C" ? 164 : 54;

/* ---------- Lift type rules (original LIFT_TYPE logic) ---------- */

const LIFT_MAP_TORSION = {
    A: ["STD12", "STD15", "LHF", "LHROUT", "HL"],
    Y: ["STD12", "STD15", "32R", "LHF", "LHROUT", "HL"]
};

const LIFT_MAP_EXTENSION = {
    A: [],
    Y: ["STD12", "STD15", "LHREXT"]
};

const LIFT_COMMERCIAL_STANDARD = ["STD12", "STD15", "LHF", "LHROUT", "HL", "VL", "LHR_VL"];
const LIFT_COMMERCIAL_INCLINED = ["STD12", "STD15", "HL", "LHR_VL"];

export function getAllowedLiftTypes({ hardwareSet, springType, inclinedTrack }) {

    if (!hardwareSet) {
        return [];
    }

    if (hardwareSet === "C") {
        return inclinedTrack === "Y"
            ? LIFT_COMMERCIAL_INCLINED
            : LIFT_COMMERCIAL_STANDARD;
    }

    const map = springType === "EXT"
        ? LIFT_MAP_EXTENSION
        : LIFT_MAP_TORSION;

    return map[hardwareSet] || [];
}

// ic_code / hwdesc / trackCode (original icCodeMap)
const IC_CODE_MAP = {
    STD12_TOR: { icCode: "H", hwdesc: '12" Tor', trackCode: '12" Tor' },
    STD12_EXT: { icCode: "F", hwdesc: '12" Ext', trackCode: '12" Ext' },
    STD15_TOR: { icCode: "N", hwdesc: '15" Tor', trackCode: '15" Tor' },
    STD15_EXT: { icCode: "L", hwdesc: '15" Ext', trackCode: '15" Ext' },
    "32R_TOR": { icCode: "G", hwdesc: '32" Tor', trackCode: '32" Tor' },
    LHF_TOR: { icCode: "T", hwdesc: "LHF Tor", trackCode: "LHF Tor" },
    LHFOUT_TOR: { icCode: "S", hwdesc: "LHFOUT Tor", trackCode: "LHFOUT Tor" },
    LHR_TOR: { icCode: "W", hwdesc: "LHR Tor", trackCode: "LHR Tor" },
    LHROUT_TOR: { icCode: "X", hwdesc: "LHR OS Tor", trackCode: "LHR OS Tor" },
    LHREXT_EXT: { icCode: "R", hwdesc: "LH Ext", trackCode: "LH Ext" },
    HL_TOR: { icCode: "I", hwdesc: "I", trackCode: "I" }
};

// Everything the old LIFT_TYPE radio carried as attributes
export function getLiftConfig(liftType, springType) {

    const lift = LIFT_TYPES.find(item => item.value === liftType);
    const codes = IC_CODE_MAP[`${liftType}_${springType}`] || {};

    return {
        value: liftType || "",
        label: lift?.label || "",
        radius: lift?.radius ?? "",
        numval: lift?.numval || "",
        icCode: codes.icCode || "",
        hwdesc: codes.hwdesc || "",
        trackCode: codes.trackCode || ""
    };
}

/* ---------- Disabled options + reasons (old tooltips) ---------- */

export const getHardwareLabel = (hardwareSet) =>
    HARDWARE_SETS.find(item => item.value === hardwareSet)?.label || "";

export function getSpringTypeDisabled(hardwareSet) {
    // Standard / Commercial: Torsion only
    if (hardwareSet === "A" || hardwareSet === "C") {
        return {
            EXT: `Extension not available for ${getHardwareLabel(hardwareSet)} Hardware`
        };
    }
    return {};
}

export function getSpringCycleDisabled(hardwareSet) {
    // Standard Plus: 20K only
    if (hardwareSet === "Y") {
        return {
            "10K": `Spring Cycle 10K not available for ${getHardwareLabel(hardwareSet)} Hardware`
        };
    }
    return {};
}

/* ---------- Defaults (original checked inputs) ---------- */

export const DEFAULT_HARDWARE = {
    hardwareSet: "A",
    springType: "TOR",
    inclinedTrack: "N",
    liftType: "STD15",
    highlift: DEFAULT_HIGHLIFT,
    springCycle: "10K",
    jambSeal: "NONE",
    hangerAngle: "None",
    hangerAngleQty: 0,
    jambSealScrewPackages: 0
};

/* ---------- Apply all rules after any change ----------
   prev = state before the change, next = prev + patch      */

export function applyHardwareRules(prev, next) {

    const hw = { ...next };
    const hardwareChanged = prev.hardwareSet !== hw.hardwareSet;

    // No hardware set: clear dependent inputs (LIFT_TYPE_VISIBILITY / clearSwitch)
    if (!hw.hardwareSet) {
        return {
            ...hw,
            springType: "",
            springCycle: "",
            inclinedTrack: "N",
            liftType: ""
        };
    }

    // Spring type (SPRING_TYPE_VISIBILITY)
    if (hw.hardwareSet === "A" || hw.hardwareSet === "C") {
        hw.springType = "TOR";
    } else if (!hw.springType) {
        hw.springType = "TOR";
    }

    // Spring cycle (SPRING_CYCLE_VISIBILITY)
    if (hw.hardwareSet === "Y") {
        hw.springCycle = "20K";
    } else if (hardwareChanged || !hw.springCycle) {
        hw.springCycle = "10K";
    }

    // Inclined track only for Commercial (INCLINED_TRACK_VISIBILITY)
    if (hw.hardwareSet !== "C") {
        hw.inclinedTrack = "N";
    }

    // Lift type must be one of the visible options
    const allowed = getAllowedLiftTypes(hw);

    if (!allowed.includes(hw.liftType)) {
        hw.liftType = allowed.includes("STD15")
            ? "STD15"
            : (allowed[0] || "");
    }

    // High lift range (HIGHLIFT_LAYOUT)
    const max = getHighliftMax(hw.hardwareSet);
    const highlift = Number(hw.highlift) || DEFAULT_HIGHLIFT;

    if (highlift > max) {
        hw.highlift = hw.hardwareSet === "C" ? 54 : DEFAULT_HIGHLIFT;
    } else if (highlift < HIGHLIFT_MIN) {
        hw.highlift = HIGHLIFT_MIN;
    } else {
        hw.highlift = highlift;
    }

    // Quantities
    hw.hangerAngleQty = clampInt(hw.hangerAngleQty, 0, HANGER_ANGLE_QTY_MAX);
    hw.jambSealScrewPackages = clampInt(hw.jambSealScrewPackages, 0, SCREW_PACKAGES_MAX);

    return hw;
}

function clampInt(value, min, max) {
    const n = Math.floor(Number(value));
    if (!Number.isFinite(n)) {
        return min;
    }
    return Math.min(max, Math.max(min, n));
}

/* ---------- Values written to EW (same ids as the old nodes) ----------
   Remove any id that does not exist in your EW product –
   useEwSync logs the missing ones in the console. */

export function getHardwareEwValues(hw) {

    const lift = getLiftConfig(hw.liftType, hw.springType);
    const highlift = Number(hw.highlift) || DEFAULT_HIGHLIFT;

    return {
        HARDWARE_SET: hw.hardwareSet || "",
        HARDWARE_YESNO: hw.hardwareSet ? 1 : 0,

        SPRING_TYPE: hw.springType || "",
        SPRING_CYCLE: hw.springCycle || "",
        INCLINED_TRACK: hw.inclinedTrack || "N",

        LIFT_TYPE: hw.liftType || "",

        HIGHLIFT: highlift,
        HIGHLIFT_VALUE: highlift,
        HEADROOM_VALUE: highlift + HEADROOM_OFFSET,

        JAMB_SEAL: hw.jambSeal || "NONE",
        HANGER_ANGLE: hw.hangerAngle || "None",
        HANGER_ANGLE_QTY: Number(hw.hangerAngleQty) || 0,
        JAMB_SEAL_SCREW_PACKAGES: Number(hw.jambSealScrewPackages) || 0,

        // Used by track / hardware part logic (old radio attributes)
        LIFT_IC_CODE: lift.icCode,
        LIFT_HWDESC: lift.hwdesc,
        LIFT_TRACK_CODE: lift.trackCode
    };
}
