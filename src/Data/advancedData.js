/* ==========================================================
   ADVANCED + ANNOTATIONS DATA
   Defaults = the "checked" inputs in LOAD_HTML.js
   (#ADVANCED and #ANNOTATIONS sections).
========================================================== */

export const DEFAULT_ADVANCED = {
    DOOROPT: "COMPLETEDOOR",
    DRILL: "Y",
    END_CAPS: "N",
    EXTRA_TRUSS: "N",
    SHAFT_TYPE: "T",
    WINDOW_CUTOUTS: "N",

    // Follows the door colour until the user picks one
    JAMB_SEAL_COLOR: "W",
    jambSealColorUserOverride: false,

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

/* EW inputs – same ids as the old HTML (React-only flags removed) */
export function getAdvancedEwValues(advanced = DEFAULT_ADVANCED) {

    const { jambSealColorUserOverride, ...values } = {
        ...DEFAULT_ADVANCED,
        ...advanced
    };

    return values;
}

export function getAnnotationEwValues(annotations = DEFAULT_ANNOTATIONS) {
    return { ...DEFAULT_ANNOTATIONS, ...annotations };
}

/* Old hardware carton / truss: Extra Truss YES -> 1 */
export const getTrussQty = (advanced) =>
    advanced?.EXTRA_TRUSS === "Y" ? 1 : 0;
