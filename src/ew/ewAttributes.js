/* ==========================================================
   EW ATTRIBUTES
   The original code read these from the jQuery form
   (getNode("DOOR_MODEL").getAttribute("id") etc.).
   That form no longer exists, so the values live here.
   Source: LOAD_HTML.js createForm()
========================================================== */

/* DOOR_MODEL radio: id + desc */
export const DOOR_MODEL_ATTRS = {
    A: { id: "L138", desc: "Cls" },
    D: { id: "L200", desc: "Prem" },
    G: { id: "L200GV", desc: "Grd" }
};

/* FACE radio: desc */
export const FACE_DESC = {
    R: "Rnc",
    F: "Fls",
    C: "Col",
    S: "RncGc",
    B: "ColGc",
    T: "RncSc",
    V: "Plk",
    M: "mixed"
};

/* DESIGN_CODE option: pattern */
export const DESIGN_PATTERNS = {
    A: "CRC",
    B: "RCR",
    C: "CRRC",
    D: "RCCR",
    E: "CCRCC",
    F: "CRRRC",
    G: "CRCCRC",
    H: "RCRCR",
    I: "CCRRCC",
    J: "CRCRC",
    K: "RCCCR",
    L: "CRCCCRC",
    M: "CCRCRCC",
    N: "CCCRCCC",
    O: "RCCCCR",
    P: "RCCRCCR",
    Q: "RCCCCCR",
    R: "CCCRCRCCC",
    S: "CCRCCRCC",
    T: "RCCCCCCCCR",
    U: "CCRCCCCRCC"
};

/* GLASS_TYPE radio: glazingtype */
export const GLASS_TYPE_GLAZING = {
    CLEAR: "double",
    CLEAR_SINGLE: "single",
    SATIN: "double",
    OBSCURE_GLASS_PINHEAD: "double",
    OBSCURE_GLASS_SINGLE: "single",
    DARK_TINT_SEALED: "double",
    DARK_TINT_SINGLE: "single",
    BLACK_SATIN_SEALED: "double"
};

/* GLASS_INSERT radio: insertCode (aluminum / bar inserts have none) */
export const INSERT_CODES = {
    stockton_colonial: "550-309",
    waterton_colonial: "550-337",
    stockton_ranch: "550-313",
    waterton_ranch: "550-347",
    prairie: "550-451",
    cascade_colonial: "550-317",
    cascade_ranch: "550-321",
    arched_stockton: "550-341",
    stockbridge: "550-456",
    arched_stockbridge: "550-396",
    arched_stockton_3: "550-341",
    arched_stockbridge_3: "550-396",
    arched_stockton_4: "550-341",
    arched_stockbridge_4: "550-396"
};
